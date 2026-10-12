import { useState, useEffect, useRef, type FC } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, User, ChevronDown, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import CustomBtn from '../CustomBtn';
import { useAuth } from '../../services/auth/useAuth';

export interface NavbarUser {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export interface NavbarProps {
  isLoggedIn?: boolean;
  user?: NavbarUser | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  onPricingClick?: () => void;
  onContactClick?: () => void;
  className?: string;
}

const Navbar: FC<NavbarProps> = ({
  isLoggedIn: controlledIsLoggedIn,
  user: controlledUser,
  onSignIn,
  onSignOut,
  onPricingClick,
  onContactClick,
  className = '',
}) => {
  const navigate = useNavigate();
  const { user: authUser, isLoggedIn: authIsLoggedIn, signOut: authSignOut } = useAuth();

  const isLoggedIn = controlledIsLoggedIn !== undefined ? controlledIsLoggedIn : authIsLoggedIn;
  const currentUser: NavbarUser | null = controlledUser !== undefined
    ? controlledUser
    : (authUser
      ? { name: authUser.name ?? undefined, email: authUser.email, avatarUrl: authUser.avatarUrl ?? undefined }
      : null);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Profile dropdown state
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Scroll state to enhance blur when content passes behind
  const [isScrolled, setIsScrolled] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Actions that automatically close mobile menu on click
  const handlePricing = () => {
    setIsMobileMenuOpen(false);
    if (onPricingClick) {
      onPricingClick();
    } else {
      navigate('/pricing');
    }
  };

  const handleContact = () => {
    setIsMobileMenuOpen(false);
    if (onContactClick) {
      onContactClick();
    } else {
      navigate('/contact');
    }
  };

  const handleSignIn = () => {
    setIsMobileMenuOpen(false);
    if (onSignIn) {
      onSignIn();
    } else {
      navigate('/signin');
    }
  };

  const handleSignOut = async () => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    if (onSignOut) {
      onSignOut();
    } else {
      await authSignOut();
      navigate('/');
    }
  };

  return (
    <div
      ref={navContainerRef}
      className={`sticky top-4 z-50 w-full px-4 sm:px-6 flex flex-col items-center pointer-events-none ${className}`}
    >
      {/* Centered Floating Island Navbar */}
      <header
        className={`pointer-events-auto w-full max-w-4xl rounded-full transition-all duration-300 border ${isScrolled
          ? 'bg-white/95 backdrop-blur-xl border-neutral-300 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)]'
          : 'bg-white/80 backdrop-blur-md border-neutral-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]'
          }`}
      >
        <div className="px-5 sm:px-7 h-14 sm:h-16 flex items-center justify-between">

          {/* ========================================================
              LEFT: FinArt Brand (Clean Text, No Dollar Icon)
             ======================================================== */}
          <div className="flex items-center">
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
          </div>

          {/* ========================================================
              CENTER: Desktop Navigation (Pricing, Contact)
             ======================================================== */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
            <button
              type="button"
              onClick={handlePricing}
              className="text-sm font-medium text-neutral-600 hover:text-black transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              type="button"
              onClick={handleContact}
              className="text-sm font-medium text-neutral-600 hover:text-black transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* ========================================================
              RIGHT: Desktop Auth (SignIn Button OR Profile Icon)
             ======================================================== */}
          <div className="hidden md:flex items-center">
            {!isLoggedIn ? (
              /* Not Logged In: Black button with white text */
              <CustomBtn
                variant="primary"
                size="sm"
                onClick={handleSignIn}
                className="font-medium px-4 py-1.5"
              >
                Sign In
              </CustomBtn>
            ) : (
              /* Already Logged In: Profile Icon with Dropdown */
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 p-1 rounded-full border border-neutral-200 hover:border-black bg-white transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User Profile"
                >
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-black">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 mr-1 ${isProfileDropdownOpen ? 'rotate-180 text-black' : ''
                      }`}
                  />
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-neutral-200 shadow-xl py-2 z-50 text-black">
                    <div className="px-4 py-2.5 border-b border-neutral-100">
                      <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                        Signed in as
                      </p>
                      <p className="text-sm font-semibold truncate text-black mt-0.5">
                        {currentUser?.name || 'FinArt User'}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {currentUser?.email || 'user@finart.app'}
                      </p>
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
                        onClick={handleSignOut}
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

          {/* ========================================================
              MOBILE: Hamburger Icon (Smaller Screen)
             ======================================================== */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-full text-black hover:bg-neutral-100 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-black" />
              ) : (
                <Menu className="w-5 h-5 text-black" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          MOBILE MENU: Centered Dropdown Card
          (Opens on click, closes itself when any item is clicked)
         ======================================================== */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="pointer-events-auto mt-2 w-full max-w-4xl rounded-2xl bg-white/95 backdrop-blur-xl border border-neutral-200 shadow-xl p-4 transition-all duration-200 text-black"
        >
          <div className="space-y-1">
            {/* Pricing Link */}
            <button
              type="button"
              onClick={handlePricing}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-neutral-800 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer text-left"
            >
              <span>Pricing</span>
            </button>

            {/* Contact Link */}
            <button
              type="button"
              onClick={handleContact}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-neutral-800 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer text-left"
            >
              <span>Contact</span>
            </button>
          </div>

          {/* Mobile Auth Row */}
          <div className="pt-3 mt-2 border-t border-neutral-100">
            {!isLoggedIn ? (
              /* Black button with white text (closes menu on click) */
              <CustomBtn
                variant="primary"
                fullWidth
                size="md"
                onClick={handleSignIn}
              >
                Sign In
              </CustomBtn>
            ) : (
              /* Logged In View with Profile and Sign Out */
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                  <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-black">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black truncate">
                      {currentUser?.name || 'FinArt User'}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {currentUser?.email || 'user@finart.app'}
                    </p>
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
                    onClick={handleSignOut}
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
    </div>
  );
};

export default Navbar;