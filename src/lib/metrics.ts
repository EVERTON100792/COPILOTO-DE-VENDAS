import type { Campanha, DashboardMetricas, Empresa, FunnelDado, PipelineDado } from "@/lib/types";
import { PIPELINE_ORDEM } from "@/lib/constants";

export function calcularMetricas(empresas: Empresa[]): DashboardMetricas {
  const conte = (status: Empresa["status"]) => empresas.filter((e) => e.status === status).length;

  const valorPotencial = empresas
    .filter((e) => e.status !== "FECHADA" && e.status !== "PERDIDA")
    .reduce((acc, e) => acc + e.valorNegociado + e.valorPretendido, 0);

  const valorVendido = empresas
    .filter((e) => e.status === "FECHADA")
    .reduce((acc, e) => acc + (e.valorNegociado || e.valorPretendido), 0);

  const fechadas = conte("FECHADA");
  const perdidas = conte("PERDIDA");
  const total = empresas.length;
  const taxaConversao = total > 0 ? (fechadas / total) * 100 : 0;

  return {
    totalEmpresas: total,
    sitesProntos: empresas.filter((e) => e.novoSiteCriado).length,
    aguardandoAbordagem: conte("AGUARDANDO_ABORDAGEM"),
    aguardandoResposta: conte("AGUARDANDO_RESPOSTA"),
    interessadas: conte("INTERESSADA"),
    propostas: conte("PROPOSTA_ENVIADA"),
    negociacao: conte("NEGOCIACAO"),
    fechadas,
    perdidas,
    valorPotencial,
    valorVendido,
    taxaConversao,
  };
}

export function construirPipeline(empresas: Empresa[]): PipelineDado[] {
  return PIPELINE_ORDEM.map((status) => ({
    status,
    empresas: empresas.filter((e) => e.status === status),
  }));
}

export function construirFunil(empresas: Empresa[]): FunnelDado[] {
  return [
    { etapa: "Abordadas", valor: empresas.filter((e) => e.ultimoContato || e.status !== "AGUARDANDO_ABORDAGEM").length },
    { etapa: "Em resposta", valor: empresas.filter((e) => e.status === "AGUARDANDO_RESPOSTA" || e.status === "INTERESSADA").length },
    { etapa: "Propostas", valor: empresas.filter((e) => e.status === "PROPOSTA_ENVIADA" || e.status === "NEGOCIACAO").length },
    { etapa: "Fechadas", valor: empresas.filter((e) => e.status === "FECHADA").length },
  ];
}

export function construirDadosSemanais(empresas: Empresa[]): { dia: string; iniciadas: number; fechadas: number }[] {
  const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const agora = new Date();
  return dias.map((d, i) => {
    const inicio = new Date(agora);
    inicio.setDate(agora.getDate() - (6 - i));
    const diaStr = inicio.toISOString().slice(0, 10);
    const fim = new Date(inicio);
    fim.setDate(inicio.getDate() + 1);
    const fimStr = fim.toISOString().slice(0, 10);

    const iniciadas = empresas.filter((e) => {
      const criado = new Date(e.criadoEm).toISOString().slice(0, 10);
      return criado >= diaStr && criado < fimStr;
    }).length;

    const fechadas = empresas.filter((e) => {
      if (e.status !== "FECHADA") return false;
      const atualizado = new Date(e.atualizadoEm).toISOString().slice(0, 10);
      return atualizado >= diaStr && atualizado < fimStr;
    }).length;

    return { dia: d, iniciadas, fechadas };
  });
}

export function construirDadosMensais(empresas: Empresa[]): { mes: string; vendas: number; valor: number }[] {
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const agora = new Date();
  const ano = agora.getFullYear();
  return meses.map((m, i) => {
    const vendas = empresas.filter((e) => {
      if (e.status !== "FECHADA") return false;
      const d = new Date(e.atualizadoEm);
      return d.getFullYear() === ano && d.getMonth() === i;
    });
    return {
      mes: m,
      vendas: vendas.length,
      valor: vendas.reduce((acc, e) => acc + (e.valorNegociado || e.valorPretendido), 0),
    };
  });
}

export function campanhaProgresso(campanha: Campanha, empresas: Empresa[]): {
  total: number;
  fechadas: number;
  taxa: number;
  valorPotencial: number;
  valorVendido: number;
} {
  const daCampanha = empresas.filter((e) => e.campanhaId === campanha.id);
  const fechadas = daCampanha.filter((e) => e.status === "FECHADA").length;
  const total = daCampanha.length;
  return {
    total,
    fechadas,
    taxa: total ? (fechadas / total) * 100 : 0,
    valorPotencial: daCampanha
      .filter((e) => e.status !== "PERDIDA")
      .reduce((acc, e) => acc + e.valorPretendido, 0),
    valorVendido: fechadas
      ? daCampanha
          .filter((e) => e.status === "FECHADA")
          .reduce((acc, e) => acc + (e.valorNegociado || e.valorPretendido), 0)
      : 0,
  };
}

export function gerarAlertas(empresas: Empresa[]) {
  return empresas
    .filter((e) => e.status !== "FECHADA" && e.status !== "PERDIDA")
    .map((e) => {
      const prob = e.analise?.probabilidadeFechamento ?? 0;
      if (prob >= 80)
        return { tipo: "fechando" as const, empresaId: e.id, mensagem: `${e.nome} está quase fechando (${prob}% de chance).` };
      if (e.proximoContato && new Date(e.proximoContato + "T12:00:00").getTime() < Date.now())
        return { tipo: "esperando" as const, empresaId: e.id, mensagem: `${e.nome} está esperando contato: follow-up em atraso.` };
      if (prob >= 60)
        return { tipo: "quente" as const, empresaId: e.id, mensagem: `${e.nome} é um lead quente (${prob}%).` };
      if (prob < 20)
        return { tipo: "frio" as const, empresaId: e.id, mensagem: `${e.nome} está frio — requalificar ou reagendar.` };
      return { tipo: "parado" as const, empresaId: e.id, mensagem: `${e.nome} aguardando próximo movimento.` };
    });
}