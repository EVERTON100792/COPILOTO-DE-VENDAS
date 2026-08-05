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
      "bg-primary text-primary-foreground hover:opacity-90 shadow-sm hover:shadow-md",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/70",
    outline:
      "border border-border bg-transparent hover:bg-secondary text-foreground",
    ghost: "hover:bg-secondary text-foreground",
    destructive:
      "bg-destructive text-white hover:opacity-90",
    success: "bg-success text-white hover:opacity-90",
  };
  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </button>
  );
}