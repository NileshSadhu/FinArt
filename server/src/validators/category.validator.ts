import { z } from "zod";

export const CATEGORY_TYPES = ["INCOME", "EXPENSE"] as const;

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  type: z.enum(CATEGORY_TYPES),
  icon: z.string().trim().max(50).nullable().optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    type: z.enum(CATEGORY_TYPES).optional(),
    icon: z.string().trim().max(50).nullable().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });
