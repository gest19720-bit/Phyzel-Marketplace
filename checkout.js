(function () {
  "use strict";
  if (!window.Phyzel) return;

  window.Phyzel.renderCheckoutPage = function (form) {
    if (!form) return;
    var user = window.Phyzel.currentUser();
    if (!user) {
      window.Phyzel.toast("Please sign in to checkout.", "warning");
      window.location.href = "login.html";
      return;
    }
    var nameInput = document.getElementById("fullName");
    var emailInput = document.getElementById("email");
    var phoneInput = document.getElementById("phone");
    if (nameInput && user.user.name) nameInput.value = user.user.name;
    if (emailInput && user.user.email) emailInput.value = user.user.email;
    if (phoneInput && user.user.phone) phoneInput.value = user.user.phone;
    renderSummary();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = document.getElementById("checkoutBtn");
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Creating order…";

      var delivery = {
        address: document.getElementById("address").value.trim(),
        city: document.getElementById("city").value.trim(),
        region: document.getElementById("region").value.trim(),
        instructions: document.getElementById("instructions").value.trim(),
      };

      var fields = [
        { id: "fullName", label: "Full name" },
        { id: "email", label: "Email" },
        { id: "phone", label: "Phone" },
        { id: "address", label: "Delivery address" },
        { id: "city", label: "City / town" },
        { id: "region", label: "Region" },
      ];
      var firstError = null;
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        var input = document.getElementById(f.id);
        var errEl = document.getElementById(f.id + "Error");
        if (errEl) errEl.textContent = "";
        if (!input || !input.value.trim()) {
          if (errEl) errEl.textContent = f.label + " is required.";
          firstError = f.label;
        }
      }
      if (firstError) {
        btn.disabled = false;
        btn.textContent = original;
        window.Phyzel.toast(firstError + " is required.", "error");
        return;
      }

      var email = document.getElementById("email").value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        var emailErr = document.getElementById("emailError");
        if (emailErr) emailErr.textContent = "Enter a valid email address.";
        btn.disabled = false;
        btn.textContent = original;
        window.Phyzel.toast("Enter a valid email address.", "error");
        return;
      }

      window.Phyzel.createOrderFromCart(delivery)
        .then(function (order) {
          var summaryEl = document.getElementById("checkoutSummary");
          var totalsEl = document.getElementById("checkoutTotals");
          if (summaryEl) summaryEl.classList.add("hidden");
          if (totalsEl) totalsEl.classList.add("hidden");
          var checkoutPayBtn = document.getElementById("checkoutPayBtn");
          if (checkoutPayBtn) {
            checkoutPayBtn.href = "checkout-result.html?ref=" + encodeURIComponent(order.reference) + "&status=pending";
            checkoutPayBtn.textContent = "View order (pending payment)";
          }
          window.Phyzel.toast("Order " + order.reference + " created. Awaiting verified payment.", "info");
          window.location.href = "checkout-result.html?ref=" + encodeURIComponent(order.reference) + "&status=pending";
        })
        .catch(function (err) {
          btn.disabled = false;
          btn.textContent = original;
          window.Phyzel.toast(err.message || "Could not create order.", "error");
        });
    });
  };

  function renderSummary() {
    var cart = window.Phyzel.getCart();
    var summaryEl = document.getElementById("checkoutSummary");
    var totalsEl = document.getElementById("checkoutTotals");
    if (!summaryEl || !totalsEl) return;
    if (!cart || !cart.items || cart.items.length === 0) {
      summaryEl.classList.remove("hidden");
      totalsEl.classList.add("hidden");
      return;
    }
    summaryEl.classList.add("hidden");
    totalsEl.classList.remove("hidden");
    var subtotal = window.Phyzel.cartSubtotal(cart);
    var hasFashion = cart.items.some(function (it) { return it.section === "fashion"; });
    var hasFood = cart.items.some(function (it) { return it.section === "food"; });
    var hasTrading = cart.items.some(function (it) { return it.section === "trading"; });
    var settings = window.Phyzel.getSettings();
    var deliveryFee = 0;
    if (hasFashion) deliveryFee += settings.deliveryFeeFashion || 25;
    if (hasFood) deliveryFee += settings.deliveryFeeFood || 25;
    if (hasTrading) deliveryFee += settings.deliveryFeeTrading || 35;
    var total = subtotal + deliveryFee;
    document.getElementById("summarySubtotal").textContent = window.Phyzel.formatMoney(subtotal);
    document.getElementById("summaryDeliveryFee").textContent = window.Phyzel.formatMoney(deliveryFee);
    document.getElementById("summaryTotal").textContent = window.Phyzel.formatMoney(total);
    var parts = [];
    if (hasFashion) parts.push("Fashion & Beauty delivery applied");
    if (hasFood) parts.push("Food delivery applied");
    if (hasTrading) parts.push("General Trading delivery applied");
    var noteRow = totalsEl.querySelector(".note-row");
    if (noteRow) {
      noteRow.querySelector(".note").textContent = parts.length ? parts.join(" · ") + ". Estimated commission: " + window.Phyzel.formatMoney(Math.round(subtotal * (settings.commissionRate || 0.05))) : "";
    }
    var existingItems = totalsEl.querySelector(".order-items");
    if (existingItems) existingItems.remove();
    var itemsHtml = "<div class='order-items' style='margin-top:12px;border-top:1px solid var(--color-border);padding-top:10px;'>";
    for (var i = 0; i < cart.items.length; i++) {
      var item = cart.items[i];
      itemsHtml +=
        "<div style='display:flex;justify-content:space-between;gap:12px;font-size:0.85rem;padding:4px 0;'>" +
        "<div>" +
        "<strong>" + window.Phyzel.escapeHtml(item.name) + "</strong>" +
        " <span class='text-subtle'>×" + item.quantity + "</span>" +
        "</div>" +
        "<strong>" + window.Phyzel.formatMoney((item.unitPrice || 0) * (item.quantity || 0)) + "</strong>" +
        "</div>";
    }
    itemsHtml += "</div>";
    var itemsList = totalsEl.querySelector(".cart-summary");
    if (itemsList) itemsList.insertAdjacentHTML("beforeend", itemsHtml);
  }
})();
