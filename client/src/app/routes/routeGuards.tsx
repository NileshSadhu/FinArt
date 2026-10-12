import type { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../shared/services/auth/useAuth';

export interface RouteGuardProps {
  children: ReactNode;
}

/**
 * PublicOnlyRoute: If user is already authenticated, redirects them away from public pages (like / or /signin) to /dashboard
 */
export const PublicOnlyRoute: FC<RouteGuardProps> = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};
