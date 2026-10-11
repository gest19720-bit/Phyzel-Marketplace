(function () {
  const P = window.Phyzel;
  const marketplaceNames = {
    fashion: 'Fashion Marketplace',
    food: 'Food Marketplace',
    trading: 'Trading Marketplace'
  };

  function card(listing) {
    return `<article class="listing-card"><img src="${P.escape(listing.image_url)}" alt="${P.escape(listing.title)}"><div class="listing-card-body"><span class="pill">${P.escape(listing.type)}</span><h3><a href="listing.html?id=${P.escape(listing.slug)}">${P.escape(listing.title)}</a></h3><p class="muted small">${P.escape(listing.business.name)} · ${P.escape(listing.category)}</p><div class="card-actions"><strong class="price">${P.money(listing.price, listing.currency)}</strong><a class="btn btn-secondary" href="listing.html?id=${P.escape(listing.slug)}">View</a></div></div></article>`;
  }

  function emptyState(type) {
    const marketplaceName = marketplaceNames[type] || 'the marketplace';
    return `<div class="notice marketplace-empty" role="status"><h3>No listings yet</h3><p>There are currently no listings in the ${P.escape(marketplaceName)}. Please check back soon.</p></div>`;
  }

  async function load() {
    const root = document.querySelector('[data-listings]');
    if (!root) return;

    const params = new URLSearchParams(location.search);
    try {
      const data = await P.request('/api/listings?' + params);
      root.innerHTML = data.listings.length
        ? data.listings.map(card).join('')
        : emptyState(params.get('type'));
    } catch (error) {
      root.innerHTML = `<div class="notice error" role="alert">${P.escape(error.message || 'Listings are temporarily unavailable.')}</div>`;
    }
  }

  window.Phyzel.card = card;
  document.addEventListener('DOMContentLoaded', load);
}());
