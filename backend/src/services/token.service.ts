import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/errors";
import { IUser } from "../models/user.model";
import { ITokenService } from "./interfaces/ITokenService";

export class TokenService implements ITokenService {
  private accessSecret: string;
  private refreshSecret: string;

  constructor() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET || "";
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || "";

    if (!this.accessSecret || !this.refreshSecret) {
      throw new Error(
        `JWT secrets are not defined. ACCESS_SECRET: ${this.accessSecret ? "set" : "unset"}, ` +
          `REFRESH_SECRET: ${this.refreshSecret ? "set" : "unset"}`
      );
    }
  }

  generateAccessToken(user: IUser): string {
    return jwt.sign(
      { id: user._id.toString(), role: user.role },
      this.accessSecret,
      { expiresIn: "15m" }
    );
  }

  generateRefreshToken(user: IUser): string {
    return jwt.sign({ id: user._id.toString() }, this.refreshSecret, {
      expiresIn: "7d",
    });
  }

  verifyRefreshToken(token: string): { id: string } {
    try {
      return jwt.verify(token, this.refreshSecret) as { id: string };
    } catch (err) {
      throw new UnauthorizedError("Invalid refresh token");
    }
  }
}
