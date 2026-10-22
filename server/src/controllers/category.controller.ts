import type { Request, Response } from "express";
import type { CategoryType } from "../generated/prisma/client.js";
import { categoryRepository } from "../db/repositories/category.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getParamId, getUserId } from "../utils/params.js";
import { stripUndefined } from "../utils/object.js";
import {
  CATEGORY_TYPES,
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";

// ── Controllers ───────────────────────────────────────────────────────────────

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
  },
);

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(res);
  const id = getParamId(req, "id", "category ID");

  const category = await categoryRepository.findById(id);
  if (!category || (category.userId !== null && category.userId !== userId)) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched"));
});

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    const userId = getUserId(res);

    // Check for duplicate category name + type for this user
    const existing = await categoryRepository.findByUserNameType(
      userId,
      parsed.data.name,
      parsed.data.type,
    );
    if (existing) {
      throw new ApiError(
        409,
        `A category named "${parsed.data.name}" already exists for ${parsed.data.type.toLowerCase()} transactions.`,
      );
    }

    const category = await categoryRepository.create({
      userId,
      ...stripUndefined(parsed.data),
    });

    return res
      .status(201)
      .json(new ApiResponse(201, category, "Category created"));
  },
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(res);
    const id = getParamId(req, "id", "category ID");

    const existing = await categoryRepository.findById(id);
    if (!existing || (existing.userId !== null && existing.userId !== userId)) {
      throw new ApiError(404, "Category not found");
    }

    // System/default categories (userId === null) cannot be altered by users
    if (existing.userId === null) {
      throw new ApiError(
        403,
        "System categories cannot be modified. You can create your own custom category instead.",
      );
    }

    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    const targetName = parsed.data.name ?? existing.name;
    const targetType = parsed.data.type ?? existing.type;

    // Check for duplicate if name or type is being updated
    if (
      targetName.toLowerCase() !== existing.name.toLowerCase() ||
      targetType !== existing.type
    ) {
      const duplicate = await categoryRepository.findByUserNameType(
        userId,
        targetName,
        targetType,
      );
      if (duplicate && duplicate.id !== id) {
        throw new ApiError(
          409,
          `A category named "${targetName}" already exists for ${targetType.toLowerCase()} transactions.`,
        );
      }
    }

    const patch = stripUndefined(parsed.data);
    const updated = await categoryRepository.update(id, userId, patch);

    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Category updated"));
  },
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(res);
    const id = getParamId(req, "id", "category ID");

    const existing = await categoryRepository.findById(id);
    if (!existing || (existing.userId !== null && existing.userId !== userId)) {
      throw new ApiError(404, "Category not found");
    }

    // System/default categories (userId === null) cannot be deleted by users
    if (existing.userId === null) {
      throw new ApiError(403, "System categories cannot be deleted.");
    }

    await categoryRepository.delete(id, userId);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Category deleted"));
  },
);
