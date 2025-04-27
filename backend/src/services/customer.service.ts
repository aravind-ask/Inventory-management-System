import { ICustomer } from "../models/customer.model";
import {
  GetAllCustomersParams,
  GetAllCustomersResult,
} from "../repositories/customer.repository";
import { ICustomerRepository } from "../repositories/interfaces/ICustomerRepository";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { ICustomerService } from "./interfaces/ICustomerInterface";

export class CustomerService implements ICustomerService {
  private customerRepository: ICustomerRepository;

  constructor(customerRepository: ICustomerRepository) {
    this.customerRepository = customerRepository;
  }

  async createCustomer(data: Partial<ICustomer>): Promise<ICustomer> {
    const { name, address, phone } = data;
    if (!name || !address || !phone) {
      throw new BadRequestError("Missing required fields");
    }
    return this.customerRepository.create(data);
  }

  async getCustomer(id: string): Promise<ICustomer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError("Customer not found");
    }
    return customer;
  }

  async getAllCustomers(
    params: GetAllCustomersParams
  ): Promise<GetAllCustomersResult> {
    return this.customerRepository.getAllCustomers(params);
  }

  async updateCustomer(
    id: string,
    data: Partial<ICustomer>
  ): Promise<ICustomer> {
    const customer = await this.customerRepository.update(id, data);
    if (!customer) {
      throw new NotFoundError("Customer not found");
    }
    return customer;
  }

  async deleteCustomer(id: string): Promise<void> {
    const success = await this.customerRepository.delete(id);
    if (!success) {
      throw new NotFoundError("Customer not found");
    }
  }
}
