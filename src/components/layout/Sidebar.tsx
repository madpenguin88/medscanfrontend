import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, FileText, Home, Upload, User, LogOut, TrendingUp } from 'lucide-react';
import { userService } from '../../api';
import type { UserProfile } from '../../types/user';

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    userService.getProfile().then(res => setProfile(res.data)).catch(console.error);
  }, []);

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Upload, label: 'Upload PDF', path: '/upload' },
    { icon: FileText, label: 'Analizele mele', path: '/records' },
    { icon: TrendingUp, label: 'Evoluție', path: '/evolution' },
    { icon: User, label: 'Profil', path: '/profile' },
  ];

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="w-64 h-screen bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800/60 hidden lg:flex flex-col sticky top-0 shrink-0">
      <div className="h-16 px-6 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
          <Activity size={17} className="text-white" />
        </div>
        <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">MedScan</span>
        <span className="ml-auto text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">Beta</span>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/60">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate leading-tight">{profile?.name || '—'}</p>
            <p className="text-xs text-zinc-400 leading-tight">Delogare</p>
          </div>
          <LogOut size={15} className="text-zinc-400 group-hover:text-red-500 transition-colors shrink-0" />
        </button>
      </div>
    </aside>
  );
}
