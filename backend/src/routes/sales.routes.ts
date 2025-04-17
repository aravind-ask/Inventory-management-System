import express from "express";
import { SaleController } from "../controllers/sales.controller";
import { body } from "express-validator";
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
  saleController.getAllSales.bind(saleController)
);
router.get("/:id", authMiddleware, saleController.getSale.bind(saleController));

export default router;
