import {
  GetAllSalesParams,
} from "../repositories/sales.repository";
import { ISale } from "../models/sales.model";
import { IDashboardService } from "./interfaces/IDashboardService";
import { ISaleRepository } from "../repositories/interfaces/ISalesRepository";
import { IItemRepository } from "../repositories/interfaces/IItemRepository";

export interface DashboardData {
  totalSales: number;
  totalRevenue: number;
  inventoryStatus: {
    totalItems: number;
    lowStockItems: number;
  };
  recentCustomerLedger: ISale[];
}

export interface DashboardQueryParams {
  startDate?: string;
  endDate?: string;
}



export class DashboardService implements IDashboardService {
  private saleRepository: ISaleRepository;
  private itemRepository: IItemRepository;

  constructor(
    saleRepository: ISaleRepository,
    itemRepository: IItemRepository
  ) {
    this.saleRepository = saleRepository;
    this.itemRepository = itemRepository;
  }

  async getDashboardData(
    params: DashboardQueryParams = {}
  ): Promise<DashboardData> {
    const { startDate, endDate } = params;

    const salesParams: GetAllSalesParams = {
      page: 1,
      limit: Number.MAX_SAFE_INTEGER,
      search: "",
      sort: "",
      startDate,
      endDate,
    };
    const salesResult = await this.saleRepository.getAllSales(salesParams);
    const totalSales = salesResult.total;
    const totalRevenue = salesResult.sales.reduce((sum, sale) => {
      const itemPrice = (sale.itemId as any)?.price || 0;
      return sum + sale.quantity * itemPrice;
    }, 0);

    const items = await this.itemRepository.findAll();
    const totalItems = items.length;
    const lowStockItems = items.filter((item) => item.quantity < 10).length; 

    const ledgerParams: GetAllSalesParams = {
      page: 1,
      limit: 5,
      search: "",
      sort: "-date",
      startDate,
      endDate,
    };
    const recentCustomerLedger =
      await this.saleRepository.getAllSales(ledgerParams);

    return {
      totalSales,
      totalRevenue,
      inventoryStatus: {
        totalItems,
        lowStockItems,
      },
      recentCustomerLedger: recentCustomerLedger.sales,
    };
  }
}
