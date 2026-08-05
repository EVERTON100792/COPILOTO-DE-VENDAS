import type {
  CampanhaStatus,
  Classificacao,
  CategoriaCopy,
  PipelineStatus,
  Sugestao,
  TipoResposta,
} from "./types";

export const PIPELINE_ORDEM: PipelineStatus[] = [
  "AGUARDANDO_ABORDAGEM",
  "AGUARDANDO_RESPOSTA",
  "INTERESSADA",
  "PROPOSTA_ENVIADA",
  "NEGOCIACAO",
  "FECHADA",
  "PERDIDA",
];

export const STATUS_PIPELINE: Record<
  PipelineStatus,
  { label: string; color: string; dot: string }
> = {
  AGUARDANDO_ABORDAGEM: {
    label: "Aguardando abordagem",
    color: "text-slate-600 bg-slate-500/10 border-slate-500/30",
    dot: "bg-slate-500",
  },
  AGUARDANDO_RESPOSTA: {
    label: "Aguardando resposta",
    color: "text-blue-600 bg-blue-500/10 border-blue-500/30",
    dot: "bg-blue-500",
  },
  INTERESSADA: {
    label: "Interessada",
    color: "text-cyan-600 bg-cyan-500/10 border-cyan-500/30",
    dot: "bg-cyan-500",
  },
  PROPOSTA_ENVIADA: {
    label: "Proposta enviada",
    color: "text-violet-600 bg-violet-500/10 border-violet-500/30",
    dot: "bg-violet-500",
  },
  NEGOCIACAO: {
    label: "Negociação em andamento",
    color: "text-amber-600 bg-amber-500/10 border-amber-500/30",
    dot: "bg-amber-500",
  },
  FECHADA: {
    label: "Venda fechada",
    color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  PERDIDA: {
    label: "Negociação perdida",
    color: "text-rose-600 bg-rose-500/10 border-rose-500/30",
    dot: "bg-rose-500",
  },
};

export const CLASSIFICACOES: Record<Classificacao, { label: string; nota: number; cor: string }> =
  {
    MUITO_FRIO: { label: "Muito Frio", nota: 8, cor: "text-slate-500" },
    FRIO: { label: "Frio", nota: 25, cor: "text-blue-500" },
    MORNO: { label: "Morno", nota: 45, cor: "text-amber-500" },
    QUENTE: { label: "Quente", nota: 65, cor: "text-orange-500" },
    MUITO_QUENTE: { label: "Muito Quente", nota: 82, cor: "text-rose-500" },
    PRONTO_PARA_COMPRAR: { label: "Pronto p/ comprar", nota: 95, cor: "text-emerald-500" },
  };

export const TIPOS_RESPOSTA: TipoResposta[] = [
  "Consultiva",
  "Executiva",
  "Premium",
  "Curta",
  "Persuasiva",
  "Educativa",
  "Humanizada",
  "Técnica",
];

export const SUGESTOES: Sugestao[] = [
  "Enviar site",
  "Enviar vídeo",
  "Enviar portfólio",
  "Marcar ligação",
  "Marcar reunião",
  "Esperar",
  "Responder amanhã",
  "Criar urgência",
  "Mostrar benefícios",
  "Mostrar diferenciais",
  "Pedir encaminhamento ao dono",
  "Enviar material curto",
];

export const CATEGORIAS_COPY: CategoriaCopy[] = [
  "Primeira abordagem",
  "Falar com o decisor",
  "Reaproximação",
  "Follow-up",
  "Quebra de objeções",
  "Agendamento",
  "Envio de proposta",
  "Pós-proposta",
  "Fechamento",
  "Reativação de leads antigos",
];

export const STATUS_CAMPANHA: Record<CampanhaStatus, { label: string; cor: string }> = {
  ativa: { label: "Ativa", cor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" },
  pausada: { label: "Pausada", cor: "text-amber-600 bg-amber-500/10 border-amber-500/30" },
  concluida: { label: "Concluída", cor: "text-slate-600 bg-slate-500/10 border-slate-500/30" },
};

export const SEGMENTOS_SUGERIDOS = [
  "Restaurantes",
  "Dentistas",
  "Advogados",
  "Clínicas",
  "Academias",
  "Lojas",
  "Auto Escolas",
  "Hotéis",
  "Imobiliárias",
  "Padarias",
  "Mercados",
  "Oficinas",
  "Salões de beleza",
  "Faculdades",
  "Construtoras",
];

export const categorias = SEGMENTOS_SUGERIDOS;

const CHAVE_SEGMENTOS_EXTRA = "sna_segmentos_extra_v1";

function lerSegmentosExtra(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CHAVE_SEGMENTOS_EXTRA);
    if (!raw) return [];
    const lista = JSON.parse(raw) as unknown;
    if (!Array.isArray(lista)) return [];
    return lista.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
  } catch {
    return [];
  }
}

/** Todos os segmentos: sugestões + os cadastrados pelo usuário. */
export function obterTodosSegmentos(): string[] {
  return Array.from(new Set([...SEGMENTOS_SUGERIDOS, ...lerSegmentosExtra()]));
}

/** Cadastra um segmento novo e retorna a lista completa atualizada. */
export function salvarSegmentoCustomizado(nome: string): string[] {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) return obterTodosSegmentos();
  const atuais = lerSegmentosExtra();
  const lista = atuais.includes(nomeLimpo) ? atuais : [...atuais, nomeLimpo];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CHAVE_SEGMENTOS_EXTRA, JSON.stringify(lista));
    } catch {
      // ignore
    }
  }
  return Array.from(new Set([...SEGMENTOS_SUGERIDOS, ...lista]));
}