// Backend/src/routes/auth.routes.ts
import { Router } from "express";
import {
  validateLogin,
  validateRegister,
  validateSetPassword,
} from "../middleware/auth-validation.middleware";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import passport from "passport";
import { env } from "../config/env";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sleiman
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sleiman@test.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation failed or user already exists
 */
router.post("/register", validateRegister, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user and get JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sleiman@test.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", validateLogin, authController.login);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account",
  }),
);

router.get("/google/callback", (req, res, next) => {
  passport.authenticate(
    "google",
    { session: false },
    (
      err: unknown,
      result?: { token: string; shouldPromptSetPassword?: boolean },
    ) => {
      if (err || !result?.token) {
        const message =
          (err as { message?: string } | undefined)?.message ||
          "Google authentication failed";
        res.redirect(
          `${env.CLIENT_URL}/auth?error=${encodeURIComponent(message)}`,
        );
        return;
      }

      res.redirect(
        `${env.CLIENT_URL}/auth?token=${encodeURIComponent(result.token)}&provider=google&needsPasswordSetup=${result.shouldPromptSetPassword ? "1" : "0"}`,
      );
    },
  )(req, res, next);
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get current authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authMiddleware, authController.me);
router.post(
  "/set-password",
  authMiddleware,
  validateSetPassword,
  authController.setPassword,
);
router.post(
  "/password-prompt/skip",
  authMiddleware,
  authController.skipPasswordPrompt,
);

export default router;
