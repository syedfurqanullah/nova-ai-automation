/* ========== AUTH MODAL & DEMO CREDENTIALS ========== */
async function hashPassword(value) {
  if (!window.crypto?.subtle) {
    return btoa(unescape(encodeURIComponent(`demo:${value}`)));
  }
  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function showFormMessage(form, message, isError = true) {
  const output = form.querySelector(".form-message");
  output.textContent = message;
  output.style.color = isError ? "#bf3545" : "#16835a";
}

function setAuthView(viewName) {
  document.querySelectorAll(".auth-view").forEach((view) => {
    view.hidden = view.dataset.view !== viewName;
  });
  setTimeout(
    () =>
      modal.querySelector(`.auth-view[data-view="${viewName}"] input`)?.focus(),
    0,
  );
}

function openAuthModal(viewName) {
  lastFocusedElement = document.activeElement;
  setAuthView(viewName);
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
}

function closeAuthModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  body.classList.remove("modal-open");
  lastFocusedElement?.focus();
}

/* Open account flows and end the current demo session. */
authEntry.addEventListener("click", () =>
  openAuthModal(getDemoUsers().length ? "login" : "register"),
);
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("novaAICurrentUser");
  updateAuthUI();
  showToast("Logged out successfully");
});

/* Authenticate, register, recover, and reset demo accounts. */
document.querySelectorAll("[data-open-auth]").forEach((button) => {
  button.addEventListener("click", () =>
    openAuthModal(getDemoUsers().length ? "login" : "register"),
  );
});
document
  .querySelectorAll("[data-close-auth]")
  .forEach((button) => button.addEventListener("click", closeAuthModal));
document.querySelectorAll("[data-auth-view]").forEach((button) => {
  button.addEventListener("click", () => setAuthView(button.dataset.authView));
});

document.querySelectorAll(".password-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.parentElement.querySelector("input");
    const shouldShow = input.type === "password";
    input.type = shouldShow ? "text" : "password";
    button.textContent = shouldShow ? "Hide" : "Show";
    button.setAttribute(
      "aria-label",
      shouldShow ? "Hide password" : "Show password",
    );
    button.setAttribute("aria-pressed", String(shouldShow));
  });
});

document
  .getElementById("registerForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) return form.reportValidity();
    const name = document.getElementById("registerName").value.trim();
    const email = document
      .getElementById("registerEmail")
      .value.trim()
      .toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const users = getDemoUsers();
    if (users.some((user) => user.email === email)) {
      showFormMessage(
        form,
        "An account with this email already exists. Please sign in.",
      );
      return;
    }
    users.push({ name, email, passwordHash: await hashPassword(password) });
    saveDemoUsers(users);
    localStorage.setItem("novaAICurrentUser", email);
    form.reset();
    closeAuthModal();
    updateAuthUI();
    showToast("Account created successfully");
    if (checkoutAfterAuth) {
      checkoutAfterAuth = false;
      openCheckout();
    }
  });
/* ========== AUTHENTICATION FORMS ========== */ document
  .getElementById("loginForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) return form.reportValidity();
    const email = document
      .getElementById("loginEmail")
      .value.trim()
      .toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const account = getDemoUsers().find((user) => user.email === email);
    if (!account || account.passwordHash !== (await hashPassword(password))) {
      showFormMessage(form, "Email or password is incorrect.");
      return;
    }
    localStorage.setItem("novaAICurrentUser", account.email);
    form.reset();
    closeAuthModal();
    updateAuthUI();
    showToast(`Welcome back, ${account.name}!`);
    if (checkoutAfterAuth) {
      checkoutAfterAuth = false;
      openCheckout();
    }
  });

document.getElementById("forgotForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) return form.reportValidity();
  const email = document
    .getElementById("forgotEmail")
    .value.trim()
    .toLowerCase();
  const account = getDemoUsers().find((user) => user.email === email);
  if (!account) {
    showFormMessage(
      form,
      "No account was found for this email. You can create another account instead.",
    );
    return;
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  localStorage.setItem(
    "novaAIPasswordReset",
    JSON.stringify({ email, code, expiresAt: Date.now() + 10 * 60 * 1000 }),
  );
  document.getElementById("resetCodeHint").textContent =
    `Demo verification code: ${code}. This code expires in 10 minutes.`;
  form.reset();
  setAuthView("reset");
  showToast("Verification code sent");
});

document
  .getElementById("resetForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) return form.reportValidity();
    let request;
    try {
      request = JSON.parse(
        localStorage.getItem("novaAIPasswordReset") || "null",
      );
    } catch {
      request = null;
    }
    const enteredCode = document.getElementById("resetCode").value.trim();
    if (!request || request.expiresAt < Date.now()) {
      localStorage.removeItem("novaAIPasswordReset");
      showFormMessage(
        form,
        "This verification code has expired. Request a new one.",
      );
      return;
    }
    if (request.code !== enteredCode) {
      showFormMessage(form, "That verification code is incorrect.");
      return;
    }
    const users = getDemoUsers();
    const accountIndex = users.findIndex(
      (user) => user.email === request.email,
    );
    if (accountIndex === -1) {
      showFormMessage(
        form,
        "This account is no longer available. Create another account instead.",
      );
      return;
    }
    users[accountIndex].passwordHash = await hashPassword(
      document.getElementById("resetPassword").value,
    );
    saveDemoUsers(users);
    localStorage.removeItem("novaAIPasswordReset");
    form.reset();
    closeAuthModal();
    showToast("Password updated");
    openAuthModal("login");
  });

updateAuthUI();
