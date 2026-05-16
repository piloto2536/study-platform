'use client';
// src/components/dashboard/WeeklyChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { subDays, format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Session } from '@/types/database';

interface Props { sessions: Session[] }

export function WeeklyChart({ sessions }: Props) {
  // Agrupa sessoes por dia (ultimos 7 dias)
  const data = Array.from({ length: 7 }, (_, i) => {
    const day  = subDays(new Date(), 6 - i);
    const key  = format(day, 'yyyy-MM-dd');
    const mins = sessions
      .filter(s => s.session_date.startsWith(key))
      .reduce((sum, s) => sum + s.duration_minutes, 0);
    return {
      day:   format(day, 'EEE', { locale: ptBR }),
      horas: parseFloat((mins / 60).toFixed(1)),
      isToday: i === 6,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-surface-0 border border-border rounded-xl px-3 py-2 text-xs shadow-card-md">
          <span className="font-semibold text-ink">{payload[0].value}h</span>
          <span className="text-ink-muted"> de estudo</span>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barSize={24} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: 'var(--ink-faint)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--ink-faint)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${v}h`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-2)', radius: 6 }} />
        <Bar dataKey="horas" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.isToday ? 'var(--accent)' : 'var(--surface-3)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
