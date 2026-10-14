import PageHeader from '../shared/components/saas/PageHeader';
import { useAuth } from '../shared/services/auth/useAuth';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50/50 text-black py-8 px-4 sm:px-8 max-w-7xl mx-auto">
      <PageHeader
        title={`Welcome back, ${user?.name || 'Partner'}`}
        subtitle="Manage your financial overview, accounts, and recent transactions."
      />
    </div>
  );
};

export default DashboardPage;
