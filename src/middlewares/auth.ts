import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { Socket } from "socket.io";
import { AuthService } from "../services/AuthService";
import { PermissionsList } from "../types/permissions";
import { User } from "../models/User";
import { config } from "../config";

const authService = new AuthService();

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];
  const isRetry = req.header("X-Retry") === "true"; // Custom header to identify retries

  if (!token) {
    console.error("Authorization Null :" + req.header("Authorization"));
    return res.status(401).json({ message: "Access token is missing" });
  }

  jwt.verify(
    token,
    config.jwtSecret,
    (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
      if (err) {
        if (isRetry) {
          console.error("Someone accessed with invalid token during a retry");
        }
        return res.status(401).json({ message: "Invalid token" });
      }

      req.user = decoded as User;
      next();
    }
  );
};

export const authorize = (permission: PermissionsList) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getProfile(req.user.id);
      if (!user || !user.role || !user.role.permissions[permission]) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };
};

export const authenticateSocket = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const token = socket.handshake.auth.token;

  if (token) {
    jwt.verify(
      token,
      config.jwtSecret,
      (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if (err) {
          return next(new Error("Authentication error"));
        }
        socket.data.user = decoded as User;
        next();
      }
    );
  } else {
    next(new Error("Authentication error"));
  }
};
