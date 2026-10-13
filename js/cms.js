/* Coach Wilson — load CMS content onto the public site */
(function () {
  "use strict";

  const API_BASE =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:8787"
      : "https://coach-wilson-api.workersdevao.workers.dev";

  function setHtml(el, html) {
    if (!el || html == null || html === "") return;
    el.innerHTML = html;
  }

  function setText(el, text) {
    if (!el || text == null || text === "") return;
    el.textContent = text;
  }

  function setAll(selector, text, asHtml) {
    if (text == null || text === "") return;
    document.querySelectorAll(selector).forEach(function (el) {
      if (asHtml) setHtml(el, text);
      else setText(el, text);
    });
  }

  function applyPackage(id, pkg) {
    if (!pkg) return;
    const card = document.querySelector('[data-cms-package="' + id + '"]');
    if (!card) return;

    const nameEl = card.querySelector("[data-cms-name]");
    if (nameEl && pkg.name) setText(nameEl, pkg.name);

    const priceEl = card.querySelector("[data-cms-price]");
    if (priceEl && pkg.price) {
      const currency = pkg.currency || "Kz / mês";
      priceEl.innerHTML =
        escapeText(pkg.price) + " <span>" + escapeText(currency) + "</span>";
    }

    const descEl = card.querySelector("[data-cms-desc]");
    if (descEl && pkg.desc) setText(descEl, pkg.desc);

    const list = card.querySelector("[data-cms-features]");
    if (list && Array.isArray(pkg.features) && pkg.features.length) {
      list.innerHTML = pkg.features
        .map(function (f) {
          return "<li>" + escapeText(f) + "</li>";
        })
        .join("");
    }
  }

  function escapeText(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function applyContent(content) {
    if (!content) return;

    // Simple text/html fields via data-cms="key"
    var simple = [
      ["announce", true],
      ["hero_badge", false],
      ["hero_title", false],
      ["cta_start", false],
      ["cta_method", false],
      ["cta_start_arrow", false],
      ["servicos_title", false],
      ["diff_label", false],
      ["diff_title", false],
      ["diff_desc", false],
      ["port_title", false],
      ["pres_title", false],
      ["pres_desc", false],
      ["sob_consulta", false],
      ["quote_text", false],
      ["quote_author", false],
      ["pack_label", false],
      ["pack_title", false],
      ["pack_desc", false],
      ["popular_badge", false],
      ["pay_title", false],
      ["pay_note", false],
      ["final_title", false],
      ["final_desc", false],
      ["footer_tag", false],
      ["footer_location", false],
    ];

    simple.forEach(function (pair) {
      var key = pair[0];
      var asHtml = pair[1];
      if (content[key] == null || content[key] === "") return;
      setAll('[data-cms="' + key + '"]', content[key], asHtml);
    });

    // Services
    var services = content.services || {};
    Object.keys(services).forEach(function (k) {
      setAll('[data-cms="services.' + k + '"]', services[k], false);
    });

    // Diffs
    var diffs = content.diffs || {};
    Object.keys(diffs).forEach(function (k) {
      setAll('[data-cms="diffs.' + k + '"]', diffs[k], false);
    });

    // Presencial items
    var presencial = content.presencial || {};
    Object.keys(presencial).forEach(function (k) {
      setAll('[data-cms="presencial.' + k + '"]', presencial[k], false);
    });

    // Packages
    var packages = content.packages || {};
    applyPackage("bronze", packages.bronze);
    applyPackage("prata", packages.prata);
    applyPackage("ouro", packages.ouro);

    // Media URLs (only when set — otherwise keep static /images and /videos)
    var media = content.media || {};
    Object.keys(media).forEach(function (slot) {
      var url = media[slot];
      if (!url) return;
      document.querySelectorAll('[data-cms-media="' + slot + '"]').forEach(function (el) {
        var tag = el.tagName.toLowerCase();
        if (tag === "img") {
          el.src = url;
        } else if (tag === "source") {
          el.setAttribute("src", url);
          el.setAttribute("srcset", url);
          var parent = el.parentElement;
          if (parent && parent.tagName.toLowerCase() === "video") {
            try {
              parent.load();
            } catch (_) {}
          }
        } else if (tag === "video") {
          el.src = url;
          try {
            el.load();
          } catch (_) {}
        }
      });
      if (slot === "training_poster") {
        document.querySelectorAll("[data-cms-media-poster='training_poster']").forEach(function (el) {
          el.setAttribute("poster", url);
        });
      }
    });

    // Hero <picture>: if only JPG is set (no WebP), point the WebP <source> at the
    // same URL so browsers don't keep the static local .webp file.
    if (media.hero_image && !media.hero_image_webp) {
      document.querySelectorAll('[data-cms-media="hero_image_webp"]').forEach(function (el) {
        el.setAttribute("srcset", media.hero_image);
        el.removeAttribute("type"); // allow any format from Cloudinary
      });
    }
  }

  fetch(API_BASE + "/api/content", { method: "GET", credentials: "omit" })
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (data) {
      if (data && data.ok && data.content) applyContent(data.content);
    })
    .catch(function () {
      /* keep HTML defaults */
    });
})();
