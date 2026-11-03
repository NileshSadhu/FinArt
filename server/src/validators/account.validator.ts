import { z } from "zod";
import { isSupportedCurrency } from "../utils/countryCurrency.js";

export const ACCOUNT_TYPES = ["BANK", "CASH", "RECEIVABLE", "CREDIT"] as const;

export const createAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  type: z.enum(ACCOUNT_TYPES),
  currency: z
    .string()
    .refine(isSupportedCurrency, "Unsupported currency")
    .optional(),
  openingBalance: z.number().min(-1_000_000_000).max(1_000_000_000).default(0),
});

export const updateAccountSchema = z
  .object({
    name: z.string().min(1).max(100).trim().optional(),
    currency: z
      .string()
      .refine(isSupportedCurrency, "Unsupported currency")
      .optional(),
    openingBalance: z.number().min(-1_000_000_000).max(1_000_000_000).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });
