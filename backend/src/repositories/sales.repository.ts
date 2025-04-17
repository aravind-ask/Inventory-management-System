import { Model, FilterQuery } from "mongoose";
import IRepository from "./base.repository";
import { ISale } from "../models/sales.model";

export class SaleRepository implements IRepository<ISale> {
  private model: Model<ISale>;

  constructor(model: Model<ISale>) {
    this.model = model;
  }

  async create(data: Partial<ISale>): Promise<ISale> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<ISale | null> {
    return this.model.findById(id).populate("itemId customerId").exec();
  }

  async findOne(query: FilterQuery<ISale>): Promise<ISale | null> {
    return this.model.findOne(query).populate("itemId customerId").exec();
  }

  async findAll(query: FilterQuery<ISale> = {}): Promise<ISale[]> {
    return this.model.find(query).populate("itemId customerId").exec();
  }

  async update(id: string, data: Partial<ISale>): Promise<ISale | null> {
    return this.model
      .findByIdAndUpdate(id, data, { new: true })
      .populate("itemId customerId")
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
}
