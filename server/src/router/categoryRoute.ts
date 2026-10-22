import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authApiLimiter } from "../middlewares/rateLimiter.js";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const categoryRoute = Router();

categoryRoute.use(requireAuth, authApiLimiter);

categoryRoute.post("/", createCategory);
categoryRoute.get("/", getCategories);
categoryRoute.get("/:id", getCategory);
categoryRoute.put("/:id", updateCategory);
categoryRoute.patch("/:id", updateCategory);
categoryRoute.delete("/:id", deleteCategory);

export default categoryRoute;
