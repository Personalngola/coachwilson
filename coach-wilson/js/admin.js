/* Coach Wilson - Admin panel */

(function () {
  "use strict";

  const API_BASE =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:8787"
      : "https://coachwilson-api.personalngola.workers.dev";

  const STORAGE_KEY = "cw_admin_secret";

  const gateEl = document.getElementById("adminGate");
  const panelEl = document.getElementById("adminPanel");
  const gateForm = document.getElementById("adminLoginForm");
  const gateError = document.getElementById("adminGateError");
  const adminError = document.getElementById("adminError");
  const totalEl = document.getElementById("adminTotal");
  const tbody = document.getElementById("adminTableBody");
  const emptyEl = document.getElementById("adminEmpty");
  const refreshBtn = document.getElementById("adminRefresh");
  const logoutBtn = document.getElementById("adminLogout");
  const searchInput = document.getElementById("adminSearch");
  const searchClear = document.getElementById("adminSearchClear");
  let cachedUsers = [];


  function getSecret() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) || "";
    } catch {
      return "";
    }
  }

  function setSecret(value) {
    try {
      sessionStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }

  function clearSecret() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  function showGate() {
    if (gateEl) gateEl.hidden = false;
    if (panelEl) panelEl.hidden = true;
  }

  function showPanel() {
    if (gateEl) gateEl.hidden = true;
    if (panelEl) panelEl.hidden = false;
  }

  function formatDate(iso) {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("pt-AO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  }

  async function loadUsers() {
    const secret = getSecret();
    if (!secret) {
      showGate();
      return;
    }

    // Keep panel visible while restoring session (avoids login flash on reload)
    showPanel();

    if (adminError) {
      adminError.hidden = true;
      adminError.textContent = "";
    }

    try {
      const res = await fetch(API_BASE + "/api/admin/users", {
        method: "GET",
        headers: { "X-Admin-Secret": secret },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          clearSecret();
          showGate();
          if (gateError) {
            gateError.textContent = data.error || "Password incorrecta";
            gateError.hidden = false;
          }
          return;
        }
        if (adminError) {
          adminError.textContent = data.error || "Erro ao carregar utilizadores";
          adminError.hidden = false;
        }
        return;
      }

      cachedUsers = data.users || [];
      if (totalEl) totalEl.textContent = String(data.total != null ? data.total : cachedUsers.length);
      renderUsers(cachedUsers);
    } catch (err) {
      if (adminError) {
        adminError.textContent = "Erro de ligação à API.";
        adminError.hidden = false;
      }
    }
  }


  function renderUsers(users) {
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!users.length) {
      if (emptyEl) {
        emptyEl.hidden = false;
        emptyEl.textContent = cachedUsers.length
          ? "Nenhum utilizador corresponde à pesquisa."
          : "Ainda não há utilizadores registados.";
      }
      return;
    }
    if (emptyEl) emptyEl.hidden = true;

    users.forEach((u) => {
      const tr = document.createElement("tr");
      const plan = (u.plan || "free").toLowerCase();

      tr.innerHTML =
        "<td>" +
        escapeHtml(u.name || "—") +
        "</td>" +
        "<td>" +
        escapeHtml(u.email || "—") +
        "</td>" +
        "<td><span class=\"admin-plan-badge\">" +
        escapeHtml(plan.toUpperCase()) +
        "</span></td>" +
        "<td>" +
        escapeHtml(formatDate(u.created_at)) +
        "</td>" +
        "<td>" +
        '<div class="admin-actions">' +
        '<select class="admin-plan-select" data-email="' +
        escapeAttr(u.email) +
        '">' +
        option("free", plan) +
        option("bronze", plan) +
        option("prata", plan) +
        option("ouro", plan) +
        "</select>" +
        '<button type="button" class="admin-delete-btn" data-email="' +
        escapeAttr(u.email) +
        '" data-name="' +
        escapeAttr(u.name || u.email || "") +
        '">Apagar</button>' +
        "</div>" +
        "</td>";

      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".admin-plan-select").forEach((sel) => {
      sel.addEventListener("change", () => onPlanChange(sel));
    });
    tbody.querySelectorAll(".admin-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => onDeleteUser(btn));
    });
  }

  function filterUsers() {
    const q = (searchInput && searchInput.value || "").trim().toLowerCase();
    if (searchClear) searchClear.hidden = !q;
    if (!q) {
      renderUsers(cachedUsers);
      if (totalEl) totalEl.textContent = String(cachedUsers.length);
      return;
    }
    const filtered = cachedUsers.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const plan = (u.plan || "").toLowerCase();
      return name.includes(q) || email.includes(q) || plan.includes(q);
    });
    if (totalEl) totalEl.textContent = filtered.length + " / " + cachedUsers.length;
    renderUsers(filtered);
  }

  function option(value, current) {
    const selected = value === current ? " selected" : "";
    return (
      '<option value="' + value + '"' + selected + ">" + value + "</option>"
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  async function onPlanChange(sel) {
    const email = sel.getAttribute("data-email");
    const plan = sel.value;
    const secret = getSecret();
    if (!email || !secret) return;

    sel.disabled = true;
    try {
      const res = await fetch(API_BASE + "/api/admin/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Secret": secret,
        },
        credentials: "include",
        body: JSON.stringify({ email, plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Não foi possível actualizar o plano");
        await loadUsers();
        return;
      }
      const badge = sel.closest("tr") && sel.closest("tr").querySelector(".admin-plan-badge");
      if (badge) badge.textContent = plan.toUpperCase();
    } catch {
      alert("Erro de ligação");
      await loadUsers();
    } finally {
      sel.disabled = false;
    }
  }

  /* ---------- Custom delete modal ---------- */
  const deleteModal = document.getElementById("adminDeleteModal");
  const deleteNameEl = document.getElementById("adminDeleteName");
  const deleteEmailEl = document.getElementById("adminDeleteEmail");
  const deleteConfirmBtn = document.getElementById("adminDeleteConfirm");
  let pendingDelete = null;

  function openDeleteModal(email, name, triggerBtn) {
    pendingDelete = { email, name, triggerBtn };
    if (deleteNameEl) deleteNameEl.textContent = name || email;
    if (deleteEmailEl) deleteEmailEl.textContent = email;
    if (deleteConfirmBtn) {
      deleteConfirmBtn.disabled = false;
      deleteConfirmBtn.textContent = "Apagar";
    }
    if (deleteModal) {
      deleteModal.hidden = false;
      document.body.classList.add("admin-modal-open");
      if (deleteConfirmBtn) deleteConfirmBtn.focus();
    }
  }

  function closeDeleteModal() {
    pendingDelete = null;
    if (deleteModal) deleteModal.hidden = true;
    document.body.classList.remove("admin-modal-open");
  }

  async function executeDelete() {
    if (!pendingDelete) return;
    const { email, triggerBtn } = pendingDelete;
    const secret = getSecret();
    if (!email || !secret) {
      closeDeleteModal();
      return;
    }

    if (deleteConfirmBtn) {
      deleteConfirmBtn.disabled = true;
      deleteConfirmBtn.textContent = "A apagar…";
    }
    if (triggerBtn) triggerBtn.disabled = true;

    try {
      const res = await fetch(API_BASE + "/api/admin/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Secret": secret,
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        closeDeleteModal();
        if (adminError) {
          adminError.textContent = data.error || "Não foi possível apagar o utilizador";
          adminError.hidden = false;
        }
        if (triggerBtn) triggerBtn.disabled = false;
        return;
      }
      closeDeleteModal();
      await loadUsers();
    } catch {
      closeDeleteModal();
      if (adminError) {
        adminError.textContent = "Erro de ligação";
        adminError.hidden = false;
      }
      if (triggerBtn) triggerBtn.disabled = false;
    }
  }

  function onDeleteUser(btn) {
    const email = btn.getAttribute("data-email");
    const name = btn.getAttribute("data-name") || email;
    const secret = getSecret();
    if (!email || !secret) return;
    openDeleteModal(email, name, btn);
  }

  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener("click", () => executeDelete());
  }
  if (deleteModal) {
    deleteModal.querySelectorAll("[data-close-modal]").forEach((el) => {
      el.addEventListener("click", () => closeDeleteModal());
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && deleteModal && !deleteModal.hidden) {
      closeDeleteModal();
    }
  });

  /* Password toggle on gate */
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
    });
  });

  if (gateForm) {
    gateForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (gateError) gateError.hidden = true;
      const input = document.getElementById("adminSecret");
      const value = (input && input.value) || "";
      if (!value) return;
      setSecret(value);
      await loadUsers();
    });
  }


  if (searchInput) {
    searchInput.addEventListener("input", () => filterUsers());
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        filterUsers();
        searchInput.blur();
      }
    });
  }
  if (searchClear) {
    searchClear.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      filterUsers();
      if (searchInput) searchInput.focus();
    });
  }

  /* ---------- Tabs ---------- */
  const tabUsers = document.getElementById("adminTabUsers");
  const tabContent = document.getElementById("adminTabContent");
  let activeTab = "users";

  document.querySelectorAll(".admin-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      activeTab = tab;
      document.querySelectorAll(".admin-tab").forEach((b) => {
        const on = b.getAttribute("data-tab") === tab;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      if (tabUsers) tabUsers.hidden = tab !== "users";
      if (tabContent) tabContent.hidden = tab !== "content";
      if (tab === "content") loadContent();
    });
  });

  /* ---------- CMS content ---------- */
  const contentForm = document.getElementById("contentForm");
  const contentError = document.getElementById("contentError");
  const contentSuccess = document.getElementById("contentSuccess");
  const contentSaveBtn = document.getElementById("contentSaveBtn");
  const contentUpdatedAt = document.getElementById("contentUpdatedAt");

  function setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value != null ? value : "";
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function fillContentForm(content) {
    if (!content) return;
    setVal("cmsAnnounce", content.announce);
    setVal("cmsHeroBadge", content.hero_badge);
    setVal("cmsHeroTitle", content.hero_title);
    setVal("cmsCtaStart", content.cta_start);
    setVal("cmsCtaMethod", content.cta_method);
    setVal("cmsCtaStartArrow", content.cta_start_arrow);

    setVal("cmsServicosTitle", content.servicos_title);
    const services = content.services || {};
    setVal("cmsS1Title", services.s1_title);
    setVal("cmsS1Desc", services.s1_desc);
    setVal("cmsS2Title", services.s2_title);
    setVal("cmsS2Desc", services.s2_desc);
    setVal("cmsS3Title", services.s3_title);
    setVal("cmsS3Desc", services.s3_desc);
    setVal("cmsS4Title", services.s4_title);
    setVal("cmsS4Desc", services.s4_desc);
    setVal("cmsS5Title", services.s5_title);
    setVal("cmsS5Desc", services.s5_desc);

    setVal("cmsDiffLabel", content.diff_label);
    setVal("cmsDiffTitle", content.diff_title);
    setVal("cmsDiffDesc", content.diff_desc);
    const diffs = content.diffs || {};
    setVal("cmsD1Title", diffs.d1_title);
    setVal("cmsD1Desc", diffs.d1_desc);
    setVal("cmsD2Title", diffs.d2_title);
    setVal("cmsD2Desc", diffs.d2_desc);
    setVal("cmsD3Title", diffs.d3_title);
    setVal("cmsD3Desc", diffs.d3_desc);
    setVal("cmsD4Title", diffs.d4_title);
    setVal("cmsD4Desc", diffs.d4_desc);

    setVal("cmsPortTitle", content.port_title);

    setVal("cmsPresTitle", content.pres_title);
    setVal("cmsPresDesc", content.pres_desc);
    setVal("cmsSobConsulta", content.sob_consulta);
    const presencial = content.presencial || {};
    setVal("cmsP1Title", presencial.p1_title);
    setVal("cmsP1Desc", presencial.p1_desc);
    setVal("cmsP2Title", presencial.p2_title);
    setVal("cmsP2Desc", presencial.p2_desc);
    setVal("cmsP3Title", presencial.p3_title);
    setVal("cmsP3Desc", presencial.p3_desc);
    setVal("cmsP4Title", presencial.p4_title);
    setVal("cmsP4Desc", presencial.p4_desc);

    setVal("cmsQuoteText", content.quote_text);
    setVal("cmsQuoteAuthor", content.quote_author);

    setVal("cmsPackLabel", content.pack_label);
    setVal("cmsPackTitle", content.pack_title);
    setVal("cmsPackDesc", content.pack_desc);
    setVal("cmsPopularBadge", content.popular_badge);

    const pkgs = content.packages || {};
    ["bronze", "prata", "ouro"].forEach((key) => {
      const p = pkgs[key] || {};
      const cap = key.charAt(0).toUpperCase() + key.slice(1);
      setVal("cms" + cap + "Price", p.price);
      setVal("cms" + cap + "Currency", p.currency);
      setVal("cms" + cap + "Desc", p.desc);
      const feats = Array.isArray(p.features) ? p.features.join("\n") : p.features || "";
      setVal("cms" + cap + "Features", feats);
    });

    setVal("cmsPayTitle", content.pay_title);
    setVal("cmsPayNote", content.pay_note);
    setVal("cmsFinalTitle", content.final_title);
    setVal("cmsFinalDesc", content.final_desc);
    setVal("cmsFooterTag", content.footer_tag);
    setVal("cmsFooterLocation", content.footer_location);

    const media = content.media || {};
    [
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
    ].forEach((slot) => {
      setVal("cmsMedia_" + slot, media[slot] || "");
    });
  }

  function collectContentForm() {
    function pkg(key) {
      const cap = key.charAt(0).toUpperCase() + key.slice(1);
      return {
        name: cap,
        price: getVal("cms" + cap + "Price"),
        currency: getVal("cms" + cap + "Currency") || "Kz / mês",
        desc: getVal("cms" + cap + "Desc"),
        features: getVal("cms" + cap + "Features")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };
    }
    return {
      announce: getVal("cmsAnnounce"),
      hero_badge: getVal("cmsHeroBadge"),
      hero_title: getVal("cmsHeroTitle"),
      cta_start: getVal("cmsCtaStart"),
      cta_method: getVal("cmsCtaMethod"),
      cta_start_arrow: getVal("cmsCtaStartArrow"),
      servicos_title: getVal("cmsServicosTitle"),
      services: {
        s1_title: getVal("cmsS1Title"),
        s1_desc: getVal("cmsS1Desc"),
        s2_title: getVal("cmsS2Title"),
        s2_desc: getVal("cmsS2Desc"),
        s3_title: getVal("cmsS3Title"),
        s3_desc: getVal("cmsS3Desc"),
        s4_title: getVal("cmsS4Title"),
        s4_desc: getVal("cmsS4Desc"),
        s5_title: getVal("cmsS5Title"),
        s5_desc: getVal("cmsS5Desc"),
      },
      diff_label: getVal("cmsDiffLabel"),
      diff_title: getVal("cmsDiffTitle"),
      diff_desc: getVal("cmsDiffDesc"),
      diffs: {
        d1_title: getVal("cmsD1Title"),
        d1_desc: getVal("cmsD1Desc"),
        d2_title: getVal("cmsD2Title"),
        d2_desc: getVal("cmsD2Desc"),
        d3_title: getVal("cmsD3Title"),
        d3_desc: getVal("cmsD3Desc"),
        d4_title: getVal("cmsD4Title"),
        d4_desc: getVal("cmsD4Desc"),
      },
      port_title: getVal("cmsPortTitle"),
      pres_title: getVal("cmsPresTitle"),
      pres_desc: getVal("cmsPresDesc"),
      sob_consulta: getVal("cmsSobConsulta"),
      presencial: {
        p1_title: getVal("cmsP1Title"),
        p1_desc: getVal("cmsP1Desc"),
        p2_title: getVal("cmsP2Title"),
        p2_desc: getVal("cmsP2Desc"),
        p3_title: getVal("cmsP3Title"),
        p3_desc: getVal("cmsP3Desc"),
        p4_title: getVal("cmsP4Title"),
        p4_desc: getVal("cmsP4Desc"),
      },
      quote_text: getVal("cmsQuoteText"),
      quote_author: getVal("cmsQuoteAuthor"),
      pack_label: getVal("cmsPackLabel"),
      pack_title: getVal("cmsPackTitle"),
      pack_desc: getVal("cmsPackDesc"),
      popular_badge: getVal("cmsPopularBadge"),
      packages: {
        bronze: pkg("bronze"),
        prata: pkg("prata"),
        ouro: pkg("ouro"),
      },
      pay_title: getVal("cmsPayTitle"),
      pay_note: getVal("cmsPayNote"),
      final_title: getVal("cmsFinalTitle"),
      final_desc: getVal("cmsFinalDesc"),
      footer_tag: getVal("cmsFooterTag"),
      footer_location: getVal("cmsFooterLocation"),
      media: {
        hero_image: getVal("cmsMedia_hero_image"),
        hero_image_webp: getVal("cmsMedia_hero_image_webp"),
        training_video: getVal("cmsMedia_training_video"),
        training_poster: getVal("cmsMedia_training_poster"),
        quote_image: getVal("cmsMedia_quote_image"),
        cta_image: getVal("cmsMedia_cta_image"),
        carousel_1: getVal("cmsMedia_carousel_1"),
        carousel_2: getVal("cmsMedia_carousel_2"),
        carousel_3: getVal("cmsMedia_carousel_3"),
        carousel_4: getVal("cmsMedia_carousel_4"),
        carousel_5: getVal("cmsMedia_carousel_5"),
      },
    };
  }

  async function loadContent() {
    const secret = getSecret();
    if (!secret) return;
    if (contentError) {
      contentError.hidden = true;
      contentError.textContent = "";
    }
    try {
      const res = await fetch(API_BASE + "/api/admin/content", {
        method: "GET",
        headers: { "X-Admin-Secret": secret },
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          clearSecret();
          showGate();
          return;
        }
        if (contentError) {
          contentError.textContent = data.error || "Erro ao carregar conteúdo";
          contentError.hidden = false;
        }
        return;
      }
      fillContentForm(data.content);
      if (contentUpdatedAt) {
        contentUpdatedAt.textContent = data.updated_at
          ? "Última actualização: " + formatDate(data.updated_at) + " · fonte: " + (data.source || "—")
          : "Ainda não guardado — a mostrar valores por defeito.";
      }
    } catch (err) {
      if (contentError) {
        contentError.textContent = "Erro de ligação à API.";
        contentError.hidden = false;
      }
    }
  }

  if (contentForm) {
    contentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const secret = getSecret();
      if (!secret) {
        showGate();
        return;
      }
      if (contentError) contentError.hidden = true;
      if (contentSuccess) contentSuccess.hidden = true;
      if (contentSaveBtn) {
        contentSaveBtn.disabled = true;
        contentSaveBtn.textContent = "A guardar…";
      }
      try {
        const res = await fetch(API_BASE + "/api/admin/content", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Admin-Secret": secret,
          },
          credentials: "include",
          body: JSON.stringify({ content: collectContentForm() }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (contentError) {
            contentError.textContent = data.error || "Não foi possível guardar";
            contentError.hidden = false;
          }
        } else {
          fillContentForm(data.content);
          if (contentSuccess) {
            contentSuccess.textContent = "Conteúdo guardado. O site público usa estes textos e media.";
            contentSuccess.hidden = false;
          }
          if (contentUpdatedAt && data.updated_at) {
            contentUpdatedAt.textContent =
              "Última actualização: " + formatDate(data.updated_at) + " · fonte: db";
          }
        }
      } catch (err) {
        if (contentError) {
          contentError.textContent = "Erro de ligação à API.";
          contentError.hidden = false;
        }
      }
      if (contentSaveBtn) {
        contentSaveBtn.disabled = false;
        contentSaveBtn.textContent = "Guardar conteúdo";
      }
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      if (activeTab === "content") loadContent();
      else loadUsers();
    });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearSecret();
      showGate();
      const input = document.getElementById("adminSecret");
      if (input) input.value = "";
    });
  }

  /* ---------- Media uploads (Cloudinary via API) ---------- */
  async function uploadMediaSlot(slot, file) {
    const secret = getSecret();
    if (!secret) {
      showGate();
      return;
    }
    const statusEl = document.getElementById("cmsStatus_" + slot);
    if (statusEl) statusEl.textContent = "A enviar…";
    const fd = new FormData();
    fd.append("slot", slot);
    fd.append("file", file);
    try {
      const res = await fetch(API_BASE + "/api/admin/media", {
        method: "POST",
        headers: { "X-Admin-Secret": secret },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data.error ||
          (res.status === 413
            ? "Ficheiro demasiado grande"
            : res.status === 503
              ? "Cloudinary não configurado no servidor"
              : "Falha no envio (" + res.status + ")");
        if (statusEl) statusEl.textContent = msg;
        return;
      }
      setVal("cmsMedia_" + slot, data.url || "");
      if (statusEl) statusEl.textContent = "Carregado — clique Guardar conteúdo";
    } catch (err) {
      console.error("Upload media failed", err);
      if (statusEl) {
        statusEl.textContent =
          "Erro de ligação — verifique a rede ou se a API está online";
      }
    }
  }

  document.querySelectorAll(".cms-upload-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slot = btn.getAttribute("data-slot");
      const input = document.getElementById("cmsFile_" + slot);
      if (input) input.click();
    });
  });

  [
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
  ].forEach((slot) => {
    const input = document.getElementById("cmsFile_" + slot);
    if (!input) return;
    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (file) uploadMediaSlot(slot, file);
      input.value = "";
    });
  });

  // Auto-enter if secret already in session — show panel immediately to avoid flash of login gate on reload
  if (getSecret()) {
    showPanel();
    loadUsers();
  }
})();
