import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "./card";
import { cn } from "@/lib/utils";

export function StatCard({
  titulo,
  valor,
  icone,
  destaque = false,
  descricao,
  delay = 0,
}: {
  titulo: string;
  valor: string;
  icone: ReactNode;
  destaque?: boolean;
  descricao?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card
        className={cn(
          "p-4",
          destaque && "border-primary/40 bg-gradient-to-br from-primary/10 via-card to-card"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-muted-foreground">{titulo}</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight">{valor}</p>
            {descricao && <p className="mt-1 text-[11px] text-muted-foreground">{descricao}</p>}
          </div>
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              destaque ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
            )}
          >
            {icone}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}