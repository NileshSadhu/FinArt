import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHeader from '../shared/components/saas/PageHeader';
import CustomBtn from '../shared/components/CustomBtn';
import { useAuth } from '../shared/services/auth/useAuth';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50/50 text-black py-8 px-4 sm:px-8 max-w-7xl mx-auto">
      <PageHeader
        title={`Welcome back, ${user?.name || 'Partner'}`}
        subtitle="Manage your financial overview, accounts, and recent transactions."
        btn={
          <CustomBtn
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/accounts')}
          >
            Create Account
          </CustomBtn>
        }
      />
    </div>
  );
};

export default DashboardPage;
