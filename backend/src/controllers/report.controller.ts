import { Request, Response, NextFunction } from "express";
import { ReportService } from "../services/report.service";
import { validationResult } from "express-validator";
import { BadRequestError } from "../utils/errors";
import { ISale } from "../models/sales.model";
import { IItem } from "../models/item.model";

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  async getSalesReport(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError("Validation failed", errors.array()));
    }

    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        sort = "",
        startDate,
        endDate,
      } = req.query;
      const result = await this.reportService.getSalesReport({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        sort: sort as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      res.json({
        data: result.data,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }

  async getItemsReport(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError("Validation failed", errors.array()));
    }

    try {
      const { page = 1, limit = 10, search = "", sort = "" } = req.query;
      const result = await this.reportService.getItemsReport({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        sort: sort as string,
      });
      res.json({
        data: result.data,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }

  async getCustomerLedger(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError("Validation failed", errors.array()));
    }

    try {
      const { customerId } = req.params;
      const { page = 1, limit = 10, search = "", sort = "" } = req.query;
      const result = await this.reportService.getCustomerLedger({
        customerId,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        sort: sort as string,
      });
      res.json({
        data: result.data,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }

  async exportReport(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError("Validation failed", errors.array()));
    }

    try {
      const { type, format, customerId, startDate, endDate } = req.query;
      let data: ISale[] | IItem[] = [];

      // Fetch all data without pagination for export
      if (type === "sales") {
        const result = await this.reportService.getSalesReport({
          page: 1,
          limit: Number.MAX_SAFE_INTEGER, // Fetch all records
          search: "",
          sort: "",
          startDate: startDate as string,
          endDate: endDate as string,
        });
        data = result.data;
      } else if (type === "items") {
        const result = await this.reportService.getItemsReport({
          page: 1,
          limit: Number.MAX_SAFE_INTEGER,
          search: "",
          sort: "",
        });
        data = result.data;
      } else if (type === "ledger") {
        if (!customerId) {
          throw new BadRequestError(
            "Customer ID is required for ledger export"
          );
        }
        const result = await this.reportService.getCustomerLedger({
          customerId: customerId as string,
          page: 1,
          limit: Number.MAX_SAFE_INTEGER,
          search: "",
          sort: "",
        });
        data = result.data;
      }

      let buffer: Buffer;
      if (format === "excel") {
        buffer = await this.reportService.exportToExcel(
          data,
          type as "sales" | "items" | "ledger"
        );
      } else {
        buffer = await this.reportService.exportToPDF(
          data,
          type as "sales" | "items" | "ledger"
        );
      }

      res.set({
        "Content-Type":
          format === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf",
        "Content-Disposition": `attachment; filename=${type}-report.${format === "excel" ? "xlsx" : "pdf"}`,
      });
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  }
}
