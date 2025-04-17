import express from "express";
import { CustomerController } from "../controllers/customer.controller";
import { body } from "express-validator";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();
const customerController = new CustomerController();

router.post(
  "/",
  authMiddleware,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("mobile").isMobilePhone("any").withMessage("Invalid mobile number"),
  ],
  customerController.createCustomer.bind(customerController)
);

router.get(
  "/",
  authMiddleware,
  customerController.getAllCustomers.bind(customerController)
);
router.get(
  "/:id",
  authMiddleware,
  customerController.getCustomer.bind(customerController)
);
router.put(
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
