import { Model } from "mongoose";
import IRepository from "./base.repository";

export class UserRepository<T> implements IRepository<T> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(query: Partial<T>): Promise<T | null> {
    return this.model.findOne(query).exec();
  }

  async findAll(query: Partial<T> = {}): Promise<T[]> {
    return this.model.find(query).exec();
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
}
