import type { Request, Response } from "express";
import { ApiError } from "./ApiError.js";

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates whether a given string is a valid UUIDv4.
 */
export function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

/**
 * Safely extracts and validates a UUID path parameter from an Express request.
 * Throws ApiError(400) if the parameter is missing or not a valid UUID.
 */
export function getParamId(
  req: Request,
  paramName = "id",
  entityName = "ID",
): string {
  const id = req.params[paramName];
  if (!id || typeof id !== "string" || !isValidUuid(id)) {
    throw new ApiError(
      400,
      `Invalid ${entityName} format (must be a valid UUID)`,
    );
  }
  return id;
}

/**
 * Safely extracts the authenticated user's ID from res.locals.
 * Throws ApiError(401) if not found.
 */
export function getUserId(res: Response): string {
  const userId = res.locals.userId;
  if (!userId || typeof userId !== "string") {
    throw new ApiError(401, "Unauthorized – please sign in");
  }
  return userId;
}

/**
 * Parses and validates optional fromDate and toDate query parameters.
 * Throws ApiError(400) if date formats are invalid or if fromDate > toDate.
 */
export function parseDateRange(
  fromDateQuery?: unknown,
  toDateQuery?: unknown,
): { fromDate?: Date; toDate?: Date } {
  let fromDate: Date | undefined;
  if (typeof fromDateQuery === "string" && fromDateQuery.trim().length > 0) {
    const str = fromDateQuery.trim();
    const parsed = new Date(str);
    if (isNaN(parsed.getTime())) {
      throw new ApiError(400, "Invalid fromDate format");
    }
    // If only YYYY-MM-DD was provided, set to beginning of that day
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      parsed.setUTCHours(0, 0, 0, 0);
    }
    fromDate = parsed;
  }

  let toDate: Date | undefined;
  if (typeof toDateQuery === "string" && toDateQuery.trim().length > 0) {
    const str = toDateQuery.trim();
    const parsed = new Date(str);
    if (isNaN(parsed.getTime())) {
      throw new ApiError(400, "Invalid toDate format");
    }
    // If only YYYY-MM-DD was provided, set to end of that day (23:59:59.999) so transactions on that day are included
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      parsed.setUTCHours(23, 59, 59, 999);
    }
    toDate = parsed;
  }

  if (fromDate && toDate && fromDate > toDate) {
    throw new ApiError(400, "fromDate cannot be after toDate");
  }

  const range: { fromDate?: Date; toDate?: Date } = {};
  if (fromDate !== undefined) range.fromDate = fromDate;
  if (toDate !== undefined) range.toDate = toDate;
  return range;
}
