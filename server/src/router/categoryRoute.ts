import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authApiLimiter } from "../middlewares/rateLimiter.js";
import { getCategories } from "../controllers/category.controller.js";

const categoryRoute = Router();

categoryRoute.use(requireAuth, authApiLimiter);

categoryRoute.get("/", getCategories);

export default categoryRoute;
