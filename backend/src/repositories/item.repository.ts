import { FilterQuery, PaginateModel, PaginateResult } from "mongoose";
import { BaseRepository } from "./base.repository";
import { IItem } from "../models/item.model";
import { IItemRepository } from "./interfaces/IItemRepository";
import { ISaleRepository } from "./interfaces/ISalesRepository";

export interface GetAllItemsParams {
  page: number;
  limit: number;
  search: string;
  sort: string;
  startDate?: string;
  endDate?: string;
}

export interface GetAllItemsResult {
  items: IItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ItemsSummary {
  totalInventoryValue: number;
  totalItems: number;
  averagePrice: number;
  lowStockItems: number;
  turnoverRate: { name: string; rate: number }[];
}



export class ItemRepository
  extends BaseRepository<IItem>
  implements IItemRepository
{
  private paginateModel: PaginateModel<IItem>;
  private saleRepository: ISaleRepository;

  constructor(model: PaginateModel<IItem>, saleRepository: ISaleRepository) {
    super(model);
    this.paginateModel = model;
    this.saleRepository = saleRepository;
  }

  async getAllItems(params: GetAllItemsParams): Promise<GetAllItemsResult> {
    const { page, limit, search, sort, startDate, endDate } = params;

    const query: FilterQuery<IItem> = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sortOption = sort
      ? { [sort.replace("-", "")]: sort.startsWith("-") ? -1 : 1 }
      : { createdAt: -1 };

    const result: PaginateResult<IItem> = await this.paginateModel.paginate(
      query,
      {
        page,
        limit,
        sort: sortOption,
        populate: { path: "createdBy", select: "email" },
      }
    );

    return {
      items: result.docs,
      total: result.totalDocs,
      page: result.page || 1,
      totalPages: result.totalPages,
    };
  }

  async getItemsSummary(
    params: Omit<GetAllItemsParams, "page" | "limit">
  ): Promise<ItemsSummary> {
    const { search, startDate, endDate } = params;

    const query: FilterQuery<IItem> = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const items = await this.model.find(query).exec();

    const totalInventoryValue = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const totalItems = items.length;
    const averagePrice =
      totalItems > 0
        ? items.reduce((sum, item) => sum + item.price, 0) / totalItems
        : 0;
    const lowStockItems = items.filter((item) => item.quantity < 10).length;

    const sales = await this.saleRepository.findAll({
      ...(startDate && { date: { $gte: new Date(startDate) } }),
      ...(endDate && { date: { $lte: new Date(endDate) } }),
    });
    const salesMap = new Map<string, number>();
    sales.forEach((sale) => {
      const itemId = (sale.itemId as any)?._id?.toString();
      if (itemId) {
        salesMap.set(itemId, (salesMap.get(itemId) || 0) + sale.quantity);
      }
    });
    const turnoverRate = items
      .map((item) => {
        const salesQty = salesMap.get(item._id.toString()) || 0;
        const rate = item.quantity > 0 ? salesQty / item.quantity : 0;
        return { name: item.name, rate };
      })
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);

    return {
      totalInventoryValue,
      totalItems,
      averagePrice,
      lowStockItems,
      turnoverRate,
    };
  }

  async search(query: string): Promise<IItem[]> {
    return this.model
      .find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      })
      .select("name description quantity price")
      .populate("createdBy", "email")
      .exec();
  }
}
