import { useState, useEffect, useCallback, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import PageHeader from "../../shared/components/saas/PageHeader";
import CustomInput, { CustomSelect } from "../../shared/components/CustomInput";
import CustomBtn from "../../shared/components/CustomBtn";
import Table, { type TableColumn } from "../../shared/components/saas/Table";
import Pagination from "../../shared/components/saas/Pagination";
import Modal from "../../shared/components/saas/Modal";
import accountService, {
  ACCOUNT_TYPES,
  SUPPORTED_CURRENCIES,
  type Account as AccountItem,
  type AccountType,
  type SupportedCurrency,
} from "../../shared/services/api/accountService";
import {
  validateAccountName,
  validateOpeningBalance,
  formatNumberWithCommas,
  parseFormattedNumber,
  formatCurrency,
  getApiErrorMessage,
  ACCOUNT_NAME_MAX_LENGTH,
  MAX_ACCOUNT_BALANCE,
} from "../../shared/utils/validation";

export const Account = () => {
  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>(ACCOUNT_TYPES[0]);
  const [currency, setCurrency] = useState<SupportedCurrency>("INR");
  const [openingBalance, setOpeningBalance] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState("");
  const [balanceError, setBalanceError] = useState("");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Edit & Delete State
  const [editingAccount, setEditingAccount] = useState<AccountItem | null>(
    null,
  );
  const [accountToDelete, setAccountToDelete] = useState<AccountItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Table & Pagination State
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Accounts from API
  const fetchAccounts = useCallback(
    async (targetPage = page) => {
      setIsLoading(true);
      try {
        const data = await accountService.getAccounts(targetPage, limit);
        setAccounts(data.accounts);
        setTotal(data.total);
      } catch {
        toast.error("Failed to load accounts");
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit],
  );

  // Initial load & page change
  useEffect(() => {
    fetchAccounts(page);
  }, [fetchAccounts, page]);

  // Populate inputs when user clicks Update
  const handleStartEdit = (account: AccountItem) => {
    setEditingAccount(account);
    setName(account.name);
    setType(account.type as AccountType);
    setCurrency(account.currency as SupportedCurrency);
    setOpeningBalance(formatNumberWithCommas(account.openingBalance ?? 0));
    setNameError(
      account.name.length >= ACCOUNT_NAME_MAX_LENGTH
        ? "Character limit reached"
        : "",
    );
    setBalanceError("");
    setIsAccountModalOpen(true);
  };

  // Clear all input fields and reset form
  const handleClear = () => {
    setName("");
    setOpeningBalance("");
    setType(ACCOUNT_TYPES[0]);
    setCurrency("INR");
    setNameError("");
    setBalanceError("");
  };

  // Cancel edit mode and reset form
  const handleCancelEdit = () => {
    setIsAccountModalOpen(false);
    setEditingAccount(null);
    handleClear();
  };

  const openCreateModal = () => {
    handleCancelEdit();
    setIsAccountModalOpen(true);
  };

  // Handle Create or Update Submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nError = validateAccountName(name);
    const bError = editingAccount ? "" : validateOpeningBalance(openingBalance);

    if (nError || bError) {
      setNameError(nError || "");
      setBalanceError(bError || "");
      return;
    }

    setNameError("");
    setBalanceError("");
    setIsSubmitting(true);

    try {
      if (editingAccount) {
        await accountService.updateAccount(editingAccount.id, {
          name: name.trim(),
          currency,
        });

        toast.success("Account updated successfully");
        handleCancelEdit();
        await fetchAccounts(page);
      } else {
        await accountService.createAccount({
          name: name.trim(),
          type,
          currency,
          openingBalance: parseFormattedNumber(openingBalance),
        });

        toast.success("Account created successfully");
        handleCancelEdit();

        await fetchAccounts(1);
        setPage(1);
      }
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, editingAccount ? "Failed to update account" : "Failed to create account")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;
    setIsDeleting(true);

    try {
      await accountService.deleteAccount(accountToDelete.id);
      toast.success("Account deleted successfully");

      if (editingAccount?.id === accountToDelete.id) {
        handleCancelEdit();
      }

      setAccountToDelete(null);
      await fetchAccounts(page);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to delete account"));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: TableColumn<AccountItem>[] = [
    {
      header: "Account Name",
      accessor: "name",
      render: (acc) => (
        <span className="font-semibold text-neutral-900">{acc.name}</span>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      render: (acc) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
          {acc.type}
        </span>
      ),
    },
    {
      header: "Currency",
      accessor: "currency",
      render: (acc) => (
        <span className="text-xs font-semibold text-neutral-500 uppercase">
          {acc.currency}
        </span>
      ),
    },
    {
      header: "Current Balance",
      accessor: "currentBalance",
      align: "right",
      render: (acc) => (
        <span className="font-semibold text-neutral-900 tabular-nums">
          {formatCurrency(
            acc.currentBalance ?? acc.openingBalance ?? 0,
            acc.currency,
          )}
        </span>
      ),
    },
    {
      header: "Opening Balance",
      accessor: "openingBalance",
      align: "right",
      render: (acc) => (
        <span className="font-medium text-neutral-700 tabular-nums">
          {formatCurrency(acc.openingBalance ?? 0, acc.currency)}
        </span>
      ),
    },
    {
      header: "Created Date",
      accessor: "createdAt",
      align: "right",
      render: (acc) => (
        <span className="text-xs text-neutral-500 tabular-nums">
          {new Date(acc.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Action",
      align: "right",
      render: (acc) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => handleStartEdit(acc)}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-500 hover:bg-amber-50 active:text-amber-600 transition-colors cursor-pointer"
            title="Update account"
            aria-label="Update account"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setAccountToDelete(acc)}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Delete account"
            aria-label="Delete account"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50 text-black py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Accounts"
        subtitle="Create and manage your bank, cash, and financial accounts."
        btn={
          <CustomBtn
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Add Account
          </CustomBtn>
        }
      />

      {/* Accounts Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900">
            Your Accounts
          </h2>
          <span className="text-xs font-medium text-neutral-500">
            {total} {total === 1 ? "account" : "accounts"} total
          </span>
        </div>

        <Table
          columns={columns}
          data={accounts}
          isLoading={isLoading}
          emptyMessage="No accounts found. Click 'Add Account' to create your first account."
        />

        {total > limit && (
          <Pagination
            currentPage={page}
            total={total}
            limit={limit}
            currentCount={accounts.length}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Create / Update Account Modal */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={handleCancelEdit}
        title={editingAccount ? "Update Account" : "Create Account"}
        titleVariant="header"
        className="max-w-2xl w-full"
      >
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Account Name */}
            <CustomInput
              label="Account Name"
              placeholder="e.g. HDFC Salary, Wallet"
              maxLength={ACCOUNT_NAME_MAX_LENGTH}
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                setName(val);
                if (val.length >= ACCOUNT_NAME_MAX_LENGTH) {
                  setNameError("Character limit reached");
                } else if (nameError) {
                  setNameError("");
                }
              }}
              error={nameError}
              required
            />

            {/* Account Type Dropdown */}
            <CustomSelect
              label="Account Type"
              value={type}
              disabled={!!editingAccount}
              onChange={(e) => setType(e.target.value as AccountType)}
              options={ACCOUNT_TYPES}
            />

            <CustomSelect
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
              options={SUPPORTED_CURRENCIES}
            />

            {/* Opening Balance */}
            <div>
              <CustomInput
                label="Opening Balance"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={openingBalance}
                disabled={!!editingAccount}
                onChange={(e) => {
                  const rawVal = e.target.value.replace(/,/g, "");
                  if (/^-?\d*\.?\d*$/.test(rawVal)) {
                    if (
                      rawVal === "" ||
                      rawVal === "-" ||
                      rawVal === "." ||
                      rawVal === "-."
                    ) {
                      setOpeningBalance(rawVal);
                      if (balanceError) setBalanceError("");
                      return;
                    }

                    const num = parseFormattedNumber(rawVal);
                    if (Math.abs(num) >= MAX_ACCOUNT_BALANCE) {
                      const clamped =
                        num < 0 ? -MAX_ACCOUNT_BALANCE : MAX_ACCOUNT_BALANCE;
                      setOpeningBalance(formatNumberWithCommas(clamped));
                      setBalanceError("Amount limit reached");
                    } else {
                      setOpeningBalance(formatNumberWithCommas(rawVal));
                      if (balanceError) setBalanceError("");
                    }
                  }
                }}
                error={balanceError}
              />
              {editingAccount && (
                <p className="mt-1.5 text-xs text-red-600 leading-tight">
                  Changing the opening balance can silently alter historical
                  balances.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
            <CustomBtn
              type="button"
              variant="secondary"
              size="md"
              onClick={handleCancelEdit}
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
              {editingAccount ? "Update Account" : "Create Account"}
            </CustomBtn>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!accountToDelete}
        onClose={() => setAccountToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        type="danger"
        title="Delete Account"
        message={`Are you sure you want to delete "${accountToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Account;