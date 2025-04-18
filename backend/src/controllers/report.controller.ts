import { Request, Response, NextFunction } from "express";
import { ReportService } from "../services/report.service";
import { validationResult } from "express-validator";
import { BadRequestError } from "../utils/errors";
import { AuthRequest } from "../middlewares/auth.middleware";

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
      const { startDate, endDate } = req.query;
      const filter = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };
      const report = await this.reportService.getSalesReport(filter);
      res.json(report);
    } catch (err) {
      next(err);
    }
  }

  async getItemsReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await this.reportService.getItemsReport();
      res.json(report);
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
      const ledger = await this.reportService.getCustomerLedger(customerId);
      res.json(ledger);
    } catch (err) {
      next(err);
    }
  }

  async exportReport(req: AuthRequest, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError("Validation failed", errors.array()));
    }

    try {
      const { type, format, email } = req.query;
      let data: any[];
      let filename: string;

      if (type === "sales") {
        const { startDate, endDate } = req.query;
        const filter = {
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        };
        data = await this.reportService.getSalesReport(filter);
        filename = `sales-report-${new Date().toISOString().split("T")[0]}`;
      } else if (type === "items") {
        data = await this.reportService.getItemsReport();
        filename = `items-report-${new Date().toISOString().split("T")[0]}`;
      } else if (type === "ledger") {
        const { customerId } = req.query;
        if (!customerId) {
          throw new BadRequestError(
            "Customer ID is required for ledger export"
          );
        }
        data = await this.reportService.getCustomerLedger(customerId as string);
        filename = `ledger-${customerId}-${new Date().toISOString().split("T")[0]}`;
      } else {
        throw new BadRequestError("Invalid report type");
      }

      let buffer: Buffer;
      if (format === "excel") {
        buffer = await this.reportService.exportToExcel(
          data,
          type as "sales" | "items" | "ledger"
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${filename}.xlsx`
        );
      } else if (format === "pdf") {
        buffer = await this.reportService.exportToPDF(
          data,
          type as "sales" | "items" | "ledger"
        );
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${filename}.pdf`
        );
      } else {
        throw new BadRequestError("Invalid format");
      }

      if (email) {
        await this.reportService.sendEmailReport(
          email as string,
          `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
          buffer,
          `${filename}.${format === "excel" ? "xlsx" : "pdf"}`
        );
        res.json({ message: "Report sent to email" });
      } else {
        res.send(buffer);
      }
    } catch (err) {
      next(err);
    }
  }
}
