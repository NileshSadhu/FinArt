import { useState, useEffect, useRef, type FC } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, ChevronDown, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import CustomBtn from '../CustomBtn';
import { useAuth } from '../../services/auth/useAuth';
import { Modal } from '../Modal';
import UserAvatar from '../UserAvatar';

const navLinks = [
  { name: 'Pricing', path: '/pricing' },
  { name: 'Contact', path: '/contact' },
];

export interface NavbarProps {
  className?: string;
}

export const Navbar: FC<NavbarProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { user, isLoggedIn, signOut } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      setIsMobileMenuOpen(false);
      setIsProfileDropdownOpen(false);
      await signOut();
      setIsLogoutModalOpen(false);
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={`sticky top-4 z-50 w-full px-4 sm:px-6 flex flex-col items-center pointer-events-none ${className}`}>
      {/* Centered Floating Island Navbar */}
      <header
        className={`pointer-events-auto w-full max-w-4xl rounded-full transition-all duration-300 border ${isScrolled
          ? 'bg-white/95 backdrop-blur-xl border-neutral-300 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)]'
          : 'bg-white/80 backdrop-blur-md border-neutral-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]'
          }`}
      >
        <div className="px-5 sm:px-7 h-14 sm:h-16 flex items-center justify-between">
          {/* Brand */}
          <Link
            to="/"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setIsMobileMenuOpen(false);
            }}
            className="text-xl sm:text-2xl font-bold tracking-tight text-black select-none hover:opacity-85 transition-opacity"
            aria-label="FinArt Home"
          >
            FinArt
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-neutral-600 hover:text-black transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center">
            {!isLoggedIn ? (
              <CustomBtn
                variant="primary"
                size="sm"
                onClick={() => navigate('/signin')}
                className="font-medium px-4 py-1.5"
              >
                Sign In
              </CustomBtn>
            ) : (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 p-1 rounded-full border border-neutral-200 hover:border-black bg-white transition-all duration-150 cursor-pointer focus:outline-none"
                  aria-expanded={isProfileDropdownOpen}
                  aria-label="User Profile"
                >
                  <UserAvatar avatarUrl={user?.avatarUrl} name={user?.name} size="sm" />
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 mr-1 ${isProfileDropdownOpen ? 'rotate-180 text-black' : ''
                      }`}
                  />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-neutral-200 shadow-xl py-2 z-50 text-black">
                    <div className="px-4 py-2.5 border-b border-neutral-100">
                      <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-semibold truncate text-black mt-0.5">{user?.name || 'FinArt User'}</p>
                      <p className="text-xs text-neutral-500 truncate">{user?.email || 'user@finart.app'}</p>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          navigate('/dashboard');
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 hover:text-black hover:bg-neutral-50 transition-colors cursor-pointer text-left"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2.5 text-neutral-500" />
                        Dashboard
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 hover:text-black hover:bg-neutral-50 transition-colors cursor-pointer text-left"
                      >
                        <Settings className="w-4 h-4 mr-2.5 text-neutral-500" />
                        Settings
                      </button>
                    </div>

                    <div className="pt-1 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setIsLogoutModalOpen(true);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 mr-2.5 text-red-600" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-full text-black hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-black" /> : <Menu className="w-5 h-5 text-black" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="pointer-events-auto mt-2 w-full max-w-4xl rounded-2xl bg-white/95 backdrop-blur-xl border border-neutral-200 shadow-xl p-4 transition-all duration-200 text-black">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium text-neutral-800 hover:text-black hover:bg-neutral-100 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 mt-2 border-t border-neutral-100">
            {!isLoggedIn ? (
              <CustomBtn
                variant="primary"
                fullWidth
                size="md"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/signin');
                }}
              >
                Sign In
              </CustomBtn>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                  <UserAvatar avatarUrl={user?.avatarUrl} name={user?.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black truncate">{user?.name || 'FinArt User'}</p>
                    <p className="text-xs text-neutral-500 truncate">{user?.email || 'user@finart.app'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <CustomBtn
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/dashboard');
                    }}
                  >
                    Dashboard
                  </CustomBtn>
                  <CustomBtn
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                  >
                    Sign Out
                  </CustomBtn>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleSignOut}
        isLoading={isLoggingOut}
        type="danger"
        title="Are you sure you want to log out?"
        message="You will be safely signed out of your FinArt account and returned to the main page."
        confirmText="Log Out"
        cancelText="Stay logged in"
      />
    </div>
  );
};

export default Navbar;