// Numero de WhatsApp usado para el boton "Enviar opinion" (formato internacional, sin +).
const WHATSAPP_NUMBER = "56990132040";

// Espera a que el documento este listo antes de consultar elementos del DOM.
document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll('a[href^="#"]');
  const animatedElements = document.querySelectorAll(
    ".hero__content, .hero__media, .section__header, .product-card, .about__image-wrapper, .about__content, .review-form-card, .reviews__carousel, .whatsapp-proof__frame, .cta, .footer__brand, .footer__links"
  );
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

      // El header es "#inicio" y es position:sticky, asi que su getBoundingClientRect().top
      // siempre da ~0 una vez pegado arriba (sin importar el scroll real). Por eso se trata
      // aparte: ir directo al top en vez de calcular un offset relativo que nunca llega a 0.
      if (targetId === "#inicio") {
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
        return;
      }

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

  // Carrusel reutilizable: sirve tanto para carruseles de imagenes (product-card__carousel-image)
  // como para carruseles de contenido generico marcado con [data-carousel-slide] (ej. testimonios).
  document.querySelectorAll("[data-product-carousel]").forEach(function (carousel) {
    const slides = carousel.querySelectorAll(".product-card__carousel-image, [data-carousel-slide]");
    const dots = carousel.querySelectorAll("[data-carousel-dot]");
    const interval = Number(carousel.dataset.carouselInterval) || 2000;
    let currentIndex = 0;
    let autoPlayTimer;

    function showSlide(index) {
      currentIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === currentIndex);
      });
    }

    if (slides.length === 0) return;

    function startAutoPlay() {
      if (prefersReducedMotion || slides.length <= 1) return;

      stopAutoPlay();
      autoPlayTimer = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, interval);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        window.clearInterval(autoPlayTimer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        startAutoPlay();
      });
    });

    carousel.addEventListener("mouseenter", stopAutoPlay);
    carousel.addEventListener("mouseleave", startAutoPlay);
    carousel.addEventListener("focusin", stopAutoPlay);
    carousel.addEventListener("focusout", startAutoPlay);
    carousel.addEventListener("touchstart", stopAutoPlay, { passive: true });
    carousel.addEventListener("touchend", startAutoPlay);

    startAutoPlay();
  });

  // Formulario "Dejanos tu opinion": no hay backend, asi que arma un link de WhatsApp
  // con el nombre y la opinion del cliente y lo abre en una pestana nueva.
  const reviewForm = document.getElementById("review-form");

  if (reviewForm) {
    const nameField = document.getElementById("review-name");
    const textField = document.getElementById("review-text");
    const errorMessage = document.getElementById("review-form-error");

    reviewForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = nameField.value.trim();
      const text = textField.value.trim();

      if (!name || !text) {
        errorMessage.textContent = "Por favor completa tu nombre y tu opinion antes de enviar.";
        errorMessage.hidden = false;
        return;
      }

      errorMessage.hidden = true;

      const message = `Hola! Soy ${name} y quiero dejar mi opinion sobre Dulce Kibba: "${text}"`;
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      reviewForm.reset();
    });
  }
});
