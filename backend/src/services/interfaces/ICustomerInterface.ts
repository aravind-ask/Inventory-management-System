import { ICustomer } from "../../models/customer.model";
import { GetAllCustomersParams, GetAllCustomersResult } from "../../repositories/customer.repository";

export interface ICustomerService {
  createCustomer(data: Partial<ICustomer>): Promise<ICustomer>;
  getCustomer(id: string): Promise<ICustomer>;
  getAllCustomers(
    params: GetAllCustomersParams
  ): Promise<GetAllCustomersResult>;
  updateCustomer(id: string, data: Partial<ICustomer>): Promise<ICustomer>;
  deleteCustomer(id: string): Promise<void>;
}
