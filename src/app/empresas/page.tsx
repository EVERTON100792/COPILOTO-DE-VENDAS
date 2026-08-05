"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MessageSquareText,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import type { Empresa } from "@/lib/types";
import { STATUS_PIPELINE, CLASSIFICACOES } from "@/lib/constants";
import { formatarMoeda, formatarNumero } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { EmpresaForm } from "@/components/empresas/empresa-form";
import { Modal } from "@/components/ui/modal";
import { gerarAbordagensEmpresas } from "@/lib/ai/followup";
import { toast } from "sonner";

export default function EmpresasPage() {
  const router = useRouter();
  const { empresas, removerEmpresa } = useStore();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [formAberto, setFormAberto] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null);
  const [modalAbordagem, setModalAbordagem] = useState<Empresa | null>(null);
  const [quantidadeAbordagem, setQuantidadeAbordagem] = useState(20);

  const categoriasUnicas = useMemo(
    () => Array.from(new Set(empresas.map((e) => e.categoria))).sort(),
    [empresas]
  );

  const filtradas = useMemo(() => {
    return empresas
      .filter((e) => {
        if (busca && !e.nome.toLowerCase().includes(busca.toLowerCase())) return false;
        if (filtroStatus !== "todos" && e.status !== filtroStatus) return false;
        if (filtroCategoria !== "todas" && e.categoria !== filtroCategoria) return false;
        return true;
      })
      .sort(
        (a, b) =>
          (b.analise?.probabilidadeFechamento ?? 0) -
          (a.analise?.probabilidadeFechamento ?? 0)
      );
  }, [empresas, busca, filtroStatus, filtroCategoria]);

  const abrirNova = () => {
    setEmpresaEditando(null);
    setFormAberto(true);
  };

  const abrirEdicao = (e: Empresa) => {
    setEmpresaEditando(e);
    setFormAberto(true);
  };

  const excluir = (e: Empresa) => {
    if (confirm(`Excluir ${e.nome}?`)) {
      removerEmpresa(e.id);
      toast.success("Empresa excluída");
    }
  };

  const abordagens = useMemo(
    () =>
      gerarAbordagensEmpresas(
        empresas.filter((e) => e.status === "AGUARDANDO_ABORDAGEM" || e.status === "AGUARDANDO_RESPOSTA"),
        quantidadeAbordagem
      ),
    [empresas, quantidadeAbordagem]
  );

  return (
    <div className="space-y-5">
      {/* Barra de ações */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="sm:w-52">
            <option value="todos">Todos os status</option>
            {Object.entries(STATUS_PIPELINE).map(([chave, cfg]) => (
              <option key={chave} value={chave}>
                {cfg.label}
              </option>
            ))}
          </Select>
          <Select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="sm:w-48">
            <option value="todas">Todas as categorias</option>
            {categoriasUnicas.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setModalAbordagem(empresas[0] ?? null)} disabled={!empresas.length}>
            <Sparkles className="h-4 w-4" />
            Abordagem em massa
          </Button>
          <Button onClick={abrirNova}>
            <Plus className="h-4 w-4" />
            Nova empresa
          </Button>
        </div>
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <EmptyState
          icone={<Building2 className="h-8 w-8" />}
          titulo="Nenhuma empresa encontrada"
          descricao="Cadastre empresas ou ajuste os filtros para começar a trabalhar."
          acao={
            <Button onClick={abrirNova}>
              <Plus className="h-4 w-4" />
              Cadastrar empresa
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Google</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Classificação</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Chance</th>
                <th className="px-4 py-3 font-medium">Próximo contato</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((e) => {
                const statusCfg = STATUS_PIPELINE[e.status];
                const clasCfg = CLASSIFICACOES[e.classificacao] ?? CLASSIFICACOES.MORNO;
                const chance = e.analise?.probabilidadeFechamento ?? 0;
                return (
                  <tr
                    key={e.id}
                    className="border-b border-border transition-colors hover:bg-secondary/30"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/empresas/${e.id}`} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">
                          {e.nome.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium hover:underline">{e.nome}</p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {e.categoria} · {e.cidade}/{e.estado}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <span className="font-medium">{e.notaGoogle.toFixed(1)}</span>
                        <span className="text-muted-foreground">({formatarNumero(e.qtdAvaliacoes)})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] ${statusCfg.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${clasCfg.cor}`}>{clasCfg.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-semibold">{formatarMoeda(e.valorNegociado || e.valorPretendido)}</p>
                      {e.novoSiteCriado && (
                        <Badge variant="success" className="mt-0.5">Site pronto</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-20">
                        <div className="mb-1 flex items-center justify-between text-[10px]">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          <span className="font-semibold">{chance}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${chance}%`,
                              background:
                                chance >= 75 ? "#22c55e" : chance >= 50 ? "#f59e0b" : "#ef4444",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {e.proximoContato ? (
                        <Link href={`/agenda`} className="hover:underline">
                          {formatarDataCurta(e.proximoContato)}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/negociacao/${e.id}`}
                          title="Abrir negociação"
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <MessageSquareText className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => abrirEdicao(e)}
                          title="Editar"
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => excluir(e)}
                          title="Excluir"
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {formatarNumero(filtradas.length)} empresas listadas de {formatarNumero(empresas.length)}
      </p>

      <EmpresaForm
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        empresa={empresaEditando}
        onCadastrada={(id) => router.push(`/negociacao/${id}`)}
      />

      {/* Modal abordagem em massa */}
      <Modal
        aberto={!!modalAbordagem}
        onFechar={() => setModalAbordagem(null)}
        titulo="Sistema de Abordagem em Massa"
        descricao="A IA gera uma abordagem personalizada para cada empresa — nenhuma mensagem se repete"
        largura="max-w-3xl"
      >
        <div className="mb-4 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Quantas empresas abordar? (até {Math.min(100, empresas.length)} disponíveis)
          </label>
          <div className="flex gap-2">
            {[10, 20, 50, 100].map((n) => (
              <Button
                key={n}
                variant={quantidadeAbordagem === n ? "primary" : "outline"}
                size="sm"
                onClick={() => setQuantidadeAbordagem(n)}
              >
                {n}
              </Button>
            ))}
          </div>
        </div>

        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {abordagens.slice(0, quantidadeAbordagem).map((a) => {
            const empresa = empresas.find((e) => e.id === a.empresaId);
            if (!empresa) return null;
            return (
              <div key={a.id} className="rounded-lg border border-border bg-background/50 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold">{empresa.nome}</span>
                  <Badge variant="violet">Personalizada</Badge>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{a.mensagem}</p>
                <p className="mt-1.5 text-[10px] text-muted-foreground">{a.variavel}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              navigator.clipboard?.writeText(
                abordagens
                  .slice(0, quantidadeAbordagem)
                  .map((a) => {
                    const e = empresas.find((x) => x.id === a.empresaId);
                    return `${e?.nome ?? ""}:\n${a.mensagem}`;
                  })
                  .join("\n\n")
              );
              toast.success("Mensagens copiadas para a área de transferência");
            }}
          >
            Copiar todas
          </Button>
          <Button onClick={() => setModalAbordagem(null)}>Concluir</Button>
        </div>
      </Modal>
    </div>
  );
}

function formatarDataCurta(data: string): string {
  const d = new Date(data + "T12:00:00");
  const hoje = new Date();
  const diff = Math.ceil((d.getTime() - hoje.getTime()) / 86400000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff === -1) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}