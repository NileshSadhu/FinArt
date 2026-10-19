import type { Request, Response } from "express";
import type { TransactionType } from "../generated/prisma/client.js";
import ExcelJS from "exceljs";
import { prisma } from "../db/client.js";
import { accountRepository } from "../db/repositories/account.repository.js";
import { categoryRepository } from "../db/repositories/category.repository.js";
import {
  transactionRepository,
  type TransactionFilters,
} from "../db/repositories/transaction.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getParamId,
  getUserId,
  isValidUuid,
  parseDateRange,
} from "../utils/params.js";
import { parsePagination, buildPaginatedPayload } from "../utils/pagination.js";
import { stripUndefined } from "../utils/object.js";
import {
  TRANSACTION_TYPES,
  transactionSchema,
  updateTransactionSchema,
} from "../validators/transaction.validator.js";

// ── Shared helpers ────────────────────────────────────────────────────────────

function solidFill(argb: string): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

function parseTransactionFilters(
  req: Request,
  userId: string,
): TransactionFilters {
  let type: TransactionType | undefined;
  if (
    typeof req.query.type === "string" &&
    req.query.type.trim().length > 0
  ) {
    const upperType = req.query.type.trim().toUpperCase();
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

  let accountId: string | undefined;
  if (
    typeof req.query.accountId === "string" &&
    req.query.accountId.trim().length > 0
  ) {
    const trimmed = req.query.accountId.trim();
    if (!isValidUuid(trimmed)) {
      throw new ApiError(
        400,
        "Invalid accountId format (must be a valid UUID)",
      );
    }
    accountId = trimmed;
  }

  const { fromDate, toDate } = parseDateRange(
    req.query.fromDate,
    req.query.toDate,
  );

  return {
    userId,
    ...(type !== undefined ? { type } : {}),
    ...(categoryId !== undefined ? { categoryId } : {}),
    ...(accountId !== undefined ? { accountId } : {}),
    ...(fromDate !== undefined ? { fromDate } : {}),
    ...(toDate !== undefined ? { toDate } : {}),
  };
}

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
    const userAccountMap = new Map(userAccounts.map((a) => [a.id, a]));

    const invalidAccounts = accountIds.filter((id) => !userAccountMap.has(id));
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

    // ── Lending & Repayment Domain Logic ────────────────────────────────────
    if (parsed.data.type === "LEND") {
      const receivableEntry = parsed.data.entries.find(
        (e) => userAccountMap.get(e.accountId)?.type === "RECEIVABLE",
      );
      if (!receivableEntry || receivableEntry.amount <= 0) {
        throw new ApiError(
          400,
          "A LEND transaction requires one funding account (negative amount) and one RECEIVABLE account (positive amount).",
        );
      }
    } else if (parsed.data.type === "REPAYMENT") {
      const receivableEntry = parsed.data.entries.find(
        (e) => userAccountMap.get(e.accountId)?.type === "RECEIVABLE",
      );
      if (!receivableEntry || receivableEntry.amount >= 0) {
        throw new ApiError(
          400,
          "A REPAYMENT transaction requires one receiving account (positive amount) and one RECEIVABLE account (negative amount).",
        );
      }

      // Prevent over-repayment: check outstanding receivable balance
      const receivableAccount = userAccountMap.get(receivableEntry.accountId)!;
      const sums = await accountRepository.getEntrySums([receivableAccount.id]);
      const currentBalance =
        receivableAccount.openingBalance.toNumber() +
        (sums.get(receivableAccount.id) ?? 0);

      const repaymentAmount = Math.abs(receivableEntry.amount);
      if (repaymentAmount > currentBalance) {
        throw new ApiError(
          400,
          `Repayment amount (${repaymentAmount}) exceeds the outstanding balance (${currentBalance}) of receivable account "${receivableAccount.name}".`,
        );
      }
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
    const filters = parseTransactionFilters(req, userId);

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

export const cancelTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(res);
    const id = getParamId(req, "id", "transaction ID");

    const existing = await transactionRepository.findByIdAndUser(id, userId);
    if (!existing) {
      throw new ApiError(404, "Transaction not found");
    }

    if (
      existing.reference?.startsWith("REVERSAL_OF:") ||
      existing.notes?.includes("[CANCELLED]")
    ) {
      throw new ApiError(
        400,
        "This transaction has already been reversed or cancelled",
      );
    }

    const existingReversal = await prisma.transaction.findFirst({
      where: {
        userId,
        reference: `REVERSAL_OF:${id}`,
      },
    });
    if (existingReversal) {
      throw new ApiError(
        400,
        "A cancellation/reversal transaction already exists for this transaction",
      );
    }

    // Create an offsetting reversal transaction atomically
    const reversal = await prisma.$transaction(async (tx) => {
      // 1. Mark original transaction notes as cancelled
      await tx.transaction.update({
        where: { id, userId },
        data: {
          notes: existing.notes ? `${existing.notes} [CANCELLED]` : "[CANCELLED]",
        },
      });

      // 2. Invert entry amounts to restore account balances
      const reversedEntries = existing.entries.map((entry) => ({
        accountId: entry.accountId,
        amount: -entry.amount.toNumber(),
      }));

      return tx.transaction.create({
        data: {
          userId,
          categoryId: existing.categoryId,
          transactionDate: new Date(),
          description: `Reversal of: ${existing.description}`,
          type: "ADJUSTMENT",
          reference: `REVERSAL_OF:${id}`,
          notes: `Automated reversal for transaction ${id}`,
          entries: {
            create: reversedEntries,
          },
        },
        include: {
          category: true,
          entries: { include: { account: true } },
          receipts: true,
        },
      });
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        reversal,
        "Transaction cancelled and balance reversal created",
      ),
    );
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

// ── Export Transactions to XLSX ───────────────────────────────────────────────

export const exportTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(res);

    // ── Parse filters via shared helper (same params as getAllTransactions) ───
    const filters = parseTransactionFilters(req, userId);
    const { type, categoryId, accountId, fromDate, toDate } = filters;

    // ── Fetch ALL matching transactions (no pagination) ──────────────────────
    const transactions = await transactionRepository.findMany(filters, {
      skip: 0,
      take: 100_000,
    });

    // ── Resolve human-readable filter labels ─────────────────────────────────
    type FilterRow = { label: string; value: string };
    const filterRows: FilterRow[] = [];

    if (type) {
      filterRows.push({ label: "Transaction Type", value: type });
    }

    if (accountId) {
      // Try to resolve account name from first transaction entry
      const matchedEntry = transactions
        .flatMap((t) => t.entries)
        .find((e) => e.accountId === accountId);
      const accountName =
        (matchedEntry as { account?: { name?: string } } | undefined)?.account?.name ??
        accountId;
      filterRows.push({ label: "Account", value: accountName });
    }

    if (categoryId) {
      const matchedTx = transactions.find((t) => t.categoryId === categoryId);
      const catName =
        (matchedTx?.category as { name?: string } | null | undefined)?.name ?? categoryId;
      filterRows.push({ label: "Category", value: catName });
    }

    if (fromDate) {
      filterRows.push({
        label: "From Date",
        value: fromDate.toISOString().split("T")[0] ?? "",
      });
    }

    if (toDate) {
      filterRows.push({
        label: "To Date",
        value: toDate.toISOString().split("T")[0] ?? "",
      });
    }

    if (filterRows.length === 0) {
      filterRows.push({ label: "Filter", value: "All Transactions (No Filter Applied)" });
    }

    // ── Build Workbook ────────────────────────────────────────────────────────
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "FinArt";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Transactions", {
      pageSetup: { paperSize: 9, orientation: "landscape" },
    });

    // Column widths
    sheet.columns = [
      { key: "A", width: 2 },   // buffer
      { key: "B", width: 18 },  // filter label / Date
      { key: "C", width: 32 },  // filter value / Description
      { key: "D", width: 14 },  // Type
      { key: "E", width: 18 },  // Category
      { key: "F", width: 28 },  // Accounts
      { key: "G", width: 16 },  // Amount
      { key: "H", width: 26 },  // Reference
      { key: "I", width: 30 },  // Notes
    ];

    // ── FinArt Title Banner ───────────────────────────────────────────────────
    // Row 1 – Main title
    const titleRow = sheet.addRow([null, "FinArt Expenses Sheet"]);
    titleRow.height = 36;
    sheet.mergeCells(`B${titleRow.number}:I${titleRow.number}`);
    const titleCell = titleRow.getCell(2);
    titleCell.fill = solidFill("FF111827");
    titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" }, name: "Calibri" };
    titleCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

    // Row 2 – Sub-title with export date
    const exportedOn = new Date().toLocaleString("en-IN", {
      dateStyle: "long",
      timeStyle: "short",
    });
    const subTitleRow = sheet.addRow([null, `Exported on: ${exportedOn}`]);
    subTitleRow.height = 20;
    sheet.mergeCells(`B${subTitleRow.number}:I${subTitleRow.number}`);
    const subTitleCell = subTitleRow.getCell(2);
    subTitleCell.fill = solidFill("FF1F2937");
    subTitleCell.font = { size: 9, color: { argb: "FF9CA3AF" }, italic: true };
    subTitleCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

    // Row 3 – blank spacer
    sheet.addRow([]);

    // ── Filter Info Section ───────────────────────────────────────────────────
    filterRows.forEach(({ label, value }) => {
      const row = sheet.addRow([null, label, value]);
      row.height = 18;

      const labelCell = row.getCell(2);
      labelCell.fill = solidFill("FFF3F4F6");
      labelCell.font = { bold: true, size: 10, color: { argb: "FF374151" } };
      labelCell.alignment = { vertical: "middle", horizontal: "left" };
      labelCell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      };

      const valueCell = row.getCell(3);
      valueCell.fill = solidFill("FFFFFFFF");
      valueCell.font = { size: 10, color: { argb: "FF111827" } };
      valueCell.alignment = { vertical: "middle", horizontal: "left" };
      valueCell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    });

    // ── Blank separator row ───────────────────────────────────────────────────
    sheet.addRow([]);

    // ── Table Header Row ──────────────────────────────────────────────────────
    const headerRow = sheet.addRow([
      null, "Date", "Description", "Type", "Category", "Accounts", "Amount", "Reference", "Notes",
    ]);
    headerRow.height = 22;
    headerRow.eachCell((cell, colNum) => {
      if (colNum < 2) return;
      cell.fill = solidFill("FF111827");
      cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: false };
      cell.border = {
        top: { style: "thin", color: { argb: "FF374151" } },
        left: { style: "thin", color: { argb: "FF374151" } },
        bottom: { style: "thin", color: { argb: "FF374151" } },
        right: { style: "thin", color: { argb: "FF374151" } },
      };
    });

    // ── Data Rows ─────────────────────────────────────────────────────────────
    const evenFill = solidFill("FFFFFFFF");
    const oddFill = solidFill("FFF9FAFB");

    transactions.forEach((tx, idx) => {
      // Resolve display amount: the largest positive entry amount
      const entries = tx.entries as Array<{ amount: { toNumber?: () => number } | number; accountId: string; account?: { name?: string } }>;
      const displayAmt = entries.reduce((max, e) => {
        const v = typeof e.amount === "object" && e.amount !== null && typeof (e.amount as { toNumber?: () => number }).toNumber === "function"
          ? (e.amount as { toNumber: () => number }).toNumber()
          : Number(e.amount);
        return Math.abs(v) > Math.abs(max) ? v : max;
      }, 0);

      const accountNames = entries
        .map((e) => e.account?.name ?? e.accountId)
        .join(", ");

      const dateVal = tx.transactionDate instanceof Date
        ? tx.transactionDate.toISOString().split("T")[0]
        : String(tx.transactionDate).split("T")[0];

      const row = sheet.addRow([
        null,
        dateVal,
        tx.description,
        tx.type,
        (tx.category as { name?: string } | null)?.name ?? "",
        accountNames,
        displayAmt,
        tx.reference ?? "",
        tx.notes ?? "",
      ]);

      row.height = 18;
      const fill = idx % 2 === 0 ? evenFill : oddFill;

      row.eachCell((cell, colNum) => {
        if (colNum < 2) return;
        cell.fill = fill;
        cell.font = { size: 10, color: { argb: "FF111827" } };
        cell.alignment = { vertical: "middle", horizontal: colNum === 7 ? "right" : "left" };
        cell.border = {
          top: { style: "hair", color: { argb: "FFE5E7EB" } },
          left: { style: "hair", color: { argb: "FFE5E7EB" } },
          bottom: { style: "hair", color: { argb: "FFE5E7EB" } },
          right: { style: "hair", color: { argb: "FFE5E7EB" } },
        };

        // Format Amount column as number
        if (colNum === 7) {
          cell.numFmt = '#,##0.00';
        }
      });
    });

    // ── Stream response ───────────────────────────────────────────────────────
    const filename = `transactions_export_${new Date().toISOString().split("T")[0]}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`,
    );

    await workbook.xlsx.write(res);
    res.end();
  },
);
