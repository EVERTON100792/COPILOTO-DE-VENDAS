import type { Empresa } from "../types";
import { adicionarDias, hoje, uid } from "../utils";

export interface AbordagemGerada {
  id: string;
  empresaId: string;
  mensagem: string;
  variavel: string;
  data: string;
}

const FRASES = [
  { ab: "encontrei", pois: "achei o seu negócio muito bem avaliado" },
  { ab: "vi", pois: "reparei na ótima presença de vocês" },
  { ab: "notei", pois: "sua loja se destaca na região" },
  { ab: "conheci", pois: "sua marca tem excelente reputação no Google" },
  { ab: "encontrei", pois: "o perfil de vocês me chamou atenção" },
];

const LIGACOES = [
  (e: Empresa) => `${e.nome.split(" ")[0]}, todo negócio forte como o de vocês merece um site à altura.`,
  (e: Empresa) => `${e.nome.split(" ")[0]}, fiz um site especial pro segmento de vocês.`,
  (e: Empresa) => `Por isso preparei um site com a cara de ${e.nome}.`,
  (e: Empresa) => `E ${e.nome} merece esse destaque na internet.`,
  (e: Empresa) => `Isso me lembrou que ${e.nome} ainda não trabalha com site profissional.`,
];

const FINAIS = [
  `Posso te mostrar o modelo?`,
  `Me manda um ok que eu te envio o link?`,
  `Quer que eu te mande por aqui?`,
  `Pode me dar 1 minutinho pra eu te mostrar?`,
  `Tenho certeza que você vai gostar. Posso enviar?`,
];

export function gerarAbordagensEmpresas(empresas: Empresa[], quantidade: number): AbordagemGerada[] {
  if (quantidade > empresas.length) quantidade = empresas.length;
  const selecionadas = empresas.slice(0, quantidade);
  const resultado: AbordagemGerada[] = [];

  // garante variação entre mensagens usando hash do id
  selecionadas.forEach((empresa, i) => {
    const seed = (empresa.id.length + i * 3) % FRASES.length;
    const seed2 = (empresa.id.charCodeAt(0) + i * 5) % LIGACOES.length;
    const seed3 = (empresa.id.charCodeAt(1) ?? 0 + i * 7) % FINAIS.length;

    const dados = FRASES[seed];
    const ligacao = LIGACOES[seed2];
    const fin = FINAIS[seed3];

    const mensagem = `${dados.ab} o(a) ${empresa.nome} aqui em ${empresa.cidade} e ${dados.pois} (${empresa.notaGoogle.toFixed(1)} no Google). Trabalho com ${empresa.categoria} e criei materiais que valorizam muito essas empresas. ${ligacao(empresa)} ${fin}`;

    resultado.push({
      id: uid("abord"),
      empresaId: empresa.id,
      mensagem,
      variavel: `Personalizada: nome, nota Google, cidade, segmento e histórico do negócio de ${empresa.nome}`,
      data: hoje(),
    });
  });

  return resultado;
}

export function gerarFollowUp(empresa: Empresa): string {
  const primeiro = empresa.nome.split(" ")[0];
  const dias = diasDesdeUltimoContato(empresa.ultimoContato);

  if (dias >= 30)
    return `Olá, ${primeiro}! Passou mais de um mês desde nossa conversa sobre o site. Segui acompanhando o ${empresa.categoria} de vocês e vi que seguem crescendo. Fiz uma atualização no modelo que preparei. Posso te mostrar o que mudou? Se não for o momento, é só me avisar que eu encerro por aqui.`;
  if (dias >= 15)
    return `Oi, ${primeiro}! Tudo bem? Faz um tempo que não falamos. Fechamos recentemente um projeto para um ${empresa.categoria} bem parecido com o de vocês e o resultado foi excelente. Posso te mostrar esse case em 1 minuto?`;
  if (dias >= 7)
    return `${primeiro}, encontrei um resultado interessante de um negócio do mesmo segmento de vocês que começou a usar site profissional. Me chama que eu te mostro o antes e depois por aqui!`;
  if (dias >= 3)
    return `Oi, ${primeiro}! Não quero te pressionar — só deixo registrado que o site modelo pra ${empresa.nome} continua disponível. Se não for o momento, é só me avisar.`;
  return `Olá, ${primeiro}! Passando pra saber se você conseguiu ver o material que enviei sobre o site pro negócio de vocês. Qualquer dúvida, me chama que eu explico rapidinho.`;
}

function diasDesdeUltimoContato(data: string | null): number {
  if (!data) return 99;
  const hojeD = new Date();
  const alvo = new Date(data + "T12:00:00");
  return Math.floor((hojeD.getTime() - alvo.getTime()) / (1000 * 60 * 60 * 24));
}

export function sugerirProximoContato(empresa: Empresa): string {
  const dias = diasDesdeUltimoContato(empresa.ultimoContato);
  if (dias === 0) return adicionarDias(3);
  if (dias >= 1 && dias <= 2) return adicionarDias(7);
  if (empresa.status === "FECHADA")
    return adicionarDias(30);
  return adicionarDias(Math.max(1, 7 - Math.min(6, Math.floor(empresa.analise?.probabilidadeFechamento ?? 30) / 15)));
}