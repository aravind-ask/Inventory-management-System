import express from "express";
import { AuthController } from "../controllers/auth.controller";
import { body } from "express-validator";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();
const authController = new AuthController();

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.login.bind(authController)
);

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    // body("role").isIn(["admin", "staff"]).withMessage("Invalid role"),
  ],
  authController.register.bind(authController)
);

router.post(
  "/refresh",
  [body("refreshToken").notEmpty().withMessage("Refresh token is required")],
  authController.refreshToken.bind(authController)
);

router.post(
  "/logout",
  authMiddleware,
  authController.logout.bind(authController)
);

export default router;
