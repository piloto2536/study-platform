'use client';
// src/app/pomodoro/page.tsx
import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import type { Subject } from '@/types/database';

type Phase = 'focus' | 'short_break' | 'long_break';

const PHASES: Record<Phase, { label: string; minutes: number; color: string }> = {
  focus:       { label: 'Foco',          minutes: 25, color: 'text-accent' },
  short_break: { label: 'Pausa curta',   minutes: 5,  color: 'text-emerald-500' },
  long_break:  { label: 'Pausa longa',   minutes: 15, color: 'text-violet-500' },
};

export default function PomodoroPage() {
  const supabase = createClient();
  const [phase, setPhase]           = useState<Phase>('focus');
  const [seconds, setSeconds]       = useState(25 * 60);
  const [running, setRunning]       = useState(false);
  const [sessions, setSessions]     = useState(0);
  const [subjects, setSubjects]     = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('subjects').select('id,name,color').eq('user_id', user!.id);
      setSubjects(data as Subject[] ?? []);
    })();
  }, []);

  const switchPhase = useCallback((p: Phase) => {
    setPhase(p);
    setSeconds(PHASES[p].minutes * 60);
    setRunning(false);
  }, []);

  // Logica do timer
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(id);
          setRunning(false);

          if (phase === 'focus') {
            const next = (sessions + 1) % 4 === 0 ? 'long_break' : 'short_break';
            setSessions(prev => prev + 1);
            toast.success('Sessao de foco concluida!');

            // Salva sessao no banco
            (async () => {
              const { data: { user } } = await supabase.auth.getUser();
              await supabase.from('study_sessions').insert({
                user_id:          user!.id,
                subject_id:       selectedSubject || null,
                duration_minutes: PHASES.focus.minutes,
                session_date:     new Date().toISOString().split('T')[0],
              });
            })();

            switchPhase(next);
          } else {
            toast.success('Pausa encerrada. Hora de focar!');
            switchPhase('focus');
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, phase, sessions, selectedSubject, switchPhase]);

  const minutes  = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs     = (seconds % 60).toString().padStart(2, '0');
  const total    = PHASES[phase].minutes * 60;
  const progress = ((total - seconds) / total) * 100;
  const radius   = 90;
  const circ     = 2 * Math.PI * radius;
  const offset   = circ - (progress / 100) * circ;

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-ink">Pomodoro</h2>
        <p className="text-sm text-ink-muted mt-0.5">Mantenha o foco com sessoes cronometradas</p>
      </div>

      {/* Phase tabs */}
      <div className="card p-1.5 flex gap-1">
        {(Object.entries(PHASES) as [Phase, typeof PHASES[Phase]][]).map(([key, val]) => (
          <button
            key={key}
            onClick={() => switchPhase(key)}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all',
              phase === key ? 'bg-accent text-white shadow-sm' : 'text-ink-muted hover:text-ink'
            )}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Timer SVG */}
      <div className="card p-10 flex flex-col items-center">
        <div className="relative w-52 h-52 mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Track */}
            <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--surface-2)" strokeWidth="8" />
            {/* Progress */}
            <circle
              cx="100" cy="100" r={radius}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold font-mono text-ink tracking-tight">
              {minutes}:{secs}
            </span>
            <span className={cn('text-sm font-medium mt-1', PHASES[phase].color)}>
              {PHASES[phase].label}
            </span>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setSeconds(PHASES[phase].minutes * 60); setRunning(false); }}
            className="btn-secondary p-3 rounded-full"
            aria-label="Resetar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setRunning(r => !r)}
            className="btn-primary w-16 h-16 rounded-full flex items-center justify-center shadow-glow"
            aria-label={running ? 'Pausar' : 'Iniciar'}
          >
            {running
              ? <Pause className="w-6 h-6 fill-white" />
              : <Play className="w-6 h-6 fill-white ml-0.5" />
            }
          </button>

          <button
            onClick={() => switchPhase(phase === 'focus' ? 'short_break' : 'focus')}
            className="btn-secondary p-3 rounded-full"
            aria-label="Pular"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 text-center">
          <div className="text-3xl font-bold text-ink">{sessions}</div>
          <div className="text-xs text-ink-muted mt-1">Sessoes hoje</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-3xl font-bold text-ink">{sessions * 25}min</div>
          <div className="text-xs text-ink-muted mt-1">Tempo de foco</div>
        </div>
      </div>

      {/* Materia */}
      {subjects.length > 0 && (
        <div className="card p-5">
          <label className="label">Estudando agora</label>
          <select
            className="input"
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
          >
            <option value="">Sem materia especifica</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
