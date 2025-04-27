import { ISale } from "../../models/sales.model";
import { GetAllSalesParams, GetAllSalesResult, SalesSummary } from "../sales.repository";
import { IBaseRepository } from "./IBaseRepository";

export interface ISaleRepository extends IBaseRepository<ISale> {
  getAllSales(params: GetAllSalesParams): Promise<GetAllSalesResult>;
  getSalesSummary(
    params: Omit<GetAllSalesParams, "page" | "limit">
  ): Promise<SalesSummary>;
  search(query: string): Promise<ISale[]>;
}