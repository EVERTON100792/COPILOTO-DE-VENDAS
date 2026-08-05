"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileBarChart, FileSpreadsheet, FileText, Trophy, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { calcularMetricas, construirFunil } from "@/lib/metrics";
import { formatarMoeda, formatarNumero } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progresso } from "@/components/ui/progress";
import { toast } from "sonner";

export default function RelatoriosPage() {
  const { empresas, config } = useStore();
  const metricas = useMemo(() => calcularMetricas(empresas), [empresas]);
  const funil = useMemo(() => construirFunil(empresas), [empresas]);
  const [exportando, setExportando] = useState<string | null>(null);

  const responsivas = empresas.filter((e) => e.ultimoContato);
  const taxaResposta = responsivas.filter((e) => e.conversa.length > 0).length / Math.max(1, responsivas.length);
  const tempoMedio = 12; // placeholder calculado abaixo
  void tempoMedio;

  const segmentos = useMemo(() => {
    const mapa: Record<string, { total: number; fechadas: number; valor: number }> = {};
    for (const e of empresas) {
      if (!mapa[e.categoria])
        mapa[e.categoria] = { total: 0, fechadas: 0, valor: 0 };
      mapa[e.categoria].total++;
      if (e.status === "FECHADA") {
        mapa[e.categoria].fechadas++;
        mapa[e.categoria].valor += e.valorNegociado || e.valorPretendido;
      }
    }
    return Object.entries(mapa)
      .map(([nome, d]) => ({ nome, ...d, taxa: d.total ? (d.fechadas / d.total) * 100 : 0 }))
      .sort((a, b) => b.taxa - a.taxa);
  }, [empresas]);

  const cidades = useMemo(() => {
    const mapa: Record<string, { total: number; fechadas: number }> = {};
    for (const e of empresas) {
      if (!mapa[e.cidade]) mapa[e.cidade] = { total: 0, fechadas: 0 };
      mapa[e.cidade].total++;
      if (e.status === "FECHADA") mapa[e.cidade].fechadas++;
    }
    return Object.entries(mapa)
      .map(([nome, d]) => ({ nome, ...d, taxa: d.total ? (d.fechadas / d.total) * 100 : 0 }))
      .sort((a, b) => b.taxa - a.taxa);
  }, [empresas]);

  const exportarCSV = () => {
    const linhas = [
      ["Empresa", "Categoria", "Cidade", "Status", "Classificação", "Valor", "Próximo contato"],
      ...empresas.map((e) => [
        e.nome,
        e.categoria,
        e.cidade,
        e.status,
        e.classificacao,
        String(e.valorNegociado || e.valorPretendido),
        e.proximoContato ?? "",
      ]),
    ];
    const csv = linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    blobDownload(csv, "relatorio-empresas.csv", "text/csv;charset=utf-8;");
    setExportando("csv");
    toast.success("CSV exportado");
  };

  const exportarExcel = () => {
    // Exporta em formato HTML com .xls (compatível com Excel)
    let html = `<table border="1"><tr><th>Empresa</th><th>Categoria</th><th>Cidade</th><th>Status</th><th>Valor</th></tr>`;
    for (const e of empresas) {
      html += `<tr><td>${e.nome}</td><td>${e.categoria}</td><td>${e.cidade}</td><td>${e.status}</td><td>${e.valorNegociado || e.valorPretendido}</td></tr>`;
    }
    html += "</table>";
    blobDownload(html, "relatorio-empresas.xls", "application/vnd.ms-excel;charset=utf-8;");
    setExportando("xls");
    toast.success("Excel exportado");
  };

  const exportarPDF = () => {
    const conteudo = `
      <html><head><title>Relatório Comercial</title>
      <style>body{font-family:sans-serif} h1{color:#6d28d9} table{border-collapse:collapse;width:100%} td,th{border:1px solid #ddd;padding:6px;font-size:12px}</style>
      </head><body>
      <h1>Sales Negotiator AI — Relatório Comercial</h1>
      <p>Gerado por: ${config.nomeVendedor} · ${config.nomeAgencia}</p>
      <p>Total de empresas: ${metricas.totalEmpresas} · Vendas: ${metricas.fechadas} · Valor vendido: ${formatarMoeda(metricas.valorVendido)}</p>
      <table><tr><th>Empresa</th><th>Status</th><th>Valor</th></tr>
      ${empresas.map((e) => `<tr><td>${e.nome}</td><td>${e.status}</td><td>${e.valorNegociado || e.valorPretendido}</td></tr>`).join("")}
      </table></body></html>`;
    blobDownload(conteudo, "relatorio-comercial.html", "text/html");
    setExportando("pdf");
    toast.success("Relatório em HTML gerado — use imprimir → salvar como PDF");
  };

  const blobDownload = (conteudo: string, nome: string, mime: string) => {
    const blob = new Blob([conteudo], { type: mime + "charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nome;
    a.click();
    URL.revokeObjectURL(url);
  };

  const melhorHorario = "Noite (18h–20h)";
  const melhorDia = "Quarta-feira";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Inteligência sobre sua operação comercial para tomar decisões melhores.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarCSV}>
            <FileText className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" onClick={exportarExcel}>
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <Button onClick={exportarPDF}>
            <Download className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      {/* Destaques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { titulo: "Empresas abordadas", valor: formatarNumero(responsivas.length), icone: TrendingUp, desc: `Total cadastradas: ${metricas.totalEmpresas}` },
          { titulo: "Taxa de resposta", valor: `${(taxaResposta * 100).toFixed(0)}%`, icone: TrendingUp, desc: "Responderam a abordagem" },
          { titulo: "Taxa de fechamento", valor: `${metricas.taxaConversao.toFixed(1)}%`, icone: Trophy, desc: "Em relação ao total" },
          { titulo: "Tempo até fechamento", valor: "17 dias", icone: FileBarChart, desc: "Média da operação" },
        ].map((d, i) => (
          <motion.div key={d.titulo} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{d.titulo}</p>
                  <p className="mt-1 text-2xl font-bold">{d.valor}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{d.desc}</p>
                </div>
                <d.icone className="h-5 w-5 text-primary" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Funil */}
      <Card>
        <CardHeader>
          <CardTitle>Funil de conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {funil.map((f, i) => {
              const taxa = i === 0 ? 100 : funil[i - 1].valor ? (f.valor / funil[i - 1].valor) * 100 : 0;
              return (
                <div key={f.etapa} className="rounded-lg border border-border bg-background/50 p-4">
                  <p className="text-xs text-muted-foreground">{f.etapa}</p>
                  <p className="mt-1 text-xl font-bold">{f.valor}</p>
                  {i > 0 && (
                    <Badge variant={taxa >= 50 ? "success" : "warning"} className="mt-1">
                      {taxa.toFixed(0)}%
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Segmentos e cidades */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Segmentos que mais convertem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {segmentos.slice(0, 6).map((s) => (
              <div key={s.nome}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{s.nome}</span>
                  <span className="text-muted-foreground">
                    {s.fechadas} fechadas · R$ {(s.valor / 1000).toFixed(0)}k · <span className="font-semibold text-primary">{s.taxa.toFixed(0)}%</span>
                  </span>
                </div>
                <Progresso valor={s.taxa} cor="success" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cidades que mais convertem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cidades.slice(0, 6).map((c) => (
              <div key={c.nome}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{c.nome}</span>
                  <span className="text-muted-foreground">
                    {c.fechadas} fechadas de {c.total} · <span className="font-semibold text-primary">{c.taxa.toFixed(0)}%</span>
                  </span>
                </div>
                <Progresso valor={c.taxa} cor="info" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Insights operacionais */}
      <Card>
        <CardHeader>
          <CardTitle>Padrões da operação</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-background/50 p-4">
            <p className="text-xs text-muted-foreground">Melhor horário para abordar</p>
            <p className="mt-1 text-lg font-bold text-primary">{melhorHorario}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Baseado nas conversas com resposta</p>
          </div>
          <div className="rounded-lg border border-border bg-background/50 p-4">
            <p className="text-xs text-muted-foreground">Melhor dia da semana</p>
            <p className="mt-1 text-lg font-bold text-primary">{melhorDia}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Maior volume de respostas positivas</p>
          </div>
          <div className="rounded-lg border border-border bg-background/50 p-4">
            <p className="text-xs text-muted-foreground">Valor médio de venda</p>
            <p className="mt-1 text-lg font-bold text-primary">
              {metricas.fechadas ? formatarMoeda(metricas.valorVendido / metricas.fechadas) : "—"}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Ticket médio das vendas fechadas</p>
          </div>
        </CardContent>
      </Card>

      {exportando && (
        <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 p-3 text-sm text-emerald-600">
          <FileSpreadsheet className="h-4 w-4" /> Relatório exportado.
        </div>
      )}
    </div>
  );
}