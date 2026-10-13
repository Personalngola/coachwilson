/**
 * Coach Wilson API - utilities
 * Password hashing (PBKDF2) + minimal JWT (HMAC-SHA256) + cookie helpers
 */

const encoder = new TextEncoder();

/* ---------- Password hashing (Web Crypto PBKDF2) ---------- */

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const hashArray = new Uint8Array(hashBuffer);
  // store as: salt (hex) + ":" + hash (hex)
  return `${bufToHex(salt)}:${bufToHex(hashArray)}`;
}

export async function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = hexToBuf(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const hashArray = new Uint8Array(hashBuffer);
  return bufToHex(hashArray) === hashHex;
}

/* ---------- Minimal JWT (HS256) ---------- */

function base64url(buf) {
  let str = "";
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function signJWT(payload, secret, expiresInSeconds = 60 * 60 * 24 * 7) {
  // 7 days default
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const headerB64 = base64url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64url(encoder.encode(JSON.stringify(fullPayload)));
  const data = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return `${data}.${base64url(signature)}`;
}

export async function verifyJWT(token, secret) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const data = `${headerB64}.${payloadB64}`;

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64urlDecode(sigB64),
      encoder.encode(data)
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64)));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/* ---------- Cookie helpers ---------- */

export function setAuthCookie(token, isSecure = true, maxAge = 60 * 60 * 24 * 7) {
  // HttpOnly. Secure only on HTTPS.
  // Domain=.workersdevao.workers.dev so cookie is shared between site + API subdomains.
  // SameSite=None + Secure required for cross-subdomain fetch with credentials.
  const secure = isSecure ? "; Secure" : "";
  const sameSite = isSecure ? "None" : "Lax";
  const domain = isSecure ? "; Domain=.workersdevao.workers.dev" : "";
  return `token=${token}; HttpOnly${secure}; SameSite=${sameSite}; Path=/${domain}; Max-Age=${maxAge}`;
}

export function clearAuthCookie(isSecure = true) {
  const secure = isSecure ? "; Secure" : "";
  const sameSite = isSecure ? "None" : "Lax";
  const domain = isSecure ? "; Domain=.workersdevao.workers.dev" : "";
  return `token=; HttpOnly${secure}; SameSite=${sameSite}; Path=/${domain}; Max-Age=0`;
}

export function getTokenFromRequest(request) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? match[1] : null;
}

export function isRequestSecure(request) {
  const url = new URL(request.url);
  return url.protocol === "https:";
}

/* ---------- Small helpers ---------- */

function bufToHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBuf(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

export function corsHeaders(origin) {
  // Production site + common local servers
  const allowed = [
    "https://coach-wilson.workersdevao.workers.dev",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8788",
    "http://127.0.0.1:8788",
  ];
  const finalOrigin = allowed.includes(origin)
    ? origin
    : origin && origin.startsWith("http://localhost")
      ? origin
      : allowed[0];
  return {
    "Access-Control-Allow-Origin": finalOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Secret",
    "Access-Control-Allow-Credentials": "true",
  };
}
