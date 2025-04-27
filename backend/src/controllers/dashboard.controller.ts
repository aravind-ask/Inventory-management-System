import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { BadRequestError } from "../utils/errors";
import {
  responseHandler,
  errorHandler,
  HttpStatus,
} from "../utils/responseHandlers";
import { IDashboardService } from "../services/interfaces/IDashboardService";

export class DashboardController {
  private dashboardService: IDashboardService;

  constructor(dashboardService: IDashboardService) {
    this.dashboardService = dashboardService;
  }

  async getDashboardData(req: Request, res: Response) {
    // Define validation rules
    await Promise.all([
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
      const { startDate, endDate } = req.query;
      const data = await this.dashboardService.getDashboardData({
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });
      return responseHandler(
        res,
        HttpStatus.OK,
        { dashboardData: data },
        "Dashboard data retrieved successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }
}
