import { IUser } from "../../models/user.model";

export interface ITokenService {
  generateAccessToken(user: IUser): string;
  generateRefreshToken(user: IUser): string;
  verifyRefreshToken(token: string): { id: string };
}
