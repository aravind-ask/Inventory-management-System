import { IUser } from "../../models/user.model";
import { LoginResponse } from "../auth.service";

export interface IAuthService {
  login(email: string, password: string): Promise<LoginResponse>;
  register(email: string, name: string, password: string): Promise<IUser>;
  logout(userId: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<string>;
}