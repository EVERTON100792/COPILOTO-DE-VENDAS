-- Sales Negotiator AI — Schema inicial (Supabase/PostgreSQL)
-- Fase de migração: o app hoje persiste no localStorage (store.ts).
-- Este schema mapeia o domínio para o futuro backend em nuvem.

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------
-- empresas
-- ------------------------------------------------------------------
create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text default '',
  whatsapp text default '',
  instagram text default '',
  facebook text default '',
  google_maps text default '',
  nota_google numeric(2,1) default 4.5,
  qtd_avaliacoes int default 0,
  cidade text default '',
  estado text default '',
  categoria text default '',
  descricao text default '',
  site_atual text default '',
  novo_site_criado boolean default false,
  valor_pretendido numeric(12,2) default 0,
  valor_negociado numeric(12,2) default 0,
  status text not null default 'AGUARDANDO_ABORDAGEM',
  classificacao text default 'MORNO',
  ultimo_contato date,
  proximo_contato date,
  campanha_id uuid,
  responsavel text default 'Você',
  tags text[] default '{}',
  observacoes text default '',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- mensagens (conversa por empresa)
-- ------------------------------------------------------------------
create table if not exists public.mensagens (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  autor text not null check (autor in ('vendedor','cliente')),
  texto text not null,
  data text not null,
  hora text not null,
  criado_em timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- analises (resultado do motor de IA por empresa)
-- ------------------------------------------------------------------
create table if not exists public.analises (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  interesse int,
  objecoes_detectadas text[] default '{}',
  emocao text,
  perfil_psicologico text,
  perfil_comprador text,
  nivel_confianca int,
  nivel_urgencia int,
  poder_decisao int,
  probabilidade_fechamento int,
  classificacao text,
  tags text[] default '{}',
  estrategia jsonb,
  criado_em timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- tarefas
-- ------------------------------------------------------------------
create table if not exists public.tarefas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  titulo text not null,
  concluida boolean default false,
  prazo date,
  criado_em timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- arquivos (anexos por empresa)
-- ------------------------------------------------------------------
create table if not exists public.arquivos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome text not null,
  url text not null,
  tipo text default '',
  criado_em timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- campanhas
-- ------------------------------------------------------------------
create table if not exists public.campanhas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cidade text default '',
  segmento text default '',
  quantidade int default 0,
  data_inicio date,
  objetivo text default '',
  status text default 'ATIVA',
  observacoes text default '',
  criado_em timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- configuracoes (perfil do vendedor, IA)
-- ------------------------------------------------------------------
create table if not exists public.configuracoes (
  id uuid primary key default gen_random_uuid(),
  nome_vendedor text default '',
  nome_agencia text default '',
  openrouter_key text default '',
  modelo_ia text default 'openai/gpt-4o-mini',
  usar_ia_real boolean default false,
  lingua text default 'pt-BR'
);

-- índices de uso comum
create index if not exists idx_mensagens_empresa on public.mensagens (empresa_id);
create index if not exists idx_analises_empresa on public.analises (empresa_id);
create index if not exists idx_tarefas_empresa on public.tarefas (empresa_id);
create index if not exists idx_arquivos_empresa on public.arquivos (empresa_id);
create index if not exists idx_empresas_campanha on public.empresas (campanha_id);
create index if not exists idx_empresas_status on public.empresas (status);
create index if not exists idx_empresas_cidade on public.empresas (cidade);
create index if not exists idx_empresas_categoria on public.empresas (categoria);

-- RLS: habilitar quando houver autenticação
alter table public.empresas enable row level security;
alter table public.mensagens enable row level security;
alter table public.analises enable row level security;
alter table public.tarefas enable row level security;
alter table public.arquivos enable row level security;
alter table public.campanhas enable row level security;
alter table public.configuracoes enable row level security;