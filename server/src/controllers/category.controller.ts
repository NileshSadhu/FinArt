import type { Request, Response } from "express";
import type { CategoryType } from "../generated/prisma/client.js";
import { categoryRepository } from "../db/repositories/category.repository.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getUserId } from "../utils/params.js";

const CATEGORY_TYPES: readonly CategoryType[] = ["INCOME", "EXPENSE"];

export const getCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(res);

    let type: CategoryType | undefined;
    if (typeof req.query.type === "string") {
      const upper = req.query.type.toUpperCase();
      if ((CATEGORY_TYPES as readonly string[]).includes(upper)) {
        type = upper as CategoryType;
      }
    }

    const categories = await categoryRepository.findAllForUser(userId, type);

    return res
      .status(200)
      .json(new ApiResponse(200, categories, "Categories fetched"));
  }
);
