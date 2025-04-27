import bcrypt from "bcryptjs";
import { IUser } from "../models/user.model";
import { BadRequestError, UnauthorizedError } from "../utils/errors";
import { IAuthService } from "./interfaces/IAuthService";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { ITokenService } from "./interfaces/ITokenService";

export interface LoginResponse {
  user: Partial<IUser>;
  accessToken: string;
  refreshToken: string;
}



export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private tokenService: ITokenService;

  constructor(userRepository: IUserRepository, tokenService: ITokenService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);

    await this.userRepository.update(user._id.toString(), { refreshToken });

    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(
    email: string,
    name: string,
    password: string
  ): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userRepository.create({
      email,
      name,
      password: hashedPassword,
      role: "staff",
    });
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: null });
  }

  async refreshToken(refreshToken: string): Promise<string> {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.userRepository.findOne({
      _id: payload.id,
      refreshToken,
    });
    if (!user) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    return this.tokenService.generateAccessToken(user);
  }
}
