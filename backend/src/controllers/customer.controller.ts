import { Request, Response } from "express";
import { CustomerService } from "../services/customer.service";
import { validationResult } from "express-validator";
import { BadRequestError } from "../utils/errors";
import { AuthRequest } from "../middlewares/auth.middleware";
import { responseHandler, errorHandler, HttpStatus } from "../utils/responseHandlers";

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  async createCustomer(req: AuthRequest, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorHandler(
        res,
        new BadRequestError("Validation failed", errors.array())
      );
    }

    try {
      const customer = await this.customerService.createCustomer(req.body);
      return responseHandler(
        res,
        HttpStatus.CREATED,
        { customer },
        "Customer created successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async getCustomer(req: Request, res: Response) {
    try {
      const customer = await this.customerService.getCustomer(req.params.id);
      return responseHandler(
        res,
        HttpStatus.OK,
        { customer },
        "Customer retrieved successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async getAllCustomers(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorHandler(
        res,
        new BadRequestError("Validation failed", errors.array())
      );
    }

    try {
      const { page = 1, limit = 10, search = "", sort = "" } = req.query;
      const result = await this.customerService.getAllCustomers({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        sort: sort as string,
      });
      return responseHandler(
        res,
        HttpStatus.OK,
        {
          customers: result.customers,
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
        "Customers retrieved successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async updateCustomer(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorHandler(
        res,
        new BadRequestError("Validation failed", errors.array())
      );
    }

    try {
      const customer = await this.customerService.updateCustomer(
        req.params.id,
        req.body
      );
      return responseHandler(
        res,
        HttpStatus.OK,
        { customer },
        "Customer updated successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async deleteCustomer(req: Request, res: Response) {
    try {
      await this.customerService.deleteCustomer(req.params.id);
      return responseHandler(
        res,
        HttpStatus.OK,
        {},
        "Customer deleted successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }
}
