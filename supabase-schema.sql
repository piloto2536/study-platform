-- ============================================================
-- StudyFlow — Schema SQL para Supabase
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- Habilita extensao de UUID
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────
-- ENUM: categorias de estudo
-- ─────────────────────────────────────────────────
create type study_category as enum (
  'escola', 'ensino_medio', 'faculdade', 'vestibular',
  'enem', 'cursos_online', 'programacao', 'idiomas',
  'concursos', 'personalizado'
);

-- ─────────────────────────────────────────────────
-- TABELA: profiles (perfis de usuario)
-- ─────────────────────────────────────────────────
create table profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text not null,
  full_name           text,
  avatar_url          text,
  study_area          text,
  theme               text default 'light' check (theme in ('light', 'dark')),
  weekly_goal_hours   integer default 20,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- Trigger: atualiza updated_at automaticamente
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────────
-- TABELA: subjects (materias)
-- ─────────────────────────────────────────────────
create table subjects (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references profiles(id) on delete cascade,
  name           text not null,
  color          text not null default '#2952ff',
  category       study_category not null default 'personalizado',
  description    text,
  target_hours   integer not null default 50,
  studied_hours  numeric(8,2) not null default 0,
  created_at     timestamptz default now()
);

-- ─────────────────────────────────────────────────
-- TABELA: tasks (tarefas)
-- ─────────────────────────────────────────────────
create table tasks (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  subject_id   uuid references subjects(id) on delete set null,
  title        text not null,
  description  text,
  due_date     date,
  priority     text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status       text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  created_at   timestamptz default now()
);

-- ─────────────────────────────────────────────────
-- TABELA: goals (metas)
-- ─────────────────────────────────────────────────
create table goals (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references profiles(id) on delete cascade,
  subject_id     uuid references subjects(id) on delete set null,
  title          text not null,
  target_value   numeric(10,2) not null default 1,
  current_value  numeric(10,2) not null default 0,
  unit           text not null default 'horas',
  deadline       date,
  completed      boolean not null default false,
  created_at     timestamptz default now()
);

-- ─────────────────────────────────────────────────
-- TABELA: exams (provas)
-- ─────────────────────────────────────────────────
create table exams (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  subject_id   uuid references subjects(id) on delete set null,
  title        text not null,
  exam_date    timestamptz not null,
  location     text,
  notes        text,
  priority     text not null default 'high' check (priority in ('low', 'medium', 'high')),
  created_at   timestamptz default now()
);

-- ─────────────────────────────────────────────────
-- TABELA: study_sessions (sessoes de estudo / pomodoro)
-- ─────────────────────────────────────────────────
create table study_sessions (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references profiles(id) on delete cascade,
  subject_id         uuid references subjects(id) on delete set null,
  duration_minutes   integer not null default 25,
  session_date       date not null default current_date,
  notes              text,
  created_at         timestamptz default now()
);

-- ─────────────────────────────────────────────────
-- TABELA: notes (notas pessoais)
-- ─────────────────────────────────────────────────
create table notes (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  subject_id   uuid references subjects(id) on delete set null,
  title        text not null,
  content      text not null default '',
  tags         text[] not null default '{}',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create trigger notes_updated_at
  before update on notes
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────────
-- TABELA: uploads (PDFs)
-- ─────────────────────────────────────────────────
create table uploads (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  subject_id   uuid references subjects(id) on delete set null,
  file_name    text not null,
  file_path    text not null,
  file_size    bigint not null,
  mime_type    text not null,
  created_at   timestamptz default now()
);

-- ─────────────────────────────────────────────────
-- ROW LEVEL SECURITY — cada usuario ve apenas seus dados
-- ─────────────────────────────────────────────────
alter table profiles      enable row level security;
alter table subjects       enable row level security;
alter table tasks          enable row level security;
alter table goals          enable row level security;
alter table exams          enable row level security;
alter table study_sessions enable row level security;
alter table notes          enable row level security;
alter table uploads        enable row level security;

-- Politicas para profiles
create policy "profiles_own" on profiles
  for all using (auth.uid() = id);

-- Politica generica: usuario acessa apenas seus proprios dados
create policy "subjects_own"  on subjects       for all using (auth.uid() = user_id);
create policy "tasks_own"     on tasks          for all using (auth.uid() = user_id);
create policy "goals_own"     on goals          for all using (auth.uid() = user_id);
create policy "exams_own"     on exams          for all using (auth.uid() = user_id);
create policy "sessions_own"  on study_sessions for all using (auth.uid() = user_id);
create policy "notes_own"     on notes          for all using (auth.uid() = user_id);
create policy "uploads_own"   on uploads        for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────
-- STORAGE: bucket para PDFs (execute no SQL Editor)
-- ─────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('uploads', 'uploads', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create policy "storage_own_upload"
  on storage.objects for insert
  with check (auth.uid()::text = (storage.foldername(name))[1]);

create policy "storage_own_read"
  on storage.objects for select
  using (auth.uid()::text = (storage.foldername(name))[1]);

create policy "storage_own_delete"
  on storage.objects for delete
  using (auth.uid()::text = (storage.foldername(name))[1]);

-- ─────────────────────────────────────────────────
-- FUNCAO: cria perfil automaticamente apos registro
-- ─────────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, study_area)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'study_area'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
