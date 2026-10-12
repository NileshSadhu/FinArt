import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../shared/services/auth/useAuth';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    const handleCallback = async () => {
      const status = searchParams.get('status');

      if (status === 'success') {
        toast.success('Signed in successfully', { id: 'auth-callback' });
        await checkAuth();
        navigate('/dashboard', { replace: true });
      } else {
        toast.error('Authentication failed. Please try again.', { id: 'auth-callback' });
        navigate('/signin', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-neutral-500">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
