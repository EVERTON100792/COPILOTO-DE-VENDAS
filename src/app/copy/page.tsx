"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Library, Search, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { COPY_BIBLIOTECA, preencherTemplate } from "@/lib/ai/copy";
import { CATEGORIAS_COPY } from "@/lib/constants";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";

export default function CopyPage() {
  const { empresas, config } = useStore();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>("todas");

  const filtradas = useMemo(() => {
    return COPY_BIBLIOTECA.filter((c) => {
      if (categoria !== "todas" && c.categoria !== categoria) return false;
      if (busca && !c.titulo.toLowerCase().includes(busca.toLowerCase()) && !c.template.toLowerCase().includes(busca.toLowerCase()))
        return false;
      return true;
    });
  }, [busca, categoria]);

  const copiar = async (texto: string) => {
    await navigator.clipboard.writeText(texto);
    toast.success("Mensagem copiada e personalizada");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-card p-4">
        <Library className="h-8 w-8 text-primary" />
        <div>
          <p className="text-sm font-bold">
            Biblioteca de Copy com {COPY_BIBLIOTECA.length} mensagens prontas
          </p>
          <p className="text-xs text-muted-foreground">
            Organizadas por objetivo e personalizadas automaticamente para cada empresa sempre que você copiar.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar mensagem..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="sm:w-60">
          <option value="todas">Todas as categorias</option>
          {CATEGORIAS_COPY.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState
          icone={<Library className="h-8 w-8" />}
          titulo="Nenhuma mensagem encontrada"
          descricao="Ajuste a busca ou o filtro de categoria."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtradas.map((c, i) => {
            const empresaRef = empresas.filter((e) => e.status === "FECHADA")[i % 3] ?? empresas[0];
            const ctx: Record<string, string | number | undefined> = {
              nome: empresaRef?.nome.split(" ")[0] ?? "Cliente",
              empresa: empresaRef?.nome ?? "seu negócio",
              segmento: empresaRef?.categoria?.toLowerCase() ?? "negócio",
              cidade: empresaRef?.cidade ?? "Londrina",
              instagram: empresaRef?.instagram ?? "sua_empresa",
              nota: empresaRef?.notaGoogle.toFixed(1) ?? "4.8",
              vendedor: config.nomeVendedor,
              agencia: config.nomeAgencia,
              empresa_referencia: "Mercado Boa Praça",
              valor: "R$ 2.900",
              valor_dia: "R$ 4,90",
              prazo: "15 dias",
              itens: "site responsivo, SEO e WhatsApp",
              condicoes: "5x sem juros",
              diferencial: "atendimento de qualidade",
              pontos_melhorar: "velocidade e posicionamento",
              adicional: "página de avaliações com o Google",
              data_limite: "sexta-feira",
              mes: "deste mês",
            };
            const textoPreenchido = preencherTemplate(c.template, ctx);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
              >
                <Card hover className="flex h-full flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      {c.titulo}
                    </CardTitle>
                    <Badge variant="violet">{c.categoria}</Badge>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <p className="flex-1 whitespace-pre-wrap rounded-lg border border-border bg-background/50 p-3 text-xs leading-relaxed text-muted-foreground">
                      {textoPreenchido}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground">{c.descricao}</p>
                      <Button size="sm" variant="outline" onClick={() => copiar(textoPreenchido)}>
                        <Copy className="h-3.5 w-3.5" /> Copiar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}