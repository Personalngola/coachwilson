/**
 * Public + admin site content (CMS)
 * GET  /api/content          — public (no auth)
 * GET  /api/admin/content    — admin
 * PUT  /api/admin/content    — admin save
 */

import { json } from "./utils.js";

const CONTENT_KEY = "site";

/** Default content if DB is empty — matches current homepage (PT) */
export const DEFAULT_CONTENT = {
  announce: "Programas online disponíveis · <strong>Vagas limitadas</strong>",
  hero_badge: "Acompanhamento Online Profissional",
  hero_title:
    "Hipertrofia · Emagrecimento · Performance · Qualidade de vida, onde quer que estejas.",
  cta_start: "Quero começar",
  cta_method: "O Método",
  cta_start_arrow: "Quero começar →",

  servicos_title: "Constrói a mente. Constrói o corpo. Constrói a vida.",
  services: {
    s1_title: "Programas Online",
    s1_desc: "Acompanhamento profissional completo, adaptado à tua rotina.",
    s2_title: "Programas Presenciais",
    s2_desc: "Treino e orientação presencial em Luanda.",
    s3_title: "Palestras",
    s3_desc: "Conteúdo de alta performance para eventos e empresas.",
    s4_title: "Formações",
    s4_desc: "Workshops e formações práticas de treino e mindset.",
    s5_title: "Empresas & Ativações",
    s5_desc: "Projetos corporativos e ativações de marca.",
  },

  diff_label: "Diferencial",
  diff_title: "Por que o método funciona",
  diff_desc:
    "Não é apenas sobre treinar mais. É sobre treinar com inteligência, consistência e um sistema que evolui contigo a cada semana.",
  diffs: {
    d1_title: "Resultados Mensuráveis",
    d1_desc: "Monitorização real da tua evolução mês a mês.",
    d2_title: "Ajustes Inteligentes",
    d2_desc: "O plano adapta-se a ti, não o contrário.",
    d3_title: "Flexibilidade Total",
    d3_desc: "Horários livres, treino adaptado à tua rotina.",
    d4_title: "Acompanhamento Humano",
    d4_desc: "Suporte real, estratégico e personalizado.",
  },

  port_title: "A experiência do Coach Wilson",

  pres_title: "Presencial, Palestras & Formações",
  pres_desc:
    "Além do acompanhamento online, desenvolvemos programas presenciais, palestras e formações sob medida.",
  sob_consulta: "Sob consulta",
  presencial: {
    p1_title: "Programas Presenciais",
    p1_desc: "Treino e acompanhamento presencial em Luanda.",
    p2_title: "Palestras",
    p2_desc: "Conteúdo de performance, disciplina e mindset para eventos.",
    p3_title: "Formações & Workshops",
    p3_desc: "Formações práticas para grupos e empresas.",
    p4_title: "Ativações & Empresas",
    p4_desc: "Projetos de marca e ativações corporativas.",
  },

  quote_text:
    "Nunca despreze sua vida, lute com garra e determinação, nunca esqueça suas origens. Somente assim deixará para suas próximas gerações belos exemplos a serem seguidos.",
  quote_author: "— Coach Wilson",

  pack_label: "Planos & Investimento",
  pack_title: "Escolha o seu pacote",
  pack_desc:
    "Um programa desenhado para entregar resultados mensuráveis com estrutura profissional e acompanhamento estratégico.",
  popular_badge: "Popular",
  packages: {
    bronze: {
      name: "Bronze",
      price: "25.000",
      currency: "Kz / mês",
      desc: "Ideal para começar com orientação profissional",
      features: [
        "Videochamada inicial de avaliação",
        "Definição de objetivos",
        "Plano mensal de treino",
        "Exercícios com vídeos explicativos",
        "Acompanhamento quinzenal",
        "Suporte via WhatsApp",
      ],
    },
    prata: {
      name: "Prata",
      price: "60.000",
      currency: "Kz / mês",
      desc: "Maior personalização e evolução acelerada",
      features: [
        "Tudo do pacote Bronze",
        "Plano 100% personalizado",
        "Atualização semanal do treino",
        "2 videochamadas por mês",
        "Correção técnica por vídeo",
        "Ajustes de cardio, carga e progressão",
        "Suporte prioritário",
      ],
    },
    ouro: {
      name: "Ouro",
      price: "120.000",
      currency: "Kz / mês",
      desc: "Experiência completa de acompanhamento total",
      features: [
        "Consulta inicial aprofundada",
        "Plano de treino 100% exclusivo",
        "Nutrição base + macros",
        "Ajustes alimentares semanais",
        "4 videochamadas mensais",
        "Feedback técnico ilimitado",
        "Check-in semanal estratégico",
        "Monitorização de peso, medidas e evolução",
        "Estratégia de suplementação",
        "Suporte prioritário diário",
      ],
    },
  },

  pay_title: "Formas de Pagamento",
  pay_note: "Nota: Pagamento realizado antes do envio do plano mensal.",

  final_title: "Pronto para a transformação?",
  final_desc:
    "Responde com “Quero começar” e agendamos a tua videochamada de avaliação.",

  footer_tag: "Alta Performance · Estética · Saúde · Resultados",
  footer_location: "Luanda, Angola",

  media: {
    hero_image: "",
    hero_image_webp: "",
    training_video: "",
    training_poster: "",
    quote_image: "",
    cta_image: "",
    carousel_1: "",
    carousel_2: "",
    carousel_3: "",
    carousel_4: "",
    carousel_5: "",
  },
};

function checkAdmin(request, env) {
  const secret = env.ADMIN_SECRET;
  if (!secret) {
    return { ok: false, response: json({ error: "Admin não configurado" }, 503) };
  }
  const header = request.headers.get("X-Admin-Secret") || "";
  if (header !== secret) {
    return { ok: false, response: json({ error: "Acesso negado" }, 401) };
  }
  return { ok: true };
}

function deepMerge(defaults, incoming) {
  if (!incoming || typeof incoming !== "object") return { ...defaults };
  const out = { ...defaults, ...incoming };
  out.services = { ...defaults.services, ...(incoming.services || {}) };
  out.diffs = { ...defaults.diffs, ...(incoming.diffs || {}) };
  out.presencial = { ...defaults.presencial, ...(incoming.presencial || {}) };
  out.packages = {
    bronze: { ...defaults.packages.bronze, ...(incoming.packages && incoming.packages.bronze) },
    prata: { ...defaults.packages.prata, ...(incoming.packages && incoming.packages.prata) },
    ouro: { ...defaults.packages.ouro, ...(incoming.packages && incoming.packages.ouro) },
  };
  out.media = { ...defaults.media, ...(incoming.media || {}) };
  return out;
}

async function readContent(env) {
  try {
    const row = await env.DB.prepare(
      "SELECT value, updated_at FROM site_content WHERE key = ?"
    )
      .bind(CONTENT_KEY)
      .first();

    if (!row || !row.value) {
      return { content: DEFAULT_CONTENT, updated_at: null, source: "default" };
    }

    const parsed = JSON.parse(row.value);
    return {
      content: deepMerge(DEFAULT_CONTENT, parsed),
      updated_at: row.updated_at || null,
      source: "db",
    };
  } catch (e) {
    console.error("readContent", e);
    return { content: DEFAULT_CONTENT, updated_at: null, source: "default" };
  }
}

/** Public — no auth */
export async function handleGetContent(request, env) {
  const data = await readContent(env);
  return json({ ok: true, ...data });
}

/** Admin — get full content for editor */
export async function handleAdminGetContent(request, env) {
  const auth = checkAdmin(request, env);
  if (!auth.ok) return auth.response;
  const data = await readContent(env);
  return json({ ok: true, ...data });
}

/** Admin — save content */
export async function handleAdminSaveContent(request, env) {
  const auth = checkAdmin(request, env);
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const incoming = body.content || body;
  if (!incoming || typeof incoming !== "object") {
    return json({ error: "Conteúdo inválido" }, 400);
  }

  const merged = deepMerge(DEFAULT_CONTENT, incoming);

  // Normalize feature lists (string with newlines → array)
  ["bronze", "prata", "ouro"].forEach((key) => {
    const pkg = merged.packages[key];
    if (pkg && typeof pkg.features === "string") {
      pkg.features = pkg.features
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  });

  const now = new Date().toISOString();
  const value = JSON.stringify(merged);

  await env.DB.prepare(
    `INSERT INTO site_content (key, value, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  )
    .bind(CONTENT_KEY, value, now)
    .run();

  return json({ ok: true, content: merged, updated_at: now, source: "db" });
}
