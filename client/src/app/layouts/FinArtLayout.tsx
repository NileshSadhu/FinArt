import type { FC, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../shared/components/saas/Sidebar';

export interface FinArtLayoutProps {
  children?: ReactNode;
}

export const FinArtLayout: FC<FinArtLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-neutral-50 text-black">
      {/* Sidebar on the Left */}
      <Sidebar />

      {/* Page on the Right */}
      <main className="flex-1 min-w-0 min-h-screen overflow-y-auto">
        {children ?? <Outlet />}
      </main>
    </div>
  );
};

export default FinArtLayout;
