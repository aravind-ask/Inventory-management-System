import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { validationResult } from "express-validator";
import { BadRequestError, UnauthorizedError } from "../utils/errors";
import { AuthRequest } from "../middlewares/auth.middleware";
import { responseHandler, errorHandler, HttpStatus } from "../utils/responseHandlers";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorHandler(
        res,
        new BadRequestError("Validation failed", errors.array())
      );
    }

    try {
      const { email, password } = req.body;
      const loginData = await this.authService.login(email, password);
      return responseHandler(res, HttpStatus.OK, loginData, "Login successful");
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async register(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorHandler(
        res,
        new BadRequestError("Validation failed", errors.array())
      );
    }

    try {
      const { email, password } = req.body;
      const user = await this.authService.register(email, password);
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
