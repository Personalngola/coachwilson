/**
 * Coach Wilson API - main entry
 * Routes: /api/signup  /api/login  /api/logout  /api/me
 *         /api/admin/users  /api/admin/plan  /api/admin/delete
 */

import {
  handleSignup,
  handleLogin,
  handleLogout,
  handleMe,
  handleGoogleStart,
  handleGoogleCallback,
} from "./auth.js";
import {
  handleAdminUsers,
  handleAdminSetPlan,
  handleAdminDeleteUser,
} from "./admin.js";
import {
  handleGetContent,
  handleAdminGetContent,
  handleAdminSaveContent,
} from "./content.js";
import {
  handleAdminUploadMedia,
  handleAdminDeleteMedia,
  handleGetMedia,
} from "./media.js";
import { corsHeaders, json } from "./utils.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const origin = request.headers.get("Origin") || "";

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders(origin),
          "Access-Control-Allow-Headers": "Content-Type, X-Admin-Secret",
        },
      });
    }

    // Simple health check
    if (path === "/" || path === "/api") {
      return json({ service: "coach-wilson-api", status: "ok" });
    }

    let response;

    try {
      if (path === "/api/signup" && request.method === "POST") {
        response = await handleSignup(request, env);
      } else if (path === "/api/login" && request.method === "POST") {
        response = await handleLogin(request, env);
      } else if (path === "/api/logout" && request.method === "POST") {
        response = await handleLogout(request);
      } else if (path === "/api/me" && request.method === "GET") {
        response = await handleMe(request, env);
      } else if (path === "/api/auth/google" && request.method === "GET") {
        response = await handleGoogleStart(request, env);
      } else if (path === "/api/auth/google/callback" && request.method === "GET") {
        response = await handleGoogleCallback(request, env);
      } else if (path === "/api/admin/users" && request.method === "GET") {
        response = await handleAdminUsers(request, env);
      } else if (path === "/api/admin/plan" && request.method === "POST") {
        response = await handleAdminSetPlan(request, env);
      } else if (path === "/api/admin/delete" && request.method === "POST") {
        response = await handleAdminDeleteUser(request, env);
      } else if (path === "/api/content" && request.method === "GET") {
        response = await handleGetContent(request, env);
      } else if (path === "/api/admin/content" && request.method === "GET") {
        response = await handleAdminGetContent(request, env);
      } else if (path === "/api/admin/content" && request.method === "PUT") {
        response = await handleAdminSaveContent(request, env);
      } else if (path === "/api/admin/media" && request.method === "POST") {
        response = await handleAdminUploadMedia(request, env);
      } else if (path === "/api/admin/media" && request.method === "DELETE") {
        response = await handleAdminDeleteMedia(request, env);
      } else if (path.startsWith("/api/media/") && request.method === "GET") {
        const keyPart = path.slice("/api/media/".length);
        response = await handleGetMedia(request, env, keyPart);
      } else {
        response = json({ error: "Não encontrado" }, 404);
      }
    } catch (err) {
      console.error(err);
      response = json({ error: "Erro interno do servidor" }, 500);
    }

    // Attach CORS headers to every response
    const headers = new Headers(response.headers);
    const cors = corsHeaders(origin);
    Object.entries(cors).forEach(([k, v]) => headers.set(k, v));
    headers.set("Access-Control-Allow-Headers", "Content-Type, X-Admin-Secret");

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  },
};
