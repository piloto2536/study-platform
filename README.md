# StudyFlow — Plataforma de Estudos

Plataforma completa de estudos com Next.js 14, Supabase e TailwindCSS.
Pronta para deploy na Vercel e acesso via link na internet.

---

## Funcionalidades

- Autenticacao completa (login, cadastro, logout)
- Dashboard com graficos e estatisticas
- Sistema de materias por categoria
- Gerenciamento de tarefas com prioridade e status
- Calendario de estudos e provas
- Sistema de metas com progresso
- Timer Pomodoro integrado com registro de sessoes
- Notas pessoais com upload de PDFs
- Semana de Provas com contagem regressiva
- Modo escuro/claro persistente
- Totalmente responsivo

---

## Tecnologias

- **Frontend:** Next.js 14 (App Router) + React 18 + TailwindCSS 3
- **Backend:** API Routes do Next.js + Supabase (Postgres)
- **Banco de dados:** Supabase (PostgreSQL + Storage)
- **Autenticacao:** Supabase Auth (email/senha)
- **Deploy:** Vercel

---

## PARTE 1 — Configurar o Supabase

### 1.1 Criar conta e projeto

1. Acesse https://supabase.com e clique em "Start your project"
2. Crie uma conta gratuita
3. Clique em "New project"
4. Escolha um nome (ex: studyflow), senha forte, e regiao (preferencialmente South America)
5. Aguarde o projeto ser criado (cerca de 1 minuto)

### 1.2 Executar o schema SQL

1. No painel do Supabase, clique em **SQL Editor** no menu lateral
2. Clique em **New query**
3. Copie todo o conteudo do arquivo `supabase-schema.sql` e cole na caixa
4. Clique em **Run** (ou Ctrl+Enter)
5. Aguarde a mensagem "Success. No rows returned"

Isso criara todas as tabelas, politicas de segurança e storage bucket.

### 1.3 Copiar as credenciais

1. Clique em **Settings** > **API**
2. Copie os valores:
   - **Project URL** (ex: https://xyzxyz.supabase.co)
   - **anon public** key (chave longa que comeca com eyJ...)

Guarde esses valores — serao usados nos proximos passos.

---

## PARTE 2 — Configurar o projeto localmente

### 2.1 Requisitos

- Node.js versao 18 ou superior: https://nodejs.org
- Git: https://git-scm.com

Verifique com:
```
node --version   # deve mostrar v18.x ou superior
npm --version    # deve mostrar 9.x ou superior
```

### 2.2 Baixar e configurar o projeto

```bash
# 1. Clone o repositorio (ou baixe o ZIP e extraia)
git clone https://github.com/SEU_USUARIO/studyflow.git
cd studyflow

# 2. Instale as dependencias
npm install

# 3. Crie o arquivo de variaveis de ambiente
cp .env.local.example .env.local
```

### 2.3 Preencher o arquivo .env.local

Abra o arquivo `.env.local` em qualquer editor de texto e substitua:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Substitua pelos valores copiados no passo 1.3.

### 2.4 Rodar localmente

```bash
npm run dev
```

Acesse http://localhost:3000 no navegador.
O site estara funcionando com hot-reload (atualiza automaticamente ao salvar arquivos).

---

## PARTE 3 — Publicar na Vercel (deploy online)

### 3.1 Criar conta na Vercel

1. Acesse https://vercel.com
2. Clique em "Sign up" e conecte com sua conta GitHub (recomendado)

### 3.2 Colocar o projeto no GitHub

```bash
# Na pasta do projeto:
git init
git add .
git commit -m "feat: primeiro commit StudyFlow"

# Crie um repositorio no github.com, depois:
git remote add origin https://github.com/SEU_USUARIO/studyflow.git
git branch -M main
git push -u origin main
```

### 3.3 Importar para a Vercel

1. Acesse https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione o repositorio studyflow
4. Clique em "Import"

### 3.4 Configurar variaveis de ambiente na Vercel

Antes de clicar em Deploy, adicione as variaveis:

1. Na tela de configuracao do projeto, role ate **Environment Variables**
2. Adicione cada variavel:

| Nome | Valor |
|------|-------|
| NEXT_PUBLIC_SUPABASE_URL | https://SEU_PROJETO.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | SUA_ANON_KEY |
| NEXT_PUBLIC_APP_URL | https://SEU_PROJETO.vercel.app |

3. Clique em **Deploy**

A Vercel ira buildar e publicar automaticamente.
Em alguns minutos voce tera uma URL como: `https://studyflow-abc123.vercel.app`

### 3.5 Configurar a URL de callback no Supabase

Apos o deploy, volte ao Supabase:

1. Va em **Authentication** > **URL Configuration**
2. Adicione a URL da Vercel em **Site URL**: `https://studyflow-abc123.vercel.app`
3. Em **Redirect URLs**, adicione: `https://studyflow-abc123.vercel.app/**`
4. Salve

---

## PARTE 4 — Atualizar o site no futuro

Cada vez que voce modificar o codigo e fizer push para o GitHub, a Vercel fara o deploy automaticamente.

```bash
# Edite os arquivos que quiser, depois:
git add .
git commit -m "feat: descricao do que mudei"
git push
```

A Vercel detecta o push e publica a nova versao em 1-2 minutos automaticamente.

Para ver o progresso do build: acesse https://vercel.com/dashboard e clique no projeto.

---

## PARTE 5 — Conectar um dominio proprio

### 5.1 Comprar um dominio

Opcoes brasileiras:
- https://registro.br (dominos .com.br)
- https://hostgator.com.br
- https://godaddy.com

### 5.2 Adicionar o dominio na Vercel

1. No painel da Vercel, clique no seu projeto
2. Va em **Settings** > **Domains**
3. Digite seu dominio (ex: `studyflow.com.br`) e clique em **Add**
4. A Vercel mostrara os registros DNS para configurar

### 5.3 Configurar DNS no registrador

Acesse o painel de DNS onde comprou o dominio e adicione:

Para dominio raiz (studyflow.com.br):
- Tipo: **A**
- Nome: **@**
- Valor: **76.76.21.21**

Para subdominio www:
- Tipo: **CNAME**
- Nome: **www**
- Valor: **cname.vercel-dns.com**

A propagacao pode levar ate 48h, mas geralmente e rapida (minutos a horas).

### 5.4 Atualizar URL no Supabase

Apos o dominio funcionar, volte ao Supabase:
1. **Authentication** > **URL Configuration**
2. Atualize Site URL para `https://studyflow.com.br`
3. Adicione em Redirect URLs: `https://studyflow.com.br/**`

Tambem atualize na Vercel:
- Settings > Environment Variables
- Altere `NEXT_PUBLIC_APP_URL` para `https://studyflow.com.br`
- Faca um novo deploy (git push ou clique em Redeploy)

---

## Estrutura de pastas

```
studyflow/
├── src/
│   ├── app/                    # Paginas (Next.js App Router)
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Layout raiz
│   │   ├── globals.css         # Estilos globais + design tokens
│   │   ├── auth/
│   │   │   ├── login/          # Pagina de login
│   │   │   └── register/       # Pagina de cadastro
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── subjects/           # Gerenciamento de materias
│   │   ├── tasks/              # Sistema de tarefas
│   │   ├── calendar/           # Calendario
│   │   ├── goals/              # Metas
│   │   ├── pomodoro/           # Timer Pomodoro
│   │   ├── notes/              # Notas e PDFs
│   │   └── exams/              # Semana de Provas
│   ├── components/
│   │   ├── ui/                 # Componentes base (ThemeProvider)
│   │   ├── layout/             # Sidebar, TopBar
│   │   └── dashboard/          # Graficos e cards do dashboard
│   ├── lib/
│   │   ├── supabase/           # Clientes Supabase (browser, server, middleware)
│   │   └── utils.ts            # Funcoes utilitarias
│   └── types/
│       └── database.ts         # Tipos TypeScript do banco
├── middleware.ts               # Protecao de rotas
├── supabase-schema.sql         # Schema do banco de dados
├── .env.local.example          # Modelo de variaveis de ambiente
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Comandos rapidos

```bash
npm run dev      # Rodar localmente (http://localhost:3000)
npm run build    # Gerar build de producao
npm run start    # Rodar build de producao localmente
npm run lint     # Verificar erros de codigo
```

---

## Solucao de problemas comuns

**Erro: "Invalid login credentials"**
- Verifique se o usuario foi criado corretamente no Supabase > Authentication > Users

**Pagina em branco apos login**
- Verifique as variaveis de ambiente no .env.local
- Confirme que o schema SQL foi executado com sucesso

**Erro de CORS no Supabase**
- Adicione a URL correta em Supabase > Authentication > URL Configuration

**Build falha na Vercel**
- Verifique se todas as variaveis de ambiente foram adicionadas na Vercel
- Veja os logs de build no painel da Vercel
