'use client';
// src/app/exams/page.tsx — Semana de Provas
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, AlertTriangle, Clock } from 'lucide-react';
import { cn, priorityBadge, priorityLabel, formatDate, daysUntil } from '@/lib/utils';
import type { Exam, Subject } from '@/types/database';
import toast from 'react-hot-toast';

export default function ExamsPage() {
  const supabase = createClient();
  const [exams, setExams]         = useState<Exam[]>([]);
  const [subjects, setSubjects]   = useState<Subject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '', exam_date: '', location: '',
    notes: '', priority: 'high' as Exam['priority'],
    subject_id: '',
  });

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const [{ data: e }, { data: s }] = await Promise.all([
      supabase.from('exams').select('*').eq('user_id', user!.id).order('exam_date'),
      supabase.from('subjects').select('id,name,color').eq('user_id', user!.id),
    ]);
    setExams(e ?? []);
    setSubjects(s as Subject[] ?? []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('exams').insert({
      ...form,
      user_id:    user!.id,
      subject_id: form.subject_id || null,
      location:   form.location || null,
      notes:      form.notes || null,
    });
    if (error) { toast.error('Erro ao salvar'); return; }
    toast.success('Prova adicionada');
    setShowModal(false);
    setForm({ title: '', exam_date: '', location: '', notes: '', priority: 'high', subject_id: '' });
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('exams').delete().eq('id', id);
    toast.success('Prova removida');
    load();
  };

  const upcoming = exams.filter(e => daysUntil(e.exam_date) >= 0).sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());
  const past     = exams.filter(e => daysUntil(e.exam_date) < 0);

  const urgencyLabel = (days: number) => {
    if (days === 0) return { label: 'Hoje', cls: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' };
    if (days === 1) return { label: 'Amanha', cls: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' };
    if (days <= 3)  return { label: `${days} dias`, cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' };
    if (days <= 7)  return { label: `${days} dias`, cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' };
    return { label: `${days} dias`, cls: 'bg-surface-2 text-ink-muted' };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Semana de Provas</h2>
          <p className="text-sm text-ink-muted mt-0.5">{upcoming.length} prova{upcoming.length !== 1 ? 's' : ''} proxima{upcoming.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Adicionar prova
        </button>
      </div>

      {/* Alerta de provas urgentes */}
      {upcoming.filter(e => daysUntil(e.exam_date) <= 3).length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-semibold text-red-700 dark:text-red-400">Atencao — Provas em menos de 3 dias</span>
          </div>
          <div className="space-y-1">
            {upcoming.filter(e => daysUntil(e.exam_date) <= 3).map(exam => (
              <p key={exam.id} className="text-sm text-red-600 dark:text-red-400">
                {exam.title} — {formatDate(exam.exam_date, 'dd/MM yyyy, HH:mm')}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Proximas provas */}
      <div>
        <h3 className="font-semibold text-ink mb-3">Proximas provas</h3>
        {upcoming.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-sm text-ink-muted">Nenhuma prova proxima cadastrada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(exam => {
              const days = daysUntil(exam.exam_date);
              const urg  = urgencyLabel(days);
              const subj = subjects.find(s => s.id === exam.subject_id);

              return (
                <div key={exam.id} className={cn(
                  'card p-5 flex items-center gap-4',
                  days <= 1 && 'border-red-200 dark:border-red-900/50',
                  days <= 3 && days > 1 && 'border-amber-200 dark:border-amber-900/50',
                )}>
                  {/* Contagem regressiva */}
                  <div className="shrink-0 text-center w-16">
                    <span className={cn('badge text-xs font-bold py-1 px-2', urg.cls)}>
                      {urg.label}
                    </span>
                    <div className="flex items-center gap-1 mt-1.5 justify-center">
                      <Clock className="w-3 h-3 text-ink-faint" />
                      <span className="text-xs text-ink-faint">
                        {formatDate(exam.exam_date, 'HH:mm') !== '00:00' ? formatDate(exam.exam_date, 'HH:mm') : '--:--'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink">{exam.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-ink-muted">{formatDate(exam.exam_date, "dd 'de' MMMM")}</span>
                      {subj && (
                        <span className="flex items-center gap-1 text-xs text-ink-muted">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subj.color }} />
                          {subj.name}
                        </span>
                      )}
                      {exam.location && (
                        <span className="text-xs text-ink-muted">{exam.location}</span>
                      )}
                    </div>
                    {exam.notes && <p className="text-xs text-ink-faint mt-1 line-clamp-1">{exam.notes}</p>}
                  </div>

                  <span className={cn('badge shrink-0', priorityBadge(exam.priority))}>
                    {priorityLabel[exam.priority]}
                  </span>

                  <button onClick={() => remove(exam.id)} className="text-ink-faint hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Provas passadas */}
      {past.length > 0 && (
        <div>
          <h3 className="font-semibold text-ink-muted mb-3 text-sm">Provas passadas</h3>
          <div className="space-y-2">
            {past.reverse().map(exam => (
              <div key={exam.id} className="card p-4 flex items-center gap-3 opacity-60">
                <span className="text-xs text-ink-faint w-16 shrink-0 font-mono">{formatDate(exam.exam_date)}</span>
                <span className="text-sm text-ink-muted flex-1">{exam.title}</span>
                <button onClick={() => remove(exam.id)} className="text-ink-faint hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-ink mb-5">Adicionar prova</h3>

            <div className="space-y-4">
              <div>
                <label className="label">Nome da prova</label>
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Prova de Matematica" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Data e hora</label>
                  <input className="input" type="datetime-local" value={form.exam_date} onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Prioridade</label>
                  <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Exam['priority'] }))}>
                    <option value="low">Baixa</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              {subjects.length > 0 && (
                <div>
                  <label className="label">Materia</label>
                  <select className="input" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}>
                    <option value="">Sem materia</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="label">Local (opcional)</label>
                <input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Sala 5, Bloco B..." />
              </div>

              <div>
                <label className="label">Observacoes (opcional)</label>
                <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={save} disabled={!form.title || !form.exam_date} className="btn-primary flex-1">Salvar prova</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
