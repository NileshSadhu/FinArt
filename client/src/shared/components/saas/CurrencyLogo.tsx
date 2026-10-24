import React from "react";
import {
  IndianRupee,
  DollarSign,
  Euro,
  JapaneseYen,
  PoundSterling,
  Coins,
} from "lucide-react";

export interface CurrencyLogoProps {
  currency?: string;
  className?: string;
  showCodeTooltip?: boolean;
}

export const CurrencyLogo: React.FC<CurrencyLogoProps> = ({
  currency = "INR",
  className = "w-4 h-4",
  showCodeTooltip = true,
}) => {
  const normalized = (currency || "INR").toUpperCase().trim();

  const renderIcon = () => {
    switch (normalized) {
      case "INR":
        return <IndianRupee className={className} />;
      case "USD":
      case "CAD":
      case "AUD":
      case "SGD":
        return <DollarSign className={className} />;
      case "EUR":
        return <Euro className={className} />;
      case "JPY":
      case "YEN":
        return <JapaneseYen className={className} />;
      case "GBP":
        return <PoundSterling className={className} />;
      case "CHF":
        return (
          <span className="font-bold text-[11px] leading-none tracking-tighter select-none">
            Fr
          </span>
        );
      case "AED":
        return (
          <span className="font-bold text-[10px] leading-none select-none">
            د.إ
          </span>
        );
      default:
        return <Coins className={className} />;
    }
  };

  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      title={showCodeTooltip ? normalized : undefined}
      aria-label={normalized}
    >
      {renderIcon()}
    </span>
  );
};

export default CurrencyLogo;
