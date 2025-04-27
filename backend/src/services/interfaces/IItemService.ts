import { IItem } from "../../models/item.model";
import { GetAllItemsParams, GetAllItemsResult } from "../../repositories/item.repository";

export interface IItemService {
  createItem(data: Partial<IItem>, userId: string): Promise<IItem>;
  getItem(id: string): Promise<IItem>;
  getAllItems(params: GetAllItemsParams): Promise<GetAllItemsResult>;
  updateItem(id: string, data: Partial<IItem>): Promise<IItem>;
  deleteItem(id: string): Promise<boolean>;
  searchItems(query: string): Promise<IItem[]>;
}