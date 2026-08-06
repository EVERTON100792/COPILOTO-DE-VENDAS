"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ClipboardPaste,
  Copy,
  FileSearch,
  Handshake,
  Lightbulb,
  MessageSquareText,
  Sparkles,
  Star,
  Wand2,
  XCircle,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import type { Empresa, TipoResposta } from "@/lib/types";
import { CLASSIFICACOES, STATUS_PIPELINE, TIPOS_RESPOSTA } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { GaugeIndicador, Progresso, NotaAnel } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { analisarConversa } from "@/lib/ai/analysis";
import { analisarComIA, consultarEstrategico } from "@/lib/ai/gateway";
import { avaliarMensagem } from "@/lib/ai/consultant";
import { analisarSite } from "@/lib/ai/siteAnalysis";
import { ConversaAssistida } from "@/components/negociacao/conversa-assistida";
import { PipelineAnalise } from "@/components/negociacao/pipeline-analise";
import { toast } from "sonner";

export default function NegociacaoEmpresaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { empresas, atualizarEmpresa, mudarStatus, config } = useStore();
  const empresa = empresas.find((e) => e.id === params.id);

  const [textoPasta, setTextoPasta] = useState("");
  const [abaResposta, setAbaResposta] = useState<TipoResposta>("Consultiva");
  const [consultorMsg, setConsultorMsg] = useState("");
  const [modalPasta, setModalPasta] = useState(false);
  const [modoFechamentoAtivo, setModoFechamentoAtivo] = useState(false);
  const [consultorResultado, setConsultorResultado] = useState<ReturnType<typeof avaliarMensagem> | null>(null);
  const [consultorCarregando, setConsultorCarregando] = useState(false);
  const [consultorKey, setConsultorKey] = useState(0);

  const site = useMemo(
    () => (empresa?.siteAtual ? analisarSite(empresa.siteAtual, empresa.categoria, empresa.descricao) : null),
    [empresa]
  );

  if (!empresa) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/negociacao")}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <EmptyState icone={<XCircle className="h-8 w-8" />} titulo="Empresa não encontrada" />
      </div>
    );
  }

  const analise = empresa.analise;
  const respostaAtual = analise?.estrategia.respostas.find((r) => r.tipo === abaResposta);

  const importarConversa = async () => {
    if (!textoPasta.trim()) {
      toast.error("Cole a conversa primeiro");
      return;
    }

    const resultado = await analisarComIA(
      textoPasta,
      {
        nomeEmpresa: empresa.nome,
        segmento: empresa.categoria,
        cidade: empresa.cidade,
        notaGoogle: empresa.notaGoogle,
      },
      {
        openrouterKey: config.openrouterKey,
        geminiKey: config.geminiKey,
        groqKey: config.groqKey,
        modeloIA: config.modeloIA,
        usarIAReal: config.usarIAReal,
      }
    );

    if (!resultado) {
      toast.error("Não consegui identificar mensagens");
      return;
    }

    const { mensagens, analise: novaAnalise } = resultado;
    const statusSugerido = novoStatusPorAnalise(novaAnalise, empresa);
    atualizarEmpresa(empresa.id, {
      conversa: mensagens,
      analise: novaAnalise,
      ultimoContato: new Date().toISOString().slice(0, 10),
      status: statusSugerido,
      classificacao: novaAnalise.classificacao,
    });
    setTextoPasta("");
    setModalPasta(false);
    setModoFechamentoAtivo(novaAnalise.estrategia.modoFechamento);
    toast.success("Conversa analisada pela IA com sucesso");
  };

  const verificarConsultor = async () => {
    if (!consultorMsg.trim()) {
      toast.error("Digite a mensagem que você planeja enviar");
      return;
    }
    setConsultorCarregando(true);
    setConsultorKey((k) => k + 1);
    try {
      const [nota] = await Promise.all([
        consultarEstrategico(
          consultorMsg,
          { nomeEmpresa: empresa.nome, segmento: empresa.categoria },
          {
            openrouterKey: config.openrouterKey,
            geminiKey: config.geminiKey,
            groqKey: config.groqKey,
            modeloIA: config.modeloIA,
            usarIAReal: config.usarIAReal,
          }
        ),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
      atualizarEmpresa(empresa.id, {
        observacoes: `[Consultor Estratégico ${new Date().toLocaleDateString("pt-BR")}] Nota ${nota.nota}/100 — ${nota.comoMelhorar}`,
      });
      setConsultorResultado(nota);
    } finally {
      setConsultorCarregando(false);
    }
  };

  const copiarResposta = async (texto: string) => {
    await navigator.clipboard.writeText(texto);
    toast.success("Resposta copiada — agora envie você mesmo");
  };

  const fecharVenda = () => {
    if (empresa.status === "FECHADA") return;
    mudarStatus(empresa.id, "FECHADA", {
      valorNegociado: empresa.valorNegociado || empresa.valorPretendido,
    });
    toast.success("Venda registrada como fechada 🎉");
  };

  const clasCfg = CLASSIFICACOES[empresa.classificacao] ?? CLASSIFICACOES.MORNO;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/empresas/${empresa.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
            {empresa.nome.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{empresa.nome}</h1>
            <p className="text-xs text-muted-foreground">
              {empresa.categoria} · {empresa.cidade}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {empresa.novoSiteCriado && (
            <Badge variant="success">
              <CheckCircle2 className="h-3 w-3" /> Site criado
            </Badge>
          )}
          <span className={`rounded-full border px-2 py-0.5 text-[11px] ${STATUS_PIPELINE[empresa.status].color}`}>
            {STATUS_PIPELINE[empresa.status].label}
          </span>
          {modoFechamentoAtivo && (
            <Badge variant="success">
              <Handshake className="h-3 w-3" /> Modo Fechamento
            </Badge>
          )}
          <Button onClick={() => setModalPasta(true)}>
            <ClipboardPaste className="h-4 w-4" /> Importar conversa
          </Button>
        </div>
      </div>

      {/* Conversa assistida — loop guiado */}
      <ConversaAssistida empresa={empresa} />

      {/* Estado vazio — sem conversa */}
      {!analise ? (
        <EmptyState
          icone={<MessageSquareText className="h-10 w-10" />}
          titulo="Nenhuma conversa analisada ainda"
          descricao="Copie a conversa do WhatsApp e cole aqui. A IA separa mensagens do vendedor e do cliente, identifica interesse, objeções e devolve a melhor estratégia de negociação."
          acao={
            <Button size="lg" onClick={() => setModalPasta(true)}>
              <ClipboardPaste className="h-4 w-4" /> Colar conversa agora
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Coluna principal: respostas */}
          <div className="space-y-6 lg:col-span-3">
            {/* Modo fechamento */}
            {modoFechamentoAtivo && (
              <Card className="border-success/40 bg-gradient-to-br from-success/10 to-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-success">
                        <Handshake className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Assistente de Fechamento ativo</p>
                        <p className="text-xs text-muted-foreground">
                          A IA detectou forte interesse. Priorize conduzir o fechamento agora.
                        </p>
                      </div>
                    </div>
                    <Button variant="success" onClick={fecharVenda}>
                      <CheckCircle2 className="h-4 w-4" /> Registrar fechamento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Geração de respostas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Respostas geradas pela IA
                </CardTitle>
                <Badge variant="violet">{analise.estrategia.gatilhos.join(" · ")}</Badge>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {TIPOS_RESPOSTA.map((t) => (
                    <button
                      key={t}
                      onClick={() => setAbaResposta(t)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        abaResposta === t
                          ? "bg-primary text-primary-foreground shadow"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {respostaAtual && (
                    <motion.div
                      key={respostaAtual.tipo}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="rounded-xl border border-border bg-background/50 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold text-primary">Resposta {respostaAtual.tipo}</p>
                        <span className="text-[10px] text-muted-foreground">Tom: {respostaAtual.tom}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{respostaAtual.texto}</p>
                      <div className="mt-3 flex justify-end">
                        <Button size="sm" variant="outline" onClick={() => copiarResposta(respostaAtual.texto)}>
                          <Copy className="h-3.5 w-3.5" /> Copiar e enviar
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Explicação da estratégia */}
                <div className="mt-4 rounded-xl border border-dashed border-border bg-secondary/20 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-primary" />
                    <p className="text-xs font-bold uppercase tracking-wide">Por que essa estratégia</p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{analise.estrategia.explicacao.porque}</p>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Chance de sucesso
                      </p>
                      <Progresso valor={analise.estrategia.explicacao.chanceSucesso} cor="success" />
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-warning">Riscos possíveis</p>
                      <ul className="space-y-0.5 text-[11px] text-muted-foreground">
                        {analise.estrategia.explicacao.riscos.map((r, i) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Sugestões */}
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Sugestões da IA
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analise.estrategia.sugestoes.map((s) => (
                      <Badge key={s} variant="violet">
                        <Lightbulb className="h-3 w-3" /> {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consultor estratégico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" /> Consultor Estratégico
                </CardTitle>
                <Badge variant="info">Diferencial exclusivo</Badge>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-xs text-muted-foreground">
                  Antes de enviar qualquer mensagem ao cliente, cole aqui para receber a nota de qualidade (0–100) e versões mais fortes.
                </p>
                <Textarea
                  placeholder="Cole a mensagem que você vai enviar ao cliente..."
                  value={consultorMsg}
                  onChange={(e) => setConsultorMsg(e.target.value)}
                  className="min-h-[110px]"
                />
                <div className="mt-2 flex justify-end">
                  <Button onClick={verificarConsultor} disabled={!consultorMsg.trim()}>
                    <Wand2 className="h-4 w-4" /> Avaliar mensagem
                  </Button>
                </div>

                {consultorResultado && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-border bg-background/50 p-4 sm:grid-cols-3"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <NotaAnel nota={consultorResultado.nota} tamanho="lg" />
                      <p className="text-xs font-medium text-muted-foreground">
                        Nota de qualidade da mensagem
                      </p>
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {consultorResultado.avalia.map((a, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            {a}
                          </li>
                        ))}
                      </ul>
                      <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-2.5">
                        <p className="text-[11px] font-semibold text-primary">Como elevar a nota</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{consultorResultado.comoMelhorar}</p>
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-3">
                      {[
                        { rotulo: "Versão mais forte", texto: consultorResultado.versaoForte },
                        { rotulo: "Versão mais elegante", texto: consultorResultado.versaoElegante },
                        { rotulo: "Versão mais humana", texto: consultorResultado.versaoHumana },
                      ].map((v) => (
                        <div key={v.rotulo} className="rounded-lg border border-border bg-card p-3">
                          <div className="mb-1 flex items-center justify-between">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-primary">{v.rotulo}</p>
                            <Button size="sm" variant="ghost" onClick={() => copiarResposta(v.texto)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs leading-relaxed text-muted-foreground">{v.texto}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna lateral */}
          <div className="space-y-6 lg:col-span-2">
            {/* Indicador */}
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-6">
                <GaugeIndicador valor={analise.estrategia.chanceFechamento} rotulo="Chance de Fechamento" grande />
                <Badge variant="violet" className="text-xs">
                  <span className={`font-semibold ${clasCfg.cor}`}>{clasCfg.label}</span>
                </Badge>
                <div className="grid w-full grid-cols-2 gap-2">
                  <div className="rounded-lg border border-border bg-background/50 p-2 text-center">
                    <p className="text-[10px] text-muted-foreground">Interesse</p>
                    <p className="text-sm font-bold">{analise.interesse}%</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/50 p-2 text-center">
                    <p className="text-[10px] text-muted-foreground">Urgência</p>
                    <p className="text-sm font-bold">{analise.nivelUrgencia}%</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/50 p-2 text-center">
                    <p className="text-[10px] text-muted-foreground">Confiança</p>
                    <p className="text-sm font-bold">{analise.nivelConfianca}%</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/50 p-2 text-center">
                    <p className="text-[10px] text-muted-foreground">Decisão</p>
                    <p className="text-sm font-bold">{analise.poderDecisao}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Motor de negociação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" /> Motor de Negociação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <p className="font-semibold text-primary">O que o cliente realmente quis dizer</p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{analise.estrategia.oQueQuisDizer}</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">A verdadeira objeção</p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{analise.estrategia.verdadeiraObjecao}</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">Técnica a utilizar</p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{analise.estrategia.tecnica}</p>
                </div>
                <div>
                  <p className="font-semibold text-destructive">Erro a evitar</p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{analise.estrategia.erroEvitar}</p>
                </div>
                <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3">
                  <p className="font-semibold text-primary">Próximo passo</p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{analise.estrategia.proximoPasso}</p>
                </div>
              </CardContent>
            </Card>

            {/* Objeções */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSearch className="h-4 w-4 text-primary" /> Objeções detectadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analise.objecoesDetectadas.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma objeção explícita detectada.</p>
                ) : (
                  <div className="space-y-2">
                    {analise.objecoesDetectadas.map((o, i) => (
                      <Badge key={i} variant="destructive" className="w-full justify-start py-1 text-xs">
                        {o}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Análise do site */}
            {site && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-warning" /> Análise do site atual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Nota geral</span>
                    <span className="text-lg font-bold text-primary">{site.notaGeral}/100</span>
                  </div>
                  <Progresso valor={site.notaGeral} />
                  <div className="space-y-1.5">
                    {site.argumentosComerciais.map((a, i) => (
                      <p key={i} className="rounded-lg border border-border bg-background/50 p-2 text-[11px] leading-relaxed text-muted-foreground">
                        • {a}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Modal importar conversa */}
      <Modal
        aberto={modalPasta}
        onFechar={() => setModalPasta(false)}
        titulo="Importar conversa do WhatsApp"
        descricao="Cole aqui a conversa completa. A IA separa automaticamente as mensagens do vendedor e do cliente."
        largura="max-w-2xl"
      >
        <div className="space-y-3">
          <Textarea
            placeholder={`Cole aqui a conversa inteira...\n\n[09:41] Oi, tudo bem? Vi seu restaurante no Google...\n[09:45] Oi! Pode mandar o site\n[09:50] Segue o link!`}
            value={textoPasta}
            onChange={(e) => setTextoPasta(e.target.value)}
            className="min-h-[300px] font-mono text-xs"
          />
          <div className="rounded-lg border border-dashed border-border bg-secondary/20 p-3">
            <p className="text-[11px] font-semibold text-muted-foreground">Como funciona</p>
            <ul className="mt-1 list-inside space-y-0.5 text-[11px] text-muted-foreground">
              <li>• A IA separa vendedor × cliente, horários e datas</li>
              <li>• Detecta interesse, objeções, emoção e perfil psicológico</li>
              <li>• Classifica o lead (Muito Frio até Pronto p/ Comprar)</li>
              <li>• Gera a estratégia e 8 versões de resposta prontas</li>
              <li>• Cada conversa mantém memória independente</li>
            </ul>
          </div>
          <div className="flex justify-end">
            <Button onClick={importarConversa} disabled={!textoPasta.trim()}>
              <Sparkles className="h-4 w-4" /> Analisar conversa com IA
            </Button>
          </div>
        </div>
      </Modal>

      {/* Pipeline do Consultor Estratégico */}
      <PipelineAnalise
        key={consultorKey}
        aberto={consultorCarregando}
        variante="consultor"
        titulo="Consultor Estratégico"
        subtitulo="Avaliando sua mensagem com a base de consultoria"
      />
    </div>
  );
}

function novoStatusPorAnalise(
  analise: ReturnType<typeof analisarConversa>,
  empresa: Empresa
): Empresa["status"] {
  if (empresa.status === "FECHADA" || empresa.status === "PERDIDA") return empresa.status;
  if (analise.classificacao === "PRONTO_PARA_COMPRAR") return "NEGOCIACAO";
  if (analise.classificacao === "MUITO_QUENTE" || analise.classificacao === "QUENTE")
    return "INTERESSADA";
  if (analise.classificacao === "MORNO") return "AGUARDANDO_RESPOSTA";
  return "AGUARDANDO_ABORDAGEM";
}