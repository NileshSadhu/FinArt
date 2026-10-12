import { useState, type FC } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  TrendingUp,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../../services/auth/useAuth';

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
}

export const Sidebar: FC<SidebarProps> = ({ className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`h-screen sticky top-0 flex flex-col justify-between bg-white border-r border-neutral-200 z-40 select-none transition-all duration-300 ease-in-out ${isHovered ? 'w-64 shadow-xl' : 'w-18'
        } ${className}`}
      aria-label="Sidebar Navigation"
    >
      {/* Top: Brand Header */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-neutral-100 overflow-hidden">
          <div className="flex items-center gap-3 min-w-max">
            {/* Minimalist Logo Mark */}
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-lg tracking-tight shrink-0 shadow-sm">
              F
            </div>

            {/* Brand Name - visible only when hovered/expanded */}
            <div
              className={`transition-all duration-200 overflow-hidden ${isHovered ? 'opacity-100 w-auto translate-x-0' : 'opacity-0 w-0 -translate-x-2'
                }`}
            >
              <h1 className="text-base font-bold tracking-tight text-black whitespace-nowrap leading-none">
                FinArt
              </h1>
              <span className="text-[11px] font-medium text-neutral-400 whitespace-nowrap">
                Personal Finance
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-2.5 space-y-1.5 mt-2" aria-label="Main SaaS Menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`group flex items-center h-11 px-3 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                  }`}
                title={!isHovered ? item.name : undefined}
              >
                {/* Icon - Always visible */}
                <div className="w-5 flex items-center justify-center shrink-0">
                  <Icon
                    className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-neutral-500 group-hover:text-black'
                      }`}
                  />
                </div>

                {/* Name - Visible only when hovered/expanded */}
                <span
                  className={`ml-3.5 whitespace-nowrap overflow-hidden transition-all duration-200 ${isHovered
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
      </div>

      {/* Bottom: User Profile & Sign Out */}
      <div className="p-2.5 border-t border-neutral-100 overflow-hidden">
        {/* User Card */}
        <div
          className={`flex items-center h-11 px-3 rounded-xl mb-1 transition-all ${isHovered ? 'bg-neutral-50' : ''
            }`}
        >
          <div className="w-5 flex items-center justify-center shrink-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || 'User'}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-neutral-200 text-black flex items-center justify-center font-semibold text-xs shrink-0">
                <User className="w-4 h-4 text-neutral-700" />
              </div>
            )}
          </div>

          <div
            className={`ml-3.5 overflow-hidden transition-all duration-200 ${isHovered
              ? 'opacity-100 max-w-[160px] translate-x-0'
              : 'opacity-0 max-w-0 -translate-x-2'
              }`}
          >
            <p className="text-xs font-semibold text-black truncate leading-tight">
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
          onClick={handleSignOut}
          className="group w-full flex items-center h-11 px-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-150 cursor-pointer"
          title={!isHovered ? 'Sign Out' : undefined}
        >
          <div className="w-5 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-700 transition-colors" />
          </div>

          <span
            className={`ml-3.5 whitespace-nowrap overflow-hidden transition-all duration-200 ${isHovered
              ? 'opacity-100 max-w-[160px] translate-x-0'
              : 'opacity-0 max-w-0 -translate-x-2'
              }`}
          >
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
