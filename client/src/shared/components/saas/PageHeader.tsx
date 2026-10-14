import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  btn?: ReactNode;
  isBack?: boolean;
  onBack?: () => void;
  className?: string;
}

export const PageHeader: FC<PageHeaderProps> = ({
  title,
  subtitle,
  btn,
  isBack = false,
  onBack,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 ${className}`}>
      <div className="flex items-center gap-3">
        {isBack && (
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 rounded-xl text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {btn && <div className="flex items-center gap-2">{btn}</div>}
    </div>
  );
};

export default PageHeader;
