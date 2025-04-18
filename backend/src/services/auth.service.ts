import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import User, { IUser } from "../models/user.model";
import { BadRequestError, UnauthorizedError } from "../utils/errors";

interface LoginResponse {
  user: Partial<IUser>
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private userRepository: UserRepository<IUser>;

  constructor() {
    this.userRepository = new UserRepository<IUser>(User);
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.userRepository.update(user._id as string, { refreshToken });

    return {user, accessToken, refreshToken };
  }

  async register(email: string, password: string): Promise<IUser> {
    const existingUser = await this.userRepository.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userRepository.create({
      email,
      password: hashedPassword,
    });
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: null });
  }

  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as { id: string };
      const user = await this.userRepository.findOne({
        _id: payload.id,
        refreshToken,
      });
      if (!user) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      return this.generateAccessToken(user);
    } catch (err) {
      throw new UnauthorizedError("Invalid refresh token");
    }
  }

  private generateAccessToken(user: IUser): string {
    return jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: "15m",
      }
    );
  }

  private generateRefreshToken(user: IUser): string {
    return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "7d",
    });
  }
}
