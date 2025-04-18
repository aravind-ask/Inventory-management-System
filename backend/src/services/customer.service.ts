import { CustomerRepository } from "../repositories/customer.repository";
import Customer, { ICustomer } from "../models/customer.model";
import { BadRequestError, NotFoundError } from "../utils/errors";

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

export class CustomerService {
  private customerRepository: CustomerRepository;

  constructor() {
    this.customerRepository = new CustomerRepository(Customer);
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
    const { page, limit, search, sort } = params;
    return this.customerRepository.getAllCustomers({
      page,
      limit,
      search,
      sort,
    });
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
