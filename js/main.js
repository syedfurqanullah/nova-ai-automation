/* ========== SHARED DOM, STATE & NOTIFICATIONS ========== */
const body = document.body;
const menuButton = document.querySelector(".menu-button");
const navMenu = document.querySelector(".nav-menu");
const modal = document.getElementById("authModal");
const dialog = modal.querySelector(".auth-dialog");
const toast = document.getElementById("toast");
const authEntry = document.getElementById("authEntry");
const logoutButton = document.getElementById("logoutButton");
const accountStatus = document.getElementById("accountStatus");
const checkoutModal = document.getElementById("checkoutModal");
const checkoutDialog = checkoutModal.querySelector(".checkout-dialog");


/* Shared page state */
let lastFocusedElement;
let checkoutAfterAuth = false;
let selectedCheckoutPlan = "professional";


/* Reusable toast messages */
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(
    () => toast.classList.remove("is-visible"),
    4000,
  );
}


/* Shared demo account storage */
function getDemoUsers() {
  try {
    return JSON.parse(localStorage.getItem("novaAIUsers") || "[]");
  } catch {
    return [];
  }
}

function saveDemoUsers(users) {
  localStorage.setItem("novaAIUsers", JSON.stringify(users));
}

function getCurrentUser() {
  const email = localStorage.getItem("novaAICurrentUser");
  return getDemoUsers().find((user) => user.email === email) || null;
}

function updateAuthUI() {
  const currentUser = getCurrentUser();
  const hasAccount = getDemoUsers().length > 0;
  authEntry.hidden = Boolean(currentUser);
  logoutButton.hidden = !currentUser;
  accountStatus.hidden = !currentUser;
  accountStatus.textContent = currentUser
    ? `Hi, ${currentUser.name.split(" ")[0]}`
    : "";
  authEntry.textContent = hasAccount ? "Sign in" : "Create account";
}

/* ========== SITE NAVIGATION ========== */
menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute(
    "aria-label",
    isOpen ? "Open navigation menu" : "Close navigation menu",
  );
  navMenu.classList.toggle("is-open", !isOpen);
});

document.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
    navMenu.classList.remove("is-open");
  });
});

function closeMobileMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation menu");
  navMenu.classList.remove("is-open");
}

/* ========== THEME & PAGE INTERACTIONS ========== */
const themeToggle = document.getElementById("themeToggle");
function applyTheme(isDark) {
  body.classList.toggle("dark-theme", isDark);
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Enable light mode" : "Enable dark mode",
  );
  themeToggle.innerHTML = isDark
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v2m0 14v2M3 12h2m14 0h2m-3.6-5.4 1.4-1.4M5.2 18.8l1.4-1.4m0-10.8-1.4-1.4m12.2 13.6-1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/></svg>';
}
applyTheme(localStorage.getItem("novaAITheme") === "dark");
themeToggle.addEventListener("click", () => {
  const willBeDark = !body.classList.contains("dark-theme");
  applyTheme(willBeDark);
  localStorage.setItem("novaAITheme", willBeDark ? "dark" : "light");
  showToast("Theme changed");
});

const navLinks = [...document.querySelectorAll('.nav-menu a[href^="#"]')];
const trackedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) =>
        link.classList.toggle(
          "is-active",
          link.getAttribute("href") === `#${entry.target.id}`,
        ),
      );
    });
  },
  { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
);
trackedSections.forEach((section) => sectionObserver.observe(section));

/* ========== FAQ: TOGGLE BEHAVIOR ========== */
document.querySelectorAll(".faq-list details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-list details").forEach((otherItem) => {
      if (otherItem !== item) otherItem.open = false;
    });
  });
});

document.getElementById("year").textContent = new Date().getFullYear();
