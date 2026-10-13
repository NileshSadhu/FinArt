import type { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../shared/services/auth/useAuth';
import Skeleton from '../../shared/components/Skeleton';

export interface RouteGuardProps {
  children: ReactNode;
}

const RouteLoadingSkeleton = () => (
  <div className="min-h-screen flex bg-neutral-50/50">
    {/* Left sidebar placeholder */}
    <div className="w-18 border-r border-neutral-200 bg-white p-3 hidden md:flex flex-col justify-between shrink-0">
      <div className="space-y-4">
        <Skeleton width={40} height={40} borderRadius={12} />
        <div className="space-y-2 mt-4">
          <Skeleton width={40} height={40} borderRadius={12} />
          <Skeleton width={40} height={40} borderRadius={12} />
          <Skeleton width={40} height={40} borderRadius={12} />
        </div>
      </div>
      <Skeleton width={40} height={40} borderRadius="50%" />
    </div>

    {/* Content area placeholder */}
    <div className="flex-1 p-6 sm:p-8 space-y-6 max-w-6xl">
      <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
        <Skeleton width={220} height={28} borderRadius={8} />
        <Skeleton width={110} height={36} borderRadius={9999} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton height={140} borderRadius={16} />
        <Skeleton height={140} borderRadius={16} />
        <Skeleton height={140} borderRadius={16} />
      </div>
      <Skeleton height={200} borderRadius={16} />
    </div>
  </div>
);

/**
 * PublicOnlyRoute: If user is already authenticated, redirects them away from public pages (like / or /signin) to /dashboard
 */
export const PublicOnlyRoute: FC<RouteGuardProps> = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoadingSkeleton />;
  }

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * ProtectedRoute: Requires user to be authenticated, otherwise redirects to /signin
 */
export const ProtectedRoute: FC<RouteGuardProps> = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoadingSkeleton />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};
