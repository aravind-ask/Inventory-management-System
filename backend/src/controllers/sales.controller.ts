import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { BadRequestError } from "../utils/errors";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  responseHandler,
  errorHandler,
  HttpStatus,
} from "../utils/responseHandlers";
import { ISaleService } from "../services/interfaces/ISaleService";

export class SaleController {
  private saleService: ISaleService;

  constructor(saleService: ISaleService) {
    this.saleService = saleService;
  }

  async createSale(req: AuthRequest, res: Response) {
    await Promise.all([
      check("itemId").notEmpty().withMessage("Item ID is required").run(req),
      check("quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be a positive integer")
        .run(req),
      check("paymentType")
        .isIn(["customer", "cash", "credit", "debit"])
        .withMessage("Invalid payment type")
        .run(req),
      check("customerId")
        .optional()
        .notEmpty()
        .withMessage("Customer ID cannot be empty")
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
      const sale = await this.saleService.createSale(req.body);
      return responseHandler(
        res,
        HttpStatus.CREATED,
        { sale },
        "Sale created successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async getSale(req: Request, res: Response) {
    try {
      const sale = await this.saleService.getSale(req.params.id);
      return responseHandler(
        res,
        HttpStatus.OK,
        { sale },
        "Sale retrieved successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async getAllSales(req: Request, res: Response) {
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
      check("search")
        .optional()
        .isString()
        .trim()
        .withMessage("Search must be a string")
        .run(req),
      check("sort")
        .optional()
        .isString()
        .trim()
        .withMessage("Sort must be a string")
        .run(req),
      check("startDate")
        .optional()
        .custom((value) => {
          if (value === "") return true;
          return !isNaN(Date.parse(value)) || "Start date must be a valid date";
        })
        .run(req),
      check("endDate")
        .optional()
        .custom((value) => {
          if (value === "") return true;
          return !isNaN(Date.parse(value)) || "End date must be a valid date";
        })
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
      const {
        page = "1",
        limit = "10",
        search = "",
        sort = "",
        startDate,
        endDate,
        customerId,
      } = req.query;
      const result = await this.saleService.getAllSales({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        sort: sort as string,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        customerId: customerId as string | undefined,
      });
      return responseHandler(
        res,
        HttpStatus.OK,
        {
          sales: result.sales,
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
        "Sales retrieved successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async searchSales(req: Request, res: Response) {
    // Define validation rules
    await check("query").notEmpty().withMessage("Query is required").run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorHandler(
        res,
        new BadRequestError("Validation failed", errors.array())
      );
    }

    try {
      const { query } = req.query;
      const sales = await this.saleService.searchSales(query as string);
      return responseHandler(
        res,
        HttpStatus.OK,
        { sales },
        "Sales searched successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }
}
