import { DashboardData, DashboardQueryParams } from "../dashboard.service";

export interface IDashboardService {
  getDashboardData(params?: DashboardQueryParams): Promise<DashboardData>;
}
