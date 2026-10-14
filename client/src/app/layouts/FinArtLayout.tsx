import { useState, type FC, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../../shared/components/saas/Sidebar';
import UserAvatar from '../../shared/components/UserAvatar';
import { useAuth } from '../../shared/services/auth/useAuth';

export interface FinArtLayoutProps {
  children?: ReactNode;
}

export const FinArtLayout: FC<FinArtLayoutProps> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-50 text-black">
      {/* Mobile Top Header - visible ONLY on screens smaller than md */}
      <header className="md:hidden sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* FinArt Brand */}
          <div className="flex items-center gap-2 select-none">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs">
              F
            </div>
            <span className="font-bold tracking-tight text-base text-black">
              FinArt
            </span>
          </div>
        </div>

        {/* Right side mobile profile indicator */}
        <div className="flex items-center">
          <UserAvatar avatarUrl={user?.avatarUrl} name={user?.name} size="md" />
        </div>
      </header>

      {/* Responsive Sidebar (desktop sticky rail + mobile slide-out drawer) */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Page Content */}
      <main className="flex-1 min-w-0 min-h-screen overflow-y-auto">
        {children ?? <Outlet />}
      </main>
    </div>
  );
};

export default FinArtLayout;
