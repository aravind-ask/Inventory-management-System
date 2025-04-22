import { Request, Response } from "express";
import { ItemService } from "../services/item.service";
import { validationResult } from "express-validator";
import { BadRequestError } from "../utils/errors";
import { AuthRequest } from "../middlewares/auth.middleware";
import { responseHandler, errorHandler, HttpStatus } from "../utils/responseHandlers";

export class ItemController {
  private itemService: ItemService;

  constructor() {
    this.itemService = new ItemService();
  }

  async createItem(req: AuthRequest, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorHandler(
        res,
        new BadRequestError("Validation failed", errors.array())
      );
    }

    try {
      const item = await this.itemService.createItem(req.body, req.user!.id);
      return responseHandler(
        res,
        HttpStatus.CREATED,
        { item },
        "Item created successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async getItem(req: Request, res: Response) {
    try {
      const item = await this.itemService.getItem(req.params.id);
      return responseHandler(
        res,
        HttpStatus.OK,
        { item },
        "Item retrieved successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async getAllItems(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorHandler(
        res,
        new BadRequestError("Validation failed", errors.array())
      );
    }

    try {
      const { page = 1, limit = 10, search = "", sort = "" } = req.query;
      const result = await this.itemService.getAllItems({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        sort: sort as string,
      });
      return responseHandler(
        res,
        HttpStatus.OK,
        {
          items: result.items,
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
        "Items retrieved successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async updateItem(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorHandler(
        res,
        new BadRequestError("Validation failed", errors.array())
      );
    }

    try {
      const item = await this.itemService.updateItem(req.params.id, req.body);
      return responseHandler(
        res,
        HttpStatus.OK,
        { item },
        "Item updated successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async deleteItem(req: Request, res: Response) {
    try {
      await this.itemService.deleteItem(req.params.id);
      return responseHandler(
        res,
        HttpStatus.OK,
        {},
        "Item deleted successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }

  async searchItems(req: Request, res: Response) {
    try {
      const { query } = req.query;
      const items = await this.itemService.searchItems(query as string);
      return responseHandler(
        res,
        HttpStatus.OK,
        { items },
        "Items searched successfully"
      );
    } catch (err) {
      return errorHandler(res, err);
    }
  }
}
