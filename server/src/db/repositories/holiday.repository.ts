import { prisma } from "../client.js";
import { getPublicHolidays } from "../../utils/holidayProvider.js";
import { ApiError } from "../../utils/ApiError.js";

const inFlightSyncs = new Map<string, Promise<void>>();
export const HOLIDAY_CACHE_REFRESH_MS = 27 * 24 * 60 * 60 * 1000;
export const HOLIDAY_CACHE_RETENTION_MS = 29 * 24 * 60 * 60 * 1000;

export function isHolidayCacheFresh(
  syncedAt: Date,
  now = Date.now(),
): boolean {
  return now - syncedAt.getTime() < HOLIDAY_CACHE_REFRESH_MS;
}

export function getHolidayCacheExpiryCutoff(
  now = Date.now(),
): Date {
  return new Date(now - HOLIDAY_CACHE_RETENTION_MS);
}

function getYearRange(year: number) {
  return {
    gte: new Date(Date.UTC(year, 0, 1)),
    lt: new Date(Date.UTC(year + 1, 0, 1)),
  };
}

export const holidayRepository = {
  findForCountryInRange(
    countryCode: string,
    fromDate: Date,
    toDate: Date,
  ) {
    return prisma.holiday.findMany({
      where: {
        countryCode,
        holidayDate: { gte: fromDate, lte: toDate },
      },
      orderBy: [{ holidayDate: "asc" }, { name: "asc" }],
    });
  },

  async ensureCountryYearCached(countryCode: string, year: number) {
    const currentYear = new Date().getFullYear();
    if (year !== currentYear) {
      throw new ApiError(
        400,
        `Holidays are only available for the current year (${currentYear})`,
      );
    }

    const key = `${countryCode}:${year}`;
    const existingSync = await prisma.holidayYearSync.findUnique({
      where: { countryCode_year: { countryCode, year } },
    });
    if (existingSync && isHolidayCacheFresh(existingSync.syncedAt)) {
      return;
    }

    let syncPromise = inFlightSyncs.get(key);
    if (!syncPromise) {
      syncPromise = (async () => {
        const shouldRefresh = await prisma.$transaction(async (tx) => {
          const latestSync = await tx.holidayYearSync.findUnique({
            where: { countryCode_year: { countryCode, year } },
          });
          if (latestSync && isHolidayCacheFresh(latestSync.syncedAt)) {
            return false;
          }
          if (latestSync) {
            await tx.holiday.deleteMany({
              where: {
                countryCode,
                holidayDate: getYearRange(year),
              },
            });
            await tx.holidayYearSync.deleteMany({
              where: { countryCode, year },
            });
          }
          return true;
        });
        if (!shouldRefresh) {
          return;
        }

        const apiHolidays = await getPublicHolidays(countryCode, year);
        const holidays = apiHolidays.map((holiday) => ({
          holidayDate: new Date(`${holiday.date}T00:00:00.000Z`),
          name: holiday.name,
          countryCode,
        }));

        await prisma.$transaction(async (tx) => {
          const cachedSync = await tx.holidayYearSync.findUnique({
            where: { countryCode_year: { countryCode, year } },
          });
          if (cachedSync && isHolidayCacheFresh(cachedSync.syncedAt)) return;

          await tx.holiday.deleteMany({
            where: {
              countryCode,
              holidayDate: getYearRange(year),
            },
          });
          if (holidays.length > 0) {
            await tx.holiday.createMany({
              data: holidays,
              skipDuplicates: true,
            });
          }

          await tx.holidayYearSync.upsert({
            where: { countryCode_year: { countryCode, year } },
            create: { countryCode, year, syncedAt: new Date() },
            update: { syncedAt: new Date() },
          });
        });
      })().finally(() => {
        inFlightSyncs.delete(key);
      });
      inFlightSyncs.set(key, syncPromise);
    }

    await syncPromise;
  },

  async purgeExpiredCache() {
    const cutoff = getHolidayCacheExpiryCutoff();
    await prisma.$transaction(async (tx) => {
      const expiredSyncs = await tx.holidayYearSync.findMany({
        where: { syncedAt: { lt: cutoff } },
        select: { countryCode: true, year: true },
      });
      if (expiredSyncs.length === 0) return;

      await tx.holiday.deleteMany({
        where: {
          OR: expiredSyncs.map(({ countryCode, year }) => ({
            countryCode,
            holidayDate: getYearRange(year),
          })),
        },
      });
      await tx.holidayYearSync.deleteMany({
        where: {
          syncedAt: { lt: cutoff },
          OR: expiredSyncs.map(({ countryCode, year }) => ({
            countryCode,
            year,
          })),
        },
      });
    });
  },
};
