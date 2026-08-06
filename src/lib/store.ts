import type {
  Campanha,
  Configuracao,
  Empresa,
  Mensagem,
  Objecao,
  PipelineStatus,
} from "./types";
import { adicionarDias, hoje, uid } from "./utils";
import { analisarConversa } from "./ai/analysis";
import { OBJECOES_BIBLIOTECA } from "./ai/objections";

const CHAVE_EMPRESAS = "sna_empresas_v1";
const CHAVE_CAMPANHAS = "sna_campanhas_v1";
const CHAVE_CONFIG = "sna_config_v1";

function ler<T>(chave: string, padrao: T): T {
  if (typeof window === "undefined") return padrao;
  try {
    const raw = window.localStorage.getItem(chave);
    if (!raw) return padrao;
    return JSON.parse(raw) as T;
  } catch {
    return padrao;
  }
}

function escrever<T>(chave: string, valor: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // ignore
  }
}

// ---------- SEED ----------
function mensagem(autor: "vendedor" | "cliente", texto: string, diasAtras: number, hora: string): Mensagem {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return {
    id: uid("msg"),
    autor,
    texto,
    data: d.toISOString().slice(0, 10),
    hora,
  };
}

function construirSeed(): Empresa[] {
  const base = (dados: Partial<Empresa> & { nome: string }): Empresa => ({
    id: uid("emp"),
    telefone: "(43) 3333-0000",
    whatsapp: "(43) 99999-0000",
    instagram: "",
    facebook: "",
    googleMaps: "",
    notaGoogle: 4.5,
    qtdAvaliacoes: 80,
    cidade: "Londrina",
    estado: "PR",
    categoria: "Restaurantes",
    descricao: "",
    siteAtual: "",
    novoSiteCriado: false,
    valorPretendido: 2500,
    valorNegociado: 0,
    status: "AGUARDANDO_ABORDAGEM",
    classificacao: "MORNO",
    ultimoContato: null,
    proximoContato: null,
    campanhaId: null,
    responsavel: "Você",
    tags: [],
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    conversa: [],
    analise: null,
    observacoes: "",
    arquivos: [],
    tarefas: [],
    ...dados,
  });

  const campanhaRest = "camp_rest_londrina";
  const campanhaDent = "camp_dent_londrina";

  // Restaurantes
  const r1 = base({
    nome: "Restaurante Sabor Mineiro",
    categoria: "Restaurantes",
    notaGoogle: 4.8,
    qtdAvaliacoes: 340,
    novoSiteCriado: true,
    campanhaId: campanhaRest,
    status: "NEGOCIACAO",
    ultimoContato: hoje(),
    proximoContato: adicionarDias(2),
    conversa: [
      mensagem("vendedor", "Olá! Tudo bem? Vi o Restaurante Sabor Mineiro no Google, nota 4.8! Preparei um site modelo pra vocês. Posso enviar?", 4, "10:02"),
      mensagem("cliente", "Oi! Legal. Pode mandar sim", 4, "10:15"),
      mensagem("vendedor", "Segue o link! Ficou com o cardápio digital e botão direto pro WhatsApp", 3, "09:40"),
      mensagem("cliente", "Olhei aqui. Ficou bonito mesmo! Quanto que fica pra fazer o nosso?", 2, "11:20"),
      mensagem("vendedor", "O investimento é R$ 2.900 com cardápio digital e domínio incluso. Pro seu restaurante com a avaliação que tem, vale muito a pena", 2, "11:25"),
      mensagem("cliente", "Hmm, é um pouco caro. Não tem como dar uma melhorada no valor?", 1, "15:10"),
    ],
  });

  const r2 = base({
    nome: "Cantina Dona Rosa",
    categoria: "Restaurantes",
    notaGoogle: 4.6,
    qtdAvaliacoes: 210,
    novoSiteCriado: true,
    campanhaId: campanhaRest,
    status: "PROPOSTA_ENVIADA",
    ultimoContato: adicionarDias(-1),
    proximoContato: adicionarDias(2),
    conversa: [
      mensagem("vendedor", "Bom dia! Preparando um site pra Cantina Dona Rosa, vi que vocês têm ótima avaliação. Posso mostrar?", 6, "09:00"),
      mensagem("cliente", "Pode", 5, "09:12"),
      mensagem("vendedor", "Segue o modelo com o cardápio de vocês e galeria dos pratos", 4, "10:30"),
      mensagem("cliente", "Amei o modelo! Pode mandar a proposta", 3, "16:45"),
      mensagem("vendedor", "Segue a proposta completa com condições especiais para fechar essa semana", 2, "17:00"),
    ],
  });

  const r3 = base({
    nome: "Boi na Brasa",
    categoria: "Restaurantes",
    notaGoogle: 4.4,
    qtdAvaliacoes: 95,
    campanhaId: campanhaRest,
    status: "AGUARDANDO_RESPOSTA",
    ultimoContato: adicionarDias(-1),
    proximoContato: adicionarDias(1),
    conversa: [
      mensagem("vendedor", "Olá! Vi o Boi na Brasa com ótima avaliação no Google. Preparei um site com o cardápio de vocês. Posso enviar?", 3, "14:00"),
      mensagem("cliente", "Manda aí pra eu dar uma olhada", 2, "14:20"),
      mensagem("vendedor", "Enviado! Qualquer dúvida estou à disposição", 2, "14:25"),
    ],
  });

  const r4 = base({
    nome: "Café Central",
    categoria: "Restaurantes",
    notaGoogle: 4.7,
    qtdAvaliacoes: 150,
    campanhaId: campanhaRest,
    status: "INTERESSADA",
    ultimoContato: adicionarDias(-2),
    proximoContato: adicionarDias(3),
    conversa: [
      mensagem("vendedor", "Boa tarde! Vi o Café Central no Google, nota 4.7. Preparei um modelo de site pra vocês!", 5, "10:00"),
      mensagem("cliente", "Que legal! Me mostra", 5, "10:10"),
      mensagem("vendedor", "Segue o link com o cardápio e a história do café", 4, "10:15"),
      mensagem("cliente", "Muito bonito! Passa essa semana que a gente conversa melhor", 2, "11:00"),
    ],
  });

  const r5 = base({
    nome: "Pizzaria La Piazza",
    categoria: "Restaurantes",
    notaGoogle: 4.9,
    qtdAvaliacoes: 420,
    novoSiteCriado: true,
    campanhaId: campanhaRest,
    status: "FECHADA",
    valorNegociado: 2800,
    ultimoContato: adicionarDias(-12),
    proximoContato: adicionarDias(18),
    conversa: [
      mensagem("vendedor", "Olá! A La Piazza tem a melhor nota da região. Preparei um site com pedidos pelo WhatsApp!", 15, "09:00"),
      mensagem("cliente", "Interessante! Quanto fica?", 14, "09:30"),
      mensagem("vendedor", "R$ 3.200 com sistema de pedidos e integração WhatsApp", 14, "09:35"),
      mensagem("cliente", "Fechado! Quando começa?", 13, "10:00"),
    ],
  });

  const r6 = base({
    nome: "Churrascaria Gaúcha",
    categoria: "Restaurantes",
    notaGoogle: 4.2,
    qtdAvaliacoes: 60,
    campanhaId: campanhaRest,
    status: "PERDIDA",
    valorNegociado: 0,
    ultimoContato: adicionarDias(-20),
    conversa: [
      mensagem("vendedor", "Bom dia! Preparei um site pra Churrascaria Gaúcha", 22, "09:00"),
      mensagem("cliente", "Não tenho interesse, meu sobrinho já cuida disso", 21, "09:05"),
    ],
  });

  // Dentistas
  const d1 = base({
    nome: "OdontoPrime",
    categoria: "Dentistas",
    notaGoogle: 4.9,
    qtdAvaliacoes: 280,
    novoSiteCriado: true,
    campanhaId: campanhaDent,
    status: "NEGOCIACAO",
    ultimoContato: hoje(),
    proximoContato: adicionarDias(1),
    conversa: [
      mensagem("vendedor", "Olá! Vi a OdontoPrime com nota 4.9. Preparei um site com agendamento online. Posso mostrar?", 4, "10:00"),
      mensagem("cliente", "Sim, por favor! Estamos precisando de um site novo", 4, "10:05"),
      mensagem("vendedor", "Segue o modelo com agendamento e depoimentos de pacientes", 3, "10:10"),
      mensagem("cliente", "Gostei muito! Vocês fazem integração com o Instagram?", 2, "13:00"),
      mensagem("vendedor", "Sim! Integramos os links sociais e posts automáticos", 2, "13:05"),
      mensagem("cliente", "Perfeito. Quanto ficaria?", 1, "16:30"),
      mensagem("vendedor", "Para a OdontoPrime ficou R$ 3.500 com agendamento online e integração completa", 1, "16:35"),
    ],
  });

  const d2 = base({
    nome: "Dental Sorriso",
    categoria: "Dentistas",
    notaGoogle: 4.7,
    qtdAvaliacoes: 190,
    campanhaId: campanhaDent,
    status: "FECHADA",
    valorNegociado: 3200,
    ultimoContato: adicionarDias(-8),
    proximoContato: adicionarDias(22),
    conversa: [
      mensagem("vendedor", "Boa tarde! Vi a clínica Dental Sorriso. Preparei um site com agendamento", 10, "09:00"),
      mensagem("cliente", "Ótimo! Quanto custa?", 9, "09:10"),
      mensagem("vendedor", "R$ 3.800 com agendamento e SEO local. Mas pra fechar essa semana tenho condição especial", 9, "09:15"),
      mensagem("cliente", "Que condição?", 9, "09:20"),
      mensagem("vendedor", "R$ 3.200 pagando em 5x", 9, "09:25"),
      mensagem("cliente", "Fechado!", 8, "09:30"),
    ],
  });

  const d3 = base({
    nome: "Clínica Oral Center",
    categoria: "Dentistas",
    notaGoogle: 4.5,
    qtdAvaliacoes: 130,
    campanhaId: campanhaDent,
    status: "AGUARDANDO_ABORDAGEM",
    ultimoContato: null,
    proximoContato: hoje(),
  });

  const d4 = base({
    nome: "OdontoCenter Londrina",
    categoria: "Dentistas",
    notaGoogle: 4.8,
    qtdAvaliacoes: 350,
    campanhaId: campanhaDent,
    status: "INTERESSADA",
    ultimoContato: adicionarDias(-3),
    proximoContato: adicionarDias(2),
    conversa: [
      mensagem("vendedor", "Olá! Preparei um site pra OdontoCenter com agendamento online. Posso mostrar?", 5, "10:00"),
      mensagem("cliente", "Pode, já estava pensando em site novo", 4, "10:10"),
      mensagem("vendedor", "Segue o modelo!", 4, "10:15"),
      mensagem("cliente", "Muito bom! Vocês atendem clínicas com várias unidades?", 3, "11:00"),
    ],
  });

  // Outros segmentos
  const l1 = base({
    nome: "Auto Escola Estrada Certa",
    categoria: "Auto Escolas",
    notaGoogle: 4.6,
    qtdAvaliacoes: 200,
    novoSiteCriado: true,
    status: "PROPOSTA_ENVIADA",
    ultimoContato: adicionarDias(-1),
    proximoContato: adicionarDias(3),
    conversa: [
      mensagem("vendedor", "Bom dia! Vi a Auto Escola Estrada Certa. Preparei um site com matrícula online", 4, "09:00"),
      mensagem("cliente", "Legal! Manda a proposta", 2, "09:10"),
      mensagem("vendedor", "Segue a proposta com matrícula online e simulador de CNH", 2, "09:20"),
    ],
  });

  const m1 = base({
    nome: "Mercado Bom Preço",
    categoria: "Mercados",
    notaGoogle: 4.3,
    qtdAvaliacoes: 110,
    status: "AGUARDANDO_RESPOSTA",
    ultimoContato: adicionarDias(-2),
    proximoContato: adicionarDias(4),
    conversa: [
      mensagem("vendedor", "Olá! Preparei um site pro Mercado Bom Preço com as promoções da semana. Posso mostrar?", 3, "10:00"),
      mensagem("cliente", "Manda", 2, "10:05"),
    ],
  });

  const a1 = base({
    nome: "Academia Corpo em Movimento",
    categoria: "Academias",
    notaGoogle: 4.7,
    qtdAvaliacoes: 250,
    novoSiteCriado: true,
    status: "FECHADA",
    valorNegociado: 2600,
    ultimoContato: adicionarDias(-5),
    proximoContato: adicionarDias(25),
    conversa: [
      mensagem("vendedor", "Olá! Preparei um site com matrícula online pra Academia Corpo em Movimento", 8, "10:00"),
      mensagem("cliente", "Já tenho Instagram, mas quero um site profissional mesmo", 7, "10:20"),
      mensagem("vendedor", "Segue o modelo!", 7, "10:30"),
      mensagem("cliente", "Fechado! Quanto tempo pra ficar pronto?", 6, "11:00"),
    ],
  });

  const p1 = base({
    nome: "Padaria Pão Dourado",
    categoria: "Padarias",
    notaGoogle: 4.8,
    qtdAvaliacoes: 180,
    status: "PERDIDA",
    classificacao: "MUITO_FRIO",
    ultimoContato: adicionarDias(-30),
    proximoContato: adicionarDias(7),
    conversa: [
      mensagem("vendedor", "Olá! Preparei um site pra Padaria Pão Dourado", 35, "09:00"),
      mensagem("cliente", "Não tenho interesse, o movimento é por indicação", 34, "09:10"),
    ],
  });

  const i1 = base({
    nome: "Imobiliária Horizonte",
    categoria: "Imobiliárias",
    notaGoogle: 4.5,
    qtdAvaliacoes: 90,
    novoSiteCriado: true,
    status: "INTERESSADA",
    ultimoContato: adicionarDias(-1),
    proximoContato: adicionarDias(2),
    conversa: [
      mensagem("vendedor", "Boa tarde! Preparei um site com busca de imóveis pra Horizonte. Posso mostrar?", 4, "14:00"),
      mensagem("cliente", "Sim! Estamos precisando justamente disso", 4, "14:05"),
      mensagem("vendedor", "Segue o modelo com filtros de busca e WhatsApp", 3, "14:10"),
    ],
  });

  const o1 = base({
    nome: "Oficina do João",
    categoria: "Oficinas",
    notaGoogle: 4.9,
    qtdAvaliacoes: 220,
    novoSiteCriado: true,
    status: "AGUARDANDO_RESPOSTA",
    ultimoContato: adicionarDias(-1),
    proximoContato: adicionarDias(2),
    conversa: [
      mensagem("vendedor", "Olá! Vi a Oficina do João com nota 4.9 no Google. Preparei um site com agendamento de serviços!", 3, "09:00"),
      mensagem("cliente", "Manda aí!", 2, "09:15"),
    ],
  });

  const h1 = base({
    nome: "Hotel Vale Verde",
    categoria: "Hotéis",
    notaGoogle: 4.6,
    qtdAvaliacoes: 300,
    status: "AGUARDANDO_ABORDAGEM",
    ultimoContato: null,
    proximoContato: hoje(),
    cidade: "Londrina",
  });

  const empresas: Empresa[] = [r1, r2, r3, r4, r5, r6, d1, d2, d3, d4, l1, m1, a1, p1, i1, o1, h1];

  // Análise automática para empresas com conversa
  for (const e of empresas) {
    if (e.conversa.length > 0) {
      e.analise = analisarConversa(e.conversa, { nomeEmpresa: e.nome, segmento: e.categoria });
    }
    if (e.status === "FECHADA" && !e.valorNegociado) e.valorNegociado = e.valorPretendido;
  }

  return empresas;
}

function construirCampanhas(): Campanha[] {
  return [
    {
      id: "camp_rest_londrina",
      nome: "Restaurantes de Londrina",
      cidade: "Londrina",
      segmento: "Restaurantes",
      objetivo: "Fechar 15 sites nos próximos 60 dias",
      status: "ativa",
      observacoes: "Foco em restaurantes com nota acima de 4.5 no Google",
      criadoEm: adicionarDias(-25),
    },
    {
      id: "camp_dent_londrina",
      nome: "Dentistas de Londrina",
      cidade: "Londrina",
      segmento: "Dentistas",
      objetivo: "Captar 10 clínicas com agendamento online",
      status: "ativa",
      observacoes: "Usar gatilho de agendamento online como diferencial",
      criadoEm: adicionarDias(-18),
    },
    {
      id: "camp_adv_maringa",
      nome: "Advogados de Maringá",
      cidade: "Maringá",
      segmento: "Advogados",
      objetivo: "Fechar 8 sites institucionais",
      status: "pausada",
      observacoes: "Aguardando aprovação de valores",
      criadoEm: adicionarDias(-40),
    },
    {
      id: "camp_auto_campinas",
      nome: "Auto Escolas de Campinas",
      cidade: "Campinas",
      segmento: "Auto Escolas",
      objetivo: "Fechar 12 sites com matrícula online",
      status: "ativa",
      observacoes: "Campanha iniciada mês passado",
      criadoEm: adicionarDias(-12),
    },
  ];
}

// ---------- STORE ----------
export interface StoreData {
  empresas: Empresa[];
  campanhas: Campanha[];
  config: Configuracao;
}

export function carregarDados(): StoreData {
  const campanhas = ler<Campanha[]>(CHAVE_CAMPANHAS, null as unknown as Campanha[]) ?? construirCampanhas();
  let empresas = ler<Empresa[]>(CHAVE_EMPRESAS, null as unknown as Empresa[]);

  const config = ler<Configuracao>(CHAVE_CONFIG, {
    nomeVendedor: "Everton",
    nomeAgencia: "Sua Agência",
    openrouterKey: "",
    geminiKey: "",
    groqKey: "",
    modeloIA: "openai/gpt-4o-mini",
    usarIAReal: true,
    lingua: "pt-BR",
  });

  if (!empresas) {
    empresas = construirSeed();
    escrever(CHAVE_EMPRESAS, empresas);
  }

  // vincular campanhas por id antigo
  for (const e of empresas) {
    if (!e.campanhaId && e.categoria === "Restaurantes") e.campanhaId = "camp_rest_londrina";
  }
  if (!campanhas.length) {
    const c = construirCampanhas();
    escrever(CHAVE_CAMPANHAS, c);
  }

  return { empresas, campanhas, config };
}

export function salvarEmpresas(empresas: Empresa[]) {
  escrever(CHAVE_EMPRESAS, empresas);
}

export function salvarCampanhas(campanhas: Campanha[]) {
  escrever(CHAVE_CAMPANHAS, campanhas);
}

export function salvarConfig(config: Configuracao) {
  escrever(CHAVE_CONFIG, config);
}

export function atualizarEmpresa(empresas: Empresa[], id: string, mudancas: Partial<Empresa>): Empresa[] {
  return empresas.map((e) =>
    e.id === id
      ? { ...e, ...mudancas, atualizadoEm: new Date().toISOString() }
      : e
  );
}

export function mudarStatus(
  empresas: Empresa[],
  id: string,
  status: PipelineStatus,
  extra?: Partial<Empresa>
): Empresa[] {
  return empresas.map((e) =>
    e.id === id ? { ...e, status, ...extra, atualizadoEm: new Date().toISOString() } : e
  );
}

export function obterObjecaoPorId(id: string): Objecao | undefined {
  return OBJECOES_BIBLIOTECA.find((o) => o.id === id);
}

export function resetarDados() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CHAVE_EMPRESAS);
  window.localStorage.removeItem(CHAVE_CAMPANHAS);
}