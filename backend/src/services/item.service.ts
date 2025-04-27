import { Types } from "mongoose";
import { IItem } from "../models/item.model";
import {
  GetAllItemsParams,
  GetAllItemsResult,
} from "../repositories/item.repository";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { IItemService } from "./interfaces/IItemService";
import { IItemRepository } from "../repositories/interfaces/IItemRepository";



export class ItemService implements IItemService {
  private itemRepository: IItemRepository;

  constructor(itemRepository: IItemRepository) {
    this.itemRepository = itemRepository;
  }

  async createItem(data: Partial<IItem>, userId: string): Promise<IItem> {
    const { name, description, quantity, price } = data;
    if (!name || quantity == null || price == null) {
      throw new BadRequestError("Missing required fields");
    }

    // Validate userId as a valid ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("Invalid user ID");
    }

    // Convert userId string to ObjectId
    const createdBy = new Types.ObjectId(userId);
    return this.itemRepository.create({ ...data, createdBy });
  }

  async getItem(id: string): Promise<IItem> {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw new NotFoundError("Item not found");
    }
    return item;
  }

  async getAllItems(params: GetAllItemsParams): Promise<GetAllItemsResult> {
    return this.itemRepository.getAllItems(params);
  }

  async updateItem(id: string, data: Partial<IItem>): Promise<IItem> {
    const item = await this.itemRepository.update(id, data);
    if (!item) {
      throw new NotFoundError("Item not found");
    }
    return item;
  }

  async deleteItem(id: string): Promise<boolean> {
    return this.itemRepository.delete(id);
  }

  async searchItems(query: string): Promise<IItem[]> {
    return this.itemRepository.search(query);
  }
}
