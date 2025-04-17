import jwt, { SignOptions } from "jsonwebtoken";
import { IUser } from "../models/user.model";
import { BadRequestError } from "./errors";

export class JwtUtils {
  private accessSecret: string;
  private refreshSecret: string;
  private accessExpiresIn: string;
  private refreshExpiresIn: string;

  constructor() {
    // Validate environment variables at construction
    const requiredVars = {
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
      JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
      JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
    };

    const missingVars = Object.entries(requiredVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required JWT environment variables: ${missingVars.join(", ")}`
      );
    }

    this.accessSecret = requiredVars.JWT_ACCESS_SECRET as string;
    this.refreshSecret = requiredVars.JWT_REFRESH_SECRET as string;
    this.accessExpiresIn = requiredVars.JWT_ACCESS_EXPIRES_IN;
    this.refreshExpiresIn = requiredVars.JWT_REFRESH_EXPIRES_IN as string;
  }

  generateAccessToken(user: IUser): string {
    const options: SignOptions = { expiresIn: this.accessExpiresIn };
    return jwt.sign(
      { id: user._id, role: user.role },
      this.accessSecret,
      options
    );
  }

  generateRefreshToken(user: IUser): string {
    const options: SignOptions = { expiresIn: this.refreshExpiresIn };
    return jwt.sign({ id: user._id }, this.refreshSecret, options);
  }

  verifyRefreshToken(refreshToken: string): { id: string } {
    try {
      return jwt.verify(refreshToken, this.refreshSecret) as { id: string };
    } catch (error) {
      throw new BadRequestError("Invalid refresh token");
    }
  }

  verifyAccessToken(token: string): { id: string; role: string } {
    try {
      return jwt.verify(token, this.accessSecret) as {
        id: string;
        role: string;
      };
    } catch (error) {
      throw new BadRequestError("Invalid token");
    }
  }
}
