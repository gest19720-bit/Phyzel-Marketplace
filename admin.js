(function () {
  "use strict";
  if (!window.Phyzel) return;

  window.Phyzel.renderAdminDashboard = function (root) {
    if (!root) return;
    var user = window.Phyzel.currentUser();
    if (!user || user.user.role !== "admin") {
      root.innerHTML =
        '<div class="card" style="max-width:560px;margin:40px auto;padding:30px;text-align:center;">' +
        '<div class="big-icon" style="margin:0 auto 14px;"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></div>' +
        '<h2 style="font-size:1.2rem;font-weight:700;margin-bottom:6px;">Admin access required</h2>' +
        '<p class="text-muted" style="margin-bottom:18px;">Only platform administrators can access this area.</p>' +
        '<a href="index.html" class="btn btn-primary">Back to homepage</a>' +
        "</div>";
      return;
    }

    var sections = window.Phyzel.SAMPLE_SECTIONS;
    var businesses = window.Phyzel.listBusinesses().filter(function (b) { return b.status === "active"; });
    var sellers = window.Phyzel.listSellerProfiles().filter(function (p) { return p.isActive && p.isApproved; });
    var applications = window.Phyzel.listSellerApplications().filter(function (a) {
      return a.status === "pending" || a.status === "under_review";
    });
    var listings = window.Phyzel.listListings().filter(function (l) { return l.status === "active" && !l.isHidden; });
    var orders = window.Phyzel.listOrders();
    var paidOrders = orders.filter(function (o) { return o.paymentStatus === "paid"; });
    var totalRevenue = paidOrders.reduce(function (sum, o) { return sum + o.total; }, 0);
    var totalCommission = orders.reduce(function (sum, o) { return sum + (o.commissionAmount || 0); }, 0);
    var recentOrders = orders.slice(0, 8);

    var html =
      '<nav aria-label="Breadcrumb" style="margin-bottom:18px;">' +
      '<ol style="display:flex;flex-wrap:wrap;gap:6px 10px;font-size:0.85rem;color:var(--color-text-subtle);list-style:none;">' +
      '<li><a href="index.html" style="color:var(--color-accent);">Home</a></li>' +
      '<li><span aria-hidden="true">/</span></li>' +
      '<li>Admin dashboard</li>' +
      "</ol></nav>";

    html +=
      '<div class="dashboard-shell">' +
      '<aside class="dashboard-sidebar">' +
      '<nav class="sidebar-nav">' +
      '<a href="admin-dashboard.html" class="active"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> Overview</a>' +
      '<a href="admin-businesses.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> Businesses</a>' +
      '<a href="admin-applications.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> Applications</a>' +
      '<a href="admin-listings.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg> Listings</a>' +
      '<a href="admin-orders.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg> Orders</a>' +
      '<a href="admin-settings.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> Settings</a>' +
      '<hr class="sep" />' +
      '<a href="login.html" id="adminLogoutLink"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg> Sign out</a>' +
      "</nav></aside>";

    html +=
      '<div class="dashboard-content">' +
      '<h2>Marketplace overview</h2>' +
      '<p class="subtitle">Live data from your local Phyzel Marketplace store.</p>';

    html +=
      '<div class="stats">' +
      '<div class="stat"><div class="num">' + businesses.length + "</div><div class='label'>Registered businesses</div></div>" +
      '<div class="stat"><div class="num accent">' + sellers.length + "</div><div class='label'>Approved sellers</div></div>" +
      '<div class="stat"><div class="num warning">' + applications.length + "</div><div class='label'>Pending applications</div></div>" +
      '<div class="stat"><div class="num">' + listings.length + "</div><div class='label'>Active listings</div></div>" +
      '<div class="stat"><div class="num">' + orders.length + "</div><div class='label'>Total orders</div></div>" +
      '<div class="stat"><div class="num accent">' + paidOrders.length + "</div><div class='label'>Verified orders</div></div>" +
      '<div class="stat"><div class="num trading">' + window.Phyzel.formatMoney(totalRevenue) + "</div><div class='label'>Verified revenue (GHS)</div></div>" +
      '<div class="stat"><div class="num fashion">' + window.Phyzel.formatMoney(totalCommission) + "</div><div class='label'>Recorded commission (GHS)</div></div>" +
      "</div>";

    html +=
      '<h3 style="font-size:1.05rem;font-weight:700;margin:22px 0 12px;">Listings by section</h3>' +
      '<div class="grid-2">';
    sections.forEach(function (s) {
      var count = listings.filter(function (l) { return l.section === s.slug; }).length;
      var colorClass = s.slug === "fashion" ? "fashion" : s.slug === "food" ? "food" : "trading";
      html +=
        '<div class="card" style="padding:16px 18px;border-left:4px solid var(--color-' + colorClass + ');">' +
        '<div style="font-size:1.5rem;font-weight:800;color:var(--color-' + colorClass + ');">' + count + "</div>" +
        '<div style="font-weight:600;margin-top:4px;">' + s.name + "</div>" +
        '<div class="text-small text-subtle">' + count + " active listing" + (count === 1 ? "" : "s") + "</div>" +
        "</div>";
    });
    html += "</div>";

    html +=
      '<h3 style="font-size:1.05rem;font-weight:700;margin:22px 0 12px;">Recent orders</h3>';
    if (recentOrders.length === 0) {
      html +=
        '<div class="empty-state">' +
        '<div class="big-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg></div>' +
        "<h3>No orders yet</h3>" +
        '<p class="text-muted">Orders will appear here when customers check out.</p>' +
        "</div>";
    } else {
      html +=
        '<div class="table-wrap"><table class="data"><thead><tr>' +
        "<th>Reference</th>" +
        "<th>Customer</th>" +
        "<th>Payment</th>" +
        "<th>Status</th>" +
        "<th>Total</th>" +
        "<th>Created</th>" +
        "</tr></thead><tbody>";
      for (var i = 0; i < recentOrders.length; i++) {
        var o = recentOrders[i];
        var paymentClass = o.paymentStatus === "paid" ? "status-paid" :
          o.paymentStatus === "failed" ? "status-failed" :
          o.paymentStatus === "refunded" ? "status-rejected" : "status-pending-pay";
        var statusClass = o.status === "paid" ? "status-paid" :
          o.status === "failed" ? "status-failed" :
          o.status === "refunded" ? "status-rejected" : "status-pending";
        html +=
          "<tr>" +
          '<td><strong>' + window.Phyzel.escapeHtml(o.reference) + "</strong></td>" +
          '<td>' + window.Phyzel.escapeHtml(o.customerName || "—") +
          '<div class="text-small text-subtle">' + window.Phyzel.escapeHtml(o.customerEmail || "") + "</div></td>" +
          '<td><span class="status ' + paymentClass + '">' + o.paymentStatus + "</span></td>" +
          '<td><span class="status ' + statusClass + '">' + o.status + "</span></td>" +
          '<td>' + window.Phyzel.formatMoney(o.total) + "</td>" +
          '<td class="text-small text-subtle">' + (o.createdAt ? o.createdAt.slice(0, 10) : "—") + "</td>" +
          "</tr>";
      }
      html += "</tbody></table></div>";
    }

    html +=
      '<div class="alert alert-warning" style="margin-top:18px;font-size:0.82rem;">' +
      '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>' +
      '<span>Verify all admin actions. Never mark orders as paid unless a payment has been verified.</span>' +
      "</div>";

    html += "</div></div>";

    root.innerHTML = html;

    var logoutLink = root.querySelector("#adminLogoutLink");
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
