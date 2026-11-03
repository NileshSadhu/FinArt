import type { Request, Response } from "express";
import { prisma } from "../db/client.js";
import { holidayRepository } from "../db/repositories/holiday.repository.js";
import { getUserId, parseDateRange } from "../utils/params.js";
import { getAvailableHolidayCountries } from "../utils/holidayProvider.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getHolidays = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: getUserId(res) },
      select: { countryCode: true },
    });
    if (!user?.countryCode) {
      throw new ApiError(400, "Select your country before loading holidays");
    }

    const { fromDate, toDate } = parseDateRange(
      req.query.fromDate,
      req.query.toDate,
    );

    if (!fromDate || !toDate) {
      throw new ApiError(400, "fromDate and toDate are required");
    }

    const currentYear = new Date().getFullYear();
    const firstYear = fromDate.getUTCFullYear();
    const lastYear = toDate.getUTCFullYear();

    if (firstYear !== currentYear || lastYear !== currentYear) {
      throw new ApiError(
        400,
        `Holidays are only available for the current year (${currentYear})`,
      );
    }

    await holidayRepository.ensureCountryYearCached(
      user.countryCode,
      currentYear,
    );

    const holidays = await holidayRepository.findForCountryInRange(
      user.countryCode,
      fromDate,
      toDate,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, holidays, "Holidays fetched"));
  },
);

export const getHolidayCountries = asyncHandler(
  async (_req: Request, res: Response) => {
    const countries = await getAvailableHolidayCountries();
    return res
      .status(200)
      .json(new ApiResponse(200, countries, "Holiday countries fetched"));
  },
);
