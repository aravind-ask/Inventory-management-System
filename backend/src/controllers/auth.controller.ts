import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { validationResult } from "express-validator";
import { BadRequestError } from "../utils/errors";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError("Validation failed", errors.array()));
    }

    try {
      const { email, password } = req.body;
      const tokens = await this.authService.login(email, password);
      res.json(tokens);
    } catch (err) {
      next(err);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError("Validation failed", errors.array()));
    }

    try {
      const { email, password } = req.body;
      const user = await this.authService.register(email, password);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError("Validation failed", errors.array()));
    }

    try {
      const { refreshToken } = req.body;
      const accessToken = await this.authService.refreshToken(refreshToken);
      res.json({ accessToken });
    } catch (err) {
      next(err);
    }
  }
}
