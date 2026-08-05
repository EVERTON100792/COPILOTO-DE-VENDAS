# Sales Negotiator AI — Copiloto de Vendas

Copiloto de vendas para agências digitais que vendem sites. Cola a conversa do
WhatsApp, o sistema analisa e devolve estratégia completa + 8 respostas prontas
para o vendedor copiar e enviar. **Nunca fala com o cliente diretamente.**

## Funcionalidades

- **Dashboard** — KPIs (valor potencial, vendido, taxa de conversão), pipeline,
  funil, gráficos semanais/mensais e alertas.
- **Empresas** — CRM completo por cliente: timeline, conversas, análises,
  tarefas, anexos, observações, site criado, status do pipeline.
- **Campanhas** — abordagens em massa com mensagens personalizadas (nome,
  nota Google, cidade, segmento), sem repetir cliente.
- **Negociação** — colar conversa → IA separa vendedor/cliente, detecta
  objeções, classifica (Muito Frio → Pronto para Comprar), calcula chance de
  fechamento e gera 8 respostas por tipo:
  Consultiva, Executiva, Premium, Curta, Persuasiva, Educativa, Humanizada, Técnica.
- **Consultor Estratégico** — antes de enviar qualquer mensagem: avaliação
  0–100 (confiança, risco de perder o cliente) + versões forte/elegante/humana.
- **Modo Fechamento** — quando o interesse é alto, prioriza estratégias de
  conversão para fechar.
- **Biblioteca de Objeções** — 300+ objeções com explicação, motivo psicológico,
  técnica, resposta, erros a evitar e chance de reversão.
- **Biblioteca de Copy** — dezenas de mensagens prontas por objetivo, auto-personalizadas.
- **Simulador de Negociação** — treino com 12 perfis (restaurante, dentista,
  advogado, clínica, academia, loja, auto escola, hotel, imobiliária, padaria,
  mercado, oficina).
- **Agenda de Follow-up** — nunca perder contato (hoje, atrasado, próximos,
  frios, quentes, sem agendamento).
- **Relatórios** — abordagens, resposta, fechamento, valor vendido/perdido,
  segmentos/cidades, melhores dias; exportação CSV/Excel/PDF.
- **Análise de Site** — heurística de design, SEO, velocidade, conversão, UX,
  CTA, responsividade + argumentos comerciais gerados.

## Tecnologias

- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, TypeScript,
  TailwindCSS, Framer Motion, React Query, Recharts.
- **IA:** motor heurístico local (funciona sem chave) + OpenRouter opcional
  (`/api/ai`, modelo `openai/gpt-4o-mini`) com fallback automático.
- **Persistência:** localStorage (v1) — pronta para migração Supabase/PostgreSQL.

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de produção
npm run lint       # eslint
```

## IA real (OpenRouter)

1. Rode o app e vá em **Configurações**.
2. Cole a chave OpenRouter e marque "Usar IA real".
3. Sem chave, o sistema usa o motor heurístico local automaticamente.

## Estrutura

```
src/
  app/              # rotas (dashboard, empresas, campanhas, negociação, ...)
  components/       # ui/, layout/, empresas/
  lib/
    ai/             # análise, consultor, objeções, copy, simulador, follow-up, site, gateway
    store.ts        # persistência localStorage + seed
    metrics.ts      # KPIs, pipeline, gráficos, alertas
    types.ts        # domínio
```