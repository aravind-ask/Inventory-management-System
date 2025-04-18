import { Model, FilterQuery, PaginateModel, PaginateResult } from "mongoose";
import IRepository from "./base.repository";
import { ICustomer } from "../models/customer.model";

interface GetAllCustomersParams {
  page: number;
  limit: number;
  search: string;
  sort: string;
}

interface GetAllCustomersResult {
  customers: ICustomer[];
  total: number;
  page: number;
  totalPages: number;
}

export class CustomerRepository implements IRepository<ICustomer> {
  private model: PaginateModel<ICustomer>;

  constructor(model: PaginateModel<ICustomer>) {
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

  async getAllCustomers(
    params: GetAllCustomersParams
  ): Promise<GetAllCustomersResult> {
    const { page, limit, search, sort } = params;
    const query: FilterQuery<ICustomer> = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const sortOption = sort
      ? { [sort.replace("-", "")]: sort.startsWith("-") ? -1 : 1 }
      : { createdAt: -1 };

    const result: PaginateResult<ICustomer> = await this.model.paginate(query, {
      page,
      limit,
      sort: sortOption,
    });

    return {
      customers: result.docs,
      total: result.totalDocs,
      page: result.page || 1,
      totalPages: result.totalPages,
    };
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
