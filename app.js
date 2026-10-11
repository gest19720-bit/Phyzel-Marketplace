(function () {
  'use strict';
  const P = window.Phyzel = window.Phyzel || {};
  P.escape = function (value) { const node = document.createElement('div'); node.textContent = String(value ?? ''); return node.innerHTML; };
  P.money = function (cents, currency = 'GHS') { return new Intl.NumberFormat('en-GH', { style: 'currency', currency }).format(Number(cents || 0) / 100); };
  P.request = async function (url, options = {}) { const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || 'Request failed'); return data; };
  P.me = async function () { return (await P.request('/api/me')).user; };
  P.toast = function (message, type = 'success') { const node = document.createElement('div'); node.className = `notice ${type}`; node.textContent = message; Object.assign(node.style, { position: 'fixed', right: '18px', bottom: '18px', zIndex: 50, maxWidth: '360px' }); document.body.appendChild(node); setTimeout(() => node.remove(), 4000); };

  function showRoleModal() {
    if (document.body.dataset.roleModalReady || location.pathname !== '/' && !location.pathname.endsWith('/index.html')) return;
    document.body.dataset.roleModalReady = 'true';
    if (sessionStorage.getItem('phyzel_onboarding_session') || localStorage.getItem('phyzel_role_dismissed')) return;
    P.me().then((user) => {
      if (user) return;
      const overlay = document.createElement('div');
      overlay.className = 'role-modal-backdrop';
      overlay.innerHTML = `<section class="role-modal" role="dialog" aria-modal="true" aria-labelledby="roleModalTitle"><button class="role-modal-close" type="button" aria-label="Continue browsing">×</button><div class="eyebrow">Start here</div><h2 id="roleModalTitle">Welcome to Phyzel Marketplace</h2><p>Choose how you want to use Phyzel. You can always browse as a guest.</p><div class="role-choice-grid"><a class="role-choice" data-role="buyer" href="buyer-register.html"><strong>Be a Buyer</strong><span>Browse products, use your cart, check out, and manage orders.</span><b>Continue as Buyer →</b></a><a class="role-choice" data-role="seller" href="seller-register.html"><strong>Be a Seller</strong><span>Apply to sell, save your business details, and manage listings after approval.</span><b>Apply as a Seller →</b></a><a class="role-choice" data-role="guest" href="index.html"><strong>Continue as a Guest</strong><span>Browse marketplaces and listing details without creating an account.</span><b>Browse as Guest →</b></a></div></section>`;
      document.body.appendChild(overlay);
      const close = () => { overlay.remove(); localStorage.setItem('phyzel_role_dismissed', 'true'); };
      overlay.querySelector('.role-modal-close').onclick = close;
      overlay.querySelectorAll('[data-role="guest"]').forEach((link) => link.addEventListener('click', close));
      overlay.querySelectorAll('[data-role="buyer"],[data-role="seller"]').forEach((link) => link.addEventListener('click', () => sessionStorage.setItem('phyzel_onboarding_session', link.dataset.role)));
      overlay.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
      overlay.querySelector('.role-modal-close').focus();
    }).catch(() => {});
  }

  P.init = async function () {
    const user = await P.me().catch(() => null);
    document.querySelectorAll('[data-auth-link]').forEach((link) => { link.textContent = user ? 'My account' : 'Sign in'; link.href = user ? (user.role === 'seller' ? 'seller-dashboard.html' : 'buyer-dashboard.html') : 'login.html'; });
    showRoleModal();
    return user;
  };
  document.addEventListener('DOMContentLoaded', () => P.init());
}());
