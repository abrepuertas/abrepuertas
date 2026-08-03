(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navOverlay = document.querySelector(".nav-overlay");
  const header = document.querySelector(".site-header");
  const yearTarget = document.getElementById("year");
  const form = document.querySelector(".contact__form");
  const feedback = form?.querySelector(".contact__feedback");
  const successPanel = document.querySelector(".contact__success");
  const contactPanel = document.querySelector(".contact__panel");

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

  if (navOverlay) navOverlay.addEventListener("click", () => setMenu(false));

  if (header) {
    const handleScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
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
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = `#${entry.target.id}`;
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

  if (yearTarget) yearTarget.textContent = String(new Date().getFullYear());

  const revealTargets = document.querySelectorAll(
    ".path-card, .impact__points li, .process li, .safe__main, .safe__aside, .tenants__badge, .tenant-value__why, .tenant-value__includes, .pricing__bar, .diff__list li, .trust figure, .banner__inner, .contact__panel"
  );
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      { threshold: 0.12 }
    );
    revealTargets.forEach((el) => {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  const setRole = (rol) => {
    if (!form) return;
    const radio = form.querySelector(`input[name="rol"][value="${rol}"]`);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  const setInteres = (interes) => {
    if (!form || !interes) return;
    const radio = form.querySelector(`input[name="interes"][value="${interes}"]`);
    if (radio) radio.checked = true;
  };

  const syncFormExtras = () => {
    if (!form) return;
    const rol = form.querySelector('input[name="rol"]:checked')?.value || "propietario";
    form.querySelectorAll(".form-extra").forEach((block) => {
      const show = block.getAttribute("data-for") === rol;
      block.hidden = !show;
      block.querySelectorAll("input, textarea, select").forEach((input) => {
        if (input.name === "interes") return;
        if (!show) {
          if (input.type !== "radio" && input.type !== "checkbox") input.value = "";
        }
      });
    });
  };

  document.querySelectorAll("[data-rol]").forEach((el) => {
    el.addEventListener("click", () => {
      const rol = el.getAttribute("data-rol");
      const interes = el.getAttribute("data-interes");
      if (rol && rol !== "otra") setRole(rol);
      if (interes) setInteres(interes);
    });
  });

  if (form) {
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/xykrrrzw";

    form.querySelectorAll('input[name="rol"]').forEach((input) => {
      input.addEventListener("change", syncFormExtras);
    });
    syncFormExtras();

    form.querySelectorAll('a[href*="privacidad"]').forEach((link) => {
      link.addEventListener("click", (event) => event.stopPropagation());
    });

    const setFieldError = (field, message) => {
      const wrapper = field.closest(".field") || field.closest(".field--check");
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
      if (field.disabled || field.closest("[hidden]")) {
        setFieldError(field, "");
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

    const fields = form.querySelectorAll("input, textarea");
    fields.forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.closest(".field")?.classList.contains("has-error")) {
          validateField(field);
        }
      });
    });

    const showSuccess = () => {
      if (form) form.hidden = true;
      if (successPanel) {
        successPanel.hidden = false;
        successPanel.focus?.();
      }
      if (contactPanel) contactPanel.classList.add("is-success");
    };

    const showForm = () => {
      if (form) {
        form.hidden = false;
        form.reset();
        syncFormExtras();
      }
      if (successPanel) successPanel.hidden = true;
      if (contactPanel) contactPanel.classList.remove("is-success");
      if (feedback) {
        feedback.className = "contact__feedback";
        feedback.textContent = "";
      }
    };

    successPanel
      ?.querySelector(".contact__success-reset")
      ?.addEventListener("click", showForm);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      let firstInvalid = null;
      fields.forEach((field) => {
        if (field.name === "_gotcha" || field.type === "hidden") return;
        if (field.closest("[hidden]")) return;
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
          showSuccess();
          if (window.plausible) window.plausible("Formulario enviado");
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
