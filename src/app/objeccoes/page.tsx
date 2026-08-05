"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldAlert, Target } from "lucide-react";
import { OBJECOES_BIBLIOTECA, objeccoesPorCategoria } from "@/lib/ai/objections";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progresso } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { contarObjeccoes } from "@/lib/ai/objections";

export default function ObjeccoesPage() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>("todas");
  const [selecionada, setSelecionada] = useState<string | null>(null);

  const categorias = useMemo(() => {
    const mapa = objeccoesPorCategoria();
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]);
  }, []);

  const filtradas = useMemo(() => {
    return OBJECOES_BIBLIOTECA.filter((o) => {
      if (categoria !== "todas" && o.categoria !== categoria) return false;
      if (busca) {
        const alvo = busca.toLowerCase();
        const combinou =
          o.mensagem.toLowerCase().includes(alvo) || o.sinonimos.some((s) => s.toLowerCase().includes(alvo));
        if (!combinou) return false;
      }
      return true;
    });
  }, [busca, categoria]);

  const selecionadaObj = OBJECOES_BIBLIOTECA.find((o) => o.id === selecionada);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-card p-4">
        <ShieldAlert className="h-8 w-8 text-primary" />
        <div>
          <p className="text-sm font-bold">
            Biblioteca com {contarObjeccoes()} objeções de empresários
          </p>
          <p className="text-xs text-muted-foreground">
            Para cada objeção: explicação, motivo psicológico, melhor técnica, exemplo de resposta, erros a evitar e chance de reversão.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar objeção..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="sm:w-56">
          <option value="todas">Todas as categorias</option>
          {categorias.map(([nome, qtd]) => (
            <option key={nome} value={nome}>
              {nome} ({qtd})
            </option>
          ))}
        </Select>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState
          icone={<Target className="h-8 w-8" />}
          titulo="Nenhuma objeção encontrada"
          descricao="Ajuste a busca ou o filtro de categoria."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtradas.map((o, i) => (
            <motion.button
              key={o.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
              onClick={() => setSelecionada(selecionada === o.id ? null : o.id)}
              className="rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-snug">{o.mensagem}</p>
                <Badge variant="violet" className="shrink-0">{o.categoria}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Chance de reversão</span>
                <span className="text-xs font-bold text-primary">{o.chanceReversao}%</span>
              </div>
              <Progresso valor={o.chanceReversao} cor="primary" className="mt-1" />
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selecionadaObj && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelecionada(null)} />
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{selecionadaObj.mensagem}</h2>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variant="violet">{selecionadaObj.categoria}</Badge>
                    <Badge variant="success">Reversão {selecionadaObj.chanceReversao}%</Badge>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelecionada(null)}>
                  Fechar
                </Button>
              </div>

              <div className="space-y-4">
                <section>
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">Explicação</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{selecionadaObj.explicacao}</p>
                </section>
                <section>
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">Motivo psicológico</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{selecionadaObj.motivoPsicologico}</p>
                </section>
                <section>
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">Melhor técnica</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{selecionadaObj.tecnica}</p>
                </section>
                <section>
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">Exemplo de resposta</h3>
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                    <p className="text-sm leading-relaxed">{selecionadaObj.exemploResposta}</p>
                  </div>
                </section>
                <section>
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-destructive">Erros a evitar</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {selecionadaObj.erros.map((erro, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                        {erro}
                      </li>
                    ))}
                  </ul>
                </section>
                {selecionadaObj.sinonimos.length > 0 && (
                  <section>
                    <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">Variações comuns</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selecionadaObj.sinonimos.map((s, i) => (
                        <Badge key={i} variant="default">
                          &quot;{s}&quot;
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}