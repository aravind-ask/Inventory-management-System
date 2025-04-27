import { FilterQuery, PaginateModel, PaginateResult } from "mongoose";
import { BaseRepository } from "./base.repository";
import { ICustomer } from "../models/customer.model";
import { ICustomerRepository } from "./interfaces/ICustomerRepository";

export interface GetAllCustomersParams {
  page: number;
  limit: number;
  search: string;
  sort: string;
}

export interface GetAllCustomersResult {
  customers: ICustomer[];
  total: number;
  page: number;
  totalPages: number;
}



export class CustomerRepository
  extends BaseRepository<ICustomer>
  implements ICustomerRepository
{
  private paginateModel: PaginateModel<ICustomer>;

  constructor(model: PaginateModel<ICustomer>) {
    super(model);
    this.paginateModel = model;
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

    const result: PaginateResult<ICustomer> = await this.paginateModel.paginate(
      query,
      {
        page,
        limit,
        sort: sortOption,
      }
    );

    return {
      customers: result.docs,
      total: result.totalDocs,
      page: result.page || 1,
      totalPages: result.totalPages,
    };
  }
}
