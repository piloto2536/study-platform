'use client';
// src/app/subjects/page.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, BookOpen, Trash2, Edit } from 'lucide-react';
import { cn, calcProgress, SUBJECT_COLORS } from '@/lib/utils';
import { STUDY_CATEGORIES } from '@/types/database';
import type { Subject } from '@/types/database';
import toast from 'react-hot-toast';

export default function SubjectsPage() {
  const supabase = createClient();
  const [subjects, setSubjects]   = useState<Subject[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '', color: SUBJECT_COLORS[0], category: 'escola',
    description: '', target_hours: 50,
  });

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('subjects').select('*').eq('user_id', user!.id).order('created_at');
    setSubjects(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('subjects').insert({
      ...form,
      user_id:       user!.id,
      studied_hours: 0,
    });
    if (error) { toast.error('Erro ao salvar'); return; }
    toast.success('Materia criada');
    setShowModal(false);
    setForm({ name: '', color: SUBJECT_COLORS[0], category: 'escola', description: '', target_hours: 50 });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Remover esta materia?')) return;
    await supabase.from('subjects').delete().eq('id', id);
    toast.success('Materia removida');
    load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Materias</h2>
          <p className="text-sm text-ink-muted mt-0.5">{subjects.length} materia{subjects.length !== 1 ? 's' : ''} cadastrada{subjects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nova materia
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 h-40 animate-pulse bg-surface-2" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-10 h-10 text-ink-faint mx-auto mb-3" />
          <p className="font-medium text-ink mb-1">Nenhuma materia ainda</p>
          <p className="text-sm text-ink-muted mb-4">Adicione suas primeiras materias para comecar a organizar seus estudos.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">Adicionar materia</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => {
            const pct = calcProgress(subject.studied_hours, subject.target_hours);
            return (
              <div key={subject.id} className="card p-5 hover:shadow-card-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: subject.color }} />
                    <div>
                      <h3 className="font-semibold text-ink text-sm">{subject.name}</h3>
                      <p className="text-xs text-ink-muted">{STUDY_CATEGORIES[subject.category as keyof typeof STUDY_CATEGORIES]}</p>
                    </div>
                  </div>
                  <button onClick={() => remove(subject.id)} className="text-ink-faint hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {subject.description && (
                  <p className="text-xs text-ink-muted mb-4 line-clamp-2">{subject.description}</p>
                )}

                <div className="mt-auto">
                  <div className="flex justify-between text-xs text-ink-muted mb-1.5">
                    <span>{subject.studied_hours}h estudadas</span>
                    <span>Meta: {subject.target_hours}h</span>
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full progress-bar"
                      style={{ width: `${pct}%`, backgroundColor: subject.color }}
                    />
                  </div>
                  <p className="text-xs text-ink-faint mt-1.5 text-right">{pct}%</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal nova materia */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 animate-slide-up">
            <h3 className="text-lg font-bold text-ink mb-5">Nova materia</h3>

            <div className="space-y-4">
              <div>
                <label className="label">Nome da materia</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Matematica" />
              </div>

              <div>
                <label className="label">Categoria</label>
                <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {Object.entries(STUDY_CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {SUBJECT_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color }))}
                      className={cn('w-7 h-7 rounded-full transition-all', form.color === color && 'ring-2 ring-offset-2 ring-offset-surface-0 ring-ink')}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Meta de horas</label>
                <input className="input" type="number" min={1} value={form.target_hours} onChange={e => setForm(f => ({ ...f, target_hours: Number(e.target.value) }))} />
              </div>

              <div>
                <label className="label">Descricao (opcional)</label>
                <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descricao..." />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={save} disabled={!form.name} className="btn-primary flex-1">Salvar materia</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
