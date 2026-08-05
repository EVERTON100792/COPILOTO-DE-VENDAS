"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useStore } from "@/lib/store-context";

const MAPA_TITULO: Record<string, { t: string; s: string }> = {
  "/dashboard": { t: "Dashboard", s: "Visão geral da operação comercial" },
  "/empresas": { t: "Empresas", s: "Gestão completa do funil de vendas" },
  "/campanhas": { t: "Campanhas", s: "Abordagens em massa para segmentos" },
  "/negociacao": { t: "Negociação", s: "Analise conversas e gere estratégias" },
  "/agenda": { t: "Agenda de Follow-up", s: "Nunca perca um cliente" },
  "/objeccoes": { t: "Biblioteca de Objeções", s: "Mais de 300 objeções com estratégias" },
  "/copy": { t: "Biblioteca de Copy", s: "Mensagens prontas personalizáveis" },
  "/simulador": { t: "Simulador de Negociação", s: "Treine com personae reais" },
  "/relatorios": { t: "Relatórios", s: "Inteligência sobre sua operação" },
  "/config": { t: "Configurações", s: "Preferências da sua conta" },
};

export function Shell({ children }: { children: React.ReactNode }) {
  const { carregando } = useStore();
  const pathname = usePathname();

  if (carregando) {
    return (
      <div className="flex h-screen items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando Sales Negotiator AI...</p>
        </div>
      </div>
    );
  }

  const chave = Object.keys(MAPA_TITULO).find((k) => pathname.startsWith(k));
  const titulo = chave ? MAPA_TITULO[chave] : undefined;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {!pathname.startsWith("/negociacao/") && (
          <Topbar titulo={titulo?.t} subtitulo={titulo?.s} />
        )}
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}