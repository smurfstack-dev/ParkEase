// ES6+ Animation Module

class Animations {
  constructor() {
    this.animatedElements = [];
    this.init();
  }

  init() {
    this.setupScrollReveal();
    this.setupCounterAnimation();
    this.setupHoverEffects();
  }

  setupScrollReveal() {
    const elementsToReveal = document.querySelectorAll(
      ".feature-card, .step, .stat",
    );

    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    elementsToReveal.forEach((el, index) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition = `all 0.6s ease ${index * 0.1}s`;
      observer.observe(el);
    });
  }

  setupCounterAnimation() {
    const stats = document.querySelectorAll(".stat-number");

    const observerOptions = {
      threshold: 0.5,
      rootMargin: "0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const statElement = entry.target;
          const targetNumber = parseInt(statElement.textContent);
          this.animateCounter(statElement, targetNumber);
          observer.unobserve(statElement);
        }
      });
    }, observerOptions);

    stats.forEach((stat) => observer.observe(stat));
  }

  animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 40);
  }

  setupHoverEffects() {
    const cards = document.querySelectorAll(".feature-card");

    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-10px)";
        card.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0)";
        card.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
      });
    });
  }
}

export const animations = new Animations();
