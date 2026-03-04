/* ══════════════════════════════════════
   AGE CHIP — hide/reveal with 1.5s timeout
══════════════════════════════════════ */
const ageChip = document.getElementById("ageChip");
const ageVal  = document.getElementById("ageVal");

let ageVisible = false;
let ageTimer   = null;

ageChip.addEventListener("click", () => {
  if (ageTimer) clearTimeout(ageTimer);

  if (!ageVisible) {
    ageVal.textContent = "24";
    ageVal.classList.remove("hidden");
    ageVisible = true;

    ageTimer = setTimeout(() => {
      ageVal.classList.add("hidden");
      setTimeout(() => { ageVal.textContent = "••"; }, 300);
      ageVisible = false;
    }, 1500);
  } else {
    ageVal.classList.add("hidden");
    setTimeout(() => { ageVal.textContent = "••"; }, 300);
    ageVisible = false;
  }
});

/* ══════════════════════════════════════
   SECTION NAVIGATION
══════════════════════════════════════ */
const navBtns  = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".section-panel");

navBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.section;
    navBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    sections.forEach((s) => s.classList.remove("active"));

    const targetEl = document.getElementById(`section-${target}`);
    if (targetEl) {
      targetEl.style.animation = "none";
      void targetEl.offsetWidth;
      targetEl.style.animation = "";
      targetEl.classList.add("active");
    }

    if (target === "projects" && projectData.length > 0) render();
  });
});

/* ══════════════════════════════════════
   SKILL PILLS
══════════════════════════════════════ */
const skills = [
  { label: "Kotlin",          cls: "bg-orange-500/20 text-orange-700 border-orange-300" },
  { label: "Jetpack Compose", cls: "bg-sky-500/20 text-sky-700 border-sky-300" },
  { label: "MVVM",            cls: "bg-teal-500/20 text-teal-700 border-teal-300" },
  { label: "Retrofit",        cls: "bg-purple-500/20 text-purple-700 border-purple-300" },
  { label: "Room DB",         cls: "bg-yellow-500/20 text-yellow-700 border-yellow-300" },
  { label: "Coroutines",      cls: "bg-rose-500/20 text-rose-700 border-rose-300" },
  { label: "Firebase",        cls: "bg-orange-600/20 text-orange-800 border-orange-400" },
  { label: "Git",             cls: "bg-zinc-500/20 text-zinc-700 border-zinc-300" },
];

const pillsContainer = document.getElementById("skillPills");
if (pillsContainer) {
  skills.forEach((s, i) => {
    const pill = document.createElement("span");
    pill.className = `skill-pill ${s.cls}`;
    pill.textContent = s.label;
    pill.style.animationDelay = `${0.3 + i * 0.07}s`;
    pillsContainer.appendChild(pill);
  });
}

/* ══════════════════════════════════════
   PROJECTS
══════════════════════════════════════ */
const stackEl   = document.getElementById("stack");
const previewEl = document.getElementById("preview");
const titleEl   = document.getElementById("projectTitle");
const shuffleBtn = document.getElementById("shuffleBtn");

let index       = 0;
let projectData = [];

/* ── Load ── */
async function loadProjects() {
  // 1. manifest.json
  try {
    const mRes = await fetch("projects/manifest.json");
    if (mRes.ok) { await loadFromFolders(await mRes.json()); return; }
  } catch (_) {}

  // 2. directory listing fallback
  try {
    const res  = await fetch("projects/");
    const html = await res.text();
    const doc  = new DOMParser().parseFromString(html, "text/html");
    const folders = Array.from(doc.querySelectorAll("a"))
      .map(a => (a.getAttribute("href") || "").replace(/\/$/, "").replace(/^.*\//, ""))
      .filter(n => n && n !== ".." && !n.includes("."));
    await loadFromFolders(folders);
  } catch (err) {
    console.error("Could not load projects:", err);
  }
}

async function loadFromFolders(folders) {
  for (const folder of folders) {
    try {
      const r = await fetch(`projects/${folder}/project.json`);
      if (r.ok) {
        const data = await r.json();
        if (!data.slug) data.slug = folder;
        projectData.push(data);
      }
    } catch (e) { console.warn(`Skipping "${folder}":`, e); }
  }
  if (projectData.length > 0) render();
  else if (titleEl) titleEl.textContent = "No projects yet";
}

/* ── Render main phone stack ── */
function render() {
  if (!stackEl || !titleEl || !projectData.length) return;

  stackEl.innerHTML = "";
  const cur = projectData[index];
  titleEl.textContent = cur.title;

  cur.images.forEach((img, i) => {
    const card = document.createElement("div");
    card.className = "img-card";
    card.style.backgroundImage = `url("projects/${cur.slug}/art/${img}")`;
    card.style.zIndex     = cur.images.length - i;
    card.style.transform  = `translateY(${i * 10}px) scale(${1 - i * 0.04})`;
    card.style.opacity    = i === 0 ? "1" : "0.4";
    card.style.filter     = i === 0 ? "blur(0)" : "blur(3px)";
    stackEl.appendChild(card);
  });

  updatePreview();
}

/* ── Render preview (peeking phone) ── */
function updatePreview() {
  if (!previewEl || !projectData.length) return;
  const next = projectData[(index + 1) % projectData.length];
  previewEl.style.opacity = "0";
  setTimeout(() => {
    previewEl.style.backgroundImage = `url("projects/${next.slug}/art/${next.images[0]}")`;
    previewEl.style.backgroundSize  = "cover";
    previewEl.style.backgroundPosition = "center";
    previewEl.style.opacity = "1";
  }, 300);
}

/* ── Rotate ── */
function rotateProjects() {
  if (!projectData.length) return;
  index = (index + 1) % projectData.length;

  if (titleEl) {
    titleEl.classList.remove("animateTitle");
    void titleEl.offsetWidth;
    titleEl.classList.add("animateTitle");
  }

  // Animate shuffle icon spin via class
  if (shuffleBtn) {
    shuffleBtn.classList.add("spinning");
    setTimeout(() => shuffleBtn.classList.remove("spinning"), 500);
  }

  render();
}

/* Shuffle button + click on preview phone both rotate */
if (shuffleBtn) shuffleBtn.addEventListener("click", rotateProjects);

// clicking the peek phone also shuffles
const phonePeek = document.querySelector(".phone-peek");
if (phonePeek) phonePeek.addEventListener("click", rotateProjects);

loadProjects();