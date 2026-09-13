/* ========== PLAN CHECKOUT & PAYMENT DEMO ========== */
function getPlanCard(plan) {
  return (
    document.querySelector(`[data-plan-card="${plan}"]`) ||
    document.querySelector('[data-plan-card="professional"]')
  );
}

function getSelectedBillingPeriod() {
  return document.querySelector("[data-billing].is-selected").dataset.billing;
}

function getCardBrand(number) {
  const digits = number.replace(/\D/g, "");
  if (/^4/.test(digits)) return "Visa debit";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard debit";
  if (/^3[47]/.test(digits)) return "Amex debit";
  return "Debit card";
}

function formatCardNumber(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
}

function passesLuhn(value) {
  const digits = value.replace(/\D/g, "");
  let sum = 0;
  let shouldDouble = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return digits.length >= 12 && sum % 10 === 0;
}

function hasValidExpiry(value) {
  const [monthText, yearText] = value.split("/");
  const month = Number(monthText);
  const year = Number(`20${yearText}`);
  if (!month || month < 1 || month > 12 || !yearText || yearText.length !== 2)
    return false;
  const expiryDate = new Date(year, month);
  return expiryDate > new Date();
}

function updateCardPreview() {
  const cardNumber = document.getElementById("checkoutCard").value;
  const cardName = document.getElementById("checkoutName").value.trim();
  const expiry = document.getElementById("checkoutExpiry").value;
  document.getElementById("cardBrand").textContent = getCardBrand(cardNumber);
  document.getElementById("previewCardNumber").textContent =
    cardNumber || "4242 4242 4242 4242";
  document.getElementById("previewCardName").textContent = cardName
    ? cardName.toUpperCase()
    : "YOUR NAME";
  document.getElementById("previewCardExpiry").textContent = expiry || "MM/YY";
}

function setCheckoutPlan(plan) {
  selectedCheckoutPlan = plan || "professional";
  const card = getPlanCard(selectedCheckoutPlan);
  const billingPeriod = getSelectedBillingPeriod();
  const planName = card.querySelector("h3").textContent.trim();
  const price = card.querySelector("[data-monthly]").dataset[billingPeriod];
  const features = [...card.querySelectorAll("li")]
    .slice(0, 3)
    .map((item) => item.textContent.trim());
  document.getElementById("checkoutTitle").textContent = `Start ${planName}`;
  document.getElementById("checkoutPlanName").textContent = `${planName} plan`;
  document.getElementById("checkoutPrice").innerHTML =
    `$${price} <small>${billingPeriod === "yearly" ? "/ month, billed yearly" : "/ month"}</small>`;
  document.getElementById("checkoutFeatures").replaceChildren(
    ...features.map((feature) => {
      const item = document.createElement("li");
      item.textContent = feature;
      return item;
    }),
  );
}

function openCheckout(plan = selectedCheckoutPlan) {
  const currentUser = getCurrentUser();
  setCheckoutPlan(plan);
  if (!currentUser) {
    checkoutAfterAuth = true;
    openAuthModal(getDemoUsers().length ? "login" : "register");
    return;
  }
  document.getElementById("checkoutName").value = currentUser.name;
  document.getElementById("checkoutEmail").value = currentUser.email;
  showFormMessage(document.getElementById("checkoutForm"), "", false);
  updateCardPreview();
  lastFocusedElement = document.activeElement;
  checkoutModal.classList.add("is-open");
  checkoutModal.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
  setTimeout(() => document.getElementById("checkoutCard").focus(), 0);
}

function closeCheckout() {
  checkoutModal.classList.remove("is-open");
  checkoutModal.setAttribute("aria-hidden", "true");
  body.classList.remove("modal-open");
  lastFocusedElement?.focus();
}

document.querySelectorAll("[data-open-checkout]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    openCheckout(button.dataset.plan);
  });
});
document.querySelectorAll("[data-plan-card]").forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest("button, a")) return;
    openCheckout(card.dataset.planCard);
  });
});
document
  .querySelectorAll("[data-close-checkout]")
  .forEach((button) => button.addEventListener("click", closeCheckout));

document.getElementById("checkoutCard").addEventListener("input", (event) => {
  event.currentTarget.value = formatCardNumber(event.currentTarget.value);
  updateCardPreview();
});
document.getElementById("checkoutExpiry").addEventListener("input", (event) => {
  event.currentTarget.value = formatExpiry(event.currentTarget.value);
  updateCardPreview();
});
document.getElementById("checkoutCvc").addEventListener("input", (event) => {
  event.currentTarget.value = event.currentTarget.value
    .replace(/\D/g, "")
    .slice(0, 4);
});
document
  .getElementById("checkoutName")
  .addEventListener("input", updateCardPreview);

document.getElementById("checkoutForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) return form.reportValidity();
  if (!passesLuhn(document.getElementById("checkoutCard").value)) {
    showFormMessage(
      form,
      "Enter a valid demo debit card number. Try 4242 4242 4242 4242.",
    );
    return;
  }
  if (!hasValidExpiry(document.getElementById("checkoutExpiry").value)) {
    showFormMessage(form, "Enter a valid future expiry date.");
    return;
  }
  form.reset();
  closeCheckout();
  showToast(
    `${getPlanCard(selectedCheckoutPlan).querySelector("h3").textContent.trim()} trial activated`,
  );
});

/* ========== KEYBOARD FOCUS MANAGEMENT FOR MODALS ========== */
document.addEventListener("keydown", (event) => {
  if (!modal.classList.contains("is-open")) return;
  if (event.key === "Escape") return closeAuthModal();
  if (event.key !== "Tab") return;
  const focusable = [
    ...dialog.querySelectorAll("button, input, a[href]"),
  ].filter((item) => !item.disabled && !item.closest("[hidden]"));
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  }
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

document.addEventListener("keydown", (event) => {
  if (!checkoutModal.classList.contains("is-open")) return;
  if (event.key === "Escape") return closeCheckout();
  if (event.key !== "Tab") return;
  const focusable = [
    ...checkoutDialog.querySelectorAll("button, input"),
  ].filter((item) => !item.disabled);
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  }
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
