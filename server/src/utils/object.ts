/**
 * Strips properties with `undefined` values from an object.
 * Useful when working with exactOptionalPropertyTypes in TypeScript/Prisma.
 */
export function stripUndefined<T extends Record<string, any>>(
  obj: T,
): { [K in keyof T as T[K] extends undefined ? never : K]: Exclude<T[K], undefined> } {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as any;
}
