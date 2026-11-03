import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Check, Globe2 } from "lucide-react";
import CustomBtn from "../../shared/components/CustomBtn";
import { CustomSelect } from "../../shared/components/CustomInput";
import CurrencyLogo from "../../shared/components/saas/CurrencyLogo";
import { authService } from "../../shared/services/api/authService";
import holidayService, {
  type HolidayCountry,
} from "../../shared/services/api/holidayService";
import { useAuth } from "../../shared/services/auth/useAuth";

const CountrySetupPage = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [countries, setCountries] = useState<HolidayCountry[]>([]);
  const [countryCode, setCountryCode] = useState("");
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    holidayService
      .getCountries()
      .then((availableCountries) => {
        if (isMounted) setCountries(availableCountries);
      })
      .catch(() => {
        if (isMounted) toast.error("Failed to load countries. Please try again.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingCountries(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCountry = countries.find(
    (country) => country.countryCode === countryCode,
  );

  const handleContinue = async () => {
    if (!selectedCountry) {
      toast.error("Select your country to continue");
      return;
    }

    setIsSaving(true);
    try {
      await authService.updateCountry(selectedCountry.countryCode);
      await checkAuth();
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Failed to save your country. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
      <div className="mx-auto flex min-h-[70vh] max-w-lg items-center">
        <section className="w-full rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
            <Globe2 className="h-6 w-6 text-neutral-700" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Where are you from?</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Choose your country to personalize public holidays and your default
            account currency.
          </p>

          <div className="mt-7 space-y-4">
            <CustomSelect
              label="Country"
              value={countryCode}
              disabled={isLoadingCountries || isSaving}
              onChange={(event) => setCountryCode(event.target.value)}
              required
            >
              <option value="" disabled>
                {isLoadingCountries ? "Loading countries…" : "Select your country"}
              </option>
              {countries.map((country) => (
                <option key={country.countryCode} value={country.countryCode}>
                  {country.name}
                </option>
              ))}
            </CustomSelect>

            {selectedCountry && (
              <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <span className="text-sm text-neutral-600">Default currency</span>
                <span className="inline-flex items-center gap-2 font-semibold text-neutral-900">
                  <CurrencyLogo currency={selectedCountry.currencyCode} />
                  {selectedCountry.currencyCode}
                </span>
              </div>
            )}

            <CustomBtn
              onClick={handleContinue}
              disabled={!selectedCountry || isLoadingCountries}
              isLoading={isSaving}
              fullWidth
              rightIcon={<Check className="h-4 w-4" />}
              className="mt-2"
            >
              Continue
            </CustomBtn>
          </div>
        </section>
      </div>
    </main>
  );
};

export default CountrySetupPage;
