"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Copy,
  MapPin,
  Megaphone,
  Rocket,
  Sparkles,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { STATUS_PIPELINE, CLASSIFICACOES } from "@/lib/constants";
import { formatarMoeda } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Progresso } from "@/components/ui/progress";
import { campanhaProgresso } from "@/lib/metrics";
import { gerarAbordagensEmpresas } from "@/lib/ai/followup";
import { toast } from "sonner";

export default function CampanhaDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { campanhas, empresas } = useStore();
  const campanha = campanhas.find((c) => c.id === params.id);

  const [modalMiddle, setModalMiddle] = useState(false);
  const [quantidade, setQuantidade] = useState(20);

  const pendentes = useMemo(
    () =>
      campanha
        ? empresas.filter(
            (e) =>
              e.campanhaId === campanha.id &&
              (e.status === "AGUARDANDO_ABORDAGEM" || e.status === "AGUARDANDO_RESPOSTA")
          )
        : [],
    [campanha, empresas]
  );

  const daCampanha = useMemo(
    () => (campanha ? empresas.filter((e) => e.campanhaId === campanha.id) : []),
    [campanha, empresas]
  );

  const abordagens = useMemo(
    () => gerarAbordagensEmpresas(pendentes, quantidade),
    [pendentes, quantidade]
  );

  if (!campanha) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/campanhas")}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <EmptyState icone={<XCircle className="h-8 w-8" />} titulo="Campanha não encontrada" />
      </div>
    );
  }

  const prog = campanhaProgresso(campanha, empresas);

  const copiarTodas = async () => {
    const todas = daCampanha
      .map((e) => {
        const a = gerarAbordagensEmpresas([e], 1)[0];
        return `${e.nome}:\n${a.mensagem}`;
      })
      .join("\n\n");
    await navigator.clipboard.writeText(todas);
    toast.success("Abordagens copiadas");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/campanhas")} className="mt-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{campanha.nome}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {campanha.cidade} · {campanha.segmento} · Criada em {campanha.criadoEm}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="violet">
                <Users className="h-3 w-3" /> {prog.total} empresas
              </Badge>
              <Badge variant="success">{prog.fechadas} fechadas</Badge>
              <Badge variant="info">{prog.taxa.toFixed(0)}% conversão</Badge>
              <Badge variant="warning">{pendentes.length} aguardando abordagem</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={copiarTodas}>
            <Copy className="h-4 w-4" /> Copiar abordagens
          </Button>
          <Button onClick={() => setModalMiddle(true)} disabled={!pendentes.length}>
            <Sparkles className="h-4 w-4" /> Abordagem em massa
          </Button>
        </div>
      </div>

      {campanha.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle>Estratégia da campanha</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{campanha.observacoes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Desempenho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-background/50 p-3">
              <p className="text-xs text-muted-foreground">Valor potencial</p>
              <p className="mt-1 text-lg font-bold">{formatarMoeda(prog.valorPotencial)}</p>
            </div>
            <div className="rounded-lg border border-border bg-background/50 p-3">
              <p className="text-xs text-muted-foreground">Valor vendido</p>
              <p className="mt-1 text-lg font-bold text-success">{formatarMoeda(prog.valorVendido)}</p>
            </div>
            <div className="rounded-lg border border-border bg-background/50 p-3">
              <p className="text-xs text-muted-foreground">Conversão</p>
              <p className="mt-1 text-lg font-bold text-primary">{prog.taxa.toFixed(1)}%</p>
            </div>
            <div className="rounded-lg border border-border bg-background/50 p-3">
              <p className="text-xs text-muted-foreground">Sites criados</p>
              <p className="mt-1 text-lg font-bold">{daCampanha.filter((e) => e.novoSiteCriado).length}</p>
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progresso da campanha</span>
              <span className="font-semibold">{prog.taxa.toFixed(0)}%</span>
            </div>
            <Progresso valor={prog.taxa} cor="success" />
          </div>
        </CardContent>
      </Card>

      {/* Empresas da campanha */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {daCampanha.map((e, i) => {
          const statusCfg = STATUS_PIPELINE[e.status];
          const clasCfg = CLASSIFICACOES[e.classificacao] ?? CLASSIFICACOES.MORNO;
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card hover className="h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/empresas/${e.id}`} className="text-sm font-semibold hover:underline">
                        {e.nome}
                      </Link>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        {e.notaGoogle.toFixed(1)} ({e.qtdAvaliacoes})
                      </div>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className={`text-[11px] font-medium ${clasCfg.cor}`}>{clasCfg.label}</span>
                    {e.novoSiteCriado && (
                      <Badge variant="success">
                        <CheckCircle2 className="h-3 w-3" /> Site
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs font-semibold">
                      {formatarMoeda(e.valorNegociado || e.valorPretendido)}
                    </span>
                    <Link href={`/negociacao/${e.id}`}>
                      <Button size="sm" variant="outline">
                        <Bot className="h-3.5 w-3.5" /> Negociar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {daCampanha.length === 0 && (
        <EmptyState
          icone={<Users className="h-8 w-8" />}
          titulo="Nenhuma empresa nesta campanha"
          descricao="Cadastre empresas vinculadas a esta campanha ou use a abordagem em massa para montar a lista."
          acao={
            <Button onClick={() => setModalMiddle(true)}>
              <Sparkles className="h-4 w-4" /> Gerar lista via IA
            </Button>
          }
        />
      )}

      {/* Modal de abordagem em massa */}
      <Modal
        aberto={modalMiddle}
        onFechar={() => setModalMiddle(false)}
        titulo="Abordagem personalizada para cada empresa"
        descricao="A IA escreve uma mensagem única por empresa, usando nome, cidade, nota Google, segmento e características do negócio. Nenhuma mensagem se repete."
        largura="max-w-3xl"
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Quantidade:</span>
          {[10, 20, 50, 100].map((n) => (
            <Button
              key={n}
              size="sm"
              variant={quantidade === n ? "primary" : "outline"}
              onClick={() => setQuantidade(n)}
              disabled={n > pendentes.length}
            >
              {n}
            </Button>
          ))}
        </div>

        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {abordagens.map((a, idx) => {
            const empresa = empresas.find((e) => e.id === a.empresaId);
            if (!empresa) return null;
            return (
              <div key={a.id} className="rounded-lg border border-border bg-background/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">
                    {idx + 1}. {empresa.nome}
                  </span>
                  <Badge variant="violet">Personalizada</Badge>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{a.mensagem}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{a.variavel}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await navigator.clipboard.writeText(a.mensagem);
                      toast.success("Mensagem copiada");
                    }}
                  >
                    <Copy className="h-3 w-3" /> Copiar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              const texto = abordagens
                .map((a) => {
                  const e = empresas.find((x) => x.id === a.empresaId);
                  return `${e?.nome}: ${a.mensagem}`;
                })
                .join("\n\n");
              await navigator.clipboard.writeText(texto);
              toast.success("Todas as mensagens copiadas");
            }}
          >
            <Copy className="h-4 w-4" /> Copiar selecionadas
          </Button>
          <Button onClick={() => setModalMiddle(false)}>
            <Rocket className="h-4 w-4" /> Concluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}