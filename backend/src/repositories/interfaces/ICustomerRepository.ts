import { ICustomer } from "../../models/customer.model";
import { GetAllCustomersParams, GetAllCustomersResult } from "../customer.repository";
import { IBaseRepository } from "./IBaseRepository";

export interface ICustomerRepository extends IBaseRepository<ICustomer> {
  getAllCustomers(
    params: GetAllCustomersParams
  ): Promise<GetAllCustomersResult>;
}