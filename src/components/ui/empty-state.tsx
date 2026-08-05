import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function EmptyState({
  icone,
  titulo,
  descricao,
  acao,
}: {
  icone?: ReactNode;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 p-10 text-center"
    >
      {icone && <div className="text-muted-foreground">{icone}</div>}
      <div>
        <h3 className="text-sm font-semibold">{titulo}</h3>
        {descricao && <p className="mt-1 text-xs text-muted-foreground max-w-sm">{descricao}</p>}
      </div>
      {acao}
    </motion.div>
  );
}

export function PaginaHeader({
  titulo,
  descricao,
  acoes,
}: {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>}
      </div>
      {acoes && <div className="flex items-center gap-2">{acoes}</div>}
    </div>
  );
}