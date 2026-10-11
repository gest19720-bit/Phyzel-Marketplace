(function () {
  const P = window.Phyzel;

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('[data-auth-form]');
    if (!form) return;

    const mode = form.dataset.authForm;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('button');
      button.disabled = true;
      try {
        const data = Object.fromEntries(new FormData(form));
        const result = await P.request(mode === 'register' ? '/api/auth/register' : '/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
        P.toast(mode === 'register' ? 'Account created.' : 'Signed in.');
        location.href = result.user?.role === 'seller' ? 'seller-dashboard.html' : 'buyer-dashboard.html';
      } catch (error) {
        P.toast(error.message, 'error');
      } finally {
        button.disabled = false;
      }
    });
  });
}());
