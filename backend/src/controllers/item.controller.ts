import { Request, Response, NextFunction } from "express";
import { ItemService } from "../services/item.service";
import { validationResult } from "express-validator";
import { BadRequestError } from "../utils/errors";
import { AuthRequest } from "../middlewares/auth.middleware";

export class ItemController {
  private itemService: ItemService;

  constructor() {
    this.itemService = new ItemService();
  }

  async createItem(req: AuthRequest, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError("Validation failed", errors.array()));
    }

    try {
      const item = await this.itemService.createItem(req.body, req.user!.id);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }

  async getItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await this.itemService.getItem(req.params.id);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }

  async getAllItems(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await this.itemService.getAllItems();
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError("Validation failed", errors.array()));
    }

    try {
      const item = await this.itemService.updateItem(req.params.id, req.body);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }

  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      await this.itemService.deleteItem(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async searchItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.query;
      const items = await this.itemService.searchItems(query as string);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }
}
