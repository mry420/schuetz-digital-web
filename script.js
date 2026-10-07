// Mobile menu
const toggle = document.querySelector(".nav__toggle");
const menu = document.getElementById("mobile-menu");

function setMenu(open) {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  menu.hidden = !open;
}

toggle.addEventListener("click", () => setMenu(menu.hidden));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
window.addEventListener("resize", () => {
  if (window.innerWidth > 860) setMenu(false);
});

// Reveal on scroll
const items = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add("is-visible"));
}

document.getElementById("year").textContent = new Date().getFullYear();
