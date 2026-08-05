import type { Autor, Mensagem } from "../types";
import { uid } from "../utils";

export interface BlocoPasta {
  autor: Autor;
  texto: string;
  data: string;
  hora: string;
}

const EXPANDE_ABREV = (t: string) =>
  t
    .replace(/\bok\b/gi, "ok")
    .replace(/\bblz\b/gi, "beleza")
    .replace(/\bpfv\b/gi, "por favor")
    .replace(/\bobg\b/gi, "obrigado");

function detectarAutor(linha: string, contexto: string): Autor {
  const l = linha.toLowerCase();
  const marcadoresCliente = [
    "cliente:",
    "client:",
    "leia:",
    "resposta do cliente",
    "(cliente)",
  ];
  const marcadoresVendedor = [
    "vendedor:",
    "eu:",
    "vou:",
    "(vendedor)",
    "agente:",
    "agencia:",
  ];

  if (marcadoresCliente.some((m) => l.startsWith(m))) return "cliente";
  if (marcadoresVendedor.some((m) => l.startsWith(m))) return "vendedor";

  // Comentários de extração do WhatsApp
  if (
    /\[\d{1,2}:\d{2}/.test(l) ||
    /hoje|ontem|amanhã/.test(l) &&
      l.length < 40 &&
      !l.includes("caramba")
  ) {
    // linhas tipo "hoje, 14:32" 
    if (/^\s*(hoje|ontem|amanhã|segunda|terça|quarta|quinta|sexta|sábado|domingo)/.test(l))
      return contexto === "cliente" ? "cliente" : "vendedor";
  }

  // Heurística por conteúdo — padrões quase sempre do cliente
  if (
    /quanto custa|\bpreço\b|caro demais|muito caro|não tenho interesse|não preciso|sem dinheiro|vou pensar|mas você|e quanto seria|orçamento|\$|reais?|pode ser menos|combinado|fechado|vou ver|meu sobrinho|já tenho site|já tenho instagram|não quero|depois|manda orçamento|me chama depois/i.test(
      l
    )
  )
    return "cliente";
  if (
    /oi, tudo bem|olá|bom dia|boa tarde|boa noite|prazer|agradeço|vou te enviar|segue o site|vê o link|podemos|teria interesse|posso te ligar|marca uma reunião|quando puder me avisa/i.test(
      l
    )
  )
    return "vendedor";

  return contexto === "vendedor" ? "cliente" : "vendedor";
}

function extrairDataHora(linha: string): { data: string; hora: string } | null {
  const m = linha.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4}).*?(\d{1,2}):(\d{2})/);
  if (m) {
    const ano = m[3].length === 2 ? `20${m[3]}` : m[3];
    return { data: `${ano}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`, hora: `${m[4].padStart(2, "0")}:${m[5]}` };
  }
  const h = linha.match(/(\d{1,2}):(\d{2})/);
  if (h) {
    const agora = new Date();
    return {
      data: agora.toISOString().slice(0, 10),
      hora: `${h[1].padStart(2, "0")}:${h[2]}`,
    };
  }
  return null;
}

export function parsearConversa(textoBruto: string): Mensagem[] {
  const linhas = textoBruto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const resultado: Mensagem[] = [];
  let contexto: Autor = "vendedor";
  let blocoAtual: BlocoPasta | null = null;

  for (const linha of linhas) {
    const dh = extrairDataHora(linha);
    if (dh) {
      // Linha como "hoje, 14:32" ou "14:32" — separadora de bloco
      if (blocoAtual) {
        resultado.push({
          id: uid("msg"),
          autor: blocoAtual.autor,
          texto: EXPANDE_ABREV(blocoAtual.texto.trim()),
          data: blocoAtual.data,
          hora: blocoAtual.hora,
        });
        contexto = blocoAtual.autor;
      }
      blocoAtual = { autor: contexto, texto: "", data: dh.data, hora: dh.hora };
      // Linha que só tem horário não é conteúdo
      if (/^\s*(\d{1,2}\/\d{1,2}\/\d{2,4})?\s*(\d{1,2}:\d{2})\s*$/.test(linha)) continue;
      continue;
    }

    const autorDetectado = detectarAutor(linha, contexto);
    if (autorDetectado) contexto = autorDetectado;

    const linhaLimpa = linha
      .replace(/^(cliente|vendedor|client|eu|agente|agencia)\s*:/i, "")
      .replace(/^\[[^\]]+\]\s*/, "")
      .replace(/^\*\*[^*]+\*\*\s*-?\s*/, "")
      .trim();

    if (!linhaLimpa) continue;

    if (!blocoAtual) {
      blocoAtual = { autor: contexto, texto: linhaLimpa, data: new Date().toISOString().slice(0, 10), hora: new Date().toTimeString().slice(0, 5) };
      continue;
    }

    if (blocoAtual.autor === contexto) {
      blocoAtual.texto += blocoAtual.texto ? "\n" + linhaLimpa : linhaLimpa;
    } else {
      resultado.push({
        id: uid("msg"),
        autor: blocoAtual.autor,
        texto: EXPANDE_ABREV(blocoAtual.texto.trim()),
        data: blocoAtual.data,
        hora: blocoAtual.hora,
      });
      blocoAtual = { autor: contexto, texto: linhaLimpa, data: blocoAtual.data, hora: blocoAtual.hora };
    }
  }

  if (blocoAtual) {
    resultado.push({
      id: uid("msg"),
      autor: blocoAtual.autor,
      texto: EXPANDE_ABREV(blocoAtual.texto.trim()),
      data: blocoAtual.data,
      hora: blocoAtual.hora,
    });
  }

  return resultado;
}

export function conversaComoTexto(msgs: Mensagem[]): string {
  return msgs
    .map((m) => {
      const rotulo = m.autor === "cliente" ? "[Cliente]" : "[Vendedor]";
      return `${rotulo} ${m.data} ${m.hora}: ${m.texto}`;
    })
    .join("\n");
}