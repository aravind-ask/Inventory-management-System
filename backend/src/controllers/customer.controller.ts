import { Request, Response, NextFunction } from "express";
import { CustomerService } from "../services/customer.service";
import { validationResult } from "express-validator";
import { BadRequestError } from "../utils/errors";
import { AuthRequest } from "../middlewares/auth.middleware";

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  async createCustomer(req: AuthRequest, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError("Validation failed", errors.array()));
    }

    try {
      const customer = await this.customerService.createCustomer(req.body);
      res.status(201).json(customer);
    } catch (err) {
      next(err);
    }
  }

  async getCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await this.customerService.getCustomer(req.params.id);
      res.json(customer);
    } catch (err) {
      next(err);
    }
  }

  async getAllCustomers(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError("Validation failed", errors.array()));
    }

    try {
      const { page = 1, limit = 10, search = "", sort = "" } = req.query;
      const result = await this.customerService.getAllCustomers({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        sort: sort as string,
      });
      res.json({
        customers: result.customers,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateCustomer(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError("Validation failed", errors.array()));
    }

    try {
      const customer = await this.customerService.updateCustomer(
        req.params.id,
        req.body
      );
      res.json(customer);
    } catch (err) {
      next(err);
    }
  }

  async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      await this.customerService.deleteCustomer(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
