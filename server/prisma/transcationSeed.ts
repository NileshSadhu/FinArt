import {
  ensureSeedAccounts,
  ensureSeedCategories,
  ensureSeedUser,
  prisma,
  runSeed,
} from "./seedHelpers.js";

const SEED_REFERENCE_PREFIX = "FINART_DASHBOARD_SEED:";

interface TransactionSeed {
  date: Date;
  description: string;
  type: "EXPENSE" | "INCOME";
  categoryName: string;
  amount: number;
  accountName: string;
}

const dateAtDay = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month, day));

function getMonthTransactions(
  year: number,
  month: number,
  throughDay: number,
): TransactionSeed[] {
  const transactions: TransactionSeed[] = [];
  const expenseDays = [2, 5, 10, 15, 20, 25, 28].filter(
    (day) => day <= throughDay,
  );
  const expenseExamples = [
    { description: "Weekly groceries", categoryName: "Groceries", amount: 4200 },
    { description: "Electricity and water", categoryName: "Utilities", amount: 1850 },
    { description: "Taxi and transit", categoryName: "Transport", amount: 760 },
    { description: "Pharmacy", categoryName: "Health", amount: 1250 },
    { description: "Home supplies", categoryName: "Housing", amount: 2300 },
    { description: "Streaming and cinema", categoryName: "Entertainment", amount: 990 },
    { description: "Market shopping", categoryName: "Groceries", amount: 3150 },
  ];

  expenseDays.forEach((day, index) => {
    const example = expenseExamples[index % expenseExamples.length];
    transactions.push({
      ...example,
      date: dateAtDay(year, month, day),
      type: "EXPENSE",
      accountName: index % 3 === 0 ? "Seed Cash" : "Seed Checking",
    });
    if (index % 2 === 0) {
      transactions.push({
        date: dateAtDay(year, month, day),
        description: "Coffee and lunch",
        type: "EXPENSE",
        categoryName: "Groceries",
        amount: 680 + index * 35,
        accountName: "Seed Cash",
      });
    }
  });

  const incomeDays = [1, 15, 28].filter((day) => day <= throughDay);
  incomeDays.forEach((day, index) => {
    transactions.push({
      date: dateAtDay(year, month, day),
      description:
        index === 0 ? "Monthly salary" : index === 1 ? "Freelance project" : "Savings interest",
      type: "INCOME",
      categoryName: index === 0 ? "Salary" : index === 1 ? "Freelance" : "Interest",
      amount: index === 0 ? 85000 : index === 1 ? 12500 : 620,
      accountName: "Seed Checking",
    });
  });

  return transactions;
}

async function main() {
  const user = await ensureSeedUser();
  const categories = await ensureSeedCategories(user.id);
  const accounts = await ensureSeedAccounts(user.id);
  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthDays = new Date(
    previousMonth.getFullYear(),
    previousMonth.getMonth() + 1,
    0,
  ).getDate();

  const seedTransactions = [
    ...getMonthTransactions(
      previousMonth.getFullYear(),
      previousMonth.getMonth(),
      previousMonthDays,
    ),
    ...getMonthTransactions(now.getFullYear(), now.getMonth(), now.getDate()),
  ];

  await prisma.$transaction(async (tx) => {
    await tx.transaction.deleteMany({
      where: {
        userId: user.id,
        reference: { startsWith: SEED_REFERENCE_PREFIX },
      },
    });

    for (const [index, transaction] of seedTransactions.entries()) {
      const category = categories.get(transaction.categoryName);
      const account = accounts.get(transaction.accountName);
      if (!category || !account) {
        throw new Error(
          `Missing seeded category or account for "${transaction.description}".`,
        );
      }
      if (category.type !== transaction.type) {
        throw new Error(`Category type mismatch for "${category.name}".`);
      }

      await tx.transaction.create({
        data: {
          userId: user.id,
          categoryId: category.id,
          transactionDate: transaction.date,
          description: transaction.description,
          type: transaction.type,
          reference: `${SEED_REFERENCE_PREFIX}${transaction.date.toISOString().slice(0, 10)}:${index + 1}`,
          entries: {
            create: {
              accountId: account.id,
              amount:
                transaction.type === "EXPENSE"
                  ? -transaction.amount
                  : transaction.amount,
            },
          },
        },
      });
    }
  });

  console.log(
    `Seeded ${seedTransactions.length} transactions across current and previous months for ${user.email}.`,
  );
}

void runSeed("Transaction", main);
