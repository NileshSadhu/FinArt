CREATE TABLE "holidays" (
    "id" UUID NOT NULL,
    "holidayDate" DATE NOT NULL,
    "name" TEXT NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL DEFAULT 'IN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "holidays_holidayDate_countryCode_key"
ON "holidays"("holidayDate", "countryCode");

CREATE INDEX "holidays_countryCode_holidayDate_idx"
ON "holidays"("countryCode", "holidayDate");

INSERT INTO "holidays" ("id", "holidayDate", "name", "countryCode", "updatedAt")
SELECT
    gen_random_uuid(),
    make_date(years.year, holiday.month, holiday.day),
    holiday.name,
    'IN',
    CURRENT_TIMESTAMP
FROM generate_series(2020, 2040) AS years(year)
CROSS JOIN (
    VALUES
        (1, 26, 'Republic Day'),
        (8, 15, 'Independence Day'),
        (10, 2, 'Gandhi Jayanti')
) AS holiday(month, day, name);
