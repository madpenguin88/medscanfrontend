import { Link, useLocation } from 'react-router-dom';
import { FileText, Home, Upload, User, TrendingUp } from 'lucide-react';

export function MobileNav() {
  const location = useLocation();
  const navItems = [
    { icon: Home, label: 'Acasă', path: '/dashboard' },
    { icon: Upload, label: 'Upload', path: '/upload' },
    { icon: FileText, label: 'Analize', path: '/records' },
    { icon: TrendingUp, label: 'Evoluție', path: '/evolution' },
    { icon: User, label: 'Profil', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800/60 flex safe-area-inset-bottom">
      {navItems.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 pb-3 text-[10px] font-semibold transition-colors ${
              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
