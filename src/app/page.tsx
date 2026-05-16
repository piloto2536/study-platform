// src/app/page.tsx — Pagina inicial / Landing Page
import Link from 'next/link';
import { ArrowRight, BookOpen, BarChart3, Calendar, Clock, Target, FileText, CheckCircle } from 'lucide-react';

const features = [
  { icon: BookOpen, title: 'Materias organizadas', desc: 'Gerencie todas as suas materias por categoria com metas e progresso individual.' },
  { icon: BarChart3, title: 'Progresso visual', desc: 'Acompanhe sua evolucao com graficos e relatorios detalhados de estudo.' },
  { icon: Calendar, title: 'Calendario de provas', desc: 'Nunca mais perca uma prova. Sistema de alertas e contagem regressiva.' },
  { icon: Clock, title: 'Pomodoro integrado', desc: 'Tecnica pomodoro nativa para maximizar sua concentracao e produtividade.' },
  { icon: Target, title: 'Sistema de metas', desc: 'Defina objetivos claros e acompanhe seu avanço em tempo real.' },
  { icon: FileText, title: 'Notas e resumos', desc: 'Crie e organize seus resumos com upload de PDFs diretamente na plataforma.' },
];

const categories = [
  'Escola', 'Ensino Medio', 'Faculdade', 'Vestibular',
  'ENEM', 'Cursos Online', 'Programacao', 'Idiomas',
  'Concursos', 'Personalizado',
];

const stats = [
  { value: '10+', label: 'Areas de estudo' },
  { value: '100%', label: 'Gratuito para comecar' },
  { value: '24/7', label: 'Disponivel online' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-0 text-ink">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-surface-0/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">StudyFlow</span>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-sm">Entrar</Link>
            <Link href="/auth/register" className="btn-primary text-sm">Comecar gratis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-brand-100 dark:border-brand-900">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-soft" />
          Plataforma de estudos inteligente
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          Estude com{' '}
          <span className="text-accent">metodo</span>
          <br />e evolua de verdade
        </h1>

        <p className="text-xl text-ink-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Organize suas materias, acompanhe seu progresso, gerencie provas e potencialize sua rotina de estudos em um unico lugar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/auth/register" className="btn-primary px-8 py-3 text-base flex items-center gap-2 group">
            Criar conta gratuita
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/auth/login" className="btn-secondary px-8 py-3 text-base">
            Ja tenho conta
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-10 mt-16 pt-10 border-t border-border">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-ink">{s.value}</div>
              <div className="text-sm text-ink-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="relative rounded-3xl border border-border bg-surface-1 overflow-hidden p-8 shadow-card-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-transparent dark:from-brand-950/20 pointer-events-none" />
          {/* Mock dashboard UI */}
          <div className="relative grid grid-cols-3 gap-4">
            {[
              { label: 'Horas estudadas', value: '24h 30min', color: 'bg-brand-500' },
              { label: 'Tarefas concluidas', value: '18 / 24', color: 'bg-emerald-500' },
              { label: 'Dias de estudo', value: '14 dias', color: 'bg-violet-500' },
            ].map(card => (
              <div key={card.label} className="card p-5">
                <div className={`w-8 h-1 rounded-full ${card.color} mb-3`} />
                <div className="text-2xl font-bold text-ink">{card.value}</div>
                <div className="text-xs text-ink-muted mt-1">{card.label}</div>
              </div>
            ))}
          </div>
          <div className="relative mt-4 card p-5">
            <div className="text-sm font-medium text-ink mb-4">Progresso por materia</div>
            <div className="space-y-3">
              {[
                { name: 'Matematica', pct: 72, color: 'bg-brand-500' },
                { name: 'Portugues', pct: 58, color: 'bg-violet-500' },
                { name: 'Historia', pct: 45, color: 'bg-emerald-500' },
              ].map(m => (
                <div key={m.name}>
                  <div className="flex justify-between text-xs text-ink-muted mb-1.5">
                    <span>{m.name}</span><span>{m.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Tudo que voce precisa</h2>
          <p className="text-lg text-ink-muted">Ferramentas profissionais para uma rotina de estudos eficiente.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <div key={f.title} className="card p-6 hover:shadow-card-md transition-shadow duration-200">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-ink mb-2">{f.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Para todo tipo de estudo</h2>
          <p className="text-lg text-ink-muted">Do ensino basico ate concursos publicos.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map(cat => (
            <span key={cat} className="px-4 py-2 rounded-xl border border-border bg-surface-0 text-sm font-medium text-ink-muted hover:border-accent hover:text-accent transition-colors duration-150 cursor-default">
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-accent rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <h2 className="text-4xl font-bold mb-4 relative">Comece hoje mesmo</h2>
          <p className="text-white/80 text-lg mb-8 relative">Crie sua conta gratuitamente e transforme sua rotina de estudos.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 bg-white text-accent font-semibold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors duration-150 relative">
            Criar conta gratuita <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-ink-faint">
          <span className="font-semibold text-ink-muted">StudyFlow</span>
          <span>Feito para quem leva os estudos a serio</span>
        </div>
      </footer>
    </div>
  );
}
