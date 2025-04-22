import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";
import { responseHandler, errorHandler, HttpStatus } from "../utils/responseHandlers";

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  async getDashboardData(req: Request, res: Response) {
    try {
      const data = await this.dashboardService.getDashboardData();
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
