import type { CategoriaCopy, CopyTemplate } from "../types";
import { uid } from "../utils";

interface BaseCopy {
  categoria: CategoriaCopy;
  titulo: string;
  template: string;
  descricao: string;
}

const BASE: BaseCopy[] = [
  // ---------------- PRIMEIRA ABORDAGEM ----------------
  {
    categoria: "Primeira abordagem",
    titulo: "Abordagem com elogio ao Google",
    template:
      "Olá, {nome}! Encontrei o {segmento} de vocês aqui no Google e me chamou a atenção como vocês cuidam bem de {diferencial}. Eu sou {vendedor}, da {agencia}. Desenvolvemos o site do {empresa_referencia} aqui da cidade e o resultado foi muito bom. Vou te mostrar o que fizemos — me manda um ok que eu te envio?",
    descricao: "Usa elogio real + prova social de mesmo segmento para abrir conversa.",
  },
  {
    categoria: "Primeira abordagem",
    titulo: "Abordagem com site criado (pré-pronta)",
    template:
      "{nome}, preparei um site especialmente pro {segmento} de vocês — com as informações que encontrei sobre o negócio. Ficou realmente bonito. Posso te mostrar por aqui mesmo? Se gostar, a gente personaliza tudo com a cara de vocês.",
    descricao: "Apresenta o site já criado como amostra do trabalho, gatilho de curiosidade + reciprocidade.",
  },
  {
    categoria: "Primeira abordagem",
    titulo: "Abordagem curta e direta",
    template:
      "Oi, {nome}! Tudo bem? Vi que o {segmento} de vocês está bem avaliado no Google (nota {nota}). Fiz um site modelo pro negócio de vocês de cortesia e queria te mostrar. Posso te mandar o link?",
    descricao: "Curta, com prova social (nota) e proposta concreta.",
  },
  {
    categoria: "Primeira abordagem",
    titulo: "Abordagem por diferencial da cidade",
    template:
      "{nome}, bom dia! Sou {vendedor} e ajudo negócios de {cidade} a aparecerem mais na internet. Reparei que o {segmento} de vocês ainda não tem site próprio — e muitos clientes procuram no Google antes de ligar. Fiz uma demonstração rápida. Posso compartilhar?",
    descricao: "Doutrina a dor (busca no Google) + ausência de site.",
  },
  {
    categoria: "Primeira abordagem",
    titulo: "Abordagem Instagram",
    template:
      "Oi, {nome}! Vi o Instagram do {segmento} de vocês (@{instagram}) e gostei muito do conteúdo. Vocês já tem bastante movimento por lá — um site profissional só aumentaria a confiança de quem chega. Trabalho com isso e queria mostrar um exemplo. Posso?",
    descricao: "Complementa a rede social existente, sem atacar.",
  },
  {
    categoria: "Primeira abordagem",
    titulo: "Abordagem WhatsApp direto",
    template:
      "Olá, {nome}! Tudo certo? Meu nome é {vendedor}, da {agencia}. Trabalho com sites que convertem visitantes em clientes. Peguei o contato do {segmento} de vocês pela página do Google e preparei algo especial. Me permite mostrar por aqui?",
    descricao: "Transparente sobre a fonte do contato e direta.",
  },
  {
    categoria: "Primeira abordagem",
    titulo: "Abordagem quando tem site ruim",
    template:
      "{nome}, oi! Encontrei o site de vocês e notei que ele tem bastante potencial. Analiso sites de negócios da região e identifiquei {pontos_melhorar}. Posso te mandar um diagnóstico gratuito com 3 sugestões práticas?",
    descricao: "Oferece diagnóstico gratuito, gatilho de valor + autoridade.",
  },
  // ---------------- FALAR COM O DECISOR (atendente/funcionário) ----------------
  {
    categoria: "Falar com o decisor",
    titulo: "Quem decide (abertura educada)",
    template:
      "Olá! Tudo bem? Vi o {segmento} de vocês no Google e preparei um material bem rápido sobre sites. Você poderia me dizer se é a pessoa que cuida disso aí, ou se eu posso falar com quem decide sobre internet/marketing?",
    descricao: "Descobre educadamente quem é o decisor antes de vender. Perfeito para quando atende não é o dono.",
  },
  {
    categoria: "Falar com o decisor",
    titulo: "Pedir encaminhamento ao dono",
    template:
      "Oi, tudo certo? Sem querer incomodar: preparei um site modelo pro {segmento} de vocês, mas queria mostrar pra quem decide. Dá pra você repassar pra pessoa responsável? Ou me diz o melhor jeito de falar com ela que eu sigo por lá.",
    descricao: "Usado quando o atendente respondeu — pede encaminhamento sem soar invasivo.",
  },
  {
    categoria: "Falar com o decisor",
    titulo: "Material de 1 página pra repassar",
    template:
      "Perfeito, entendi! Então te mando só uma página bem resumida (com um exemplo de site) pra você repassar pra quem decide. Sem compromisso — se gostarem, a gente conversa. Posso enviar por aqui?",
    descricao: "Transforma o atendente em aliado: entrega material curto para chegar ao decisor.",
  },
  {
    categoria: "Falar com o decisor",
    titulo: "Quando atendente diz 'depende do dono'",
    template:
      "Claro, super entendo! E qual seria o melhor momento pra falar com ele/ela? Se preferir, posso deixar o material aqui e você repassa — ou me passa um contato/Instagram da pessoa que cuida disso. O que for mais fácil pra você.",
    descricao: "Respeita o processo interno e oferece caminhos sem pressionar o atendente.",
  },
  {
    categoria: "Falar com o decisor",
    titulo: "Follow-up com quem repassou",
    template:
      "Oi! Passando rapidinho: conseguiu repassar aquele material do site pra quem decide? Se você não ficar responsável por isso, tudo bem — é só me dizer quem cuida e eu sigo com ela. Valeu!",
    descricao: "Follow-up leve que não cobra o atendente, apenas redireciona.",
  },
  // ---------------- REAPROXIMAÇÃO ----------------
  {
    categoria: "Reaproximação",
    titulo: "Reaproximação com novidade",
    template:
      "{nome}, tudo bem? Algumas semanas atrás conversamos sobre o site do {segmento} de vocês. Enquanto isso, fechamos projetos para {empresa_referencia} e lembrei do seu. Fiz algumas atualizações no modelo que tinha mostrado. Quer ver como ficou?",
    descricao: "Retoma com novidade real, sem soar insistente.",
  },
  {
    categoria: "Reaproximação",
    titulo: "Reaproximação com prova nova",
    template:
      "Oi, {nome}! Não sei se você lembra, mas tinha mostrado uma ideia de site pro {segmento} de vocês. Desde então um negócio bem parecido com o de vocês aqui de {cidade} dobrou os pedidos com o site que fizemos. Posso te mostrar esse case?",
    descricao: "Usa resultado recente de um case semelhante.",
  },
  {
    categoria: "Reaproximação",
    titulo: "Reaproximação suave (reset)",
    template:
      "{nome}, tudo certo? Passando pra fazer uma limpa no meu cadastro — queria confirmar se ainda posso te mandar ideias de site pro negócio de vocês de vez em quando. Se preferir, é só falar que eu paro por aqui! 😊",
    descricao: "Respeitosa, pede permissão e mantém canal aberto.",
  },
  {
    categoria: "Reaproximação",
    titulo: "Reaproximação com benefício novo",
    template:
      "Oi, {nome}! Lançamos agora um formato de site com agendamento embutido — perfeito pro {segmento} de vocês, que já tem bem avaliado no Google ({nota}). Quer que eu te mostre como funciona?",
    descricao: "Apresenta recurso novo relevante ao negócio.",
  },
  // ---------------- FOLLOW-UP ----------------
  {
    categoria: "Follow-up",
    titulo: "Follow-up 1 (1 dia)",
    template:
      "{nome}, tudo bem? Passando pra saber se você conseguiu ver o link que enviei. Qualquer dúvida sobre o site, pode me chamar que eu explico rapidinho.",
    descricao: "Follow-up leve após envio de material.",
  },
  {
    categoria: "Follow-up",
    titulo: "Follow-up 2 (3 dias)",
    template:
      "Oi, {nome}! Não quero te atrapalhar — só deixar registrado que o site modelo pro {segmento} de vocês está disponível. Pensei que seria útil pra você avaliar. Se não for o momento, é só me avisar.",
    descricao: "Follow-up com liberação de pressão.",
  },
  {
    categoria: "Follow-up",
    titulo: "Follow-up 3 (7 dias)",
    template:
      "{nome}, tudo certo? Encontrei um resultado interessante do {empresa_referencia} (mesmo segmento de vocês) que fechou com a gente mês passado. Me dá 1 minuto pra te mostrar o antes e depois?",
    descricao: "Follow-up com prova de resultado concreta.",
  },
  {
    categoria: "Follow-up",
    titulo: "Follow-up 4 (15 dias)",
    template:
      "Oi, {nome}! Sempre vale reforçar: preparei um site pro {segmento} de vocês, com as informações que encontrei. Sem compromisso, você pode avaliar. Se ainda não é o momento, te deixo em paz — me avisa como prefere.",
    descricao: "Follow-up de longo prazo com respeito total.",
  },
  {
    categoria: "Follow-up",
    titulo: "Follow-up 5 (30 dias)",
    template:
      "{nome}, passando só pra agradecer a conversa que tivemos e deixar meus contatos. Se um dia precisar de um site pro {segmento} de vocês, é só chamar. Continuo à disposição!",
    descricao: "Follow-up de encerramento amigável que mantém porta aberta.",
  },
  // ---------------- QUEBRA DE OBJEÇÕES ----------------
  {
    categoria: "Quebra de objeções",
    titulo: "Objeção: caro",
    template:
      "Entendo que seja um investimento, {nome}. Mas deixa eu te mostrar o lado bom: o site custa {valor}, que dá menos de {valor_dia} por dia. Se ele trouxer 1 cliente novo por mês, se paga em 2 meses. Quer que eu te mostre esse cálculo pro seu caso?",
    descricao: "Quebra de preço em valor diário + ROI.",
  },
  {
    categoria: "Quebra de objeções",
    titulo: "Objeção: já tenho site",
    template:
      "E é ótimo que você já esteja no digital, {nome}! Me conta: o site atual te traz quantos clientes novos por mês? Posso fazer uma análise rápida e te mostrar o que está deixando dinheiro na mesa. O diagnóstico é gratuito.",
    descricao: "Transforma objeção em oportunidade de diagnóstico.",
  },
  {
    categoria: "Quebra de objeções",
    titulo: "Objeção: sobrinho faz",
    template:
      "Que bom que você tem essa ajuda, {nome}! A diferença é que um projeto profissional inclui estratégia de SEO, performance e garantia por escrito. Se o projeto do sobrinho não der resultado, quem te garante? Posso te mostrar o que entregamos.",
    descricao: "Comparação profissional sem atacar a alternativa.",
  },
  {
    categoria: "Quebra de objeções",
    titulo: "Objeção: não preciso agora",
    template:
      "Entendo, {nome}. Só uma pergunta: hoje, quando alguém te procura pelo Google, o que a pessoa encontra? Se a resposta não te agradar, talvez o momento seja melhor do que você imagina. Deixa eu te mostrar um caso rápido?",
    descricao: "Faz o cliente descobrir a própria dor.",
  },
  {
    categoria: "Quebra de objeções",
    titulo: "Objeção: sem dinheiro",
    template:
      "E quanto está custando hoje não ter o site, {nome}? Pensando por outro ângulo: o site é a ferramenta que traz cliente novo. Se 2 clientes novos por mês pagam o investimento, o site na verdade devolve o valor. Posso te mostrar esse número pro seu caso?",
    descricao: "Inverte a conta do investimento.",
  },
  // ---------------- AGENDAMENTO ----------------
  {
    categoria: "Agendamento",
    titulo: "Agendar ligação",
    template:
      "{nome}, prefere que eu te ligue? Me diz um horário bom hoje ou amanhã que eu te chamo — 15 minutinhos, só pra te mostrar a ideia do site pro {segmento} de vocês. Ok?",
    descricao: "Oferece opção concreta de horário para ligação.",
  },
  {
    categoria: "Agendamento",
    titulo: "Agendar reunião",
    template:
      "{nome}, que tal agendarmos uma conversa rápida pra eu te mostrar o site modelo? Segunda ou terça, no horário que ficar melhor pra você — 20 minutinhos resolvem. Qual dia funciona?",
    descricao: "Reunião rápida com opção de dias.",
  },
  {
    categoria: "Agendamento",
    titulo: "Agendamento quando pede para chamar depois",
    template:
      "Perfeito, {nome}! Então fico com quinta-feira às 10h pra te mostrar o exemplo que preparei. Se algo mudar, é só me avisar. Combinado?",
    descricao: "Converte 'chama depois' em data fixa.",
  },
  // ---------------- ENVIO DE PROPOSTA ----------------
  {
    categoria: "Envio de proposta",
    titulo: "Envio de proposta com valor",
    template:
      "{nome}, conforme conversamos, montei a proposta do site pro {segmento} de vocês. Inclui: {itens}. O investimento é {valor} com {condicoes}. Quando puder dar uma olhada, me avisa que eu te explico cada ponto. Também separo uma condição especial se fecharmos essa semana.",
    descricao: "Proposta estruturada + condição por prazo (urgência).",
  },
  {
    categoria: "Envio de proposta",
    titulo: "Proposta antes/depois",
    template:
      "{nome}, segue a proposta! Não deixei apenas preço — coloquei o antes e depois de clientes que fechamos em {cidade}. Dá uma olhada nos resultados da página 2. Qualquer dúvida, eu te explico por aqui ou por ligação.",
    descricao: "Proposta com prova social embutida.",
  },
  // ---------------- PÓS-PROPOSTA ----------------
  {
    categoria: "Pós-proposta",
    titulo: "Follow-up pós-proposta (2 dias)",
    template:
      "{nome}, tudo bem? Passando pra saber se você conseguiu avaliar a proposta. Se tiver qualquer dúvida sobre valores, prazos ou o que está incluso, me chama que eu ajusto. Quero que a decisão seja fácil pra você.",
    descricao: "Follow-up de proposta suave.",
  },
  {
    categoria: "Pós-proposta",
    titulo: "Pós-proposta com adicional",
    template:
      "Oi, {nome}! Vou aproveitar e incluir na proposta o {adicional} sem custo extra para quem fechar até {data_limite}. É nosso jeito de agradecer a confiança. Vale confirmar seu interesse pra eu reservar a agenda?",
    descricao: "Adiciona bônus com data limite.",
  },
  // ---------------- FECHAMENTO ----------------
  {
    categoria: "Fechamento",
    titulo: "Fechamento direto",
    template:
      "{nome}, se está tudo certo com a proposta, posso dar início ao projeto essa semana? Assim você já entra no cronograma e o site fica pronto em {prazo}. Confirmo aqui com você?",
    descricao: "Pedido de confirmação direto e sem enrolação.",
  },
  {
    categoria: "Fechamento",
    titulo: "Fechamento com opções",
    template:
      "{nome}, pra facilitar: podemos começar com o site completo ou com a primeira etapa (home + página de contato) pra você sentir o resultado mais rápido. Qual prefere que eu reserve pra você?",
    descricao: "Fechamento por escolha entre duas opções.",
  },
  {
    categoria: "Fechamento",
    titulo: "Fechamento com urgência legítima",
    template:
      "{nome}, só um aviso honesto: nossa agenda de projetos de {mes} está quase cheia. Se fecharmos até {data_limite}, consigo garantir a entrega em {prazo}. Depois disso, o prazo passa para o mês seguinte. Quer garantir o seu espaço?",
    descricao: "Urgência real baseada em agenda.",
  },
  {
    categoria: "Fechamento",
    titulo: "Fechamento com garantia",
    template:
      "{nome}, pra sua tranquilidade: só pagamos a 2ª parcela quando você aprovar o site pronto. E se em 30 dias você não estiver satisfeito, ajustamos até ficar do seu jeito. Posso considerar fechado?",
    descricao: "Reduz risco com garantias concretas.",
  },
  // ---------------- REATIVAÇÃO ----------------
  {
    categoria: "Reativação de leads antigos",
    titulo: "Reativação sazonal",
    template:
      "{nome}, tudo bem? Passou um tempo, mas lembrei do {segmento} de vocês quando vi a alta de buscas por esse tipo de serviço aqui em {cidade}. Preparamos um modelo novo de site com agendamento. Quer ver o que mudou?",
    descricao: "Reativa com contexto sazonal e novidade.",
  },
  {
    categoria: "Reativação de leads antigos",
    titulo: "Reativação com case novo",
    template:
      "Oi, {nome}! Lá atrás a gente conversou sobre o site. Desde então fechamos com {empresa_referencia} (mesmo segmento) e o resultado foi excelente. Já que o assunto surgiu de novo aqui na região, pensei em te mandar o case. Posso?",
    descricao: "Reativa usando resultado recente.",
  },
  {
    categoria: "Reativação de leads antigos",
    titulo: "Reativação honesta",
    template:
      "{nome}, sei que já faz um tempo que não nos falamos. Queria ser honesto: acredito de verdade que o site faria diferença pro {segmento} de vocês, e por isso volto a te procurar. Se não for o momento, tudo bem — me avisa que eu encerro por aqui. Se quiser, te mostro o modelo em 1 minuto.",
    descricao: "Reativação transparente que respeita a decisão.",
  },
];

export const COPY_BIBLIOTECA: CopyTemplate[] = BASE.map((b) => ({
  id: uid("copy"),
  ...b,
}));

export function preencherTemplate(
  template: string,
  ctx: Record<string, string | number | undefined>
): string {
  return template.replace(/\{(\w+)\}/g, (_, chave) => {
    const v = ctx[chave];
    return v !== undefined && v !== "" ? String(v) : chave;
  });
}