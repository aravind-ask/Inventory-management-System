import express from "express";
import { CustomerController } from "../controllers/customer.controller";
import { body, query } from "express-validator";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();
const customerController = new CustomerController();

router.post(
  "/",
  authMiddleware,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("phone").isMobilePhone("any").withMessage("Invalid mobile number"),
  ],
  customerController.createCustomer.bind(customerController)
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
  customerController.getAllCustomers.bind(customerController)
);
router.get(
  "/:id",
  authMiddleware,
  customerController.getCustomer.bind(customerController)
);
router.patch(
  "/:id",
  authMiddleware,
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("address")
      .optional()
      .notEmpty()
      .withMessage("Address cannot be empty"),
    body("mobile")
      .optional()
      .isMobilePhone("any")
      .withMessage("Invalid mobile number"),
  ],
  customerController.updateCustomer.bind(customerController)
);
router.delete(
  "/:id",
  authMiddleware,
  customerController.deleteCustomer.bind(customerController)
);

export default router;
