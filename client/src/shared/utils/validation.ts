export const ACCOUNT_NAME_MAX_LENGTH = 100;
export const MAX_TEXT_LENGTH = 100;
export const MAX_ACCOUNT_BALANCE = 1_000_000_000; // 1 Billion
export const MAX_TRANSACTION_AMOUNT = 1_000_000_000;
export const MIN_ACCOUNT_BALANCE = -1_000_000_000;

export const validateAccountName = (name: string): string | null => {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Account name is required";
  }
  if (trimmed.length > ACCOUNT_NAME_MAX_LENGTH) {
    return "Character limit reached";
  }
  return null;
};

export const validateTextLength = (
  value: string,
  maxLength = MAX_TEXT_LENGTH,
): string | null => {
  if (value && value.trim().length > maxLength) {
    return "Character limit reached";
  }
  return null;
};

export const validateOpeningBalance = (
  value: string | number,
): string | null => {
  const num = typeof value === "number" ? value : parseFormattedNumber(value);
  if (isNaN(num)) {
    return "Please enter a valid numeric balance";
  }
  if (num > MAX_ACCOUNT_BALANCE || num < MIN_ACCOUNT_BALANCE) {
    return "Amount limit reached";
  }
  return null;
};

export const validateAmount = (value: string | number): string | null => {
  const num = typeof value === "number" ? value : parseFormattedNumber(value);
  if (isNaN(num) || num === 0) {
    return "Please enter a valid non-zero amount";
  }
  if (Math.abs(num) > MAX_ACCOUNT_BALANCE) {
    return "Amount limit reached";
  }
  return null;
};

export const formatNumberWithCommas = (value: string | number): string => {
  if (value === "" || value === null || value === undefined) return "";
  const str = String(value).replace(/,/g, "");
  if (str === "-" || str === ".") return str;

  const isNegative = str.startsWith("-");
  const cleanStr = isNegative ? str.slice(1) : str;

  // Allow only digits and at most one decimal point
  const parts = cleanStr.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const formatted =
    parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : parts[0];
  return isNegative ? `-${formatted}` : formatted;
};

export const parseFormattedNumber = (value: string | number): number => {
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/,/g, "").trim();
  return cleaned === "" ? 0 : Number(cleaned);
};

export const formatCurrency = (
  amount: number,
  currency: string = "INR",
): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${formatNumberWithCommas(Number(amount).toFixed(2))}`;
  }
};

export const getApiErrorMessage = (
  err: unknown,
  fallback = "Something went wrong",
): string =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? fallback;

export const formatDate = (dateStr: string | Date): string =>
  new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const getTodayIsoDate = (): string =>
  new Date().toISOString().substring(0, 10);
