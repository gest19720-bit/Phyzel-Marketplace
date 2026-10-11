(function () {
  "use strict";
  if (!window.Phyzel) return;

  window.Phyzel.renderCartPage = function (root) {
    if (!root) return;
    var cart = window.Phyzel.getCart();
    if (!cart || !cart.items || cart.items.length === 0) {
      root.innerHTML =
        '<div class="empty-cart">' +
        '<div class="big-icon"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg></div>' +
        '<h3>Your cart is empty</h3>' +
        '<p>Add items from any marketplace section to get started.</p>' +
        '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
        '<a href="fashion-beauty.html" class="btn btn-primary btn-small">Fashion &amp; Beauty</a>' +
        '<a href="food.html" class="btn btn-secondary btn-small">Food</a>' +
        '<a href="general-trading.html" class="btn btn-secondary btn-small">General Trading</a>' +
        "</div>" +
        "</div>";
      return;
    }

    var rows = cart.items.map(function (item) {
      var img = item.image ? item.image : "https://placehold.co/120x120/eef2f6/1a202c?text=Item";
      var lineTotal = (item.unitPrice || 0) * (item.quantity || 0);
      return (
        "<tr>" +
        '<td><div class="cart-item-img"><img src="' +
        window.Phyzel.escapeAttr(img) +
        '" alt="" /></div></td>' +
        '<td style="width:40%;">' +
        '<div style="font-weight:600;">' +
        window.Phyzel.escapeHtml(item.name) +
        "</div>" +
        '<div class="text-small text-subtle">' +
        window.Phyzel.escapeHtml(item.category || "") +
        ' · ' +
        window.Phyzel.formatMoney(item.unitPrice) +
        "</div></td>" +
        '<td style="width:120px;">' +
        '<div class="qty" style="display:inline-flex;align-items:center;border:1px solid var(--color-border-strong);border-radius:var(--radius-pill);overflow:hidden;">' +
        '<button type="button" class="cart-qty-minus" data-listing-id="' +
        item.listingId +
        '" style="width:32px;height:32px;background:var(--color-bg);border:none;cursor:pointer;font-weight:700;">−</button>' +
        '<input type="number" class="cart-qty-input" data-listing-id="' +
        item.listingId +
        '" value="' +
        item.quantity +
        '" min="0" style="width:44px;height:32px;text-align:center;border:none;border-left:1px solid var(--color-border);border-right:1px solid var(--color-border);font-weight:600;" />' +
        '<button type="button" class="cart-qty-plus" data-listing-id="' +
        item.listingId +
        '" style="width:32px;height:32px;background:var(--color-bg);border:none;cursor:pointer;font-weight:700;">+</button>' +
        "</div></td>" +
        '<td style="width:100px;" class="text-right">' +
        window.Phyzel.formatMoney(lineTotal) +
        "</td>" +
        '<td style="width:80px;" class="text-right">' +
        '<button type="button" class="btn btn-ghost btn-small cart-remove-btn" data-listing-id="' +
        item.listingId +
        '" style="color:var(--color-danger);border-color:#f3c2c2;padding:6px 10px;">Remove</button>' +
        "</td>" +
        "</tr>"
      );
    });

    var subtotal = window.Phyzel.cartSubtotal(cart);
    var totalItems = window.Phyzel.cartItemCount(cart);

    var hasFashion = cart.items.some(function (it) { return it.section === "fashion"; });
    var hasFood = cart.items.some(function (it) { return it.section === "food"; });
    var hasTrading = cart.items.some(function (it) { return it.section === "trading"; });

    var settings = window.Phyzel.getSettings();
    var deliveryFee = 0;
    if (hasFashion) deliveryFee += settings.deliveryFeeFashion || 25;
    if (hasFood) deliveryFee += settings.deliveryFeeFood || 25;
    if (hasTrading) deliveryFee += settings.deliveryFeeTrading || 35;

    var total = subtotal + deliveryFee;

    root.innerHTML =
      '<div class="card" style="overflow:hidden;">' +
      '<table class="cart-table" style="margin:0;">' +
      '<thead><tr>' +
      '<th style="width:80px;">Item</th>' +
      '<th>Details</th>' +
      '<th style="width:120px;">Quantity</th>' +
      '<th style="width:100px;" class="text-right">Line total</th>' +
      '<th style="width:90px;" class="text-right"></th>' +
      '</tr></thead>' +
      "<tbody>" +
      rows.join("") +
      "</tbody></table>" +
      "</div>" +
      '<div class="cart-summary">' +
      '<div class="row"><span>Items (' +
      totalItems +
      ")</span><span></span></div>" +
      '<div class="row"><span>Subtotal</span><span><strong>' +
      window.Phyzel.formatMoney(subtotal) +
      "</strong></span></div>" +
      '<div class="row"><span>Delivery fee</span><span><strong>' +
      window.Phyzel.formatMoney(deliveryFee) +
      "</strong></span></div>" +
      '<div class="row note"><span class="note">Estimated commission: ' +
      window.Phyzel.formatMoney(Math.round(subtotal * (settings.commissionRate || 0.05))) +
      " (applied on verified payments)</span></div>" +
      '<div class="row total"><span>Total</span><span class="val">' +
      window.Phyzel.formatMoney(total) +
      "</span></div>" +
      '<div class="row note"><span class="note">Prices are recalculated at checkout.</span></div>' +
      '<a href="checkout.html" class="btn btn-primary checkout-btn" style="margin-top:14px;">Continue to checkout</a>' +
      '<div style="margin-top:10px;"><a href="fashion-beauty.html" class="btn-link">Continue shopping</a></div>' +
      "</div>";

    var cartEl = root.querySelector(".card");
    if (!cartEl) return;

    cartEl.querySelectorAll(".cart-qty-minus").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-listing-id");
        var input = cartEl.querySelector('.cart-qty-input[data-listing-id="' + id + '"]');
        if (!input) return;
        var v = parseInt(input.value, 10) || 0;
        if (v > 0) {
          window.Phyzel.updateCart(id, v - 1).then(function () {
            window.Phyzel.renderCartPage(root);
          }).catch(function (err) {
            window.Phyzel.toast(err.message || "Could not update quantity.", "error");
          });
        }
      });
    });

    cartEl.querySelectorAll(".cart-qty-plus").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-listing-id");
        var input = cartEl.querySelector('.cart-qty-input[data-listing-id="' + id + '"]');
        if (!input) return;
        var v = parseInt(input.value, 10) || 0;
        if (v < 99) {
          window.Phyzel.updateCart(id, v + 1).then(function () {
            window.Phyzel.renderCartPage(root);
          }).catch(function (err) {
            window.Phyzel.toast(err.message || "Could not update quantity.", "error");
          });
        }
      });
    });

    cartEl.querySelectorAll(".cart-qty-input").forEach(function (input) {
      input.addEventListener("change", function () {
        var id = input.getAttribute("data-listing-id");
        var v = parseInt(input.value, 10);
        if (isNaN(v) || v < 0) v = 0;
        window.Phyzel.updateCart(id, v).then(function () {
          window.Phyzel.renderCartPage(root);
        }).catch(function (err) {
          window.Phyzel.toast(err.message || "Could not update quantity.", "error");
        });
      });
    });

    cartEl.querySelectorAll(".cart-remove-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-listing-id");
        window.Phyzel.removeFromCart(id).then(function () {
          window.Phyzel.toast("Item removed from cart.");
          window.Phyzel.renderCartPage(root);
        }).catch(function (err) {
          window.Phyzel.toast(err.message || "Could not remove item.", "error");
        });
      });
    });
  };
})();
