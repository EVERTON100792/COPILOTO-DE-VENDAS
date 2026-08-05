import type { NotaConsultor } from "../types";

interface InputConsultor {
  mensagem: string;
  nomeEmpresa: string;
  segmento: string;
  contexto: string; // resumo da conversa
}

function contarPalavras(texto: string): number {
  return texto.trim() ? texto.trim().split(/\s+/).length : 0;
}

export function avaliarMensagem(input: InputConsultor): NotaConsultor {
  const { mensagem, nomeEmpresa } = input;
  const palavras = contarPalavras(mensagem);
  const min = mensagem.toLowerCase();

  // Critérios de qualidade
  let nota = 60;

  const temNome = min.includes(nomeEmpresa.toLowerCase().split(" ")[0]);
  const temPergunta = /\?/.test(mensagem);
  const temValor = /resultado|retorno|clientes|valor|gera|converte|ganha|aument|econom|redes|google|site|fechar|investiment/.test(min);
  const temEvidencia = /número|resultado|caso|exemplo|case|dados|80|90|10|20|30|40|50|000|%/.test(min);
  const temCta = /posso|quer que|me conta|topa|combina|vamos|fica|me manda|me chama|pode me|me avisa|aceita/.test(min);
  const temPressao = /urgente|hoje|só|agora|última|sexta|limitado|restam/.test(min);

  if (temNome) nota += 12;
  if (temPergunta) nota += 8;
  if (temValor) nota += 12;
  if (temEvidencia) nota += 10;
  if (temCta) nota += 10;

  if (palavras > 70) nota -= 18;
  if (palavras > 45) nota -= 8;
  if (palavras < 6) nota -= 12;

  if (!temPergunta && !temCta) nota -= 8;
  if (/não quero incomodar|só passando|só lembrando/i.test(min) && !temValor) nota -= 8;
  if (temPressao && !temCta) nota -= 6;
  if (/kk|kkk|hehe|manda v/.test(min) && palavras > 30) nota -= 4;

  nota = Math.max(15, Math.min(99, nota));

  const muitoLonga = palavras > 70;
  const muitoCurta = palavras < 6;

  // Avaliações qualitativas
  const avalia = gerarAvaliacoes({
    nota,
    temNome,
    temPergunta,
    temValor,
    temEvidencia,
    temCta,
    muitoLonga,
    muitoCurta,
    temPressao,
  });

  // Riscos
  const riscoPerder = nota < 55 || (muitoLonga && !temCta) || (/já fiz|não preciso/i.test(min) && palavras > 40);

  return {
    nota,
    avalia,
    confianca: nota >= 70,
    muitoLonga,
    muitoCurta,
    riscoPerder,
    comoMelhorar: comoMelhorar({ nota, temNome, temValor, temEvidencia, temCta, temPergunta, muitoLonga, muitoCurta }),
    versaoForte: gerarVersaoForte(input),
    versaoElegante: gerarVersaoElegante(input),
    versaoHumana: gerarVersaoHumana(input),
  };
}

function gerarAvaliacoes(opts: {
  nota: number;
  temNome: boolean;
  temPergunta: boolean;
  temValor: boolean;
  temEvidencia: boolean;
  temCta: boolean;
  muitoLonga: boolean;
  muitoCurta: boolean;
  temPressao: boolean;
}): string[] {
  const a: string[] = [];
  const { nota, temNome, temValor, temEvidencia, temCta, muitoLonga, muitoCurta, temPressao } = opts;

  a.push(
    nota >= 80
      ? "Mensagem forte: comunica valor, conduz e pede ação."
      : nota >= 60
      ? "Mensagem razoavelmente boa, mas pode ganhar mais força."
      : "Mensagem fraca: precisa de valor concreto e de condução."
  );
  if (temNome) a.push("Personalização correta (usa o nome da empresa).");
  else a.push("Não usa o nome da empresa — deixe a mensagem mais pessoal.");
  if (temValor) a.push("Comunica valor e benefício.");
  else a.push("Fala mais do tema do que do cliente — inverta o foco para o que ele ganha.");
  if (temEvidencia) a.push("Inclui evidência (número/caso), o que gera confiança.");
  if (temCta) a.push("Tem chamada para ação clara.");
  else a.push("Sem chamada para ação — o cliente fica sem saber o que fazer.");
  if (muitoLonga) a.push("Texto longo demais — resuma para não perder o interesse.");
  if (muitoCurta) a.push("Muito curta — não dá contexto nem valor para quem recebe.");
  if (temPressao && !opts.temCta) a.push("Pressão sem caminho claro pode soar agressiva.");
  return a.slice(0, 5);
}

function comoMelhorar(opts: {
  nota: number;
  temNome: boolean;
  temValor: boolean;
  temEvidencia: boolean;
  temCta: boolean;
  temPergunta: boolean;
  muitoLonga: boolean;
  muitoCurta: boolean;
}): string {
  const partes: string[] = [];
  const { nota, muitoLonga, muitoCurta, temValor, temEvidencia, temCta, temPergunta } = opts;

  if (muitoLonga) partes.push("Reduza para no máximo 30 palavras — corte o que for teoria.");
  if (muitoCurta) partes.push("Acrescente uma linha de valor e um próximo passo concreto.");
  if (!temValor) partes.push("Abra falando do que o cliente ganha (resultado, tempo, dinheiro).");
  if (!temEvidencia) partes.push("Adicione um número ou um caso real para provar o que diz.");
  if (!temCta) partes.push("Feche com uma pergunta ou convite claro (ver o site, marcar ligação).");
  if (!temPergunta) partes.push("Transforme o final em pergunta para gerar resposta.");

  if (partes.length === 0)
    return "Mensagem já bem estruturada. Para elevar ainda mais: personalize com 1 detalhe específico do negócio do cliente e use uma prova (número/case).";
  if (nota < 50) partes.push("Reescreva a mensagem com base na versão mais forte sugerida.");
  return partes.slice(0, 3).join(" ");
}

function gerarVersaoForte(input: InputConsultor): string {
  const { nomeEmpresa, segmento } = input;
  const primeiroNome = nomeEmpresa.split(" ")[0];
  const base = `Olá, ${primeiroNome}! Vi que o ${segmento} de vocês é bem avaliado aqui na região. Se eu te mostrar um modelo de site que já trouxe resultado para um negócio parecido, posso te enviar por aqui?`;
  return base;
}

function gerarVersaoElegante(input: InputConsultor): string {
  const { nomeEmpresa } = input;
  return `Prezado(a) ${nomeEmpresa}, notei sua forte presença na região e pensei em apresentar um formato de site que vem elevando o resultado de negócios semelhantes. Será um prazer compartilhar o exemplo — quando for conveniente, me diga se posso enviar.`;
}

function gerarVersaoHumana(input: InputConsultor): string {
  const { nomeEmpresa, segmento } = input;
  const primeiro = nomeEmpresa.split(" ")[0];
  return `Oi, ${primeiro}! Tudo bem? Trabalho com sites pra ${segmento}s aqui da região e preparei um modelo pro seu negócio — ficou bem bonito, de verdade. Posso te mostrar? Se não for o momento, sem problema nenhum. 😊`;
}