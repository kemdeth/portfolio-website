// Theme Toggle Logic
const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;

// Initialize theme from local storage
const currentTheme = localStorage.getItem("theme") || "light";
html.setAttribute("data-theme", currentTheme);
themeToggle.textContent = currentTheme === "dark" ? "☀️" : "🌙";

themeToggle.addEventListener("click", () => {
  const theme = html.getAttribute("data-theme") === "light" ? "dark" : "light";
  html.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
});

// Scroll Effects (Back to Top & Section Animations)
const backToTopBtn = document.getElementById("backToTop");
const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
  // Show/Hide Back to Top button
  if (window.scrollY > 300) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Intersection Observer for animations
const observerOptions = { threshold: 0.1 };

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      if (entry.target.id === "skills") {
        animateSkillBars();
      }
    }
  });
}, observerOptions);

sections.forEach((section) => observer.observe(section));

function animateSkillBars() {
  const bars = document.querySelectorAll(".skill-progress");
  bars.forEach((bar) => {
    bar.style.width = bar.getAttribute("data-progress") + "%";
  });
}

// Contact Form Handler
const contactForm = document.getElementById("contactForm");
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = document.getElementById("formMessage");
  msg.textContent =
    "Thank you! This is a demo. Connect a backend like Formspree to receive emails.";
  msg.style.color = "green";
  contactForm.reset();
});
