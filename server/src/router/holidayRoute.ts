import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authApiLimiter } from "../middlewares/rateLimiter.js";
import {
  getHolidayCountries,
  getHolidays,
} from "../controllers/holiday.controller.js";

const holidayRoute = Router();

holidayRoute.use(requireAuth, authApiLimiter);
holidayRoute.get("/countries", getHolidayCountries);
holidayRoute.get("/", getHolidays);

export default holidayRoute;
