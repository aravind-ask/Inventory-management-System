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
    try {
      const sales = await this.saleService.getAllSales();
      res.json(sales);
    } catch (err) {
      next(err);
    }
  }
}
