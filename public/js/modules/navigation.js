// ES6+ Navigation Module

class Navigation {
  constructor() {
    this.navbar = document.querySelector(".navbar");
    this.mobileMenuBtn = null;
    this.init();
  }

  init() {
    this.setupSmoothScroll();
    this.setupScrollSpy();
    this.setupMobileMenu();
    this.setupStickyNav();
  }

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute("href");
        const target = document.querySelector(targetId);

        if (target) {
          const navHeight = this.navbar?.offsetHeight || 80;
          const targetPosition = target.offsetTop - navHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });

          history.pushState(null, null, targetId);
        }
      });
    });
  }

  setupScrollSpy() {
    const sections = document.querySelectorAll("section[id]");

    const observerOptions = {
      threshold: 0.3,
      rootMargin: "-80px 0px 0px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeSection = entry.target.getAttribute("id");
          this.updateActiveLink(activeSection);
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));
  }

  updateActiveLink(activeId) {
    document.querySelectorAll(".nav-links a").forEach((link) => {
      const href = link.getAttribute("href").substring(1);
      if (href === activeId) {
        link.style.color = "#2563eb";
        link.style.fontWeight = "600";
      } else {
        link.style.color = "#1e293b";
        link.style.fontWeight = "500";
      }
    });
  }

  setupStickyNav() {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 100) {
        this.navbar?.classList.add("scrolled");
      } else {
        this.navbar?.classList.remove("scrolled");
      }
    });
  }

  setupMobileMenu() {
    const navContainer = document.querySelector(".nav-links");
    const navButtons = document.querySelector(".nav-buttons");

    if (navContainer && !this.mobileMenuBtn) {
      this.mobileMenuBtn = document.createElement("button");
      this.mobileMenuBtn.innerHTML = "☰";
      this.mobileMenuBtn.className = "mobile-menu-btn";
      this.mobileMenuBtn.style.cssText = `
                display: none;
                font-size: 1.5rem;
                background: none;
                border: none;
                cursor: pointer;
                padding: 8px;
            `;

      navButtons?.before(this.mobileMenuBtn);

      const checkWidth = () => {
        if (window.innerWidth <= 768) {
          this.mobileMenuBtn.style.display = "block";
          navContainer.style.display = "none";
        } else {
          this.mobileMenuBtn.style.display = "none";
          navContainer.style.display = "flex";
        }
      };

      checkWidth();
      window.addEventListener("resize", checkWidth);

      this.mobileMenuBtn.addEventListener("click", () => {
        const isVisible = navContainer.style.display === "flex";
        navContainer.style.display = isVisible ? "none" : "flex";
      });
    }
  }
}

export const navigation = new Navigation();
