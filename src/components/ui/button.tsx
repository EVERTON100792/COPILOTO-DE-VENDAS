import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
  const sizes = {
    sm: "h-8 text-xs px-3",
    md: "h-9 text-sm px-4",
    lg: "h-11 text-sm px-6",
    icon: "h-9 w-9",
  };
  const variants = {
    primary:
      "bg-gradient-to-b from-primary to-primary/85 text-primary-foreground hover:opacity-95 shadow-[0_4px_20px_-6px_rgba(139,92,246,0.55)] hover:shadow-[0_6px_28px_-6px_rgba(139,92,246,0.7)] relative overflow-hidden",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/70",
    outline:
      "border border-border bg-transparent hover:bg-secondary/60 text-foreground",
    ghost: "hover:bg-secondary text-foreground",
    destructive:
      "bg-destructive text-white hover:opacity-90",
    success:
      "bg-gradient-to-b from-success to-success/85 text-white hover:opacity-95 shadow-[0_4px_20px_-6px_rgba(34,197,94,0.5)]",
  };
  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {variant === "primary" && <span className="shine" aria-hidden />}
      {children}
    </button>
  );
}