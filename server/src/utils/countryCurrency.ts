import countryToCurrency from "country-to-currency";

export function getCountryCurrency(countryCode: string): string {
  return countryToCurrency[countryCode.toUpperCase() as keyof typeof countryToCurrency] ?? "USD";
}

export function isSupportedCurrency(currencyCode: string): boolean {
  return Object.values(countryToCurrency).includes(
    currencyCode as (typeof countryToCurrency)[keyof typeof countryToCurrency],
  );
}
