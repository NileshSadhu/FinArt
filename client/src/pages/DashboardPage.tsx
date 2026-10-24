import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Tag,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import PageHeader from "../shared/components/saas/PageHeader";
import CustomBtn from "../shared/components/CustomBtn";
import Skeleton from "../shared/components/saas/Skeleton";
import { useAuth } from "../shared/services/auth/useAuth";
import transactionService, {
  type Transaction,
} from "../shared/services/api/transactionService";
import { formatCurrency } from "../shared/utils/validation";
import {
  getTransactionDisplayAmount,
  isCancelledTransaction,
} from "../shared/utils/transaction";
import { getCategoryIconOption } from "../shared/utils/categoryIcons";

// Custom dot renderer: renders dot ONLY when an expense occurred (> 0)
const renderExpenseDot = (
  strokeColor: string,
  fillColor: string = "#ffffff",
) => {
  return (dotProps: any) => {
    const { cx, cy, value, key } = dotProps;
    if (value === null || value === undefined || value <= 0) {
      return null;
    }
    return (
      <circle
        key={key}
        cx={cx}
        cy={cy}
        r={4.5}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
        className="filter drop-shadow-xs"
      />
    );
  };
};

// Custom Recharts Tooltip
const ExpenseComparisonTooltip = ({
  active,
  payload,
  label,
  currency,
}: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xs border border-neutral-200/90 rounded-xl p-3 shadow-md text-xs space-y-1.5 min-w-[170px]">
        <p className="font-bold text-neutral-700 pb-1 border-b border-neutral-100">
          Day {label}
        </p>
        {payload.map((entry: any, index: number) => {
          if (entry.value === null || entry.value === undefined) return null;
          return (
            <div
              key={`tooltip-${index}`}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-neutral-600 font-medium">
                  {entry.name}:
                </span>
              </div>
              <span className="font-bold text-neutral-900 tabular-nums">
                {formatCurrency(entry.value, currency)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Date ranges for previous month & current month
  const {
    fromDate,
    toDate,
    currMonthStartIso,
    prevMonthStartIso,
    prevMonthEndIso,
    currentMonthLabel,
    previousMonthLabel,
    currentDayOfMonth,
    daysInCurrentMonth,
    daysInPreviousMonth,
  } = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const toIso = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const currStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      fromDate: toIso(prevStart),
      toDate: toIso(currEnd),
      currMonthStartIso: toIso(currStart),
      prevMonthStartIso: toIso(prevStart),
      prevMonthEndIso: toIso(prevEnd),
      currentMonthLabel: now.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      previousMonthLabel: prevStart.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      currentDayOfMonth: now.getDate(),
      daysInCurrentMonth: currEnd.getDate(),
      daysInPreviousMonth: prevEnd.getDate(),
    };
  }, []);

  // Fetch transactions across previous month and current month
  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const res = await transactionService.getTransactions(1, 200, {
          fromDate,
          toDate,
        });
        if (isMounted) {
          setTransactions(
            res.transactions.filter((tx) => !isCancelledTransaction(tx)),
          );
        }
      } catch {
        toast.error("Failed to load dashboard transactions");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, [fromDate, toDate]);

  // Split transactions by month
  const { currentMonthTx, previousMonthTx } = useMemo(() => {
    const current: Transaction[] = [];
    const previous: Transaction[] = [];

    for (const tx of transactions) {
      const dateStr = tx.transactionDate.slice(0, 10);
      if (dateStr >= currMonthStartIso) {
        current.push(tx);
      } else if (dateStr >= prevMonthStartIso && dateStr <= prevMonthEndIso) {
        previous.push(tx);
      }
    }
    return { currentMonthTx: current, previousMonthTx: previous };
  }, [transactions, currMonthStartIso, prevMonthStartIso, prevMonthEndIso]);

  // Aggregate current month Income, Expenses, and Category Breakdown
  const {
    totalExpenses,
    totalIncome,
    totalSavings,
    savingsRate,
    categoryExpenses,
    primaryCurrency,
  } = useMemo(() => {
    let expenses = 0;
    let income = 0;
    const catMap = new Map<
      string,
      { id: string; name: string; icon: string | null; amount: number }
    >();
    let currency = "INR";

    for (const tx of currentMonthTx) {
      const { amount, currency: txCurrency } =
        getTransactionDisplayAmount(tx);
      currency = txCurrency;

      if (tx.type === "EXPENSE") {
        expenses += amount;
        const catId = tx.category?.id ?? "uncategorized";
        const existing = catMap.get(catId);
        if (existing) {
          existing.amount += amount;
        } else {
          catMap.set(catId, {
            id: catId,
            name: tx.category?.name ?? "Uncategorized",
            icon: tx.category?.icon ?? null,
            amount,
          });
        }
      } else if (tx.type === "INCOME") {
        income += amount;
      }
    }

    // Sort with highest expense on top
    const sortedCategories = Array.from(catMap.values()).sort(
      (a, b) => b.amount - a.amount,
    );

    const savings = income - expenses;
    const rate =
      income > 0 ? Math.max(0, Math.round((savings / income) * 100)) : 0;

    return {
      totalExpenses: expenses,
      totalIncome: income,
      totalSavings: savings,
      savingsRate: rate,
      categoryExpenses: sortedCategories,
      primaryCurrency: currency,
    };
  }, [currentMonthTx]);

  const maxExpense = categoryExpenses[0]?.amount || 1;

  // Aggregate Previous Month total expenses
  const totalPreviousExpenses = useMemo(() => {
    return previousMonthTx.reduce((sum, tx) => {
      if (tx.type === "EXPENSE") {
        return sum + getTransactionDisplayAmount(tx).amount;
      }
      return sum;
    }, 0);
  }, [previousMonthTx]);

  // Build daily comparison points (Days 1 to maxDays)
  const dailyComparisonData = useMemo(() => {
    const maxDays = Math.max(daysInCurrentMonth, daysInPreviousMonth);
    const prevDailyMap = new Map<number, number>();
    const currDailyMap = new Map<number, number>();

    // Aggregate previous month expenses by day
    for (const tx of previousMonthTx) {
      if (tx.type === "EXPENSE") {
        const day = parseInt(tx.transactionDate.slice(8, 10), 10);
        const { amount } = getTransactionDisplayAmount(tx);
        prevDailyMap.set(day, (prevDailyMap.get(day) || 0) + amount);
      }
    }

    // Aggregate current month expenses by day
    for (const tx of currentMonthTx) {
      if (tx.type === "EXPENSE") {
        const day = parseInt(tx.transactionDate.slice(8, 10), 10);
        const { amount } = getTransactionDisplayAmount(tx);
        currDailyMap.set(day, (currDailyMap.get(day) || 0) + amount);
      }
    }

    const points = [];
    for (let day = 1; day <= maxDays; day++) {
      const prevAmount =
        day <= daysInPreviousMonth ? (prevDailyMap.get(day) || 0) : null;
      const currAmount =
        day <= currentDayOfMonth ? (currDailyMap.get(day) || 0) : null;

      points.push({
        day,
        previousMonth: prevAmount,
        currentMonth: currAmount,
      });
    }
    return points;
  }, [
    previousMonthTx,
    currentMonthTx,
    daysInCurrentMonth,
    daysInPreviousMonth,
    currentDayOfMonth,
  ]);

  return (
    <div className="min-h-screen bg-neutral-50/50 px-4 py-8 text-black sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <PageHeader
          title={`Welcome back, ${user?.name || "Partner"}`}
          subtitle="Manage your financial accounts, recent transactions, and spending categories."
          btn={
            <div className="flex items-center gap-2">
              <CustomBtn
                variant="primary"
                size="md"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => navigate("/transactions")}
              >
                Add Transaction
              </CustomBtn>
            </div>
          }
        />

        {/* 1. Overview Cards: Total Expenses, Total Income & Total Savings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Expenses Card */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Total Expenses
              </p>
              {isLoading ? (
                <Skeleton width={140} height={32} borderRadius={8} />
              ) : (
                <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tabular-nums">
                  {formatCurrency(totalExpenses, primaryCurrency)}
                </p>
              )}
              <p className="text-xs text-neutral-400">{currentMonthLabel}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 shadow-xs">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>

          {/* Total Income Card */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Total Income
              </p>
              {isLoading ? (
                <Skeleton width={140} height={32} borderRadius={8} />
              ) : (
                <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tabular-nums">
                  {formatCurrency(totalIncome, primaryCurrency)}
                </p>
              )}
              <p className="text-xs text-neutral-400">{currentMonthLabel}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Total Savings Card */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Total Savings
              </p>
              {isLoading ? (
                <Skeleton width={140} height={32} borderRadius={8} />
              ) : (
                <p
                  className={`text-2xl sm:text-3xl font-extrabold tabular-nums ${totalSavings < 0
                      ? "text-rose-600"
                      : totalSavings > 0
                        ? "text-emerald-600"
                        : "text-neutral-900"
                    }`}
                >
                  {formatCurrency(totalSavings, primaryCurrency)}
                </p>
              )}
              <p className="text-xs text-neutral-400">
                {isLoading ? (
                  <Skeleton width={80} height={14} borderRadius={4} />
                ) : totalIncome > 0 ? (
                  totalSavings >= 0 ? (
                    <span className="text-emerald-600 font-medium">
                      +{savingsRate}% savings rate
                    </span>
                  ) : (
                    <span className="text-rose-500 font-medium">
                      Spending exceeded income
                    </span>
                  )
                ) : (
                  currentMonthLabel
                )}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs ${totalSavings > 0
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : totalSavings < 0
                    ? "bg-rose-50 text-rose-600 border-rose-100"
                    : "bg-blue-50 text-blue-600 border-blue-100"
                }`}
            >
              <PiggyBank className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 2. Side-by-Side Graphs Section: Expenses by Category & Daily Expense Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Category Expense Bar Graph (Highest Expense on top with matching icon colors) */}
          <section className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    Expenses by Category
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {currentMonthLabel} · Ranked by highest spending
                  </p>
                </div>
                {!isLoading && categoryExpenses.length > 0 && (
                  <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200/60">
                    {categoryExpenses.length}{" "}
                    {categoryExpenses.length === 1 ? "category" : "categories"}
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="space-y-4 pt-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={`cat-skel-${idx}`} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <Skeleton width={36} height={36} borderRadius={10} />
                          <Skeleton width={120} height={16} borderRadius={4} />
                        </div>
                        <Skeleton width={80} height={16} borderRadius={4} />
                      </div>
                      <Skeleton width="100%" height={10} borderRadius={9999} />
                    </div>
                  ))}
                </div>
              ) : categoryExpenses.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 select-none">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-neutral-400">
                    <Tag className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-700">
                    No expenses this month
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    When you record expense transactions, your category breakdown will
                    appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-1 max-h-[350px] overflow-y-auto pr-1">
                  {categoryExpenses.map((item) => {
                    const iconOption = getCategoryIconOption(item.icon);
                    const IconComponent = iconOption?.Icon ?? Tag;
                    const percentage =
                      totalExpenses > 0
                        ? Math.round((item.amount / totalExpenses) * 100)
                        : 0;
                    const barWidth = Math.max(
                      3,
                      Math.round((item.amount / maxExpense) * 100),
                    );

                    return (
                      <div key={item.id} className="space-y-2 group">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Category Icon */}
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs transition-transform duration-200 group-hover:scale-105 ${
                                iconOption?.selectedColor ??
                                "bg-neutral-100 border-neutral-200"
                              }`}
                            >
                              <IconComponent
                                className={`w-4 h-4 ${
                                  iconOption?.color ?? "text-neutral-700"
                                }`}
                              />
                            </div>
                            <span className="font-semibold text-neutral-900 truncate">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 tabular-nums shrink-0">
                            <span className="font-bold text-neutral-900">
                              {formatCurrency(item.amount, primaryCurrency)}
                            </span>
                            <span className="text-xs font-medium text-neutral-400">
                              ({percentage}%)
                            </span>
                          </div>
                        </div>

                        {/* Horizontal Bar with matching icon color */}
                        <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${
                              iconOption?.barColor ?? "bg-neutral-900"
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Daily Expense Comparison Line Graph (Last Month vs Current Month) */}
          <section className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    Expense Comparison
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Daily spending trend · Dots on expense days
                  </p>
                </div>

                {/* Legend & Summary info */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <span className="w-3.5 h-0.5 border-b-2 border-dashed border-indigo-400 inline-block" />
                    <span>
                      {previousMonthLabel}:{" "}
                      <strong className="text-neutral-900">
                        {formatCurrency(totalPreviousExpenses, primaryCurrency)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-900">
                    <span className="w-3.5 h-0.5 bg-neutral-900 inline-block rounded-full" />
                    <span>
                      {currentMonthLabel}:{" "}
                      <strong className="text-black">
                        {formatCurrency(totalExpenses, primaryCurrency)}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="h-72 w-full flex items-center justify-center">
                  <Skeleton width="100%" height={260} borderRadius={16} />
                </div>
              ) : (
                <div className="h-72 sm:h-80 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailyComparisonData}
                      margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="day"
                        type="number"
                        domain={[1, 31]}
                        ticks={[1, 5, 10, 15, 20, 25, 30]}
                        tickLine={false}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        tickFormatter={(val) => `D${val}`}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        tickFormatter={(val) =>
                          val >= 1000
                            ? `${(val / 1000).toFixed(0)}k`
                            : String(val)
                        }
                      />
                      <Tooltip
                        content={
                          <ExpenseComparisonTooltip
                            currency={primaryCurrency}
                          />
                        }
                      />
                      {/* Compare Line (Last Month): Distinct Dashed Indigo Line */}
                      <Line
                        type="monotone"
                        dataKey="previousMonth"
                        name={previousMonthLabel}
                        stroke="#818cf8"
                        strokeWidth={2}
                        strokeDasharray="6 4"
                        dot={renderExpenseDot("#818cf8", "#eef2ff")}
                        activeDot={{
                          r: 6,
                          fill: "#818cf8",
                          stroke: "#ffffff",
                          strokeWidth: 2,
                        }}
                        connectNulls
                      />
                      {/* Current Month Line: Solid Bold Charcoal Line */}
                      <Line
                        type="monotone"
                        dataKey="currentMonth"
                        name={currentMonthLabel}
                        stroke="#09090b"
                        strokeWidth={2.5}
                        dot={renderExpenseDot("#09090b", "#ffffff")}
                        activeDot={{
                          r: 6,
                          fill: "#09090b",
                          stroke: "#ffffff",
                          strokeWidth: 2,
                        }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
