import React, { useMemo, type FC, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export const getRandomLightColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 25) + 55;
  const lightness = Math.floor(Math.random() * 5) + 91;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export interface HorizontalCardProps {
  title: ReactNode;
  icon: LucideIcon | React.ComponentType<{ className?: string }> | ReactNode;
  number: string | number | ReactNode;
  color?: string;
  subtitle?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export const HorizontalCard: FC<HorizontalCardProps> = ({
  title,
  icon,
  number,
  color,
  subtitle,
  onClick,
  className = '',
}) => {
  // Stable random light color per card instance unless overridden
  const cardBg = useMemo(() => color || getRandomLightColor(), [color]);

  // Render icon safely whether passed as component or JSX element
  const renderIcon = () => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
      return icon;
    }

    const IconComponent = icon as React.ComponentType<{ className?: string }>;
    return <IconComponent className="w-5 h-5 text-neutral-800" />;
  };

  return (
    <div
      onClick={onClick}
      style={{ backgroundColor: cardBg }}
      className={`group relative flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl border border-black/5 shadow-xs transition-all duration-200 select-none ${onClick
        ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]'
        : 'hover:shadow-xs'
        } ${className}`}
    >
      {/* Left section: Icon + Title */}
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Icon Container with subtle glass effect */}
        <div className="w-11 h-11 rounded-xl bg-white/85 backdrop-blur-xs flex items-center justify-center shrink-0 text-neutral-800 shadow-xs border border-white/60 transition-transform duration-200 group-hover:scale-105">
          {renderIcon()}
        </div>

        {/* Title & optional subtitle */}
        <div className="min-w-0 flex flex-col justify-center">
          <span className="text-sm font-semibold text-neutral-900 truncate leading-snug">
            {title}
          </span>
          {subtitle && (
            <span className="text-xs text-neutral-500 truncate leading-tight mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Right section: Number */}
      <div className="shrink-0 text-right pl-2">
        <span className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 tabular-nums">
          {number}
        </span>
      </div>
    </div>
  );
};

export default HorizontalCard;
