import { z } from "zod";

export const TRANSACTION_TYPES = [
  "INCOME",
  "EXPENSE",
  "TRANSFER",
  "LEND",
  "REPAYMENT",
  "ADJUSTMENT",
] as const;

export const transactionSchema = z
  .object({
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
  })
  .superRefine((val, ctx) => {
    const { type, entries } = val;

    if (type === "INCOME") {
      if (entries.length !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Income transaction must have exactly one entry (destination account)",
          path: ["entries"],
        });
      } else if (entries[0] && entries[0].amount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Income destination entry amount must be positive",
          path: ["entries", 0, "amount"],
        });
      }
    } else if (type === "EXPENSE") {
      if (entries.length !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Expense transaction must have exactly one entry (source account)",
          path: ["entries"],
        });
      } else if (entries[0] && entries[0].amount >= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expense source entry amount must be negative",
          path: ["entries", 0, "amount"],
        });
      }
    } else if (type === "TRANSFER" || type === "LEND" || type === "REPAYMENT") {
      if (entries.length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${type} transaction must have exactly two entries`,
          path: ["entries"],
        });
      } else {
        const [first, second] = entries;
        if (first && second) {
          if (first.accountId === second.accountId) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${type} requires two distinct accounts`,
              path: ["entries"],
            });
          }

          // Conservation of funds: two entries must sum to zero within 4 decimals
          const sumInCents =
            Math.round(first.amount * 10000) + Math.round(second.amount * 10000);
          if (sumInCents !== 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${type} entries must sum to zero (one source and one destination)`,
              path: ["entries"],
            });
          }

          if (first.amount === 0 || second.amount === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${type} entry amounts cannot be zero`,
              path: ["entries"],
            });
          }
        }
      }
    } else if (type === "ADJUSTMENT") {
      if (entries.length !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Adjustment transaction must have exactly one entry",
          path: ["entries"],
        });
      } else if (entries[0] && entries[0].amount === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Adjustment amount cannot be zero",
          path: ["entries", 0, "amount"],
        });
      }
    }
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
