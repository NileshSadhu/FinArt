import type { Request, Response } from "express";
import type { Account } from "../generated/prisma/client.js";
import { accountRepository } from "../db/repositories/account.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getParamId, getUserId } from "../utils/params.js";
import { parsePagination, buildPaginatedPayload } from "../utils/pagination.js";
import { stripUndefined } from "../utils/object.js";
import {
  createAccountSchema,
  updateAccountSchema,
} from "../validators/account.validator.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toResponse(account: Account, currentBalance: number) {
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    currency: account.currency,
    openingBalance: account.openingBalance.toNumber(),
    currentBalance,
    isActive: account.isActive,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

async function withBalance(account: Account) {
  const sums = await accountRepository.getEntrySums([account.id]);
  return toResponse(
    account,
    account.openingBalance.toNumber() + (sums.get(account.id) ?? 0),
  );
}

// ── Controllers ───────────────────────────────────────────────────────────────

export const createAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = createAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    const userId = getUserId(res);

    // Check for duplicate active account name for this user
    const userAccounts = await accountRepository.findAllByUser(userId, true);
    const hasDuplicate = userAccounts.some(
      (a) => a.isActive && a.name.toLowerCase() === parsed.data.name.toLowerCase(),
    );
    if (hasDuplicate) {
      throw new ApiError(
        409,
        `An active account with the name "${parsed.data.name}" already exists.`,
      );
    }

    const account = await accountRepository.create({ userId, ...parsed.data });

    return res
      .status(201)
      .json(
        new ApiResponse(201, await withBalance(account), "Account created"),
      );
  },
);

export const getAccounts = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(res);
  const includeInactive = req.query.includeInactive === "true";
  const { page, limit } = parsePagination(req.query);

  const [accounts, total] = await accountRepository.findPaginatedByUser({
    userId,
    includeInactive,
    page,
    limit,
  });
  const sums = await accountRepository.getEntrySums(accounts.map((a) => a.id));

  const data = accounts.map((a) =>
    toResponse(a, a.openingBalance.toNumber() + (sums.get(a.id) ?? 0)),
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        buildPaginatedPayload("accounts", data, total, page, limit),
        "Accounts fetched",
      ),
    );
});

export const getAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(res);
  const id = getParamId(req, "id", "account ID");
  const account = await accountRepository.findByIdAndUser(id, userId);
  if (!account) throw new ApiError(404, "Account not found");

  return res
    .status(200)
    .json(new ApiResponse(200, await withBalance(account), "Account fetched"));
});

export const updateAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(res);
    const id = getParamId(req, "id", "account ID");
    const existing = await accountRepository.findByIdAndUser(id, userId);
    if (!existing) throw new ApiError(404, "Account not found");

    const parsed = updateAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    // Check duplicate name if name is being changed
    if (
      parsed.data.name &&
      parsed.data.name.toLowerCase() !== existing.name.toLowerCase()
    ) {
      const userAccounts = await accountRepository.findAllByUser(userId, true);
      const hasDuplicate = userAccounts.some(
        (a) =>
          a.id !== id &&
          a.isActive &&
          a.name.toLowerCase() === parsed.data.name!.toLowerCase(),
      );
      if (hasDuplicate) {
        throw new ApiError(
          409,
          `An active account with the name "${parsed.data.name}" already exists.`,
        );
      }
    }

    // Protect historical financial integrity
    const hasHistory = await accountRepository.hasFinancialHistory(id);
    if (hasHistory) {
      if (
        parsed.data.openingBalance !== undefined &&
        parsed.data.openingBalance !== existing.openingBalance.toNumber()
      ) {
        throw new ApiError(
          400,
          "Cannot modify opening balance of an account with financial history. Use an ADJUSTMENT transaction instead.",
        );
      }

      if (
        parsed.data.currency !== undefined &&
        parsed.data.currency !== existing.currency
      ) {
        throw new ApiError(
          400,
          "Cannot change currency of an account with existing transactions.",
        );
      }
    }

    const patch = stripUndefined(
      parsed.data,
    ) as Parameters<typeof accountRepository.update>[2];

    const account = await accountRepository.update(id, userId, patch);

    return res
      .status(200)
      .json(
        new ApiResponse(200, await withBalance(account), "Account updated"),
      );
  },
);

export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(res);
    const id = getParamId(req, "id", "account ID");
    const account = await accountRepository.findByIdAndUser(id, userId);
    if (!account) throw new ApiError(404, "Account not found");

    if (await accountRepository.hasFinancialHistory(id)) {
      throw new ApiError(
        409,
        "Cannot delete an account with financial history. Archive it instead.",
      );
    }

    await accountRepository.delete(id, userId);
    return res.status(200).json(new ApiResponse(200, null, "Account deleted"));
  },
);
