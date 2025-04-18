import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service";

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  async getDashboardData(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.dashboardService.getDashboardData();
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }
}
