import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "../shared/components/saas/PageHeader";
import CustomBtn from "../shared/components/CustomBtn";
import { useAuth } from "../shared/services/auth/useAuth";
import transactionService, {
  type Transaction,
} from "../shared/services/api/transactionService";
import {
  formatCurrency,
  getApiErrorMessage,
} from "../shared/utils/validation";
import { isCancelledTransaction } from "../shared/utils/transaction";

interface CategoryTotal {
  name: string;
  value: number;
}

interface DailyExpenses {
  day: number;
  currentMonth: number | null;
  previousMonth: number | null;
}

interface DailyExpenseChartData {
  currency: string;
  data: DailyExpenses[];
}

const CHART_COLORS = [
  "#4f46e5",
  "#0891b2",
  "#16a34a",
  "#e11d48",
  "#d97706",
  "#9333ea",
  "#0d9488",
  "#2563eb",
  "#ca8a04",
  "#db2777",
];

const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const fetchTransactions = async (
  fromDate: string,
  toDate: string,
): Promise<Transaction[]> => {
  const firstPage = await transactionService.getTransactions(1, 100, {
    fromDate,
    toDate,
  });
  const transactions = [...firstPage.transactions];

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const result = await transactionService.getTransactions(page, 100, {
      fromDate,
      toDate,
    });
    transactions.push(...result.transactions);
  }

  return transactions;
};

const getTransactionAmount = (transaction: Transaction) =>
  Math.abs(Number(transaction.entries[0]?.amount ?? 0));

const getTransactionCurrency = (transaction: Transaction) =>
  transaction.entries[0]?.account.currency ?? "INR";

const getDailyExpenseTotals = (
  transactions: Transaction[],
  currency: string,
) => {
  const totals = new Map<number, number>();
  for (const transaction of transactions) {
    if (
      transaction.type !== "EXPENSE" ||
      getTransactionCurrency(transaction) !== currency
    ) {
      continue;
    }
    const day = Number(transaction.transactionDate.slice(8, 10));
    totals.set(day, (totals.get(day) ?? 0) + getTransactionAmount(transaction));
  }
  return totals;
};

const buildDailyExpenses = (
  current: Transaction[],
  previous: Transaction[],
  currency: string,
): DailyExpenses[] => {
  const currentTotals = getDailyExpenseTotals(current, currency);
  const previousTotals = getDailyExpenseTotals(previous, currency);
  return Array.from({ length: 31 }, (_, index) => {
    const day = index + 1;
    return {
      day,
      currentMonth: currentTotals.get(day) ?? null,
      previousMonth: previousTotals.get(day) ?? null,
    };
  });
};

const buildCategoryTotals = (
  transactions: Transaction[],
  type: "INCOME" | "EXPENSE",
  currency: string,
): CategoryTotal[] => {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (
      transaction.type !== type ||
      getTransactionCurrency(transaction) !== currency
    ) {
      continue;
    }
    const categoryName = transaction.category?.name ?? "Uncategorized";
    totals.set(
      categoryName,
      (totals.get(categoryName) ?? 0) + getTransactionAmount(transaction),
    );
  }

  return [...totals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

const CategoryPieCard = ({
  title,
  data,
  isLoading,
  currency,
}: {
  title: string;
  data: CategoryTotal[];
  isLoading: boolean;
  currency: string;
}) => (
  <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
    <h2 className="text-base font-bold text-neutral-900">{title}</h2>
    <div className="mt-4 h-72">
      {isLoading ? (
        <div className="flex h-full items-center justify-center text-sm text-neutral-400">
          Loading chart...
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-neutral-400">
          No transactions this month.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="46%"
              outerRadius="72%"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`${entry.name}-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  stroke="#fff"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value), currency)}
            />
            <Legend
              verticalAlign="bottom"
              height={48}
              formatter={(value) => (
                <span className="text-xs text-neutral-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  </section>
);

const DailyExpenseChart = ({
  currency,
  data,
  currentMonthLabel,
  previousMonthLabel,
}: {
  currency: string;
  data: DailyExpenses[];
  currentMonthLabel: string;
  previousMonthLabel: string;
}) => {
  const series = [
    {
      dataKey: "previousMonth" as const,
      name: previousMonthLabel,
      color: "#a3a3a3",
      dotColor: "#737373",
      strokeWidth: 2,
    },
    {
      dataKey: "currentMonth" as const,
      name: currentMonthLabel,
      color: "#4f46e5",
      dotColor: "#4f46e5",
      strokeWidth: 2.5,
    },
  ];

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-neutral-600">
        Amounts in {currency}
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              type="number"
              domain={[1, 31]}
              ticks={[5, 10, 15, 20, 25, 30]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#737373", fontSize: 12 }}
            />
            <YAxis
              width={88}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#737373", fontSize: 11 }}
              tickFormatter={(value) => formatCurrency(Number(value), currency)}
            />
            <Tooltip
              labelFormatter={(label) => `Day ${label}`}
              formatter={(value) => formatCurrency(Number(value), currency)}
            />
            <Legend />
            {series.map(({ dataKey, name, color, dotColor, strokeWidth }) => (
              <Line
                key={dataKey}
                type="monotone"
                dataKey={dataKey}
                name={name}
                stroke={color}
                strokeWidth={strokeWidth}
                dot={{ r: 3.5, fill: dotColor, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [today] = useState(() => new Date());

  const currentMonthStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today],
  );
  const previousMonthStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth() - 1, 1),
    [today],
  );
  const currentMonthLabel = currentMonthStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const previousMonthLabel = previousMonthStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const loadTransactions = useCallback(async () => {
    try {
      const result = await fetchTransactions(
        toIsoDate(previousMonthStart),
        toIsoDate(today),
      );
      setTransactions(
        result.filter(
          (transaction) =>
            !isCancelledTransaction(transaction) &&
            (transaction.type === "EXPENSE" || transaction.type === "INCOME"),
        ),
      );
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(error, "Failed to load dashboard transactions"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [previousMonthStart, today]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const currentMonthTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const date = transaction.transactionDate.slice(0, 10);
        return date >= toIsoDate(currentMonthStart) && date <= toIsoDate(today);
      }),
    [transactions, currentMonthStart, today],
  );

  const previousMonthTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const date = transaction.transactionDate.slice(0, 10);
        return (
          date >= toIsoDate(previousMonthStart) &&
          date < toIsoDate(currentMonthStart)
        );
      }),
    [transactions, previousMonthStart, currentMonthStart],
  );

  const dailyExpenseCharts = useMemo<DailyExpenseChartData[]>(() => {
    const currencies = [
      ...new Set(
        [...currentMonthTransactions, ...previousMonthTransactions]
          .filter((transaction) => transaction.type === "EXPENSE")
          .map(getTransactionCurrency),
      ),
    ];

    return currencies.map((currency) => ({
      currency,
      data: buildDailyExpenses(
        currentMonthTransactions,
        previousMonthTransactions,
        currency,
      ),
    }));
  }, [currentMonthTransactions, previousMonthTransactions]);

  const pieCurrencies = useMemo(
    () => [...new Set(currentMonthTransactions.map(getTransactionCurrency))],
    [currentMonthTransactions],
  );

  return (
    <div className="min-h-screen bg-neutral-50/50 px-4 py-8 text-black sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHeader
          title={`Welcome back, ${user?.name || "Partner"}`}
          subtitle="Manage your financial overview, accounts, and recent transactions."
          btn={
            <CustomBtn
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate("/accounts")}
            >
              Create Account
            </CustomBtn>
          }
        />

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-neutral-900">
              Daily Expenses
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {previousMonthLabel} compared with {currentMonthLabel}
            </p>
          </div>
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex h-80 items-center justify-center text-sm text-neutral-400">
                Loading chart...
              </div>
            ) : dailyExpenseCharts.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-neutral-400">
                No expenses in the current or previous month.
              </div>
            ) : (
              dailyExpenseCharts.map((chart) => (
                <DailyExpenseChart
                  key={chart.currency}
                  {...chart}
                  currentMonthLabel={currentMonthLabel}
                  previousMonthLabel={previousMonthLabel}
                />
              ))
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {(pieCurrencies.length ? pieCurrencies : ["INR"]).flatMap(
            (currency) =>
              (["EXPENSE", "INCOME"] as const).map((type) => (
                <CategoryPieCard
                  key={`${type}-${currency}`}
                  title={`${type === "EXPENSE" ? "Expenses" : "Income"} by Category · ${currentMonthLabel}${pieCurrencies.length ? ` · ${currency}` : ""}`}
                  data={buildCategoryTotals(
                    currentMonthTransactions,
                    type,
                    currency,
                  )}
                  isLoading={isLoading}
                  currency={currency}
                />
              )),
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
