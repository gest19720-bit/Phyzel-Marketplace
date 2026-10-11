(function () {
  "use strict";
  if (!window.Phyzel) return;

  window.Phyzel.renderSellerDashboard = function (root) {
    if (!root) return;
    var user = window.Phyzel.currentUser();
    if (!user) {
      root.innerHTML =
        '<div class="card" style="max-width:520px;margin:40px auto;padding:30px;text-align:center;">' +
        '<div class="big-icon" style="margin:0 auto 14px;"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg></div>' +
        '<h2 style="font-size:1.2rem;font-weight:700;margin-bottom:6px;">Sign in required</h2>' +
        '<p class="text-muted" style="margin-bottom:18px;">Seller dashboards are for approved sellers only.</p>' +
        '<a href="login.html" class="btn btn-primary">Sign in</a>' +
        '<a href="seller-application.html" class="btn btn-secondary" style="margin-left:10px;">Apply to sell</a>' +
        "</div>";
      return;
    }
    var profile = window.Phyzel.getSellerProfileByUserId(user.user.id);
    if (!profile) {
      root.innerHTML =
        '<div class="card" style="max-width:560px;margin:40px auto;padding:30px;text-align:center;">' +
        '<div class="big-icon" style="margin:0 auto 14px;"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>' +
        '<h2 style="font-size:1.2rem;font-weight:700;margin-bottom:6px;">Apply to become a seller</h2>' +
        '<p class="text-muted" style="margin-bottom:18px;max-width:420px;">You don’t have a seller profile yet. Submit an application and our team will review it.</p>' +
        '<a href="seller-application.html" class="btn btn-primary">Start seller application</a>' +
        '<a href="customer-dashboard.html" class="btn btn-secondary" style="margin-left:10px;">My account</a>' +
        "</div>";
      return;
    }
    if (!profile.isActive) {
      root.innerHTML =
        '<div class="card" style="max-width:560px;margin:40px auto;padding:30px;text-align:center;">' +
        '<div class="big-icon" style="margin:0 auto 14px;"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg></div>' +
        '<h2 style="font-size:1.2rem;font-weight:700;margin-bottom:6px;color:var(--color-danger);">Seller account inactive</h2>' +
        '<p class="text-muted" style="margin-bottom:18px;">Your seller account has been deactivated.</p>' +
        '<a href="customer-dashboard.html" class="btn btn-primary">My account</a>' +
        "</div>";
      return;
    }
    if (!profile.isApproved) {
      root.innerHTML =
        '<div class="card" style="max-width:560px;margin:40px auto;padding:30px;text-align:center;">' +
        '<div class="big-icon" style="margin:0 auto 14px;"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>' +
        '<h2 style="font-size:1.2rem;font-weight:700;margin-bottom:6px;color:var(--color-warning);">Application pending</h2>' +
        '<p class="text-muted" style="margin-bottom:18px;">Your seller application is being reviewed.</p>' +
        '<a href="seller-application.html" class="btn btn-primary">View application info</a>' +
        '<a href="customer-dashboard.html" class="btn btn-secondary" style="margin-left:10px;">My account</a>' +
        "</div>";
      return;
    }

    var stats = window.Phyzel.sellerSalesSummary(profile.id);
    var orders = window.Phyzel.getOrdersForSeller(profile.id);
    var recentOrders = orders.slice(0, 6);

    var html =
      '<nav aria-label="Breadcrumb" style="margin-bottom:18px;">' +
      '<ol style="display:flex;flex-wrap:wrap;gap:6px 10px;font-size:0.85rem;color:var(--color-text-subtle);list-style:none;">' +
      '<li><a href="index.html" style="color:var(--color-accent);">Home</a></li>' +
      '<li><span aria-hidden="true">/</span></li>' +
      '<li>Seller dashboard</li>' +
      "</ol></nav>";

    html +=
      '<div class="dashboard-shell">' +
      '<aside class="dashboard-sidebar">' +
      '<nav class="sidebar-nav">' +
      '<a href="seller-dashboard.html" class="active"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> Overview</a>' +
      '<a href="seller-listings.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg> Listings</a>' +
      '<a href="seller-orders.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg> Orders</a>' +
      '<a href="seller-profile.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> Profile</a>' +
      '<a href="customer-dashboard.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> My account</a>' +
      '<hr class="sep" />' +
      '<a href="login.html" id="sellerLogoutLink"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg> Sign out</a>' +
      "</nav></aside>";

    html +=
      '<div class="dashboard-content">' +
      '<h2>' + window.Phyzel.escapeHtml(profile.storeName) + "</h2>" +
      '<p class="subtitle">' + window.Phyzel.escapeHtml(profile.location) + ' · Approved seller</p>';

    html +=
      '<div class="stats">' +
      '<div class="stat"><div class="num">' + (stats.totalOrders || 0) + "</div><div class='label'>Orders</div></div>" +
      '<div class="stat"><div class="num accent">' + (stats.paidOrders || 0) + "</div><div class='label'>Paid orders</div></div>" +
      '<div class="stat"><div class="num">' + window.Phyzel.formatMoney(stats.totalRevenue) + "</div><div class='label'>Revenue (paid)</div></div>" +
      '<div class="stat"><div class="num">' + (stats.totalUnits || 0) + "</div><div class='label'>Units sold (paid)</div></div>" +
      "</div>";

    html +=
      '<div class="alert alert-success" style="margin-bottom:18px;">' +
      '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>' +
      '<span>You can publish and manage your listings now. <a href="seller-listings.html" style="font-weight:600;">Manage listings</a></span>' +
      "</div>";

    html += '<h3 style="font-size:1.05rem;font-weight:700;margin-bottom:12px;">Recent orders referencing your listings</h3>';
    if (recentOrders.length === 0) {
      html +=
        '<div class="empty-state">' +
        '<div class="big-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg></div>' +
        "<h3>No orders yet</h3>" +
        '<p class="text-muted">Orders will appear here when customers buy your listings.</p>' +
        '<a href="seller-listings.html" class="btn btn-primary btn-small" style="margin-top:6px;">Add a listing</a>' +
        "</div>";
    } else {
      html +=
        '<div class="table-wrap"><table class="data"><thead><tr>' +
        "<th>Reference</th>" +
        "<th>Payment</th>" +
        "<th>Total</th>" +
        "<th>Created</th>" +
        "</tr></thead><tbody>";
      for (var i = 0; i < recentOrders.length; i++) {
        var o = recentOrders[i];
        var paymentClass = o.paymentStatus === "paid" ? "status-paid" :
          o.paymentStatus === "failed" ? "status-failed" :
          o.paymentStatus === "refunded" ? "status-rejected" : "status-pending-pay";
        html +=
          "<tr>" +
          '<td><strong>' + window.Phyzel.escapeHtml(o.reference) + "</strong>" +
          '<div class="text-small text-subtle">' + window.Phyzel.escapeHtml(o.customerName.split(" ")[0]) + "</div></td>" +
          '<td><span class="status ' + paymentClass + '">' + o.paymentStatus + "</span></td>" +
          '<td>' + window.Phyzel.formatMoney(o.total) + "</td>" +
          '<td class="text-small text-subtle">' + (o.createdAt ? o.createdAt.slice(0, 10) : "—") + "</td>" +
          "</tr>";
      }
      html += "</tbody></table></div>";
    }

    html += '<p class="text-small text-subtle" style="margin-top:12px;">Only orders with verified payments are counted as completed sales.</p>';

    html += "</div></div>";

    root.innerHTML = html;

    var logoutLink = root.querySelector("#sellerLogoutLink");
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
