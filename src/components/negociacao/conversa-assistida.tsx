"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  CheckCircle2,
  Copy,
  Handshake,
  Loader2,
  MessageSquareText,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import type { AnaliseIA, Empresa, Mensagem, PipelineStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { conversaComoTexto } from "@/lib/ai/parser";
import { analisarComIA, gerarAbordagemInicial, gerarProximaMensagem, type ProximaMensagem } from "@/lib/ai/gateway";
import { PipelineAnalise } from "@/components/negociacao/pipeline-analise";
import { adicionarDias, hoje, uid } from "@/lib/utils";
import { toast } from "sonner";

function novoStatusPorAnalise(analise: AnaliseIA, empresa: Empresa): PipelineStatus {
  if (empresa.status === "FECHADA" || empresa.status === "PERDIDA") return empresa.status;
  if (analise.classificacao === "PRONTO_PARA_COMPRAR") return "NEGOCIACAO";
  if (analise.classificacao === "MUITO_QUENTE" || analise.classificacao === "QUENTE") return "INTERESSADA";
  if (analise.classificacao === "MORNO") return "AGUARDANDO_RESPOSTA";
  return "AGUARDANDO_ABORDAGEM";
}

function agora(): Mensagem["hora"] {
  return new Date().toTimeString().slice(0, 5);
}

export function ConversaAssistida({ empresa }: { empresa: Empresa }) {
  const { atualizarEmpresa, mudarStatus, config } = useStore();
  const [abordagem, setAbordagem] = useState<string | null>(null);
  const [gerandoAbordagem, setGerandoAbordagem] = useState(false);
  const [respostaCliente, setRespostaCliente] = useState("");
  const [sugestao, setSugestao] = useState<ProximaMensagem | null>(null);
  const [carregandoSugestao, setCarregandoSugestao] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [pipelineKey, setPipelineKey] = useState(0);
  const configIA = {
    openrouterKey: config.openrouterKey,
    modeloIA: config.modeloIA,
    usarIAReal: config.usarIAReal,
    nomeVendedor: config.nomeVendedor,
  };
  const contexto = {
    nomeEmpresa: empresa.nome,
    segmento: empresa.categoria,
    cidade: empresa.cidade,
    notaGoogle: empresa.notaGoogle,
  };

  const temConversa = empresa.conversa.length > 0;
  const modoFechamento = empresa.analise?.estrategia.modoFechamento ?? false;
  const ultimaFalaCliente = [...empresa.conversa].reverse().find((m) => m.autor === "cliente")?.texto ?? "";

  const gerarAbordagem = async () => {
    setGerandoAbordagem(true);
    try {
      const texto = await gerarAbordagemInicial(empresa, configIA);
      setAbordagem(texto);
    } catch {
      toast.error("Não consegui gerar a abordagem — tente de novo");
    } finally {
      setGerandoAbordagem(false);
    }
  };

  const copiar = async (texto: string, aviso: string) => {
    if (!texto) return;
    await navigator.clipboard.writeText(texto);
    toast.success(aviso);
  };

  const registrarAbordagem = async () => {
    if (!abordagem) return;
    setRegistrando(true);
    const mensagem: Mensagem = { id: uid("msg"), autor: "vendedor", texto: abordagem, data: hoje(), hora: agora() };
    const novaConversa = [...empresa.conversa, mensagem];
    const resultado = await analisarComIA(conversaComoTexto(novaConversa), contexto, configIA);
    atualizarEmpresa(empresa.id, {
      conversa: novaConversa,
      analise: resultado?.analise ?? null,
      status: resultado?.analise ? novoStatusPorAnalise(resultado.analise, empresa) : "AGUARDANDO_RESPOSTA",
      classificacao: resultado?.analise?.classificacao ?? empresa.classificacao,
      ultimoContato: hoje(),
      proximoContato: adicionarDias(2),
    });
    setAbordagem(null);
    setRegistrando(false);
    toast.success("Abordagem registrada como enviada");
  };

  const gerarSugestao = async () => {
    if (!respostaCliente.trim()) {
      toast.error("Cole a resposta do cliente/dono primeiro");
      return;
    }
    setCarregandoSugestao(true);
    setPipelineKey((k) => k + 1);
    try {
      const proxima = await gerarProximaMensagem(respostaCliente.trim(), empresa.conversa, empresa, configIA);
      setSugestao(proxima);
    } catch {
      toast.error("Não consegui gerar a sugestão — tente de novo");
    } finally {
      setCarregandoSugestao(false);
    }
  };
  const registrarTurno = async () => {
    if (!sugestao?.mensagem || !respostaCliente.trim()) return;
    setRegistrando(true);
    const agoraT = agora();
    const hojeT = hoje();
    const msgCliente: Mensagem = { id: uid("msg"), autor: "cliente", texto: respostaCliente.trim(), data: hojeT, hora: agoraT };
    const msgVendedor: Mensagem = { id: uid("msg"), autor: "vendedor", texto: sugestao.mensagem, data: hojeT, hora: agoraT };
    const novaConversa = [...empresa.conversa, msgCliente, msgVendedor];
    const resultado = await analisarComIA(conversaComoTexto(novaConversa), contexto, configIA);
    atualizarEmpresa(empresa.id, {
      conversa: novaConversa,
      analise: resultado?.analise ?? null,
      status: resultado?.analise ? novoStatusPorAnalise(resultado.analise, empresa) : "AGUARDANDO_RESPOSTA",
      classificacao: resultado?.analise?.classificacao ?? empresa.classificacao,
      ultimoContato: hojeT,
      proximoContato: adicionarDias(2),
    });
    setRespostaCliente("");
    setSugestao(null);
    setRegistrando(false);
    toast.success("Resposta registrada — continue o ciclo até fechar a venda");
  };

  const fecharVenda = () => {
    mudarStatus(empresa.id, "FECHADA", {
      valorNegociado: empresa.valorNegociado || empresa.valorPretendido,
    });
    toast.success("Venda registrada como fechada 🎉");
  };

  return (
    <Card className="border-gradient shadow-[0_8px_40px_-12px_rgba(139,92,246,0.45)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-[0_0_14px_-2px_rgba(139,92,246,0.7)]">
            <Bot className="h-4 w-4" />
          </span>
          Conversa Assistida
        </CardTitle>
        <Badge variant="violet">Loop guiado: aborde → cole a resposta → envie o que a IA mandar</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Etapa 1 — Abordagem inicial */}
        {!temConversa ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquareText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">1. Envie a abordagem inicial</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Gere a primeira mensagem, copie e envie para a empresa no WhatsApp. Depois registre que enviou.
                </p>
              </div>
            </div>

            {abordagem ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-primary/40 bg-primary/5 p-4"
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{abordagem}</p>
                <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copiar(abordagem, "Abordagem copiada — envie você mesmo")}
                  >
                    <Copy className="h-3.5 w-3.5" /> Copiar
                  </Button>
                  <Button size="sm" onClick={registrarAbordagem} disabled={registrando}>
                    {registrando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Enviei — registrar
                  </Button>
                </div>
              </motion.div>
            ) : (
              <Button onClick={gerarAbordagem} disabled={gerandoAbordagem} size="lg" className="w-full sm:w-auto">
                {gerandoAbordagem ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Gerar abordagem inicial
              </Button>
            )}
          </div>
        ) : (
          /* Etapa 2 — Loop de conversa */
          <div className="space-y-4">
            {/* Último turno do cliente para contexto */}
            {ultimaFalaCliente && (
              <div className="rounded-xl border border-border bg-secondary/20 p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Última fala do cliente/dono
                </p>
                <p className="whitespace-pre-wrap text-xs leading-relaxed">{ultimaFalaCliente}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold">2. Cole aqui o que o cliente ou dono respondeu</p>
              <Textarea
                placeholder='Ex: "Quanto fica? Achei um pouco caro..." ou "Pode mandar o site pra eu ver"'
                value={respostaCliente}
                onChange={(e) => setRespostaCliente(e.target.value)}
                className="min-h-[90px]"
              />
              <div className="flex justify-end">
                <Button
                  onClick={gerarSugestao}
                  disabled={carregandoSugestao || !respostaCliente.trim()}
                  size="lg"
                  className="group relative"
                >
                  {carregandoSugestao ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analisando com a IA...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                      IA, o que eu mando agora?
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Sugestão da IA */}
            <AnimatePresence mode="wait">
              {sugestao && (
                <motion.div
                  key="sugestao"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl border border-success/40 bg-success/5 p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-success">Manda isso para ele:</p>
                    {sugestao.tecnica && <Badge variant="violet">{sugestao.tecnica}</Badge>}
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{sugestao.mensagem}</p>
                  {sugestao.explicacao && (
                    <p className="mt-2 rounded-lg border border-dashed border-border bg-background/60 p-2 text-[11px] leading-relaxed text-muted-foreground">
                      {sugestao.explicacao}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copiar(sugestao.mensagem, "Resposta copiada — envie você mesmo")}
                    >
                      <Copy className="h-3.5 w-3.5" /> Copiar
                    </Button>
                    <Button size="sm" variant="success" onClick={registrarTurno} disabled={registrando}>
                      {registrando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      Enviei — registrar
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fechamento */}
            {modoFechamento && empresa.status !== "FECHADA" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/50 bg-success/10 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/15 text-success">
                    <Handshake className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Hora de fechar a venda!</p>
                    <p className="text-xs text-muted-foreground">
                      A IA detectou que o cliente está pronto. Registre o fechamento agora.
                    </p>
                  </div>
                </div>
                <Button variant="success" onClick={fecharVenda}>
                  <CheckCircle2 className="h-4 w-4" /> Registrar fechamento
                </Button>
              </motion.div>
            )}

            {empresa.status === "FECHADA" && (
              <div className="flex items-center gap-3 rounded-xl border border-success/50 bg-success/10 p-4">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <p className="text-sm font-semibold">Venda fechada com sucesso 🎉</p>
              </div>
            )}
          </div>
        )}

        {/* Pipeline de análise da IA */}
        <PipelineAnalise
          key={pipelineKey}
          aberto={carregandoSugestao}
          empresa={empresa.nome}
          aoAbortar={() => setCarregandoSugestao(false)}
        />
      </CardContent>
    </Card>
  );
}
