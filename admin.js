(function () {
  const P = window.Phyzel;

  function accessDenied(root, title, detail) {
    root.innerHTML = `<div class="form-shell"><h1>${P.escape(title)}</h1><p class="muted">${P.escape(detail)}</p><a class="btn btn-primary" href="login.html">Sign in</a></div>`;
  }

  function stat(label, value, tone = '') {
    return `<div class="admin-card"><div style="font-size:1.8rem;font-weight:800;color:${tone || 'var(--green)'}">${P.escape(value)}</div><div class="small muted">${P.escape(label)}</div></div>`;
  }

  function orderRows(orders) {
    if (!orders.length) return '<div class="notice">No orders have been recorded yet.</div>';
    return `<div style="overflow:auto"><table class="table"><thead><tr><th>Reference</th><th>Status</th><th>Total</th><th>Created</th></tr></thead><tbody>${orders.map((order) => `<tr><td>${P.escape(order.reference)}</td><td>${P.escape(order.payment_status)}</td><td>${P.money(order.total, order.currency)}</td><td>${P.escape(order.created_at.slice(0, 10))}</td></tr>`).join('')}</tbody></table></div>`;
  }

  async function render(root) {
    if (!root) return;
    try {
      const user = await P.me();
      if (!user) return accessDenied(root, 'Sign in required', 'Sign in with an administrator account to access the dashboard.');
      if (user.role !== 'admin') return accessDenied(root, 'Admin access required', 'This area is limited to platform administrators.');

      const data = await P.request('/api/admin/overview');
      const c = data.counts;
      root.innerHTML = `<div class="section-head"><div><div class="eyebrow">Administration</div><h1>Marketplace overview</h1><p class="muted">Authenticated operational data from Phyzel Marketplace.</p></div><button class="btn btn-secondary" type="button" data-admin-refresh>Refresh</button></div><div class="grid">${stat('Registered businesses', c.businesses)}${stat('Approved sellers', c.approvedSellers)}${stat('Pending applications', c.pendingApplications, 'var(--gold)')}${stat('Published listings', c.publishedListings)}${stat('Total orders', c.totalOrders)}${stat('Paid orders', c.paidOrders)}${stat('Verified revenue', P.money(c.verifiedRevenue, 'GHS'))}${stat('Recorded commission', P.money(c.recordedCommission, 'GHS'))}</div><div class="section" style="padding:32px 0 0"><div class="section-head"><div><h2>Recent orders</h2><p class="muted">Only verified payment totals are included in revenue.</p></div><a class="btn btn-secondary" href="admin-applications.html">Review applications</a></div>${orderRows(data.recentOrders)}</div>`;
      root.querySelector('[data-admin-refresh]').addEventListener('click', () => render(root));
    } catch (error) {
      root.innerHTML = `<div class="notice error" role="alert">${P.escape(error.message || 'The admin dashboard is temporarily unavailable.')}</div>`;
    }
  }

  window.Phyzel.renderAdminDashboard = render;
}());
