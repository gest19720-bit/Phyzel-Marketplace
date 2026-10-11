(function () {
  "use strict";
  if (!window.Phyzel) return;

  window.Phyzel.renderCustomerDashboard = function (root) {
    if (!root) return;
    var user = window.Phyzel.currentUser();
    if (!user) {
      root.innerHTML =
        '<div class="card" style="max-width:520px;margin:40px auto;padding:30px;text-align:center;">' +
        '<div class="big-icon" style="margin:0 auto 14px;"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg></div>' +
        '<h2 style="font-size:1.2rem;font-weight:700;margin-bottom:6px;">Sign in required</h2>' +
        '<p class="text-muted" style="margin-bottom:18px;">Customer accounts are for customers only. Please sign in to continue.</p>' +
        '<a href="login.html" class="btn btn-primary">Sign in</a>' +
        '<a href="register.html" class="btn btn-secondary" style="margin-left:10px;">Create account</a>' +
        '<div style="margin-top:18px;"><a href="index.html" class="btn-link">Back to homepage</a></div>' +
        "</div>";
      return;
    }
    var orders = window.Phyzel.getOrdersForUser(user.user.id);
    var paidOrders = orders.filter(function (o) { return o.paymentStatus === "paid"; }).length;
    var totalSpent = orders.reduce(function (sum, o) { return sum + (o.paymentStatus === "paid" ? o.total : 0); }, 0);
    var sellerProfile = window.Phyzel.getSellerProfileByUserId(user.user.id);

    var html =
      '<nav aria-label="Breadcrumb" style="margin-bottom:18px;">' +
      '<ol style="display:flex;flex-wrap:wrap;gap:6px 10px;font-size:0.85rem;color:var(--color-text-subtle);list-style:none;">' +
      '<li><a href="index.html" style="color:var(--color-accent);">Home</a></li>' +
      '<li><span aria-hidden="true">/</span></li>' +
      '<li>My account</li>' +
      "</ol></nav>";

    html +=
      '<div class="dashboard-shell">' +
      '<aside class="dashboard-sidebar">' +
      '<nav class="sidebar-nav">' +
      '<a href="customer-dashboard.html" class="active"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> My account</a>' +
      '<a href="cart.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg> Cart</a>' +
      '<a href="index.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M10 9h4" /><path d="M10 13h4" /></svg> Browse marketplace</a>' +
      '<hr class="sep" />' +
      '<a href="login.html" id="accountLogoutLink"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg> Sign out</a>' +
      "</nav></aside>";

    html +=
      '<div class="dashboard-content">' +
      '<h2>Welcome back, ' + window.Phyzel.escapeHtml(user.user.name) + "</h2>" +
      '<p class="subtitle">' + window.Phyzel.escapeHtml(user.user.email) + (user.user.phone ? " · " + window.Phyzel.escapeHtml(user.user.phone) : "") + "</p>";

    html +=
      '<div class="stats">' +
      '<div class="stat"><div class="num">' + orders.length + "</div><div class='label'>Orders</div></div>" +
      '<div class="stat"><div class="num accent">' + paidOrders + "</div><div class='label'>Paid orders</div></div>" +
      '<div class="stat"><div class="num">' + window.Phyzel.formatMoney(totalSpent) + "</div><div class='label'>Spent (paid orders)</div></div>" +
      "</div>";

    if (!sellerProfile) {
      html +=
        '<div class="alert alert-info" style="margin-bottom:18px;">' +
        '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>' +
        '<span>You don’t have a seller profile yet. <a href="seller-application.html" style="font-weight:600;">Apply to become a seller</a>.</span>' +
        "</div>";
    } else if (!sellerProfile.isApproved) {
      html +=
        '<div class="alert alert-warning" style="margin-bottom:18px;">' +
        '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>' +
        '<span>Your seller application is <strong>pending</strong>.</span>' +
        "</div>";
    } else {
      html +=
        '<div class="alert alert-success" style="margin-bottom:18px;">' +
        '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>' +
        '<span>Your seller profile <strong>' + window.Phyzel.escapeHtml(sellerProfile.storeName) + "</strong> is active. <a href='seller-dashboard.html' style='font-weight:600;">Seller dashboard</a></span>" +
        "</div>";
    }

    html += '<h3 style="font-size:1.05rem;font-weight:700;margin-bottom:12px;">Order history</h3>';
    if (orders.length === 0) {
      html +=
        '<div class="empty-state">' +
        '<div class="big-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg></div>' +
        "<h3>No orders yet</h3>" +
        '<p class="text-muted">When you place an order, it will appear here.</p>' +
        '<a href="fashion-beauty.html" class="btn btn-primary btn-small" style="margin-top:6px;">Browse fashion</a>' +
        '<a href="food.html" class="btn btn-secondary btn-small" style="margin-left:6px;">Browse food</a>' +
        '<a href="general-trading.html" class="btn btn-secondary btn-small" style="margin-left:6px;">Browse trading</a>' +
        "</div>";
    } else {
      html +=
        '<div class="table-wrap"><table class="data"><thead><tr>' +
        "<th>Reference</th>" +
        "<th>Status</th>" +
        "<th>Total</th>" +
        "<th>Created</th>" +
        "<th></th>" +
        "</tr></thead><tbody>";
      for (var i = 0; i < orders.length; i++) {
        var o = orders[i];
        var statusClass = o.paymentStatus === "paid" ? "status-paid" :
          o.paymentStatus === "failed" ? "status-failed" :
          o.paymentStatus === "refunded" ? "status-rejected" : "status-pending-pay";
        html +=
          "<tr>" +
          '<td><strong>' + window.Phyzel.escapeHtml(o.reference) + "</strong>" +
          '<div class="text-small text-subtle">' + o.items.length + " item" + (o.items.length === 1 ? "" : "s") + "</div></td>" +
          '<td><span class="status ' + statusClass + '">' + o.paymentStatus + "</span></td>" +
          '<td>' + window.Phyzel.formatMoney(o.total) + "</td>" +
          '<td class="text-small text-subtle">' + (o.createdAt ? o.createdAt.slice(0, 10) : "—") + "</td>" +
          '<td><a href="order-detail.html?id=' + window.Phyzel.escapeAttr(o.id) + '" class="btn btn-ghost btn-small">View</a></td>' +
          "</tr>";
      }
      html += "</tbody></table></div>";
    }

    html +=
      '<div class="alert alert-info" style="margin-top:18px;font-size:0.82rem;">' +
      '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>' +
      '<span>Orders are marked paid only after a verified payment event.</span>' +
      "</div>";

    html += "</div></div>";

    root.innerHTML = html;

    var logoutLink = root.querySelector("#accountLogoutLink");
    if (logoutLink) {
      logoutLink.addEventListener("click", function (e) {
        e.preventDefault();
        window.Phyzel.logout();
        window.Phyzel.toast("You’ve been signed out.");
        window.location.href = "index.html";
      });
    }
  };
})();
