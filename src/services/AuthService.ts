import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository";
import { User } from "../models/User";
import { config } from "../config";
import { comparePassword, hashPassword } from "../utils/crypto-utils";
import { randomBytes } from "crypto";
import { sendResetPasswordEmail } from "../utils/nodeMailer";

interface AuthServiceResponse {
  accessToken?: string;
  refreshToken?: string;
  status?: number;
  message?: string;
}

export class AuthService {
  private userRepository: UserRepository;
  private expireTime: string = "2w";
  constructor() {
    this.userRepository = new UserRepository();
  }
  async login(
    email: string,
    password: string,
    deviceId: string,
    browser: string,
    deviceName: string
  ): Promise<AuthServiceResponse> {
    try {
      const user = await this.userRepository.getUserByEmail(email);

      if (!user || !user._id) {
        return { status: 401, message: "User not found" };
      }

      const isMatch = await comparePassword(
        password,
        user.salt,
        user.hashedPassword
      );

      if (!isMatch) {
        return { status: 401, message: "Invalid credentials" };
      }

      // Initialize the tokens
      let accessToken: string;
      let refreshToken: string;

      // Find the device by deviceId, or initialize a new device if not found
      let deviceIndex = user.devices.findIndex((d) => d.deviceId === deviceId);

      if (deviceIndex === -1) {
        // If the device is not found, create it and push to the user's devices
        const newDevice = {
          deviceId,
          refreshToken: "", // Will be updated below
          browser,
          deviceName,
          lastUsed: new Date(),
          tokenVersion: 0,
        };

        // Generate tokens for the new device
        accessToken = this.generateAccessToken(user, deviceId);
        refreshToken = this.generateRefreshToken(
          user,
          newDevice.tokenVersion,
          deviceId
        );

        // Update the device with the generated tokens
        newDevice.refreshToken = refreshToken;

        // Push the new device to the user's devices array
        user.devices.push(newDevice);
      } else {
        // If the device is found, update it
        const existingDevice = user.devices[deviceIndex];

        // Generate new tokens
        accessToken = this.generateAccessToken(user, deviceId);
        refreshToken = this.generateRefreshToken(
          user,
          existingDevice.tokenVersion,
          deviceId
        );

        // Update the existing device with the new tokens and timestamp
        existingDevice.refreshToken = refreshToken;
        existingDevice.lastUsed = new Date();

        // Update the device in the user's devices array
        user.devices[deviceIndex] = existingDevice;
      }

      // Save the user with updated devices
      await this.userRepository.updateUser(user._id.toString(), {
        devices: user.devices,
      });

      return { accessToken, refreshToken, status: 200 };
    } catch (error: any) {
      console.error("Login error:", error);
      return { status: 500, message: "Database error" };
    }
  }
  async refreshToken(
    token: string,
    deviceId: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    console.log("Refreshing Token");
    try {
      const decoded = jwt.verify(token, config.jwtRefreshSecret) as {
        id: string;
        tokenVersion: number;
        deviceId: string;
      };

      const user = await this.userRepository.getUserById(decoded.id);

      if (!user || !user._id) {
        throw new Error("User not found");
      }

      // Find the device by deviceId and ensure it matches the provided refreshToken
      const deviceIndex = user.devices.findIndex(
        (device) =>
          device.deviceId === deviceId && device.refreshToken === token
      );

      if (deviceIndex === -1) {
        throw new Error("Invalid refresh token or device ID");
      }

      const device = user.devices[deviceIndex];

      // Check token version
      if (decoded.tokenVersion !== device.tokenVersion) {
        throw new Error("Invalid token version");
      }

      // Rotate the refresh token and increment tokenVersion
      const newTokenVersion = device.tokenVersion + 1;
      const accessToken = this.generateAccessToken(user, deviceId);
      const newRefreshToken = this.generateRefreshToken(
        user,
        newTokenVersion,
        deviceId
      );

      // Update the device information with the new token and token version
      device.refreshToken = newRefreshToken;
      device.lastUsed = new Date();
      device.tokenVersion = newTokenVersion;

      // Explicitly update the device in the user's devices array
      user.devices[deviceIndex] = device;

      await this.userRepository.updateUser(user._id.toString(), {
        devices: user.devices,
      });

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      // console.error("Refresh token error:", error);
      throw new Error("Invalid refresh token");
    }
  }

  async logout(userId: string, deviceId: string): Promise<void> {
    const user = await this.userRepository.getUserById(userId);

    if (!user || !user._id) {
      throw new Error("User not found");
    }

    // Remove the device from the list
    user.devices = user.devices.filter(
      (device) => device.deviceId !== deviceId
    );

    await this.userRepository.updateUser(userId, {
      devices: user.devices,
    });
  }

  private generateAccessToken(user: User, deviceId: string): string {
    return jwt.sign(
      { id: user._id, role: user.roleId, deviceId },
      config.jwtSecret,
      {
        expiresIn: this.expireTime,
      }
    );
  }

  private generateRefreshToken(
    user: User,
    tokenVersion: number,
    deviceId: string
  ): string {
    return jwt.sign(
      { id: user._id, tokenVersion, deviceId },
      config.jwtRefreshSecret,
      { expiresIn: this.expireTime }
    );
  }

  async getProfile(userId: string): Promise<User | null> {
    return this.userRepository.getUserById(userId);
  }

  async updateProfile(
    userId: string,
    profileData: Partial<User>
  ): Promise<User | null> {
    return this.userRepository.updateProfile(userId, profileData);
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message?: string; error?: string }> {
    const user = await this.userRepository.getUserById(userId);

    if (!user || !user._id) {
      return { error: "User not found" };
    }

    const isMatch = await comparePassword(
      currentPassword,
      user.salt,
      user.hashedPassword
    );

    if (!isMatch) {
      return { error: "Current password is incorrect" };
    }

    const { salt, hash: hashedPassword } = await hashPassword(newPassword);

    await this.userRepository.updateUserPassword(
      user._id.toString(),
      hashedPassword,
      salt
    );

    return { message: "Password updated successfully" };
  }
  async forgotPassword(
    email: string
  ): Promise<{ message?: string; error?: string }> {
    try {
      const user = await this.userRepository.getUserByEmail(email);
      if (!user) {
        return { error: "User not found" };
      }

      const token = randomBytes(20).toString("hex");
      user.resetPasswordToken = token;
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

      await this.userRepository.updateUser(user._id!.toString(), user);

      const resetUrl = `http://${config.baseUrl}/reset-password/${token}`;
      await sendResetPasswordEmail(user.email, resetUrl);

      return { message: "Password reset link sent to your email" };
    } catch (error) {
      console.error("Forgot password error:", error);
      return { error: "Failed to process password reset request" };
    }
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message?: string; error?: string }> {
    try {
      const user = await this.userRepository.findUserByResetToken(token);
      if (!user) {
        return { error: "Password reset token is invalid or has expired" };
      }

      const { salt, hash: hashedPassword } = await hashPassword(newPassword);

      user.hashedPassword = hashedPassword;
      user.salt = salt;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await this.userRepository.updateUser(user._id!.toString(), user);

      return { message: "Password has been reset successfully" };
    } catch (error) {
      console.error("Reset password error:", error);
      return { error: "Failed to reset password" };
    }
  }
}
