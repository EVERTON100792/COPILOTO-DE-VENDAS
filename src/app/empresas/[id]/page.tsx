"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CalendarClock,
  CheckCircle2,
  FileText,
  MessageSquareText,
  Paperclip,
  Pencil,
  Phone,
  Send,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store-context";
import type { PipelineStatus, Tarefa } from "@/lib/types";
import { CLASSIFICACOES, STATUS_PIPELINE, PIPELINE_ORDEM } from "@/lib/constants";
import { formatarData, formatarMoeda, relativo, uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GaugeIndicador, Progresso } from "@/components/ui/progress";
import { Input, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { EmpresaForm } from "@/components/empresas/empresa-form";
import { toast } from "sonner";

export default function EmpresaDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { empresas, campanhas, atualizarEmpresa, mudarStatus, removerEmpresa } = useStore();
  const empresa = empresas.find((e) => e.id === params.id);

  const [editando, setEditando] = useState(false);
  const [novaObservacao, setNovaObservacao] = useState("");
  const [novaTarefa, setNovaTarefa] = useState("");
  const [novoArquivo, setNovoArquivo] = useState("");
  const [aba, setAba] = useState<"timeline" | "conversa" | "analise" | "tarefas">("timeline");

  const campanha = useMemo(
    () => campanhas.find((c) => c.id === empresa?.campanhaId),
    [campanhas, empresa]
  );

  if (!empresa) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/empresas")}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <EmptyState
          icone={<XCircle className="h-8 w-8" />}
          titulo="Empresa não encontrada"
          descricao="Ela pode ter sido excluída."
        />
      </div>
    );
  }

  const classificacaoCfg = CLASSIFICACOES[empresa.classificacao] ?? CLASSIFICACOES.MORNO;
  const statusCfg = STATUS_PIPELINE[empresa.status];
  const chance = empresa.analise?.probabilidadeFechamento ?? 0;

  const movimentarStatus = (novo: PipelineStatus) => {
    mudarStatus(empresa.id, novo);
    if (novo === "FECHADA" && !empresa.valorNegociado) {
      atualizarEmpresa(empresa.id, { valorNegociado: empresa.valorPretendido });
    }
    toast.success(`Status atualizado para ${STATUS_PIPELINE[novo].label}`);
  };

  const adicionarObservacao = () => {
    if (!novaObservacao.trim()) return;
    const lista = empresa.observacoes ? `${empresa.observacoes}\n[${new Date().toLocaleString("pt-BR")}] ${novaObservacao.trim()}` : `[${new Date().toLocaleString("pt-BR")}] ${novaObservacao.trim()}`;
    atualizarEmpresa(empresa.id, { observacoes: lista });
    setNovaObservacao("");
    toast.success("Observação adicionada");
  };

  const adicionarTarefa = () => {
    if (!novaTarefa.trim()) return;
    const tarefa: Tarefa = { id: uid("tarefa"), titulo: novaTarefa.trim(), data: new Date().toISOString().slice(0, 10), feito: false };
    atualizarEmpresa(empresa.id, { tarefas: [...empresa.tarefas, tarefa] });
    setNovaTarefa("");
    toast.success("Tarefa criada");
  };

  const alternarTarefa = (tarefa: Tarefa) => {
    atualizarEmpresa(empresa.id, {
      tarefas: empresa.tarefas.map((t) => (t.id === tarefa.id ? { ...t, feito: !t.feito } : t)),
    });
  };

  const excluirTarefa = (tarefa: Tarefa) => {
    atualizarEmpresa(empresa.id, { tarefas: empresa.tarefas.filter((t) => t.id !== tarefa.id) });
  };

  const adicionarArquivo = () => {
    if (!novoArquivo.trim()) return;
    atualizarEmpresa(empresa.id, { arquivos: [...empresa.arquivos, novoArquivo.trim()] });
    setNovoArquivo("");
    toast.success("Arquivo vinculado");
  };

  const ultimaMensagem = empresa.conversa[empresa.conversa.length - 1];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/empresas")} className="mt-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
            {empresa.nome.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{empresa.nome}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] ${statusCfg.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
              <span className={`text-xs font-medium ${classificacaoCfg.cor}`}>{classificacaoCfg.label}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {empresa.categoria} · {empresa.cidade}/{empresa.estado} · {empresa.responsavel}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                {empresa.notaGoogle.toFixed(1)} ({empresa.qtdAvaliacoes} avaliações)
              </span>
              {campanha && (
                <Link href={`/campanhas/${campanha.id}`} className="hover:underline">
                  {campanha.nome}
                </Link>
              )}
              {empresa.tags.map((t) => (
                <Badge key={t} variant="violet">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditando(true)}>
            <Pencil className="h-4 w-4" /> Editar
          </Button>
          <Link href={`/negociacao/${empresa.id}`}>
            <Button variant="primary">
              <Sparkles className="h-4 w-4" /> Abrir negociação
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => {
              if (confirm(`Excluir ${empresa.nome}?`)) {
                removerEmpresa(empresa.id);
                router.push("/empresas");
              }
            }}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Valor pretendido</p>
          <p className="mt-1 text-xl font-bold">{formatarMoeda(empresa.valorPretendido)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Valor negociado</p>
          <p className="mt-1 text-xl font-bold text-primary">{formatarMoeda(empresa.valorNegociado)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Último contato</p>
          <p className="mt-1 text-sm font-semibold">{formatarData(empresa.ultimoContato)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Próximo contato</p>
          <p className="mt-1 text-sm font-semibold">{formatarData(empresa.proximoContato)}</p>
          {empresa.proximoContato && (
            <Badge variant={empresa.proximoContato >= new Date().toISOString().slice(0, 10) ? "info" : "warning"} className="mt-1">
              {relativo(empresa.proximoContato)}
            </Badge>
          )}
        </Card>
      </div>

      {/* Análise resumida */}
      {empresa.analise && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" /> Análise do Diretor Comercial
            </CardTitle>
            <GaugeIndicador valor={chance} rotulo="Chance de fechamento" grande />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Interesse</p>
                <Progresso valor={empresa.analise.interesse} cor="info" />
                <p className="text-xs font-medium text-muted-foreground">Urgência</p>
                <Progresso valor={empresa.analise.nivelUrgencia} cor="warning" />
                <p className="text-xs font-medium text-muted-foreground">Confiança</p>
                <Progresso valor={empresa.analise.nivelConfianca} cor="success" />
                <p className="text-xs font-medium text-muted-foreground">Poder de decisão</p>
                <Progresso valor={empresa.analise.poderDecisao} cor="primary" />
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Perfil psicológico: </span>
                  {empresa.analise.perfilPsicologico}
                </p>
                <p>
                  <span className="text-muted-foreground">Perfil comprador: </span>
                  {empresa.analise.perfilComprador}
                </p>
                <p>
                  <span className="text-muted-foreground">Emoção: </span>
                  {empresa.analise.emocao}
                </p>
                {empresa.analise.objecoesDetectadas.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {empresa.analise.objecoesDetectadas.map((o) => (
                      <Badge key={o} variant="destructive">
                        {o}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-lg border border-border bg-background/50 p-3">
                <p className="text-xs font-semibold text-primary">Próximo passo recomendado</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {empresa.analise.estrategia.proximoPasso}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {empresa.analise.estrategia.gatilhos.map((g) => (
                    <Badge key={g} variant="violet">
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fluxo de status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PIPELINE_ORDEM.map((s) => {
              const cfg = STATUS_PIPELINE[s];
              const ativo = empresa.status === s;
              return (
                <Button
                  key={s}
                  size="sm"
                  variant={ativo ? "primary" : "outline"}
                  onClick={() => movimentarStatus(s)}
                  title={`Mover para ${cfg.label}`}
                >
                  {cfg.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Abas */}
      <div className="flex gap-1 border-b border-border">
        {(
          [
            ["timeline", "Timeline"],
            ["conversa", `Conversa (${empresa.conversa.length})`],
            ["analise", "Análise da IA"],
            ["tarefas", `Tarefas (${empresa.tarefas.filter((t) => !t.feito).length})`],
          ] as const
        ).map(([chave, rotulo]) => (
          <button
            key={chave}
            onClick={() => setAba(chave)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              aba === chave
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {aba === "timeline" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" /> Histórico
                </CardTitle>
              </CardHeader>
              <CardContent>
                {empresa.conversa.length === 0 && !empresa.observacoes ? (
                  <EmptyState
                    icone={<MessageSquareText className="h-8 w-8" />}
                    titulo="Nenhuma atividade ainda"
                    descricao="Importe a conversa do WhatsApp ou adicione observações para começar a construir o histórico."
                  />
                ) : (
                  <div className="space-y-4">
                    {empresa.conversa.map((m, i) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-start gap-3"
                      >
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            m.autor === "cliente" ? "bg-info/15 text-info" : "bg-primary/15 text-primary"
                          }`}
                        >
                          {m.autor === "cliente" ? <User className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-xs font-semibold">
                              {m.autor === "cliente" ? empresa.nome : "Você"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatarData(m.data)} {m.hora}
                            </p>
                          </div>
                          <p className="mt-0.5 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                            {m.texto}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {empresa.observacoes && (
                      <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-3">
                        <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                          Observações internas
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">
                          {empresa.observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-primary" /> Anexos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Cole o link do arquivo (proposta, site, vídeo...)"
                    value={novoArquivo}
                    onChange={(e) => setNovoArquivo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && adicionarArquivo()}
                  />
                  <Button onClick={adicionarArquivo}>Vincular</Button>
                </div>
                {empresa.arquivos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {empresa.arquivos.map((a, i) => (
                      <a
                        key={i}
                        href={a}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-border bg-background/50 p-2 text-xs hover:border-primary/40"
                      >
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="truncate">{a}</span>
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dados de contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p><span className="text-muted-foreground">Telefone:</span> {empresa.telefone || "—"}</p>
                <p><span className="text-muted-foreground">WhatsApp:</span> {empresa.whatsapp || "—"}</p>
                <p><span className="text-muted-foreground">Instagram:</span> {empresa.instagram || "—"}</p>
                <p><span className="text-muted-foreground">Facebook:</span> {empresa.facebook || "—"}</p>
                {empresa.siteAtual && (
                  <a href={empresa.siteAtual} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                    <FileText className="h-3.5 w-3.5" /> Site atual
                  </a>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Site novo</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={empresa.novoSiteCriado ? "success" : "default"}>
                  {empresa.novoSiteCriado ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {empresa.novoSiteCriado ? "Site já criado" : "Site ainda não criado"}
                </Badge>
                {empresa.novoSiteCriado && ultimaMensagem && (
                  <p className="mt-3 rounded-lg border border-border bg-background/50 p-2 text-[11px] text-muted-foreground">
                    Última mensagem de {ultimaMensagem.autor === "cliente" ? "cliente" : "você"} ({formatarData(ultimaMensagem.data)}): “{ultimaMensagem.texto.slice(0, 90)}...”
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Observações internas</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Anote informações importantes da negociação..."
                  value={novaObservacao}
                  onChange={(e) => setNovaObservacao(e.target.value)}
                  className="min-h-[90px]"
                />
                <Button className="mt-2 w-full" size="sm" onClick={adicionarObservacao}>
                  Adicionar observação
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {aba === "conversa" && (
        <Card>
          <CardContent className="pt-4">
            {empresa.conversa.length === 0 ? (
              <EmptyState
                icone={<Phone className="h-8 w-8" />}
                titulo="Sem conversa registrada"
                descricao="Abra a negociação para colar a conversa do WhatsApp e a IA analisar."
                acao={
                  <Link href={`/negociacao/${empresa.id}`}>
                    <Button>
                      <Sparkles className="h-4 w-4" /> Analisar conversa
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {empresa.conversa.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.autor === "cliente" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        m.autor === "cliente"
                          ? "rounded-bl-sm border border-border bg-card"
                          : "rounded-br-sm bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{m.texto}</p>
                      <p
                        className={`mt-1 text-[10px] ${
                          m.autor === "cliente" ? "text-muted-foreground" : "text-primary-foreground/70"
                        }`}
                      >
                        {formatarData(m.data)} · {m.hora}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {aba === "analise" && (
        <Card>
          <CardContent className="pt-4">
            {empresa.analise ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <GaugeIndicador valor={empresa.analise.interesse} rotulo="Interesse" />
                  <GaugeIndicador valor={empresa.analise.nivelUrgencia} rotulo="Urgência" />
                  <GaugeIndicador valor={empresa.analise.probabilidadeFechamento} rotulo="Chance de fechamento" grande />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border border-border bg-background/50 p-4">
                    <h3 className="text-sm font-semibold">O que o cliente quis dizer</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {empresa.analise.estrategia.oQueQuisDizer}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/50 p-4">
                    <h3 className="text-sm font-semibold">A verdadeira objeção</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {empresa.analise.estrategia.verdadeiraObjecao}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/50 p-4">
                    <h3 className="text-sm font-semibold">Técnica recomendada</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {empresa.analise.estrategia.tecnica}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/50 p-4">
                    <h3 className="text-sm font-semibold">Erro a evitar</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {empresa.analise.estrategia.erroEvitar}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
                  <h3 className="text-sm font-semibold text-primary">Próximo passo</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {empresa.analise.estrategia.proximoPasso}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {empresa.analise.estrategia.sugestoes.map((s) => (
                    <Badge key={s} variant="violet">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icone={<Bot className="h-8 w-8" />}
                titulo="Análise ainda não gerada"
                descricao="Cole a conversa na negociação para a IA analisar."
                acao={
                  <Link href={`/negociacao/${empresa.id}`}>
                    <Button>
                      <Sparkles className="h-4 w-4" /> Gerar análise
                    </Button>
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>
      )}

      {aba === "tarefas" && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nova tarefa (ex: ligar quinta-feira)"
                value={novaTarefa}
                onChange={(e) => setNovaTarefa(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && adicionarTarefa()}
              />
              <Button onClick={adicionarTarefa}>Adicionar</Button>
            </div>
            {empresa.tarefas.length === 0 ? (
              <EmptyState
                titulo="Sem tarefas"
                descricao="Crie tarefas para acompanhar os próximos passos."
              />
            ) : (
              <div className="mt-4 space-y-2">
                {empresa.tarefas.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => alternarTarefa(t)}
                        className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                          t.feito ? "border-success bg-success text-white" : "border-border"
                        }`}
                      >
                        {t.feito && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                      <div>
                        <p className={`text-sm ${t.feito ? "line-through text-muted-foreground" : ""}`}>{t.titulo}</p>
                        <p className="text-[10px] text-muted-foreground">Criada em {formatarData(t.data)}</p>
                      </div>
                    </div>
                    <button onClick={() => excluirTarefa(t)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <EmpresaForm aberto={editando} onFechar={() => setEditando(false)} empresa={empresa} />
    </div>
  );
}