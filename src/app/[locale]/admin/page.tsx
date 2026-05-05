import { cookies } from 'next/headers';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_auth');
  
  // Verify if the active cookie matches the new authenticated state
  const isAuthenticated = authCookie?.value === 'authenticated';

  if (isAuthenticated) {
    return <AdminDashboard />;
  }

  return <AdminLogin />;
}
