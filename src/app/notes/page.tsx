'use client';
// src/app/notes/page.tsx
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, FileText, Upload, Search } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import type { Note, Subject } from '@/types/database';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

export default function NotesPage() {
  const supabase = createClient();
  const [notes, setNotes]         = useState<Note[]>([]);
  const [subjects, setSubjects]   = useState<Subject[]>([]);
  const [selected, setSelected]   = useState<Note | null>(null);
  const [search, setSearch]       = useState('');
  const [showNew, setShowNew]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm]           = useState({ title: '', content: '', subject_id: '', tags: '' });

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const [{ data: n }, { data: s }] = await Promise.all([
      supabase.from('notes').select('*').eq('user_id', user!.id).order('updated_at', { ascending: false }),
      supabase.from('subjects').select('id,name,color').eq('user_id', user!.id),
    ]);
    setNotes(n ?? []);
    setSubjects(s as Subject[] ?? []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const { error } = await supabase.from('notes').insert({
      user_id:    user!.id,
      title:      form.title,
      content:    form.content,
      subject_id: form.subject_id || null,
      tags,
    });
    if (error) { toast.error('Erro ao salvar'); return; }
    toast.success('Nota criada');
    setShowNew(false);
    setForm({ title: '', content: '', subject_id: '', tags: '' });
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('notes').delete().eq('id', id);
    if (selected?.id === id) setSelected(null);
    toast.success('Nota removida');
    load();
  };

  // Upload de PDF
  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Apenas arquivos PDF'); return; }
    if (file.size > 10 * 1024 * 1024)   { toast.error('Arquivo muito grande (max 10MB)'); return; }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const path  = `${user!.id}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from('uploads').upload(path, file);
      if (upErr) throw upErr;

      await supabase.from('uploads').insert({
        user_id:    user!.id,
        file_name:  file.name,
        file_path:  path,
        file_size:  file.size,
        mime_type:  file.type,
      });
      toast.success('PDF enviado com sucesso');
    } catch {
      toast.error('Erro no upload');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-ink">Notas e PDFs</h2>
          <p className="text-sm text-ink-muted mt-0.5">{notes.length} nota{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nova nota
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
        {/* Lista de notas */}
        <div className="lg:col-span-2 flex flex-col gap-3 overflow-hidden">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
            <input
              className="input pl-9"
              placeholder="Buscar notas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Upload PDF */}
          <div
            {...getRootProps()}
            className={cn(
              'card p-4 border-dashed cursor-pointer text-center transition-colors',
              isDragActive ? 'border-accent bg-brand-50 dark:bg-brand-950/20' : 'hover:bg-surface-2'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-4 h-4 text-ink-faint mx-auto mb-1" />
            <p className="text-xs text-ink-muted">
              {uploading ? 'Enviando...' : isDragActive ? 'Solte o PDF aqui' : 'Arraste um PDF ou clique'}
            </p>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filtered.length === 0 ? (
              <div className="card p-6 text-center">
                <FileText className="w-8 h-8 text-ink-faint mx-auto mb-2" />
                <p className="text-sm text-ink-muted">Nenhuma nota encontrada</p>
              </div>
            ) : filtered.map(note => {
              const subj = subjects.find(s => s.id === note.subject_id);
              return (
                <button
                  key={note.id}
                  onClick={() => setSelected(note)}
                  className={cn(
                    'card w-full p-4 text-left hover:shadow-card-md transition-shadow',
                    selected?.id === note.id && 'border-accent bg-brand-50/50 dark:bg-brand-950/20'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink truncate">{note.title}</p>
                      <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{note.content}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); remove(note.id); }}
                      className="text-ink-faint hover:text-red-500 transition-colors p-1 shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {subj && (
                      <span className="flex items-center gap-1 text-xs text-ink-faint">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subj.color }} />
                        {subj.name}
                      </span>
                    )}
                    <span className="text-xs text-ink-faint ml-auto">{timeAgo(note.updated_at)}</span>
                  </div>
                  {note.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {note.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="badge bg-surface-2 text-ink-muted">#{tag}</span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor / visualizador */}
        <div className="lg:col-span-3 card p-6 overflow-y-auto">
          {selected ? (
            <div>
              <h3 className="text-xl font-bold text-ink mb-2">{selected.title}</h3>
              <p className="text-xs text-ink-faint mb-6">{timeAgo(selected.updated_at)}</p>
              <div className="prose prose-sm max-w-none text-ink whitespace-pre-wrap leading-relaxed">
                {selected.content}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <FileText className="w-12 h-12 text-ink-faint mx-auto mb-3" />
                <p className="font-medium text-ink mb-1">Selecione uma nota</p>
                <p className="text-sm text-ink-muted">Escolha uma nota da lista para visualizar o conteudo.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal nova nota */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-lg p-6 animate-slide-up">
            <h3 className="text-lg font-bold text-ink mb-5">Nova nota</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Titulo</label>
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titulo da nota..." />
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
                <label className="label">Tags (separadas por virgula)</label>
                <input className="input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="resumo, importante, vestibular..." />
              </div>
              <div>
                <label className="label">Conteudo</label>
                <textarea className="input resize-none" rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Escreva sua nota aqui..." />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowNew(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={save} disabled={!form.title} className="btn-primary flex-1">Salvar nota</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
