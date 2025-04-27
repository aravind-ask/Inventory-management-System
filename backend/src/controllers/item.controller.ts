import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { BadRequestError } from "../utils/errors";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  responseHandler,
  errorHandler,
  HttpStatus,
} from "../utils/responseHandlers";
import { IItemService } from "../services/interfaces/IItemService";

export class ItemController {
  private itemService: IItemService;

  constructor(itemService: IItemService) {
    this.itemService = itemService;
  }

  async createItem(req: AuthRequest, res: Response) {
    // Define validation rules
    await Promise.all([
      check("name").notEmpty().withMessage("Name is required").run(req),
      check("description")
        .notEmpty()
        .withMessage("Description is required")
        .run(req),
      check("quantity")
        .isInt({ min: 0 })
        .withMessage("Quantity must be a non-negative integer")
        .run(req),
      check("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be a non-negative number")
        .run(req),
    ]);

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
    // Define validation rules
    await Promise.all([
      check("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer")
        .run(req),
      check("limit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Limit must be a positive integer")
        .run(req),
      check("search").optional().isString().trim().run(req),
      check("sort").optional().isString().trim().run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorHandler(
        res,
        new BadRequestError("Validation failed", errors.array())
      );
    }

    try {
      const { page = "1", limit = "10", search = "", sort = "" } = req.query;
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
    // Define validation rules
    await Promise.all([
      check("name")
        .optional()
        .notEmpty()
        .withMessage("Name cannot be empty")
        .run(req),
      check("description")
        .optional()
        .notEmpty()
        .withMessage("Description cannot be empty")
        .run(req),
      check("quantity")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Quantity must be a non-negative integer")
        .run(req),
      check("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Price must be a non-negative number")
        .run(req),
    ]);

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
    // Define validation rules
    await check("query").notEmpty().withMessage("Query is required").run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorHandler(
        res,
        new BadRequestError("Validation failed", errors.array())
      );
    }

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
