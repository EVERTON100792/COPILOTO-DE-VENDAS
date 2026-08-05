import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "destructive" | "info" | "violet";
}

export function Badge({ children, className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-secondary text-secondary-foreground border-border",
    success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    destructive: "bg-rose-500/10 text-rose-600 border-rose-500/30",
    info: "bg-sky-500/10 text-sky-600 border-sky-500/30",
    violet: "bg-violet-500/10 text-violet-600 border-violet-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}