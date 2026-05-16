'use client';
// src/app/goals/page.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Target, CheckCircle2 } from 'lucide-react';
import { cn, calcProgress, formatDate } from '@/lib/utils';
import type { Goal, Subject } from '@/types/database';
import toast from 'react-hot-toast';

export default function GoalsPage() {
  const supabase = createClient();
  const [goals, setGoals]         = useState<Goal[]>([]);
  const [subjects, setSubjects]   = useState<Subject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '', target_value: 10, unit: 'horas',
    deadline: '', subject_id: '',
  });

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const [{ data: g }, { data: s }] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('subjects').select('id,name,color').eq('user_id', user!.id),
    ]);
    setGoals(g ?? []);
    setSubjects(s as Subject[] ?? []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('goals').insert({
      ...form,
      user_id:       user!.id,
      current_value: 0,
      completed:     false,
      subject_id:    form.subject_id || null,
      deadline:      form.deadline || null,
    });
    if (error) { toast.error('Erro ao salvar'); return; }
    toast.success('Meta criada');
    setShowModal(false);
    setForm({ title: '', target_value: 10, unit: 'horas', deadline: '', subject_id: '' });
    load();
  };

  const updateProgress = async (goal: Goal, delta: number) => {
    const next = Math.max(0, Math.min(goal.target_value, goal.current_value + delta));
    const completed = next >= goal.target_value;
    await supabase.from('goals').update({ current_value: next, completed }).eq('id', goal.id);
    if (completed) toast.success('Meta concluida!');
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id);
    toast.success('Meta removida');
    load();
  };

  const active    = goals.filter(g => !g.completed);
  const completed = goals.filter(g => g.completed);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Metas</h2>
          <p className="text-sm text-ink-muted mt-0.5">{active.length} ativa{active.length !== 1 ? 's' : ''} — {completed.length} concluida{completed.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nova meta
        </button>
      </div>

      {/* Metas ativas */}
      <div>
        <h3 className="font-semibold text-ink mb-3">Em andamento</h3>
        {active.length === 0 ? (
          <div className="card p-10 text-center">
            <Target className="w-10 h-10 text-ink-faint mx-auto mb-3" />
            <p className="text-sm text-ink-muted mb-4">Nenhuma meta ativa. Defina seus objetivos!</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">Criar meta</button>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map(goal => {
              const pct  = calcProgress(goal.current_value, goal.target_value);
              const subj = subjects.find(s => s.id === goal.subject_id);
              return (
                <div key={goal.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink">{goal.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {subj && (
                          <span className="flex items-center gap-1 text-xs text-ink-muted">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subj.color }} />
                            {subj.name}
                          </span>
                        )}
                        {goal.deadline && (
                          <span className="text-xs text-ink-faint">Prazo: {formatDate(goal.deadline)}</span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => remove(goal.id)} className="text-ink-faint hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-ink-muted mb-1.5">
                      <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
                      <span className="font-semibold text-accent">{pct}%</span>
                    </div>
                    <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full progress-bar" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => updateProgress(goal, -1)} className="btn-secondary px-3 py-1 text-xs">-1</button>
                    <button onClick={() => updateProgress(goal, 1)} className="btn-primary px-3 py-1 text-xs">+1 {goal.unit.replace(/s$/, '')}</button>
                    <button onClick={() => updateProgress(goal, goal.target_value - goal.current_value)} className="btn-secondary px-3 py-1 text-xs ml-auto">Concluir</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Metas concluidas */}
      {completed.length > 0 && (
        <div>
          <h3 className="font-semibold text-ink-muted text-sm mb-3">Concluidas</h3>
          <div className="space-y-2">
            {completed.map(goal => (
              <div key={goal.id} className="card p-4 flex items-center gap-3 opacity-70">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-ink flex-1 line-through">{goal.title}</span>
                <span className="text-xs text-ink-muted">{goal.target_value} {goal.unit}</span>
                <button onClick={() => remove(goal.id)} className="text-ink-faint hover:text-red-500 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 animate-slide-up">
            <h3 className="text-lg font-bold text-ink mb-5">Nova meta</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Descricao da meta</label>
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Estudar 50 horas de matematica" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Valor alvo</label>
                  <input className="input" type="number" min={1} value={form.target_value} onChange={e => setForm(f => ({ ...f, target_value: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="label">Unidade</label>
                  <input className="input" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="horas, capitulos..." />
                </div>
              </div>
              {subjects.length > 0 && (
                <div>
                  <label className="label">Materia (opcional)</label>
                  <select className="input" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}>
                    <option value="">Sem materia</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="label">Prazo (opcional)</label>
                <input className="input" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={save} disabled={!form.title} className="btn-primary flex-1">Criar meta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
