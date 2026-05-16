// src/app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { formatDuration, calcProgress } from '@/lib/utils';
import { BarChart3, CheckSquare, Clock, Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Busca dados em paralelo
  const [
    { data: profile },
    { data: subjects },
    { data: tasks },
    { data: sessions },
    { data: goals },
    { data: exams },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('subjects').select('*').eq('user_id', user!.id),
    supabase.from('tasks').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('study_sessions').select('*').eq('user_id', user!.id),
    supabase.from('goals').select('*').eq('user_id', user!.id).eq('completed', false),
    supabase.from('exams').select('*').eq('user_id', user!.id).gte('exam_date', new Date().toISOString()).order('exam_date').limit(3),
  ]);

  const totalMinutes  = sessions?.reduce((sum, s) => sum + s.duration_minutes, 0) ?? 0;
  const doneTasks     = tasks?.filter(t => t.status === 'done').length ?? 0;
  const pendingTasks  = tasks?.filter(t => t.status !== 'done').length ?? 0;
  const weeklyGoalPct = calcProgress(Math.round(totalMinutes / 60), profile?.weekly_goal_hours ?? 20);

  const statsCards = [
    {
      icon: Clock,
      label: 'Tempo total de estudo',
      value: formatDuration(totalMinutes),
      color: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-brand-50 dark:bg-brand-950/40',
    },
    {
      icon: CheckSquare,
      label: 'Tarefas concluidas',
      value: `${doneTasks} / ${(tasks?.length ?? 0)}`,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      icon: BarChart3,
      label: 'Materias ativas',
      value: String(subjects?.length ?? 0),
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/40',
    },
    {
      icon: Target,
      label: 'Meta semanal',
      value: `${weeklyGoalPct}%`,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
    },
  ];

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Estudante';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
      {/* Saudacao */}
      <div>
        <h2 className="text-2xl font-bold text-ink">Bom dia, {firstName}</h2>
        <p className="text-sm text-ink-muted mt-0.5">
          {pendingTasks > 0
            ? `Voce tem ${pendingTasks} tarefas pendentes hoje.`
            : 'Todas as tarefas concluidas. Otimo trabalho!'}
        </p>
      </div>

      {/* Prova proxima (alerta) */}
      {exams && exams.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
              Proxima prova — {exams[0].title}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
              {new Date(exams[0].exam_date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <Link href="/exams" className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1 hover:underline">
            Ver todas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map(card => (
          <div key={card.label} className="card p-5">
            <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-ink">{card.value}</div>
            <div className="text-xs text-ink-muted mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Grafico semanal */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-ink">Estudo por dia</h3>
            <span className="text-xs text-ink-muted">Ultimos 7 dias</span>
          </div>
          <WeeklyChart sessions={sessions ?? []} />
        </div>

        {/* Progresso de materias */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink">Progresso</h3>
            <Link href="/subjects" className="text-xs text-accent hover:underline">Ver tudo</Link>
          </div>
          <div className="space-y-4">
            {subjects?.slice(0, 5).map(subject => {
              const pct = calcProgress(subject.studied_hours, subject.target_hours);
              return (
                <div key={subject.id}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-ink truncate">{subject.name}</span>
                    <span className="text-ink-muted ml-2 shrink-0">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full progress-bar"
                      style={{ width: `${pct}%`, backgroundColor: subject.color }}
                    />
                  </div>
                </div>
              );
            })}
            {(!subjects || subjects.length === 0) && (
              <p className="text-sm text-ink-muted text-center py-4">
                Nenhuma materia ainda.{' '}
                <Link href="/subjects" className="text-accent hover:underline">Adicionar</Link>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Atividade recente */}
      <RecentActivity tasks={tasks ?? []} />
    </div>
  );
}
