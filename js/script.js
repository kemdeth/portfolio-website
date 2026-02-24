/* ── 1. THEME TOGGLE ── */
const themeBtn = document.getElementById("themeBtn");
const themeIcon = document.getElementById("themeIcon");
const html = document.documentElement;
const saved = localStorage.getItem("theme") || "light";
html.setAttribute("data-theme", saved);
themeIcon.innerHTML =
  saved === "dark" ? '<use href="#ico-sun"/>' : '<use href="#ico-moon"/>';

themeBtn.addEventListener("click", () => {
  const next = html.getAttribute("data-theme") === "light" ? "dark" : "light";
  html.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  themeIcon.innerHTML =
    next === "dark" ? '<use href="#ico-sun"/>' : '<use href="#ico-moon"/>';
});

/* ── 2. MOBILE HAMBURGER ── */
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.querySelector("svg").innerHTML = open
    ? '<use href="#ico-close"/>'
    : '<use href="#ico-menu"/>';
});

navLinks.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.querySelector("svg").innerHTML = '<use href="#ico-menu"/>';
  });
});

/* ── 3. TYPING EFFECT ── */
const phrases = [
  "Frontend Developer",
  "Building Warm, Creative UIs",
  "JavaScript Enthusiast",
  "Mobile-First Mindset",
  "Open to Opportunities",
];
const typingEl = document.getElementById("typingText");
let pIdx = 0,
  cIdx = 0,
  del = false;
function type() {
  const p = phrases[pIdx];
  typingEl.textContent = del ? p.slice(0, --cIdx) : p.slice(0, ++cIdx);
  if (!del && cIdx === p.length) {
    del = true;
    setTimeout(type, 1800);
    return;
  }
  if (del && cIdx === 0) {
    del = false;
    pIdx = (pIdx + 1) % phrases.length;
  }
  setTimeout(type, del ? 45 : 75);
}
type();

/* ── 4. INTERSECTION OBSERVER — scroll-reveal + skill bars ── */
let skillsDone = false;
const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      if (e.target.id === "skills" && !skillsDone) {
        document.querySelectorAll(".sk-fill").forEach((b) => {
          setTimeout(() => {
            b.style.width = b.dataset.w + "%";
          }, 100);
        });
        skillsDone = true;
      }
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -60px 0px" },
);

document.querySelectorAll("section").forEach((s) => obs.observe(s));
document.querySelector(".hero").classList.add("visible");

/* ── 5. BACK TO TOP ── */
const b2t = document.getElementById("b2t");
window.addEventListener(
  "scroll",
  () => {
    b2t.classList.toggle("show", window.scrollY > 350);
  },
  { passive: true },
);
b2t.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" }),
);

/* ── 6. CONTACT FORM ── */
const form = document.getElementById("ctForm");
const fMsg = document.getElementById("fMsg");
const submitBtn = form.querySelector(".sub-btn");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const n = form.name.value.trim();
  const em = form.email.value.trim();
  const mg = form.message.value.trim();

  if (!n || !em || !mg) {
    fMsg.textContent = "⚠️ Please fill in all fields.";
    fMsg.className = "f-msg err";
    fMsg.style.display = "block";
    return;
  }

  submitBtn.textContent = "Sending…";
  submitBtn.disabled = true;

  try {
    const res = await fetch(
      "https://api.telegram.org/bot8256393559:AAEkAPKMWU6TgG4S89EIy7-ezH6KPIp87mE/sendMessage",
      {
        method: "POST",
        body: JSON.stringify({
          chat_id: "6802113046",
          text: `Name: ${n}\nEmail: ${em}\nMessage: ${mg}`,
        }),
        headers: {
          Accept: "application/json",

          "Content-Type": "application/json",
        },
      },
    );
    if (res.ok) {
      fMsg.textContent = "✅ Message sent! I’ll get back to you soon.";
      fMsg.className = "f-msg ok";
      form.reset();
    } else {
      throw new Error("Server error");
    }
  } catch {
    fMsg.textContent = "❌ Something went wrong. Please email me directly.";
    fMsg.className = "f-msg err";
  }
  fMsg.style.display = "block";
  submitBtn.innerHTML =
    '<svg stroke="#fff" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#ico-send"/></svg> Send Message';
  submitBtn.disabled = false;
  setTimeout(() => {
    fMsg.style.display = "none";
  }, 7000);
});

/* ── Auto-update copyright year ── */
document.getElementById("yr").textContent = new Date().getFullYear();
