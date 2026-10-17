import { z } from "zod";

export const TRANSACTION_TYPES = [
  "INCOME",
  "EXPENSE",
  "TRANSFER",
  "LEND",
  "REPAYMENT",
  "ADJUSTMENT",
] as const;

export const transactionSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  transactionDate: z.coerce.date(),
  description: z.string().trim().min(1, "Description is required").max(225),
  type: z.enum(TRANSACTION_TYPES),
  reference: z.string().max(225).nullable().optional(),
  notes: z.string().max(225).nullable().optional(),
  entries: z
    .array(
      z.object({
        accountId: z.string().uuid(),
        amount: z.number().min(-1_000_000_000).max(1_000_000_000),
      }),
    )
    .min(1, "At least one entry is required"),
});

export const updateTransactionSchema = z
  .object({
    categoryId: z.string().uuid().nullable().optional(),
    transactionDate: z.coerce.date().optional(),
    description: z.string().trim().min(1).max(225).optional(),
    type: z.enum(TRANSACTION_TYPES).optional(),
    reference: z.string().max(225).nullable().optional(),
    notes: z.string().max(225).nullable().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided",
  });
