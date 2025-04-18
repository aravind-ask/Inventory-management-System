import express from "express";
import { ItemController } from "../controllers/item.controller";
import { body, query } from "express-validator";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();
const itemController = new ItemController();

router.post(
  "/",
  authMiddleware,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a non-negative number"),
  ],
  itemController.createItem.bind(itemController)
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
  itemController.getAllItems.bind(itemController)
);
router.get(
  "/search",
  authMiddleware,
  [query("query").notEmpty()],
  itemController.searchItems.bind(itemController)
);
router.get("/:id", authMiddleware, itemController.getItem.bind(itemController));
router.put(
  "/:id",
  authMiddleware,
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("description")
      .optional()
      .notEmpty()
      .withMessage("Description cannot be empty"),
    body("quantity")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a non-negative number"),
  ],
  itemController.updateItem.bind(itemController)
);
router.delete(
  "/:id",
  authMiddleware,
  itemController.deleteItem.bind(itemController)
);

export default router;
