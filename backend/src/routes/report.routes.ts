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
    query("search")
      .optional()
      .isString()
      .trim()
      .withMessage("Search must be a string"),
    query("sort")
      .optional()
      .isString()
      .trim()
      .withMessage("Sort must be a string"),
    query("startDate")
      .optional()
      .custom((value) => {
        if (value === "") return true;
        return !isNaN(Date.parse(value)) || "Start date must be a valid date";
      }),
    query("endDate")
      .optional()
      .custom((value) => {
        if (value === "") return true;
        return !isNaN(Date.parse(value)) || "End date must be a valid date";
      }),
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
    query("type")
      .isIn(["sales", "items", "ledger"])
      .withMessage("Type must be one of: sales, items, ledger"),
    query("format")
      .isIn(["excel", "pdf"])
      .withMessage("Format must be one of: excel, pdf"),
    query("customerId")
      .optional()
      .isMongoId()
      .withMessage("Customer ID must be a valid MongoDB ID"),
    query("startDate")
      .optional()
      .custom((value) => {
        if (value === "") return true;
        return !isNaN(Date.parse(value)) || "Start date must be a valid date";
      }),
    query("endDate")
      .optional()
      .custom((value) => {
        if (value === "") return true;
        return !isNaN(Date.parse(value)) || "End date must be a valid date";
      }),
  ],
  reportController.exportReport.bind(reportController)
);

export default router;
