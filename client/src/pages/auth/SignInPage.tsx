import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { authService } from '../../shared/services/api/authService';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    authService.redirectToGoogle();
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between p-6 sm:p-8">
      {/* Top Bar with back link */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <Link to="/" className="text-xl font-bold tracking-tight text-black">
          FinArt
        </Link>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-sm text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
            Welcome to FinArt
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Sign in or create your account to continue
          </p>

          <div className="mt-8">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-3 px-5 py-3.5 rounded-full border border-neutral-300 bg-white text-sm font-medium text-black hover:bg-neutral-50 hover:border-neutral-400 active:scale-[0.99] transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
              <span>{isLoading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
            </button>
          </div>

          <p className="mt-6 text-xs text-neutral-400 leading-relaxed">
            By continuing, you agree to FinArt's{' '}
            <span className="text-neutral-600 underline cursor-pointer">Terms of Service</span>{' '}
            and{' '}
            <span className="text-neutral-600 underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="w-full max-w-md mx-auto text-center text-xs text-neutral-400">
        &copy; 2026 FinArt. All rights reserved.
      </div>
    </div>
  );
};

export default SignInPage;
