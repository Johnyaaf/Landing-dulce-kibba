// Espera a que el documento este listo antes de consultar elementos del DOM.
document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll('a[href^="#"]');
  const animatedElements = document.querySelectorAll(
    ".hero__content, .hero__media, .section__header, .product-card, .about__image-wrapper, .about__content, .review-card, .cta, .footer__brand, .footer__links"
  );
  const forms = document.querySelectorAll("form");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Menu responsive: abre, cierra y mantiene actualizado aria-expanded.
  function closeMenu() {
    if (!navToggle || !navMenu) return;

    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    if (!navToggle || !navMenu) return;

    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", toggleMenu);

    document.addEventListener("click", function (event) {
      const clickInsideMenu = navMenu.contains(event.target);
      const clickOnToggle = navToggle.contains(event.target);

      if (!clickInsideMenu && !clickOnToggle) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  // Scroll suave para enlaces internos del menu y botones que apunten a secciones.
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const targetElement = document.querySelector(targetId);

      if (!targetElement) return;

      event.preventDefault();
      closeMenu();

      const headerHeight = header ? header.offsetHeight : 0;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  });

  // Aparicion suave de elementos al entrar en pantalla.
  function prepareAnimatedElements() {
    animatedElements.forEach(function (element) {
      element.style.opacity = "0";
      element.style.transform = "translateY(24px)";
      element.style.transition = "opacity 600ms ease, transform 600ms ease";
      element.style.willChange = "opacity, transform";
    });
  }

  function showElement(element) {
    element.style.opacity = "1";
    element.style.transform = "translateY(0)";
    element.style.willChange = "auto";
  }

  if (animatedElements.length > 0) {
    if (prefersReducedMotion) {
      animatedElements.forEach(showElement);
    } else if ("IntersectionObserver" in window) {
      prepareAnimatedElements();

      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              showElement(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.16,
          rootMargin: "0px 0px -40px 0px",
        }
      );

      animatedElements.forEach(function (element) {
        observer.observe(element);
      });
    } else {
      animatedElements.forEach(showElement);
    }
  }

  // Pequeno efecto visual del header al hacer scroll.
  function updateHeaderShadow() {
    if (!header) return;

    if (window.scrollY > 12) {
      header.style.boxShadow = "0 10px 30px rgba(38, 31, 28, 0.08)";
    } else {
      header.style.boxShadow = "none";
    }
  }

  updateHeaderShadow();
  window.addEventListener("scroll", updateHeaderShadow, { passive: true });

  // Validaciones basicas para formularios, si se agrega alguno en el futuro.
  forms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      const requiredFields = form.querySelectorAll("[required]");
      let isValid = true;

      requiredFields.forEach(function (field) {
        const value = field.value.trim();
        const isEmail = field.type === "email";
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        field.classList.remove("is-invalid");

        if (!value || (isEmail && !emailPattern.test(value))) {
          isValid = false;
          field.classList.add("is-invalid");
          field.setAttribute("aria-invalid", "true");
        } else {
          field.setAttribute("aria-invalid", "false");
        }
      });

      if (!isValid) {
        event.preventDefault();
      }
    });
  });

  // Carrusel aislado para tarjetas de producto que lo declaren.
  document.querySelectorAll("[data-product-carousel]").forEach(function (carousel) {
    const images = carousel.querySelectorAll(".product-card__carousel-image");
    const dots = carousel.querySelectorAll("[data-carousel-dot]");
    const prevButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    let currentIndex = 0;

    function showSlide(index) {
      currentIndex = (index + images.length) % images.length;

      images.forEach(function (image, imageIndex) {
        image.classList.toggle("is-active", imageIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === currentIndex);
      });
    }

    if (images.length === 0) return;

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        showSlide(currentIndex - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        showSlide(currentIndex + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });
  });
});
