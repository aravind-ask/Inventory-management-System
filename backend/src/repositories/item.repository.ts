import { Model, FilterQuery } from "mongoose";
import IRepository from "./base.repository";
import { IItem } from "../models/item.model";

export class ItemRepository implements IRepository<IItem> {
  private model: Model<IItem>;

  constructor(model: Model<IItem>) {
    this.model = model;
  }

  async create(data: Partial<IItem>): Promise<IItem> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<IItem | null> {
    return this.model.findById(id).populate("createdBy", "email").exec();
  }

  async findOne(query: FilterQuery<IItem>): Promise<IItem | null> {
    return this.model.findOne(query).populate("createdBy", "email").exec();
  }

  async findAll(query: FilterQuery<IItem> = {}): Promise<IItem[]> {
    return this.model.find(query).populate("createdBy", "email").exec();
  }

  async update(id: string, data: Partial<IItem>): Promise<IItem | null> {
    return this.model
      .findByIdAndUpdate(id, data, { new: true })
      .populate("createdBy", "email")
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async search(query: string): Promise<IItem[]> {
    return this.model
      .find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      })
      .populate("createdBy", "email")
      .exec();
  }
}
