/* Coach Wilson - Main JS */

(function () {
  "use strict";

  /* ---------- i18n ---------- */
  const translations = {
    pt: {
      announce: 'Programas online disponíveis · <strong>Vagas limitadas</strong>',
      "nav-inicio": "Início",
      "nav-servicos": "Serviços",
      "nav-metodo": "Método",
      "nav-portfolio": "Portfólio",
      "nav-presencial": "Presencial",
      "nav-programas": "Programas",
      "nav-contacto": "Contacto",
      "nav-entrar": "Entrar",
      "video-label": "Em ação",
      "video-title": "Treino · Disciplina · Resultados",
      "video-desc": "Corrida, força e intensidade — o padrão diário do Coach Wilson.",
      "hero-badge": "Acompanhamento Online Profissional",
      "hero-sub": "Hipertrofia · Emagrecimento · Performance · Qualidade de vida, onde quer que estejas.",
      "cta-start": "Quero começar",
      "cta-method": "O Método",
      "cta-start-arrow": "Quero começar →",
      "servicos-label": "",
      "servicos-title": "Constrói a mente. Constrói o corpo. Constrói a vida.",
      "servicos-desc": "",
      "serv-1-title": "Programas Online",
      "serv-1-desc": "Acompanhamento profissional completo, adaptado à tua rotina.",
      "serv-2-title": "Programas Presenciais",
      "serv-2-desc": "Treino e orientação presencial em Luanda.",
      "serv-3-title": "Palestras",
      "serv-3-desc": "Conteúdo de alta performance para eventos e empresas.",
      "serv-4-title": "Formações",
      "serv-4-desc": "Workshops e formações práticas de treino e mindset.",
      "serv-5-title": "Empresas & Ativações",
      "serv-5-desc": "Projetos corporativos e ativações de marca.",
      "pack-label": "Planos & Investimento",
      "pack-title": "Escolha o seu pacote",
      "pack-desc": "Um programa desenhado para entregar resultados mensuráveis com estrutura profissional e acompanhamento estratégico.",
      "bronze-desc": "Ideal para começar com orientação profissional",
      "bronze-1": "Videochamada inicial de avaliação",
      "bronze-2": "Definição de objetivos",
      "bronze-3": "Plano mensal de treino",
      "bronze-4": "Exercícios com vídeos explicativos",
      "bronze-5": "Acompanhamento quinzenal",
      "bronze-6": "Suporte via WhatsApp",
      "popular": "Popular",
      "prata-desc": "Maior personalização e evolução acelerada",
      "prata-1": "Tudo do pacote Bronze",
      "prata-2": "Plano 100% personalizado",
      "prata-3": "Atualização semanal do treino",
      "prata-4": "2 videochamadas por mês",
      "prata-5": "Correção técnica por vídeo",
      "prata-6": "Ajustes de cardio, carga e progressão",
      "prata-7": "Suporte prioritário",
      "ouro-desc": "Experiência completa de acompanhamento total",
      "ouro-1": "Consulta inicial aprofundada",
      "ouro-2": "Plano de treino 100% exclusivo",
      "ouro-3": "Nutrição base + macros",
      "ouro-4": "Ajustes alimentares semanais",
      "ouro-5": "4 videochamadas mensais",
      "ouro-6": "Feedback técnico ilimitado",
      "ouro-7": "Check-in semanal estratégico",
      "ouro-8": "Monitorização de peso, medidas e evolução",
      "ouro-9": "Estratégia de suplementação",
      "ouro-10": "Suporte prioritário diário",
      "pres-label": "Mais serviços",
      "pres-title": "Presencial, Palestras & Formações",
      "pres-desc": "Além do acompanhamento online, desenvolvemos programas presenciais, palestras e formações sob medida.",
      "pres-1-title": "Programas Presenciais",
      "pres-1-desc": "Treino e acompanhamento presencial em Luanda.",
      "pres-2-title": "Palestras",
      "pres-2-desc": "Conteúdo de performance, disciplina e mindset para eventos.",
      "pres-3-title": "Formações & Workshops",
      "pres-3-desc": "Formações práticas para grupos e empresas.",
      "pres-4-title": "Ativações & Empresas",
      "pres-4-desc": "Projetos de marca e ativações corporativas.",
      "sob-consulta": "Sob consulta",
      "port-label": "Portfólio",
      "port-title": "A experiência do Coach Wilson",
      "port-desc": "",
      "diff-label": "Diferencial",
      "diff-title": "Por que o método funciona",
      "diff-desc": "Não é apenas sobre treinar mais. É sobre treinar com inteligência, consistência e um sistema que evolui contigo a cada semana.",
      "diff-1-title": "Resultados Mensuráveis",
      "diff-1-desc": "Monitorização real da tua evolução mês a mês.",
      "diff-2-title": "Ajustes Inteligentes",
      "diff-2-desc": "O plano adapta-se a ti, não o contrário.",
      "diff-3-title": "Flexibilidade Total",
      "diff-3-desc": "Horários livres, treino adaptado à tua rotina.",
      "diff-4-title": "Acompanhamento Humano",
      "diff-4-desc": "Suporte real, estratégico e personalizado.",
      "pay-label": "Pagamento",
      "pay-title": "Formas de Pagamento",
      "pay-note": "Nota: Pagamento realizado antes do envio do plano mensal.",
      "final-title": "Pronto para a transformação?",
      "final-desc": "Responde com “Quero começar” e agendamos a tua videochamada de avaliação."
    },
    en: {
      announce: 'Online programs available · <strong>Limited spots</strong>',
      "nav-inicio": "Home",
      "nav-servicos": "Services",
      "nav-metodo": "Method",
      "nav-portfolio": "Portfolio",
      "nav-presencial": "In-Person",
      "nav-programas": "Programs",
      "nav-contacto": "Contact",
      "nav-entrar": "Log in",
      "video-label": "In action",
      "video-title": "Training · Discipline · Results",
      "video-desc": "Running, strength and intensity — Coach Wilson’s daily standard.",
      "hero-badge": "Professional Online Coaching",
      "hero-sub": "Hypertrophy · Fat Loss · Performance · Quality of life, wherever you are.",
      "cta-start": "I want to start",
      "cta-method": "The Method",
      "cta-start-arrow": "I want to start →",
      "servicos-label": "",
      "servicos-title": "Constrói a mente. Constrói o corpo. Constrói a vida.",
      "servicos-desc": "",
      "serv-1-title": "Online Programs",
      "serv-1-desc": "Complete professional coaching adapted to your routine.",
      "serv-2-title": "In-Person Programs",
      "serv-2-desc": "In-person training and guidance in Luanda.",
      "serv-3-title": "Talks",
      "serv-3-desc": "High-performance content for events and companies.",
      "serv-4-title": "Training",
      "serv-4-desc": "Practical workshops on training and mindset.",
      "serv-5-title": "Corporate & Activations",
      "serv-5-desc": "Corporate projects and brand activations.",
      "pack-label": "Plans & Investment",
      "pack-title": "Choose your package",
      "pack-desc": "A program designed to deliver measurable results with professional structure and strategic coaching.",
      "bronze-desc": "Ideal to start with professional guidance",
      "bronze-1": "Initial assessment video call",
      "bronze-2": "Goal setting",
      "bronze-3": "Monthly training plan",
      "bronze-4": "Exercises with explanatory videos",
      "bronze-5": "Bi-weekly follow-up",
      "bronze-6": "WhatsApp support",
      "popular": "Popular",
      "prata-desc": "Greater personalization and accelerated progress",
      "prata-1": "Everything in Bronze",
      "prata-2": "100% personalized plan",
      "prata-3": "Weekly training updates",
      "prata-4": "2 video calls per month",
      "prata-5": "Technical correction by video",
      "prata-6": "Cardio, load and progression adjustments",
      "prata-7": "Priority support",
      "ouro-desc": "Complete full-coaching experience",
      "ouro-1": "In-depth initial consultation",
      "ouro-2": "100% exclusive training plan",
      "ouro-3": "Base nutrition + macros",
      "ouro-4": "Weekly nutrition adjustments",
      "ouro-5": "4 video calls per month",
      "ouro-6": "Unlimited technical feedback",
      "ouro-7": "Weekly strategic check-in",
      "ouro-8": "Weight, measurements and progress tracking",
      "ouro-9": "Supplementation strategy",
      "ouro-10": "Daily priority support",
      "pres-label": "More services",
      "pres-title": "In-Person, Talks & Training",
      "pres-desc": "Beyond online coaching, we develop in-person programs, talks and custom training.",
      "pres-1-title": "In-Person Programs",
      "pres-1-desc": "In-person training and coaching in Luanda.",
      "pres-2-title": "Talks",
      "pres-2-desc": "Performance, discipline and mindset content for events.",
      "pres-3-title": "Training & Workshops",
      "pres-3-desc": "Practical training for groups and companies.",
      "pres-4-title": "Activations & Corporate",
      "pres-4-desc": "Brand projects and corporate activations.",
      "sob-consulta": "Upon request",
      "port-label": "Portfolio",
      "port-title": "The Coach Wilson experience",
      "port-desc": "",
      "diff-label": "Difference",
      "diff-title": "Why the method works",
      "diff-desc": "It’s not just about training more. It’s about training with intelligence, consistency and a system that evolves with you every week.",
      "diff-1-title": "Measurable Results",
      "diff-1-desc": "Real monitoring of your progress month after month.",
      "diff-2-title": "Smart Adjustments",
      "diff-2-desc": "The plan adapts to you, not the other way around.",
      "diff-3-title": "Full Flexibility",
      "diff-3-desc": "Free schedule, training adapted to your routine.",
      "diff-4-title": "Human Coaching",
      "diff-4-desc": "Real, strategic and personalized support.",
      "pay-label": "Payment",
      "pay-title": "Payment Methods",
      "pay-note": "Note: Payment is made before the monthly plan is sent.",
      "final-title": "Ready for the transformation?",
      "final-desc": "Reply with “I want to start” and we’ll schedule your assessment video call."
    }
  };

  let currentLang = "pt";

  function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    const dict = translations[lang];

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    // Update all lang toggle buttons
    const label = lang === "pt" ? "EN" : "PT";
    document.querySelectorAll(".lang-toggle").forEach((btn) => {
      btn.textContent = label;
    });
  }

  document.querySelectorAll(".lang-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      setLanguage(currentLang === "pt" ? "en" : "pt");
    });
  });

  /* ---------- Header scroll + Announce ---------- */
  const header = document.getElementById("header");
  const announce = document.getElementById("announce");
  let lastScroll = 0;

  function onScroll() {
    const scrollY = window.scrollY;

    if (header) {
      if (scrollY > 40) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    if (announce) {
      if (scrollY > 80 && scrollY > lastScroll) {
        announce.classList.add("hide");
        if (header) header.style.top = "0";
      } else if (scrollY < 40) {
        announce.classList.remove("hide");
        if (header) header.style.top = "";
      }
    }

    lastScroll = scrollY;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile Drawer ---------- */
  const hamburger = document.getElementById("hamburger");
  const drawer = document.getElementById("drawer");
  const overlay = document.getElementById("drawerOverlay");
  const drawerClose = document.getElementById("drawerClose");

  function openDrawer() {
    if (!drawer || !hamburger) return;
    drawer.classList.add("open");
    if (overlay) overlay.classList.add("open");
    hamburger.classList.add("open");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
  }

  function closeDrawer() {
    if (!drawer || !hamburger) return;
    drawer.style.transition = "";
    drawer.style.transform = "";
    if (overlay) overlay.style.opacity = "";
    drawer.classList.remove("open");
    if (overlay) overlay.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }

  if (hamburger && drawer) {
    hamburger.addEventListener("click", () => {
      if (drawer.classList.contains("open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  function bindClose(el) {
    if (!el) return;
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeDrawer();
    });
  }

  bindClose(drawerClose);
  bindClose(overlay);

  // Close drawer on nav link click
  if (drawer) {
    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeDrawer);
    });
  }

  /* ---------- Swipe to close drawer ---------- */
  let touchStartX = 0;
  let touchCurrentX = 0;
  let isDragging = false;

  if (drawer) {
    drawer.addEventListener(
      "touchstart",
      (e) => {
        if (!drawer.classList.contains("open")) return;
        if (e.target.closest("button, a")) return;
        touchStartX = e.changedTouches[0].clientX;
        touchCurrentX = touchStartX;
        isDragging = true;
        drawer.style.transition = "none";
      },
      { passive: true }
    );

    drawer.addEventListener(
      "touchmove",
      (e) => {
        if (!isDragging) return;
        touchCurrentX = e.changedTouches[0].clientX;
        const deltaX = touchCurrentX - touchStartX;
        if (deltaX < 0) {
          drawer.style.transform = `translateX(${deltaX}px)`;
          const progress = Math.min(Math.abs(deltaX) / 280, 1);
          if (overlay) overlay.style.opacity = String(1 - progress * 0.7);
        }
      },
      { passive: true }
    );

    drawer.addEventListener(
      "touchend",
      () => {
        if (!isDragging) return;
        isDragging = false;
        drawer.style.transition = "";
        if (overlay) overlay.style.opacity = "";

        const deltaX = touchCurrentX - touchStartX;
        if (deltaX < -80) {
          closeDrawer();
        }
        drawer.style.transform = "";
      },
      { passive: true }
    );
  }

  /* ---------- Force muted autoplay (Safari-safe) ---------- */
  function forceMutedAutoplay(video) {
    if (!video) return Promise.resolve();
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.playsInline = true;
    try {
      video.setAttribute("autoplay", "");
    } catch (e) { /* ignore */ }
    var p = video.play();
    if (p && typeof p.then === "function") {
      return p.catch(function () {
        return Promise.resolve();
      });
    }
    return Promise.resolve();
  }

  /* ---------- Hero video: load only on larger screens / when data allows ---------- */
  const heroVideo = document.getElementById("heroVideo");
  if (heroVideo) {
    const canPlayVideo =
      window.matchMedia("(min-width: 768px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !(navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || "")));

    if (canPlayVideo) {
      heroVideo.hidden = false;
      heroVideo.preload = "auto";
      const play = () => {
        forceMutedAutoplay(heroVideo);
      };
      if (heroVideo.readyState >= 2) {
        play();
      } else {
        heroVideo.addEventListener("loadeddata", play, { once: true });
        heroVideo.addEventListener("canplay", play, { once: true });
        heroVideo.load();
      }
      // Safari: retry after user gesture / page show
      document.addEventListener("touchstart", function once() {
        forceMutedAutoplay(heroVideo);
        document.removeEventListener("touchstart", once, true);
      }, { once: true, capture: true, passive: true });
      window.addEventListener("pageshow", play);
    }
  }

  /* ---------- Packages page: sticky mobile CTA ---------- */
  const mobileCtaBar = document.getElementById("mobileCtaBar");
  if (mobileCtaBar) {
    const packagesSection = document.querySelector(".packages-grid");
    if (packagesSection && "IntersectionObserver" in window) {
      document.body.classList.add("has-mobile-cta");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              mobileCtaBar.classList.add("visible");
              mobileCtaBar.setAttribute("aria-hidden", "false");
            } else if (entry.boundingClientRect.top > 0) {
              mobileCtaBar.classList.remove("visible");
              mobileCtaBar.setAttribute("aria-hidden", "true");
            }
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px -40% 0px" }
      );
      observer.observe(packagesSection);
    }
  }

  /* ---------- Feature video: custom play / pause only ---------- */
  const featureVideo = document.getElementById("featureVideo");
  const featureWrap = document.getElementById("featureVideoWrap");
  const featurePlayBtn = document.getElementById("featurePlayBtn");
  if (featureVideo && featureWrap && featurePlayBtn) {
    featureVideo.controls = false;
    featureVideo.muted = true;
    featureVideo.defaultMuted = true;
    featureVideo.volume = 0;
    featureVideo.loop = true;
    featureVideo.playsInline = true;
    featureVideo.setAttribute("muted", "");
    featureVideo.setAttribute("playsinline", "");
    featureVideo.setAttribute("webkit-playsinline", "");
    featureVideo.setAttribute("autoplay", "");

    function syncPlayUI() {
      if (featureVideo.paused) {
        featureWrap.classList.remove("is-playing");
        featurePlayBtn.setAttribute("aria-label", "Reproduzir");
      } else {
        featureWrap.classList.add("is-playing");
        featurePlayBtn.setAttribute("aria-label", "Pausar");
      }
    }

    function tryAutoplay() {
      forceMutedAutoplay(featureVideo).then(syncPlayUI);
      syncPlayUI();
    }

    function toggleFeatureVideo() {
      if (featureVideo.paused) {
        forceMutedAutoplay(featureVideo).then(syncPlayUI);
      } else {
        featureVideo.pause();
        syncPlayUI();
      }
    }

    featurePlayBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFeatureVideo();
    });
    featureWrap.addEventListener("click", () => {
      toggleFeatureVideo();
    });
    featureVideo.addEventListener("play", syncPlayUI);
    featureVideo.addEventListener("pause", syncPlayUI);
    featureVideo.addEventListener("loadeddata", tryAutoplay, { once: true });
    featureVideo.addEventListener("canplay", tryAutoplay, { once: true });

    // Autoplay when in view (muted + loop — Safari-safe)
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              tryAutoplay();
            } else {
              featureVideo.pause();
              syncPlayUI();
            }
          });
        },
        { threshold: 0.25 }
      );
      io.observe(featureWrap);
    } else {
      tryAutoplay();
    }

    // Safari: unlock on first touch / pageshow
    document.addEventListener("touchstart", function once() {
      tryAutoplay();
      document.removeEventListener("touchstart", once, true);
    }, { once: true, capture: true, passive: true });
    window.addEventListener("pageshow", tryAutoplay);

    tryAutoplay();
    syncPlayUI();
  }

  /* ---------- Portfolio carousel (videos) ---------- */
  const track = document.getElementById("carouselTrack");
  const btnPrev = document.getElementById("carouselPrev");
  const btnNext = document.getElementById("carouselNext");
  if (track && btnPrev && btnNext) {
    const videos = () => Array.from(track.querySelectorAll("video"));

    function slideAmount() {
      const slide = track.querySelector(".carousel-slide");
      if (!slide) return 280;
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.gap) || 14;
      return slide.getBoundingClientRect().width + gap;
    }

    function syncPlayState(v) {
      const slide = v.closest(".carousel-slide");
      if (!slide) return;
      if (v.paused) slide.classList.remove("is-playing");
      else slide.classList.add("is-playing");
    }

    // Inject centered play button on each slide + Safari first-frame fix
    videos().forEach((v) => {
      const slide = v.closest(".carousel-slide");
      if (!slide || slide.querySelector(".carousel-play")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "carousel-play";
      btn.setAttribute("aria-label", "Reproduzir vídeo");
      btn.innerHTML =
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
      slide.appendChild(btn);

      v.addEventListener("play", () => syncPlayState(v));
      v.addEventListener("pause", () => syncPlayState(v));
      v.addEventListener("ended", () => syncPlayState(v));

      // iOS Safari: poster attribute is the reliable preview.
      // Fallback: seek a bit after metadata loads (desktop / older Safari).
      v.muted = true;
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.setAttribute("webkit-playsinline", "");
      v.playsInline = true;
      if (!v.getAttribute("poster")) {
        const showFirstFrame = () => {
          try {
            if (v.readyState >= 2 && v.currentTime < 0.05) {
              v.currentTime = 0.1;
            }
          } catch (_) {}
        };
        v.addEventListener("loadeddata", showFirstFrame, { once: true });
        v.addEventListener("loadedmetadata", showFirstFrame, { once: true });
        if (v.readyState >= 1) showFirstFrame();
      }
    });

    function playVideo(v) {
      videos().forEach((other) => {
        if (other !== v) {
          other.pause();
          other.muted = true;
        }
      });
      // Safari-safe: start muted, unmute after playback begins
      v.muted = true;
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.setAttribute("webkit-playsinline", "");
      v.playsInline = true;
      const p = v.play();
      if (p && p.then) {
        p.then(() => {
          v.muted = false;
          v.removeAttribute("muted");
        }).catch(() => {
          v.muted = true;
        });
      }
    }

    // Click play button or video: play/pause
    track.addEventListener("click", (e) => {
      const playBtn = e.target.closest(".carousel-play");
      const v = playBtn
        ? playBtn.closest(".carousel-slide")?.querySelector("video")
        : e.target.closest("video");
      if (!v) return;
      e.preventDefault();
      e.stopPropagation();
      if (v.paused) playVideo(v);
      else v.pause();
    });

    function pauseOffscreen() {
      const trackRect = track.getBoundingClientRect();
      videos().forEach((v) => {
        const r = v.getBoundingClientRect();
        const visible =
          r.left < trackRect.right - 40 && r.right > trackRect.left + 40;
        if (!visible) v.pause();
      });
    }

    btnPrev.addEventListener("click", () => {
      track.scrollBy({ left: -slideAmount(), behavior: "smooth" });
      setTimeout(pauseOffscreen, 350);
    });
    btnNext.addEventListener("click", () => {
      track.scrollBy({ left: slideAmount(), behavior: "smooth" });
      setTimeout(pauseOffscreen, 350);
    });

    let scrollTimer = null;
    track.addEventListener(
      "scroll",
      () => {
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(pauseOffscreen, 120);
      },
      { passive: true }
    );

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) videos().forEach((v) => v.pause());
          });
        },
        { threshold: 0.15 }
      );
      io.observe(track);
    }

    videos().forEach((v) => {
      v.pause();
      v.muted = true;
      v.setAttribute("muted", "");
      v.removeAttribute("autoplay");
      syncPlayState(v);
    });
  }

  /* ---------- Session-aware nav (Entrar ↔ A minha conta) ---------- */
  (function updateAuthNav() {
    const API_BASE =
      location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8787"
        : "https://coach-wilson-api.workersdevao.workers.dev";

    function applyLoggedInNav() {
      document.querySelectorAll('a[href="login.html"], a[href="conta.html"]').forEach((a) => {
        // Skip primary buttons on login/signup forms
        if (a.classList.contains("btn-primary") || a.classList.contains("btn-block")) return;
        a.href = "conta.html";
        a.textContent = currentLang === "en" ? "My account" : "A minha conta";
        if (a.hasAttribute("data-i18n")) a.removeAttribute("data-i18n");
      });
    }

    // Optimistic UI from last successful session check
    try {
      if (localStorage.getItem("cw_logged_in") === "1") {
        applyLoggedInNav();
      }
    } catch (_) {}

    fetch(API_BASE + "/api/me", { method: "GET", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.ok && data.user) {
          try {
            localStorage.setItem("cw_logged_in", "1");
          } catch (_) {}
          applyLoggedInNav();
        } else {
          try {
            localStorage.removeItem("cw_logged_in");
          } catch (_) {}
        }
      })
      .catch(() => {});
  })();

})();
