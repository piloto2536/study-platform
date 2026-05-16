'use client';
// src/app/calendar/page.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Exam, Task } from '@/types/database';

export default function CalendarPage() {
  const supabase = createClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [exams, setExams]   = useState<Exam[]>([]);
  const [tasks, setTasks]   = useState<Task[]>([]);
  const [selected, setSelected] = useState<Date>(new Date());

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const [{ data: e }, { data: t }] = await Promise.all([
        supabase.from('exams').select('*').eq('user_id', user!.id),
        supabase.from('tasks').select('*').eq('user_id', user!.id).not('due_date', 'is', null),
      ]);
      setExams(e ?? []);
      setTasks(t ?? []);
    })();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd   = endOfMonth(monthStart);
  const startDate  = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate    = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) { days.push(day); day = addDays(day, 1); }

  const eventsOnDay = (d: Date) => {
    const dayStr = format(d, 'yyyy-MM-dd');
    const dayExams = exams.filter(e => e.exam_date.startsWith(dayStr));
    const dayTasks = tasks.filter(t => t.due_date?.startsWith(dayStr));
    return { exams: dayExams, tasks: dayTasks };
  };

  const selectedEvents = eventsOnDay(selected);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-ink">Calendario</h2>
        <p className="text-sm text-ink-muted mt-0.5">Provas e tarefas organizadas por data</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2 card p-6">
          {/* Header navegacao */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-ink capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <div className="flex gap-1">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="btn-ghost p-1.5 rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="btn-secondary px-3 py-1 text-xs">Hoje</button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="btn-ghost p-1.5 rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(d => (
              <div key={d} className="text-xs text-ink-faint text-center font-medium py-2">{d}</div>
            ))}
          </div>

          {/* Grid de dias */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((d, i) => {
              const { exams: de, tasks: dt } = eventsOnDay(d);
              const hasEvents  = de.length > 0 || dt.length > 0;
              const isToday    = isSameDay(d, new Date());
              const isSelected = isSameDay(d, selected);
              const inMonth    = isSameMonth(d, currentDate);
              const hasExam    = de.length > 0;

              return (
                <button
                  key={i}
                  onClick={() => setSelected(d)}
                  className={cn(
                    'relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all',
                    !inMonth && 'opacity-30',
                    isToday && !isSelected && 'bg-brand-50 dark:bg-brand-950/30 text-accent font-semibold',
                    isSelected && 'bg-accent text-white font-semibold',
                    !isToday && !isSelected && inMonth && 'hover:bg-surface-2 text-ink',
                  )}
                >
                  {format(d, 'd')}
                  {hasEvents && !isSelected && (
                    <div className="flex gap-0.5 mt-0.5">
                      {hasExam && <span className="w-1 h-1 rounded-full bg-red-500" />}
                      {dt.length > 0 && <span className="w-1 h-1 rounded-full bg-accent" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Painel do dia selecionado */}
        <div className="card p-6">
          <h3 className="font-semibold text-ink mb-4 capitalize">
            {format(selected, "dd 'de' MMMM", { locale: ptBR })}
          </h3>

          {selectedEvents.exams.length === 0 && selectedEvents.tasks.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-8">Nenhum evento neste dia</p>
          ) : (
            <div className="space-y-4">
              {selectedEvents.exams.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Provas</p>
                  <div className="space-y-2">
                    {selectedEvents.exams.map(exam => (
                      <div key={exam.id} className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-3">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">{exam.title}</p>
                        {exam.location && <p className="text-xs text-red-500 mt-0.5">{exam.location}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvents.tasks.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-2">Tarefas</p>
                  <div className="space-y-2">
                    {selectedEvents.tasks.map(task => (
                      <div key={task.id} className="bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900/50 rounded-xl p-3">
                        <p className="text-sm font-medium text-ink">{task.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
