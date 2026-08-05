"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, MessageSquareText, Search, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { CLASSIFICACOES, STATUS_PIPELINE } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Progresso } from "@/components/ui/progress";

export default function NegociacaoIndexPage() {
  const { empresas } = useStore();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<string>("todas");

  const listadas = useMemo(() => {
    return empresas
      .filter((e) => (filtro === "todas" ? true : e.status === filtro))
      .filter((e) => (busca ? e.nome.toLowerCase().includes(busca.toLowerCase()) : true))
      .sort((a, b) => {
        const pA = a.analise?.probabilidadeFechamento ?? 0;
        const pB = b.analise?.probabilidadeFechamento ?? 0;
        return pB - pA;
      });
  }, [empresas, busca, filtro]);

  const comConversa = empresas.filter((e) => e.conversa.length > 0).length;

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Selecione uma empresa para analisar a conversa e obter a estratégia do Diretor Comercial.{" "}
        <span className="font-semibold text-primary">{comConversa}</span> de{" "}
        <span className="font-semibold">{empresas.length}</span> empresas já com conversa analisada.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresa..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="sm:w-56">
          <option value="todas">Todos os status</option>
          {Object.entries(STATUS_PIPELINE).map(([chave, cfg]) => (
            <option key={chave} value={chave}>
              {cfg.label}
            </option>
          ))}
        </Select>
      </div>

      {listadas.length === 0 ? (
        <EmptyState
          icone={<Bot className="h-10 w-10" />}
          titulo="Nenhuma empresa para negociar"
          descricao="Cadastre empresas no módulo de Empresas para começar a gerar estratégias."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {listadas.map((e, i) => {
            const chance = e.analise?.probabilidadeFechamento ?? 0;
            const clasCfg = CLASSIFICACOES[e.classificacao] ?? CLASSIFICACOES.MORNO;
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/negociacao/${e.id}`}>
                  <Card hover className="h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{e.nome}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {e.categoria} · {e.cidade}
                          </p>
                        </div>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <MessageSquareText className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant={chance >= 60 ? "success" : chance >= 30 ? "warning" : "destructive"}>
                          {clasCfg.label}
                        </Badge>
                        {e.conversa.length > 0 && <Badge variant="info">{e.conversa.length} msgs</Badge>}
                      </div>

                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">Chance de fechamento</span>
                          <span className="font-semibold">{chance}%</span>
                        </div>
                        <Progresso
                          valor={chance}
                          cor={chance >= 60 ? "success" : chance >= 30 ? "warning" : "destructive"}
                        />
                      </div>

                      {e.analise && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {e.analise.objecoesDetectadas.slice(0, 2).map((o, j) => (
                            <span key={j} className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] text-destructive">
                              {o}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-end border-t border-border pt-2">
                        <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
                          <Sparkles className="h-3 w-3" /> Abrir negociação
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}