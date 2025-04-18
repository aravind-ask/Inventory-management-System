import { Model, FilterQuery, PaginateModel, PaginateResult } from "mongoose";
import IRepository from "./base.repository";
import { IItem } from "../models/item.model";

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

export class ItemRepository implements IRepository<IItem> {
  private model: PaginateModel<IItem>;

  constructor(model: PaginateModel<IItem>) {
    this.model = model;
  }

  async create(data: Partial<IItem>): Promise<IItem> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<IItem | null> {
    return this.model.findById(id).populate("createdBy", "email").exec();
  }

  async findOne(query: FilterQuery<IItem>): Promise<IItem | null> {
    return this.model.findOne(query).populate("createdBy", "email").exec();
  }

  async findAll(query: FilterQuery<IItem> = {}): Promise<IItem[]> {
    return this.model.find(query).populate("createdBy", "email").exec();
  }

  async getAllItems(params: GetAllItemsParams): Promise<GetAllItemsResult> {
    const { page, limit, search, sort } = params;
    const query: FilterQuery<IItem> = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const sortOption = sort
      ? { [sort.replace("-", "")]: sort.startsWith("-") ? -1 : 1 }
      : { createdAt: -1 };

    const result: PaginateResult<IItem> = await this.model.paginate(query, {
      page,
      limit,
      sort: sortOption,
      populate: { path: "createdBy", select: "email" },
    });

    return {
      items: result.docs,
      total: result.totalDocs,
      page: result.page || 1,
      totalPages: result.totalPages,
    };
  }

  async update(id: string, data: Partial<IItem>): Promise<IItem | null> {
    return this.model
      .findByIdAndUpdate(id, data, { new: true })
      .populate("createdBy", "email")
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async search(query: string): Promise<IItem[]> {
    return this.model
      .find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      })
      .populate("createdBy", "email")
      .exec();
  }
}
