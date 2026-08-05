export type PipelineStatus =
  | "AGUARDANDO_ABORDAGEM"
  | "AGUARDANDO_RESPOSTA"
  | "INTERESSADA"
  | "PROPOSTA_ENVIADA"
  | "NEGOCIACAO"
  | "FECHADA"
  | "PERDIDA";

export type Classificacao =
  | "MUITO_FRIO"
  | "FRIO"
  | "MORNO"
  | "QUENTE"
  | "MUITO_QUENTE"
  | "PRONTO_PARA_COMPRAR";

export type Autor = "vendedor" | "cliente";

export interface Mensagem {
  id: string;
  autor: Autor;
  texto: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM
}

export type Gatilho =
  | "Autoridade"
  | "Escassez"
  | "Urgência"
  | "Prova Social"
  | "Reciprocidade"
  | "Antecipação"
  | "Curiosidade"
  | "Transformação"
  | "Valor"
  | "Exclusividade"
  | "Segurança";

export type Sugestao =
  | "Enviar site"
  | "Enviar vídeo"
  | "Enviar portfólio"
  | "Marcar ligação"
  | "Marcar reunião"
  | "Esperar"
  | "Responder amanhã"
  | "Criar urgência"
  | "Mostrar benefícios"
  | "Mostrar diferenciais"
  | "Pedir encaminhamento ao dono"
  | "Enviar material curto";

export type TipoResposta =
  | "Consultiva"
  | "Executiva"
  | "Premium"
  | "Curta"
  | "Persuasiva"
  | "Educativa"
  | "Humanizada"
  | "Técnica";

export interface RespostaGerada {
  tipo: TipoResposta;
  texto: string;
  tom: string;
}

export interface EstrategiaNegociacao {
  oQueQuisDizer: string;
  verdadeiraObjecao: string;
  tecnica: string;
  erroEvitar: string;
  gatilhos: Gatilho[];
  proximoPasso: string;
  explicacao: {
    porque: string;
    chanceSucesso: number; // 0-100
    riscos: string[];
  };
  respostas: RespostaGerada[];
  sugestoes: Sugestao[];
  chanceFechamento: number; // 0-100
  modoFechamento: boolean;
}

export interface AnaliseIA {
  interesse: number; // 0-100
  objecoesDetectadas: string[];
  emocao: string;
  perfilPsicologico: string;
  perfilComprador: string;
  nivelConfianca: number;
  nivelUrgencia: number;
  poderDecisao: number;
  probabilidadeFechamento: number;
  classificacao: Classificacao;
  tags: string[];
  estrategia: EstrategiaNegociacao;
}

export interface Empresa {
  id: string;
  nome: string;
  telefone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  googleMaps: string;
  notaGoogle: number;
  qtdAvaliacoes: number;
  cidade: string;
  estado: string;
  categoria: string;
  descricao: string;
  siteAtual: string;
  novoSiteCriado: boolean;
  valorPretendido: number;
  valorNegociado: number;
  status: PipelineStatus;
  classificacao: Classificacao;
  ultimoContato: string | null;
  proximoContato: string | null;
  campanhaId: string | null;
  responsavel: string;
  tags: string[];
  criadoEm: string;
  atualizadoEm: string;
  conversa: Mensagem[];
  analise: AnaliseIA | null;
  observacoes: string;
  arquivos: string[];
  tarefas: Tarefa[];
}

export interface Tarefa {
  id: string;
  titulo: string;
  data: string;
  feito: boolean;
}

export type CampanhaStatus = "ativa" | "pausada" | "concluida";

export interface Campanha {
  id: string;
  nome: string;
  cidade: string;
  segmento: string;
  objetivo: string;
  status: CampanhaStatus;
  observacoes: string;
  criadoEm: string;
}

export interface Objecao {
  id: string;
  mensagem: string;
  sinonimos: string[];
  explicacao: string;
  motivoPsicologico: string;
  tecnica: string;
  exemploResposta: string;
  erros: string[];
  chanceReversao: number; // 0-100
  categoria: string;
}

export type CategoriaCopy =
  | "Primeira abordagem"
  | "Falar com o decisor"
  | "Reaproximação"
  | "Follow-up"
  | "Quebra de objeções"
  | "Agendamento"
  | "Envio de proposta"
  | "Pós-proposta"
  | "Fechamento"
  | "Reativação de leads antigos";

export interface CopyTemplate {
  id: string;
  categoria: CategoriaCopy;
  titulo: string;
  template: string;
  descricao: string;
}

export interface Alerta {
  tipo: "quente" | "frio" | "parado" | "esperando" | "fechando" | "perdido";
  empresaId: string;
  mensagem: string;
}

export interface NotaConsultor {
  nota: number;
  avalia: string[];
  confianca: boolean;
  muitoLonga: boolean;
  muitoCurta: boolean;
  riscoPerder: boolean;
  comoMelhorar: string;
  versaoForte: string;
  versaoElegante: string;
  versaoHumana: string;
}

export interface SimuladorPerfil {
  id: string;
  setor: string;
  nome: string;
  personalidade: string;
}

export type RelatorioLinha =
  | "abordadas"
  | "taxaResposta"
  | "taxaFechamento"
  | "valorVendido"
  | "valorPerdido";

export interface FunnelDado {
  etapa: string;
  valor: number;
}

export interface PipelineDado {
  status: PipelineStatus;
  empresas: Empresa[];
}

export interface DashboardMetricas {
  totalEmpresas: number;
  sitesProntos: number;
  aguardandoAbordagem: number;
  aguardandoResposta: number;
  interessadas: number;
  propostas: number;
  negociacao: number;
  fechadas: number;
  perdidas: number;
  valorPotencial: number;
  valorVendido: number;
  taxaConversao: number;
}

export interface Configuracao {
  nomeVendedor: string;
  nomeAgencia: string;
  openrouterKey: string;
  modeloIA: string;
  usarIAReal: boolean;
  lingua: "pt-BR";
}