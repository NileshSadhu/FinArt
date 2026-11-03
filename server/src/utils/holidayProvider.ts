import "dotenv/config";
import { getCountryCurrency } from "./countryCurrency.js";

const CALENDARIFIC_BASE_URL = "https://calendarific.com/api/v2";

function getApiKey(): string {
  const key = process.env.CALENDARIFIC_API_KEY;
  if (!key) {
    throw new Error("CALENDARIFIC_API_KEY environment variable is not set");
  }
  return key;
}

export interface AvailableHolidayCountry {
  countryCode: string;
  name: string;
  currencyCode: string;
}

export interface PublicHoliday {
  date: string;
  name: string;
}

interface CalendarificHoliday {
  name: string;
  description: string;
  country: { id: string; name: string };
  date: {
    iso: string;
    datetime: { year: number; month: number; day: number };
  };
  type: string[];
  primary_type?: string;
  locations: string;
  states: string;
}

interface CalendarificCountry {
  country_name: string;
  "iso-3166": string;
  total_holidays: number;
  supported_languages: number;
  uuid: string;
}

interface CalendarificResponse<T> {
  meta?: { code?: number; error_detail?: string; error_type?: string };
  response?: T;
}

const IGNORED_OBSERVANCES = new Set([
  "father's day",
  "mother's day",
  "valentine's day",
  "friendship day",
  "halloween",
]);

async function requestCalendarific<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${CALENDARIFIC_BASE_URL}/${endpoint}`);
  url.searchParams.set("api_key", getApiKey());
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Calendarific API error: ${response.status} ${response.statusText}`,
    );
  }

  const data: CalendarificResponse<T> = await response.json();
  if (data.meta?.code !== 200 || !data.response) {
    throw new Error(
      `Calendarific API error (${data.meta?.code}): ${data.meta?.error_detail || `Failed to fetch ${endpoint}`}`,
    );
  }

  return data.response;
}

export async function getAvailableHolidayCountries(): Promise<
  AvailableHolidayCountry[]
> {
  const { countries } = await requestCalendarific<{
    countries: CalendarificCountry[];
  }>("countries");
  if (!Array.isArray(countries)) {
    throw new Error("Calendarific API error: Invalid countries response");
  }

  const availableCountries = countries.flatMap((country) => {
    const countryCode = country["iso-3166"]?.toUpperCase();
    return countryCode
      ? [
          {
            countryCode,
            name: country.country_name,
            currencyCode: getCountryCurrency(countryCode),
          },
        ]
      : [];
  });

  if (!availableCountries.some((country) => country.countryCode === "IN")) {
    availableCountries.push({
      countryCode: "IN",
      name: "India",
      currencyCode: getCountryCurrency("IN"),
    });
  }

  return availableCountries.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPublicHolidays(
  countryCode: string,
  year: number,
): Promise<PublicHoliday[]> {
  const { holidays } = await requestCalendarific<{
    holidays: CalendarificHoliday[];
  }>("holidays", { country: countryCode, year: String(year) });
  if (!Array.isArray(holidays)) {
    throw new Error("Calendarific API error: Invalid holidays response");
  }

  const seen = new Set<string>();
  const results: PublicHoliday[] = [];

  for (const holiday of holidays) {
    const rawName = holiday.name?.trim() || "";
    const lowerName = rawName.toLowerCase();

    // Skip seasonal markers (Equinox, Solstice) and generic social observances
    if (holiday.type?.includes("Season") || holiday.primary_type === "Season") {
      continue;
    }
    if (IGNORED_OBSERVANCES.has(lowerName)) {
      continue;
    }

    const date = holiday.date.iso.slice(0, 10);

    // Format Janmashtami / Gokulashtami clearly
    let displayName = rawName;
    if (
      countryCode.toUpperCase() === "IN" &&
      (lowerName === "janmashtami" || lowerName === "janmashtami (smarta)")
    ) {
      displayName = "Janmashtami / Gokulashtami";
    }

    const key = `${date}:${displayName.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({
        date,
        name: displayName,
      });
    }
  }

  return results;
}
