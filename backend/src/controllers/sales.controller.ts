import { Request, Response, NextFunction } from "express";
import { SaleService } from "../services/sales.service";
import { validationResult } from "express-validator";
import { BadRequestError } from "../utils/errors";
import { AuthRequest } from "../middlewares/auth.middleware";

export class SaleController {
  private saleService: SaleService;

  constructor() {
    this.saleService = new SaleService();
  }

  async createSale(req: AuthRequest, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError("Validation failed", errors.array()));
    }

    try {
      const sale = await this.saleService.createSale(req.body);
      res.status(201).json(sale);
    } catch (err) {
      next(err);
    }
  }

  async getSale(req: Request, res: Response, next: NextFunction) {
    try {
      const sale = await this.saleService.getSale(req.params.id);
      res.json(sale);
    } catch (err) {
      next(err);
    }
  }

  async getAllSales(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError("Validation failed", errors.array()));
    }

    try {
      const { page = 1, limit = 10, search = "", sort = "" } = req.query;
      const result = await this.saleService.getAllSales({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        sort: sort as string,
      });
      res.json({
        sales: result.sales,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }

  async searchSales(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.query;
      const sales = await this.saleService.searchSales(query as string);
      res.json(sales);
    } catch (err) {
      next(err);
    }
  }
}
