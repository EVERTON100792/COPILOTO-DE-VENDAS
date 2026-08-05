"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Building2,
  ClipboardList,
  Compass,
  FileBarChart,
  LayoutDashboard,
  Library,
  Megaphone,
  MessageSquareText,
  Settings,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";

const NAV_PRINCIPAL = [
  { href: "/dashboard", label: "Dashboard", icone: LayoutDashboard },
  { href: "/empresas", label: "Empresas", icone: Building2 },
  { href: "/campanhas", label: "Campanhas", icone: Megaphone },
  { href: "/negociacao", label: "Negociação", icone: MessageSquareText },
  { href: "/agenda", label: "Agenda", icone: ClipboardList },
];

const NAV_IA = [
  { href: "/objeccoes", label: "Biblioteca de Objeções", icone: Target },
  { href: "/copy", label: "Biblioteca de Copy", icone: Library },
  { href: "/simulador", label: "Simulador", icone: Bot },
];

const NAV_RELATORIOS = [
  { href: "/relatorios", label: "Relatórios", icone: FileBarChart },
];

export function Sidebar() {
  const pathname = usePathname();
  const [colapsada, setColapsada] = useState(false);

  const linkAtivo = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={cn(
        "sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-border bg-card/50 backdrop-blur-2xl transition-all duration-200",
        colapsada ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-[0_0_20px_-2px_rgba(139,92,246,0.6)]">
          <Target className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        </div>
        {!colapsada && (
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight">
              Sales <span className="text-gradient">Negotiator</span>
            </p>
            <p className="text-[10px] leading-tight text-muted-foreground">AI Copiloto de Vendas</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {!colapsada && (
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Operação
          </p>
        )}
        <ul className="space-y-1">
          {NAV_PRINCIPAL.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                title={item.label}
                className={cn(
                  "group relative flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                  linkAtivo(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {linkAtivo(item.href) && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icone className="relative z-10 h-4 w-4 shrink-0" />
                {!colapsada && <span className="relative z-10 truncate">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>

        {!colapsada && (
          <p className="mb-1 mt-5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Inteligência
          </p>
        )}
        <ul className="space-y-1">
          {NAV_IA.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                title={item.label}
                className={cn(
                  "group relative flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                  linkAtivo(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {linkAtivo(item.href) && (
                  <motion.span
                    layoutId="sidebar-active-ia"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icone className="relative z-10 h-4 w-4 shrink-0" />
                {!colapsada && <span className="relative z-10 truncate">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>

        {!colapsada && (
          <p className="mb-1 mt-5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Análise
          </p>
        )}
        <ul className="space-y-1">
          {NAV_RELATORIOS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                title={item.label}
                className={cn(
                  "group relative flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                  linkAtivo(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {linkAtivo(item.href) && (
                  <motion.span
                    layoutId="sidebar-active-rel"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icone className="relative z-10 h-4 w-4 shrink-0" />
                {!colapsada && <span className="relative z-10 truncate">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/config"
          className={cn(
            "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
            !colapsada && "justify-start"
          )}
          title="Configurações"
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!colapsada && <span>Configurações</span>}
        </Link>
        <button
          onClick={() => setColapsada((v) => !v)}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Compass className="h-4 w-4 shrink-0" />
          {!colapsada && <span>{colapsada ? "Expandir" : "Recolher"}</span>}
        </button>
      </div>
    </aside>
  );
}