import apiConfig from "./apiConfig";
import { ApiPath } from "./apiPath";

export interface Holiday {
  id: string;
  holidayDate: string;
  name: string;
  countryCode: string;
}

export interface HolidayCountry {
  countryCode: string;
  name: string;
  currencyCode: string;
}

export const holidayService = {
  getCountries: async (): Promise<HolidayCountry[]> => {
    const response = await apiConfig.get<{ data: HolidayCountry[] }>(
      ApiPath.holidays.countries,
    );
    return response.data.data;
  },

  getHolidays: async (fromDate: string, toDate: string): Promise<Holiday[]> => {
    const response = await apiConfig.get<{ data: Holiday[] }>(
      ApiPath.holidays.base,
      { params: { fromDate, toDate } },
    );
    return response.data.data;
  },
};

export default holidayService;
