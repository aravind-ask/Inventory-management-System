import { Model, FilterQuery } from "mongoose";
import IRepository from "./base.repository";
import { ICustomer } from "../models/customer.model";

export class CustomerRepository implements IRepository<ICustomer> {
  private model: Model<ICustomer>;

  constructor(model: Model<ICustomer>) {
    this.model = model;
  }

  async create(data: Partial<ICustomer>): Promise<ICustomer> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<ICustomer | null> {
    return this.model.findById(id).exec();
  }

  async findOne(query: FilterQuery<ICustomer>): Promise<ICustomer | null> {
    return this.model.findOne(query).exec();
  }

  async findAll(query: FilterQuery<ICustomer> = {}): Promise<ICustomer[]> {
    return this.model.find(query).exec();
  }

  async update(
    id: string,
    data: Partial<ICustomer>
  ): Promise<ICustomer | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
}
