import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ReportController } from "../controllers/report.controller";
import { ReportService } from "../services/report.service";
import { SaleRepository } from "../repositories/sales.repository";
import { ItemRepository } from "../repositories/item.repository";
import Sale from "../models/sales.model";
import Item from "../models/item.model";


  const router = express.Router();

  const saleRepository = new SaleRepository(Sale);
  const itemRepository = new ItemRepository(Item, saleRepository);
  const reportService = new ReportService(saleRepository, itemRepository);
  const reportController = new ReportController(reportService);

  router.get(
    "/sales",
    authMiddleware,
    reportController.getSalesReport.bind(reportController)
  );

  router.get(
    "/items",
    authMiddleware,
    reportController.getItemsReport.bind(reportController)
  );

  router.get(
    "/ledger/:customerId",
    authMiddleware,
    reportController.getCustomerLedger.bind(reportController)
  );

  router.get(
    "/export",
    authMiddleware,
    reportController.exportReport.bind(reportController)
  );

export default router;
