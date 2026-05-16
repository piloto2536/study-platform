'use client';
// src/components/layout/Sidebar.tsx
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, CheckSquare, Calendar,
  Target, Clock, FileText, AlertTriangle, LogOut, Settings,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types/database';

const navGroups = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard',  icon: LayoutDashboard, label: 'Visao geral' },
      { href: '/subjects',   icon: BookOpen,         label: 'Materias' },
      { href: '/tasks',      icon: CheckSquare,      label: 'Tarefas' },
      { href: '/calendar',   icon: Calendar,         label: 'Calendario' },
    ],
  },
  {
    label: 'Ferramentas',
    items: [
      { href: '/goals',    icon: Target,      label: 'Metas' },
      { href: '/pomodoro', icon: Clock,       label: 'Pomodoro' },
      { href: '/notes',    icon: FileText,    label: 'Notas e PDFs' },
      { href: '/exams',    icon: AlertTriangle, label: 'Semana de Provas' },
    ],
  },
];

interface SidebarProps {
  profile: Profile | null;
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success('Ate logo!');
    router.push('/auth/login');
    router.refresh();
  };

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className="hidden md:flex flex-col border-r border-border bg-surface-0"
      style={{ width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)' }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <span className="text-lg font-bold tracking-tight text-ink">StudyFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="section-title">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    isActive(item.href) ? 'sidebar-link-active' : 'sidebar-link',
                    item.href === '/exams' && 'text-amber-600 dark:text-amber-400 hover:text-amber-700'
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-border p-3 space-y-0.5">
        <Link href="/settings" className="sidebar-link">
          <Settings className="w-4 h-4" />
          Configuracoes
        </Link>
        <button onClick={signOut} className="sidebar-link w-full text-left text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
          <LogOut className="w-4 h-4" />
          Sair
        </button>
        <div className="mt-2 pt-2 border-t border-border flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink truncate">{profile?.full_name ?? 'Usuario'}</p>
            <p className="text-xs text-ink-faint truncate">{profile?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
