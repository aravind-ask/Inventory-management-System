import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { BadRequestError, UnauthorizedError } from "../utils/errors";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  responseHandler,
  errorHandler,
  HttpStatus,
} from "../utils/responseHandlers";
import {  LoginResponse } from "../services/auth.service";
import { IAuthService } from "../services/interfaces/IAuthService";

export class AuthController {
  private authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  async login(req: Request, res: Response) {
    await Promise.all([
      check("email").isEmail().withMessage("Invalid email").run(req),
      check("password").notEmpty().withMessage("Password is required").run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorHandler(
        res,
        new BadRequestError("Validation failed", errors.array())
      );
    }

    try {
      const { email, password } = req.body;
      const loginData: LoginResponse = await this.authService.login(
        email,
        password
      );
      return responseHandler(res, HttpStatus.OK, loginData, "Login successful");
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async register(req: Request, res: Response) {
    await Promise.all([
      check("email").isEmail().withMessage("Invalid email").run(req),
      check("name").notEmpty().withMessage("Name is required").run(req),
      check("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters")
        .run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorHandler(
        res,
        new BadRequestError("Validation failed", errors.array())
      );
    }

    try {
      const { email, name, password } = req.body;
      const user = await this.authService.register(email, name, password);
      return responseHandler(
        res,
        HttpStatus.CREATED,
        { user },
        "User registered successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async refreshToken(req: Request, res: Response) {
    await check("refreshToken")
      .notEmpty()
      .withMessage("Refresh token is required")
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorHandler(
        res,
        new BadRequestError("Validation failed", errors.array())
      );
    }

    try {
      const { refreshToken } = req.body;
      const accessToken = await this.authService.refreshToken(refreshToken);
      return responseHandler(
        res,
        HttpStatus.OK,
        { accessToken },
        "Token refreshed successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async logout(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }
      await this.authService.logout(userId);
      return responseHandler(res, HttpStatus.OK, {}, "Logged out successfully");
    } catch (err) {
      return errorHandler(res, err);
    }
  }
}
