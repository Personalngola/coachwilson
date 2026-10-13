/**
 * Site media (Cloudinary) — public assets for CMS
 * POST /api/admin/media          — upload (admin, multipart)
 * DELETE /api/admin/media?key=   — delete object (admin)
 * GET  /api/media/:key           — redirect to Cloudinary (legacy / optional)
 *
 * Secrets (wrangler secret put):
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

import { json } from "./utils.js";

const ALLOWED = {
  "image/jpeg": { ext: "jpg", resource: "image", max: 8 * 1024 * 1024 },
  "image/jpg": { ext: "jpg", resource: "image", max: 8 * 1024 * 1024 },
  "image/png": { ext: "png", resource: "image", max: 8 * 1024 * 1024 },
  "image/webp": { ext: "webp", resource: "image", max: 8 * 1024 * 1024 },
  "video/mp4": { ext: "mp4", resource: "video", max: 40 * 1024 * 1024 },
};

/** Slots staff can assign uploads to (stored in site_content.media) */
export const MEDIA_SLOTS = [
  "hero_image",
  "hero_image_webp",
  "training_video",
  "training_poster",
  "quote_image",
  "cta_image",
  "carousel_1",
  "carousel_2",
  "carousel_3",
  "carousel_4",
  "carousel_5",
];

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

function cloudinaryConfigured(env) {
  return !!(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  );
}

function publicIdFromSlot(slot) {
  const clean = String(slot || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 40);
  if (!MEDIA_SLOTS.includes(clean)) return null;
  return `site/${clean}`;
}

function basicAuth(env) {
  const token = btoa(`${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`);
  return `Basic ${token}`;
}

/**
 * SHA-1 signature for Cloudinary signed upload (fallback if Basic Auth not preferred).
 * Parameters sorted alphabetically, then &api_secret.
 */
async function signParams(params, apiSecret) {
  const sorted = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const toSign = sorted + apiSecret;
  const data = new TextEncoder().encode(toSign);
  const hash = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Admin upload: multipart field "file", form field "slot" */
export async function handleAdminUploadMedia(request, env) {
  const auth = checkAdmin(request, env);
  if (!auth.ok) return auth.response;

  if (!cloudinaryConfigured(env)) {
    return json(
      {
        error:
          "Cloudinary não configurado. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET (wrangler secret put).",
      },
      503
    );
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Formulário inválido" }, 400);
  }

  const slot = form.get("slot");
  const file = form.get("file");
  if (!slot || typeof slot !== "string") {
    return json({ error: "Campo slot em falta" }, 400);
  }
  if (!file || typeof file === "string" || !file.arrayBuffer) {
    return json({ error: "Ficheiro em falta" }, 400);
  }

  const type = (file.type || "").toLowerCase();
  const rule = ALLOWED[type];
  if (!rule) {
    return json(
      { error: "Tipo não permitido. Use JPG, PNG, WebP ou MP4." },
      400
    );
  }

  const size = file.size || 0;
  if (size <= 0 || size > rule.max) {
    return json(
      {
        error: `Ficheiro demasiado grande (máx. ${Math.round(rule.max / 1024 / 1024)} MB)`,
      },
      400
    );
  }

  const publicId = publicIdFromSlot(slot);
  if (!publicId) {
    return json({ error: "Slot inválido" }, 400);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signParamsObj = {
    public_id: publicId,
    overwrite: "true",
    timestamp: String(timestamp),
  };
  const signature = await signParams(signParamsObj, env.CLOUDINARY_API_SECRET);

  const uploadForm = new FormData();
  uploadForm.append("file", file);
  uploadForm.append("public_id", publicId);
  uploadForm.append("overwrite", "true");
  uploadForm.append("api_key", env.CLOUDINARY_API_KEY);
  uploadForm.append("timestamp", String(timestamp));
  uploadForm.append("signature", signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${rule.resource}/upload`;

  let cloudRes;
  try {
    cloudRes = await fetch(endpoint, {
      method: "POST",
      body: uploadForm,
    });
  } catch (err) {
    console.error("Cloudinary upload network error", err);
    return json({ error: "Falha de rede ao enviar para Cloudinary" }, 502);
  }

  const data = await cloudRes.json().catch(() => ({}));
  if (!cloudRes.ok) {
    console.error("Cloudinary upload error", data);
    return json(
      {
        error:
          data.error?.message ||
          data.message ||
          "Falha no envio para Cloudinary",
      },
      502
    );
  }

  // Prefer secure HTTPS delivery URL
  const url = data.secure_url || data.url || "";
  return json({
    ok: true,
    slot,
    key: publicId,
    url,
    contentType: type,
    size,
    public_id: data.public_id,
    resource_type: data.resource_type,
  });
}

/** Admin delete object by public_id (key) */
export async function handleAdminDeleteMedia(request, env) {
  const auth = checkAdmin(request, env);
  if (!auth.ok) return auth.response;

  if (!cloudinaryConfigured(env)) {
    return json({ error: "Cloudinary não configurado" }, 503);
  }

  const url = new URL(request.url);
  const key = (url.searchParams.get("key") || "").trim();
  if (!key.startsWith("site/") || key.includes("..")) {
    return json({ error: "Key inválida" }, 400);
  }

  // Try both image and video (slot may be either)
  const destroy = async (resourceType) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const signParamsObj = {
      public_id: key,
      timestamp: String(timestamp),
    };
    const signature = await signParams(signParamsObj, env.CLOUDINARY_API_SECRET);

    const form = new FormData();
    form.append("public_id", key);
    form.append("api_key", env.CLOUDINARY_API_KEY);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);

    const endpoint = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`;
    const res = await fetch(endpoint, { method: "POST", body: form });
    return res.json().catch(() => ({}));
  };

  let result = await destroy("image");
  if (result.result !== "ok" && result.result !== "not found") {
    result = await destroy("video");
  }

  if (result.result === "ok" || result.result === "not found") {
    return json({ ok: true, deleted: key, result: result.result });
  }

  return json(
    { error: result.error?.message || "Falha ao apagar no Cloudinary" },
    502
  );
}

/**
 * Public GET /api/media/:key
 * Legacy path: redirects to Cloudinary delivery URL so old /api/media/... links still work.
 * New uploads store the full Cloudinary secure_url in content, so this is optional.
 */
export async function handleGetMedia(request, env, keyParam) {
  if (!cloudinaryConfigured(env)) {
    return json({ error: "Media indisponível" }, 503);
  }

  let key = decodeURIComponent(keyParam || "");
  if (!key.startsWith("site/")) {
    key = "site/" + key.replace(/^\/+/, "");
  }
  if (key.includes("..") || !key.startsWith("site/")) {
    return json({ error: "Não encontrado" }, 404);
  }

  // Guess resource type from known slots (videos vs images)
  const isVideo = key.includes("training_video");
  const resource = isVideo ? "video" : "image";
  const cloudName = env.CLOUDINARY_CLOUD_NAME;

  // Direct delivery URL (f_auto,q_auto for images)
  const delivery =
    resource === "image"
      ? `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${key}`
      : `https://res.cloudinary.com/${cloudName}/video/upload/${key}`;

  return Response.redirect(delivery, 302);
}
