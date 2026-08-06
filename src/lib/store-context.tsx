"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Campanha, Configuracao, Empresa, PipelineStatus } from "@/lib/types";
import {
  atualizarEmpresa,
  carregarDados,
  mudarStatus,
  resetarDados,
  salvarCampanhas,
  salvarConfig,
  salvarEmpresas,
} from "@/lib/store";
import { uid } from "@/lib/utils";

interface StoreContextValue {
  empresas: Empresa[];
  campanhas: Campanha[];
  config: Configuracao;
  carregando: boolean;
  adicionarEmpresa: (empresa: Omit<Empresa, "id" | "criadoEm" | "atualizadoEm">) => Empresa;
  atualizarEmpresa: (id: string, mudancas: Partial<Empresa>) => void;
  removerEmpresa: (id: string) => void;
  mudarStatus: (id: string, status: PipelineStatus, extra?: Partial<Empresa>) => void;
  adicionarCampanha: (c: Omit<Campanha, "id" | "criadoEm">) => Campanha;
  atualizarCampanha: (id: string, mudancas: Partial<Campanha>) => void;
  removerCampanha: (id: string) => void;
  salvarConfig: (c: Configuracao) => void;
  resetar: () => void;
  definirSeeder: (fn: () => Empresa[]) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [config, setConfig] = useState<Configuracao>({
    nomeVendedor: "",
    nomeAgencia: "",
    openrouterKey: "",
    geminiKey: "",
    groqKey: "",
    modeloIA: "openai/gpt-4o-mini",
    usarIAReal: true,
    lingua: "pt-BR",
  });
  const [carregando, setCarregando] = useState(true);

  // Hidratação de dados do localStorage exclusivamente no cliente.
  // Como `carregando` começa true no servidor e no cliente, o HTML inicial
  // é idêntico (tela de carregamento); os dados são preenchidos só depois.
  useEffect(() => {
    const dados = carregarDados();
    /* eslint-disable react-hooks/set-state-in-effect */
    setEmpresas(dados.empresas);
    setCampanhas(dados.campanhas);
    setConfig(dados.config);
    setCarregando(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const definirSeeder = useCallback((fn: () => Empresa[]) => {
    const novas = fn();
    setEmpresas(() => novas);
  }, []);

  const adicionarEmpresa = useCallback(
    (empresa: Omit<Empresa, "id" | "criadoEm" | "atualizadoEm">): Empresa => {
      const nova: Empresa = {
        ...empresa,
        id: uid("emp"),
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };
      setEmpresas((prev) => {
        const prox = [nova, ...prev];
        salvarEmpresas(prox);
        return prox;
      });
      return nova;
    },
    []
  );

  const atualizarEmpresaCb = useCallback((id: string, mudancas: Partial<Empresa>) => {
    setEmpresas((prev) => {
      const prox = atualizarEmpresa(prev, id, mudancas);
      salvarEmpresas(prox);
      return prox;
    });
  }, []);

  const removerEmpresa = useCallback((id: string) => {
    setEmpresas((prev) => {
      const prox = prev.filter((e) => e.id !== id);
      salvarEmpresas(prox);
      return prox;
    });
  }, []);

  const mudarStatusCb = useCallback(
    (id: string, status: PipelineStatus, extra?: Partial<Empresa>) => {
      setEmpresas((prev) => {
        const prox = mudarStatus(prev, id, status, extra);
        salvarEmpresas(prox);
        return prox;
      });
    },
    []
  );

  const adicionarCampanha = useCallback((c: Omit<Campanha, "id" | "criadoEm">): Campanha => {
    const nova: Campanha = { ...c, id: uid("camp"), criadoEm: new Date().toISOString().slice(0, 10) };
    setCampanhas((prev) => {
      const prox = [nova, ...prev];
      salvarCampanhas(prox);
      return prox;
    });
    return nova;
  }, []);

  const atualizarCampanha = useCallback((id: string, mudancas: Partial<Campanha>) => {
    setCampanhas((prev) => {
      const prox = prev.map((c) => (c.id === id ? { ...c, ...mudancas } : c));
      salvarCampanhas(prox);
      return prox;
    });
  }, []);

  const removerCampanha = useCallback((id: string) => {
    setCampanhas((prev) => {
      const prox = prev.filter((c) => c.id !== id);
      salvarCampanhas(prox);
      return prox;
    });
  }, []);

  const salvarConfigCb = useCallback((c: Configuracao) => {
    setConfig(c);
    salvarConfig(c);
  }, []);

  const resetar = useCallback(() => {
    resetarDados();
    const dados = carregarDados();
    setEmpresas(dados.empresas);
    setCampanhas(dados.campanhas);
    setConfig(dados.config);
  }, []);

  const value = useMemo(
    () => ({
      empresas,
      campanhas,
      config,
      carregando,
      adicionarEmpresa,
      atualizarEmpresa: atualizarEmpresaCb,
      removerEmpresa,
      mudarStatus: mudarStatusCb,
      adicionarCampanha,
      atualizarCampanha,
      removerCampanha,
      salvarConfig: salvarConfigCb,
      resetar,
      definirSeeder,
    }),
    [
      empresas,
      campanhas,
      config,
      carregando,
      adicionarEmpresa,
      atualizarEmpresaCb,
      removerEmpresa,
      mudarStatusCb,
      adicionarCampanha,
      atualizarCampanha,
      removerCampanha,
      salvarConfigCb,
      resetar,
      definirSeeder,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore deve ser usado dentro de StoreProvider");
  return ctx;
}