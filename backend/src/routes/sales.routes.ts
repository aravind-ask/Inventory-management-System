import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { SaleController } from "../controllers/sales.controller";
import { SaleService } from "../services/sales.service";
import { SaleRepository } from "../repositories/sales.repository";
import { ItemRepository } from "../repositories/item.repository";
import Sale from "../models/sales.model";
import Item from "../models/item.model";

  const router = express.Router();

  const saleRepository = new SaleRepository(Sale);
  const itemRepository = new ItemRepository(Item, saleRepository);
  const saleService = new SaleService(saleRepository, itemRepository);
  const saleController = new SaleController(saleService);

  router.post(
    "/",
    authMiddleware,
    saleController.createSale.bind(saleController)
  );

  router.get(
    "/",
    authMiddleware,
    saleController.getAllSales.bind(saleController)
  );

  router.get(
    "/search",
    authMiddleware,
    saleController.searchSales.bind(saleController)
  );

  router.get(
    "/:id",
    authMiddleware,
    saleController.getSale.bind(saleController)
  );


export default router;
