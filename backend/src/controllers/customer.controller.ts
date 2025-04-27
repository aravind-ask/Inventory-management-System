import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { BadRequestError } from "../utils/errors";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  responseHandler,
  errorHandler,
  HttpStatus,
} from "../utils/responseHandlers";
import { ICustomerService } from "../services/interfaces/ICustomerInterface";

export class CustomerController {
  private customerService: ICustomerService;

  constructor(customerService: ICustomerService) {
    this.customerService = customerService;
  }

  async createCustomer(req: AuthRequest, res: Response) {
    // Define validation rules
    await Promise.all([
      check("name").notEmpty().withMessage("Name is required").run(req),
      check("address").notEmpty().withMessage("Address is required").run(req),
      check("phone")
        .isMobilePhone("any")
        .withMessage("Invalid mobile number")
        .run(req),
    ]);

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
    // Define validation rules
    await Promise.all([
      check("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer")
        .run(req),
      check("limit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Limit must be a positive integer")
        .run(req),
      check("search").optional().isString().trim().run(req),
      check("sort").optional().isString().trim().run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorHandler(
        res,
        new BadRequestError("Validation failed", errors.array())
      );
    }

    try {
      const { page = "1", limit = "10", search = "", sort = "" } = req.query;
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
    // Define validation rules
    await Promise.all([
      check("name")
        .optional()
        .notEmpty()
        .withMessage("Name cannot be empty")
        .run(req),
      check("address")
        .optional()
        .notEmpty()
        .withMessage("Address cannot be empty")
        .run(req),
      check("phone")
        .optional()
        .isMobilePhone("any")
        .withMessage("Invalid mobile number")
        .run(req),
    ]);

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
