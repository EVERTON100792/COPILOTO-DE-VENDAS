import type { AnaliseIA, Empresa, Mensagem, NotaConsultor } from "../types";
import { analisarConversa } from "./analysis";
import { avaliarMensagem } from "./consultant";
import { gerarAbordagensEmpresas } from "./followup";
import { parsearConversa } from "./parser";

interface GatewayConfig {
  openrouterKey: string;
  modeloIA: string;
  usarIAReal: boolean;
}

async function chamarOpenRouter(
  acao: "analisar" | "consultor" | "proxima" | "abordagem",
  mensagens: { autor: string; texto: string }[],
  contexto: { nomeEmpresa: string; segmento: string; cidade: string; notaGoogle: number },
  mensagemConsultor?: string,
  ultimaFala?: string,
  config?: GatewayConfig
): Promise<unknown> {
  if (!config?.usarIAReal) return null;
  try {
    const resposta = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.openrouterKey ? { "x-openrouter-key": config.openrouterKey } : {}),
      },
      body: JSON.stringify({ acao, mensagens, contexto, mensagemConsultor, ultimaFala, modelo: config.modeloIA }),
    });
    if (!resposta.ok) return null;
    return await resposta.json();
  } catch {
    return null;
  }
}

export async function analisarComIA(
  textoConversa: string,
  contexto: { nomeEmpresa: string; segmento: string; cidade: string; notaGoogle: number },
  config?: GatewayConfig
): Promise<{ mensagens: Mensagem[]; analise: AnaliseIA } | null> {
  const mensagens = parsearConversa(textoConversa);
  if (mensagens.length === 0) return null;

  const dadosRemote = await chamarOpenRouter("analisar", mensagens, contexto, undefined, undefined, config);

  if (dadosRemote) {
    try {
      const r = dadosRemote as Partial<AnaliseIA> & {
        oQueQuisDizer?: string;
        verdadeiraObjecao?: string;
        tecnica?: string;
        erroEvitar?: string;
        gatilhos?: string[];
        proximoPasso?: string;
        respostas?: Record<string, string>;
        sugestoes?: string[];
        chanceFechamento?: number;
        objecoes?: string[];
      };
      const local = analisarConversa(mensagens, { nomeEmpresa: contexto.nomeEmpresa, segmento: contexto.segmento });
      const analise: AnaliseIA = {
        ...local,
        interesse: r.interesse ?? local.interesse,
        objecoesDetectadas: r.objecoes ?? r.objecoesDetectadas ?? local.objecoesDetectadas,
        emocao: r.emocao ?? local.emocao,
        perfilPsicologico: r.perfilPsicologico ?? local.perfilPsicologico,
        perfilComprador: r.perfilComprador ?? local.perfilComprador,
        nivelConfianca: r.nivelConfianca ?? local.nivelConfianca,
        nivelUrgencia: r.nivelUrgencia ?? local.nivelUrgencia,
        poderDecisao: r.poderDecisao ?? local.poderDecisao,
        probabilidadeFechamento: r.probabilidadeFechamento ?? local.probabilidadeFechamento,
        classificacao: r.classificacao ?? local.classificacao,
        estrategia: {
          ...local.estrategia,
          oQueQuisDizer: r.oQueQuisDizer ?? local.estrategia.oQueQuisDizer,
          verdadeiraObjecao: r.verdadeiraObjecao ?? local.estrategia.verdadeiraObjecao,
          tecnica: r.tecnica ?? local.estrategia.tecnica,
          erroEvitar: r.erroEvitar ?? local.estrategia.erroEvitar,
          gatilhos: (r.gatilhos as AnaliseIA["estrategia"]["gatilhos"]) ?? local.estrategia.gatilhos,
          proximoPasso: r.proximoPasso ?? local.estrategia.proximoPasso,
          chanceFechamento: r.chanceFechamento ?? local.estrategia.chanceFechamento,
          respostas: r.respostas && Object.keys(r.respostas).length
            ? Object.entries(r.respostas ?? {}).map(([tipo, texto]) => ({
                tipo: tipo as AnaliseIA["estrategia"]["respostas"][number]["tipo"],
                texto: String(texto),
                tom: "",
              }))
            : local.estrategia.respostas,
          sugestoes: (r.sugestoes as AnaliseIA["estrategia"]["sugestoes"]) ?? local.estrategia.sugestoes,
        },
      };
      return { mensagens, analise };
    } catch {
      // cai para o motor local
    }
  }

  return {
    mensagens,
    analise: analisarConversa(mensagens, {
      nomeEmpresa: contexto.nomeEmpresa,
      segmento: contexto.segmento,
    }),
  };
}

export async function consultarEstrategico(
  mensagem: string,
  contexto: { nomeEmpresa: string; segmento: string },
  config?: GatewayConfig
): Promise<NotaConsultor> {
  const dadosRemote = await chamarOpenRouter(
    "consultor",
    [],
    { ...contexto, cidade: "", notaGoogle: 0 },
    mensagem,
    undefined,
    config
  );

  const local = avaliarMensagem({ mensagem, nomeEmpresa: contexto.nomeEmpresa, segmento: contexto.segmento, contexto: "" });

  if (dadosRemote) {
    try {
      const r = dadosRemote as Partial<NotaConsultor> & { avaliacoes?: string[] };
      return {
        ...local,
        nota: r.nota ?? local.nota,
        avalia: r.avaliacoes ?? r.avalia ?? local.avalia,
        confianca: r.confianca ?? local.confianca,
        muitoLonga: r.muitoLonga ?? local.muitoLonga,
        muitoCurta: r.muitoCurta ?? local.muitoCurta,
        riscoPerder: r.riscoPerder ?? local.riscoPerder,
        comoMelhorar: r.comoMelhorar ?? local.comoMelhorar,
        versaoForte: r.versaoForte ?? local.versaoForte,
        versaoElegante: r.versaoElegante ?? local.versaoElegante,
        versaoHumana: r.versaoHumana ?? local.versaoHumana,
      };
    } catch {
      return local;
    }
  }

  return local;
}

export interface ProximaMensagem {
  mensagem: string;
  tecnica: string;
  explicacao: string;
}

function contextoParaGateway(
  empresa: Pick<Empresa, "nome" | "categoria" | "cidade" | "notaGoogle">
): { nomeEmpresa: string; segmento: string; cidade: string; notaGoogle: number } {
  return {
    nomeEmpresa: empresa.nome,
    segmento: empresa.categoria,
    cidade: empresa.cidade,
    notaGoogle: empresa.notaGoogle,
  };
}

export async function gerarAbordagemInicial(
  empresa: Pick<Empresa, "nome" | "categoria" | "cidade" | "notaGoogle">,
  config?: GatewayConfig
): Promise<string> {
  const dadosRemote = await chamarOpenRouter(
    "abordagem",
    [],
    contextoParaGateway(empresa),
    undefined,
    undefined,
    config
  );

  if (dadosRemote) {
    try {
      const r = dadosRemote as { mensagem?: string };
      if (r.mensagem && r.mensagem.trim()) return r.mensagem.trim();
    } catch {
      // cai para o fallback local
    }
  }

  const local = gerarAbordagensEmpresas([empresa as Empresa], 1);
  return local[0]?.mensagem ?? "";
}

export async function gerarProximaMensagem(
  ultimaFalaCliente: string,
  historico: Mensagem[],
  empresa: Pick<Empresa, "nome" | "categoria" | "cidade" | "notaGoogle">,
  config?: GatewayConfig
): Promise<ProximaMensagem> {
  const mensagens: { autor: string; texto: string }[] = [
    ...historico.map((m) => ({ autor: m.autor, texto: m.texto })),
    { autor: "cliente", texto: ultimaFalaCliente },
  ];

  const dadosRemote = await chamarOpenRouter(
    "proxima",
    mensagens,
    contextoParaGateway(empresa),
    undefined,
    ultimaFalaCliente,
    config
  );

  if (dadosRemote) {
    try {
      const r = dadosRemote as Partial<ProximaMensagem>;
      if (r.mensagem && r.mensagem.trim()) {
        return {
          mensagem: r.mensagem.trim(),
          tecnica: r.tecnica?.trim() || "",
          explicacao: r.explicacao?.trim() || "",
        };
      }
    } catch {
      // cai para o motor local
    }
  }

  // Fallback local: analisa a conversa com a última fala e usa a melhor resposta
  const msgs = mensagens.map((m) => ({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    autor: m.autor as Mensagem["autor"],
    texto: m.texto,
    data: new Date().toISOString().slice(0, 10),
    hora: new Date().toTimeString().slice(0, 5),
  }));
  const analise = analisarConversa(msgs, {
    nomeEmpresa: empresa.nome,
    segmento: empresa.categoria,
  });
  const resposta =
    analise.estrategia.respostas.find((r) => r.tipo === "Executiva") ??
    analise.estrategia.respostas.find((r) => r.tipo === "Consultiva") ??
    analise.estrategia.respostas[0];

  return {
    mensagem: resposta?.texto ?? "",
    tecnica: analise.estrategia.tecnica,
    explicacao: analise.estrategia.proximoPasso,
  };
}