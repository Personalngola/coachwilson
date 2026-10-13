/**
 * Auth handlers: signup, login, logout, me
 */

import {
  hashPassword,
  verifyPassword,
  signJWT,
  verifyJWT,
  setAuthCookie,
  clearAuthCookie,
  getTokenFromRequest,
  isRequestSecure,
  json,
} from "./utils.js";

function generateId() {
  return crypto.randomUUID();
}

export async function handleSignup(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const name = (body.name || "").trim();

  if (!email || !email.includes("@")) {
    return json({ error: "Email inválido" }, 400);
  }
  if (password.length < 6) {
    return json({ error: "Password deve ter pelo menos 6 caracteres" }, 400);
  }

  // Check if email already exists
  const existing = await env.DB.prepare(
    "SELECT id FROM users WHERE email = ?"
  )
    .bind(email)
    .first();

  if (existing) {
    return json({ error: "Este email já está registado" }, 409);
  }

  const id = generateId();
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  const plan = "free"; // default – upgrade later after payment

  await env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, name, plan, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(id, email, passwordHash, name || null, plan, now)
    .run();

  const token = await signJWT(
    { sub: id, email, plan },
    env.JWT_SECRET
  );

  const secure = isRequestSecure(request);
  return json(
    {
      ok: true,
      user: { id, email, name: name || null, plan },
    },
    201,
    { "Set-Cookie": setAuthCookie(token, secure) }
  );
}

export async function handleLogin(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  if (!email || !password) {
    return json({ error: "Email e password são obrigatórios" }, 400);
  }

  const user = await env.DB.prepare(
    "SELECT id, email, password_hash, name, plan FROM users WHERE email = ?"
  )
    .bind(email)
    .first();

  if (!user) {
    return json({ error: "Email ou password incorretos" }, 401);
  }

  if (!user.password_hash) {
    return json(
      { error: "Esta conta usa Google. Clique em «Continuar com Google»." },
      401
    );
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return json({ error: "Email ou password incorretos" }, 401);
  }

  const token = await signJWT(
    { sub: user.id, email: user.email, plan: user.plan },
    env.JWT_SECRET
  );

  const secure = isRequestSecure(request);
  return json(
    {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
    },
    200,
    { "Set-Cookie": setAuthCookie(token, secure) }
  );
}

export async function handleLogout(request) {
  const secure = isRequestSecure(request);
  return json(
    { ok: true },
    200,
    { "Set-Cookie": clearAuthCookie(secure) }
  );
}

export async function handleMe(request, env) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return json({ error: "Não autenticado" }, 401);
  }

  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload || !payload.sub) {
    return json({ error: "Sessão inválida ou expirada" }, 401);
  }

  const user = await env.DB.prepare(
    "SELECT id, email, name, plan, created_at FROM users WHERE id = ?"
  )
    .bind(payload.sub)
    .first();

  if (!user) {
    return json({ error: "Utilizador não encontrado" }, 401);
  }

  return json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      created_at: user.created_at,
    },
  });
}

/* ---------- Google OAuth ---------- */

function b64url(bytes) {
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function siteOrigin(env) {
  return (env.SITE_URL || "https://coach-wilson.workersdevao.workers.dev").replace(/\/$/, "");
}

function apiOrigin(request) {
  const u = new URL(request.url);
  return u.origin;
}

/** GET /api/auth/google — redirect user to Google consent */
export async function handleGoogleStart(request, env) {
  const clientId = env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const site = siteOrigin(env);
    return Response.redirect(site + "/login.html?error=google_not_configured", 302);
  }

  const url = new URL(request.url);
  let returnTo = url.searchParams.get("return") || "/conta.html";
  // Only allow relative paths on our site
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) {
    returnTo = "/conta.html";
  }

  const stateBytes = crypto.getRandomValues(new Uint8Array(24));
  const state = b64url(stateBytes) + "." + b64url(new TextEncoder().encode(returnTo));

  const redirectUri = apiOrigin(request) + "/api/auth/google/callback";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });

  const secure = isRequestSecure(request);
  const sameSite = secure ? "None" : "Lax";
  const domain = secure ? "; Domain=.workersdevao.workers.dev" : "";
  const stateCookie = `g_oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=${sameSite}${secure ? "; Secure" : ""}${domain}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString(),
      "Set-Cookie": stateCookie,
    },
  });
}

/** GET /api/auth/google/callback — exchange code, create/login user, set session */
export async function handleGoogleCallback(request, env) {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const site = siteOrigin(env);

  if (!clientId || !clientSecret) {
    return Response.redirect(site + "/login.html?error=google_not_configured", 302);
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") || "";
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return Response.redirect(
      site + "/login.html?error=" + encodeURIComponent(oauthError),
      302
    );
  }

  // Validate state against cookie
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)g_oauth_state=([^;]+)/);
  const cookieState = match ? decodeURIComponent(match[1]) : "";
  if (!code || !state || !cookieState || state !== cookieState) {
    return Response.redirect(site + "/login.html?error=invalid_state", 302);
  }

  let returnTo = "/conta.html";
  try {
    const parts = state.split(".");
    if (parts.length >= 2) {
      const pad = parts[1] + "===".slice((parts[1].length + 3) % 4);
      const decoded = atob(pad.replace(/-/g, "+").replace(/_/g, "/"));
      if (decoded.startsWith("/") && !decoded.startsWith("//")) returnTo = decoded;
    }
  } catch (_) {}

  const redirectUri = apiOrigin(request) + "/api/auth/google/callback";

  // Exchange code for tokens
  let tokenRes;
  try {
    tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
  } catch (e) {
    console.error("google token exchange failed", e);
    return Response.redirect(site + "/login.html?error=token_exchange", 302);
  }

  if (!tokenRes.ok) {
    const t = await tokenRes.text();
    console.error("google token error", t);
    return Response.redirect(site + "/login.html?error=token_exchange", 302);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    return Response.redirect(site + "/login.html?error=no_access_token", 302);
  }

  // Fetch profile
  let profile;
  try {
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: "Bearer " + accessToken },
    });
    if (!profileRes.ok) throw new Error("userinfo failed");
    profile = await profileRes.json();
  } catch (e) {
    console.error(e);
    return Response.redirect(site + "/login.html?error=profile", 302);
  }

  const googleId = String(profile.sub || "");
  const email = String(profile.email || "").trim().toLowerCase();
  const name = String(profile.name || "").trim();
  if (!googleId || !email) {
    return Response.redirect(site + "/login.html?error=missing_profile", 302);
  }

  // Find by google_id, then by email
  let user = await env.DB.prepare(
    "SELECT id, email, name, plan, google_id FROM users WHERE google_id = ?"
  )
    .bind(googleId)
    .first();

  if (!user) {
    user = await env.DB.prepare(
      "SELECT id, email, name, plan, google_id FROM users WHERE email = ?"
    )
      .bind(email)
      .first();

    if (user) {
      // Link Google to existing email account
      await env.DB.prepare(
        "UPDATE users SET google_id = ?, name = COALESCE(name, ?), updated_at = ? WHERE id = ?"
      )
        .bind(googleId, name || null, new Date().toISOString(), user.id)
        .run();
      user.google_id = googleId;
      if (!user.name && name) user.name = name;
    } else {
      // Create new user (Google-only, no password)
      const id = generateId();
      const now = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO users (id, email, password_hash, name, plan, google_id, created_at)
         VALUES (?, ?, '', ?, 'free', ?, ?)`
      )
        .bind(id, email, name || null, googleId, now)
        .run();
      user = { id, email, name: name || null, plan: "free", google_id: googleId };
    }
  }

  const jwt = await signJWT(
    { sub: user.id, email: user.email, plan: user.plan },
    env.JWT_SECRET
  );

  const secure = isRequestSecure(request);
  const authCookie = setAuthCookie(jwt, secure);
  // Clear oauth state cookie
  const sameSite = secure ? "None" : "Lax";
  const domain = secure ? "; Domain=.workersdevao.workers.dev" : "";
  const clearState = `g_oauth_state=; HttpOnly; Path=/; Max-Age=0; SameSite=${sameSite}${secure ? "; Secure" : ""}${domain}`;

  // Multiple Set-Cookie: use Headers
  const headers = new Headers();
  headers.append("Set-Cookie", authCookie);
  headers.append("Set-Cookie", clearState);
  headers.set("Location", site + returnTo);

  return new Response(null, { status: 302, headers });
}
