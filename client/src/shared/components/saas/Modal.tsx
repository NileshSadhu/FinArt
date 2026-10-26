import { useEffect, type FC, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, LogOut, X } from 'lucide-react';

export type ModalType = 'confirm' | 'danger' | 'success' | 'default';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: ModalType;
  title?: ReactNode;
  message?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  isLoading?: boolean;
  children?: ReactNode;
  className?: string;
  titleVariant?: 'default' | 'header';
  bottomSheetOnMobile?: boolean;
  zIndex?: string;
}

const typeConfig: Record<
  Exclude<ModalType, 'default'>,
  { icon: typeof LogOut; iconClass: string; btnClass: string }
> = {
  danger: {
    icon: LogOut,
    iconClass: 'bg-red-50 text-red-600',
    btnClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  confirm: {
    icon: AlertTriangle,
    iconClass: 'bg-amber-50 text-amber-600',
    btnClass: 'bg-neutral-900 hover:bg-black text-white',
  },
  success: {
    icon: CheckCircle2,
    iconClass: 'bg-emerald-50 text-emerald-600',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
};

export const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  type = 'default',
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false,
  children,
  className = '',
  titleVariant = 'default',
  bottomSheetOnMobile = true,
  zIndex = 'z-50',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const config = type !== 'default' ? typeConfig[type] : null;
  const Icon = config?.icon;
  const titleVariantClass =
    titleVariant === 'header'
      ? `${bottomSheetOnMobile ? '-mx-5 -mt-5 rounded-t-[28px]' : '-mx-6 -mt-6 rounded-t-2xl'} sm:-mx-6 sm:-mt-6 sm:rounded-t-2xl bg-neutral-100 px-5 sm:px-6 py-3.5 border-b border-neutral-200/60`
      : '';

  const hasCustomMaxWidth = className && /\bmax-w-/.test(className);

  return createPortal(
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={`fixed inset-0 ${zIndex} flex overflow-y-auto bg-black/50 backdrop-blur-md transition-all duration-300 ${
        bottomSheetOnMobile
          ? 'items-end sm:items-center justify-center p-0 sm:p-4'
          : 'items-center justify-center p-4'
      }`}
    >
      <div
        className={`relative w-full ${hasCustomMaxWidth ? '' : 'max-w-sm'} bg-white shadow-2xl border border-neutral-100/90 transition-all overscroll-contain ${
          bottomSheetOnMobile
            ? 'rounded-t-[28px] sm:rounded-2xl rounded-b-none sm:rounded-b-2xl p-5 sm:p-6 max-h-[88dvh] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto animate-bottom-sheet sm:animate-modal-pop pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6'
            : 'rounded-2xl p-6 max-h-[calc(100dvh-2rem)] overflow-y-auto animate-modal-pop'
        } ${className}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-full transition-colors cursor-pointer z-20"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mobile Pull Handle Indicator for standard modals */}
        {bottomSheetOnMobile && titleVariant !== 'header' && (
          <div className="pt-0.5 pb-2.5 sm:hidden flex justify-center shrink-0">
            <div className="w-10 h-1.5 rounded-full bg-neutral-300" />
          </div>
        )}

        {config && Icon && (
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${config.iconClass}`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}

        {title && (
          <div className={titleVariantClass}>
            {bottomSheetOnMobile && titleVariant === 'header' && (
              <div className="pb-2 sm:hidden flex justify-center shrink-0">
                <div className="w-10 h-1 rounded-full bg-neutral-300" />
              </div>
            )}
            <h3
              className={`text-base font-semibold text-neutral-900 ${config ? 'text-center' : ''}`}
            >
              {title}
            </h3>
          </div>
        )}

        {message && (
          <p className={`mt-2 text-sm text-neutral-500 ${config ? 'text-center' : ''}`}>
            {message}
          </p>
        )}

        {children && <div className="mt-4">{children}</div>}

        {(onConfirm || type !== 'default') && (
          <div className="mt-6 flex items-center gap-2.5">
            {type !== 'success' && (
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="flex-1 py-2 px-4 rounded-full text-sm font-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancelText}
              </button>
            )}

            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm || onClose}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                config?.btnClass ?? 'bg-black text-white hover:bg-neutral-800'
              }`}
            >
              {isLoading ? 'Processing...' : confirmText || (type === 'success' ? 'OK' : 'Confirm')}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
