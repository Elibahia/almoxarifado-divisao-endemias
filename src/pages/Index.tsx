import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from './Dashboard';
import SupervisorDashboard from './SupervisorDashboard';

const Index = () => {
  const { userProfile } = useAuth();

  return (
    <Layout>
      {userProfile?.role === 'supervisor_geral' ? (
        <SupervisorDashboard />
      ) : (
        <Dashboard />
      )}
    </Layout>
  );
};

export default Index;
