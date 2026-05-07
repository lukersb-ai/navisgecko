import { createSupabaseServerClient } from '@/lib/supabase-server';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const isAuthenticated = !!user;

  if (isAuthenticated) {
    return <AdminDashboard />;
  }

  return <AdminLogin />;
}
