import { Request, Response } from "express";
import { SaleService } from "../services/sales.service";
import { validationResult } from "express-validator";
import { BadRequestError } from "../utils/errors";
import { AuthRequest } from "../middlewares/auth.middleware";
import { responseHandler, errorHandler, HttpStatus } from "../utils/responseHandlers";

export class SaleController {
  private saleService: SaleService;

  constructor() {
    this.saleService = new SaleService();
  }

  async createSale(req: AuthRequest, res: Response) {
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorHandler(
        res,
        new BadRequestError("Validation failed", errors.array())
      );
    }

    try {
      const {
        page = 1,
        limit = 10,
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
