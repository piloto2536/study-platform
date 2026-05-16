'use client';
// src/app/auth/register/page.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { STUDY_CATEGORIES } from '@/types/database';

const schema = z.object({
  full_name:    z.string().min(2, 'Nome muito curto'),
  email:        z.string().email('E-mail invalido'),
  password:     z.string().min(8, 'Minimo 8 caracteres'),
  study_area:   z.string().min(1, 'Selecione uma area'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name:  data.full_name,
          study_area: data.study_area,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    // Cria perfil na tabela profiles
    if (authData.user) {
      await supabase.from('profiles').upsert({
        id:               authData.user.id,
        email:            data.email,
        full_name:        data.full_name,
        study_area:       data.study_area,
        theme:            'light',
        weekly_goal_hours: 20,
      });
    }

    toast.success('Conta criada com sucesso!');
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm animate-slide-up">
      <div className="card p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ink mb-1">Criar conta</h1>
          <p className="text-sm text-ink-muted">Comece a organizar seus estudos agora</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Nome completo</label>
            <input {...register('full_name')} type="text" placeholder="Seu nome" className="input" />
            {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="label">E-mail</label>
            <input {...register('email')} type="email" placeholder="voce@email.com" className="input" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Senha</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                className="input pr-10"
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted transition-colors">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="label">Area de estudo principal</label>
            <select {...register('study_area')} className="input">
              <option value="">Selecione...</option>
              {Object.entries(STUDY_CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            {errors.study_area && <p className="text-xs text-red-500 mt-1">{errors.study_area.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-2">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Criando conta...' : 'Criar conta gratis'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-6">
          Ja tem conta?{' '}
          <Link href="/auth/login" className="text-accent hover:underline font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
