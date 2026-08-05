"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModalProps {
  aberto: boolean;
  onFechar: () => void;
  titulo?: ReactNode;
  descricao?: string;
  children: ReactNode;
  largura?: string;
}

export function Modal({ aberto, onFechar, titulo, descricao, children, largura = "max-w-2xl" }: ModalProps) {
  return (
    <AnimatePresence>
      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onFechar}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "relative w-full rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[85vh] overflow-y-auto",
              largura
            )}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                {titulo && <h2 className="text-lg font-semibold">{titulo}</h2>}
                {descricao && <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>}
              </div>
              <button
                onClick={onFechar}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}