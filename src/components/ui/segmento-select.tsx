"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { obterTodosSegmentos, salvarSegmentoCustomizado } from "@/lib/constants";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPCAO_NOVO = "__novo_segmento__";

interface SegmentoSelectProps {
  value: string;
  onChange: (valor: string) => void;
  className?: string;
}

export function SegmentoSelect({ value, onChange, className }: SegmentoSelectProps) {
  const [segmentos, setSegmentos] = useState<string[]>(() => {
    const todos = obterTodosSegmentos();
    return value && !todos.includes(value) ? [value, ...todos] : todos;
  });
  const [modoNovo, setModoNovo] = useState(false);
  const [novoNome, setNovoNome] = useState("");

  const aoMudarSelect = (valor: string) => {
    if (valor === OPCAO_NOVO) {
      setModoNovo(true);
      return;
    }
    onChange(valor);
  };

  const cadastrar = () => {
    const nome = novoNome.trim();
    if (!nome) {
      toast.error("Digite o nome do novo segmento");
      return;
    }
    const lista = salvarSegmentoCustomizado(nome);
    setSegmentos(lista);
    onChange(nome);
    setNovoNome("");
    setModoNovo(false);
    toast.success(`Segmento "${nome}" cadastrado`);
  };

  return (
    <div className="space-y-2">
      <Select value={modoNovo ? OPCAO_NOVO : value} onChange={(e) => aoMudarSelect(e.target.value)} className={cn(className)}>
        {segmentos.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
        <option value={OPCAO_NOVO}>＋ Cadastrar novo segmento...</option>
      </Select>
      {modoNovo && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Ex: Pet Shops, Barbearias..."
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                cadastrar();
              }
            }}
          />
          <Button size="sm" onClick={cadastrar}>
            <Plus className="h-3.5 w-3.5" /> Cadastrar
          </Button>
        </div>
      )}
    </div>
  );
}