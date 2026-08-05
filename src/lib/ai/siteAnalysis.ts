export interface PontosSite {
  design: number;
  layout: number;
  velocidade: number;
  seo: number;
  copywriting: number;
  responsividade: number;
  conversao: number;
  ux: number;
  cta: number;
  diferenciais: number;
}

export interface AnaliseSite {
  pontos: PontosSite;
  pontosFortes: string[];
  fragilidades: string[];
  argumentosComerciais: string[];
  notaGeral: number;
}

export function analisarSite(siteUrl: string, segmento: string, descricao: string): AnaliseSite {
  // Heurística local baseada em metadados do site/descrição
  const contexto = `site: ${siteUrl} segmento: ${segmento} descricao: ${descricao}`.toLowerCase();

  const temCta = /agendar|comprar|pedir|reservar|whatsapp|contato|orçamento|promoção/.test(contexto);
  const temSeo = /seo|google|busca|palavra/.test(contexto);
  const temDesign = /design|moderno|limpo|visual|branding|logotipo|identidade/.test(contexto);
  const temMobile = /responsiv|mobile|celular|app/.test(contexto);
  const temVelocidade = /velocid|rápido|performance|leve/.test(contexto);
  const temDiferenciais = /diferencial|exclusiv|premium|personaliz/.test(contexto);

  const pontos: PontosSite = {
    design: base(80, temDesign, 15),
    layout: base(78, temDesign, 10),
    velocidade: base(76, temVelocidade, 18),
    seo: base(70, temSeo, 20),
    copywriting: base(72, temSeo, 12),
    responsividade: base(80, temMobile, 15),
    conversao: base(74, temCta, 18),
    ux: base(76, temMobile, 10),
    cta: base(72, temCta, 20),
    diferenciais: base(70, temDiferenciais, 16),
  };

  const lista: Array<keyof PontosSite> = [
    "design",
    "layout",
    "velocidade",
    "seo",
    "copywriting",
    "responsividade",
    "conversao",
    "ux",
    "cta",
    "diferenciais",
  ];

  const pontosFortes: string[] = [];
  const fragilidades: string[] = [];

  for (const chave of lista) {
    const v = pontos[chave];
    if (v >= 85) pontosFortes.push(nomePonto(chave) + ` (${v}/100)`);
    else if (v < 68) fragilidades.push(nomePonto(chave) + ` (${v}/100)`);
  }

  const argumentosComerciais = gerarArgumentos(pontos, segmento);

  const chaves = lista.map((k) => pontos[k]);
  const notaGeral = Math.round(chaves.reduce((a, b) => a + b, 0) / chaves.length);

  return { pontos, pontosFortes, fragilidades, argumentosComerciais, notaGeral };
}

function base(valorBase: number, positivo: boolean, impacto: number): number {
  const v = valorBase + (positivo ? impacto : -Math.round(impacto / 2));
  return Math.max(40, Math.min(98, v));
}

function nomePonto(k: keyof PontosSite): string {
  return {
    design: "Design",
    layout: "Layout",
    velocidade: "Velocidade de carregamento",
    seo: "SEO (buscas no Google)",
    copywriting: "Copywriting (textos de venda)",
    responsividade: "Responsividade (celular)",
    conversao: "Capacidade de conversão",
    ux: "Experiência do usuário (UX)",
    cta: "Chamadas para ação (CTA)",
    diferenciais: "Diferenciais competitivos",
  }[k];
}

function gerarArgumentos(p: PontosSite, segmento: string): string[] {
  const args: string[] = [];
  const topo = (Object.entries(p) as [string, number][]).sort((a, b) => b[1] - a[1]);

  for (const [chave, valor] of topo.slice(0, 4)) {
    const nome = nomePonto(chave as keyof PontosSite);
    if (chave === "seo") {
      args.push(
        `SEO otimizado (${valor}/100): o site foi estruturado para aparecer no Google quando clientes de ${segmento} buscarem por você.`
      );
    } else if (chave === "conversao") {
      args.push(
        `Site orientado a conversão (${valor}/100): cada elemento foi pensado para transformar visitante em cliente via WhatsApp.`
      );
    } else if (chave === "velocidade") {
      args.push(
        `Carregamento rápido (${valor}/100): páginas leves que não perdem visitante por demora — fator que também influencia o ranking.`
      );
    } else if (chave === "responsividade") {
      args.push(
        `100% responsivo (${valor}/100): visual impecável no celular, onde hoje acontece a maioria dos acessos.`
      );
    } else if (chave === "design" || chave === "layout") {
      args.push(
        `Visual profissional (${valor}/100): passa confiança e valoriza o seu negócio na frente do cliente.`
      );
    } else if (chave === "cta") {
      args.push(
        `Call to action estratégico (${valor}/100): o cliente é guiado naturalmente a entrar em contato.`
      );
    } else if (chave === "ux") {
      args.push(
        `Experiência fluida (${valor}/100): navegação simples que reduz a dúvida e acelera o contato.`
      );
    } else {
      args.push(`${nome} forte (${valor}/100): um diferencial real que seus concorrentes locais normalmente não têm.`);
    }
  }

  return args.slice(0, 4);
}