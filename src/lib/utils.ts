import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function formatarNumero(valor: number): string {
  return valor.toLocaleString("pt-BR");
}

export function formatarData(data: string | null): string {
  if (!data) return "—";
  try {
    const d = new Date(data + (data.length === 10 ? "T12:00:00" : ""));
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return data;
  }
}

export function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export function adicionarDias(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function calcularData(data: string, dias: number): string {
  const d = new Date(data + "T12:00:00");
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function diasAte(data: string): number {
  const hojeD = new Date();
  const alvo = new Date(data + "T12:00:00");
  const diff = alvo.getTime() - hojeD.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function relativo(data: string | null): string {
  if (!data) return "—";
  const dias = diasAte(data);
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Amanhã";
  if (dias === 2) return "Em 2 dias";
  if (dias === 3) return "Em 3 dias";
  if (dias === 7) return "Em 7 dias";
  if (dias === 15) return "Em 15 dias";
  if (dias === 30) return "Em 30 dias";
  if (dias < 0) return `${Math.abs(dias)}d atrasado`;
  return `Em ${dias} dias`;
}

export function ultimoSegmento(texto: string, autor: string): string {
  return `${autor === "vendedor" ? "[Vendedor]" : "[Cliente]"} ${texto}`;
}

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function clonar<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}