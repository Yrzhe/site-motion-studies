const root = document.documentElement;
const body = document.body;

const elements = {
  kicker: document.querySelector("#scene-kicker"),
  title: document.querySelector("#scene-title"),
  copy: document.querySelector("#scene-copy"),
  caption: document.querySelector("#scene-caption"),
  hudScene: document.querySelector("#hud-scene"),
  hudLabel: document.querySelector("#hud-label"),
  hudValue: document.querySelector("#hud-value"),
  formulaLeft: document.querySelector("#formula-left"),
  formulaRight: document.querySelector("#formula-right"),
  beatActive: document.querySelector("#beat-active"),
  navItems: [...document.querySelectorAll("[data-beat]")],
};

const beats = [
  {
    key: "intro",
    kicker: "Made for mugs. Built for tables.",
    title: "The smallest product gets the biggest launch.",
    copy: "Treat a cork coaster like precision hardware: keep the product fixed in the center and let every annotation behave like measurement.",
    caption: "The original page sells the joke by refusing to visually wink.",
    label: "MODEL",
    formula: ["object classified as product", "ORYZO-1"],
  },
  {
    key: "lift",
    kicker: "Rise above mediocrity.",
    title: "A physical claim becomes a measured stage event.",
    copy: "The product does not just appear. It lifts, casts a different shadow, and gives the labels something measurable to explain.",
    caption: "Stable frame first. Motion second. Copy third.",
    label: "LIFT",
    formula: ["constant lift via geometry", "Δh ≈ t"],
  },
  {
    key: "thermal",
    kicker: "Handles extremes with ease.",
    title: "A utility feature gets promoted into scientific theater.",
    copy: "Color temperature, formulas, and tiny labels turn insulation into a cinematic heatmap without changing the core layout.",
    caption: "The HUD is rare, so it feels intentional instead of decorative.",
    label: "THERMAL",
    formula: ["thermal diffusion model", "pᵢ(T) = eᶻⁱ/T / Σeᶻʲ/T"],
  },
  {
    key: "flip",
    kicker: "Secure communications simplified.",
    title: "A simple gesture is framed as encryption.",
    copy: "The coaster flips in place while the interface keeps the same premium seriousness. The absurdity comes from the gap.",
    caption: "Deadpan motion works when the system never breaks character.",
    label: "SECURE",
    formula: ["write message · flip · secure", "msg → ∎∎∎"],
  },
  {
    key: "legacy",
    kicker: "Supporting backwards compatibility.",
    title: "History becomes a product compatibility matrix.",
    copy: "The final beat swaps the lab for an artifact register, but keeps mono labels, measured spacing, and a centered object logic.",
    caption: "The page closes by extending the spec language into a historical joke.",
    label: "LEGACY",
    formula: ["ancient vessel support", "c. 500 BCE"],
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function mix(start, end, t) {
  return start + (end - start) * t;
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

function setBeat(beat, index) {
  elements.kicker.textContent = beat.kicker;
  elements.title.textContent = beat.title;
  elements.copy.textContent = beat.copy;
  elements.caption.textContent = beat.caption;
  elements.hudScene.textContent = String(index + 1).padStart(2, "0");
  elements.hudLabel.textContent = beat.label;
  elements.formulaLeft.textContent = beat.formula[0];
  elements.formulaRight.textContent = beat.formula[1];
  elements.beatActive.textContent = String(index + 1).padStart(2, "0");
  for (const item of elements.navItems) {
    item.classList.toggle("is-active", item.dataset.beat === beat.key);
  }
}

function update() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0;
  const sceneProgress = progress * beats.length;
  const index = Math.min(beats.length - 1, Math.floor(sceneProgress));
  const local = smooth(clamp(sceneProgress - index, 0, 1));
  const beat = beats[index];

  if (body.dataset.scene !== beat.key) {
    body.dataset.scene = beat.key;
    setBeat(beat, index);
  }

  const lift = index === 0 ? mix(0, 6, local) : index === 1 ? mix(6, 42, local) : 42 - index * 3;
  const tilt = index === 3 ? mix(0, 180, local) : mix(-7, 7, Math.sin(progress * Math.PI * 2) * 0.5 + 0.5);
  const heat = index === 2 ? mix(32, 96, local) : index > 2 ? 88 - index * 8 : 28 + index * 12 + local * 18;
  const matSlide = index >= 4 ? mix(0, -18, local) : mix(-8, 8, progress);
  const railBlur = index === 2 ? mix(18, 34, local) : 18;
  const wordOpacity = 0.9 - progress * 0.28;
  const shadowScale = 1.1 - progress * 0.2;
  const flipX = index === 3 ? 64 + local * 118 : 64;
  const cupOpacity = index === 3 ? 1 - local * 0.38 : 1;

  root.style.setProperty("--progress", progress.toFixed(4));
  root.style.setProperty("--local", local.toFixed(4));
  root.style.setProperty("--lift", `${lift.toFixed(2)}px`);
  root.style.setProperty("--tilt", `${tilt.toFixed(2)}deg`);
  root.style.setProperty("--flip-x", `${flipX.toFixed(2)}deg`);
  root.style.setProperty("--heat", `${heat.toFixed(1)}%`);
  root.style.setProperty("--mat-slide", `${matSlide.toFixed(2)}px`);
  root.style.setProperty("--rail-blur", `${railBlur.toFixed(2)}px`);
  root.style.setProperty("--word-opacity", wordOpacity.toFixed(3));
  root.style.setProperty("--shadow-scale", shadowScale.toFixed(3));
  root.style.setProperty("--cup-opacity", cupOpacity.toFixed(3));
  root.style.setProperty("--beat", index);

  const value = beat.key === "thermal" ? `${Math.round(heat)}%` : beat.key === "flip" ? `${Math.round(local * 180)}°` : `${lift.toFixed(1)}mm`;
  elements.hudValue.textContent = value;
}

setBeat(beats[0], 0);
window.addEventListener("scroll", update, { passive: true });
window.addEventListener("resize", update);
update();
