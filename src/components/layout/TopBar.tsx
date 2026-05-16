'use client';
// src/components/layout/TopBar.tsx
import { Moon, Sun, Bell } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeProvider';
import { usePathname } from 'next/navigation';
import type { Profile } from '@/types/database';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'Visao geral',
  '/subjects':   'Materias',
  '/tasks':      'Tarefas',
  '/calendar':   'Calendario',
  '/goals':      'Metas',
  '/pomodoro':   'Pomodoro',
  '/notes':      'Notas e PDFs',
  '/exams':      'Semana de Provas',
  '/settings':   'Configuracoes',
};

export function TopBar({ profile }: { profile: Profile | null }) {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'StudyFlow';

  return (
    <header className="h-16 border-b border-border bg-surface-0 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-base font-semibold text-ink">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Toggle tema */}
        <button
          onClick={toggle}
          className="btn-ghost p-2 rounded-xl"
          aria-label="Alternar tema"
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>

        {/* Notificacoes (placeholder) */}
        <button className="btn-ghost p-2 rounded-xl relative" aria-label="Notificacoes">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-semibold ml-1">
          {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
        </div>
      </div>
    </header>
  );
}
