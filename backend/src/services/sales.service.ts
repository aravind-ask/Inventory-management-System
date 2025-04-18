import { SaleRepository } from "../repositories/sales.repository";
import { ItemRepository } from "../repositories/item.repository";
import Sale, { ISale } from "../models/sales.model";
import Item from "../models/item.model";
import { BadRequestError, NotFoundError } from "../utils/errors";

interface GetAllSalesParams {
  page: number;
  limit: number;
  search: string;
  sort: string;
}

interface GetAllSalesResult {
  sales: ISale[];
  total: number;
  page: number;
  totalPages: number;
}

export class SaleService {
  private saleRepository: SaleRepository;
  private itemRepository: ItemRepository;

  constructor() {
    this.saleRepository = new SaleRepository(Sale);
    this.itemRepository = new ItemRepository(Item);
  }

  async createSale(data: Partial<ISale>): Promise<ISale> {
    const { itemId, quantity, paymentType, customerId } = data;
    if (!itemId || !quantity || !paymentType) {
      throw new BadRequestError("Missing required fields");
    }

    const item = await this.itemRepository.findById(itemId as string);
    if (!item) {
      throw new NotFoundError("Item not found");
    }
    if (item.quantity < quantity) {
      throw new BadRequestError("Insufficient stock");
    }

    // Update item quantity
    await this.itemRepository.update(itemId as string, {
      quantity: item.quantity - quantity,
    });

    return this.saleRepository.create(data);
  }

  async getSale(id: string): Promise<ISale> {
    const sale = await this.saleRepository.findById(id);
    if (!sale) {
      throw new NotFoundError("Sale not found");
    }
    return sale;
  }

  async getAllSales(params: GetAllSalesParams): Promise<GetAllSalesResult> {
    const { page, limit, search, sort } = params;
    return this.saleRepository.getAllSales({ page, limit, search, sort });
  }

  async searchSales(query: string): Promise<ISale[]> {
    return this.saleRepository.search(query);
  }
}
