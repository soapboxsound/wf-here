document.querySelectorAll(".nav").forEach((nav) => {
  const button = nav.querySelector(".nav-menu-btn");
  const menu = nav.querySelector(".nav-mobile-menu");

  if (!button || !menu) {
    return;
  }

  const closeMenu = () => {
    menu.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = '<i class="ti ti-menu-2"></i>';
  };

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menu.classList.toggle("is-open");
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    button.innerHTML = isOpen
      ? '<i class="ti ti-x"></i>'
      : '<i class="ti ti-menu-2"></i>';
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target)) {
      closeMenu();
    }
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
});
