/* ========== PRICING SECTION NAVIGATION ========== */
document.querySelectorAll("[data-scroll-pricing]").forEach((button) => {
  button.addEventListener("click", () => {
    closeMobileMenu();
    document
      .getElementById("pricing")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* ========== BILLING PERIOD & PRICE DISPLAY ========== */
document.querySelectorAll("[data-billing]").forEach((button) => {
  button.addEventListener("click", () => {
    const billingPeriod = button.dataset.billing;
    document
      .querySelectorAll("[data-billing]")
      .forEach((item) => item.classList.toggle("is-selected", item === button));
    document.querySelectorAll(".price [data-monthly]").forEach((price) => {
      price.textContent = price.dataset[billingPeriod];
    });
    document.querySelectorAll("[data-price-suffix]").forEach((suffix) => {
      suffix.textContent =
        billingPeriod === "yearly" ? "/ month, billed yearly" : "/ month";
    });
    if (checkoutModal.classList.contains("is-open"))
      setCheckoutPlan(selectedCheckoutPlan);
  });
});
