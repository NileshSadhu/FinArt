export interface PaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  [key: string]: unknown;
}

/**
 * Extracts and sanitizes pagination parameters (page, limit, skip) from query params.
 */
export function parsePagination(
  query: Record<string, unknown>,
  options: PaginationOptions = {},
): PaginationResult {
  const defaultLimit = options.defaultLimit ?? 10;
  const maxLimit = options.maxLimit ?? 100;

  const rawPage = typeof query.page === "string" ? parseInt(query.page, 10) : 1;
  const rawLimit =
    typeof query.limit === "string" ? parseInt(query.limit, 10) : defaultLimit;

  const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
  const limit = Math.min(
    maxLimit,
    Math.max(1, isNaN(rawLimit) ? defaultLimit : rawLimit),
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Builds a standardized paginated response payload.
 */
export function buildPaginatedPayload<T, K extends string>(
  key: K,
  items: T[],
  total: number,
  page: number,
  limit: number,
): Record<K, T[]> & { total: number; page: number; limit: number; totalPages: number } {
  return {
    [key]: items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  } as Record<K, T[]> & {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
