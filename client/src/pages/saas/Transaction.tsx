import { useState, useEffect, useCallback, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  XCircle,
  Filter,
  X,
  TrendingUp,
  TrendingDown,
  Download,
} from "lucide-react";
import PageHeader from "../../shared/components/saas/PageHeader";
import CustomInput, {
  CustomSelect,
  FieldLabel,
} from "../../shared/components/CustomInput";
import CustomBtn from "../../shared/components/CustomBtn";
import Table, { type TableColumn } from "../../shared/components/saas/Table";
import Pagination from "../../shared/components/saas/Pagination";
import Modal from "../../shared/components/saas/Modal";
import ExportConfirmModal from "../../shared/components/saas/ExportConfirmModal";
import transactionService, {
  TRANSACTION_TYPES,
  type Transaction as TxItem,
  type TransactionType,
  type TransactionFilters,
  type CreateTransactionPayload,
} from "../../shared/services/api/transactionService";
import accountService, {
  type Account,
} from "../../shared/services/api/accountService";
import categoryService, {
  type Category,
} from "../../shared/services/api/categoryService";
import {
  formatCurrency,
  formatNumberWithCommas,
  parseFormattedNumber,
  getApiErrorMessage,
  formatDate,
  getTodayIsoDate,
  MAX_TEXT_LENGTH,
  MAX_ACCOUNT_BALANCE,
} from "../../shared/utils/validation";
import {
  TRANSACTION_TYPE_META,
  typeNeedsCategory,
  typeNeedsSecondAccount,
  buildTransactionEntries,
  getTransactionDisplayAmount,
  isCancelledTransaction,
} from "../../shared/utils/transaction";

// ── Main Component ─────────────────────────────────────────────────────────────

export const Transaction = () => {
  // ── List state
  const [transactions, setTransactions] = useState<TxItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TransactionFilters>({});

  // ── Reference data
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refLoading, setRefLoading] = useState(true);

  // ── Add Transaction Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // ── Form state
  const [txType, setTxType] = useState<TransactionType>("EXPENSE");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(getTodayIsoDate());
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Form errors
  const [descError, setDescError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [accountError, setAccountError] = useState("");
  const [toAccountError, setToAccountError] = useState("");
  const [refError, setRefError] = useState("");
  const [notesError, setNotesError] = useState("");

  // ── Cancel / Delete Modal
  const [txToCancel, setTxToCancel] = useState<TxItem | null>(null);
  const [txToDelete, setTxToDelete] = useState<TxItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Export
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // ── Filter panel
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterAccountId, setFilterAccountId] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  // ── Fetch Transactions
  const fetchTransactions = useCallback(
    async (targetPage = page, activeFilters = filters) => {
      setIsLoading(true);
      try {
        const data = await transactionService.getTransactions(
          targetPage,
          limit,
          activeFilters,
        );
        setTransactions(data.transactions);
        setTotal(data.total);
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to load transactions"));
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, filters],
  );

  // ── Fetch reference data (accounts + categories) once on mount
  const fetchReferenceData = useCallback(async () => {
    setRefLoading(true);
    try {
      const [accs, cats] = await Promise.all([
        accountService.getAccounts(1, 100),
        categoryService.getCategories(),
      ]);
      const activeAccs = accs.accounts.filter((a) => a.isActive);
      setAccounts(activeAccs);
      setCategories(cats);
      if (activeAccs.length > 0)
        setAccountId((prev) => prev || activeAccs[0].id);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Failed to load accounts / categories"),
      );
    } finally {
      setRefLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);
  useEffect(() => {
    fetchTransactions(page);
  }, [fetchTransactions, page]);

  // ── Reset form to defaults
  const resetForm = () => {
    setTxType("EXPENSE");
    setDescription("");
    setTransactionDate(getTodayIsoDate());
    setAccountId(accounts[0]?.id ?? "");
    setToAccountId("");
    setCategoryId("");
    setAmount("");
    setReference("");
    setNotes("");
    setDescError("");
    setAmountError("");
    setAccountError("");
    setToAccountError("");
    setRefError("");
    setNotesError("");
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  // ── Type change: clear dependent fields
  const handleTypeChange = (t: TransactionType) => {
    setTxType(t);
    setToAccountId("");
    setCategoryId("");
    setAmountError("");
    setToAccountError("");
  };

  // ── Amount Change (clamped to 1 billion, formats with commas)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/,/g, "");
    const pattern = txType === "ADJUSTMENT" ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;
    if (pattern.test(rawVal)) {
      if (
        rawVal === "" ||
        rawVal === "-" ||
        rawVal === "." ||
        rawVal === "-."
      ) {
        setAmount(rawVal);
        if (amountError) setAmountError("");
        return;
      }

      const num = parseFormattedNumber(rawVal);
      if (Math.abs(num) >= MAX_ACCOUNT_BALANCE) {
        const clamped = num < 0 ? -MAX_ACCOUNT_BALANCE : MAX_ACCOUNT_BALANCE;
        setAmount(formatNumberWithCommas(clamped));
        setAmountError("Amount limit reached");
        return;
      }

      setAmount(formatNumberWithCommas(rawVal));
      if (amountError) setAmountError("");
    }
  };

  // ── Form Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    let hasError = false;

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      setDescError("Description is required");
      hasError = true;
    } else if (trimmedDesc.length > MAX_TEXT_LENGTH) {
      setDescError("Character limit reached");
      hasError = true;
    } else {
      setDescError("");
    }

    const numAmount = parseFormattedNumber(amount);
    if (!amount || isNaN(numAmount) || numAmount === 0) {
      setAmountError("Please enter a valid non-zero amount");
      hasError = true;
    } else if (Math.abs(numAmount) > MAX_ACCOUNT_BALANCE) {
      setAmountError("Amount limit reached");
      hasError = true;
    } else {
      setAmountError("");
    }

    if (!accountId) {
      setAccountError(
        typeNeedsSecondAccount(txType)
          ? "Select source account"
          : "Select account",
      );
      hasError = true;
    } else {
      setAccountError("");
    }

    if (typeNeedsSecondAccount(txType)) {
      if (!toAccountId) {
        setToAccountError("Select destination account");
        hasError = true;
      } else if (toAccountId === accountId) {
        setToAccountError("Source and destination must be different");
        hasError = true;
      } else {
        setToAccountError("");
      }
    } else {
      setToAccountError("");
    }

    if (reference.trim().length > MAX_TEXT_LENGTH) {
      setRefError("Character limit reached");
      hasError = true;
    } else {
      setRefError("");
    }

    if (notes.trim().length > MAX_TEXT_LENGTH) {
      setNotesError("Character limit reached");
      hasError = true;
    } else {
      setNotesError("");
    }

    if (hasError) return;

    setIsSubmitting(true);
    try {
      const entries = buildTransactionEntries(
        txType,
        accountId,
        numAmount,
        toAccountId,
      );
      const payload: CreateTransactionPayload = {
        type: txType,
        description: description.trim(),
        transactionDate,
        entries,
        categoryId: categoryId || null,
        reference: reference.trim() || null,
        notes: notes.trim() || null,
      };
      await transactionService.createTransaction(payload);
      toast.success("Transaction added successfully");
      closeAddModal();
      await Promise.all([fetchTransactions(1), fetchReferenceData()]);
      setPage(1);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to add transaction"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Cancel Transaction (creates server-side reversal)
  const handleConfirmCancel = async () => {
    if (!txToCancel) return;
    setIsCancelling(true);
    try {
      await transactionService.cancelTransaction(txToCancel.id);
      toast.success("Transaction cancelled and reversal created");
      setTxToCancel(null);
      await Promise.all([fetchTransactions(page), fetchReferenceData()]);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to cancel transaction"));
    } finally {
      setIsCancelling(false);
    }
  };

  // ── Delete Transaction
  const handleConfirmDelete = async () => {
    if (!txToDelete) return;
    setIsDeleting(true);
    try {
      await transactionService.deleteTransaction(txToDelete.id);
      toast.success("Transaction deleted");
      setTxToDelete(null);
      await Promise.all([fetchTransactions(page), fetchReferenceData()]);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete transaction"));
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Filter handlers
  const handleApplyFilters = () => {
    const newFilters: TransactionFilters = {
      type: filterType ? (filterType as TransactionType) : undefined,
      accountId: filterAccountId || undefined,
      categoryId: filterCategoryId || undefined,
      fromDate: filterFromDate || undefined,
      toDate: filterToDate || undefined,
    };
    setFilters(newFilters);
    setPage(1);
    fetchTransactions(1, newFilters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilterType("");
    setFilterAccountId("");
    setFilterCategoryId("");
    setFilterFromDate("");
    setFilterToDate("");
    setFilters({});
    setPage(1);
    fetchTransactions(1, {});
    setIsFilterOpen(false);
  };

  const hasActiveFilters = Boolean(
    filters.type ||
    filters.accountId ||
    filters.categoryId ||
    filters.fromDate ||
    filters.toDate,
  );

  // ── Open export confirmation modal (or warn if nothing to export)
  const handleExport = () => {
    if (total === 0) {
      toast("There is nothing to export — no transactions match the current view.", {
        icon: "📭",
        duration: 4000,
      });
      return;
    }
    setIsExportModalOpen(true);
  };

  // ── Actual download after user confirms
  const handleConfirmExport = async () => {
    setIsExporting(true);
    try {
      await transactionService.exportTransactions(filters);
      setIsExportModalOpen(false);
      toast.success("Transactions exported successfully");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to export transactions"));
    } finally {
      setIsExporting(false);
    }
  };

  // ── Derived data for selects
  const filteredCategories = categories.filter((c) =>
    txType === "INCOME"
      ? c.type === "INCOME"
      : txType === "EXPENSE"
        ? c.type === "EXPENSE"
        : false,
  );
  const toAccountOptions = accounts.filter((a) => a.id !== accountId);

  // ── Table Columns
  const columns: TableColumn<TxItem>[] = [
    {
      header: "Date",
      accessor: "transactionDate",
      render: (tx) => (
        <span className="text-xs text-neutral-500 tabular-nums whitespace-nowrap">
          {formatDate(tx.transactionDate)}
        </span>
      ),
    },
    {
      header: "Description",
      accessor: "description",
      render: (tx) => (
        <div className="min-w-[160px]">
          <p className="font-semibold text-neutral-900 truncate max-w-[240px]">
            {tx.description}
          </p>
          {tx.reference && (
            <p className="text-xs text-neutral-400 truncate max-w-[240px]">
              Ref: {tx.reference}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      render: (tx) => {
        const meta = TRANSACTION_TYPE_META[tx.type];
        const Icon = meta.icon;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${meta.bg} ${meta.color}`}
          >
            <Icon className="w-3 h-3" />
            {meta.label}
          </span>
        );
      },
    },
    {
      header: "Category",
      accessor: "category",
      render: (tx) =>
        tx.category ? (
          <span className="text-xs text-neutral-600 font-medium">
            {tx.category.name}
          </span>
        ) : (
          <span className="text-xs text-neutral-300">—</span>
        ),
    },
    {
      header: "Accounts",
      render: (tx) => (
        <div className="text-xs text-neutral-600 space-y-0.5 min-w-[120px]">
          {tx.entries.map((e) => (
            <div key={e.id} className="flex items-center gap-1">
              {Number(e.amount) >= 0 ? (
                <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 shrink-0" />
              )}
              <span className="truncate max-w-[110px]">
                {e.account?.name ?? e.accountId}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      header: "Amount",
      accessor: "entries",
      align: "right",
      render: (tx) => {
        const { amount: amt, currency } = getTransactionDisplayAmount(tx);
        const isIncome = tx.type === "INCOME";
        const isExpense = tx.type === "EXPENSE";
        return (
          <span
            className={`font-semibold tabular-nums text-sm ${isIncome
                ? "text-emerald-700"
                : isExpense
                  ? "text-red-700"
                  : "text-neutral-900"
              }`}
          >
            {isExpense ? "−" : isIncome ? "+" : ""}
            {formatCurrency(amt, currency)}
          </span>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      render: (tx) => {
        const cancelled = isCancelledTransaction(tx);
        return (
          <div className="flex items-center justify-end gap-1">
            {!cancelled && (
              <button
                type="button"
                onClick={() => setTxToCancel(tx)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                title="Cancel transaction (creates reversal)"
                aria-label="Cancel transaction"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setTxToDelete(tx)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete transaction"
              aria-label="Delete transaction"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50 text-black py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Transactions"
        subtitle="Record and track your financial transactions across all accounts."
        btn={
          <>
            <CustomBtn
              variant="secondary"
              size="md"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExport}
              isLoading={isExporting}
              disabled={isExporting}
            >
              Export
            </CustomBtn>
            <CustomBtn
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={openAddModal}
              disabled={refLoading}
            >
              Add Transaction
            </CustomBtn>
          </>
        }
      />

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`inline-flex items-center gap-2 h-9 px-4 rounded-full text-sm font-medium border transition-colors cursor-pointer ${hasActiveFilters
              ? "bg-black text-white border-black"
              : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100"
            }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-white text-black leading-none">
              {[
                filters.type,
                filters.accountId,
                filters.categoryId,
                filters.fromDate,
                filters.toDate,
              ].filter(Boolean).length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Clear filters
          </button>
        )}

        <span className="ml-auto text-xs font-medium text-neutral-500">
          {total} {total === 1 ? "transaction" : "transactions"} total
        </span>
      </div>

      {/* Inline Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">
              Transactions Filter
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
              >
                Reset all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <CustomSelect
              label="Transaction Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              {TRANSACTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TRANSACTION_TYPE_META[t].label}
                </option>
              ))}
            </CustomSelect>

            <CustomSelect
              label="Account"
              value={filterAccountId}
              onChange={(e) => setFilterAccountId(e.target.value)}
            >
              <option value="">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </option>
              ))}
            </CustomSelect>

            <CustomSelect
              label="Category"
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </CustomSelect>

            <CustomInput
              label="From Date"
              type="date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
            />

            <CustomInput
              label="To Date"
              type="date"
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <CustomBtn
              variant="secondary"
              size="sm"
              onClick={() => setIsFilterOpen(false)}
            >
              Cancel
            </CustomBtn>
            <CustomBtn variant="primary" size="sm" onClick={handleApplyFilters}>
              Apply Filters
            </CustomBtn>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="space-y-4">
        <Table
          columns={columns}
          data={transactions}
          isLoading={isLoading}
          emptyMessage="No transactions found. Click 'Add Transaction' to record your first transaction."
        />

        {total > limit && (
          <Pagination
            currentPage={page}
            total={total}
            limit={limit}
            currentCount={transactions.length}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* ── Add Transaction Modal ── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title="Add Transaction"
        className="max-w-3xl w-full"
      >
        <form noValidate onSubmit={handleSubmit} className="space-y-5 mt-1">
          {/* 1. Transaction Type selector (at the top, single line on desktop) */}
          <div>
            <FieldLabel
              label="Transaction Type"
              required
              className="mb-2 block"
            />
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {TRANSACTION_TYPES.map((t) => {
                const meta = TRANSACTION_TYPE_META[t];
                const Icon = meta.icon;
                const isActive = txType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeChange(t)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${isActive
                        ? `${meta.bg} ${meta.color} border-current ring-2 ring-offset-1 ring-current/30 shadow-xs font-semibold`
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Transaction Date & Account(s) */}
          <div
            className={`grid grid-cols-1 ${typeNeedsSecondAccount(txType)
                ? "sm:grid-cols-3"
                : "sm:grid-cols-2"
              } gap-4`}
          >
            <CustomInput
              label="Transaction Date"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
            />

            <CustomSelect
              label={
                typeNeedsSecondAccount(txType) ? "From Account" : "Account"
              }
              value={accountId}
              onChange={(e) => {
                setAccountId(e.target.value);
                if (accountError) setAccountError("");
              }}
              error={accountError}
              required
            >
              <option value="" disabled>
                Select account
              </option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </option>
              ))}
            </CustomSelect>

            {typeNeedsSecondAccount(txType) && (
              <CustomSelect
                label="To Account"
                value={toAccountId}
                onChange={(e) => {
                  setToAccountId(e.target.value);
                  if (toAccountError) setToAccountError("");
                }}
                error={toAccountError}
                required
              >
                <option value="" disabled>
                  Select destination
                </option>
                {toAccountOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.currency})
                  </option>
                ))}
              </CustomSelect>
            )}
          </div>

          {/* 3. Amount & Category (if applicable) */}
          {typeNeedsCategory(txType) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomInput
                label={
                  txType === "EXPENSE"
                    ? "Amount (will be deducted)"
                    : "Amount received"
                }
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                error={amountError}
                required
              />

              <CustomSelect
                label="Category (optional)"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">No category</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </CustomSelect>
            </div>
          ) : (
            <CustomInput
              label={
                txType === "ADJUSTMENT"
                  ? "Amount (use − for decrease, + for increase)"
                  : "Transfer Amount"
              }
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              error={amountError}
              required
            />
          )}

          {/* 4. Description */}
          <CustomInput
            label="Description"
            placeholder="e.g. Grocery shopping"
            maxLength={MAX_TEXT_LENGTH}
            value={description}
            onChange={(e) => {
              const val = e.target.value;
              setDescription(val);
              if (val.length >= MAX_TEXT_LENGTH) {
                setDescError("Character limit reached");
              } else if (descError) {
                setDescError("");
              }
            }}
            error={descError}
            required
          />

          {/* 5. Reference + Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomInput
              label="Reference (optional)"
              placeholder="e.g. INV-2025-001"
              maxLength={MAX_TEXT_LENGTH}
              value={reference}
              onChange={(e) => {
                const val = e.target.value;
                setReference(val);
                if (val.length >= MAX_TEXT_LENGTH) {
                  setRefError("Character limit reached");
                } else if (refError) {
                  setRefError("");
                }
              }}
              error={refError}
            />
            <CustomInput
              label="Notes (optional)"
              placeholder="Additional notes..."
              maxLength={MAX_TEXT_LENGTH}
              value={notes}
              onChange={(e) => {
                const val = e.target.value;
                setNotes(val);
                if (val.length >= MAX_TEXT_LENGTH) {
                  setNotesError("Character limit reached");
                } else if (notesError) {
                  setNotesError("");
                }
              }}
              error={notesError}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
            <CustomBtn
              type="button"
              variant="secondary"
              size="md"
              onClick={closeAddModal}
              disabled={isSubmitting}
            >
              Cancel
            </CustomBtn>
            <CustomBtn
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="px-6"
            >
              Add Transaction
            </CustomBtn>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!txToCancel}
        onClose={() => setTxToCancel(null)}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
        type="confirm"
        title="Cancel Transaction?"
        message={`This will create an offsetting reversal entry to undo "${txToCancel?.description}". The original transaction will be marked as [CANCELLED]. This cannot itself be undone.`}
        confirmText="Yes, Cancel It"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        type="danger"
        title="Delete Transaction"
        message={`Are you sure you want to permanently delete "${txToDelete?.description}"? This action cannot be undone.`}
        confirmText="Delete"
      />
      {/* ── Export Confirmation Modal ── */}
      <ExportConfirmModal
        isOpen={isExportModalOpen}
        filters={filters}
        accounts={accounts}
        categories={categories}
        total={total}
        isExporting={isExporting}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleConfirmExport}
      />
    </div>
  );
};

export default Transaction;
