import "dotenv/config";
import app from "./app.js";
import { holidayRepository } from "./db/repositories/holiday.repository.js";

const PORT = process.env.PORT || 8000;
const HOLIDAY_CACHE_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

function cleanExpiredHolidayCache() {
  void holidayRepository.purgeExpiredCache().catch((error: unknown) => {
    console.error("Failed to clean up expired holiday cache", error);
  });
}

cleanExpiredHolidayCache();
const holidayCacheCleanupInterval = setInterval(
  cleanExpiredHolidayCache,
  HOLIDAY_CACHE_CLEANUP_INTERVAL_MS,
);
holidayCacheCleanupInterval.unref();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
