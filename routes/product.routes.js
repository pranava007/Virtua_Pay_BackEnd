import express from "express";
import { getProducts, createProduct, deleteProduct } from "../controllers/product.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", protect, authorize("admin"), createProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;
