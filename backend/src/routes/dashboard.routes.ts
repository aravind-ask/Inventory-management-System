import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { DashboardController } from "../controllers/dashboard.controller";
import { DashboardService } from "../services/dashboard.service";
import { SaleRepository } from "../repositories/sales.repository";
import { ItemRepository } from "../repositories/item.repository";
import Sale from "../models/sales.model";
import Item from "../models/item.model";

  const router = express.Router();

  // Dependency injection
  const saleRepository = new SaleRepository(Sale);
  const itemRepository = new ItemRepository(Item, saleRepository);
  const dashboardService = new DashboardService(saleRepository, itemRepository);
  const dashboardController = new DashboardController(dashboardService);

  router.get(
    "/",
    authMiddleware,
    dashboardController.getDashboardData.bind(dashboardController)
  );


export default router;
