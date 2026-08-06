import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Payload {
  mensagens: { autor: string; texto: string }[];
  contexto: {
    nomeEmpresa: string;
    segmento: string;
    cidade: string;
    notaGoogle: number;
  };
  acao: "analisar" | "consultor" | "proxima" | "abordagem";
  mensagemConsultor?: string;
  ultimaFala?: string;
  nomeVendedor?: string;
  periodoDia?: string;
  modelo?: string;
}

const PROMPT_BASE = `Você é o Sales Negotiator AI, um Diretor Comercial especializado em agências digitais e vendas consultivas de sites.
Trabalha ao lado do vendedor — nunca responde clientes diretamente.
Analise a conversa (mensagens do cliente e do vendedor) e responda SEMPRE em português brasileiro, apenas com JSON válido, no formato:

{
  "interesse": 0-100,
  "objecoes": ["lista das objeções detectadas"],
  "emocao": "emoção predominante",
  "perfilPsicologico": "perfil do cliente",
  "perfilComprador": "perfil de compra",
  "nivelConfianca": 0-100,
  "nivelUrgencia": 0-100,
  "poderDecisao": 0-100,
  "probabilidadeFechamento": 0-100,
  "classificacao": "MUITO_FRIO|FRIO|MORNO|QUENTE|MUITO_QUENTE|PRONTO_PARA_COMPRAR",
  "oQueQuisDizer": "explicação do que o cliente realmente quis dizer",
  "verdadeiraObjecao": "a verdadeira objeção por trás das palavras",
  "tecnica": "melhor técnica de negociação",
  "erroEvitar": "erro que deve ser evitado",
  "gatilhos": ["gatilhos mentais sugeridos"],
  "proximoPasso": "próximo passo concreto",
  "respostas": {
    "Consultiva": "mensagem consultiva pronta",
    "Executiva": "mensagem executiva pronta",
    "Premium": "mensagem premium pronta",
    "Curta": "mensagem curta pronta",
    "Persuasiva": "mensagem persuasiva pronta",
    "Educativa": "mensagem educativa pronta",
    "Humanizada": "mensagem humanizada pronta",
    "Técnica": "mensagem técnica pronta"
  },
  "sugestoes": ["sugestões de ação"],
  "chanceFechamento": 0-100
}`;

const PROMPT_CONSULTOR = `Você é o Consultor Estratégico do Sales Negotiator AI.`;

const PROMPT_PROXIMA = `Você é o Sales Negotiator AI, um Diretor Comercial especializado em agências digitais e vendas consultivas de sites.
Trabalha ao lado do vendedor — nunca responde clientes diretamente.
O vendedor está negociando com o dono de uma empresa e colou a ÚLTIMA fala do cliente.
Escreva a PRÓXIMA e ÚNICA mensagem que o vendedor deve enviar agora, sempre com o objetivo de avançar a venda do site.
Responda em português brasileiro, apenas com JSON válido, no formato:

{
  "mensagem": "mensagem pronta para o vendedor copiar e enviar",
  "tecnica": "técnica de negociação utilizada",
  "explicacao": "por que essa mensagem agora (em poucas palavras)"
}`;

const PROMPT_ABORDAGEM = `Você é o Sales Negotiator AI, um Diretor Comercial especializado em agências digitais e vendas consultivas de sites.
O vendedor acabou de cadastrar uma empresa e vai abrir a conversa no WhatsApp.
Escreva a mensagem de ABORDAGEM INICIAL perfeita seguindo estas orientações:
- Use exatamente a saudação do período do dia informada (ex: "Bom dia!" ou "Boa tarde!" ou "Boa noite!") no começo.
- Apresente o vendedor pelo nome informado, dizendo que ele trabalha com sites para o segmento da empresa.
- Muitas vezes quem responde no WhatsApp é um funcionário e não o dono. Por isso, pergunte de forma natural e educada se ali é possível falar com o proprietário/dono do negócio.
- Mencione que você (o vendedor) preparou um site demonstrativo (modelo) feito para o negócio deles e pergunte se teriam interesse em dar uma olhada.
- Tom natural de brasileiro, curta (no máximo 3 frases), personalizada com os dados da empresa, que desperte curiosidade.
- Nunca repita a mesma estrutura em mensagens diferentes: varie a ordem das frases e o vocabulário.
Responda em português brasileiro, apenas com JSON válido, no formato:

{
  "mensagem": "abordagem inicial pronta para copiar e enviar"
}`;

function extrairJson(texto: string): unknown {
  const limpo = texto.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(limpo);
  } catch {
    // resposta truncada: valida o maior bloco { ... } balanceado
    const ini = limpo.indexOf("{");
    if (ini === -1) throw new Error("JSON não encontrado na resposta da IA");
    let profundidade = 0;
    let dentroString = false;
    let escape = false;
    let fim = -1;
    for (let i = ini; i < limpo.length; i++) {
      const ch = limpo[i];
      if (dentroString) {
        if (escape) escape = false;
        else if (ch === "\\") escape = true;
        else if (ch === '"') dentroString = false;
        continue;
      }
      if (ch === '"') {
        dentroString = true;
        continue;
      }
      if (ch === "{") profundidade++;
      else if (ch === "}") {
        profundidade--;
        if (profundidade === 0) {
          fim = i + 1;
          break;
        }
      }
    }
    const bloco = fim === -1 ? limpo.slice(ini) : limpo.slice(ini, fim);
    // coleta os pares chave:valor completos encontrados no bloco truncado
    const parcial: Record<string, unknown> = {};
    const campos = [
      "interesse",
      "probabilidadeFechamento",
      "chanceFechamento",
      "nivelConfianca",
      "nivelUrgencia",
      "poderDecisao",
      "oQueQuisDizer",
      "verdadeiraObjecao",
      "tecnica",
      "erroEvitar",
      "proximoPasso",
      "emocao",
      "perfilPsicologico",
      "perfilComprador",
      "classificacao",
      "mensagem",
      "tecnica",
      "explicacao",
    ];
    for (const c of campos) {
      const m = new RegExp(`"${c}"\\s*:\\s*("(?:[^"\\\\]|\\\\.)*"|[0-9]+)`, "i").exec(bloco);
      if (m) parcial[c] = JSON.parse(m[1]);
    }
    const objM = /"objecoes"\s*:\s*\[[^\]]*\]/i.exec(bloco);
    if (objM) {
      try {
        parcial.objecoes = JSON.parse(objM[0].replace(/^"objecoes"\s*:\s*/, ""));
      } catch {
        parcial.objecoes = ["(objeção detectada pela I.A.)"];
      }
    }
    const gM = /"gatilhos"\s*:\s*\[[^\]]*\]/i.exec(bloco);
    if (gM) {
      try {
        parcial.gatilhos = JSON.parse(gM[0].replace(/^"gatilhos"\s*:\s*/, ""));
      } catch {
        /* ignora */
      }
    }
    const respM = /"respostas"\s*:\s*\{[^]*?\}/i.exec(bloco);
    if (respM) {
      const respostas: Record<string, string> = {};
      const inner = respM[0].replace(/^"respostas"\s*:\s*/, "").replace(/\}\s*$/, "");
      for (const m of inner.matchAll(/"([^"]+)"\s*:\s*"(?:[^"\\]|\\.)*"/g)) {
        try {
          respostas[m[1]] = JSON.parse(m[2]);
        } catch {
          /* ignora */
        }
      }
      if (Object.keys(respostas).length) parcial.respostas = respostas;
    }
    if (Object.keys(parcial).length) return parcial;
    throw new Error("JSON parcial não recuperável");
  }
}

export async function POST(req: Request) {
  const chave = req.headers.get("x-openrouter-key") || process.env.OPENROUTER_API_KEY || "";
  const chaveGemini = req.headers.get("x-gemini-key") || process.env.GEMINI_API_KEY || "";
  const chaveGroq = req.headers.get("x-groq-key") || process.env.GROQ_API_KEY || "";
  if (!chave && !chaveGemini && !chaveGroq) {
    return NextResponse.json({ erro: "Nenhuma chave de IA configurada" }, { status: 400 });
  }

  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const prompt =
    payload.acao === "consultor"
      ? `${PROMPT_CONSULTOR}
O vendedor vai enviar uma mensagem ao cliente e quer saber se ela é boa.
Responda em português brasileiro, apenas com JSON válido, no formato:

{
  "nota": 0-100,
  "avaliacoes": ["pontos fortes e fracos"],
  "confianca": true|false,
  "muitoLonga": true|false,
  "muitoCurta": true|false,
  "riscoPerder": true|false,
  "comoMelhorar": "sugestão de melhoria",
  "versaoForte": "versão mais forte da mensagem",
  "versaoElegante": "versão mais elegante",
  "versaoHumana": "versão mais humana"
}`
      : payload.acao === "proxima"
        ? PROMPT_PROXIMA
        : payload.acao === "abordagem"
          ? PROMPT_ABORDAGEM
          : PROMPT_BASE;

  const conversaTexto = payload.mensagens
    .map((m) => `${m.autor === "cliente" ? "[Cliente]" : "[Vendedor]"}: ${m.texto}`)
    .join("\n");

  const instrucao =
    payload.acao === "consultor"
      ? `Mensagem do vendedor para avaliar: "${payload.mensagemConsultor}"`
      : payload.acao === "proxima"
        ? `Última fala do cliente: "${payload.ultimaFala}"\n\nHistórico da conversa:\n${conversaTexto}\n\nEmpresa: ${payload.contexto.nomeEmpresa} (${payload.contexto.segmento}, ${payload.contexto.cidade}, nota Google ${payload.contexto.notaGoogle})`
        : payload.acao === "abordagem"
          ? `Nome do vendedor: ${payload.nomeVendedor ?? "o vendedor"}\nPeríodo do dia: ${payload.periodoDia ?? "Bom dia"}\nEmpresa: ${payload.contexto.nomeEmpresa}\nSegmento: ${payload.contexto.segmento}\nCidade: ${payload.contexto.cidade}\nNota Google: ${payload.contexto.notaGoogle}`
          : `Conversa:\n${conversaTexto}\n\nEmpresa: ${payload.contexto.nomeEmpresa} (${payload.contexto.segmento}, ${payload.contexto.cidade}, nota Google ${payload.contexto.notaGoogle})`;

  const MODELOS_FALLBACK = [
    "openrouter/free",
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-nano-9b-v2:free",
  ];
  let ultimoErro = "";

  async function chamarOpenAICompat(opts: {
    url: string;
    chaveProvedor: string;
    modelo: string;
    usarJson: boolean;
    extraAdicionais?: Record<string, string>;
  }): Promise<{ ok: true; json: unknown } | { ok: false; status: number }> {
    const resposta = await fetch(opts.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.chaveProvedor}`,
        "Content-Type": "application/json",
        ...(opts.extraAdicionais ?? {}),
      },
      body: JSON.stringify({
        model: opts.modelo,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: instrucao },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        ...(opts.usarJson ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!resposta.ok) return { ok: false, status: resposta.status };
    const dados = (await resposta.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const conteudo = dados.choices?.[0]?.message?.content ?? "";
    return { ok: true, json: extrairJson(conteudo) };
  }

  // 1) OpenRouter (modelo escolhido pelo usuário + reservas gratuitas)
  if (chave) {
    const modelos = [payload.modelo ?? "openai/gpt-4o-mini", ...MODELOS_FALLBACK];
    for (const modelo of modelos) {
      const r = await chamarOpenAICompat({
        url: "https://openrouter.ai/api/v1/chat/completions",
        chaveProvedor: chave,
        modelo,
        usarJson: modelo === modelos[0],
        extraAdicionais: {
          "HTTP-Referer": "https://sales-negotiator.app",
          "X-Title": "Sales Negotiator AI",
        },
      });
      if (r.ok) return NextResponse.json(r.json);
      ultimoErro = `OpenRouter (${modelo}): HTTP ${r.status}`;
    }
  }

  // 2) Google Gemini (grátis, chave sem validade — AI Studio)
  if (chaveGemini) {
    const r = await chamarOpenAICompat({
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      chaveProvedor: chaveGemini,
      modelo: "gemini-2.0-flash",
      usarJson: false,
    });
    if (r.ok) return NextResponse.json(r.json);
    ultimoErro = `Gemini: HTTP ${r.status}`;
  }

  // 3) Groq (grátis, cota diária alta — console.groq.com)
  if (chaveGroq) {
    const r = await chamarOpenAICompat({
      url: "https://api.groq.com/openai/v1/chat/completions",
      chaveProvedor: chaveGroq,
      modelo: "llama-3.3-70b-versatile",
      usarJson: true,
    });
    if (r.ok) return NextResponse.json(r.json);
    ultimoErro = `Groq: HTTP ${r.status}`;
  }

  return NextResponse.json(
    { erro: ultimoErro || "Nenhuma IA configurada. Adicione uma chave em Configurações ou use o motor local." },
    { status: 502 }
  );
}