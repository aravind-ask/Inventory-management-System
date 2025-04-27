import { FilterQuery, PaginateModel, PaginateResult } from "mongoose";
import { BaseRepository } from "./base.repository";
import { ISale } from "../models/sales.model";
import { ISaleRepository } from "./interfaces/ISalesRepository";

export interface GetAllSalesParams {
  page: number;
  limit: number;
  search: string;
  sort: string;
  startDate?: string;
  endDate?: string;
  customerId?: string;
}

export interface GetAllSalesResult {
  sales: ISale[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SalesSummary {
  totalRevenue: number;
  totalSales: number;
  averageSalePrice: number;
  topItems: { name: string; quantity: number; revenue: number }[];
  salesByDate: { date: string; total: number; revenue: number }[];
  paymentTypeBreakdown?: { type: string; count: number; percentage: number }[];
}


export class SaleRepository
  extends BaseRepository<ISale>
  implements ISaleRepository
{
  private paginateModel: PaginateModel<ISale>;

  constructor(model: PaginateModel<ISale>) {
    super(model);
    this.paginateModel = model;
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

    const result: PaginateResult<ISale> = await this.paginateModel.paginate(
      query,
      {
        page,
        limit,
        sort: sortOption,
        populate: [
          { path: "itemId", select: "name price" },
          { path: "customerId", select: "name", strictPopulate: false },
        ],
      }
    );

    return {
      sales: result.docs,
      total: result.totalDocs,
      page: result.page || 1,
      totalPages: result.totalPages,
    };
  }

  async getSalesSummary(
    params: Omit<GetAllSalesParams, "page" | "limit">
  ): Promise<SalesSummary> {
    const { search, sort, startDate, endDate, customerId } = params;
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

    const sales = await this.model
      .find(query)
      .populate({ path: "itemId", select: "name price" })
      .exec();

    const totalRevenue = sales.reduce((sum, sale) => {
      const item = sale.itemId as any;
      return sum + sale.quantity * (item?.price || 0);
    }, 0);
    const totalSales = sales.length;
    const averageSalePrice = totalSales > 0 ? totalRevenue / totalSales : 0;

    const itemMap = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();
    sales.forEach((sale) => {
      const item = sale.itemId as any;
      if (!item) return;
      const key = item._id.toString();
      const current = itemMap.get(key) || {
        name: item.name,
        quantity: 0,
        revenue: 0,
      };
      current.quantity += sale.quantity;
      current.revenue += sale.quantity * item.price;
      itemMap.set(key, current);
    });
    const topItems = Array.from(itemMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const salesByDateMap = new Map<
      string,
      { total: number; revenue: number }
    >();
    sales.forEach((sale) => {
      const item = sale.itemId as any;
      if (!item) return;
      const date = new Date(sale.date).toISOString().split("T")[0];
      const current = salesByDateMap.get(date) || { total: 0, revenue: 0 };
      current.total += sale.quantity;
      current.revenue += sale.quantity * item.price;
      salesByDateMap.set(date, current);
    });
    const salesByDate = Array.from(salesByDateMap.entries())
      .map(([date, { total, revenue }]) => ({ date, total, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    let paymentTypeBreakdown;
    if (customerId) {
      const paymentTypes = sales.reduce(
        (acc, sale) => {
          acc[sale.paymentType] = (acc[sale.paymentType] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      paymentTypeBreakdown = Object.entries(paymentTypes).map(
        ([type, count]) => ({
          type,
          count,
          percentage: totalSales > 0 ? (count / totalSales) * 100 : 0,
        })
      );
    }

    return {
      totalRevenue,
      totalSales,
      averageSalePrice,
      topItems,
      salesByDate,
      ...(paymentTypeBreakdown && { paymentTypeBreakdown }),
    };
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
            "itemId.price": "$item.price",
            "customerId.name": "$customer.name",
          },
        },
      ])
      .exec();

    return sales.map((sale) => ({
      ...sale,
      itemId: sale.itemId
        ? { _id: sale.itemId, name: sale.itemId.name, price: sale.itemId.price }
        : null,
      customerId: sale.customerId
        ? { _id: sale.customerId, name: sale.customerId.name }
        : null,
    }));
  }
}
