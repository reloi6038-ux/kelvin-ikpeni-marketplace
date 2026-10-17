import { api, formatNaira, renderStars } from '../api.js';
import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { productCard } from '../components/productCard.js';
import { toast } from '../components/toast.js';
import { auth } from '../auth.js';

const PLACEHOLDER = '/images/placeholders/product.svg';

const $ = (id) => document.getElementById(id);
const setText = (id, text) => { const el = $(id); if (el) el.textContent = text; };
const setHTML = (id, html) => { const el = $(id); if (el) el.innerHTML = html; };

const state = { product: null, quantity: 1 };

// ─── IMAGE RENDERING ───
const renderImage = (p) => {
  const img = $('pdp-image');
  if (!img) return;

  // Build candidate URLs from multiple sources, in priority order
  const candidates = [
    p.thumbnail,
    ...(Array.isArray(p.images) ? p.images : []),
  ].filter(Boolean);

  console.log('[product.js] Image candidates:', candidates);

  if (!candidates.length) {
    console.warn('[product.js] No image URLs found on product');
    img.src = PLACEHOLDER;
    return;
  }

  // Try the first candidate; fall back on error
  let i = 0;
  const tryNext = () => {
    if (i >= candidates.length) {
      console.warn('[product.js] All image URLs failed. Using placeholder.');
      img.onerror = null;
      img.src = PLACEHOLDER;
      return;
    }
    const url = candidates[i++];
    console.log('[product.js] Trying image:', url);
    img.onerror = tryNext;
    img.src = url;
  };

  tryNext();
};

// ─── INFO ───
const renderProductInfo = (p) => {
  const catName = p.category?.name || 'Product';
  setHTML('breadcrumb-cat', p.category
    ? `<a href="/pages/category.html?slug=${encodeURIComponent(p.category.slug)}">${catName}</a>`
    : catName);
  setText('breadcrumb-current', p.name);
  setText('pdp-brand', p.brand || '');
  setText('pdp-title', p.name);
  setText('pdp-sku', p.sku);
  setText('pdp-sold', `${(p.sold || 0).toLocaleString()} sold`);

  const rating = p.rating?.average || 0;
  const ratingCount = p.rating?.count || 0;
  setHTML('pdp-rating', `
    <span style="color: var(--color-accent); font-size: 1rem; letter-spacing: 1px;">${renderStars(rating)}</span>
    <span style="font-weight: 600; color: var(--text-primary);">${rating.toFixed(1)}</span>
    ${ratingCount ? `<span style="color: var(--color-primary); text-decoration: underline; cursor: pointer;">${ratingCount} review${ratingCount === 1 ? '' : 's'}</span>` : '<span>No reviews yet</span>'}
  `);

  setText('pdp-price', formatNaira(p.price));
  const prevEl = $('pdp-previous');
  const discEl = $('pdp-discount');
  const savEl = $('pdp-savings');

  if (p.previousPrice && p.previousPrice > p.price) {
    if (prevEl) { prevEl.textContent = formatNaira(p.previousPrice); prevEl.style.display = 'inline'; }
    const disc = Math.round(((p.previousPrice - p.price) / p.previousPrice) * 100);
    if (discEl) { discEl.textContent = `-${disc}%`; discEl.hidden = false; }
    const savings = p.previousPrice - p.price;
    if (savEl) { savEl.textContent = `You save ${formatNaira(savings)} (${disc}%)`; savEl.hidden = false; }
  } else {
    if (prevEl) prevEl.style.display = 'none';
    if (discEl) discEl.hidden = true;
    if (savEl) savEl.hidden = true;
  }

  const stockEl = $('pdp-stock');
  if (stockEl) {
    if (p.stock === 0) {
      stockEl.textContent = '❌ Out of stock';
      stockEl.style.color = 'var(--color-danger)';
    } else if (p.stock <= 5) {
      stockEl.textContent = `⚠️ Only ${p.stock} left in stock`;
      stockEl.style.color = 'var(--color-warning)';
    } else {
      stockEl.textContent = `✅ In stock (${p.stock} available)`;
      stockEl.style.color = 'var(--color-success)';
    }
  }

  setText('pdp-short', p.shortDescription || '');

  if (p.seller) {
    setText('pdp-seller-name', p.seller.storeName || 'Seller');
    const link = $('pdp-seller-link');
    if (link) link.href = `/pages/seller-store.html?slug=${encodeURIComponent(p.seller.slug || '')}`;
  } else {
    const sellerEl = $('pdp-seller');
    if (sellerEl) sellerEl.style.display = 'none';
  }

  document.title = `${p.name} — Kelvin Ikpeni Marketplace`;
};

// ─── TABS ───
const renderTabs = (p) => {
  setText('tab-description', p.description || 'No description available.');
  const specs = [
    ['Brand', p.brand], ['SKU', p.sku], ['Category', p.category?.name],
    ['In stock', p.stock > 0 ? `${p.stock} units` : 'No'],
    ['Sold', `${p.sold || 0} units`],
  ].filter(([, v]) => v);

  setHTML('tab-specs-body', specs.map(([k, v]) => `
    <tr style="border-bottom: 1px solid var(--border-color);">
      <td style="padding: var(--space-3) 0; font-size: var(--text-sm); color: var(--text-muted); width: 200px;">${k}</td>
      <td style="padding: var(--space-3) 0; font-size: var(--text-sm); color: var(--text-primary);">${v}</td>
    </tr>
  `).join(''));

  document.querySelectorAll('.pdp-tabs__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pdp-tabs__btn').forEach((b) => {
        b.classList.remove('is-active');
        b.style.color = 'var(--text-secondary)';
        b.style.borderBottomColor = 'transparent';
      });
      document.querySelectorAll('.pdp-tabs__panel').forEach((panel) => panel.style.display = 'none');

      btn.classList.add('is-active');
      btn.style.color = 'var(--color-primary)';
      btn.style.borderBottomColor = 'var(--color-primary)';

      const panel = document.querySelector(`.pdp-tabs__panel[data-panel="${btn.dataset.tab}"]`);
      if (panel) panel.style.display = 'block';
    });
  });
};

// ─── REVIEWS ───
const renderReviews = async (productId) => {
  const root = $('reviews-root');
  if (!root) return;
  root.innerHTML = '<div class="loader" style="margin: 40px auto;"></div>';

  try {
    const [stats, reviewsData] = await Promise.all([
      api.get(`/reviews/product/${productId}/stats`),
      api.get(`/reviews/product/${productId}?limit=10`),
    ]);

    setText('tab-review-count', String(stats.count));

    const reviewsHtml = reviewsData.reviews.length
      ? reviewsData.reviews.map((r) => `
          <article style="padding-bottom: var(--space-5); border-bottom: 1px solid var(--border-color); margin-bottom: var(--space-5);">
            <div style="display: flex; align-items: flex-start; gap: var(--space-3); margin-bottom: var(--space-2);">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary-soft); color: var(--color-primary); font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${(r.user?.name || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style="font-weight: 600; font-size: var(--text-sm);">${r.user?.name || 'Anonymous'}</div>
                <div style="color: var(--color-accent); font-size: 0.9rem;">${renderStars(r.rating)}</div>
              </div>
            </div>
            <p style="font-size: var(--text-sm); line-height: 1.6; color: var(--text-secondary); margin: 0;">${r.comment}</p>
          </article>
        `).join('')
      : `<div style="text-align: center; padding: var(--space-8); color: var(--text-muted);">No reviews yet.</div>`;

    root.innerHTML = reviewsHtml;
  } catch (err) {
    root.innerHTML = `<div style="text-align: center; padding: var(--space-8); color: var(--text-muted);">Could not load reviews.</div>`;
  }
};

// ─── ACTIONS ───
const initActions = () => {
  const qtyInput = $('pdp-qty');
  document.querySelectorAll('.pdp__qty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const delta = Number(btn.dataset.qty);
      state.quantity = Math.max(1, Math.min(state.product?.stock || 99, state.quantity + delta));
      if (qtyInput) qtyInput.value = state.quantity;
    });
  });

  $('pdp-add')?.addEventListener('click', async (e) => {
    if (!auth.isLoggedIn()) {
      toast('Please sign in', 'warning');
      setTimeout(() => window.location.href = '/pages/login.html', 1000);
      return;
    }
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
      const data = await api.post('/cart/add', { productId: state.product.id, quantity: state.quantity });
      toast(`Added ${state.quantity} to cart`, 'success');
      const badge = $('cart-count');
      if (badge && data.itemCount > 0) {
        badge.textContent = data.itemCount;
        badge.style.display = 'flex';
      }
    } catch (err) { toast(err.message, 'error'); }
    btn.disabled = false;
  });

  $('pdp-buy')?.addEventListener('click', async () => {
    if (!auth.isLoggedIn()) {
      toast('Please sign in', 'warning');
      setTimeout(() => window.location.href = '/pages/login.html', 1000);
      return;
    }
    try {
      await api.post('/cart/add', { productId: state.product.id, quantity: state.quantity });
      window.location.href = '/pages/checkout.html';
    } catch (err) { toast(err.message, 'error'); }
  });

  $('pdp-wishlist')?.addEventListener('click', async (e) => {
    if (!auth.isLoggedIn()) {
      toast('Please sign in', 'warning');
      setTimeout(() => window.location.href = '/pages/login.html', 1000);
      return;
    }
    try {
      await api.post('/wishlist/add', { productId: state.product.id });
      e.currentTarget.classList.add('is-active');
      toast('Saved to wishlist', 'success');
    } catch (err) { toast(err.message, 'error'); }
  });
};

// ─── RELATED ───
const renderRelated = async () => {
  if (!state.product?.slug) return;
  try {
    const data = await api.get(`/products/${state.product.slug}/related?limit=8`);
    if (!data.products.length) return;
    const relatedSection = $('related-section');
    if (relatedSection) relatedSection.hidden = false;
    setHTML('related-products', data.products.map(productCard).join(''));
  } catch (err) { console.warn('Related failed:', err.message); }
};

// ─── INIT ───
const init = async () => {
  mountHeader();
  mountFooter();

  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) {
    toast('No product specified', 'error');
    return;
  }

  try {
    const product = await api.get(`/products/${slug}`);
    console.log('[product.js] Product loaded from API:', product);
    state.product = product;

    $('product-skeleton').hidden = true;
    $('product-content').hidden = false;
    $('pdp-tabs').hidden = false;

    renderImage(product);
    renderProductInfo(product);
    renderTabs(product);
    initActions();
    renderReviews(product.id);
    renderRelated();
  } catch (err) {
    console.error('Product load failed:', err);
    $('product-skeleton').innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <h3 class="empty-state__title">Product not found</h3>
        <p class="empty-state__message">${err.message}</p>
        <a href="/pages/products.html" class="btn btn-primary">Browse products</a>
      </div>
    `;
    toast('Product not found', 'error');
  }
};

document.addEventListener('DOMContentLoaded', init);