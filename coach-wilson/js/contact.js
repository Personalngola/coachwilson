(function () {
  const form = document.getElementById("contactForm");
  const success = document.getElementById("contactSuccess");
  const errorEl = document.getElementById("contactError");
  const btn = document.getElementById("contactBtn");
  if (!form) return;

  // Optional: set your real inbox here so mailto works for the coach
  const CONTACT_EMAIL = "coach@wilsonbenjamim.com";

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = !msg;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    showError("");

    const name = (document.getElementById("contactName").value || "").trim();
    const email = (document.getElementById("contactEmail").value || "").trim();
    const phone = (document.getElementById("contactPhone").value || "").trim();
    const message = (document.getElementById("contactMessage").value || "").trim();

    if (!name || !email || !phone || !message) {
      showError("Preenche todos os campos.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Indica um email válido.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "A enviar…";

    const body = [
      "Novo contacto — Quero começar",
      "",
      "Nome: " + name,
      "Email: " + email,
      "Telefone / WhatsApp: " + phone,
      "",
      "Mensagem:",
      message,
    ].join("\n");

    // Persist briefly so admin/coach can still see last lead in this browser if needed
    try {
      sessionStorage.setItem(
        "cw_contact_lead",
        JSON.stringify({ name, email, phone, message, at: Date.now() })
      );
    } catch (_) {}

    // Open mail client with prefilled message (works offline, no backend required)
    const mailto =
      "mailto:" +
      encodeURIComponent(CONTACT_EMAIL) +
      "?subject=" +
      encodeURIComponent("Quero começar — " + name) +
      "&body=" +
      encodeURIComponent(body);

    try {
      window.location.href = mailto;
    } catch (_) {}

    // Show success UI
    form.hidden = true;
    if (success) success.hidden = false;
  });
})();
