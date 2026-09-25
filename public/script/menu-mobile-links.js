const menu = document.querySelector("#menu");
const navMenu = document.querySelector("#nav-menu");
const btnMobile = document.querySelector("#btn-mobile");

menu?.addEventListener("click", (event) => {
  if (!(event.target instanceof Element) || !event.target.closest("a")) {
    return;
  }

  navMenu?.classList.remove("active");
  btnMobile?.setAttribute("aria-expanded", "false");
});
