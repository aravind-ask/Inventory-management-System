import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ItemController } from "../controllers/item.controller";
import { ItemService } from "../services/item.service";
import { ItemRepository } from "../repositories/item.repository";
import { SaleRepository } from "../repositories/sales.repository";
import Item from "../models/item.model";
import Sale from "../models/sales.model";

const router = express.Router();

const saleRepository = new SaleRepository(Sale);
const itemRepository = new ItemRepository(Item, saleRepository);
const itemService = new ItemService(itemRepository);
const itemController = new ItemController(itemService);

router.post(
  "/",
  authMiddleware,
  itemController.createItem.bind(itemController)
);

router.get(
  "/",
  authMiddleware,
  itemController.getAllItems.bind(itemController)
);

router.get(
  "/search",
  authMiddleware,
  itemController.searchItems.bind(itemController)
);

router.get("/:id", authMiddleware, itemController.getItem.bind(itemController));

router.patch(
  "/:id",
  authMiddleware,
  itemController.updateItem.bind(itemController)
);

router.delete(
  "/:id",
  authMiddleware,
  itemController.deleteItem.bind(itemController)
);

export default router;
