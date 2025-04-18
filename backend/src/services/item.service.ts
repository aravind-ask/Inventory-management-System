import { ItemRepository } from "../repositories/item.repository";
import Item, { IItem } from "../models/item.model";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { AuthRequest } from "../middlewares/auth.middleware";

interface GetAllItemsParams {
  page: number;
  limit: number;
  search: string;
  sort: string;
}

interface GetAllItemsResult {
  items: IItem[];
  total: number;
  page: number;
  totalPages: number;
}

export class ItemService {
  private itemRepository: ItemRepository;

  constructor() {
    this.itemRepository = new ItemRepository(Item);
  }

  async createItem(data: Partial<IItem>, userId: string): Promise<IItem> {
    const { name, description, quantity, price } = data;
    if (!name || !description || quantity == null || price == null) {
      throw new BadRequestError("Missing required fields");
    }
    return this.itemRepository.create({ ...data, createdBy: userId });
  }

  async getItem(id: string): Promise<IItem> {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw new NotFoundError("Item not found");
    }
    return item;
  }

  async getAllItems(params: GetAllItemsParams): Promise<GetAllItemsResult> {
    const { page, limit, search, sort } = params;
    return this.itemRepository.getAllItems({ page, limit, search, sort });
  }

  async updateItem(id: string, data: Partial<IItem>): Promise<IItem> {
    const item = await this.itemRepository.update(id, data);
    if (!item) {
      throw new NotFoundError("Item not found");
    }
    return item;
  }

  async deleteItem(id: string): Promise<void> {
    const success = await this.itemRepository.delete(id);
    if (!success) {
      throw new NotFoundError("Item not found");
    }
  }

  async searchItems(query: string): Promise<IItem[]> {
    return this.itemRepository.search(query);
  }
}
