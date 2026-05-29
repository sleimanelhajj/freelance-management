// Backend/src/middleware/auth-validation.middleware.ts
import { Request, Response, NextFunction } from "express";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { name, email, password } = req.body;

  if (!name || !String(name).trim()) {
    res.status(400).json({ success: false, message: "Name is required" });
    return;
  }

  if (!email || !isValidEmail(String(email))) {
    res
      .status(400)
      .json({ success: false, message: "Valid email is required" });
    return;
  }

  if (!password || String(password).length < 6) {
    res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
    return;
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { email, password } = req.body;

  if (!email || !isValidEmail(String(email))) {
    res
      .status(400)
      .json({ success: false, message: "Valid email is required" });
    return;
  }

  if (!password || !String(password).trim()) {
    res.status(400).json({ success: false, message: "Password is required" });
    return;
  }

  next();
};

export const validateSetPassword = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { password } = req.body;

  if (!password || String(password).length < 6) {
    res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
    return;
  }

  next();
};
