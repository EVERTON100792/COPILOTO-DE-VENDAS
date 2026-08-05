"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Campanha, Empresa } from "@/lib/types";
import { SEGMENTOS_SUGERIDOS, STATUS_PIPELINE } from "@/lib/constants";
import { adicionarDias } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useStore } from "@/lib/store-context";

interface EmpresaFormProps {
  aberto: boolean;
  onFechar: () => void;
  campanhaId?: string | null;
  empresa?: Empresa | null;
  onCadastrada?: (id: string) => void;
}

export function EmpresaForm({ aberto, onFechar, campanhaId = null, empresa = null, onCadastrada }: EmpresaFormProps) {
  const { adicionarEmpresa, atualizarEmpresa, campanhas } = useStore();
  const [form, setForm] = useState({
    nome: empresa?.nome ?? "",
    telefone: empresa?.telefone ?? "",
    whatsapp: empresa?.whatsapp ?? "",
    instagram: empresa?.instagram ?? "",
    facebook: empresa?.facebook ?? "",
    googleMaps: empresa?.googleMaps ?? "",
    notaGoogle: empresa?.notaGoogle?.toString() ?? "4.5",
    qtdAvaliacoes: empresa?.qtdAvaliacoes?.toString() ?? "0",
    cidade: empresa?.cidade ?? "Londrina",
    estado: empresa?.estado ?? "PR",
    categoria: empresa?.categoria ?? "Restaurantes",
    descricao: empresa?.descricao ?? "",
    siteAtual: empresa?.siteAtual ?? "",
    novoSiteCriado: empresa?.novoSiteCriado ?? false,
    valorPretendido: empresa?.valorPretendido?.toString() ?? "2500",
    status: empresa?.status ?? ("AGUARDANDO_ABORDAGEM" as Empresa["status"]),
    campanhaId: empresa?.campanhaId ?? campanhaId ?? "",
    responsavel: empresa?.responsavel ?? "Você",
    tags: empresa?.tags?.join(", ") ?? "",
  });

  const set = (campo: string, valor: string | boolean) => setForm((f) => ({ ...f, [campo]: valor }));

  const salvar = () => {
    if (!form.nome.trim()) {
      toast.error("Informe o nome da empresa");
      return;
    }

    const dados = {
      nome: form.nome.trim(),
      telefone: form.telefone,
      whatsapp: form.whatsapp,
      instagram: form.instagram,
      facebook: form.facebook,
      googleMaps: form.googleMaps,
      notaGoogle: parseFloat(form.notaGoogle) || 0,
      qtdAvaliacoes: parseInt(form.qtdAvaliacoes) || 0,
      cidade: form.cidade,
      estado: form.estado,
      categoria: form.categoria,
      descricao: form.descricao,
      siteAtual: form.siteAtual,
      novoSiteCriado: form.novoSiteCriado,
      valorPretendido: parseInt(form.valorPretendido) || 0,
      valorNegociado: empresa?.valorNegociado ?? 0,
      status: form.status as Empresa["status"],
      classificacao: empresa?.classificacao ?? "FRIO",
      ultimoContato: empresa?.ultimoContato ?? null,
      proximoContato: empresa?.proximoContato ?? adicionarDias(3),
      campanhaId: form.campanhaId || null,
      responsavel: form.responsavel,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      conversa: empresa?.conversa ?? [],
      analise: empresa?.analise ?? null,
      observacoes: empresa?.observacoes ?? "",
      arquivos: empresa?.arquivos ?? [],
      tarefas: empresa?.tarefas ?? [],
    };

    if (empresa) {
      atualizarEmpresa(empresa.id, dados);
      toast.success("Empresa atualizada");
    } else {
      const nova = adicionarEmpresa(dados);
      toast.success("Empresa cadastrada");
      onCadastrada?.(nova.id);
    }
    onFechar();
  };

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={empresa ? "Editar empresa" : "Nova empresa"}
      descricao="Cadastre os dados do negócio para iniciar a negociação"
      largura="max-w-3xl"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Nome da empresa *</Label>
          <Input placeholder="Ex: Restaurante Sabor Mineiro" value={form.nome} onChange={(e) => set("nome", e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Telefone</Label>
          <Input placeholder="(43) 3333-0000" value={form.telefone} onChange={(e) => set("telefone", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>WhatsApp</Label>
          <Input placeholder="(43) 99999-0000" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Instagram</Label>
          <Input placeholder="@empresa" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Facebook</Label>
          <Input placeholder="facebook.com/empresa" value={form.facebook} onChange={(e) => set("facebook", e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Nota Google</Label>
          <Input type="number" step="0.1" min="0" max="5" value={form.notaGoogle} onChange={(e) => set("notaGoogle", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Qtd. avaliações</Label>
          <Input type="number" value={form.qtdAvaliacoes} onChange={(e) => set("qtdAvaliacoes", e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Cidade</Label>
          <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Estado</Label>
          <Input value={form.estado} onChange={(e) => set("estado", e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Categoria / Segmento</Label>
          <Select value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
            {SEGMENTOS_SUGERIDOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Campanha</Label>
          <Select value={form.campanhaId} onChange={(e) => set("campanhaId", e.target.value)}>
            <option value="">Sem campanha</option>
            {campanhas.map((c: Campanha) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
            {Object.entries(STATUS_PIPELINE).map(([chave, cfg]) => (
              <option key={chave} value={chave}>
                {cfg.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Valor pretendido (R$)</Label>
          <Input type="number" value={form.valorPretendido} onChange={(e) => set("valorPretendido", e.target.value)} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Site atual</Label>
          <Input placeholder="https://..." value={form.siteAtual} onChange={(e) => set("siteAtual", e.target.value)} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Descrição do negócio</Label>
          <Textarea placeholder="Descreva o negócio..." value={form.descricao} onChange={(e) => set("descricao", e.target.value)} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Tags (separadas por vírgula)</Label>
          <Input placeholder="nota-alta, urgente, indicação" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={form.novoSiteCriado}
            onChange={(e) => set("novoSiteCriado", e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Site novo já criado
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onFechar}>
          Cancelar
        </Button>
        <Button onClick={salvar}>
          {empresa ? "Salvar alterações" : "Cadastrar empresa"}
        </Button>
      </div>
    </Modal>
  );
}