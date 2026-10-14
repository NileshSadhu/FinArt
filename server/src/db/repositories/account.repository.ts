import type {
  Account,
  AccountType,
  Prisma,
} from "../../generated/prisma/client.js";
import { prisma } from "../client.js";

export type CreateAccountInput = Omit<
  Prisma.AccountUncheckedCreateInput,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateAccountInput = {
  name?: string;
  currency?: string;
  openingBalance?: number;
  isActive?: boolean;
};

export const accountRepository = {
  findAllByUser(userId: string, includeInactive = false): Promise<Account[]> {
    return prisma.account.findMany({
      where: { userId, ...(includeInactive ? {} : { isActive: true }) },
      orderBy: { createdAt: "asc" },
    });
  },

  findPaginatedByUser(options: {
    userId: string;
    includeInactive?: boolean;
    page: number;
    limit: number;
  }): Promise<[Account[], number]> {
    const { userId, includeInactive = false, page, limit } = options;
    const where = { userId, ...(includeInactive ? {} : { isActive: true }) };
    const skip = (page - 1) * limit;

    return Promise.all([
      prisma.account.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
      }),
      prisma.account.count({ where }),
    ]);
  },


  findByIdAndUser(id: string, userId: string): Promise<Account | null> {
    return prisma.account.findFirst({ where: { id, userId } });
  },

  create(data: CreateAccountInput): Promise<Account> {
    return prisma.account.create({ data });
  },

  update(
    id: string,
    userId: string,
    data: UpdateAccountInput,
  ): Promise<Account> {
    return prisma.account.update({ where: { id, userId }, data });
  },

  delete(id: string, userId: string): Promise<Account> {
    return prisma.account.delete({ where: { id, userId } });
  },

  async hasFinancialHistory(id: string): Promise<boolean> {
    const count = await prisma.transactionEntry.count({
      where: { accountId: id },
    });
    return count > 0;
  },

  /** Single-query balance aggregation for multiple accounts. */
  async getEntrySums(accountIds: string[]): Promise<Map<string, number>> {
    if (accountIds.length === 0) return new Map();
    const rows = await prisma.transactionEntry.groupBy({
      by: ["accountId"],
      where: { accountId: { in: accountIds } },
      _sum: { amount: true },
    });
    return new Map(
      rows.map((r) => [r.accountId, r._sum.amount?.toNumber() ?? 0]),
    );
  },
} as const;
