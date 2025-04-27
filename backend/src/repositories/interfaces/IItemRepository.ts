import { IItem } from "../../models/item.model";
import { GetAllItemsParams, GetAllItemsResult, ItemsSummary } from "../item.repository";
import { IBaseRepository } from "./IBaseRepository";

export interface IItemRepository extends IBaseRepository<IItem> {
  getAllItems(params: GetAllItemsParams): Promise<GetAllItemsResult>;
  getItemsSummary(
    params: Omit<GetAllItemsParams, "page" | "limit">
  ): Promise<ItemsSummary>;
  search(query: string): Promise<IItem[]>;
}