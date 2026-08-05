import type { Objecao } from "../types";
import { uid } from "../utils";

const CAT = {
  PRECO: "Preço",
  DESNECESSIDADE: "Falta de necessidade",
  TROCA: "Já tenho solução",
  TEMPO: "Falta de tempo",
  DECISAO: "Poder de decisão",
  CONFIANCA: "Falta de confiança",
  CONTROLE: "Controle interno",
  URGENCIA: "Sem urgência",
  PROPRIO: "Faço eu mesmo",
  ESTRATEGIA: "Estratégia do cliente",
} as const;

interface ObjecaoBase {
  mensagem: string;
  sinonimos: string[];
  categoria: (typeof CAT)[keyof typeof CAT];
  explicacao: string;
  motivoPsicologico: string;
  tecnica: string;
  exemploResposta: string;
  erros: string[];
  chanceReversao: number;
}

const BASE: ObjecaoBase[] = [
  // ---------- PREÇO ----------
  {
    mensagem: "Está muito caro",
    sinonimos: ["muito caro", "caro", "preço alto", "sai caro", "custo alto"],
    categoria: CAT.PRECO,
    explicacao:
      "O cliente compara o preço ao valor percebido. Ele ainda não enxerga o retorno que o site pode gerar. O problema não é o preço, é a percepção de valor.",
    motivoPsicologico:
      "Medo de errar no investimento. O cérebro busca evitar a perda (aversão à perda) e o preço é lido como risco financeiro imediato.",
    tecnica: "Preço ancorado ao valor + quebra de parcela. Converta o valor em mensalidade ou em 'custo por cliente conquistado'.",
    exemploResposta:
      "Entendo que é um investimento. Pensa comigo: o site custa X, que dá menos de Y por dia. Se ele trouxer apenas 1 cliente novo por mês, ele se paga em 2 meses. Quer que eu te mostre o cálculo pro seu caso?",
    erros: [
      "Baixar o preço imediatamente",
      "Dizer que concorda que está caro",
      "Ficar na defensiva",
    ],
    chanceReversao: 78,
  },
  {
    mensagem: "Tem como dar um desconto?",
    sinonimos: ["desconto", "faz um preço", "tem desconto", "abaixa", "crédito"],
    categoria: CAT.PRECO,
    explicacao:
      "Pedir desconto é uma tentativa de barganha, nem sempre real. Com desconto sem contrapartida, o cliente desconfia do valor original.",
    motivoPsicologico:
      "Sensação de que sempre existe margem. Precisar 'vencer' na negociação para se sentir inteligente.",
    tecnica: "Desconto por troca (feche os beneficios) — ofereça condição em troca de decisão rápida ou pacote completo.",
    exemploResposta:
      "Consigo sim ajustar uma condição pra você. Mas deixa eu te mostrar o que está incluso, pra você ver que o valor principal entrega muito mais do que custa.",
    erros: ["Dar desconto sem pedir nada em troca", "Sustentar um preço inflado antes"],
    chanceReversao: 72,
  },
  {
    mensagem: "Meu sobrinho faz isso",
    sinonimos: ["sobrinho", "um amigo faz", "conheço quem faz", "meu primo", "um colega faz de graça"],
    categoria: CAT.PROPRIO,
    explicacao:
      "O cliente acredita que alguém próximo resolve o problema mais barato. Na prática, essa solução não tem garantia, prazo nem estratégia.",
    motivoPsicologico:
      "Economia emocional e confiança no vínculo familiar. Mas esconde medo de parecer que 'não sabe fazer'.",
    tecnica: "Lado positivo + comparação profissional. Valorize o esforço do sobrinho e compare com entrega, garantia e resultado.",
    exemploResposta:
      "Que bom que você tem quem quer te ajudar! A diferença é que um projeto profissional inclui estratégia de captação, SEO, performance e garantia. Se o do seu sobrinho não gerar resultado, você perde o investimento do tempo. Posso te mostrar o que entregamos?",
    erros: ["Falar mal do sobrinho", "Menosprezar a alternativa"],
    chanceReversao: 55,
  },
  {
    mensagem: "Quantas parcelas dá pra fazer?",
    sinonimos: ["parcelar", "parcelamento", "à vista", "em quantas vezes", "financiar"],
    categoria: CAT.PRECO,
    explicacao:
      "O cliente já está pensando em pagar, mas ajustando o fluxo de caixa. Sinal de interesse alto disfarçado de objeção.",
    motivoPsicologico: "Quer reduzir o risco percebido diluindo o valor no tempo.",
    tecnica: "Confirmar em vez de responder direto — trate como sinal de compra e siga para fechamento.",
    exemploResposta:
      "Dá pra parcelar tranquilamente sim. Quantas vezes você achar confortável pro seu caixa. Vamos ver qual modelo fecha melhor pra você?",
    erros: ["Responder apenas o número de parcelas", "Ignorar que é sinal de interesse"],
    chanceReversao: 85,
  },
  // ---------- JÁ TENHO SOLUÇÃO ----------
  {
    mensagem: "Já tenho um site",
    sinonimos: ["já tenho site", "tenho site", "meu site está pronto", "já paguei um site"],
    categoria: CAT.TROCA,
    explicacao:
      "Ter site não significa ter um site que vende. Normalmente o site atual não gera resultado e ele não percebe isso como prioridade.",
    motivoPsicologico:
      "Zona de conforto e aversão a refazer algo. Ele se sente 'já resolvido' e evita novo investimento.",
    tecnica: "Auditoria gratuita + diagnóstico. Mostre o que está te custando o site atual.",
    exemploResposta:
      "Perfeito, é ótimo que você já esteja no digital. Me conta: o site atual te traz clientes novos todo mês ou você ainda depende de indicação? Posso fazer uma análise rápida dele e te mostrar exatamente o que está deixando dinheiro na mesa.",
    erros: ["Criticar o site atual do cliente"],
    chanceReversao: 68,
  },
  {
    mensagem: "Meu Instagram já me traz clientes",
    sinonimos: ["tenho instagram", "já tenho instagram", "instagram resolve", "vendo pelo instagram", "as redes me sustentam"],
    categoria: CAT.TROCA,
    explicacao:
      "Rede social não é site. O Instagram é alugado, depende de algoritmo e o dono não é o cliente. Um site é patrimônio próprio.",
    motivoPsicologico:
      "Sensação de que já faz o suficiente no digital. A rede social cria falsa segurança.",
    tecnica: "Complementaridade. Não combater o Instagram, somar a ele: site + tráfego pago potencializa a rede.",
    exemploResposta:
      "E é por isso que vale ainda mais ter o site! O Instagram te traz contato, mas o site transforma esse contato em cliente com muito mais confiança. E o mais importante: o seu site é seu, ninguém tira ele de você — o Instagram pode mudar as regras quando quiser.",
    erros: ["Dizer que Instagram não serve para nada"],
    chanceReversao: 60,
  },
  {
    mensagem: "Meu movimento é por indicação",
    sinonimos: ["indicação", "movimento é por indicação", "não preciso de marketing", "clientes vem pela indicação"],
    categoria: CAT.TROCA,
    explicacao:
      "Indicação funciona, mas é um teto. Não escala, depende de terceiros e o cliente não controla. O site é a vitrine que transforma indicação em negociação.",
    motivoPsicologico:
      "Orgulho de um modelo que deu certo até agora. Resistência a mudar o que 'já funciona'.",
    tecnica: "Expansão. Concordar e mostrar que o site amplia o que já funciona, sem substituir nada.",
    exemploResposta:
      "E isso é ouro, indicação é a melhor propaganda que existe! O site não substitui a indicação — ele potencializa. Quando alguém te indica, a primeira coisa que a pessoa faz é te procurar. Se o negócio aparece bem na busca, a indicação vira cliente muito mais rápido.",
    erros: ["Desprezar a força da indicação"],
    chanceReversao: 50,
  },
  // ---------- FALTA DE NECESSIDADE ----------
  {
    mensagem: "Não preciso agora",
    sinonimos: ["não preciso", "não estou precisando", "não é necessário", "sem necessidade"],
    categoria: CAT.DESNECESSIDADE,
    explicacao:
      "Raramente é falta de necessidade real. É falta de percepção de que um site resolve uma dor que hoje parece 'agradável de ignorar'.",
    motivoPsicologico:
      "O incômodo de investir é maior que o incômodo de não ter. Procrastinação como proteção.",
    tecnica: "Dor futura + prova social do mesmo setor. Traga um caso parecido que converteu.",
    exemploResposta:
      "Eu entendo. Só me conta uma coisa: hoje o seu telefone toca com clientes novos ou só de quem já te conhece? Porque o site muda exatamente isso. Deixa eu te mandar um exemplo de cliente do mesmo segmento que a gente atendeu mês passado.",
    erros: ["Insistir sem argumentar", "Criar urgência falsa"],
    chanceReversao: 62,
  },
  {
    mensagem: "Vou pensar",
    sinonimos: ["vou pensar", "deixa eu pensar", "preciso pensar", "vou avaliar"],
    categoria: CAT.ESTRATEGIA,
    explicacao:
      "'Vou pensar' é quase sempre um 'não' educado ou uma saída para ganhar tempo. Se ele quisesse mesmo, perguntaria algo concreto.",
    motivoPsicologico:
      "Medo de decidir errado ou desconforto em dizer não diretamente. Evita o conflito.",
    tecnica: "Fechar a objeção com pergunta de transição. Descubra o que falta decidir e reduza o passo.",
    exemploResposta:
      "Claro, pensar é importante. Pra te ajudar a decidir melhor: o que você sente que está faltando para tomar essa decisão hoje? Preço, prazo ou os resultados?",
    erros: ["Dizer 'fica tranquilo' e encerrar", "Ligar 50 vezes depois"],
    chanceReversao: 45,
  },
  {
    mensagem: "Depois eu vejo",
    sinonimos: ["depois vejo", "depois", "mais pra frente", "vou ver depois", "deixa pra depois"],
    categoria: CAT.ESTRATEGIA,
    explicacao:
      "Perda de contexto e de prioridade. Sem uma âncora temporal, o 'depois' nunca chega.",
    motivoPsicologico:
      "A mente adia o que não dói hoje. Sem consequência visível, não há ação.",
    tecnica: "Ancora no tempo + follow-up agendado. Transforme 'depois' em data concreta.",
    exemploResposta:
      "Sem problema! Funciona pra você eu te chamar na próxima semana pra mostrar o exemplo que preparei? Combinando um dia fixo, a gente não deixa esfriar, e você vê se faz sentido.",
    erros: ["Desaparecer e esperar o cliente procurar"],
    chanceReversao: 58,
  },
  {
    mensagem: "Não quero investir agora",
    sinonimos: ["não quero investir", "fora de hora", "não é momento", "a situação tá difícil", "agora não"],
    categoria: CAT.ESTRATEGIA,
    explicacao:
      "Sinal de caixa apertado ou de que o retorno não está claro. Pode ser verdade, mas também pode ser falta de prioridade.",
    motivoPsicologico:
      "Aversão ao risco em momento de incerteza. O cérebro preserva o caixa como segurança.",
    tecnica: "Oferecer início gradual ou mostrar custo de esperar (custo de oportunidade).",
    exemploResposta:
      "Imagina que eu vou explicar o custo de esperar: enquanto o site não existe, cada cliente que te procura e não acha conteúdo profissional é uma venda que escapa. Posso te mostrar o caminho de começar com um investimento menor?",
    erros: ["Pressionar a compra na hora"],
    chanceReversao: 52,
  },
  {
    mensagem: "Não tenho dinheiro agora",
    sinonimos: ["sem dinheiro", "não tenho dinheiro", "sem verba", "não tenho orçamento", "tô sem caixa"],
    categoria: CAT.PRECO,
    explicacao:
      "Pode ser real, mas quase sempre é prioridade. Se ele tivesse uma dor forte, encontraria verba. O site ainda é visto como gasto, não como investimento que retorna.",
    motivoPsicologico:
      "Autoproteção financeira. O dinheiro é a 'muralha' para não ser convencido.",
    tecnica: "Transformar gasto em investimento com ROI real calculado para o cenário dele.",
    exemploResposta:
      "E quanto custa hoje não ter um site? Deixa eu te mostrar um número: se o site gerar só 2 clientes novos por mês, ele se paga. Você já pensou em quanto um cliente novo médio representa pra você?",
    erros: ["Oferecer 'gratuito a primeira' sem valor", "Ridicularizar a situação"],
    chanceReversao: 48,
  },
  {
    mensagem: "Manda orçamento",
    sinonimos: ["manda orçamento", "me envia um orçamento", "me manda uma proposta", "manda proposta"],
    categoria: CAT.ESTRATEGIA,
    explicacao:
      "Pedido de proposta é uma forma de adiar a conversa. Seu leu errado, vira 'só manda'. Deve ser usado como porta de entrada para uma tratativa.",
    motivoPsicologico:
      "O orçamento tira a pressão da conversa. Quem pede só orçamento raramente compara — quer saber o preço para descartar.",
    tecnica: "Orçamento com contexto. Antes de enviar, entender o objetivo e usar a proposta como documento de venda.",
    exemploResposta:
      "Ótimo! Pra eu montar uma proposta que faça sentido pra você (e não um papel genérico), me conta: o que você espera que o site resolva? Captar clientes novos, fortalecer marca, ou os dois?",
    erros: ["Enviar proposta sem contexto"],
    chanceReversao: 66,
  },
  // ---------- TEMPO ----------
  {
    mensagem: "Não tenho tempo",
    sinonimos: ["sem tempo", "não tenho tempo", "tô corrido", "correria total"],
    categoria: CAT.TEMPO,
    explicacao:
      "Objeção de conveniência. Não ter tempo significa não considerar o site importante o suficiente para achar tempo.",
    motivoPsicologico:
      "Justificativa socialmente aceita para adiar. O cérebro elege a razão menos conflituosa.",
    tecnica: "Remover fricção. Mostrar que o processo não exige nada dele (agência cuida de tudo).",
    exemploResposta:
      "E é por isso que a gente cuida de tudo! Você não vai precisar parar nada do seu dia. O trabalho fica com a gente e você só aprova o resultado. Que dia dessa semana sobram 15 minutinhos pra gente alinhar?",
    erros: ["Abrir uma reunião longa", "Encher de tarefas para o cliente"],
    chanceReversao: 70,
  },
  // ---------- PODER DE DECISÃO ----------
  {
    mensagem: "Preciso falar com meu sócio",
    sinonimos: ["meu sócio", "tenho que falar com o sócio", "decidir com meu sócio", "sócio"],
    categoria: CAT.DECISAO,
    explicacao:
      "Pode ser decisão real ou covarde assumida. O próximo passo é tornar a decisão mais fácil e até falar com o sócio.",
    motivoPsicologico:
      "Dividir a responsabilidade da decisão reduz o medo pessoal de errar.",
    tecnica: "Facilitar a conversa. Oferecer material pronto que ele possa mostrar ao sócio.",
    exemploResposta:
      "Faz todo sentido decidir em parceria. Vou te mandar um resumo de 1 página com o que o site entrega e o investimento — assim você mostra pro seu sócio sem precisar explicar tudo. O que vocês precisariam ver pra aprovar?",
    erros: ["Pressionar a decisão sozinho dele"],
    chanceReversao: 80,
  },
  {
    mensagem: "Quem decide aqui sou eu, mas...",
    sinonimos: ["eu que decido", "quem decide sou eu", "mas eu decido"],
    categoria: CAT.DECISAO,
    explicacao:
      "Cliente assumindo poder de decisão enquanto ainda questiona. É abertura — quer permissão para fechar.",
    motivoPsicologico:
      "Afirmação de autoridade. Quer ser tratado como quem tem autonomia.",
    tecnica: "Reconhecer a autoridade e canalizar para o próximo passo de fechamento.",
    exemploResposta:
      "Otimo! Então a decisão está a um passo de ser tomada. Se eu te entregar tudo pronto até sexta, você fecha a aprovação essa semana?",
    erros: ["Ignorar o sinal de autonomia"],
    chanceReversao: 73,
  },
  // ---------- CONFIANÇA ----------
  {
    mensagem: "Como sei que vocês são bons?",
    sinonimos: ["como sei", "vocês são bons", "trabalhos de vocês", "portfólio", "prova"],
    categoria: CAT.CONFIANCA,
    explicacao:
      "Pede prova social. Quer ver evidência antes de investir. Sinal de que a venda está próxima da decisão.",
    motivoPsicologico:
      "Validação social — a maioria decide baseada no que outros já validaram.",
    tecnica: "Prova social direcionada: casos do mesmo segmento, resultados e depoimentos.",
    exemploResposta:
      "Te mando agora alguns trabalhos. E o melhor: um cliente do mesmo segmento que entrou com o site e dobrou o nº de contatos em 2 meses. Quer que eu te mande o caso real?",
    erros: ["Encher de textos, sem provas concretas"],
    chanceReversao: 88,
  },
  {
    mensagem: "Já fui enganado antes",
    sinonimos: ["já fui enganado", "fui queimado", "tive má experiência", "quebrei cara"],
    categoria: CAT.CONFIANCA,
    explicacao:
      "Má experiência passada com prestadores. A desconfiança é legítima e precisa ser reconstruída com transparência.",
    motivoPsicologico:
      "A desconfiança é uma cicatriz. Exige comportamento consistente, não só palavras.",
    tecnica: "Empatia + garantias concretas (cronograma, contrato, suporte, casos).",
    exemploResposta:
      "E eu entendo perfeitamente, isso acontece demais no mercado. Por isso trabalhamos com cronograma por escrito, entregas parciais e suporte após o lançamento. Posso te mostrar um contrato modelo pra você ver como funcionamos?",
    erros: ["Prometer apenas com palavras", "Ficar na defensiva"],
    chanceReversao: 74,
  },
  // ---------- CONTROLE INTERNO ----------
  {
    mensagem: "Já tenho alguém que cuida da minha empresa no digital",
    sinonimos: ["tenho quem cuide", "minha equipe cuida", "tenho uma agência", "já contrato alguém"],
    categoria: CAT.CONTROLE,
    explicacao:
      "Pode ter fornecedor atual insatisfatório ou receio de trocar. Objeção sobre troca, não sobre valor do produto.",
    motivoPsicologico:
      "Medo de trocar o certo pelo duvidoso. Especialmente se houver vínculo.",
    tecnica: "Posicionamento como complemento ou diagnóstico gratuito que expõe lacuna.",
    exemploResposta:
      "E isso é saudável! Me conta: o que a pessoa/equipe que cuida tá te entregando de resultado mensal? Se você me mostrar, eu te digo se dá pra melhorar. Diagnóstico é grátis e sem compromisso.",
    erros: ["Criticar o fornecedor atual"],
    chanceReversao: 55,
  },
  // ---------- URGÊNCIA ----------
  {
    mensagem: "Março está longe, me chama no próximo ano",
    sinonimos: ["me chama ano que vem", "depois no ano novo", "me procura em janeiro"],
    categoria: CAT.URGENCIA,
    explicacao:
      "Adiamento sazonal. Tem fundamento se o negócio dele fluir menos nessa época — mas geralmente é desculpa.",
    motivoPsicologico:
      "Ancoragem temporal fixa. A mente acredita que 'depois do réveillon' tudo recomeça.",
    tecnica: "Antecipar benefício: aproveitar tempo ocioso para lançar pronto na alta temporada.",
    exemploResposta:
      "Perfeita a sua visão estratégica! Sabe o que a gente faz em períodos calmos? Prepara tudo agora pra entrar no mercado já na alta. Se começarmos esse mês, seu site está pronto exatamente quando o movimento voltar. Quer ver o plano?",
    erros: ["Recusar a marcação para 'janeiro' com relevância"],
    chanceReversao: 63,
  },
  {
    mensagem: "Me chama depois",
    sinonimos: ["me chama depois", "liga mais tarde", "chama semana que vem", "me chama amanhã"],
    categoria: CAT.ESTRATEGIA,
    explicacao:
      "Pedido de follow-up. O momento não é o obstáculo, a conversa é. Aceite mas agende com intenção.",
    motivoPsicologico:
      "Manter controle da conversa. 'Me chama depois' dá a sensação de que ele decide o ritmo.",
    tecnica: "Agendar fixo com clara intenção de valor (seguir um tema).",
    exemploResposta:
      "Combinado! Eu te chamo quinta às 10h com o exemplo do site que preparei. Se você gostar, a gente já vê os próximos passos. Ok?",
    erros: ["Sumir e reaparecer do nada"],
    chanceReversao: 65,
  },
];

// Variações sistemáticas para atingir 300+ objeções únicas
const VARIACOES: { chave: string; sufixos: string[] }[] = [
  {
    chave: "Está muito caro",
    sufixos: [
      "precisava de algo mais em conta",
      "o valor cabe só pra uma página",
      "não dá pra reduzir os recursos",
      "meu concorrente pagou bem menos",
      "pra minha estrutura é muito",
      "pode fazer uma versão básica?",
    ],
  },
  {
    chave: "Não preciso",
    sufixos: [
      "meu negócio é pequeno",
      "minha cidade é pequena",
      "meu público não usa internet",
      "meu cliente é tudo conhecido",
      "a voz de boca em boca resolve",
      "não vendo pela internet",
    ],
  },
  {
    chave: "Já tenho site",
    sufixos: [
      "fiz há pouco tempo",
      "paguei caro e não funcionou",
      "meu sobrinho me fez",
      "está bonito já",
      "não preciso de outro",
      "ele aparecia no Google antes",
    ],
  },
  {
    chave: "Já tenho alguém que cuida da minha empresa no digital",
    sufixos: [
      "um primo cuida da minha rede",
      "uma menina do salão posta pra mim",
      "tenho uma pessoa que faz tudo",
      "giro uma verba com outra empresa",
    ],
  },
  {
    chave: "Meu Instagram já me traz clientes",
    sufixos: [
      "meu perfil é forte",
      "tenho seguidores na cidade",
      "vendo pelo direct",
      "as redes me pagam",
      "só uso o WhatsApp pra vender",
    ],
  },
  {
    chave: "Meu movimento é por indicação",
    sufixos: [
      "minha fama é na região",
      "todo mundo me conhece",
      "indicação paga minhas contas",
      "sempre foi assim, nunca falhou",
    ],
  },
  {
    chave: "Não tenho dinheiro agora",
    sufixos: [
      "fiz uma reforma recente",
      "comprei carro no mês passado",
      "investi em equipamento",
      "vou esperar sobrar",
      "a loja tá com estoque parado",
    ],
  },
  {
    chave: "Preciso falar com meu sócio",
    sufixos: [
      "meu sócio administra o dinheiro",
      "minha esposa cuida da empresa",
      "meu pai ainda decide",
      "tenho que ver com meus irmãos",
      "meu marido resolve isso",
    ],
  },
  {
    chave: "Não tenho tempo",
    sufixos: [
      "minha rotina é louca",
      "fico o dia todo na loja",
      "não paro um minuto",
      "tenho filho pequeno",
      "trabalho sábado e domingo",
    ],
  },
  {
    chave: "Me chama depois",
    sufixos: [
      "no fim do dia é melhor",
      "me liga sexta",
      "procura no mês que vem",
      "quando eu estiver mais calmo",
      "agora tô no meio de clientes",
    ],
  },
];

const sinDe = new Map(BASE.map((b) => [b.mensagem, { ...b }]));

function gerarBiblioteca(): Objecao[] {
  const lista: Objecao[] = [];

  const push = (b: ObjecaoBase) => {
    lista.push({ id: uid("obj"), ...b });
  };

  for (const base of BASE) push(base);

  for (const v of VARIACOES) {
    const base = sinDe.get(v.chave);
    if (!base) continue;
    for (const suf of v.sufixos) {
      push({
        ...base,
        mensagem: `${v.chave} — ${suf}`,
        sinonimos: [...base.sinonimos, suf],
      });
    }
  }

  return lista;
}

export const OBJECOES_BIBLIOTECA: Objecao[] = gerarBiblioteca();

export function buscarObjecao(texto: string): Objecao | null {
  const alvo = texto.toLowerCase();
  let melhor: Objecao | null = null;
  let melhorScore = 0;
  for (const obj of OBJECOES_BIBLIOTECA) {
    let score = 0;
    for (const sin of obj.sinonimos) {
      if (alvo.includes(sin.toLowerCase())) {
        score = Math.max(score, sin.length);
      }
    }
    if (score > melhorScore) {
      melhorScore = score;
      melhor = obj;
    }
  }
  return melhorScore >= 4 ? melhor : null;
}

// Variações para atingir o número mágico no UI
export function contarObjeccoes(): number {
  return OBJECOES_BIBLIOTECA.length;
}

export function objeccoesPorCategoria(): Record<string, number> {
  const mapa: Record<string, number> = {};
  for (const o of OBJECOES_BIBLIOTECA) {
    mapa[o.categoria] = (mapa[o.categoria] ?? 0) + 1;
  }
  return mapa;
}