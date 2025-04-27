import { ISale } from "../../models/sales.model";
import { GetAllSalesParams, GetAllSalesResult } from "../../repositories/sales.repository";

export interface ISaleService {
  createSale(data: Partial<ISale>): Promise<ISale>;
  getSale(id: string): Promise<ISale>;
  getAllSales(params: GetAllSalesParams): Promise<GetAllSalesResult>;
  searchSales(query: string): Promise<ISale[]>;
}