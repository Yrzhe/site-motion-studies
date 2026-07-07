const root = document.documentElement;
const heat = document.querySelector("#heat");

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function update() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0;
  const eased = 1 - Math.pow(1 - progress, 3);

  root.style.setProperty("--scroll", progress.toFixed(4));
  root.style.setProperty("--tilt", `${(-10 + eased * 20).toFixed(2)}deg`);
  root.style.setProperty("--lift", `${(-16 + Math.sin(progress * Math.PI) * -26).toFixed(2)}px`);
  heat.textContent = `${Math.round(28 + eased * 64)}%`;
}

window.addEventListener("scroll", update, { passive: true });
window.addEventListener("resize", update);
update();

