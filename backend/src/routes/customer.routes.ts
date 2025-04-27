import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { CustomerController } from "../controllers/customer.controller";
import { CustomerService } from "../services/customer.service";
import { CustomerRepository } from "../repositories/customer.repository";
import Customer from "../models/customer.model";

  const router = express.Router();

  const customerRepository = new CustomerRepository(Customer);
  const customerService = new CustomerService(customerRepository);
  const customerController = new CustomerController(customerService);

  router.post(
    "/",
    authMiddleware,
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

  router.patch(
    "/:id",
    authMiddleware,
    customerController.updateCustomer.bind(customerController)
  );

  router.delete(
    "/:id",
    authMiddleware,
    customerController.deleteCustomer.bind(customerController)
  );


export default router;
