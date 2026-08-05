import type {
  AnaliseIA,
  Classificacao,
  EstrategiaNegociacao,
  Gatilho,
  Mensagem,
  RespostaGerada,
  Sugestao,
  TipoResposta,
} from "../types";
import { buscarObjecao } from "./objections";

// ---------- SINAIZES DE INTERESSE ----------
const SINAIS_INTERESSE = [
  "quero",
  "quanto",
  "preço",
  "fazer",
  "gostei",
  "interessa",
  "como funciona",
  "exemplo",
  "mostra",
  "envia",
  "link",
  "site pronto",
  "manda",
  "top",
  "legal",
  "bora",
  "vamos",
  "fechar",
  "parcel",
  "contrato",
  "começar",
];

const SINAIS_URGENCIA = [
  "urgente",
  "rapid",
  "essa semana",
  "hoje",
  "já",
  "quanto antes",
  "pra ontem",
  "preciso logo",
  "até sexta",
  "amanhã",
];

const SINAIS_PERDA = [
  "não",
  "não quero",
  "obrigado",
  "sem interesse",
  "não preciso",
  "desculpa",
  "não deu",
  "sem condições",
  "fora",
  "bloquear",
  "sai",
];

const SINAIS_DUVIDA = [
  "mas",
  "porém",
  "se for",
  "será",
  "não sei",
  "acho",
  "depende",
  "vou ver",
  "talvez",
  "hmm",
];

const SINAIS_EMPATIA = ["obrigad", "grato", "ótimo", "otimo", "bom demais", "show", "parabéns", "excelente"];

const SINAIS_OBRIGADO_SAIDA = [
  "obrigado, não",
  "obrigado mas",
  "agora não",
  "não tô podendo",
];

function classificarPorScore(score: number): Classificacao {
  if (score >= 90) return "PRONTO_PARA_COMPRAR";
  if (score >= 75) return "MUITO_QUENTE";
  if (score >= 55) return "QUENTE";
  if (score >= 35) return "MORNO";
  if (score >= 15) return "FRIO";
  return "MUITO_FRIO";
}

export function analisarConversa(
  mensagens: Mensagem[],
  contexto: { nomeEmpresa: string; segmento: string }
): AnaliseIA {
  const clienteMsgs = mensagens.filter((m) => m.autor === "cliente");
  const vendedorMsgs = mensagens.filter((m) => m.autor === "vendedor");
  const textoCliente = clienteMsgs.map((m) => m.texto).join(" ").toLowerCase();
  const textoVendedor = vendedorMsgs.map((m) => m.texto).join(" ").toLowerCase();
  const textoCompleto = textoCliente + " " + textoVendedor;

  // Objeções detectadas
  const objecoesDetectadasSet = new Set<string>();
  for (const msg of clienteMsgs) {
    const obj = buscarObjecao(msg.texto);
    if (obj && objecoesDetectadasSet.size < 4) {
      objecoesDetectadasSet.add(obj.mensagem.split("—")[0].trim());
    }
  }
  // Objeções explícitas padrão
  const objecoesExplicitas: { padrao: string[]; nome: string }[] = [
    { padrao: ["caro", "preço alto", "acima do", "muito dinheiro"], nome: "Preço elevado" },
    { padrao: ["já tenho site", "temos site", "meu site"], nome: "Já possui site" },
    { padrao: ["não preciso", "não necessito", "sem necessidade"], nome: "Falta de necessidade" },
    { padrao: ["sem dinheiro", "sem verba", "não tenho verba", "caixa"], nome: "Restrição financeira" },
    { padrao: ["vou pensar", "preciso pensar", "avaliar"], nome: "Vou pensar" },
    { padrao: ["sobrinho", "primo", "amigo faz", "conheço quem"], nome: "Conhece quem faz" },
    { padrao: ["meu instagram", "já tenho instagram", "tenho instagram"], nome: "Já tem Instagram" },
    { padrao: ["por indicação", "indicacao"], nome: "Movimento por indicação" },
    { padrao: ["sócio", "esposa", "marido", "família decide"], nome: "Poder de decisão dividido" },
    { padrao: ["não tenho tempo", "sem tempo"], nome: "Falta de tempo" },
    { padrao: ["depois", "mais pra frente", "mês que vem"], nome: "Adiamento" },
    { padrao: ["orçamento", "manda proposta"], nome: "Pedido de orçamento" },
    { padrao: ["me chama depois", "liga depois"], nome: "Chamar depois" },
  ];
  for (const o of objecoesExplicitas) {
    if (o.padrao.some((p) => textoCliente.includes(p))) objecoesDetectadasSet.add(o.nome);
  }

  // Contagem de sinais
  let interesse = 35;
  let urgência = 20;
  let duvida = 0;

  const conta = (sinais: string[], texto: string) =>
    sinais.reduce((acc, s) => acc + (texto.includes(s) ? 1 : 0), 0);

  const nInteresse = conta(SINAIS_INTERESSE, textoCompleto);
  const nUrgencia = conta(SINAIS_URGENCIA, textoCompleto);
  const nPerda = conta(SINAIS_PERDA, textoCliente);
  const nDuvida = conta(SINAIS_DUVIDA, textoCompleto);
  const nEmpatia = conta(SINAIS_EMPATIA, textoCompleto);

  interesse = Math.min(98, 30 + nInteresse * 9 + nEmpatia * 6 - nPerda * 12);
  urgência = Math.min(95, 12 + nUrgencia * 11);
  duvida = Math.min(80, nDuvida * 8);

  const teveSaida = SINAIS_OBRIGADO_SAIDA.some((s) => textoCliente.includes(s));

  // Queda se houver objeções fortes
  let objecoesPeso = objecoesDetectadasSet.size * 4;
  const objecoCaras = [...objecoesDetectadasSet].some((o) =>
    /preço|custo|dinheiro|verba|caro/i.test(o)
  );
  if (objecoCaras) objecoesPeso += 6;

  const probabilidadeBase = Math.max(
    5,
    Math.min(97, Math.round(interesse * 0.55 + urgência * 0.25 - objecoesPeso - (teveSaida ? 18 : 0)))
  );

  // Detecção de quem responde não ser o decisor (atendente, funcionário, etc.)
  const SINAIS_NAO_DECISOR = [
    "vou ver com o dono",
    "vou falar com o dono",
    "preciso falar com o dono",
    "ver com o dono",
    "falar com meu chefe",
    "pergunta pro patrão",
    "repasso pro",
    "repassar pro",
    "passo pro dono",
    "meu irmão que decide",
    "meu filho que cuida",
    "não sou eu que decido",
    "não decido",
    "quem decide é",
    "quem cuida é",
    "só o dono",
    "so o dono",
    "depende do dono",
    "depende do gerente",
    "responsável é",
    "preciso repassar",
  ];
  const contatoNaoDecisor = SINAIS_NAO_DECISOR.some((s) => textoCliente.includes(s));
  const naoDecisorTermos = /dono|chefe|patrão|patrao|gerente|respons[áa]vel|sócio|sócio|decis[ãa]o final/i.test(textoCliente);

  const poderDecisao = 50 + (clienteMsgs.length >= 4 ? 15 : 0) - (objecoesDetectadasSet.size > 3 ? 10 : 0);
  const poderDecisaoFinal = contatoNaoDecisor || (naoDecisorTermos && clienteMsgs.length > 1)
    ? Math.min(poderDecisao, 35)
    : poderDecisao;
  const nivelConfianca = Math.min(96, Math.round(40 + nEmpatia * 8 + nInteresse * 3));
  const perfilPsicológico = inferirPerfilPsicologico(textoCompleto, nDuvida, nUrgencia);
  const perfilComprador = contatoNaoDecisor
    ? "Intermediário (atendente/funcionário) — não decide, precisa encaminhar ao dono"
    : inferirPerfilComprador(interesse, poderDecisaoFinal, objecoesDetectadasSet.size);

  const classificacaoFinal = classificarPorScore(probabilidadeBase);
  const tags = gerarTags(textoCompleto, objecoesDetectadasSet, nDuvida, nUrgencia);
  if (contatoNaoDecisor || (naoDecisorTermos && clienteMsgs.length > 1)) tags.push("nao-decisor");

  const emocao = inferirEmocao(textoCliente, textoCompleto, nEmpatia, nPerda);

  const estrategia = construirEstrategia({
    clienteMsgs,
    vendedorMsgs,
    textoCompleto,
    textoCliente,
    objecoes: [...objecoesDetectadasSet],
    interesse,
    urgência,
    probabilidade: probabilidadeBase,
    classificacao: classificacaoFinal,
    duvida,
    nomeEmpresa: contexto.nomeEmpresa,
    segmento: contexto.segmento,
    contatoNaoDecisor,
  });

  return {
    interesse,
    objecoesDetectadas: [...objecoesDetectadasSet],
    emocao,
    perfilPsicologico: perfilPsicológico,
    perfilComprador: perfilComprador,
    nivelConfianca,
    nivelUrgencia: urgência,
    poderDecisao: Math.min(95, Math.max(10, poderDecisaoFinal)),
    probabilidadeFechamento: probabilidadeBase,
    classificacao: classificacaoFinal,
    tags,
    estrategia,
  };
}

function inferirPerfilPsicologico(texto: string, duvida: number, urgencia: number): string {
  const t = texto;
  if (/ansios|preocup|medo|risco|seguran/.test(t)) return "Ansioso — busca segurança antes de agir";
  if (/impulsiv|fechar logo|quero já|agora/.test(t)) return "Impulsivo — decide rápido quando vê valor";
  if (/analis|compara|pesquis|detalhe/.test(t) || duvida > 30) return "Analítico — precisa de dados e comparações";
  if (/sócio|esposa|marido|preciso ver|conversar com/.test(t))
    return "Cauteloso — delega a decisão final";
  if (urgencia > 50) return "Orientado a resultados — valoriza agilidade";
  if (/não intrus|respeit|não quero incomodar/.test(t)) return "Reservado — valoriza espaço e respeito";
  return "Pragmático — valoriza solução direta e objetiva";
}

function inferirPerfilComprador(interesse: number, poder: number, objecoes: number): string {
  if (interesse > 70 && poder > 60) return "Comprador decisor — pronto para avançar se bem conduzido";
  if (interesse > 50) return "Comprador envolvido — precisa de um empurrão final";
  if (objecoes >= 3) return "Comprador em defesa — neutralize objeções antes de vender";
  if (poder < 45) return "Influenciador — convence, mas não decide sozinho";
  return "Comparador — está avaliando alternativas";
}

function inferirEmocao(textoCliente: string, texto: string, empatia: number, perda: number): string {
  if (/raiva|puto|revoltado|péssimo|horrível|frustrad/.test(texto)) return "Irritação";
  if (/feliz|top|ótimo|parab|adorei|show/.test(texto)) return "Empolgação";
  if (empatia >= 3 && perda === 0) return "Abertura e simpatia";
  if (/medo|receio|concern|preocupad/.test(texto)) return "Receio";
  if (/duvid|será|sei não|não sei se/.test(texto)) return "Dúvida";
  if (/cansad|corrida|sem tempo|muito ocupad/.test(texto)) return "Sobrecarga";
  if (perda >= 2) return "Fechamento / desinteresse";
  return "Neutra — avaliando";
}

function gerarTags(
  texto: string,
  objecoes: Set<string>,
  duvida: number,
  urgencia: number
): string[] {
  const tags: string[] = [];
  if (objecoes.size > 0) tags.push("com-objeções");
  if (duvida > 20) tags.push("indeciso");
  if (urgencia > 50) tags.push("urgente");
  if (/indicac/.test(texto)) tags.push("indicação");
  if (/instagram|rede social/.test(texto)) tags.push("usa-redes");
  if (/site/.test(texto)) tags.push("analisa-site");
  if (/parcel|condição|forma de pagamento/.test(texto)) tags.push("sinal-pagamento");
  if (/orçamento|proposta/.test(texto)) tags.push("pediu-proposta");
  return tags.slice(0, 6);
}

// ---------- MOTOR DE ESTRATÉGIA ----------
interface EstrategiaInput {
  clienteMsgs: Mensagem[];
  vendedorMsgs: Mensagem[];
  textoCompleto: string;
  textoCliente: string;
  objecoes: string[];
  interesse: number;
  urgência: number;
  probabilidade: number;
  classificacao: Classificacao;
  duvida: number;
  nomeEmpresa: string;
  segmento: string;
  contatoNaoDecisor: boolean;
}

function construirEstrategia(input: EstrategiaInput): EstrategiaNegociacao {
  const {
    clienteMsgs,
    objecoes,
    interesse,
    urgência,
    probabilidade,
    classificacao,
    duvida,
    nomeEmpresa,
    segmento,
    contatoNaoDecisor,
  } = input;
  const texto = input.textoCompleto;

  const ultimaCliente = clienteMsgs[clienteMsgs.length - 1]?.texto ?? "";
  const modoFechamento =
    !contatoNaoDecisor &&
    (classificacao === "PRONTO_PARA_COMPRAR" ||
      classificacao === "MUITO_QUENTE" ||
      /fechar|contrato|como faço|vamos começar|pode começar|to dentro|bora/.test(texto));

  const ultimaVoz = clienteMsgs.length ? "cliente" : "vendedor";

  // Objeção principal
  const objecaoPrincipal = objecoes[0] ?? "Nenhuma objeção explícita detectada";
  const verdadeira = (() => {
    if (/preço|custo|dinheiro|verba|caro/.test(objecaoPrincipal))
      return "O preço parece alto porque o valor entregue ainda não está claro. A objeção real é a percepção de retorno.";
    if (/já tenho|possu/.test(objecaoPrincipal))
      return "Resistência à troca: o cliente sente que já resolveu o problema e não vê o custo de oportunidade de manter o site atual.";
    if (/vou pensar|avaliar/.test(objecaoPrincipal))
      return "Insegurança disfarçada: ele quer evitar decisão errada e precisa de confiança e um próximo passo simples.";
    if (/dinheiro|sem verba|caixa/.test(objecaoPrincipal))
      return "Prioridade conflitante: a verba existe, mas o site não está na lista de prioridades ainda.";
    if (/sobrinho|primo|amigo/.test(objecaoPrincipal))
      return "Desejo de economizar + confiança num vínculo próximo. O risco é percebido como menor com alguém conhecido.";
    if (/decisão|sócio|esposa/.test(objecaoPrincipal))
      return "Medo de arcar com a decisão sozinho. Ele precisa de material para vender a ideia para outra pessoa.";
    if (/instagram/.test(objecaoPrincipal))
      return "Falsa segurança digital: ele acha que rede social substitui site, sem entender os riscos de depender de plataforma alheia.";
    return "O cliente está em modo defensivo; precisa de valor concreto e um próximo passo sem pressão.";
  })();

  const tecnicasDisponiveis = [
    {
      nome: "SPIN (Situação, Problema, Implicação, Necessidade)",
      quando: () => objetivo,
      aplicar: true,
    },
  ];

  const objetivo = (() => {
    if (modoFechamento) return "FECHAMENTO";
    if (probabilidade >= 55) return "APROFUNDAR E FECHAR";
    if (probabilidade >= 35) return "REVER OBJEÇÕES E AVANÇAR";
    if (objecoes.length > 0) return "NEUTRALIZAR OBJEÇÕES";
    return "GERAR INTERESSE";
  })();

  void tecnicasDisponiveis;

  const tecnica = escolherTecnica(objecaoPrincipal, modoFechamento, objecoes, duvida);

  const gatilhos = escolherGatilhos(objecaoPrincipal, modoFechamento, interesse, urgência);
  if (contatoNaoDecisor) {
    gatilhos.length = 0;
    gatilhos.push("Reciprocidade", "Curiosidade", "Autoridade");
  }

  const respostas = gerarRespostas({
    objecaoPrincipal,
    verdadeira,
    modoFechamento,
    probabilidade,
    interesse,
    urgência,
    nomeEmpresa,
    segmento,
    ultimaCliente,
  });

  const sugestoes = gerarSugestoes({
    modoFechamento,
    objecoes,
    interesse,
    urgência,
    ultimaVoz,
    contatoNaoDecisor,
  });

  const proximoPasso = montarProximoPasso({
    modoFechamento,
    objecoes,
    probabilidade,
    ultimaVoz,
    ultimaCliente,
    contatoNaoDecisor,
  });

  const chanceFechamento = probabilidade;

  return {
    oQueQuisDizer: oQueQuisDizer(input.textoCliente, input.textoCompleto, objecoes, modoFechamento),
    verdadeiraObjecao: verdadeira,
    tecnica: tecnica.nome + " — " + tecnica.como,
    erroEvitar: tecnica.erro,
    gatilhos,
    proximoPasso,
    explicacao: {
      porque: explicarPorque(objetivo, objecaoPrincipal, modoFechamento),
      chanceSucesso: Math.min(95, probabilidade + 8),
      riscos: montarRiscos(objecoes, modoFechamento, duvida),
    },
    respostas,
    sugestoes,
    chanceFechamento,
    modoFechamento,
  };
}

function oQueQuisDizer(textoCliente: string, texto: string, objecoes: string[], fechamento: boolean): string {
  if (fechamento) return "O cliente está demonstrando intenção real de fechar. Suas respostas curtas e positivas mostram que ele quer que você conduza o processo até o fim.";
  if (objecoes.length > 0)
    return "Timidamente ele sinalizou uma preocupação precisa ({objecoes[0]}). O interesse existe, mas está condicionado a vencer essa barreira.";
  if (/obrigad|não preciso|sem interesse/.test(textoCliente))
    return "O discurso de 'não quero' é uma proteção. Ele não está dizendo 'não' ao site, está dizendo 'não' a um investimento que ainda não faz sentido.";
  if (/manda orçamento|envia orçamento|me manda a proposta/.test(texto))
    return "Ao pedir orçamento, o cliente tenta transferir o peso da decisão para o papel. Ele quer avaliar com calma, mas corre risco de nunca responder.";
  return "O cliente ainda está na fase de exploração. Ele responderá bem a valor concreto e a um próximo passo claro e simples.";
}

function escolherTecnica(objecaoPrincipal: string, fechamento: boolean, objecoes: string[], duvida: number) {
  if (fechamento)
    return {
      nome: "Assumir o fechamento",
      como: "Use fechamento por suposição: conduza como se a decisão já estivesse tomada, apresentando o próximo passo natural.",
      erro: "Perguntar 'então você quer ou não?' e devolver a pressão para o cliente.",
    };
  if (/preço|custo|dinheiro|verba|caro/.test(objecaoPrincipal))
    return {
      nome: "Retorno sobre o investimento (ROI)",
      como: "Converta o valor em custo diário e o compare com o ganho de um cliente novo. Feche o ciclo: investimento → resultado → retorno.",
      erro: "Baixar o preço imediatamente sem antes reforçar o valor.",
    };
  if (/vou pensar|avaliar/.test(objecaoPrincipal))
    return {
      nome: "Pergunta de transição (fechar a objeção)",
      como: "Faça 'se eu resolver X, você fecha hoje?'. Isso revela a objeção real escondida atrás do 'vou pensar'.",
      erro: "Aceitar o 'vou pensar' e encerrar a conversa.",
    };
  if (/sócio|esposa|marido/.test(objecaoPrincipal))
    return {
      nome: "Facilitar decisão compartilhada",
      como: "Entregue um resumo simples e vendável que o cliente possa encaminhar para quem decide com ele.",
      erro: "Pressionar uma resposta que ele não pode dar sozinho.",
    };
  if (duvida > 30)
    return {
      nome: "Clareza por etapas",
      como: "Reduza a decisão a micro-passos: primeiro veja o modelo, depois o valor, depois o prazo. Pouco a pouco o 'talvez' vira 'sim'.",
      erro: "Encher de informações de uma vez e confundir ainda mais.",
    };
  return {
    nome: "Diagnóstico + experimento",
    como: "Ofereça algo concreto e de baixo risco (análise, modelo, case) para que ele experimente o seu trabalho antes de decidir.",
    erro: "Falar dos próprios diferenciais sem provas concretas.",
  };
}

function escolherGatilhos(
  objecaoPrincipal: string,
  fechamento: boolean,
  interesse: number,
  urgencia: number
): Gatilho[] {
  const gatilhos: Gatilho[] = [];
  const add = (g: Gatilho) => gatilhos.push(g);

  if (fechamento) {
    add("Urgência");
    add("Segurança");
    if (interesse > 60) add("Exclusividade");
    return gatilhos.slice(0, 3);
  }
  if (/preço|custo|caro/.test(objecaoPrincipal)) {
    add("Valor");
    add("Transformação");
    add("Prova Social");
  } else if (/já tenho|possu/.test(objecaoPrincipal)) {
    add("Valor");
    add("Curiosidade");
    add("Segurança");
  } else if (/sobrinho|primo|amigo/.test(objecaoPrincipal)) {
    add("Autoridade");
    add("Segurança");
    add("Prova Social");
  } else if (/vou pensar/.test(objecaoPrincipal)) {
    add("Exclusividade");
    add("Prova Social");
    add("Antecipação");
  } else if (/indicac|instagram/.test(objecaoPrincipal)) {
    add("Valor");
    add("Transformação");
    add("Curiosidade");
  } else {
    add("Curiosidade");
    add("Valor");
    if (urgencia > 50) add("Urgência");
  }
  return gatilhos.slice(0, 3);
}

// ---------- GERAÇÃO DE RESPOSTAS ----------
interface RespostaInput {
  objecaoPrincipal: string;
  verdadeira: string;
  modoFechamento: boolean;
  probabilidade: number;
  interesse: number;
  urgência: number;
  nomeEmpresa: string;
  segmento: string;
  ultimaCliente: string;
}

function gerarRespostas(input: RespostaInput): RespostaGerada[] {
  const { objecaoPrincipal, modoFechamento, probabilidade, nomeEmpresa } = input;
  const vu = probabilidade >= 60;

  if (modoFechamento) {
    return [
      {
        tipo: "Consultiva",
        tom: "Guia confiante",
        texto: `${nomeEmpresa}, com base no que conversamos, acredito que o site vai resolver exatamente o que você procura. Se estiver tudo certo, posso já reservar seu espaço no cronograma desta semana? Confirmo e já começamos.`,
      },
      {
        tipo: "Executiva",
        tom: "Tomada de decisão",
        texto: `${nomeEmpresa}, vamos lá: te reservo a entrega para ${vu ? "7 dias" : "15 dias"}. Só preciso do seu ok para iniciar. Combinado?`,
      },
      {
        tipo: "Premium",
        tom: "Experiência exclusiva",
        texto: `${nomeEmpresa}, cuidaremos do seu site como um cliente premium: atendimento dedicado, entregas parciais e 30 dias de suporte pós-lançamento incluso. Posso dar início esta semana?`,
      },
      {
        tipo: "Curta",
        tom: "Direta e objetiva",
        texto: `Confirma que começamos ${vu ? "hoje" : "amanhã"}? Só depende do seu ok.`,
      },
      {
        tipo: "Persuasiva",
        tom: "Empurrão final",
        texto: `${nomeEmpresa}, deixa eu ser direto: se o site gerar só 1 pedido novo por mês, ele se paga em menos de 2 meses. O que você prefere: começar agora e colher em algumas semanas, ou continuar dependendo só da indicação?`,
      },
      {
        tipo: "Educativa",
        tom: "Ensina o processo",
        texto: `${nomeEmpresa}, agora o processo fica assim: hoje você aprova a proposta, em 2 dias você recebe o layout inicial para análise, e em ${vu ? "10 dias" : "3 semanas"} o site está no ar. Sem surpresas. Posso seguir?`,
      },
      {
        tipo: "Humanizada",
        tom: "Próxima e calorosa",
        texto: `${nomeEmpresa}, fico muito feliz que você gostou! Vou cuidar deste projeto com muito carinho. Se puder me confirmar aqui, já te deixo na frente da fila. 😊`,
      },
      {
        tipo: "Técnica",
        tom: "Especificações",
        texto: `${nomeEmpresa}, segue o que está incluso: domínio, hospedagem otimizada, site responsivo, SEO básico, editor de agendamento e suporte por 30 dias. Aprovação do seu lado não trava nada — prossigo automaticamente após o ok.`,
      },
    ];
  }

  const mapPorObjecao: Record<string, { consultiva: string; executiva: string; premium: string; curta: string; persuasiva: string; educativa: string; humanizada: string; tecnica: string }> = {
    "Preço elevado": {
      consultiva: `${nomeEmpresa}, entendo que é um investimento. Deixa eu te mostrar o retorno: custa X, que dá menos de Y por dia. Se trouxer 1 cliente novo, se paga em 2 meses. Quer que eu calcule com a sua realidade?`,
      executiva: `${nomeEmpresa}, o investimento está dentro do mercado e o resultado aparece rápido. Se fecharmos esta semana, garanto a entrega em ${vu ? "10" : "15"} dias. Vamos?`,
      premium: `${nomeEmpresa}, para clientes que fecham esta semana, incluí um período maior de suporte e prioridade no cronograma. É um pacote pensado para você. Posso detalhar?`,
      curta: `Entendo o preço. Mas 1 cliente novo por mês já paga o site. Quer ver a conta?`,
      persuasiva: `${nomeEmpresa}, pense assim: você já paga mais do que isso em outras coisas que não te trazem clientes. O site é o único investimento que trabalha 24h por dia por você.`,
      educativa: `${nomeEmpresa}, o valor cobre domínio, hospedagem, design sob medida, SEO e suporte. Quando você divide isso pelo tempo de vida do site, o custo fica mínimo frente ao retorno.`,
      humanizada: `${nomeEmpresa}, eu entendo perfeitamente o cuidado com o investimento. Por isso quero te mostrar o resultado antes de qualquer coisa — aí a decisão fica fácil.`,
      tecnica: `${nomeEmpresa}, o escopo inclui: domínio + hospedagem, site responsivo, SEO técnico, integração WhatsApp e 30 dias de suporte. O valor é único e sem mensalidades surpresa.`,
    },
    "Já possui site": {
      consultiva: `Que ótimo que você já está no digital! Me conta: o site atual traz clientes novos todos os meses ou você ainda depende de indicação? Posso fazer uma análise e te mostrar o que está deixando dinheiro na mesa.`,
      executiva: `${nomeEmpresa}, seu site existe, mas o que ele entrega de resultado? Posso comparar com o que fazemos e te mostrar as diferenças em 10 minutos.`,
      premium: `${nomeEmpresa}, não basta existir na internet — precisa converter. Nossa auditoria aponta exatamente onde o site atual perde venda. Posso te mostrar?`,
      curta: `Ter site é diferente de ter site que vende. Quer ver o diagnóstico gratuito?`,
      persuasiva: `${nomeEmpresa}, seu concorrente que aparece na busca está levando o cliente que procurava você. Cada dia sem o site certo é venda indo para outro lugar.`,
      educativa: `${nomeEmpresa}, um site precisa de 3 coisas: aparecer no Google, carregar rápido e converter o visitante em contato. Vou te mostrar o checklist aplicado no seu atual.`,
      humanizada: `${nomeEmpresa}, você já deu um passo importante indo para o digital. Quero te ajudar a dar o próximo: fazer esse site começar a trabalhar para você de verdade.`,
      tecnica: `${nomeEmpresa}, posso rodar um diagnóstico técnico (velocidade, SEO, responsividade e conversão) e te entregar um relatório curto. Sem compromisso.`,
    },
    "Restrição financeira": {
      consultiva: `${nomeEmpresa}, entendo a realidade do caixa. E quando a gente enxerga o site como ferramenta de captação, o retorno costuma superar o custo. Deixa eu te mostrar uma opção que cabe no momento?`,
      executiva: `${nomeEmpresa}, temos uma condição flexível que se ajusta ao seu fluxo. Me diz um valor confortável que eu encontro o formato.`,
      premium: `${nomeEmpresa}, nesses casos minha recomendação é começar pela etapa essencial e escalar conforme o resultado. Você investe menos agora e cresce junto.`,
      curta: `Entendi. E se começarmos por uma etapa menor, cabe?`,
      persuasiva: `${nomeEmpresa}, quanto custa hoje não ter o site? Se 2 clientes novos pagam o investimento, a pergunta muda de 'posso pagar?' para 'posso ficar sem?'.`,
      educativa: `${nomeEmpresa}, o custo de oportunidade de não investir é maior que o investimento. Vou montar a conta real do seu segmento para você comparar.`,
      humanizada: `${nomeEmpresa}, sem problema nenhum. Quero encontrar um caminho que seja inteligente para o seu momento. Podemos conversar sobre um formato gradual?`,
      tecnica: `${nomeEmpresa}, proponho um plano de implementação em etapas: primeira entrega em ${vu ? "5" : "7"} dias, com custo diluído. Você evolui conforme o retorno.`,
    },
    "Vou pensar": {
      consultiva: `${nomeEmpresa}, pensar é ótimo. Pra te ajudar a decidir mais rápido: o que você sente que falta para tomar essa decisão? Preço, prazo ou resultado?`,
      executiva: `${nomeEmpresa}, se eu te entregar o resultado que você espera, você fecha hoje? Assim eu concentro o esforço no que importa.`,
      premium: `${nomeEmpresa}, apenas para seu processo de decisão: mantive a condição especial disponível até sexta. Quero que você decida com tudo nas mãos, sem pressa artificial.`,
      curta: `O que falta para você decidir?`,
      persuasiva: `${nomeEmpresa}, enquanto você pensa, o mercado não espera. A vaga no nosso cronograma sim. Se eu puder responder uma dúvida que resolva sua decisão, me diz qual é.`,
      educativa: `${nomeEmpresa}, decidir é mais fácil quando a gente quebra: (1) você vê o modelo, (2) você define o escopo, (3) eu mando o prazo. Pode começar pela 1?`,
      humanizada: `${nomeEmpresa}, sem pressão! Só quero ter certeza de que você tem todas as informações para decidir bem. O que ainda está em aberto na sua cabeça?`,
      tecnica: `${nomeEmpresa}, segue um resumo em 1 página com escopo, prazo e valor. Assim sua decisão fica baseada em dados, não em achismo.`,
    },
    "Poder de decisão dividido": {
      consultiva: `${nomeEmpresa}, decisão em família tem que ser conjunta mesmo. Vou te mandar um resumo simples que você encaminha para quem decide com você. Se precisarem de mim, eu me apresento.`,
      executiva: `Perfeito, decisão compartilhada é mais segura. Vou preparar um material curto e objetivo. Seu sócio prefere WhatsApp ou uma ligação de 5 minutos comigo?`,
      premium: `${nomeEmpresa}, para facilitar, posso preparar uma apresentação curta para vocês decidirem juntos. Inclui exemplo do segmento e condições. Posso enviar hoje?`,
      curta: `Claro! Te mando um material curto pra você mostrar. Aprova?`,
      persuasiva: `${nomeEmpresa}, quanto mais rápido vocês alinharem, mais rápido o site começa a trabalhar. Se ainda restar dúvida, eu resolvo com quem decide.`,
      educativa: `${nomeEmpresa}, vou simplificar a decisão de vocês: resumo em 1 página com o que entra, prazo e valor. Vocês avaliam em 5 minutos.`,
      humanizada: `${nomeEmpresa}, entendi. Quero que a decisão seja confortável para todos vocês. Me conta o que o sócio gostaria de saber para ficar tranquilo.`,
      tecnica: `${nomeEmpresa}, encaminho um PDF de 1 página com o escopo técnico, cronograma e condições. Vocês me retornam com qualquer ajuste.`,
    },
    "Falta de tempo": {
      consultiva: `${nomeEmpresa}, e é por isso que a gente cuida de tudo! Você não vai precisar parar nada do seu dia. O que preciso é só da sua aprovação em 2 momentos. Funciona?`,
      executiva: `${nomeEmpresa}, o processo é simples: eu cuido, você aprova. 10 minutinhos de alinhamento e eu toco o resto.`,
      premium: `${nomeEmpresa}, nossa metodologia foi desenhada para donos de negócio sem tempo: você recebe, avalia quando puder e responde no seu ritmo.`,
      curta: `Você não vai parar nada. Eu cuido, você aprova. Topa?`,
      persuasiva: `${nomeEmpresa}, pensar que falta tempo hoje custa mais caro do que 30 minutos de alinhamento. Cada mês sem site é dinheiro saindo pelo Google.`,
      educativa: `${nomeEmpresa}, o fluxo é: eu mapeio → você aprova → eu realizo. São só 2 decisões suas no projeto inteiro.`,
      humanizada: `${nomeEmpresa}, imagino como é corrido. Por isso te prometo: meus contatos com você serão curtos e objetivos. Só o essencial.`,
      tecnica: `${nomeEmpresa}, o projeto é assíncrono: você responde quando puder, e eu avanço nos demais itens em paralelo. Zero fricção para você.`,
    },
    "Adiamento": {
      consultiva: `${nomeEmpresa}, entendo perfeitamente. Se eu te chamar ${vu ? "na próxima semana" : "no mês que vem"} com um exemplo pronto do seu segmento, seria um bom momento? Assim a gente não deixa esfriar.`,
      executiva: `${nomeEmpresa}, vamos evitar deixar para depois: posso te ligar quinta às 10h para um alinhamento de 10 min? O que muda é só quando começamos a colher resultado.`,
      premium: `${nomeEmpresa}, para respeitar seu momento, mantive sua condição especial reservada por 15 dias. Depois, ela volta para o valor padrão. Okay?`,
      curta: `Beleza! Vou te chamar na sequência com algo que vale a pena ver.`,
      persuasiva: `${nomeEmpresa}, o 'depois' no mercado é caro: cada semana adiada é cliente novo indo para outra empresa. Que tal um passo pequeno essa semana?`,
      educativa: `${nomeEmpresa}, começar agora aproveita a baixa temporada para lançar pronto na alta. É o momento perfeito do ponto de vista estratégico.`,
      humanizada: `${nomeEmpresa}, sem problema nenhum! Me avisa quando for te chamar de novo que eu apareço. Sem incômodo.`,
      tecnica: `${nomeEmpresa}, posso congelar a proposta por 30 dias com os valores atuais. Se decidir depois, retomamos sem o custo de re-trabalho.`,
    },
    "Pedido de orçamento": {
      consultiva: `${nomeEmpresa}, ótimo! Antes de montar uma proposta que faça sentido (e não um papel genérico), me conta: o que você mais precisa que o site resolva: captar clientes, fortalecer marca ou os dois?`,
      executiva: `${nomeEmpresa}, te envio a proposta até amanhã. Enquanto isso, para eu precificar certo: qual é a sua prioridade — volume de clientes ou presença digital?`,
      premium: `${nomeEmpresa}, na minha entrega não existe proposta 'por cima'. Cada orçamento sai com o escopo sob medida. Para isso preciso de 3 informações suas. Me ajuda?`,
      curta: `Claro! Pra precificar certo: precisa mais de captar clientes ou fortalecer a marca?`,
      persuasiva: `${nomeEmpresa}, antes do orçamento, deixa eu te mostrar o resultado de um projeto semelhante. Preço sem valor é só número — o meu vem com resultado junto.`,
      educativa: `${nomeEmpresa}, uma proposta tem 4 partes: escopo, prazo, investimento e resultados esperados. Vou montar a sua com esse rigor. Só me passa o objetivo principal.`,
      humanizada: `${nomeEmpresa}, fico feliz com seu interesse! Pra te mandar algo que realmente sirva, me fala o que mais te incomoda hoje no seu negócio.`,
      tecnica: `${nomeEmpresa}, vou preparar um orçamento detalhado por módulos. Preciso saber: tem necessidade de agendamento online, e-commerce ou apenas site institucional?`,
    },
  };

  const chave =
    Object.keys(mapPorObjecao).find((k) => objecaoPrincipal.includes(k)) ??
    "Preço elevado";
  const modelo = mapPorObjecao[chave];

  const gerar = (tipo: TipoResposta): string => {
    const texto = modelo[tipo.toLowerCase() as keyof typeof modelo] ?? "";
    return texto.replace(/\$\{vu\}\)/g, (vu ? "7" : "15") + " dias").replace(/\$\{vu\}/g, vu ? "7" : "15");
  };

  return (["Consultiva", "Executiva", "Premium", "Curta", "Persuasiva", "Educativa", "Humanizada", "Técnica"] as TipoResposta[]).map(
    (tipo) => ({
      tipo,
      tom:
        tipo === "Consultiva"
          ? "Guia estratégico"
          : tipo === "Executiva"
          ? "Diretor comercial"
          : tipo === "Premium"
          ? "Experiência exclusiva"
          : tipo === "Curta"
          ? "Rápida e direta"
          : tipo === "Persuasiva"
          ? "Empurrão estratégico"
          : tipo === "Educativa"
          ? "Ensina o processo"
          : tipo === "Humanizada"
          ? "Próxima e calorosa"
          : "Detalhamento técnico",
      texto: gerar(tipo),
    })
  );
}

function gerarSugestoes(input: {
  modoFechamento: boolean;
  objecoes: string[];
  interesse: number;
  urgência: number;
  ultimaVoz: string;
  contatoNaoDecisor: boolean;
}): Sugestao[] {
  const { modoFechamento, objecoes, interesse, urgência, ultimaVoz, contatoNaoDecisor } = input;
  const lista: Sugestao[] = [];

  if (contatoNaoDecisor) {
    lista.push("Pedir encaminhamento ao dono", "Enviar material curto", "Marcar reunião");
  } else if (modoFechamento || (interesse > 60 && ultimaVoz === "cliente")) {
    lista.push("Marcar reunião", "Enviar site", "Criar urgência");
  } else if (objecoes.some((o) => /caro|preço|custo/.test(o))) {
    lista.push("Mostrar benefícios", "Mostrar diferenciais", "Enviar portfólio");
  } else if (objecoes.length > 0) {
    lista.push("Enviar portfólio", "Mostrar diferenciais", "Marcar ligação");
  } else if (interesse > 45) {
    lista.push("Enviar site", "Marcar ligação", "Responder amanhã");
  } else {
    lista.push("Esperar", "Responder amanhã", "Enviar portfólio");
  }
  if (urgência > 45 && !modoFechamento && !contatoNaoDecisor) lista.push("Criar urgência");
  return [...new Set(lista)].slice(0, 3);
}

function montarProximoPasso(input: {
  modoFechamento: boolean;
  objecoes: string[];
  probabilidade: number;
  ultimaVoz: string;
  ultimaCliente: string;
  contatoNaoDecisor: boolean;
}): string {
  const { modoFechamento, objecoes, probabilidade, ultimaVoz, contatoNaoDecisor } = input;

  if (contatoNaoDecisor)
    return `Descobrir/receber o contato do decisor de forma educada (perguntar quem cuida de internet/marketing), pedir encaminhamento de um material curto de 1 página e agendar follow-up com quem recebeu. Não oferecer preço nem tentar fechar com o intermediário.`;

  if (modoFechamento)
    return `Enviar agora a proposta de fechamento com condição por prazo e pedir confirmação explícita. Se ele pedir ajuste de valor, ofereça condição em troca de decisão imediata.`;

  if (objecoes.length > 0) {
    const primeira = objecoes[0];
    if (/preço|custo|dinheiro/.test(primeira))
      return `Apresentar o cálculo de retorno antes de qualquer oferta de desconto. Use a resposta Consultiva + Persuasiva. Non: não baixar o preço na primeira investida.`;
    if (/pensar/.test(primeira))
      return `Usar a pergunta de transição: 'se eu resolver essa dúvida, você fecha hoje?'. Descubra a objeção real escondida.`;
    if (/sócio|esposa|marido/.test(primeira))
      return `Entregar material curto de 1 página para ele apresentar a quem decide junto. Oferecer-se para conversar com os dois.`;
    return `Neutralizar a objeção principal com a técnica recomendada e, em seguida, pedir uma microdecisão (ver o modelo, marcar ligação).`;
  }

  if (ultimaVoz === "cliente" && probabilidade >= 50)
    return `Responder ainda hoje reforçando o próximo passo (ver o site / marcar reunião) e pedir uma microdecisão.`;

  if (probabilidade < 35)
    return `Enviar uma mensagem de valor (case do segmento) e agendar follow-up em 3 dias. Não perguntar 'e aí?', e sim entregar algo útil.`;

  return `Confirmar qual é a objeção real com uma pergunta objetiva e avançar na resposta.`;
}

function explicarPorque(objetivo: string, objecao: string, fechamento: boolean): string {
  if (fechamento) return `A estratégia prioriza o fechamento porque todos os sinais apontam para intenção de compra. Conduzir com confiança reduz a chance de o lead esfriar.`;
  if (objetivo === "NEUTRALIZAR OBJEÇÕES")
    return `A estratégia gira em torno de quebrar a objeção principal (${objecao.toLowerCase()}) com valor concreto antes de propor qualquer avanço. Isso reduz a resistência e aumenta a confiança.`;
  return `A abordagem valoriza reduzir a fricção da decisão: entregar valor primeiro, pedir decisões pequenas e manter o lead em movimento no funil.`;
}

function montarRiscos(objecoes: string[], fechamento: boolean, duvida: number): string[] {
  const riscos: string[] = [];
  if (objecoes.length > 2) riscos.push("Múltiplas objeções acumuladas podem indicar baixo poder de decisão.");
  if (duvida > 40) riscos.push("Indecisão elevada — o lead pode travar se a proposta não for clara e simples.");
  if (fechamento) riscos.push("Fechamento cedo demais pode gerar arrependimento pós-compra se o escopo não estiver claro.");
  riscos.push("Respostas genéricas ou a cópia das mensagens pode reduzir a confiança do cliente.");
  return riscos.slice(0, 3);
}

export function notaDaAnalise(analise: AnaliseIA): number {
  const base = analise.probabilidadeFechamento;
  const ajusteObjecoes = Math.max(0, 100 - analise.objecoesDetectadas.length * 3);
  return Math.round(base * 0.7 + ajusteObjecoes * 0.3);
}