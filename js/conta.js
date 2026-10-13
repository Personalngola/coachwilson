/* Coach Wilson - Member area (conta) */

(function () {
  "use strict";

  const API_BASE =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:8787"
      : "https://coach-wilson-api.workersdevao.workers.dev";

  const loadingEl = document.getElementById("contaLoading");
  const contentEl = document.getElementById("contaContent");
  const errorEl = document.getElementById("contaError");
  const nameEl = document.getElementById("contaName");
  const emailEl = document.getElementById("contaEmail");
  const planEl = document.getElementById("contaPlan");
  const planTextEl = document.getElementById("contaPlanText");
  const logoutBtn = document.getElementById("logoutBtn");


  function showPendingPackage() {
    const pendingEl = document.getElementById("contaPending");
    const titleEl = document.getElementById("contaPendingTitle");
    const textEl = document.getElementById("contaPendingText");
    if (!pendingEl) return;

    let pacote = "";
    let pending = null;
    try {
      pacote = (new URLSearchParams(window.location.search).get("pacote") || "").toLowerCase();
    } catch (e) {}
    try {
      pending = JSON.parse(sessionStorage.getItem("cw_pending_order") || "null");
    } catch (e) {
      pending = null;
    }
    if (!pacote && pending && pending.package) pacote = String(pending.package).toLowerCase();
    if (!pacote || !["bronze", "prata", "ouro"].includes(pacote)) {
      pendingEl.hidden = true;
      return;
    }

    const labels = {
      bronze: { name: "Bronze", price: "25.000 Kz / mês" },
      prata: { name: "Prata", price: "60.000 Kz / mês" },
      ouro: { name: "Ouro", price: "120.000 Kz / mês" },
    };
    const info = labels[pacote];
    const price = (pending && pending.packagePrice) || info.price;
    const pay = pending && pending.payment ? pending.payment : null;

    if (titleEl) titleEl.textContent = "Pacote " + info.name;
    if (textEl) {
      textEl.textContent =
        price +
        (pay ? " · Pagamento preferido: " + pay : "") +
        ". Entramos em contacto para confirmar e indicar os detalhes do pagamento.";
    }
    pendingEl.hidden = false;
  }

  async function loadMe() {
    try {
      const res = await fetch(API_BASE + "/api/me", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        showError();
        return;
      }

      const data = await res.json();
      if (!data.ok || !data.user) {
        showError();
        return;
      }

      const u = data.user;
      try {
        localStorage.setItem("cw_logged_in", "1");
      } catch (_) {}
      if (nameEl) nameEl.textContent = u.name || "Membro";
      if (emailEl) emailEl.textContent = u.email || "—";
      const planLabel = (u.plan || "free").toUpperCase();
      if (planEl) planEl.textContent = planLabel;
      if (planTextEl) planTextEl.textContent = planLabel;

      if (loadingEl) loadingEl.hidden = true;
      if (contentEl) contentEl.hidden = false;
      showPendingPackage();
    } catch (err) {
      showError();
    }
  }

  function showError() {
    if (loadingEl) loadingEl.hidden = true;
    if (contentEl) contentEl.hidden = true;
    if (errorEl) errorEl.hidden = false;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await fetch(API_BASE + "/api/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (e) {
        /* ignore */
      }
      try {
        localStorage.removeItem("cw_logged_in");
      } catch (_) {}
      window.location.href = "login.html";
    });
  }

  loadMe();
})();
