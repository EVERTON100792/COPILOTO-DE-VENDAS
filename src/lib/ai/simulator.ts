import type { Empresa, SimuladorPerfil } from "../types";
import { uid } from "../utils";

export const PERFIS_SIMULADOR: SimuladorPerfil[] = [
  { id: "restaurante", setor: "Restaurante", nome: "Seu Carlos", personalidade: "Aberto, mas desconfiado de preço. Decide rápido quando vê valor." },
  { id: "dentista", setor: "Dentista", nome: "Dra. Fernanda", personalidade: "Cautelosa, valoriza credibilidade e depoimentos." },
  { id: "advogado", setor: "Advogado", nome: "Dr. Ricardo", personalidade: "Analítico, pede provas, compara com o que já tem." },
  { id: "clinica", setor: "Clínica", nome: "Dr. Paulo", personalidade: "Focado em resultados, sem tempo, quer praticidade." },
  { id: "academia", setor: "Academia", nome: "Marcos", personalidade: "Impulsivo, decide por emoção e por resultados rápidos." },
  { id: "loja", setor: "Loja", nome: "Sônia", personalidade: "Empática, mas negocia muito; gosta de se sentir especial." },
  { id: "autoescola", setor: "Auto Escola", nome: "Nelson", personalidade: "Pé no chão, focado em custo e retorno." },
  { id: "hotel", setor: "Hotel", nome: "Rafael", personalidade: "Profissional, exige portfólio e compara fornecedores." },
  { id: "imobiliaria", setor: "Imobiliária", nome: "Lúcia", personalidade: "Estratégica, pensa em longo prazo e autoridade no setor." },
  { id: "padaria", setor: "Padaria", nome: "Edson", personalidade: "Acessível, mas acha que 'povo da cidade já conhece'." },
  { id: "mercado", setor: "Mercado", nome: "José", personalidade: "Pragmático, focado em movimento e margem." },
  { id: "oficina", setor: "Oficina", nome: "Tião", personalidade: "Desconfiado de 'gente da internet', exige prova prática." },
];

interface TurnoSim {
  turno: number;
  respostas: string[];
  acao: "negociar" | "fechar" | "resistir";
}

const CENARIOS: Record<string, TurnoSim[]> = {
  restaurante: [
    { turno: 1, respostas: ["Boa tarde! Quem é?", "Ah sim, vocês fazem site. Já tenho um que meu cunhado fez, mas ele não é muito bonito..."], acao: "negociar" },
    { turno: 2, respostas: ["Hmm, quanto custa um site desses?", "Tô recebendo um movimento bom, mas não sei se compensa agora."], acao: "negociar" },
    { turno: 3, respostas: ["Se você me mostrar um exemplo de restaurante que ficou bom, eu penso com mais carinho."], acao: "negociar" },
    { turno: 4, respostas: ["Manda um valor e aí eu decido. Se der pra parcelar, me ajuda bastante."], acao: "fechar" },
  ],
  dentista: [
    { turno: 1, respostas: ["Olá, me conta mais. Já ouvi falar muito mal de agência de site."], acao: "negociar" },
    { turno: 2, respostas: ["Hoje eu atendo por indicação, mas quero aparecer mais. O que vocês fariam de diferente?"], acao: "negociar" },
    { turno: 3, respostas: ["Tenho concorrência forte aqui na região. Meu site atual não me traz ninguém."], acao: "negociar" },
    { turno: 4, respostas: ["Se você garantir um bom posicionamento e mostrar depoimentos, podemos conversar sobre valor."], acao: "fechar" },
  ],
  advogado: [
    { turno: 1, respostas: ["Bom dia. Vocês têm portfólio? Preciso ver o que fazem antes de qualquer conversa."], acao: "negociar" },
    { turno: 2, respostas: ["Já tenho um site e aparece no Google às vezes. Não vejo retorno claro."], acao: "negociar" },
    { turno: 3, respostas: ["O que exatamente está incluso? Prazo, suporte, domínio? Preciso de detalhes técnicos."], acao: "negociar" },
    { turno: 4, respostas: ["Se os detalhes estiverem claros e o preço justo, posso levar para análise."], acao: "fechar" },
  ],
  clinica: [
    { turno: 1, respostas: ["Oi, quem fala? Tô no meio de atendimento, seja breve."], acao: "negociar" },
    { turno: 2, respostas: ["Não tenho tempo pra ficar de conversa. Manda um material no WhatsApp e eu vejo quando der."], acao: "resistir" },
    { turno: 3, respostas: ["Preciso de algo que agende consulta. Vocês fazem isso?"], acao: "negociar" },
    { turno: 4, respostas: ["Se resolver o agendamento e não me der trabalho, topo. Quanto?"], acao: "fechar" },
  ],
  academia: [
    { turno: 1, respostas: ["Opa! Fala. Site pra academia, hein? O pessoal aqui é tudo no Instagram."], acao: "negociar" },
    { turno: 2, respostas: ["Quero algo que venda matrícula. Sabe como é, todo mês é aquela luta."], acao: "negociar" },
    { turno: 3, respostas: ["Se fizer a diferença e for rápido de ficar pronto, eu fecho hoje. Custa quanto?"], acao: "fechar" },
  ],
  loja: [
    { turno: 1, respostas: ["Oi! Que legal te conhecer. Vocês fazem site bonito mesmo?"], acao: "negociar" },
    { turno: 2, respostas: ["Já tenho uma lojinha no Instagram, vendo bem por lá. Será que preciso mesmo?"], acao: "negociar" },
    { turno: 3, respostas: ["Meu marido diz que é jogar dinheiro fora. Mas se tiver um desconto de amiga..."], acao: "negociar" },
    { turno: 4, respostas: ["Vocês me convenceram. Como a gente fecha?"], acao: "fechar" },
  ],
  autoescola: [
    { turno: 1, respostas: ["Fala! Vocês são de que? Ah, site. Já tenho um, fiz numa promoção."], acao: "resistir" },
    { turno: 2, respostas: ["O problema é que o meu não aparece quando o povo procura autoescola aqui."], acao: "negociar" },
    { turno: 3, respostas: ["Quanto custa pra aparecer no topo do Google? Isso que importa."], acao: "negociar" },
    { turno: 4, respostas: ["Se garantir o topo e não for absurdo, bora fechar."], acao: "fechar" },
  ],
  hotel: [
    { turno: 1, respostas: ["Boa tarde. Vocês têm experiência com hotéis? O nosso público é exigente."], acao: "negociar" },
    { turno: 2, respostas: ["Hoje a gente usa Booking e Instagram. Um site próprio vale mesmo a pena?"], acao: "negociar" },
    { turno: 3, respostas: ["Manda um portfólio de projetos parecidos com prazo e preço. Sem isso, não avanço."], acao: "negociar" },
    { turno: 4, respostas: ["Apresentação aprovada. Podemos alinhar o contrato?"], acao: "fechar" },
  ],
  imobiliaria: [
    { turno: 1, respostas: ["Olá. Vocês cuidam de sites para imobiliárias? O mercado aqui é competitivo."], acao: "negociar" },
    { turno: 2, respostas: ["Preciso de algo que passe autoridade pros meus clientes. Hoje não tenho site."], acao: "negociar" },
    { turno: 3, respostas: ["Quero integrar com WhatsApp e captação de leads. Conseguem?"], acao: "negociar" },
    { turno: 4, respostas: ["Vamos marcar uma reunião pra detalhar. Me passa sua agenda."], acao: "fechar" },
  ],
  padaria: [
    { turno: 1, respostas: ["Bom dia! Pão nosso de cada dia, né? (risos) Mas me fala, pra que site?"], acao: "resistir" },
    { turno: 2, respostas: ["Aqui é tudo no boca a boca, a cidade é pequena, todo mundo me conhece."], acao: "resistir" },
    { turno: 3, respostas: ["Hmm, e se eu quiser mostrar o cardápio e os pedidos pelo WhatsApp?"], acao: "negociar" },
    { turno: 4, respostas: ["Se der pra fazer algo simples e bonito, sem me complicar, eu topo."], acao: "fechar" },
  ],
  mercado: [
    { turno: 1, respostas: ["Fala! Mercado aqui funciona na base do movimento. Site não enche carrinho."], acao: "resistir" },
    { turno: 2, respostas: ["Mas me diz uma coisa: tem como divulgar as promoções da semana?"], acao: "negociar" },
    { turno: 3, respostas: ["Meu concorrente tem um site que aparece toda hora no Google. Isso me incomoda."], acao: "negociar" },
    { turno: 4, respostas: ["Fechado então. Só não enrola no prazo, mercado precisa de agilidade."], acao: "fechar" },
  ],
  oficina: [
    { turno: 1, respostas: ["Opa! Vocês são desses de internet, né? Já vieram uns aqui e não prestou."], acao: "resistir" },
    { turno: 2, respostas: ["Minha oficina é cheia na semana, mas fim de semana morre. Dá pra mudar isso?"], acao: "negociar" },
    { turno: 3, respostas: ["Se você me mostrar um trabalho de verdade, com nome e sobrenome, eu penso."], acao: "negociar" },
    { turno: 4, respostas: ["Tá certo, me convenceu. Fechado. Manda o contrato."], acao: "fechar" },
  ],
};

export function iniciarSimulacao(perfilId: string): Simulacao {
  const perfil = PERFIS_SIMULADOR.find((p) => p.id === perfilId) ?? PERFIS_SIMULADOR[0];
  const cenarios = CENARIOS[perfil.id] ?? CENARIOS.restaurante;
  return {
    id: uid("sim"),
    perfil,
    turno: 1,
    totalTurnos: cenarios.length,
    historico: [],
    terminada: false,
    vendaFechada: false,
  };
}

export interface Simulacao {
  id: string;
  perfil: SimuladorPerfil;
  turno: number;
  totalTurnos: number;
  historico: { autor: "vendedor" | "cliente"; texto: string }[];
  terminada: boolean;
  vendaFechada: boolean;
}

export function avancarSimulacao(sim: Simulacao, mensagemVendedor: string): Simulacao {
  const perfil = sim.perfil;
  const cenarios = CENARIOS[perfil.id] ?? CENARIOS.restaurante;
  const turnoAtual = cenarios.find((c) => c.turno === sim.turno);
  const historico: Simulacao["historico"] = [
    ...sim.historico,
    { autor: "vendedor", texto: mensagemVendedor },
  ];

  if (turnoAtual) {
    const escolhida = turnoAtual.respostas[Math.floor(Math.random() * turnoAtual.respostas.length)];
    historico.push({ autor: "cliente", texto: escolhida });
  }

  const turno = sim.turno + 1;
  const semProximo = !cenarios.some((c) => c.turno === turno);
  const vendaFechada = !semProximo && (cenarios.find((c) => c.turno === turno)?.acao === "fechar" || mensagemVendedor.length > 0 && /fechad|vamos começar|contrato|confirmad/.test(mensagemVendedor.toLowerCase()));

  return {
    ...sim,
    turno,
    historico,
    terminada: semProximo,
    vendaFechada,
  };
}

export function responderIA(sim: Simulacao): string {
  // Comportamento simples da persona durante o treinamento
  const perfil = sim.perfil;
  const msg = sim.historico[sim.historico.length - 1]?.texto ?? "";
  const l = msg.toLowerCase();

  if (/preço|quanto|custo|valor/.test(l))
    return `Quanto? Me explica o que tá incluso antes de eu opinar...`;
  if (/resultado|case|exemplo|portfólio/.test(l))
    return `Ah, isso me interessa. Pode me mostrar um exemplo real?`;
  if (/fechad|vamos|contrato|começam|confirmad/.test(l))
    return `Fechado! Manda o contrato que eu assino.`;
  if (/agend|reunião|ligar/.test(l))
    return `Pode me agendar, mas só se for rápido.`;
  return `Hmm, deixa eu pensar melhor... ${perfil.nome} é assim, avalia com calma.`;
}

export function criarEmpresaSimulada(perfilId: string): Empresa {
  const perfil = PERFIS_SIMULADOR.find((p) => p.id === perfilId) ?? PERFIS_SIMULADOR[0];
  const nomes: Record<string, string> = {
    restaurante: "Restaurante Sabor da Serra",
    dentista: "OdontoClinic",
    advogado: "Ricardo & Associados",
    clinica: "Clínica Vida Plena",
    academia: "Academia Corpo Forte",
    loja: "Boutique Dona Sônia",
    autoescola: "Auto Escola Estrada",
    hotel: "Hotel Vale Verde",
    imobiliaria: "Imobiliária Horizonte",
    padaria: "Padaria Pão Dourado",
    mercado: "Mercado Popular",
    oficina: "Oficina do Tião",
  };
  return {
    id: uid("emp"),
    nome: nomes[perfilId] ?? perfil.setor,
    telefone: "(43) 99999-0000",
    whatsapp: "(43) 99999-0000",
    instagram: perfilId,
    facebook: "",
    googleMaps: "",
    notaGoogle: 4.5,
    qtdAvaliacoes: 120,
    cidade: "Londrina",
    estado: "PR",
    categoria: perfil.setor,
    descricao: "",
    siteAtual: "",
    novoSiteCriado: true,
    valorPretendido: 2500,
    valorNegociado: 0,
    status: "AGUARDANDO_ABORDAGEM",
    classificacao: "MORNO",
    ultimoContato: null,
    proximoContato: null,
    campanhaId: null,
    responsavel: "Você",
    tags: ["simulação"],
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    conversa: [],
    analise: null,
    observacoes: "",
    arquivos: [],
    tarefas: [],
  };
}