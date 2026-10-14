import type { Request, Response } from "express";
import type { Account } from "../generated/prisma/client.js";
import { accountRepository } from "../db/repositories/account.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
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

function getParamId(req: Request): string {
  const id = req.params.id;
  if (!id || typeof id !== "string")
    throw new ApiError(400, "Invalid account ID");
  return id;
}

// ── Controllers ───────────────────────────────────────────────────────────────

export const createAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = createAccountSchema.safeParse(req.body);
    if (!parsed.success)
      throw new ApiError(400, "Validation failed", parsed.error.issues);

    const userId = res.locals.userId as string;
    const account = await accountRepository.create({ userId, ...parsed.data });

    return res
      .status(201)
      .json(
        new ApiResponse(201, await withBalance(account), "Account created"),
      );
  },
);

export const getAccounts = asyncHandler(async (req: Request, res: Response) => {
  const userId = res.locals.userId as string;
  const includeInactive = req.query.includeInactive === "true";
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

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

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accounts: data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      "Accounts fetched",
    ),
  );
});

export const getAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = res.locals.userId as string;
  const id = getParamId(req);
  const account = await accountRepository.findByIdAndUser(id, userId);
  if (!account) throw new ApiError(404, "Account not found");

  return res
    .status(200)
    .json(new ApiResponse(200, await withBalance(account), "Account fetched"));
});

export const updateAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = res.locals.userId as string;
    const id = getParamId(req);
    const existing = await accountRepository.findByIdAndUser(id, userId);
    if (!existing) throw new ApiError(404, "Account not found");

    const parsed = updateAccountSchema.safeParse(req.body);
    if (!parsed.success)
      throw new ApiError(400, "Validation failed", parsed.error.issues);

    // Strip undefined keys – required by exactOptionalPropertyTypes
    const patch = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => v !== undefined),
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
    const userId = res.locals.userId as string;
    const id = getParamId(req);
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
