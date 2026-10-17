import type { Request, Response } from "express";
import type { TransactionType } from "../generated/prisma/client.js";
import { accountRepository } from "../db/repositories/account.repository.js";
import { categoryRepository } from "../db/repositories/category.repository.js";
import {
  transactionRepository,
  type TransactionFilters,
} from "../db/repositories/transaction.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getParamId, getUserId, parseDateRange } from "../utils/params.js";
import { parsePagination, buildPaginatedPayload } from "../utils/pagination.js";
import { stripUndefined } from "../utils/object.js";
import {
  TRANSACTION_TYPES,
  transactionSchema,
  updateTransactionSchema,
} from "../validators/transaction.validator.js";

// ── Controllers ───────────────────────────────────────────────────────────────

export const createTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = transactionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    const userId = getUserId(res);

    // Verify category belongs to user (or is global) if categoryId is provided
    if (parsed.data.categoryId) {
      const category = await categoryRepository.findById(parsed.data.categoryId);
      if (!category || (category.userId !== null && category.userId !== userId)) {
        throw new ApiError(
          400,
          "Category not found or does not belong to user",
        );
      }
    }

    // Verify all entry accounts belong to the authenticated user and are active
    const accountIds = [
      ...new Set(parsed.data.entries.map((entry) => entry.accountId)),
    ];
    const userAccounts = await accountRepository.findAllByUser(userId, true);
    const userAccountIds = new Set(userAccounts.map((account) => account.id));
    const invalidAccounts = accountIds.filter(
      (accountId) => !userAccountIds.has(accountId),
    );

    if (invalidAccounts.length > 0) {
      throw new ApiError(
        400,
        `The following accounts do not exist or do not belong to you: ${invalidAccounts.join(", ")}`,
      );
    }

    const inactiveAccounts = userAccounts.filter(
      (account) => accountIds.includes(account.id) && !account.isActive,
    );
    if (inactiveAccounts.length > 0) {
      throw new ApiError(
        400,
        `Cannot post transactions to inactive/archived account(s): ${inactiveAccounts.map((a) => a.name).join(", ")}`,
      );
    }

    const data = stripUndefined(
      parsed.data,
    ) as Omit<Parameters<typeof transactionRepository.create>[0], "userId">;

    const transaction = await transactionRepository.create({
      userId,
      ...data,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, transaction, "Transaction created"));
  },
);

export const getTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(res);
    const id = getParamId(req, "id", "transaction ID");

    const transaction = await transactionRepository.findByIdAndUser(id, userId);
    if (!transaction) {
      throw new ApiError(404, "Transaction not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, transaction, "Transaction fetched"));
  },
);

export const getAllTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(res);
    const { page, limit, skip } = parsePagination(req.query);

    let type: TransactionType | undefined;
    if (typeof req.query.type === "string") {
      const upperType = req.query.type.toUpperCase();
      if ((TRANSACTION_TYPES as readonly string[]).includes(upperType)) {
        type = upperType as TransactionType;
      } else {
        throw new ApiError(400, `Invalid transaction type: ${req.query.type}`);
      }
    }

    let categoryId: string | undefined;
    if (
      typeof req.query.categoryId === "string" &&
      req.query.categoryId.trim().length > 0
    ) {
      categoryId = req.query.categoryId.trim();
    }

    const { fromDate, toDate } = parseDateRange(
      req.query.fromDate,
      req.query.toDate,
    );

    const filters: TransactionFilters = {
      userId,
      ...(type !== undefined ? { type } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(fromDate !== undefined ? { fromDate } : {}),
      ...(toDate !== undefined ? { toDate } : {}),
    };

    const [transactions, total] = await Promise.all([
      transactionRepository.findMany(filters, { skip, take: limit }),
      transactionRepository.count(filters),
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          buildPaginatedPayload("transactions", transactions, total, page, limit),
          "Transactions fetched",
        ),
      );
  },
);

export const updateTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(res);
    const id = getParamId(req, "id", "transaction ID");

    const existing = await transactionRepository.findByIdAndUser(id, userId);
    if (!existing) {
      throw new ApiError(404, "Transaction not found");
    }

    const parsed = updateTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    if (parsed.data.categoryId) {
      const category = await categoryRepository.findById(parsed.data.categoryId);
      if (!category || (category.userId !== null && category.userId !== userId)) {
        throw new ApiError(
          400,
          "Category not found or does not belong to user",
        );
      }
    }

    const patch = stripUndefined(
      parsed.data,
    ) as Parameters<typeof transactionRepository.update>[2];

    await transactionRepository.update(id, userId, patch);
    const updated = await transactionRepository.findByIdAndUser(id, userId);

    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Transaction updated"));
  },
);

export const deleteTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(res);
    const id = getParamId(req, "id", "transaction ID");

    const existing = await transactionRepository.findByIdAndUser(id, userId);
    if (!existing) {
      throw new ApiError(404, "Transaction not found");
    }

    await transactionRepository.delete(id, userId);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Transaction deleted"));
  },
);
