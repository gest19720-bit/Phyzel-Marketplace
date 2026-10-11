(function () {
  const P = window.Phyzel;

  function message(form, text, type = 'error') {
    let node = form.querySelector('.form-message');
    if (!node) {
      node = document.createElement('div');
      node.className = 'form-message notice';
      form.prepend(node);
    }
    node.className = `form-message notice ${type}`;
    node.textContent = text;
  }

  function formData(form) {
    const data = Object.fromEntries(new FormData(form));
    const terms = form.querySelector('[name="termsAccepted"]');
    data.termsAccepted = Boolean(terms?.checked);
    return data;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const buyer = document.querySelector('[data-buyer-registration]');
    if (buyer) buyer.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = buyer.querySelector('button[type="submit"]');
      button.disabled = true;
      try {
        const data = Object.fromEntries(new FormData(buyer));
        data.acceptTerms = buyer.querySelector('[name="acceptTerms"]').checked;
        const result = await P.request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
        sessionStorage.setItem('phyzel_onboarding_session', 'buyer');
        message(buyer, result.devVerificationUrl ? `Account created. For local testing, verify here: ${result.devVerificationUrl}` : result.message, 'success');
      } catch (error) {
        message(buyer, error.message);
        button.disabled = false;
      }
    });

    const seller = document.querySelector('[data-seller-registration]');
    if (!seller) return;

    const draftKey = 'phyzel_seller_application_draft';
    const draft = JSON.parse(localStorage.getItem(draftKey) || '{}');
    Object.entries(draft).forEach(([key, value]) => {
      const input = seller.elements[key];
      if (input && input.type !== 'checkbox' && input.type !== 'password') input.value = value;
      if (input?.type === 'checkbox') input.checked = Boolean(value);
    });

    const save = () => {
      const values = formData(seller);
      delete values.password;
      delete values.passwordConfirmation;
      localStorage.setItem(draftKey, JSON.stringify(values));
    };
    seller.addEventListener('input', save);
    seller.querySelector('[data-save-draft]').addEventListener('click', async () => {
      save();
      try {
        const user = await P.me();
        if (!user) {
          message(seller, 'Your draft is saved in this browser. Create the seller account to save it to Phyzel.', 'success');
          return;
        }
        await P.request('/api/seller/application', { method: 'PUT', body: JSON.stringify(formData(seller)) });
        message(seller, 'Draft saved to your account.', 'success');
      } catch (error) {
        message(seller, error.message);
      }
    });

    seller.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = seller.querySelector('button[type="submit"]');
      button.disabled = true;
      const data = formData(seller);
      try {
        const user = await P.me();
        if (!user) {
          const result = await P.request('/api/auth/register', { method: 'POST', body: JSON.stringify({ ...data, name: data.applicantName, acceptTerms: data.termsAccepted, accountType: 'seller' }) });
          message(seller, result.devVerificationUrl ? `Account created and application saved. For local testing, verify here: ${result.devVerificationUrl}, then sign in to submit it.` : result.message, 'success');
          return;
        }
        await P.request('/api/seller/application', { method: 'PUT', body: JSON.stringify(data) });
        const result = await P.request('/api/seller/application/submit', { method: 'POST' });
        message(seller, result.message, 'success');
      } catch (error) {
        message(seller, error.message);
        button.disabled = false;
      }
    });
  });
}());
