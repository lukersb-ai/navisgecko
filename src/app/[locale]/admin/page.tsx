import { cookies } from 'next/headers';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_auth');
  
  // Verify if the active cookie matches the environment password and the password exists
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const isAuthenticated = expectedPassword ? authCookie?.value === expectedPassword : false;

  if (isAuthenticated) {
    return <AdminDashboard />;
  }

  return <AdminLogin />;
}
