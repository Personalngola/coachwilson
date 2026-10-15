/* Coach Wilson - Auth (login / signup) */

(function () {
  "use strict";

  // Local → 127.0.0.1:8787 | Production → API Worker on workers.dev
  const API_BASE =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:8787"
      : "https://coachwilson-api.personalngola.workers.dev";

  function showError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
  }

  function hideError(el) {
    if (!el) return;
    el.hidden = true;
    el.textContent = "";
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? "Aguarde…" : btn.dataset.label || btn.textContent;
  }

  /* ---------- Password show / hide ---------- */
  document.querySelectorAll(".password-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-target");
      const input = id ? document.getElementById(id) : null;
      if (!input) return;

      const showing = input.type === "text";
      input.type = showing ? "password" : "text";

      const eye = btn.querySelector(".icon-eye");
      const eyeOff = btn.querySelector(".icon-eye-off");
      if (eye) eye.hidden = !showing;
      if (eyeOff) eyeOff.hidden = showing;

      btn.setAttribute(
        "aria-label",
        showing ? "Mostrar password" : "Ocultar password"
      );
      btn.setAttribute(
        "title",
        showing ? "Mostrar password" : "Ocultar password"
      );
    });
  });


  function qs(name) {
    try {
      return new URLSearchParams(window.location.search).get(name) || "";
    } catch {
      return "";
    }
  }

  function getPendingOrder() {
    try {
      return JSON.parse(sessionStorage.getItem("cw_pending_order") || "null");
    } catch {
      return null;
    }
  }

  function memberRedirect() {
    const pacote = (qs("pacote") || (getPendingOrder() && getPendingOrder().package) || "").toLowerCase();
    if (pacote && ["bronze", "prata", "ouro"].includes(pacote)) {
      return "conta.html?pacote=" + encodeURIComponent(pacote);
    }
    return "conta.html";
  }

  // Prefill signup from checkout query / pending order
  (function prefillFromCheckout() {
    const pending = getPendingOrder();
    const nameQ = qs("name") || (pending && pending.name) || "";
    const emailQ = qs("email") || (pending && pending.email) || "";
    const nameEl = document.getElementById("signupName");
    const emailEl = document.getElementById("signupEmail");
    if (nameEl && nameQ && !nameEl.value) nameEl.value = nameQ;
    if (emailEl && emailQ && !emailEl.value) emailEl.value = emailQ;

    // Optional note on signup page
    const pacote = (qs("pacote") || (pending && pending.package) || "").toLowerCase();
    const note = document.getElementById("signupPackageNote");
    if (note && pacote) {
      const labels = { bronze: "Bronze", prata: "Prata", ouro: "Ouro" };
      note.hidden = false;
      note.innerHTML =
        "Pacote seleccionado: <strong style=\"color: var(--gold);\">" +
        (labels[pacote] || pacote) +
        "</strong>. Após criar a conta, confirmamos o pagamento consigo.";
    }
  })();


  // Keep package in auth cross-links
  (function preservePackageLinks() {
    const pacote = (qs("pacote") || (getPendingOrder() && getPendingOrder().package) || "").toLowerCase();
    if (!pacote) return;
    document.querySelectorAll('a[href="login.html"], a[href="signup.html"]').forEach((a) => {
      const base = a.getAttribute("href");
      a.setAttribute("href", base + "?pacote=" + encodeURIComponent(pacote));
    });
  })();

  /* ---------- Login ---------- */
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const errorEl = document.getElementById("loginError");
    const btn = document.getElementById("loginBtn");
    if (btn) btn.dataset.label = "Entrar";

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideError(errorEl);

      const email = (emailInput.value || "").trim();
      const password = passwordInput.value || "";

      if (!email || !password) {
        showError(errorEl, "Preencha email e password.");
        return;
      }

      setLoading(btn, true);

      try {
        const res = await fetch(API_BASE + "/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          showError(errorEl, data.error || "Não foi possível entrar.");
          setLoading(btn, false);
          return;
        }

        try {
          localStorage.setItem("cw_logged_in", "1");
        } catch (_) {}
        // Success — member area (keep package from checkout if any)
        window.location.href = memberRedirect();
      } catch (err) {
        showError(errorEl, "Erro de ligação. Verifique se a API está a correr.");
        setLoading(btn, false);
      }
    });
  }

  /* ---------- Signup ---------- */
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    const nameInput = document.getElementById("signupName");
    const emailInput = document.getElementById("signupEmail");
    const passwordInput = document.getElementById("signupPassword");
    const password2Input = document.getElementById("signupPassword2");
    const errorEl = document.getElementById("signupError");
    const btn = document.getElementById("signupBtn");
    if (btn) btn.dataset.label = "Criar conta";

    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideError(errorEl);

      const name = (nameInput.value || "").trim();
      const email = (emailInput.value || "").trim();
      const password = passwordInput.value || "";
      const password2 = password2Input.value || "";

      if (!name || !email || !password) {
        showError(errorEl, "Preencha todos os campos obrigatórios.");
        return;
      }
      if (password.length < 6) {
        showError(errorEl, "A password deve ter pelo menos 6 caracteres.");
        return;
      }
      if (password !== password2) {
        showError(errorEl, "As passwords não coincidem.");
        return;
      }

      setLoading(btn, true);

      try {
        const res = await fetch(API_BASE + "/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          showError(errorEl, data.error || "Não foi possível criar a conta.");
          setLoading(btn, false);
          return;
        }

        try {
          localStorage.setItem("cw_logged_in", "1");
        } catch (_) {}
        // Success — member area (keep package from checkout if any)
        window.location.href = memberRedirect();
      } catch (err) {
        showError(errorEl, "Erro de ligação. Verifique se a API está a correr.");
        setLoading(btn, false);
      }
    });
  }

  /* ---------- Google OAuth ---------- */
  (function wireGoogleAuth() {
    const btn = document.getElementById("googleAuthBtn");
    if (!btn) return;

    // Surface errors from OAuth redirect (?error=)
    const errParam = qs("error");
    const errorEl =
      document.getElementById("loginError") ||
      document.getElementById("signupError");
    if (errParam && errorEl) {
      const messages = {
        google_not_configured: "Login com Google ainda não está configurado.",
        invalid_state: "Sessão inválida. Tente novamente.",
        token_exchange: "Não foi possível ligar à Google. Tente de novo.",
        profile: "Não foi possível obter o perfil Google.",
        missing_profile: "A conta Google não devolveu email.",
        access_denied: "Login com Google cancelado.",
      };
      showError(errorEl, messages[errParam] || ("Erro Google: " + errParam));
    }

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const pacote = (qs("pacote") || (getPendingOrder() && getPendingOrder().package) || "").toLowerCase();
      let returnPath = "/conta.html";
      if (pacote && ["bronze", "prata", "ouro"].includes(pacote)) {
        returnPath = "/conta.html?pacote=" + encodeURIComponent(pacote);
      }
      // Full-page redirect to API (sets cookie on shared domain)
      window.location.href =
        API_BASE +
        "/api/auth/google?return=" +
        encodeURIComponent(returnPath);
    });
  })();

})();
