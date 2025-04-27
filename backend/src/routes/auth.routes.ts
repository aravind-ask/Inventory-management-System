import express from "express";
import dotenv from "dotenv";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { TokenService } from "../services/token.service";
import { UserRepository } from "../repositories/user.repository";
import User from "../models/user.model";

  const router = express.Router();
  dotenv.config({ path: ".env" });


  const userRepository = new UserRepository(User);
  const tokenService = new TokenService();
  const authService = new AuthService(userRepository, tokenService);
  const authController = new AuthController(authService);

  router.post("/login", authController.login.bind(authController));

  router.post("/register", authController.register.bind(authController));

  router.post("/refresh", authController.refreshToken.bind(authController));

  router.post(
    "/logout",
    authMiddleware,
    authController.logout.bind(authController)
  );




export default router;
