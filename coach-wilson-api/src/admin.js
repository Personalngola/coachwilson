/**
 * Admin handlers — protected by ADMIN_SECRET (not a normal user role)
 */

import { json } from "./utils.js";

const ALLOWED_PLANS = ["free", "bronze", "prata", "ouro"];

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

export async function handleAdminUsers(request, env) {
  const auth = checkAdmin(request, env);
  if (!auth.ok) return auth.response;

  const { results } = await env.DB.prepare(
    `SELECT id, email, name, plan, created_at
     FROM users
     ORDER BY created_at DESC`
  ).all();

  const users = results || [];
  return json({
    ok: true,
    total: users.length,
    users,
  });
}

export async function handleAdminSetPlan(request, env) {
  const auth = checkAdmin(request, env);
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const email = (body.email || "").trim().toLowerCase();
  const plan = (body.plan || "").trim().toLowerCase();

  if (!email) {
    return json({ error: "Email obrigatório" }, 400);
  }
  if (!ALLOWED_PLANS.includes(plan)) {
    return json({ error: "Plano inválido. Use: free, bronze, prata, ouro" }, 400);
  }

  const existing = await env.DB.prepare(
    "SELECT id, email, plan FROM users WHERE email = ?"
  )
    .bind(email)
    .first();

  if (!existing) {
    return json({ error: "Utilizador não encontrado" }, 404);
  }

  const now = new Date().toISOString();
  await env.DB.prepare(
    "UPDATE users SET plan = ?, updated_at = ? WHERE email = ?"
  )
    .bind(plan, now, email)
    .run();

  return json({
    ok: true,
    user: {
      email,
      plan,
      previous_plan: existing.plan,
    },
  });
}

export async function handleAdminDeleteUser(request, env) {
  const auth = checkAdmin(request, env);
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!email) {
    return json({ error: "Email obrigatório" }, 400);
  }

  const existing = await env.DB.prepare(
    "SELECT id, email, name, plan FROM users WHERE email = ?"
  )
    .bind(email)
    .first();

  if (!existing) {
    return json({ error: "Utilizador não encontrado" }, 404);
  }

  await env.DB.prepare("DELETE FROM users WHERE email = ?").bind(email).run();

  return json({
    ok: true,
    deleted: {
      email: existing.email,
      name: existing.name,
      plan: existing.plan,
    },
  });
}
