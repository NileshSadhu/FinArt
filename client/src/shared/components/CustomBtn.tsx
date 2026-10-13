import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface CustomBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-black text-white font-medium hover:bg-neutral-800 active:bg-neutral-900 active:scale-[0.98] shadow-sm',
  secondary:
    'bg-white text-black font-medium border border-neutral-200 hover:bg-neutral-100 active:bg-neutral-200 active:scale-[0.98]',
  outline:
    'bg-transparent text-black font-medium border border-black hover:bg-black hover:text-white active:scale-[0.98]',
  ghost:
    'bg-transparent text-black font-medium hover:bg-neutral-100 active:bg-neutral-200 active:scale-[0.98]',
  danger:
    'bg-red-600 text-white font-medium hover:bg-red-700 active:bg-red-800 active:scale-[0.98] shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs rounded-full gap-1.5',
  md: 'px-5 py-2 text-sm rounded-full gap-2',
  lg: 'px-6 py-2.5 text-base rounded-full gap-2.5',
};

export const CustomBtn = forwardRef<HTMLButtonElement, CustomBtnProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`relative inline-flex items-center justify-center cursor-pointer select-none transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
          variantStyles[variant]
        } ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${
          isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        } ${className}`}
        {...rest}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

CustomBtn.displayName = 'CustomBtn';

export default CustomBtn;
