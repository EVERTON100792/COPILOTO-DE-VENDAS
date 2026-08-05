"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Megaphone, Plus, Target, Trash2, Users } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { STATUS_CAMPANHA, SEGMENTOS_SUGERIDOS } from "@/lib/constants";
import { formatarData } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Progresso } from "@/components/ui/progress";
import { campanhaProgresso } from "@/lib/metrics";
import type { CampanhaStatus } from "@/lib/types";

export default function CampanhasPage() {
  const { campanhas, empresas, adicionarCampanha, removerCampanha } = useStore();
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [form, setForm] = useState({
    nome: "",
    cidade: "Londrina",
    segmento: "Restaurantes",
    objetivo: "",
    status: "ativa" as CampanhaStatus,
    observacoes: "",
  });

  const set = (campo: string, valor: string) => setForm((f) => ({ ...f, [campo]: valor }));

  const filtradas = useMemo(
    () =>
      campanhas.filter((c) => (filtroStatus === "todas" ? true : c.status === filtroStatus)),
    [campanhas, filtroStatus]
  );

  const criar = () => {
    if (!form.nome.trim()) return;
    adicionarCampanha({ ...form, nome: form.nome.trim(), objetivo: form.objetivo || "Fechar vendas de sites" });
    setForm({ nome: "", cidade: "Londrina", segmento: "Restaurantes", objetivo: "", status: "ativa", observacoes: "" });
    setModalAberto(false);
  };

  const excluir = (id: string) => {
    if (confirm("Excluir esta campanha?")) removerCampanha(id);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="sm:w-44">
          <option value="todas">Todas</option>
          <option value="ativa">Ativas</option>
          <option value="pausada">Pausadas</option>
          <option value="concluida">Concluídas</option>
        </Select>
        <Button onClick={() => setModalAberto(true)}>
          <Plus className="h-4 w-4" /> Nova campanha
        </Button>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState
          icone={<Megaphone className="h-8 w-8" />}
          titulo="Nenhuma campanha"
          descricao="Crie campanhas por segmento e cidade para organizar abordagens em massa."
          acao={
            <Button onClick={() => setModalAberto(true)}>
              <Plus className="h-4 w-4" /> Criar campanha
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtradas.map((c, i) => {
            const prog = campanhaProgresso(c, empresas);
            const cfg = STATUS_CAMPANHA[c.status];
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card hover className="flex h-full flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{c.nome}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {c.cidade} · {c.segmento}
                        </CardDescription>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] ${cfg.cor}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Target className="h-3.5 w-3.5" /> {c.objetivo}
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge variant="violet">
                        <Users className="h-3 w-3" /> {prog.total} empresas
                      </Badge>
                      <Badge variant="success">{prog.fechadas} fechadas</Badge>
                      <Badge variant="info">{prog.taxa.toFixed(0)}% conversão</Badge>
                    </div>

                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-semibold">{prog.taxa.toFixed(0)}%</span>
                    </div>
                    <Progresso valor={prog.taxa} cor="success" />

                    {c.observacoes && (
                      <p className="mt-3 text-[11px] text-muted-foreground">{c.observacoes}</p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="text-[10px] text-muted-foreground">Criada em {formatarData(c.criadoEm)}</span>
                      <div className="flex items-center gap-2">
                        <Link href={`/campanhas/${c.id}`}>
                          <Button size="sm" variant="outline">
                            Ver detalhes
                          </Button>
                        </Link>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => excluir(c.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        titulo="Nova campanha"
        descricao="Organize empresas por segmento e cidade"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Nome da campanha</Label>
            <Input placeholder="Ex: Restaurantes de Londrina" value={form.nome} onChange={(e) => set("nome", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Cidade</Label>
            <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Segmento</Label>
            <Select value={form.segmento} onChange={(e) => set("segmento", e.target.value)}>
              {SEGMENTOS_SUGERIDOS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Objetivo</Label>
            <Input placeholder="Ex: Fechar 15 sites em 60 dias" value={form.objetivo} onChange={(e) => set("objetivo", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Observações</Label>
            <Textarea placeholder="Estratégia da campanha..." value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setModalAberto(false)}>
            Cancelar
          </Button>
          <Button onClick={criar}>Criar campanha</Button>
        </div>
      </Modal>
    </div>
  );
}