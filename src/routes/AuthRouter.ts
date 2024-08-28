import express from "express";
import { AuthService } from "../services/AuthService";
import { authenticateJWT } from "../middlewares/auth";
import csrf from "csurf";
import { handleError } from "../error";

const router = express.Router();
const authService = new AuthService();
const csrfProtection = csrf({ cookie: true });

router.post("/login", async (req, res) => {
  const { email, password, deviceId, browser, deviceName } = req.body;

  if (!email || !password || !deviceId || !browser || !deviceName) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await authService.login(
      email,
      password,
      deviceId,
      browser,
      deviceName
    );
    if (result.status && result.message) {
      return res.status(result.status).json({ error: result.message });
    }

    const { accessToken, refreshToken } = result;

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: false });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false });

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

router.post("/refreshToken", async (req, res) => {
  const { refreshToken, deviceId } = req.body;
  if (!refreshToken || !deviceId) {
    return res
      .status(400)
      .json({ error: "Refresh token and device ID are required" });
  }

  try {
    const tokens = await authService.refreshToken(refreshToken, deviceId);
    res.status(200).json(tokens);
  } catch (error: any) {
    console.error("Token refresh error:", error);
    res.status(401).json({ error: error.message });
  }
});

// Logout endpoint
router.post("/logout", authenticateJWT, async (req, res) => {
  const { deviceId } = req.body;
  try {
    await authService.logout(req.user.id, deviceId);
    res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    handleError(res, error);
  }
});

router.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Fetch user error:", error);
    handleError(res, error);
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const response = await authService.forgotPassword(email);
    if (response.error) {
      return res.status(400).json({ error: response.error });
    }
    res.status(200).json({ message: response.message });
  } catch (error: any) {
    handleError(res, error);
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const response = await authService.resetPassword(token, newPassword);
    if (response.error) {
      return res.status(400).json({ error: response.error });
    }
    res.status(200).json({ message: response.message });
  } catch (error: any) {
    handleError(res, error);
  }
});

export default router;
