import { SaleRepository } from "../repositories/sales.repository";
import { ItemRepository } from "../repositories/item.repository";
import Sale, { ISale } from "../models/sales.model";
import Item from "../models/item.model";
import { BadRequestError, NotFoundError } from "../utils/errors";

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

  async getAllSales(): Promise<ISale[]> {
    return this.saleRepository.findAll();
  }
}
