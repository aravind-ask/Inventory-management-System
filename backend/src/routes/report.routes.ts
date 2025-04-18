import express from "express";
import { ReportController } from "../controllers/report.controller";
import { query, param } from "express-validator";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();
const reportController = new ReportController();

router.get(
  "/sales",
  authMiddleware,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit must be a positive integer"),
    query("search").optional().isString().trim(),
    query("sort").optional().isString().trim(),
    query("startDate").optional().isISO8601().withMessage("Invalid start date"),
    query("endDate").optional().isISO8601().withMessage("Invalid end date"),
  ],
  reportController.getSalesReport.bind(reportController)
);

router.get(
  "/items",
  authMiddleware,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit must be a positive integer"),
    query("search").optional().isString().trim(),
    query("sort").optional().isString().trim(),
  ],
  reportController.getItemsReport.bind(reportController)
);

router.get(
  "/ledger/:customerId",
  authMiddleware,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit must be a positive integer"),
    query("search").optional().isString().trim(),
    query("sort").optional().isString().trim(),
  ],
  reportController.getCustomerLedger.bind(reportController)
);

router.get(
  "/export",
  authMiddleware,
  [
    query("type").isIn(["sales", "items", "ledger"]).withMessage("Invalid report type"),
    query("format").isIn(["excel", "pdf"]).withMessage("Invalid format"),
    query("customerId").optional().isMongoId().withMessage("Invalid customer ID"),
    query("startDate").optional().isISO8601().withMessage("Invalid start date"),
    query("endDate").optional().isISO8601().withMessage("Invalid end date"),
  ],
  reportController.exportReport.bind(reportController)
);

export default router;
