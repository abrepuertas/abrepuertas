(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navOverlay = document.querySelector(".nav-overlay");
  const header = document.querySelector(".site-header");
  const yearTarget = document.getElementById("year");

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
      setMenu(!siteNav.classList.contains("is-open"));
    });

    siteNav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) setMenu(false);
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

  if (header) {
    const handleScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
  }

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
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((eventry) => {
          if (eventry.isIntersecting) {
            const id = `#${eventry.target.id}`;
            navLinks.forEach((link) => {
              link.classList.toggle("is-active", link.getAttribute("href") === id);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(({ el }) => spy.observe(el));
  }

  if (yearTarget) {
    yearTarget.textContent = String(new Date().getFullYear());
  }

  const revealTargets = document.querySelectorAll(
    ".model__grid article, .impact__points li, .service, .process li, .safe__main, .safe__aside, .tenants__badge, .tenant-value__why, .tenant-value__includes, .pricing__bar, .diff__list li, .banner__inner, .contact__form"
  );
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!reduceMotion && "IntersectionObserver" in window && revealTargets.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    revealTargets.forEach((el) => {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

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
    if (
      !(field instanceof HTMLInputElement) &&
      !(field instanceof HTMLTextAreaElement)
    ) {
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
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/xykrrrzw";
    const fields = form.querySelectorAll("input, textarea");

    form.querySelectorAll('a[href*="privacidad"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        event.stopPropagation();
      });
    });

    fields.forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.closest(".field")?.classList.contains("has-error")) {
          validateField(field);
        }
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      let firstInvalid = null;
      fields.forEach((field) => {
        if (field.name === "_gotcha" || field.type === "hidden") return;
        if (!validateField(field) && !firstInvalid) firstInvalid = field;
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
        feedback.className = "contact__feedback";
        feedback.textContent = "Enviando…";
      }

      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          form.reset();
          if (feedback) {
            feedback.className = "contact__feedback is-success";
            feedback.textContent =
              "¡Gracias! Hemos recibido tu mensaje y te responderemos pronto.";
          }
        } else {
          const data = await response.json().catch(() => null);
          const message =
            data?.errors?.map((e) => e.message).join(" ") ||
            "No se pudo enviar. Inténtalo de nuevo o escribe a luismi@abrepuertas.casa.";
          if (feedback) {
            feedback.className = "contact__feedback is-error";
            feedback.textContent = message;
          }
        }
      } catch {
        if (feedback) {
          feedback.className = "contact__feedback is-error";
          feedback.textContent =
            "No se pudo enviar. Revisa tu conexión o escribe a luismi@abrepuertas.casa.";
        }
      } finally {
        if (submitBtn) submitBtn.removeAttribute("aria-disabled");
      }
    });
  }
})();
