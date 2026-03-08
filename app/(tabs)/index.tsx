import { ChildDashboard } from '@/components/ui/child-dashboard';
import { ParentDashboard } from '@/components/ui/parent-dashboard';
import { useAuth } from '@/context/auth-context';

export default function HomeScreen() {
  const { user } = useAuth();
  if (user?.userType === 'child') return <ChildDashboard />;
  return <ParentDashboard />;
}
