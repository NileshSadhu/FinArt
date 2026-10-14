import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

export interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  placeholder?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      label,
      placeholder,
      error,
      helperText,
      id,
      disabled,
      className = '',
      containerClassName = '',
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-neutral-800 select-none">
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm text-neutral-900 placeholder:text-neutral-400 transition-all duration-150 focus:outline-none ${error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
            : 'border-neutral-200 hover:border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/5'
            } ${disabled ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed border-neutral-200' : ''
            } ${className}`}
          {...rest}
        />

        {error ? (
          <p className="text-sm text-red-600 leading-tight">{error}</p>
        ) : (
          helperText && <p className="text-xs text-neutral-500 leading-tight">{helperText}</p>
        )}
      </div>
    );
  }
);

CustomInput.displayName = 'CustomInput';

export default CustomInput;
