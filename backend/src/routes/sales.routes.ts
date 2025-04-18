import express from "express";
import { SaleController } from "../controllers/sales.controller";
import { body, query } from "express-validator";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();
const saleController = new SaleController();

router.post(
  "/",
  authMiddleware,
  [
    body("itemId").notEmpty().withMessage("Item ID is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
    body("paymentType")
      .isIn(["customer", "cash"])
      .withMessage("Invalid payment type"),
    body("customerId")
      .optional()
      .notEmpty()
      .withMessage("Customer ID cannot be empty"),
  ],
  saleController.createSale.bind(saleController)
);

router.get(
  "/",
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
  saleController.getAllSales.bind(saleController)
);
router.get("/:id", authMiddleware, saleController.getSale.bind(saleController));

router.get(
  "/search",
  authMiddleware,
  [query("query").notEmpty()],
  saleController.searchSales.bind(saleController)
);

export default router;
