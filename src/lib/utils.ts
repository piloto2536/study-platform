// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInDays, format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/** Combina classes Tailwind com suporte a condicionais */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata data para exibicao em portugues */
export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy') {
  return format(new Date(date), pattern, { locale: ptBR });
}

/** Tempo relativo (ex: "ha 2 dias") */
export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
}

/** Dias restantes ate uma data */
export function daysUntil(date: string | Date) {
  return differenceInDays(new Date(date), new Date());
}

/** Formata minutos em horas e minutos */
export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/** Calcula percentual de progresso */
export function calcProgress(current: number, target: number) {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

/** Cores predefinidas para materias */
export const SUBJECT_COLORS = [
  '#2952ff', '#7c3aed', '#db2777', '#dc2626',
  '#ea580c', '#d97706', '#16a34a', '#0891b2',
  '#0369a1', '#4f46e5', '#7e22ce', '#be185d',
];

/** Retorna classe de prioridade */
export function priorityBadge(priority: 'low' | 'medium' | 'high') {
  return {
    low:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    high:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }[priority];
}

export const priorityLabel: Record<string, string> = {
  low:    'Baixa',
  medium: 'Media',
  high:   'Alta',
};

export const statusLabel: Record<string, string> = {
  pending:     'Pendente',
  in_progress: 'Em andamento',
  done:        'Concluido',
};
