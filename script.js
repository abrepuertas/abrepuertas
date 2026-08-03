(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navOverlay = document.querySelector(".nav-overlay");
  const header = document.querySelector(".site-header");
  const yearTarget = document.getElementById("year");

  /* =========================
     MENÚ MÓVIL
     ========================= */

  const setMenu = (open) => {
    if (!menuButton || !siteNav) return;
    siteNav.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("has-open-menu", open);
    if (navOverlay) {
      navOverlay.classList.toggle("is-visible", open);
      navOverlay.toggleAttribute("hidden", !open);
    }
  };

  if (menuButton && siteNav) {
    menuButton.addEventListener("click", () => {
      const willOpen = !siteNav.classList.contains("is-open");
      setMenu(willOpen);
    });

    siteNav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        setMenu(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
        setMenu(false);
        menuButton.focus();
      }
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener("click", () => setMenu(false));
  }

  /* =========================
     HEADER STICKY
     ========================= */

  if (header) {
    const handleScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  /* =========================
     SCROLL-SPY DEL NAV
     ========================= */

  const navLinks = Array.from(
    document.querySelectorAll('.site-nav a[href^="#"]')
  );
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return null;
      const el = document.querySelector(id);
      return el ? { link, el } : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const setActive = (id) => {
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === id);
      });
    };
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(({ el }) => spy.observe(el));
  }

  /* =========================
     AÑO DEL FOOTER
     ========================= */

  if (yearTarget) {
    yearTarget.textContent = String(new Date().getFullYear());
  }

  /* =========================
     REVEAL ON SCROLL
     ========================= */

  const revealTargets = document.querySelectorAll(
    ".about__pillars li, .service-card, .differential__list li, .impact__grid article, .trust figure, .audience__media, .hero__commitment, .properties__grid > *"
  );
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (
    !reduceMotion &&
    "IntersectionObserver" in window &&
    revealTargets.length
  ) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    revealTargets.forEach((el) => {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  /* =========================
     FORMULARIO DE CONTACTO
     ========================= */

  const form = document.querySelector(".contact__form");
  const feedback = form?.querySelector(".contact__feedback");

  const setFieldError = (field, message) => {
    if (!field) return;
    const wrapper = field.closest(".field");
    if (!wrapper) return;
    let errorEl = wrapper.querySelector(".field-error");
    if (message) {
      wrapper.classList.add("has-error");
      if (!errorEl) {
        errorEl = document.createElement("p");
        errorEl.className = "field-error";
        wrapper.appendChild(errorEl);
      }
      errorEl.textContent = message;
      field.setAttribute("aria-invalid", "true");
    } else {
      wrapper.classList.remove("has-error");
      if (errorEl) errorEl.remove();
      field.removeAttribute("aria-invalid");
    }
  };

  const validateField = (field) => {
    if (!(field instanceof HTMLInputElement) && !(field instanceof HTMLTextAreaElement)) {
      return true;
    }
    if (field.type === "checkbox") {
      if (field.required && !field.checked) {
        setFieldError(field, "Necesitamos tu consentimiento.");
        return false;
      }
      setFieldError(field, "");
      return true;
    }
    if (field.required && field.value.trim() === "") {
      setFieldError(field, "Este campo es obligatorio.");
      return false;
    }
    if (field.type === "email" && field.value && !field.checkValidity()) {
      setFieldError(field, "Revisa el formato del email.");
      return false;
    }
    setFieldError(field, "");
    return true;
  };

  if (form) {
    const fields = form.querySelectorAll("input, textarea");
    fields.forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        const wrapper = field.closest(".field");
        if (wrapper && wrapper.classList.contains("has-error")) {
          validateField(field);
        }
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let firstInvalid = null;
      fields.forEach((field) => {
        const isValid = validateField(field);
        if (!isValid && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        if (feedback) {
          feedback.className = "contact__feedback is-error";
          feedback.textContent = "Revisa los campos marcados, por favor.";
        }
        firstInvalid.focus();
        return;
      }

      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.setAttribute("aria-disabled", "true");

      if (feedback) {
        feedback.className = "contact__feedback is-success";
        feedback.textContent =
          "¡Gracias! Hemos recibido tu mensaje y te responderemos en menos de 24 h.";
      }
      form.reset();

      setTimeout(() => {
        if (feedback) {
          feedback.className = "contact__feedback";
          feedback.textContent = "";
        }
        if (submitBtn) submitBtn.removeAttribute("aria-disabled");
      }, 7000);
    });
  }
})();
