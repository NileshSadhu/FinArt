import "dotenv/config";
import { afterEach, beforeEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import {
  getAvailableHolidayCountries,
  getPublicHolidays,
} from "../utils/holidayProvider.js";
import {
  HOLIDAY_CACHE_REFRESH_MS,
  HOLIDAY_CACHE_RETENTION_MS,
  holidayRepository,
  getHolidayCacheExpiryCutoff,
  isHolidayCacheFresh,
} from "../db/repositories/holiday.repository.js";

const originalApiKey = process.env.CALENDARIFIC_API_KEY;

beforeEach(() => {
  process.env.CALENDARIFIC_API_KEY = "test-api-key";
});

afterEach(() => {
  mock.restoreAll();
  if (originalApiKey === undefined) {
    delete process.env.CALENDARIFIC_API_KEY;
  } else {
    process.env.CALENDARIFIC_API_KEY = originalApiKey;
  }
});

describe("Calendarific API holiday data", () => {
  it("includes India and its default currency when the provider omits it", async () => {
    mock.method(globalThis, "fetch", async () =>
      new Response(
        JSON.stringify({
          meta: { code: 200 },
          response: {
            countries: [
              {
                country_name: "United States",
                "iso-3166": "US",
                total_holidays: 10,
                supported_languages: 1,
                uuid: "us",
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );

    const countries = await getAvailableHolidayCountries();
    assert.ok(
      countries.some(
        (country) =>
          country.countryCode === "IN" &&
          country.name === "India" &&
          country.currencyCode === "INR",
      ),
    );
  });

  it("filters and formats India's public holidays", async () => {
    const currentYear = new Date().getFullYear();
    mock.method(
      globalThis,
      "fetch",
      async (input: Parameters<typeof fetch>[0]) => {
        const url = new URL(String(input));
        assert.equal(url.pathname, "/api/v2/holidays");
        assert.equal(url.searchParams.get("api_key"), "test-api-key");
        assert.equal(url.searchParams.get("country"), "IN");
        assert.equal(url.searchParams.get("year"), String(currentYear));

        const date = (month: number, day: number) => ({
          iso: `${currentYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
          datetime: { year: currentYear, month, day },
        });
        const holiday = (name: string, month: number, day: number) => ({
          name,
          description: "",
          country: { id: "IN", name: "India" },
          date: date(month, day),
          type: ["National holiday"],
          locations: "All",
          states: "All",
        });

        return new Response(
          JSON.stringify({
            meta: { code: 200 },
            response: {
              holidays: [
                holiday("Dussehra", 10, 20),
                holiday("Janmashtami", 8, 15),
                holiday("Janmashtami (Smarta)", 8, 15),
                holiday("Republic Day", 1, 26),
                holiday("Independence Day", 8, 15),
                {
                  ...holiday("Summer Solstice", 6, 21),
                  type: ["Season"],
                },
                holiday("Halloween", 10, 31),
              ],
            },
          }),
          { status: 200 },
        );
      },
    );

    const holidays = await getPublicHolidays("IN", currentYear);
    assert.ok(
      holidays.some((holiday) => holiday.name.includes("Dussehra")),
      "Expected Dussehra to be present",
    );
    assert.ok(
      holidays.some((holiday) => holiday.name.includes("Gokulashtami")),
      "Expected Gokulashtami / Janmashtami to be present",
    );
    assert.ok(
      holidays.some(
        (holiday) =>
          holiday.date === `${currentYear}-01-26` &&
          holiday.name === "Republic Day",
      ),
    );
    assert.ok(
      holidays.some(
        (holiday) =>
          holiday.date === `${currentYear}-08-15` &&
          holiday.name === "Independence Day",
      ),
    );
    assert.ok(
      !holidays.some((holiday) =>
        ["Summer Solstice", "Halloween"].includes(holiday.name),
      ),
    );
    assert.equal(
      holidays.filter((holiday) => holiday.name.includes("Gokulashtami")).length,
      1,
    );
  });

  it("refreshes the cache after 27 days and removes it after 29 days", () => {
    const now = Date.now();
    assert.equal(
      isHolidayCacheFresh(new Date(now - HOLIDAY_CACHE_REFRESH_MS + 1), now),
      true,
    );
    assert.equal(
      isHolidayCacheFresh(new Date(now - HOLIDAY_CACHE_REFRESH_MS), now),
      false,
    );
    assert.equal(
      getHolidayCacheExpiryCutoff(now).getTime(),
      now - HOLIDAY_CACHE_RETENTION_MS,
    );
  });

  it("rejects caching requests for non-current years", async () => {
    const currentYear = new Date().getFullYear();
    await assert.rejects(
      () => holidayRepository.ensureCountryYearCached("IN", currentYear - 1),
      {
        message: `Holidays are only available for the current year (${currentYear})`,
      },
    );
    await assert.rejects(
      () => holidayRepository.ensureCountryYearCached("IN", currentYear + 1),
      {
        message: `Holidays are only available for the current year (${currentYear})`,
      },
    );
  });
});
