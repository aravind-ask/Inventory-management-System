import { CustomerRepository } from "../repositories/customer.repository";
import Customer, { ICustomer } from "../models/customer.model";
import { BadRequestError, NotFoundError } from "../utils/errors";

export class CustomerService {
  private customerRepository: CustomerRepository;

  constructor() {
    this.customerRepository = new CustomerRepository(Customer);
  }

  async createCustomer(data: Partial<ICustomer>): Promise<ICustomer> {
    const { name, address, mobile } = data;
    if (!name || !address || !mobile) {
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

  async getAllCustomers(): Promise<ICustomer[]> {
    return this.customerRepository.findAll();
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
