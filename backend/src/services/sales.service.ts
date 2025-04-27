import { ISale } from "../models/sales.model";
import { IItemRepository } from "../repositories/interfaces/IItemRepository";
import { ISaleRepository } from "../repositories/interfaces/ISalesRepository";
import {
  GetAllSalesParams,
  GetAllSalesResult,
} from "../repositories/sales.repository";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { ISaleService } from "./interfaces/ISaleService";

export class SaleService implements ISaleService {
  private saleRepository: ISaleRepository;
  private itemRepository: IItemRepository;

  constructor(
    saleRepository: ISaleRepository,
    itemRepository: IItemRepository
  ) {
    this.saleRepository = saleRepository;
    this.itemRepository = itemRepository;
  }

  async createSale(data: Partial<ISale>): Promise<ISale> {
    const { itemId, quantity, paymentType, customerId } = data;
    if (!itemId || !quantity || !paymentType) {
      throw new BadRequestError("Missing required fields");
    }

    const item = await this.itemRepository.findById(itemId.toString());
    if (!item) {
      throw new NotFoundError("Item not found");
    }
    if (item.quantity < quantity) {
      throw new BadRequestError("Insufficient stock");
    }

    await this.itemRepository.update(itemId.toString(), {
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
    return this.saleRepository.getAllSales(params);
  }

  async searchSales(query: string): Promise<ISale[]> {
    return this.saleRepository.search(query);
  }
}
