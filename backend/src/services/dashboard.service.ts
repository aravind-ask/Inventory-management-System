import { SaleRepository } from "../repositories/sales.repository";
import { ItemRepository } from "../repositories/item.repository";
import Sale, { ISale } from "../models/sales.model";
import Item, { IItem } from "../models/item.model";

interface DashboardData {
  totalSales: number;
  totalRevenue: number;
  inventoryStatus: {
    totalItems: number;
    lowStockItems: number;
  };
  recentCustomerLedger: ISale[];
}

export class DashboardService {
  private saleRepository: SaleRepository;
  private itemRepository: ItemRepository;

  constructor() {
    this.saleRepository = new SaleRepository(Sale);
    this.itemRepository = new ItemRepository(Item);
  }

  async getDashboardData(): Promise<DashboardData> {
    // Total Sales and Revenue
    const salesResult = await this.saleRepository.findAll();
    const totalSales = salesResult.length;
    const totalRevenue = salesResult.reduce((sum, sale) => {
      const itemPrice = (sale.itemId as any)?.price || 0;
      return sum + sale.quantity * itemPrice;
    }, 0);

    // Inventory Status
    const items = await this.itemRepository.findAll();
    const totalItems = items.length;
    const lowStockItems = items.filter((item) => item.quantity < 10).length; // Threshold: 10

    // Recent Customer Ledger (last 5 sales)
    const recentCustomerLedger = await this.saleRepository.getAllSales({
      page: 1,
      limit: 5,
      search: "",
      sort: "-date", // Most recent first
    });

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
