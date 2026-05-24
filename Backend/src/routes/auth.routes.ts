import { Router } from "express";
import {
  validateLogin,
  validateRegister,
} from "../middleware/auth-validation.middleware";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.get("/me", authMiddleware, authController.me);

export default router;
