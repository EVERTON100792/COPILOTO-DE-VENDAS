"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Gauge,
  Lightbulb,
  Loader2,
  MessageSquareText,
  ScanSearch,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EtapaPipeline {
  icone: typeof Cpu;
  titulo: string;
  detalhe: string;
  duracao: number; // ms
}

const ETAPAS: EtapaPipeline[] = [
  { icone: MessageSquareText, titulo: "Lendo toda a conversa", detalhe: "Tokens, contexto e histórico do cliente", duracao: 2400 },
  { icone: ScanSearch, titulo: "Mapeando interesse e urgência", detalhe: "Analisando sinais de compra e hesitação", duracao: 2600 },
  { icone: Target, titulo: "Detectando objeções ocultas", detalhe: "Separando a objeção real do que foi dito", duracao: 2600 },
  { icone: BrainCircuit, titulo: "Calculando perfil do decisor", detalhe: "Emoção, poder de decisão e perfil de compra", duracao: 2400 },
  { icone: Lightbulb, titulo: "Escolhendo a técnica ideal", detalhe: "Selecionando a estratégia de maior conversão", duracao: 2200 },
  { icone: Wand2, titulo: "Escrevendo a resposta perfeita", detalhe: "Gerando a mensagem pronta para envio", duracao: 2800 },
];

export function PipelineAnalise({
  aberto,
  empresa,
  aoAbortar,
}: {
  aberto: boolean;
  empresa?: string;
  aoAbortar?: () => void;
}) {
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [detalheRotativo, setDetalheRotativo] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!aberto) return;

    // Cadeia de timeouts que avança a pipeline de etapas.
    const agendar = (idx: number) => {
      const t = setTimeout(() => {
        setEtapaAtual(idx);
        if (idx < ETAPAS.length - 1) agendar(idx + 1);
      }, ETAPAS[idx].duracao);
      timeoutsRef.current.push(t);
    };
    agendar(0);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [aberto]);

  // Gira emoções/detalhes de cada etapa enquanto ela está ativa
  useEffect(() => {
    if (!aberto) return;
    const t = setInterval(() => setDetalheRotativo((v) => v + 1), 900);
    return () => clearInterval(t);
  }, [aberto]);

  const progresso = Math.min(100, Math.round(((etapaAtual + 1) / ETAPAS.length) * 100));

  return (
    <AnimatePresence>
      {aberto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-lg"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative w-full max-w-lg"
          >
            {/* Glow card */}
            <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-violet-500/50 via-fuchsia-500/25 to-sky-500/40 blur-md" />
            <div className="relative max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0a12]/95 p-6 shadow-2xl">
              {/* scanline decorativo */}
              <div className="pointer-events-none absolute inset-x-0 h-1/3 animate-scanline bg-gradient-to-b from-transparent via-violet-500/10 to-transparent" />
              {/* borda aurora superior */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-aurora-pan bg-gradient-to-r from-transparent via-violet-400/80 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px animate-aurora-pan bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />

              {/* Cabeçalho */}
              <div className="mb-5 flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 animate-ring-ping rounded-2xl bg-violet-500/60" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white glow-primary">
                    <Bot className="h-6 w-6" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold tracking-tight">Neurologic IA</p>
                    <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> analisando
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {empresa ? `Agente neural processando ${empresa}` : "Processando contexto comercial"}
                  </p>
                </div>
                {aoAbortar && (
                  <button
                    onClick={aoAbortar}
                    className="ml-auto rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                    title="Cancelar"
                  >
                    <Loader2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Pipeline vertical */}
              <div className="space-y-1">
                {ETAPAS.map((e, i) => {
                  const ativo = i === etapaAtual;
                  const concluida = i < etapaAtual;
                  return (
                    <motion.div
                      key={e.titulo}
                      animate={{
                        opacity: concluida ? 0.55 : ativo ? 1 : 0.38,
                        x: ativo ? 4 : 0,
                      }}
                      transition={{ duration: 0.25 }}
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl border px-3 py-2",
                        ativo
                          ? "border-violet-400/50 bg-gradient-to-r from-violet-500/15 to-transparent shadow-[0_0_24px_-8px_rgba(139,92,246,0.6)]"
                          : concluida
                            ? "border-white/8 bg-white/[0.03]"
                            : "border-white/8 bg-white/[0.02]"
                      )}
                    >
                      {/* indicador */}
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-300",
                          ativo
                            ? "border-transparent bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-[0_0_18px_-2px_rgba(139,92,246,0.8)]"
                            : concluida
                              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                              : "border-white/10 bg-white/5 text-muted-foreground"
                        )}
                      >
                        {concluida ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <e.icone className={cn("h-4 w-4", ativo && "animate-pulse-dot")} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-sm font-semibold",
                            ativo ? "text-white" : concluida ? "text-emerald-300/90" : "text-muted-foreground"
                          )}
                        >
                          {e.titulo}
                          {ativo && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-medium text-violet-300">
                              <Cpu className="h-3 w-3 animate-pulse-dot" /> em análise
                            </span>
                          )}
                          {concluida && <span className="ml-2 text-[10px] font-medium text-emerald-400/80">concluída</span>}
                        </p>
                        {ativo && (
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={detalheRotativo}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.3 }}
                              className="truncate text-[11px] text-muted-foreground"
                            >
                              {e.detalhe}
                            </motion.p>
                          </AnimatePresence>
                        )}
                      </div>

                      {ativo && (
                        <ChevronRight className="h-4 w-4 shrink-0 animate-pulse text-violet-300" />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Barra de progresso */}
              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                    <Gauge className="h-3.5 w-3.5 text-violet-400" /> pipeline de negociação
                  </span>
                  <span className="font-bold tabular-nums text-violet-300">{progresso}%</span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    animate={{ width: `${progresso}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400"
                  >
                    <div className="absolute inset-0 animate-aurora-pan bg-gradient-to-r from-transparent via-white/40 to-transparent bg-[length:60%_100%]" />
                  </motion.div>
                </div>
              </div>

              {/* Rodapé animado */}
              <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
                <p className="truncate">
                  Quanto mais contexto, maior a precisão da resposta que você vai enviar.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}