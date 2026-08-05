"use client";

import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  Flame,
  Layers,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "@/lib/store-context";
import {
  calcularMetricas,
  construirDadosMensais,
  construirDadosSemanais,
  construirFunil,
  construirPipeline,
  gerarAlertas,
} from "@/lib/metrics";
import { STATUS_PIPELINE, CLASSIFICACOES } from "@/lib/constants";
import { formatarMoeda, formatarNumero } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const CORES_FUNIL = ["#8b5cf6", "#6366f1", "#3b82f6", "#22c55e"];

export default function DashboardPage() {
  const { empresas } = useStore();
  const [filtroPipeline, setFiltroPipeline] = useState("todos");

  const metricas = useMemo(() => calcularMetricas(empresas), [empresas]);
  const pipeline = useMemo(() => construirPipeline(empresas), [empresas]);
  const funil = useMemo(() => construirFunil(empresas), [empresas]);
  const semanais = useMemo(() => construirDadosSemanais(empresas), [empresas]);
  const mensais = useMemo(() => construirDadosMensais(empresas), [empresas]);
  const alertas = useMemo(() => gerarAlertas(empresas), [empresas]);

  const pipelineFiltrado =
    filtroPipeline === "todos" ? pipeline : pipeline.filter((p) => p.status === filtroPipeline);

  const classificacaoDistribuicao = useMemo(() => {
    const dist = Object.entries(CLASSIFICACOES).map(([chave, cfg]) => ({
      nome: cfg.label,
      valor: empresas.filter((e) => e.classificacao === chave).length,
    }));
    return dist.filter((d) => d.valor > 0);
  }, [empresas]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          titulo="Valor potencial"
          valor={formatarMoeda(metricas.valorPotencial)}
          icone={<Wallet className="h-4 w-4" />}
          descricao="Soma do funil aberto"
          destaque
          delay={0}
        />
        <StatCard
          titulo="Valor vendido"
          valor={formatarMoeda(metricas.valorVendido)}
          icone={<BadgeCheck className="h-4 w-4" />}
          descricao={`${metricas.fechadas} vendas fechadas`}
          delay={0.05}
        />
        <StatCard
          titulo="Taxa de conversão"
          valor={`${metricas.taxaConversao.toFixed(1)}%`}
          icone={<Target className="h-4 w-4" />}
          descricao="Fechadas ÷ total"
          delay={0.1}
        />
        <StatCard
          titulo="Empresas cadastradas"
          valor={formatarNumero(metricas.totalEmpresas)}
          icone={<Building2 className="h-4 w-4" />}
          descricao={`${metricas.sitesProntos} sites prontos`}
          delay={0.15}
        />
      </div>

      {/* Pipeline em números */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {pipeline.map((p, i) => {
          const cfg = STATUS_PIPELINE[p.status];
          return (
            <motion.div
              key={p.status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <button
                onClick={() => setFiltroPipeline(filtroPipeline === p.status ? "todos" : p.status)}
                className="w-full rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-ring/50"
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                  <span className="text-2xl font-bold">{p.empresas.length}</span>
                </div>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">{cfg.label}</p>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Alertas comerciais
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {alertas.slice(0, 6).map((a, i) => (
              <Link
                key={i}
                href={`/empresas/${a.empresaId}`}
                className="rounded-lg border border-border bg-background/50 p-3 text-xs transition-colors hover:border-primary/40"
              >
                {a.mensagem}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pipeline comercial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Pipeline Comercial
          </CardTitle>
          <Badge variant="violet">{metricas.totalEmpresas} empresas</Badge>
        </CardHeader>
        <CardContent>
          {pipelineFiltrado.length === 0 ? (
            <EmptyState titulo="Sem empresas" descricao="Cadastre empresas para ver o pipeline." />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {pipelineFiltrado.map((coluna) => {
                const cfg = STATUS_PIPELINE[coluna.status];
                const valorColuna = coluna.empresas.reduce(
                  (acc, e) => acc + (e.valorNegociado || e.valorPretendido),
                  0
                );
                return (
                  <div key={coluna.status} className="rounded-lg border border-border bg-background/50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-semibold">
                        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <span className="text-xs font-bold">{coluna.empresas.length}</span>
                    </div>
                    <div className="space-y-2">
                      {coluna.empresas.slice(0, 4).map((e) => (
                        <Link
                          key={e.id}
                          href={`/empresas/${e.id}`}
                          className="block rounded-md border border-border bg-card p-2 transition-colors hover:border-primary/40"
                        >
                          <p className="truncate text-xs font-medium">{e.nome}</p>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">{e.categoria}</span>
                            <span className="text-[10px] font-semibold text-primary">
                              {formatarMoeda(e.valorNegociado || e.valorPretendido)}
                            </span>
                          </div>
                        </Link>
                      ))}
                      {coluna.empresas.length > 4 && (
                        <p className="text-center text-[10px] text-muted-foreground">
                          + {coluna.empresas.length - 4} empresas
                        </p>
                      )}
                      {coluna.empresas.length === 0 && (
                        <p className="py-4 text-center text-[11px] text-muted-foreground">Vazio</p>
                      )}
                    </div>
                    <div className="mt-2 border-t border-border pt-2 text-center">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {formatarMoeda(valorColuna)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Gráfico semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={semanais}>
                <defs>
                  <linearGradient id="gradInic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradFech" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="dia" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="iniciadas" name="Iniciadas" stroke="#8b5cf6" fill="url(#gradInic)" strokeWidth={2} />
                <Area type="monotone" dataKey="fechadas" name="Fechadas" stroke="#22c55e" fill="url(#gradFech)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-info" />
              Gráfico mensal (vendas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mensais}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" allowDecimals={false} />
                <Tooltip
                  formatter={(v: unknown, nome: unknown) =>
                    nome === "valor" ? formatarMoeda(Number(v)) : formatarNumero(Number(v))
                  }
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="vendas" name="Vendas" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="valor" name="Valor" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Funil + distribuição */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-warning" />
              Funil de vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funil.map((etapa, i) => {
                const max = Math.max(1, funil[0].valor);
                const largura = Math.max(8, (etapa.valor / max) * 100);
                return (
                  <div key={etapa.etapa}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium">{etapa.etapa}</span>
                      <span className="text-muted-foreground">
                        {formatarNumero(etapa.valor)} · {((etapa.valor / max) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-md bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${largura}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="h-full rounded-md"
                        style={{ background: CORES_FUNIL[i] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Classificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={classificacaoDistribuicao} dataKey="valor" nameKey="nome" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {classificacaoDistribuicao.map((_, i) => (
                    <Cell key={i} fill={CORES_FUNIL[i % CORES_FUNIL.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1">
              {classificacaoDistribuicao.map((d, i) => (
                <div key={d.nome} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: CORES_FUNIL[i % CORES_FUNIL.length] }} />
                    {d.nome}
                  </span>
                  <span className="font-semibold">{d.valor}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}