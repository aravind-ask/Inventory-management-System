import { Model, FilterQuery } from "mongoose";
import { BaseRepository } from "./base.repository";
import { IUser } from "../models/user.model";
import { IUserRepository } from "./interfaces/IUserRepository";

export class UserRepository
  extends BaseRepository<IUser>
  implements IUserRepository
{
  constructor(model: Model<IUser>) {
    super(model);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).exec();
  }
}
