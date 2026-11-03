ALTER TABLE "users"
ADD COLUMN "countryCode" VARCHAR(2);

DROP INDEX "holidays_holidayDate_countryCode_key";

CREATE UNIQUE INDEX "holidays_countryCode_holidayDate_name_key"
ON "holidays"("countryCode", "holidayDate", "name");

CREATE TABLE "holiday_year_syncs" (
    "countryCode" VARCHAR(2) NOT NULL,
    "year" INTEGER NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holiday_year_syncs_pkey" PRIMARY KEY ("countryCode", "year")
);
