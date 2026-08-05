"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, CheckCircle2, RotateCcw, Send, Sparkles, XCircle } from "lucide-react";
import { PERFIS_SIMULADOR, iniciarSimulacao, avancarSimulacao } from "@/lib/ai/simulator";
import type { Simulacao } from "@/lib/ai/simulator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { avaliarMensagem } from "@/lib/ai/consultant";

export default function SimuladorPage() {
  const [sim, setSim] = useState<Simulacao | null>(null);
  const [mensagem, setMensagem] = useState("");

  const iniciar = (id: string) => {
    setSim(iniciarSimulacao(id));
    setMensagem("");
  };

  const enviar = () => {
    if (!sim || !mensagem.trim()) return;
    const nota = avaliarMensagem({
      mensagem,
      nomeEmpresa: sim.perfil.nome,
      segmento: sim.perfil.setor,
      contexto: "simulador",
    });
    setSim(avancarSimulacao(sim, mensagem.trim()));
    setMensagem("");
    if (nota.nota < 60) {
      toast.info(`Mensagem com nota ${nota.nota}. Sugestão: ${nota.comoMelhorar}`);
    }
  };

  const reiniciar = () => {
    setSim(null);
    setMensagem("");
  };

  if (!sim) {
    return (
      <div className="space-y-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Simulador de Negociação</h2>
                <p className="text-sm text-muted-foreground">
                  Modo treinamento. Escolha um perfil de empresário e treine suas técnicas de venda. Cada perfil tem personalidade e objeções próprias.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PERFIS_SIMULADOR.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <button
                onClick={() => iniciar(p.id)}
                className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {p.setor.slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{p.setor}</p>
                    <p className="text-[11px] text-muted-foreground">{p.nome}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{p.personalidade}</p>
                <span className="mt-3 flex items-center gap-1 text-xs font-medium text-primary">
                  <Sparkles className="h-3 w-3" /> Iniciar treinamento
                </span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
            {sim.perfil.setor.slice(0, 3).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {sim.perfil.nome} · {sim.perfil.setor}
            </h2>
            <p className="text-xs text-muted-foreground">
              Turno {sim.turno - 1} de {sim.totalTurnos} · {sim.perfil.personalidade}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sim.vendaFechada && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Venda fechada!
            </span>
          )}
          <Button variant="outline" size="sm" onClick={reiniciar}>
            <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex min-h-[420px] flex-col p-4">
          <div className="flex-1 space-y-3 overflow-y-auto">
            {sim.historico.map((m, i) => (
              <div key={i} className={cn("flex", m.autor === "cliente" ? "justify-start" : "justify-end")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                    m.autor === "cliente"
                      ? "rounded-bl-sm border border-border bg-card"
                      : "rounded-br-sm bg-primary text-primary-foreground"
                  )}
                >
                  {m.texto}
                </div>
              </div>
            ))}
            {sim.terminada && (
              <div
                className={cn(
                  "rounded-2xl border p-4 text-center text-sm",
                  sim.vendaFechada
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-600"
                )}
              >
                {sim.vendaFechada
                  ? "O treino terminou: você fechou a venda com este perfil. Procure repetir a boa condução em clientes reais."
                  : "O treino terminou, mas a venda não foi fechada. Tente novamente usando as respostas do Consultor Estratégico."}
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2 border-t border-border pt-3">
            <Input
              placeholder="Digite sua mensagem para o cliente..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
              disabled={sim.terminada}
            />
            <Button onClick={enviar} disabled={sim.terminada || !mensagem.trim()}>
              <Send className="h-4 w-4" /> Enviar
            </Button>
          </div>
        </CardContent>
      </Card>

      {sim.vendaFechada && (
        <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 p-3 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4" /> Você demonstrou habilidade. Use a mesma estrutura em negociações reais.
        </div>
      )}
      {sim.terminada && !sim.vendaFechada && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <XCircle className="h-4 w-4" /> Dica: abra a negociação de uma empresa real e use o Consultor Estratégico para melhorar suas mensagens antes de enviar.
        </div>
      )}
    </div>
  );
}