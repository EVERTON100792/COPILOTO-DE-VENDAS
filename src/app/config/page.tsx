"use client";

import { useState } from "react";
import { Check, CloudUpload, KeyRound, RefreshCcw, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { carregarDados } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { avaliarMensagem } from "@/lib/ai/consultant";

const MODELOS = [
  { id: "openai/gpt-4o-mini", nome: "GPT-4o mini · RECOMENDADO (estável, pago por uso)" },
  { id: "openai/gpt-oss-20b:free", nome: "GPT-OSS 20B · GRÁTIS" },
  { id: "google/gemma-4-26b-a4b-it:free", nome: "Gemma 4 26B · GRÁTIS" },
  { id: "nvidia/nemotron-nano-9b-v2:free", nome: "Nemotron Nano 9B · GRÁTIS" },
  { id: "openrouter/free", nome: "openrouter/free (Auto · melhor grátis)" },
  { id: "openai/gpt-4o", nome: "GPT-4o" },
  { id: "anthropic/claude-3.5-sonnet", nome: "Claude 3.5 Sonnet" },
  { id: "deepseek/deepseek-chat", nome: "DeepSeek Chat" },
];

export default function ConfigPage() {
  const { config, salvarConfig, resetar, empresas, definirSeeder } = useStore();
  const [form, setForm] = useState({
    nomeVendedor: config.nomeVendedor,
    nomeAgencia: config.nomeAgencia,
    openrouterKey: "",
    modeloIA: config.modeloIA,
    usarIAReal: config.usarIAReal,
  });
  const [sincronizado, setSincronizado] = useState(false);
  const [resetaConfirma, setResetaConfirma] = useState(false);

  const set = (campo: string, valor: string | boolean) => setForm((f) => ({ ...f, [campo]: valor }));

  const salvar = () => {
    salvarConfig({
      ...config,
      nomeVendedor: form.nomeVendedor.trim() || "Vendedor",
      nomeAgencia: form.nomeAgencia.trim() || "Sua Agência",
      openrouterKey: form.openrouterKey,
      modeloIA: form.modeloIA,
      usarIAReal: form.usarIAReal,
    });
    setSincronizado(true);
    window.setTimeout(() => setSincronizado(false), 2000);
    toast.success("Configurações salvas");
  };

  const testarIA = () => {
    if (!form.usarIAReal && !form.openrouterKey) {
      toast("Usando motor local de IA. Ative a IA real para usar OpenRouter.");
      return;
    }
    try {
      const nota = avaliarMensagem({
        mensagem: "Olá, quer ver um site modelo?",
        nomeEmpresa: "Cliente Teste",
        segmento: "restaurante",
        contexto: "teste",
      });
      toast.success(`IA operacional — nota de exemplo: ${nota.nota}/100`);
    } catch {
      toast.error("Falha ao testar IA");
    }
  };

  const fazerBackup = () => {
    const dados = { empresas, config };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sna-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exportado");
  };

  const recarregarSeed = () => {
    if (!confirm("Recarregar os dados de demonstração? Isso sobrescreve as alterações atuais.")) return;
    try {
      const dados = carregarDados();
      definirSeeder(() => dados.empresas);
      toast.success("Dados de demonstração restaurados");
    } catch {
      toast.error("Falha ao recarregar seed");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Perfil do vendedor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Seu nome</Label>
              <Input value={form.nomeVendedor} onChange={(e) => set("nomeVendedor", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Nome da agência</Label>
              <Input value={form.nomeAgencia} onChange={(e) => set("nomeAgencia", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" /> Inteligência Artificial (OpenRouter)
          </CardTitle>
          <Badge variant="violet">Opcional</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            O sistema funciona perfeitamente sem chave usando o <b>motor de IA local</b> (análise de conversas, objeções, estratégias e consultor). Para usar o modelo de IA mais poderoso via OpenRouter, insira sua chave abaixo.
          </p>
          <div className="space-y-1.5">
            <Label>Chave da API (OpenRouter)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="password"
                placeholder="sk-or-v1-..."
                value={form.openrouterKey}
                onChange={(e) => set("openrouterKey", e.target.value)}
              />
              <Button variant="outline" onClick={testarIA}>
                <CloudUpload className="h-4 w-4" /> Testar
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Modelo de IA</Label>
              <Select value={form.modeloIA} onChange={(e) => set("modeloIA", e.target.value)}>
                {MODELOS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.usarIAReal}
                  onChange={(e) => set("usarIAReal", e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                Usar IA real quando disponível
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-secondary/20 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            Sua chave fica armazenada apenas neste navegador e nunca é enviada a outros serviços.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4 text-primary" /> Dados e manutenção
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={fazerBackup}>
              Exportar backup (JSON)
            </Button>
            <Button variant="outline" onClick={recarregarSeed}>
              Restaurar dados demo
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!resetaConfirma) {
                  setResetaConfirma(true);
                  window.setTimeout(() => setResetaConfirma(false), 3000);
                  return;
                }
                resetar();
                setResetaConfirma(false);
                toast.success("Dados resetados");
              }}
            >
              <Trash2 className="h-4 w-4" /> {resetaConfirma ? "Confirmar reset?" : "Resetar tudo"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {empresas.length} empresas cadastradas armazenadas localmente neste navegador.
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={() => setForm({ ...config, openrouterKey: "" })}>
          Descartar
        </Button>
        <Button onClick={salvar}>
          {sincronizado ? <Check className="h-4 w-4" /> : null}
          {sincronizado ? "Salvo!" : "Salvar configurações"}
        </Button>
      </div>
    </div>
  );
}