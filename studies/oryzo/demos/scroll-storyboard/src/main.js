const sections = [
  {
    key: "hero",
    mode: "stage",
    title: "Hero: product launch for a coaster",
    copy: "The page opens as if a cork coaster deserves a flagship product launch.",
    quote: "Made for mugs. Built for tables.",
    visual: "desk / cutting mat / coaster",
    modeLabel: "PRODUCT STAGE",
    motion: "Camera settles over the desk while the product card and play chip establish a premium launch frame.",
    layers: ["giant ORYZO wordmark", "top-down desk stage", "frosted Lusion credit", "play chip"],
  },
  {
    key: "ai",
    mode: "ai",
    title: "AI: the coaster becomes a model",
    copy: "The object is reframed as Oryzo-1, an AI product with asterisk-driven comedy.",
    quote: "Powered by AI* / * Adobe Illustrator",
    visual: "hand-held coaster / model reveal",
    modeLabel: "AI MODEL PARODY",
    motion: "The desk gives way to a darker centered product reveal; hand/object imagery becomes the proof point.",
    layers: ["large centered title", "hand/product focus", "AI disclaimer", "hover instruction"],
  },
  {
    key: "wearable",
    mode: "gallery",
    title: "Wearable: lifestyle proof takes over",
    copy: "The coaster is treated like a fashion object, with image/video gallery language and magazine jokes.",
    quote: "So portable, it's wearable",
    visual: "gallery carousel / magazine cover",
    modeLabel: "LIFESTYLE GALLERY",
    motion: "Side thumbnails and a central media frame replace the single product stage.",
    layers: ["main gallery", "left/right thumbs", "warning overlay", "AI slop magazine"],
  },
  {
    key: "features-lift",
    mode: "feature",
    title: "Feature: lift becomes engineering",
    copy: "A one-coaster-height lift is presented as a measurable breakthrough.",
    quote: "Rise above mediocrity",
    visual: "cup lifted by coaster / geometry formula",
    modeLabel: "FEATURE CLAIM",
    motion: "The cup/coaster returns to the desk; vertical distance, shadow, and formula sell the lift.",
    layers: ["feature card", "central cup/coaster", "constant lift formula", "measurement rail"],
  },
  {
    key: "features-thermal",
    mode: "thermal",
    title: "Feature: temperature becomes theater",
    copy: "Thermal stability is visualized as heatmap, slider, and pseudo-scientific formula.",
    quote: "Handles extremes with ease",
    visual: "thermal scene / TDM formula",
    modeLabel: "THERMAL MODEL",
    motion: "The same desk scene shifts into purple/orange heatmap color, with a temperature slider at the right edge.",
    layers: ["thermal color state", "TDM formula", "creative/balanced/deterministic slider", "feature text"],
  },
  {
    key: "features-curve",
    mode: "feature",
    title: "Feature: circularity becomes a metric",
    copy: "Roundness is exaggerated into a product metric and curve/geometry beat.",
    quote: "Now 37.9% More Circular",
    visual: "coaster as circle / curve equation",
    modeLabel: "GEOMETRY CLAIM",
    motion: "The product is isolated as a precise circle; labels shift from utility to math.",
    layers: ["circular logo", "curve/circle equation", "technical feature card", "centered coaster"],
  },
  {
    key: "encryption",
    mode: "flip",
    title: "Encryption: a flip becomes security",
    copy: "Turning the coaster over is treated as encryption, with encode/decode button language.",
    quote: "Write a message. Flip. Instantly secure.",
    visual: "coaster flip / encoded message",
    modeLabel: "SECURITY PARODY",
    motion: "A physical flip is mapped to a security-state transition while the UI stays serious.",
    layers: ["flip animation", "encode/decode controls", "message field", "security headline"],
  },
  {
    key: "grip",
    mode: "macro",
    title: "Grip: material turns microscopic",
    copy: "The page zooms into cork texture and friction, replacing product glamour with lab proof.",
    quote: "Grip-locked Antislip technology",
    visual: "macro cork texture / friction coefficient",
    modeLabel: "MATERIAL CLOSE-UP",
    motion: "Camera drops into a dark macro surface; a zoom box and coefficient readout explain the texture.",
    layers: ["macro surface", "zoom box", "friction coefficient", "precision grip copy"],
  },
  {
    key: "sustainability",
    mode: "sustainability",
    title: "Sustainability: cork becomes a sourcing story",
    copy: "The material origin becomes the product argument, with bark visuals and quantified claims.",
    quote: "100% Plant-based / Vegan-friendly sustainability",
    visual: "bark / giant sustainability word",
    modeLabel: "MATERIAL STORY",
    motion: "The huge word 'sustainability' crosses the canvas while material facts replace product specs.",
    layers: ["bark visual", "large typography", "harvest facts", "no compute/no tokens joke"],
  },
  {
    key: "testimonies",
    mode: "table",
    title: "Testimonies: fake social proof",
    copy: "The landing page review table appears, but every testimonial is a joke character.",
    quote: "People all around the world love Oryzo",
    visual: "review table / avatars",
    modeLabel: "SOCIAL PROOF",
    motion: "The product stage becomes a table/list interface; proof is delivered as absurd quotes.",
    layers: ["rating table", "review rows", "avatar thumbnails", "quote/authors"],
  },
  {
    key: "social",
    mode: "content",
    title: "Social content: AI hardware parody",
    copy: "The coaster is pushed through a content wall of on-device, GPU, drop-test, and legacy claims.",
    quote: "Runs on the edge. Refuses the cloud. On-device.",
    visual: "social cards / RTX / drop test",
    modeLabel: "CONTENT WALL",
    motion: "Large poster cards slide through the frame, turning features into shareable launch assets.",
    layers: ["Always On card", "RTX 3090 card", "Drop-Tested card", "Legacy Support card"],
  },
  {
    key: "product",
    mode: "product",
    title: "Product: fake SKU configurator",
    copy: "The page behaves like a real product page with options, specs, and a waitlist button.",
    quote: "Choose your own ORYZO",
    visual: "product options / stack / join waitlist",
    modeLabel: "CONFIGURATOR",
    motion: "The joke settles into commercial UI: options switch while details and CTAs feel plausible.",
    layers: ["ORYZO / Pro / Pro Max", "product detail panel", "single-layer lift", "waitlist CTA"],
  },
  {
    key: "open-weight",
    mode: "paper",
    title: "Open Weight: AI release page parody",
    copy: "The coaster becomes a SOTA open-weight model with paper, model file, and code-coming-soon affordances.",
    quote: "Our SOTA Open Weight model",
    visual: "paper / model (.OBJ) / code",
    modeLabel: "MODEL RELEASE",
    motion: "The product is reduced into documentation artifacts, borrowing AI research launch patterns.",
    layers: ["paper button", "model file", "code coming soon", "peer review joke"],
  },
  {
    key: "footer",
    mode: "footer",
    title: "Footer: the real agency pitch",
    copy: "The final reveal says the product does not exist; the real offer is Lusion's ability to make attention.",
    quote: "If we can sell a coaster, imagine what we can do for your brand.",
    visual: "agency CTA / newsletter / contacts",
    modeLabel: "REVEAL",
    motion: "Motion calms down. The joke resolves into a direct agency proposition.",
    layers: ["large closing line", "email/newsletter", "business contact", "social links"],
  },
];

const root = document.documentElement;
const body = document.body;

const els = {
  topSection: document.querySelector("#top-section"),
  index: document.querySelector("#section-index"),
  title: document.querySelector("#section-title"),
  copy: document.querySelector("#section-copy"),
  quote: document.querySelector("#section-quote"),
  visualLabel: document.querySelector("#visual-label"),
  visualMode: document.querySelector("#visual-mode"),
  heroWord: document.querySelector("#hero-word"),
  motionNote: document.querySelector("#motion-note"),
  layerList: document.querySelector("#layer-list"),
  readoutKind: document.querySelector("#readout-kind"),
  readoutValue: document.querySelector("#readout-value"),
  rail: document.querySelector("#section-rail"),
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

function setSection(section, index) {
  const number = String(index + 1).padStart(2, "0");
  body.dataset.mode = section.mode;
  body.dataset.key = section.key;
  els.topSection.textContent = `${number} / ${section.key.toUpperCase()}`;
  els.index.textContent = `${number} / ${String(sections.length).padStart(2, "0")}`;
  els.title.textContent = section.title;
  els.copy.textContent = section.copy;
  els.quote.textContent = section.quote;
  els.visualLabel.textContent = section.visual;
  els.visualMode.textContent = section.modeLabel;
  els.heroWord.textContent = section.key === "footer" ? "LUSION" : section.key === "open-weight" ? "MODEL" : section.key === "product" ? "ORYZO" : "ORYZO";
  els.motionNote.textContent = section.motion;
  els.readoutKind.textContent = section.modeLabel;
  els.readoutValue.textContent = number;
  els.layerList.innerHTML = section.layers.map((layer) => `<span>${layer}</span>`).join("");
  els.rail.querySelectorAll("button").forEach((button, buttonIndex) => {
    button.classList.toggle("is-active", buttonIndex === index);
  });
}

function buildRail() {
  els.rail.innerHTML = sections
    .map((section, index) => `<button type="button" aria-label="${section.title}" data-index="${index}">${String(index + 1).padStart(2, "0")}</button>`)
    .join("");
  els.rail.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const index = Number(button.dataset.index);
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: maxScroll * (index / sections.length), behavior: "smooth" });
  });
}

function update() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0;
  const scaled = progress * sections.length;
  const index = Math.min(sections.length - 1, Math.floor(scaled));
  const local = smooth(clamp(scaled - index, 0, 1));
  const section = sections[index];

  if (body.dataset.key !== section.key) setSection(section, index);

  root.style.setProperty("--progress", progress.toFixed(4));
  root.style.setProperty("--local", local.toFixed(4));
  root.style.setProperty("--section", index);
  root.style.setProperty("--lift", `${(local * 36 + index * 1.2).toFixed(2)}px`);
  root.style.setProperty("--tilt", `${(-10 + local * 20).toFixed(2)}deg`);
  root.style.setProperty("--stage-x", `${(-index * 1.8 + local * 1.2).toFixed(2)}vw`);
  root.style.setProperty("--heat", (section.mode === "thermal" ? 1 : 0).toString());
  root.style.setProperty("--flip-x", `${(section.mode === "flip" ? 64 + local * 140 : 64).toFixed(2)}deg`);
}

buildRail();
setSection(sections[0], 0);
window.addEventListener("scroll", update, { passive: true });
window.addEventListener("resize", update);
update();
