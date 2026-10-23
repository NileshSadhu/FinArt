import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set to run the Prisma seed scripts.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

export const SEED_USER = {
  email: "nileshsadhu562@gmail.com",
} as const;

export const CATEGORY_SEEDS = [
  { name: "Groceries", type: "EXPENSE", icon: "ShoppingCart" },
  { name: "Housing", type: "EXPENSE", icon: "Home" },
  { name: "Transport", type: "EXPENSE", icon: "Car" },
  { name: "Utilities", type: "EXPENSE", icon: "FileText" },
  { name: "Health", type: "EXPENSE", icon: "Heart" },
  { name: "Entertainment", type: "EXPENSE", icon: "Music" },
  { name: "Salary", type: "INCOME", icon: "Briefcase" },
  { name: "Freelance", type: "INCOME", icon: "Briefcase" },
  { name: "Interest", type: "INCOME", icon: "PiggyBank" },
] as const;

export async function ensureSeedUser() {
  const user = await prisma.user.findUnique({
    where: { email: SEED_USER.email },
  });
  if (!user) {
    throw new Error(
      `Google account ${SEED_USER.email} is not registered in this database. Sign in with it once before running the seed scripts.`,
    );
  }
  if (user.authProvider !== "google") {
    throw new Error(
      `Seed target ${SEED_USER.email} is not registered with Google authentication.`,
    );
  }
  return user;
}

export async function ensureSeedCategories(userId: string) {
  const categories = await Promise.all(
    CATEGORY_SEEDS.map((category) =>
      prisma.category.upsert({
        where: {
          userId_name_type: {
            userId,
            name: category.name,
            type: category.type,
          },
        },
        create: { ...category, userId },
        update: { icon: category.icon },
      }),
    ),
  );
  return new Map(categories.map((category) => [category.name, category]));
}

export async function ensureSeedAccounts(userId: string) {
  const accounts = [
    {
      name: "Seed Checking",
      type: "BANK" as const,
      currency: "INR",
      openingBalance: 250000,
    },
    {
      name: "Seed Cash",
      type: "CASH" as const,
      currency: "INR",
      openingBalance: 5000,
    },
  ];

  return new Map(
    await Promise.all(
      accounts.map(async (account) => {
        const existing = await prisma.account.findFirst({
          where: { userId, name: account.name },
        });
        const saved =
          existing ??
          (await prisma.account.create({ data: { ...account, userId } }));
        return [account.name, saved] as const;
      }),
    ),
  );
}

export async function runSeed(name: string, seed: () => Promise<void>) {
  try {
    await seed();
  } catch (error: unknown) {
    console.error(`${name} seed failed:`, error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
