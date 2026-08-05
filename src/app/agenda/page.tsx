"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlarmClock,
  CalendarCheck,
  CheckCircle2,
  Flame,
  MessageSquareText,
  Snowflake,
  Undo2,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import type { Empresa } from "@/lib/types";
import { CLASSIFICACOES } from "@/lib/constants";
import { diasAte, relativo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gerarFollowUp } from "@/lib/ai/followup";
import { toast } from "sonner";

type GrupoAgenda = "hoje" | "atrasadas" | "proximos" | "quentes" | "frios" | "paradas";

export default function AgendaPage() {
  const { empresas, atualizarEmpresa } = useStore();

  const agrupadas = useMemo(() => {
    const atrasadas: { empresa: Empresa; msg: string }[] = [];
    const hoje: { empresa: Empresa; msg: string }[] = [];
    const proximos: { empresa: Empresa; msg: string }[] = [];
    const quentes = empresas.filter((e) => (e.analise?.probabilidadeFechamento ?? 0) >= 60 && e.status !== "FECHADA");
    const frios = empresas.filter((e) => (e.analise?.probabilidadeFechamento ?? 0) < 25 && e.status !== "PERDIDA");
    const paradas = empresas.filter((e) => !e.proximoContato && e.status !== "FECHADA" && e.status !== "PERDIDA");

    for (const e of empresas) {
      if (e.status === "FECHADA" || e.status === "PERDIDA") continue;
      if (!e.proximoContato) continue;
      const dias = diasAte(e.proximoContato);
      const followUp = gerarFollowUp(e);
      if (dias < 0) atrasadas.push({ empresa: e, msg: followUp });
      else if (dias === 0) hoje.push({ empresa: e, msg: followUp });
      else if (dias <= 7) proximos.push({ empresa: e, msg: followUp });
    }
    return { atrasadas, hoje, proximos, quentes, frios, paradas };
  }, [empresas]);

  const grupos = [
    { chave: "atrasadas" as GrupoAgenda, rotulo: "Em atraso", dados: agrupadas.atrasadas, cor: "destructive", icone: AlarmClock },
    { chave: "hoje" as GrupoAgenda, rotulo: "Hoje", dados: agrupadas.hoje, cor: "warning", icone: CalendarCheck },
    { chave: "proximos" as GrupoAgenda, rotulo: "Próximos 7 dias", dados: agrupadas.proximos, cor: "info", icone: MessageSquareText },
    { chave: "quentes" as GrupoAgenda, rotulo: "Leads quentes", dados: agrupadas.quentes.map((e) => ({ empresa: e, msg: "" })), cor: "success", icone: Flame },
    { chave: "frios" as GrupoAgenda, rotulo: "Leads frios", dados: agrupadas.frios.map((e) => ({ empresa: e, msg: "" })), cor: "default", icone: Snowflake },
    { chave: "paradas" as GrupoAgenda, rotulo: "Sem agendamento", dados: agrupadas.paradas.map((e) => ({ empresa: e, msg: "" })), cor: "default", icone: Undo2 },
  ];

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        A IA agenda automaticamente o follow-up ideal para cada cliente: hoje, amanhã, 3, 7, 15 ou 30 dias. Nunca deixe um cliente esquecido.
      </p>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {grupos.map((g, gi) => {
          const Itico = g.icone;
          return (
            <motion.div
              key={g.chave}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.05 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Itico className="h-4 w-4 text-primary" />
                    {g.rotulo}
                  </CardTitle>
                  <Badge variant={g.cor as "success"}>{g.dados.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {g.dados.length === 0 ? (
                    <p className="py-3 text-center text-xs text-muted-foreground">Nenhum item.</p>
                  ) : (
                    g.dados.slice(0, 5).map(({ empresa, msg }) => {
                      const clasCfg = CLASSIFICACOES[empresa.classificacao] ?? CLASSIFICACOES.MORNO;
                      return (
                        <div
                          key={empresa.id}
                          className="rounded-lg border border-border bg-background/50 p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Link href={`/empresas/${empresa.id}`} className="text-xs font-semibold hover:underline">
                              {empresa.nome}
                            </Link>
                            <div className="flex items-center gap-2">
                              {empresa.proximoContato && (
                                <span className={empresa.proximoContato < new Date().toISOString().slice(0, 10) ? "text-[10px] font-semibold text-destructive" : "text-[10px] text-muted-foreground"}>
                                  {relativo(empresa.proximoContato)}
                                </span>
                              )}
                              <span className={`text-[10px] font-medium ${clasCfg.cor}`}>{clasCfg.label}</span>
                            </div>
                          </div>
                          {msg && <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{msg}</p>}
                          <div className="mt-2 flex items-center justify-end gap-2">
                            {empresa.whatsapp && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={async () => {
                                  await navigator.clipboard.writeText(msg);
                                  toast.success("Mensagem de follow-up copiada");
                                }}
                              >
                                Copiar msg
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const novo = amanhaStr();
                                atualizarEmpresa(empresa.id, { proximoContato: novo });
                                toast.success("Follow-up reagendado para amanhã");
                              }}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Reagendar
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {g.dados.length > 5 && (
                    <p className="text-center text-[10px] text-muted-foreground">
                      + {g.dados.length - 5} itens
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function amanhaStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}