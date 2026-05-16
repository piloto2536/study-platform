'use client';
// src/app/tasks/page.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, CheckCircle2, Circle, Clock, Trash2, Filter } from 'lucide-react';
import { cn, priorityBadge, priorityLabel, statusLabel, formatDate } from '@/lib/utils';
import type { Task, Subject } from '@/types/database';
import toast from 'react-hot-toast';

type Filter = 'all' | 'pending' | 'in_progress' | 'done';

export default function TasksPage() {
  const supabase = createClient();
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filter, setFilter]     = useState<Filter>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', due_date: '',
    priority: 'medium' as Task['priority'],
    subject_id: '',
  });

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const [{ data: t }, { data: s }] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('subjects').select('id,name,color').eq('user_id', user!.id),
    ]);
    setTasks(t ?? []);
    setSubjects(s as Subject[] ?? []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('tasks').insert({
      ...form,
      user_id: user!.id,
      status: 'pending',
      subject_id: form.subject_id || null,
      due_date: form.due_date || null,
    });
    if (error) { toast.error('Erro ao salvar'); return; }
    toast.success('Tarefa criada');
    setShowModal(false);
    setForm({ title: '', description: '', due_date: '', priority: 'medium', subject_id: '' });
    load();
  };

  const toggleStatus = async (task: Task) => {
    const next = task.status === 'done' ? 'pending' : task.status === 'pending' ? 'in_progress' : 'done';
    await supabase.from('tasks').update({ status: next }).eq('id', task.id);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    toast.success('Tarefa removida');
    load();
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const counts   = {
    all:         tasks.length,
    pending:     tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done:        tasks.filter(t => t.status === 'done').length,
  };

  const StatusIcon = ({ status }: { status: Task['status'] }) => {
    if (status === 'done')        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (status === 'in_progress') return <Clock className="w-5 h-5 text-amber-500" />;
    return <Circle className="w-5 h-5 text-ink-faint" />;
  };

  const filterTabs: { key: Filter; label: string }[] = [
    { key: 'all',         label: `Todas (${counts.all})` },
    { key: 'pending',     label: `Pendentes (${counts.pending})` },
    { key: 'in_progress', label: `Em andamento (${counts.in_progress})` },
    { key: 'done',        label: `Concluidas (${counts.done})` },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Tarefas</h2>
          <p className="text-sm text-ink-muted mt-0.5">{counts.pending} pendente{counts.pending !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nova tarefa
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              filter === tab.key
                ? 'bg-accent text-white'
                : 'bg-surface-0 border border-border text-ink-muted hover:text-ink'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="card divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-ink-muted">Nenhuma tarefa encontrada.</p>
          </div>
        ) : filtered.map(task => {
          const subj = subjects.find(s => s.id === task.subject_id);
          return (
            <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-surface-1 transition-colors">
              <button onClick={() => toggleStatus(task)} className="shrink-0 hover:scale-110 transition-transform">
                <StatusIcon status={task.status} />
              </button>

              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-medium text-ink',
                  task.status === 'done' && 'line-through text-ink-muted'
                )}>
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {subj && (
                    <span className="flex items-center gap-1 text-xs text-ink-muted">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subj.color }} />
                      {subj.name}
                    </span>
                  )}
                  {task.due_date && (
                    <span className="text-xs text-ink-faint">{formatDate(task.due_date)}</span>
                  )}
                </div>
              </div>

              <span className={cn('badge shrink-0', priorityBadge(task.priority))}>
                {priorityLabel[task.priority]}
              </span>

              <button onClick={() => remove(task.id)} className="text-ink-faint hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 animate-slide-up">
            <h3 className="text-lg font-bold text-ink mb-5">Nova tarefa</h3>

            <div className="space-y-4">
              <div>
                <label className="label">Titulo</label>
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="O que precisa ser feito?" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Prioridade</label>
                  <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))}>
                    <option value="low">Baixa</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="label">Prazo</label>
                  <input className="input" type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
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
                <label className="label">Descricao (opcional)</label>
                <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={save} disabled={!form.title} className="btn-primary flex-1">Criar tarefa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
