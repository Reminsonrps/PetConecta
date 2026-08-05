/* Arquivo de script: mobile-navbar.js
   Responsável pela lógica e comportamento desta funcionalidade/página. */

/* Arquivo JS: mobile-navbar.js
   Responsável por comportamentos e regras da página/fluxo correspondente. */

class MobileNavbar {
  constructor(mobileMenu, navList, navLinks) {
    this.mobileMenu = document.querySelector(mobileMenu);
    this.navList = document.querySelector(navList);
    this.navLinks = document.querySelectorAll(navLinks);
    this.activeClass = "active";

    this.handleClick = this.handleClick.bind(this);
    this.handleEscape = this.handleEscape.bind(this);
    this.handleLinkClick = this.handleLinkClick.bind(this);
  }

  animateLinks() {
    this.navLinks.forEach((link, index) => {
      link.style.animation
        ? (link.style.animation = "")
        : (link.style.animation = `navLinkFade 0.5s ease forwards ${
            index / 7 + 0.3
          }s`);
    });
  }

  handleClick() {
    this.navList.classList.toggle(this.activeClass);
    this.mobileMenu.classList.toggle(this.activeClass);
    this.animateLinks();

    // Atualize ARIA attributes
    const isOpen = this.navList.classList.contains(this.activeClass);
    this.mobileMenu.setAttribute("aria-expanded", isOpen);
    this.navList.setAttribute("aria-hidden", !isOpen);
  }

  handleEscape(e) {
    if (
      e.key === "Escape" &&
      this.navList.classList.contains(this.activeClass)
    ) {
      this.handleClick();
    }
  }

  handleLinkClick() {
    // Fechar menu quando clicar em um link
    if (this.navList.classList.contains(this.activeClass)) {
      this.handleClick();
    }
  }

  addClickEvent() {
    this.mobileMenu.addEventListener("click", this.handleClick);
    this.navLinks.forEach((link) => {
      link.addEventListener("click", this.handleLinkClick.bind(this));
    });
    document.addEventListener("keydown", this.handleEscape);
  }

  init() {
    if (this.mobileMenu) {
      // Inicie ARIA attributes
      this.mobileMenu.setAttribute("aria-expanded", "false");
      this.mobileMenu.setAttribute("aria-controls", "menu");
      this.navList.setAttribute("aria-hidden", "true");
      this.navList.setAttribute("id", "menu");

      this.addClickEvent();
    }
    return this;
  }
}

const mobileNavbar = new MobileNavbar(
  ".mobile-menu",
  ".nav-list",
  ".nav-list li",
);
mobileNavbar.init();
