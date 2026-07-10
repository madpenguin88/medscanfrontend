import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useAuth } from '../../context/AuthContext';

export function AppShell() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <Sidebar onLogout={logout} />
      <main className="flex-1 overflow-y-auto min-h-screen pb-16 lg:pb-0">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
