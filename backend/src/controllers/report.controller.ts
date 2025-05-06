import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { BadRequestError } from "../utils/errors";
import { ISale } from "../models/sales.model";
import { IItem } from "../models/item.model";
import {
  responseHandler,
  errorHandler,
  HttpStatus,
} from "../utils/responseHandlers";
import { IReportService } from "../services/interfaces/IReportService";

export class ReportController {
  private reportService: IReportService;

  constructor(reportService: IReportService) {
    this.reportService = reportService;
  }

  async getSalesReport(req: Request, res: Response) {
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
      } = req.query;
      const result = await this.reportService.getSalesReport({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        sort: sort as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      return responseHandler(
        res,
        HttpStatus.OK,
        {
          sales: result.data,
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          summary: result.summary,
        },
        "Sales report retrieved successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async getItemsReport(req: Request, res: Response) {
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
      const {
        page = "1",
        limit = "10",
        search = "",
        sort = "",
        startDate,
        endDate,
      } = req.query;
      const result = await this.reportService.getItemsReport({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        sort: sort as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      return responseHandler(
        res,
        HttpStatus.OK,
        {
          items: result.data,
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          summary: result.summary,
        },
        "Items report retrieved successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async getCustomerLedger(req: Request, res: Response) {
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
      const { customerId } = req.params;
      const { page = "1", limit = "10", search = "", sort = "" } = req.query;
      const result = await this.reportService.getCustomerLedger({
        customerId,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        sort: sort as string,
      });
      return responseHandler(
        res,
        HttpStatus.OK,
        {
          ledger: result.data,
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          summary: result.summary,
        },
        "Customer ledger retrieved successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async exportReport(req: Request, res: Response) {
    await Promise.all([
      check("type")
        .isIn(["sales", "items", "ledger"])
        .withMessage("Type must be one of: sales, items, ledger")
        .run(req),
      check("format")
        .isIn(["excel", "pdf"])
        .withMessage("Format must be one of: excel, pdf")
        .run(req),
      check("customerId")
        .optional()
        .isMongoId()
        .withMessage("Customer ID must be a valid MongoDB ID")
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
      const { type, format, customerId, startDate, endDate } = req.query;
      let data: ISale[] | IItem[] = [];
      let summary: any = {};

      if (type === "sales") {
        const result = await this.reportService.getSalesReport({
          page: 1,
          limit: Number.MAX_SAFE_INTEGER,
          search: "",
          sort: "",
          startDate: startDate as string,
          endDate: endDate as string,
        });
        data = result.data;
        summary = result.summary;
      } else if (type === "items") {
        const result = await this.reportService.getItemsReport({
          page: 1,
          limit: Number.MAX_SAFE_INTEGER,
          search: "",
          sort: "",
          startDate: startDate as string,
          endDate: endDate as string,
        });
        data = result.data;
        summary = result.summary;
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
        summary = result.summary;
      }

      let buffer: Buffer;
      if (format === "excel") {
        buffer = await this.reportService.exportToExcel(
          data,
          summary,
          type as "sales" | "items" | "ledger"
        );
      } else {
        buffer = await this.reportService.exportToPDF(
          data,
          summary,
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
      return errorHandler(res, err);
    }
  }
}
