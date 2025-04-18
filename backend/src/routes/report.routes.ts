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
    query("startDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Invalid start date"),
    query("endDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Invalid end date"),
  ],
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
  [param("customerId").notEmpty().withMessage("Customer ID is required")],
  reportController.getCustomerLedger.bind(reportController)
);

router.get(
  "/export",
  authMiddleware,
  [
    query("type")
      .isIn(["sales", "items", "ledger"])
      .withMessage("Invalid report type"),
    query("format").isIn(["excel", "pdf"]).withMessage("Invalid format"),
    query("customerId")
      .optional()
      .notEmpty()
      .withMessage("Customer ID cannot be empty"),
    query("startDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Invalid start date"),
    query("endDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Invalid end date"),
    query("email").optional().isEmail().withMessage("Invalid email"),
  ],
  reportController.exportReport.bind(reportController)
);

export default router;
