"use client";

import { useState } from "react";
import { Bell, Moon, Search, Sun } from "lucide-react";
import { useStore } from "@/lib/store-context";

export function Topbar({ titulo, subtitulo }: { titulo?: string; subtitulo?: string }) {
  const { empresas, config } = useStore();
  const [tema, setTema] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const [agoraMs] = useState(() => Date.now());

  const alertas = empresas.filter((e) => {
    const a = e.analise;
    return (
      e.status !== "FECHADA" &&
      e.status !== "PERDIDA" &&
      ((a && a.probabilidadeFechamento >= 75) ||
        (e.proximoContato && new Date(e.proximoContato + "T12:00:00").getTime() < agoraMs))
    );
  }).length;

  const alternarTema = () => {
    const novo = tema === "dark" ? "light" : "dark";
    setTema(novo);
    document.documentElement.classList.toggle("dark", novo === "dark");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/70 px-6 backdrop-blur-2xl">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold">
          {titulo ?? "Painel de Controle"}
        </h1>
        {subtitulo && <p className="truncate text-xs text-muted-foreground">{subtitulo}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-muted-foreground transition-colors hover:bg-secondary"
          title="Buscar empresas (disponível no módulo de Empresas)"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          onClick={alternarTema}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary"
          title="Alternar tema"
        >
          {tema === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary"
          title={`${alertas} alertas ativos`}
        >
          <Bell className="h-4 w-4" />
          {alertas > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-b from-rose-500 to-red-600 px-1 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(244,63,94,0.6)]">
              {alertas > 9 ? "9+" : alertas}
            </span>
          )}
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-bold text-white shadow-[0_0_14px_-2px_rgba(139,92,246,0.6)]">
          {config.nomeVendedor?.[0] ?? "V"}
        </div>
      </div>
    </header>
  );
}