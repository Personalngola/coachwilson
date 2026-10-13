/* Coach Wilson - Checkout only */

(function () {
  "use strict";

  const packages = {
    bronze: { name: "Bronze", price: "25.000 Kz / mês", priceRaw: 25000 },
    prata: { name: "Prata", price: "60.000 Kz / mês", priceRaw: 60000 },
    ouro: { name: "Ouro", price: "120.000 Kz / mês", priceRaw: 120000 }
  };

  let selected = null;

  const form = document.getElementById("checkoutForm");
  const formPackage = document.getElementById("formPackage");
  const submitBtn = document.getElementById("submitBtn");
  const formError = document.getElementById("formError");
  const summaryEmpty = document.getElementById("summaryEmpty");
  const summaryActive = document.getElementById("summaryActive");
  const summaryName = document.getElementById("summaryName");
  const summaryPrice = document.getElementById("summaryPrice");
  const successBlock = document.getElementById("checkoutSuccess");
  const successText = document.getElementById("successText");
  const checkoutGrid = document.getElementById("checkoutGrid");

  if (!form) return;

  function selectPackage(key) {
    if (!packages[key]) return;
    selected = key;

    formPackage.value = key;
    if (summaryEmpty) summaryEmpty.hidden = true;
    if (summaryActive) summaryActive.hidden = false;
    if (summaryName) summaryName.textContent = packages[key].name;
    if (summaryPrice) summaryPrice.textContent = packages[key].price;
    if (submitBtn) submitBtn.disabled = false;
    if (formError) formError.hidden = true;

    var summary = document.getElementById("checkoutSummary");
    if (summary) summary.classList.add("has-package");
  }

  // Pre-select from URL ?pacote=prata
  const params = new URLSearchParams(window.location.search);
  const pre = (params.get("pacote") || params.get("package") || "").toLowerCase();
  if (packages[pre]) {
    selectPackage(pre);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!selected) {
      if (formError) formError.hidden = false;
      return;
    }

    const name = document.getElementById("formName").value.trim();
    const email = document.getElementById("formEmail").value.trim();
    const age = document.getElementById("formAge").value.trim();
    const phone = document.getElementById("formPhone").value.trim();
    const goal = document.getElementById("formGoal").value;
    const payment = document.getElementById("formPayment").value;
    const message = document.getElementById("formMessage").value.trim();
    const pack = packages[selected];

    if (!payment) {
      if (formError) {
        formError.textContent = "Selecione um método de pagamento.";
        formError.hidden = false;
      }
      return;
    }

    const lines = [
      "Novo pedido - Coach Wilson",
      "",
      "Pacote: " + pack.name + " (" + pack.price + ")",
      "Nome: " + name,
      "Email: " + email,
      "Idade: " + age,
      "WhatsApp: " + phone,
      "Pagamento: " + payment
    ];
    if (goal) lines.push("Objetivo: " + goal);
    if (message) lines.push("Mensagem: " + message);

    const orderText = lines.join("\n");

    const order = {
      at: new Date().toISOString(),
      package: selected,
      packageName: pack.name,
      packagePrice: pack.price,
      name: name,
      email: email,
      age: age,
      phone: phone,
      goal: goal,
      payment: payment,
      message: message,
      orderText: orderText
    };

    try {
      const orders = JSON.parse(localStorage.getItem("cw_orders") || "[]");
      orders.push(order);
      localStorage.setItem("cw_orders", JSON.stringify(orders));
      sessionStorage.setItem("cw_pending_order", JSON.stringify(order));
    } catch (err) {
      /* ignore */
    }

    // Prefer account flow: logged-in → conta; otherwise → signup with package
    const API_BASE =
      location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8787"
        : "https://coach-wilson-api.workersdevao.workers.dev";

    async function goNext() {
      let loggedIn = false;
      try {
        const res = await fetch(API_BASE + "/api/me", {
          method: "GET",
          credentials: "include",
        });
        loggedIn = res.ok;
      } catch (e) {
        loggedIn = false;
      }

      const q = "pacote=" + encodeURIComponent(selected);
      if (loggedIn) {
        window.location.href = "conta.html?" + q;
        return;
      }
      window.location.href =
        "signup.html?" + q + "&email=" + encodeURIComponent(email) + "&name=" + encodeURIComponent(name);
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "A continuar…";
    }
    goNext();
  });
})();
