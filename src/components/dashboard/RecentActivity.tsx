'use client';
// src/components/dashboard/RecentActivity.tsx
import Link from 'next/link';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn, timeAgo, priorityBadge, priorityLabel, statusLabel } from '@/lib/utils';
import type { Task } from '@/types/database';

interface Props { tasks: Task[] }

const StatusIcon = ({ status }: { status: Task['status'] }) => {
  if (status === 'done')        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
  if (status === 'in_progress') return <Clock className="w-4 h-4 text-amber-500 shrink-0" />;
  return <Circle className="w-4 h-4 text-ink-faint shrink-0" />;
};

export function RecentActivity({ tasks }: Props) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-ink">Tarefas recentes</h3>
        <Link href="/tasks" className="text-xs text-accent hover:underline">Ver todas</Link>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-ink-muted">Nenhuma tarefa ainda.</p>
          <Link href="/tasks" className="text-sm text-accent hover:underline mt-1 block">
            Criar primeira tarefa
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 py-3">
              <StatusIcon status={task.status} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-medium text-ink truncate',
                  task.status === 'done' && 'line-through text-ink-muted'
                )}>
                  {task.title}
                </p>
                <p className="text-xs text-ink-faint mt-0.5">{timeAgo(task.created_at)}</p>
              </div>
              <span className={cn('badge', priorityBadge(task.priority))}>
                {priorityLabel[task.priority]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
