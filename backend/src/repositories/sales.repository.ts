import { Model, FilterQuery, PaginateModel, PaginateResult } from "mongoose";
import IRepository from "./base.repository";
import { ISale } from "../models/sales.model";

interface GetAllSalesParams {
  page: number;
  limit: number;
  search: string;
  sort: string;
  startDate?: string;
  endDate?: string;
  customerId?: string;
}

interface GetAllSalesResult {
  sales: ISale[];
  total: number;
  page: number;
  totalPages: number;
}

export class SaleRepository implements IRepository<ISale> {
  private model: PaginateModel<ISale>;

  constructor(model: PaginateModel<ISale>) {
    this.model = model;
  }

  async create(data: Partial<ISale>): Promise<ISale> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<ISale | null> {
    return this.model.findById(id).populate("itemId customerId").exec();
  }

  async findOne(query: FilterQuery<ISale>): Promise<ISale | null> {
    return this.model.findOne(query).populate("itemId customerId").exec();
  }

  async findAll(query: FilterQuery<ISale> = {}): Promise<ISale[]> {
    return this.model.find(query).populate("itemId customerId").exec();
  }

  async getAllSales(params: GetAllSalesParams): Promise<GetAllSalesResult> {
    const { page, limit, search, sort, startDate, endDate, customerId } =
      params;
    const query: FilterQuery<ISale> = {};

    if (search) {
      query.$or = [
        { "itemId.name": { $regex: search, $options: "i" } },
        { "customerId.name": { $regex: search, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (customerId) {
      query.customerId = customerId;
    }

    const sortOption = sort
      ? { [sort.replace("-", "")]: sort.startsWith("-") ? -1 : 1 }
      : { createdAt: -1 };

    // Enhanced debug logging
    console.log("SaleRepository.getAllSales Params:", {
      page,
      limit,
      search,
      sort,
      startDate,
      endDate,
      customerId,
    });
    console.log(
      "SaleRepository.getAllSales Query:",
      JSON.stringify(query, null, 2)
    );

    const result: PaginateResult<ISale> = await this.model.paginate(query, {
      page,
      limit,
      sort: sortOption,
      populate: [
        { path: "itemId", select: "name" },
        { path: "customerId", select: "name", strictPopulate: false }, // Allow missing customerId
      ],
    });

    // Log populated data
    console.log("SaleRepository.getAllSales Result:", {
      docs: result.docs.length,
      totalDocs: result.totalDocs,
      page: result.page,
      totalPages: result.totalPages,
      sampleDoc: result.docs.length ? result.docs[0] : null,
    });

    return {
      sales: result.docs,
      total: result.totalDocs,
      page: result.page || 1,
      totalPages: result.totalPages,
    };
  }

  async update(id: string, data: Partial<ISale>): Promise<ISale | null> {
    return this.model
      .findByIdAndUpdate(id, data, { new: true })
      .populate("itemId customerId")
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async search(query: string): Promise<ISale[]> {
    if (!query || query.trim() === "") {
      return [];
    }

    const sales = await this.model
      .aggregate([
        {
          $lookup: {
            from: "items",
            localField: "itemId",
            foreignField: "_id",
            as: "item",
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "customerId",
            foreignField: "_id",
            as: "customer",
          },
        },
        {
          $unwind: {
            path: "$item",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$customer",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [
              { "item.name": { $regex: query, $options: "i" } },
              { "customer.name": { $regex: query, $options: "i" } },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            itemId: "$item._id",
            customerId: "$customer._id",
            quantity: 1,
            paymentType: 1,
            createdBy: 1,
            date: 1,
            createdAt: 1,
            updatedAt: 1,
            "itemId.name": "$item.name",
            "customerId.name": "$customer.name",
          },
        },
      ])
      .exec();

    return sales.map((sale) => ({
      ...sale,
      itemId: sale.itemId ? { _id: sale.itemId, name: sale.itemId.name } : null,
      customerId: sale.customerId
        ? { _id: sale.customerId, name: sale.customerId.name }
        : null,
    }));
  }
}
