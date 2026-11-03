import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../../shared/components/saas/PageHeader";
import { CustomSelect } from "../../shared/components/CustomInput";
import transactionService, {
  TRANSACTION_TYPES,
  type Transaction,
  type TransactionType,
} from "../../shared/services/api/transactionService";
import holidayService, {
  type Holiday,
} from "../../shared/services/api/holidayService";
import { useAuth } from "../../shared/services/auth/useAuth";
import {
  getTransactionAmountStyle,
  isCancelledTransaction,
  TRANSACTION_TYPE_META,
} from "../../shared/utils/transaction";

const PAGE_SIZE = 100;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CURRENT_YEAR = new Date().getFullYear();
const TYPE_DOT_COLORS: Record<TransactionType, string> = {
  EXPENSE: "bg-red-500",
  INCOME: "bg-blue-500",
  TRANSFER: "bg-sky-500",
  LEND: "bg-amber-500",
  REPAYMENT: "bg-violet-500",
  ADJUSTMENT: "bg-neutral-500",
};

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTypeLabel = (type: TransactionType): string =>
  TRANSACTION_TYPE_META[type].label;

const Calendar = () => {
  const { user } = useAuth();
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [selectedType, setSelectedType] = useState<TransactionType | "">(
    "EXPENSE",
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [areHolidaysLoading, setAreHolidaysLoading] = useState(true);
  const countryCode = user?.countryCode ?? "";

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const monthStart = useMemo(() => new Date(year, monthIndex, 1), [year, monthIndex]);
  const monthEnd = useMemo(() => new Date(year, monthIndex + 1, 0), [year, monthIndex]);
  const fromDate = toDateKey(monthStart);
  const toDate = toDateKey(monthEnd);
  const monthLabel = month.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const canGoPrevMonth = (() => {
    const prevMonth = new Date(year, monthIndex - 1, 1);
    return prevMonth.getFullYear() === CURRENT_YEAR;
  })();

  const canGoNextMonth = (() => {
    const nextMonth = new Date(year, monthIndex + 1, 1);
    return nextMonth.getFullYear() === CURRENT_YEAR;
  })();

  useEffect(() => {
    let isMounted = true;

    const fetchMonthTransactions = async () => {
      setIsLoading(true);
      setTransactions([]);
      try {
        const filters = { fromDate, toDate };
        const firstPage = await transactionService.getTransactions(
          1,
          PAGE_SIZE,
          filters,
        );
        const remainingPages = await Promise.all(
          Array.from(
            { length: Math.max(0, firstPage.totalPages - 1) },
            (_, index) =>
              transactionService.getTransactions(index + 2, PAGE_SIZE, filters),
          ),
        );
        const allTransactions = [
          ...firstPage.transactions,
          ...remainingPages.flatMap((page) => page.transactions),
        ].filter((transaction) => !isCancelledTransaction(transaction));

        if (isMounted) setTransactions(allTransactions);
      } catch {
        if (isMounted) {
          setTransactions([]);
          toast.error("Failed to load calendar transactions");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMonthTransactions();
    return () => {
      isMounted = false;
    };
  }, [fromDate, toDate]);

  useEffect(() => {
    let isMounted = true;

    const fetchMonthHolidays = async () => {
      if (!countryCode) {
        setHolidays([]);
        setAreHolidaysLoading(false);
        return;
      }

      setAreHolidaysLoading(true);
      setHolidays([]);
      try {
        const monthHolidays = await holidayService.getHolidays(fromDate, toDate);
        if (isMounted) setHolidays(monthHolidays);
      } catch {
        if (isMounted) {
          setHolidays([]);
          toast.error("Failed to load calendar holidays");
        }
      } finally {
        if (isMounted) setAreHolidaysLoading(false);
      }
    };

    fetchMonthHolidays();
    return () => {
      isMounted = false;
    };
  }, [countryCode, fromDate, toDate]);

  const transactionsByDate = useMemo(() => {
    const grouped = new Map<string, Transaction[]>();
    for (const transaction of transactions) {
      const dateKey = transaction.transactionDate.slice(0, 10);
      const dayTransactions = grouped.get(dateKey) ?? [];
      dayTransactions.push(transaction);
      grouped.set(dateKey, dayTransactions);
    }
    return grouped;
  }, [transactions]);

  const visibleTransactionsByDate = useMemo(() => {
    const grouped = new Map<string, Transaction[]>();
    for (const [dateKey, dayTransactions] of transactionsByDate) {
      const visibleTransactions = selectedType
        ? dayTransactions.filter((transaction) => transaction.type === selectedType)
        : dayTransactions;
      if (visibleTransactions.length > 0) {
        grouped.set(dateKey, visibleTransactions);
      }
    }
    return grouped;
  }, [transactionsByDate, selectedType]);

  const holidaysByDate = useMemo(() => {
    const grouped = new Map<string, Holiday[]>();
    for (const holiday of holidays) {
      const dateKey = holiday.holidayDate.slice(0, 10);
      const dayHolidays = grouped.get(dateKey) ?? [];
      dayHolidays.push(holiday);
      grouped.set(dateKey, dayHolidays);
    }
    return grouped;
  }, [holidays]);

  const daysInMonth = monthEnd.getDate();
  const leadingDays = monthStart.getDay();
  const calendarCellCount = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
  const calendarCells = Array.from(
    { length: calendarCellCount },
    (_, index) =>
      index < leadingDays || index >= leadingDays + daysInMonth
        ? null
        : index - leadingDays + 1,
  );
  const selectedTransactions = visibleTransactionsByDate.get(selectedDate) ?? [];
  const selectedHolidays = holidaysByDate.get(selectedDate) ?? [];
  const legendTypes = Array.from(
    new Set(
      Array.from(visibleTransactionsByDate.values())
        .flat()
        .map((transaction) => transaction.type),
    ),
  );

  const changeMonth = (amount: number) => {
    const nextMonth = new Date(year, monthIndex + amount, 1);
    if (nextMonth.getFullYear() !== CURRENT_YEAR) return;
    setMonth(nextMonth);
    setSelectedDate(toDateKey(nextMonth));
  };

  const goToCurrentMonth = () => {
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setMonth(currentMonth);
    setSelectedDate(toDateKey(today));
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 px-4 py-8 text-black sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Calendar"
          subtitle="Browse your monthly transactions by date."
        />

        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
          <div className="flex flex-col gap-4 border-b border-neutral-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                disabled={!canGoPrevMonth}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 ${canGoPrevMonth
                    ? "hover:bg-neutral-100"
                    : "cursor-not-allowed opacity-40"
                  }`}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 px-1">
                <CalendarDays className="h-5 w-5 text-neutral-500" />
                <h2 className="text-lg font-semibold text-neutral-900">{monthLabel}</h2>
              </div>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                disabled={!canGoNextMonth}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 ${canGoNextMonth
                    ? "hover:bg-neutral-100"
                    : "cursor-not-allowed opacity-40"
                  }`}
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goToCurrentMonth}
                className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Today
              </button>
            </div>
            <div className="w-full sm:w-56">
              <CustomSelect
                label="Filter transactions"
                value={selectedType}
                onChange={(event) =>
                  setSelectedType(event.target.value as TransactionType | "")
                }
                className="h-10"
              >
                <option value="">All transaction types</option>
                {TRANSACTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {getTypeLabel(type)}
                  </option>
                ))}
              </CustomSelect>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-neutral-100 bg-neutral-50/70">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarCells.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`blank-${index}`}
                    className="min-h-20 border-b border-r border-neutral-100 bg-neutral-50/30 sm:min-h-28"
                    aria-hidden="true"
                  />
                );
              }

              const dateKey = toDateKey(new Date(year, monthIndex, day));
              const dayTransactions = visibleTransactionsByDate.get(dateKey) ?? [];
              const dayHolidays = holidaysByDate.get(dateKey) ?? [];
              const dayTypes = Array.from(
                new Set(dayTransactions.map((transaction) => transaction.type)),
              );
              const isSelected = selectedDate === dateKey;
              const isToday = toDateKey(new Date()) === dateKey;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDate(dateKey)}
                  title={[
                    dayHolidays.length > 0
                      ? `Holiday: ${dayHolidays.map((holiday) => holiday.name).join(", ")}`
                      : "",
                    dayTransactions.length > 0
                      ? `${dayTransactions.length} ${dayTransactions.length === 1 ? "transaction" : "transactions"}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                  aria-label={`${dateKey}${dayTransactions.length ? `, ${dayTransactions.length} ${dayTransactions.length === 1 ? "transaction" : "transactions"}` : ""}${dayHolidays.length ? `, holiday: ${dayHolidays.map((holiday) => holiday.name).join(", ")}` : ""}`}
                  aria-pressed={isSelected}
                  className={`min-h-20 border-b border-r border-neutral-100 p-1.5 text-left transition-colors hover:bg-neutral-50 sm:min-h-28 sm:p-3 ${isSelected ? "bg-blue-50/70 ring-1 ring-inset ring-blue-200" : "bg-white"
                    }`}
                >
                  <span
                    className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-sm ${isToday
                        ? "bg-black font-semibold text-white"
                        : isSelected
                          ? "font-semibold text-blue-700"
                          : "text-neutral-700"
                      }`}
                  >
                    {day}
                  </span>
                  {(dayTransactions.length > 0 || dayHolidays.length > 0) && (
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      {dayTypes.slice(0, 4).map((type) => (
                        <span
                          key={type}
                          className={`h-2 w-2 rounded-full ${TYPE_DOT_COLORS[type]}`}
                          title={getTypeLabel(type)}
                        />
                      ))}
                      {dayHolidays.map((holiday) => (
                        <span
                          key={holiday.id}
                          className="h-2 w-2 rounded-full bg-amber-500"
                          title={holiday.name}
                        />
                      ))}
                      <span className="ml-0.5 text-[10px] font-medium text-neutral-500 sm:text-xs">
                        {dayTransactions.length > 0 ? dayTransactions.length : null}
                      </span>
                    </div>
                  )}
                  {dayTransactions.length > 0 && (
                    <p
                      title={dayTransactions
                        .map((tx) => tx.description || getTypeLabel(tx.type))
                        .join(", ")}
                      className="mt-1 hidden truncate text-xs text-neutral-500 sm:block"
                    >
                      {dayTransactions.length === 1
                        ? dayTransactions[0]?.description || "Transaction"
                        : dayTransactions.length > 1
                          ? `${dayTransactions.length} transactions`
                          : null}
                    </p>
                  )}
                  {dayHolidays.length > 0 && (
                    <p
                      title={dayHolidays.map((holiday) => holiday.name).join(", ")}
                      className="hidden truncate text-xs font-medium text-amber-700 sm:block"
                    >
                      {dayHolidays.map((holiday) => holiday.name).join(", ")}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-neutral-100 px-4 py-3 sm:px-6">
            <>
              {legendTypes.map((type) => (
                <span key={type} className="inline-flex items-center gap-2 text-xs text-neutral-600">
                  <span className={`h-2.5 w-2.5 rounded-full ${TYPE_DOT_COLORS[type]}`} />
                  {getTypeLabel(type)}
                </span>
              ))}
              <span className="inline-flex items-center gap-2 text-xs text-neutral-600">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Festival or National Holiday
              </span>
              {legendTypes.length === 0 && holidays.length === 0 && !isLoading && !areHolidaysLoading && (
                <span className="text-xs text-neutral-500">
                  {countryCode
                    ? "No transactions or holidays for this month"
                    : "Choose a country to show public holidays"}
                </span>
              )}
            </>
          </div>
          <p className="border-t border-neutral-100 px-4 py-2 text-right text-xs text-neutral-500 sm:px-6">
            Holiday data from{" "}
            <a
              href="https://calendarific.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-neutral-700 underline underline-offset-2"
            >
              Calendarific
            </a>
            .
          </p>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold text-neutral-900">
                {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h2>
              <p className="mt-0.5 text-sm text-neutral-500">
                {isLoading
                  ? "Loading transactions…"
                  : `${selectedTransactions.length} ${selectedTransactions.length === 1 ? "transaction" : "transactions"}`}
              </p>
            </div>
          </div>
          {selectedHolidays.length > 0 && (
            <div className="border-b border-amber-100 bg-amber-50/70 px-5 py-3 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                {selectedHolidays.length === 1 ? "Holiday" : "Holidays"}
              </p>
              <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                {selectedHolidays.map((holiday) => (
                  <li key={holiday.id} className="text-sm font-medium text-amber-900">
                    {holiday.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {selectedTransactions.length > 0 ? (
            <ul className="divide-y divide-neutral-100">
              {selectedTransactions.map((transaction) => {
                const { formattedAmount, colorClass } = getTransactionAmountStyle(transaction);
                return (
                  <li
                    key={transaction.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${TYPE_DOT_COLORS[transaction.type]}`}
                      />
                      <div className="min-w-0">
                        <p
                          title={transaction.description || getTypeLabel(transaction.type)}
                          className="truncate text-sm font-medium text-neutral-900"
                        >
                          {transaction.description || getTypeLabel(transaction.type)}
                        </p>
                        <p
                          title={`${getTypeLabel(transaction.type)}${transaction.category ? ` · ${transaction.category.name}` : ""}`}
                          className="mt-0.5 truncate text-xs text-neutral-500"
                        >
                          {getTypeLabel(transaction.type)}
                          {transaction.category ? ` · ${transaction.category.name}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className={`shrink-0 text-sm font-semibold tabular-nums ${colorClass}`}>
                      {formattedAmount}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-neutral-500 sm:px-6">
              {isLoading
                ? "Loading transactions…"
                : selectedType
                  ? `No ${getTypeLabel(selectedType).toLowerCase()} transactions on this day.`
                  : "No transactions on this day."}
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Calendar;
