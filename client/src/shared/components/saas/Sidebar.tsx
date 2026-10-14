import { useState, useEffect, type FC } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  TrendingUp,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../services/auth/useAuth';
import { Modal } from '../Modal';
import UserAvatar from '../UserAvatar';

export interface NavItem {
  name: string;
  path: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { name: 'Accounts', path: '/accounts', icon: CreditCard },
  { name: 'Analytics', path: '/analytics', icon: TrendingUp },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export interface SidebarProps {
  className?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const BrandHeader: FC<{ isExpanded?: boolean }> = ({ isExpanded = true }) => (
  <div className="flex items-center gap-3 min-w-max">
    <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold text-lg tracking-tight shrink-0 shadow-sm">
      F
    </div>
    <div
      className={`transition-all duration-200 overflow-hidden ${
        isExpanded ? 'opacity-100 w-auto translate-x-0' : 'opacity-0 w-0 -translate-x-2'
      }`}
    >
      <h1 className="text-base font-bold tracking-tight text-white whitespace-nowrap leading-none">
        FinArt
      </h1>
      <span className="text-[11px] font-medium text-neutral-400 whitespace-nowrap">
        Personal Finance
      </span>
    </div>
  </div>
);

export const Sidebar: FC<SidebarProps> = ({
  className = '',
  isMobileOpen = false,
  onMobileClose,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Close on Escape key when mobile drawer is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && onMobileClose) {
        onMobileClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onMobileClose]);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      if (onMobileClose) onMobileClose();
      await signOut();
      setIsLogoutModalOpen(false);
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * Reusable content block for both desktop and mobile drawer
   */
  const renderNavBody = (isExpanded: boolean, onNavClick?: () => void) => (
    <>
      {/* Navigation Links */}
      <nav className="p-2.5 space-y-1.5 mt-2 flex-1" aria-label="Main SaaS Menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onNavClick?.()}
              className={`group flex items-center h-11 px-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-black hover:bg-white'
              }`}
              title={!isExpanded ? item.name : undefined}
            >
              {/* Icon - Always visible */}
              <div className="w-5 flex items-center justify-center shrink-0">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-black' : 'text-neutral-400 group-hover:text-black'
                  }`}
                />
              </div>

              {/* Name - Visible only when expanded / mobile */}
              <span
                className={`ml-3.5 whitespace-nowrap overflow-hidden transition-all duration-200 ${
                  isExpanded
                    ? 'opacity-100 max-w-[160px] translate-x-0'
                    : 'opacity-0 max-w-0 -translate-x-2'
                }`}
              >
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: User Profile & Sign Out */}
      <div className="p-2.5 border-t border-neutral-800 overflow-hidden">
        {/* User Card */}
        <div
          className={`flex items-center h-12 px-2.5 rounded-xl mb-1 transition-all ${
            isExpanded ? 'bg-neutral-800/60' : ''
          }`}
        >
          <UserAvatar
            avatarUrl={user?.avatarUrl}
            name={user?.name}
            size="md"
            className="border border-neutral-700 bg-neutral-800 text-white"
          />

          <div
            className={`ml-3 overflow-hidden transition-all duration-200 ${
              isExpanded
                ? 'opacity-100 max-w-[160px] translate-x-0'
                : 'opacity-0 max-w-0 -translate-x-2'
            }`}
          >
            <p className="text-xs font-semibold text-white truncate leading-tight">
              {user?.name || 'My Account'}
            </p>
            <p className="text-[10px] text-neutral-400 truncate">
              {user?.email || 'finart.app'}
            </p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          className="group w-full flex items-center h-11 px-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all duration-150 cursor-pointer"
          title={!isExpanded ? 'Sign Out' : undefined}
        >
          <div className="w-5 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
          </div>

          <span
            className={`ml-3.5 whitespace-nowrap overflow-hidden transition-all duration-200 ${
              isExpanded
                ? 'opacity-100 max-w-[160px] translate-x-0'
                : 'opacity-0 max-w-0 -translate-x-2'
            }`}
          >
            Sign Out
          </span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ========================================================
          1. DESKTOP SIDEBAR (hidden on mobile, visible md and up)
         ======================================================== */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex h-screen sticky top-0 flex-col justify-between bg-neutral-900 border-r border-neutral-800 z-40 select-none transition-all duration-300 ease-in-out ${
          isHovered ? 'w-64 shadow-xl' : 'w-18'
        } ${className}`}
        aria-label="Desktop Sidebar Navigation"
      >
        <div className="h-16 flex items-center px-4 border-b border-neutral-800 overflow-hidden shrink-0">
          <BrandHeader isExpanded={isHovered} />
        </div>

        {renderNavBody(isHovered)}
      </aside>

      {/* ========================================================
          2. MOBILE DRAWER OVERLAY & SIDEBAR (only on mobile screen)
         ======================================================== */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-neutral-900 flex flex-col justify-between border-r border-neutral-800 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
        aria-label="Mobile Sidebar Navigation"
        aria-hidden={!isMobileOpen}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-800 shrink-0">
          <BrandHeader isExpanded={true} />

          <button
            type="button"
            onClick={onMobileClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {renderNavBody(true, onMobileClose)}
      </aside>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleSignOut}
        isLoading={isLoggingOut}
        type="danger"
        title="Are you sure you want to log out?"
        message="You will be safely signed out of your FinArt workspace and returned to the main page."
        confirmText="Log Out"
        cancelText="Stay logged in"
      />
    </>
  );
};

export default Sidebar;
