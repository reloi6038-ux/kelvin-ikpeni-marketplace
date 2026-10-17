/**
 * product.js
 * ----------
 * Product detail page controller.
 */

import { api, formatNaira, renderStars } from '../api.js';
import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { productCard } from '../components/productCard.js';
import { toast } from '../components/toast.js';
import { auth } from '../auth.js';

const PLACEHOLDER = '/images/placeholders/product.svg';

const state = {
  product: null,
  gallery: [],
  galleryIndex: 0,
  quantity: 1,
};

const renderGallery = () => {
  const main = document.getElementById('gallery-main');
  const thumbs = document.getElementById('gallery-thumbs');
  if (!main || !thumbs) return;

  if (!state.gallery.length) {
    main.src = PLACEHOLDER;
    main.alt = state.product.name;
    thumbs.innerHTML = '';
    return;
  }

  const current = state.gallery[state.galleryIndex];
  main.src = current;
  main.alt = state.product.name;

  thumbs.innerHTML = state.gallery
    .map(
      (url, i) => `
      <button class="pdp-gallery__thumb ${i === state.galleryIndex ? 'is-active' : ''}" data-index="${i}" aria-label="Image ${i + 1}">
        <img src="${url}" alt="" onerror="this.onerror=null;this.src='${PLACEHOLDER}';" />
      </button>
    `
    )
    .join('');

  thumbs.querySelectorAll('.pdp-gallery__thumb').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.galleryIndex = Number(btn.dataset.index);
      renderGallery();
    });
  });
};

const initGalleryNav = () => {
  document.getElementById('gallery-prev')?.addEventListener('click', () => {
    if (!state.gallery.length) return;
    state.galleryIndex = (state.galleryIndex - 1 + state.gallery.length) % state.gallery.length;
    renderGallery();
  });
  document.getElementById('gallery-next')?.addEventListener('click', () => {
    if (!state.gallery.length) return;
    state.galleryIndex = (state.galleryIndex + 1) % state.gallery.length;
    renderGallery();
  });
};

const renderProductInfo = (p) => {
  const catName = p.category?.name || 'Product';
  document.getElementById('breadcrumb-cat').innerHTML = p.category
    ? `<a href="/pages/category.html?slug=${encodeURIComponent(p.category.slug)}">${catName}</a>`
    : catName;
  document.getElementById('breadcrumb-current').textContent = p.name;

  document.getElementById('pdp-brand').textContent = p.brand || '';
  document.getElementById('pdp-title').textContent = p.name;
  document.getElementById('pdp-sku').textContent = p.sku;
  document.getElementById('pdp-sold').textContent = `${(p.sold || 0).toLocaleString()} sold`;

  const rating = p.rating?.average || 0;
  const ratingCount = p.rating?.count || 0;
  document.getElementById('pdp-rating').innerHTML = `
    <span class="pdp__rating-stars">${renderStars(rating)}</span>
    <span>${rating.toFixed(1)}</span>
    ${
      ratingCount
        ? `<a class="pdp__rating-link" href="#reviews-tab">${ratingCount} review${ratingCount === 1 ? '' : 's'}</a>`
        : '<span>No reviews yet</span>'
    }
  `;

  document.getElementById('pdp-price').textContent = formatNaira(p.price);
  const prevEl = document.getElementById('pdp-previous');
  const discEl = document.getElementById('pdp-discount');
  const savEl = document.getElementById('pdp-savings');

  if (p.previousPrice && p.previousPrice > p.price) {
    prevEl.textContent = formatNaira(p.previousPrice);
    prevEl.hidden = false;
    const disc = Math.round(((p.previousPrice - p.price) / p.previousPrice) * 100);
    discEl.textContent = `-${disc}%`;
    discEl.hidden = false;
    const savings = p.previousPrice - p.price;
    savEl.textContent = `You save ${formatNaira(savings)} (${disc}%)`;
    savEl.hidden = false;
  } else {
    prevEl.hidden = true;
    discEl.hidden = true;
    savEl.hidden = true;
  }

  const stockEl = document.getElementById('pdp-stock');
  if (p.stock === 0) {
    stockEl.textContent = '❌ Out of stock';
    stockEl.className = 'pdp__stock pdp__stock--out';
  } else if (p.stock <= 5) {
    stockEl.textContent = `⚠️ Only ${p.stock} left in stock — order soon`;
    stockEl.className = 'pdp__stock pdp__stock--low';
  } else {
    stockEl.textContent = `✅ In stock (${p.stock} available)`;
    stockEl.className = 'pdp__stock pdp__stock--in';
  }

  document.getElementById('pdp-short').textContent = p.shortDescription || '';

  if (p.seller) {
    document.getElementById('pdp-seller-name').textContent = p.seller.storeName || 'Seller';
    const link = document.getElementById('pdp-seller-link');
    link.href = `/pages/seller-store.html?slug=${encodeURIComponent(p.seller.slug || '')}`;
    link.textContent = 'Visit Store';
  } else {
    document.getElementById('pdp-seller').hidden = true;
  }

  if (p.freeShipping) {
    document.getElementById('pdp-delivery-text').textContent = '✓ Free delivery on this item';
  } else if (p.shippingFee) {
    document.getElementById('pdp-delivery-text').textContent = `Delivery from ${formatNaira(p.shippingFee)}`;
  }

  document.title = `${p.name} — Kelvin Ikpeni Marketplace`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute('content', p.shortDescription || (p.description ? p.description.slice(0, 155) : p.name));
  }
};

const renderTabs = (p) => {
  document.getElementById('tab-description').textContent =
    p.description || 'No description available.';

  const specs = [
    ['Brand', p.brand],
    ['SKU', p.sku],
    ['Category', p.category?.name],
    ['Currency', p.currency],
    ['Weight', p.weight ? `${p.weight} kg` : null],
    ['Dimensions', p.dimensions?.length ? `${p.dimensions.length} × ${p.dimensions.width} × ${p.dimensions.height} ${p.dimensions.unit || 'cm'}` : null],
    ['In stock', p.stock > 0 ? `${p.stock} units` : 'No'],
    ['Sold', `${p.sold || 0} units`],
  ].filter(([, v]) => v);

  document.getElementById('tab-specs-body').innerHTML = specs
    .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
    .join('');

  document.querySelectorAll('.pdp-tabs__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pdp-tabs__btn').forEach((b) => b.classList.remove('is-active'));
      document.querySelectorAll('.pdp-tabs__panel').forEach((p) => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      document.querySelector(`.pdp-tabs__panel[data-panel="${btn.dataset.tab}"]`)?.classList.add('is-active');
    });
  });
};

const renderReviewStats = (stats) => {
  const { average, count, distribution } = stats;
  const total = count || 1;

  const rows = [5, 4, 3, 2, 1].map((star) => {
    const n = distribution?.[star] || 0;
    const pct = Math.round((n / total) * 100);
    return `
      <div class="reviews__dist-row">
        <span>${star} ★</span>
        <div class="reviews__bar"><div class="reviews__bar-fill" style="width:${pct}%"></div></div>
        <span>${n}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="reviews__summary">
      <div class="reviews__big">${average.toFixed(1)}</div>
      <div class="reviews__stars-lg">${renderStars(average)}</div>
      <div class="reviews__count">${count} review${count === 1 ? '' : 's'}</div>
    </div>
    <div class="reviews__dist">${rows}</div>
  `;
};

const renderReviews = async (productId) => {
  const root = document.getElementById('reviews-root');
  if (!root) return;
  if (!productId) {
    root.innerHTML = `<div class="reviews__empty"><p>Could not load reviews — product ID missing.</p></div>`;
    return;
  }

  root.innerHTML = '<div class="loader" style="margin: 40px auto;"></div>';

  try {
    const [stats, reviewsData] = await Promise.all([
      api.get(`/reviews/product/${productId}/stats`),
      api.get(`/reviews/product/${productId}?limit=10`),
    ]);

    document.getElementById('tab-review-count').textContent = stats.count;

    const reviewsHtml = reviewsData.reviews.length
      ? reviewsData.reviews.map((r) => {
          const initials = (r.user?.name || 'U').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
          const date = new Date(r.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
          return `
            <article class="review">
              <div class="review__header">
                <div class="review__avatar">${initials}</div>
                <div class="review__who">
                  <div class="review__name">
                    ${r.user?.name || 'Anonymous'}
                    ${r.isVerifiedPurchase ? '<span class="review__verified">✓ Verified</span>' : ''}
                  </div>
                  <div class="review__stars">${renderStars(r.rating)}</div>
                  <div class="review__date">${date}</div>
                </div>
              </div>
              ${r.title ? `<h4 class="review__title">${r.title}</h4>` : ''}
              <p class="review__body">${r.comment}</p>
            </article>
          `;
        }).join('')
      : `<div class="reviews__empty"><div class="reviews__empty-icon">💬</div><p>No reviews yet.</p></div>`;

    root.innerHTML = `
      <div class="reviews__top">${renderReviewStats(stats)}</div>
      <div class="reviews__list">${reviewsHtml}</div>
    `;
  } catch (err) {
    console.error('Reviews load failed:', err);
    root.innerHTML = `<div class="reviews__empty"><p>Could not load reviews.</p></div>`;
  }
};

const initActions = () => {
  const qtyInput = document.getElementById('pdp-qty');

  document.querySelectorAll('.pdp__qty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const delta = Number(btn.dataset.qty);
      const max = state.product?.stock || 99;
      state.quantity = Math.max(1, Math.min(max, state.quantity + delta));
      qtyInput.value = state.quantity;
    });
  });

  qtyInput.addEventListener('change', () => {
    const max = state.product?.stock || 99;
    state.quantity = Math.max(1, Math.min(max, Number(qtyInput.value) || 1));
    qtyInput.value = state.quantity;
  });

  document.getElementById('pdp-add')?.addEventListener('click', async (e) => {
    if (state.product?.stock === 0) return;
    if (!auth.isLoggedIn()) {
      toast('Please sign in to add items to cart', 'warning');
      setTimeout(() => (window.location.href = '/pages/login.html'), 1000);
      return;
    }
    const btn = e.currentTarget;
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = 'Adding…';
    try {
      const data = await api.post('/cart/add', {
        productId: state.product.id,
        quantity: state.quantity,
      });
      toast(`Added ${state.quantity} × "${state.product.name}" to cart`, 'success');
      const badge = document.getElementById('cart-count');
      if (badge && data.itemCount > 0) {
        badge.textContent = data.itemCount;
        badge.style.display = 'flex';
        localStorage.setItem('cartCount', String(data.itemCount));
      }
    } catch (err) {
      toast(err.message, 'error');
    }
    btn.disabled = false;
    btn.textContent = original;
  });

  document.getElementById('pdp-buy')?.addEventListener('click', async () => {
    if (!auth.isLoggedIn()) {
      toast('Please sign in to buy', 'warning');
      setTimeout(() => (window.location.href = '/pages/login.html'), 1000);
      return;
    }
    try {
      await api.post('/cart/add', { productId: state.product.id, quantity: state.quantity });
      window.location.href = '/pages/checkout.html';
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  document.getElementById('pdp-wishlist')?.addEventListener('click', async (e) => {
    if (!auth.isLoggedIn()) {
      toast('Please sign in to save items', 'warning');
      setTimeout(() => (window.location.href = '/pages/login.html'), 1000);
      return;
    }
    const btn = e.currentTarget;
    try {
      await api.post('/wishlist/add', { productId: state.product.id });
      btn.classList.add('is-active');
      toast('Saved to wishlist', 'success');
      const data = await api.get('/wishlist');
      const badge = document.getElementById('wishlist-count');
      if (badge && data.count > 0) {
        badge.textContent = data.count;
        badge.style.display = 'flex';
        localStorage.setItem('wishlistCount', String(data.count));
      }
    } catch (err) {
      toast(err.message, 'error');
    }
  });
};

const renderRelated = async () => {
  if (!state.product?.slug) return;
  try {
    const data = await api.get(`/products/${state.product.slug}/related?limit=8`);
    if (!data.products.length) return;
    document.getElementById('related-section').hidden = false;
    document.getElementById('related-products').innerHTML = data.products.map(productCard).join('');
  } catch (err) {
    console.warn('Related failed:', err.message);
  }
};

const RECENT_KEY = 'recentlyViewed';
const MAX_RECENT = 8;

const updateRecentlyViewed = () => {
  if (!state.product) return;
  try {
    let recent = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    recent = recent.filter((p) => p.slug !== state.product.slug);
    recent.unshift({
      _id: state.product.id || state.product._id,
      name: state.product.name,
      slug: state.product.slug,
      price: state.product.price,
      previousPrice: state.product.previousPrice,
      thumbnail: state.product.thumbnail || state.product.images?.[0],
      images: state.product.images,
      brand: state.product.brand,
      rating: state.product.rating,
      stock: state.product.stock,
    });
    recent = recent.slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch (err) {
    console.warn('Recently viewed save failed:', err);
  }
};

const renderRecentlyViewed = () => {
  if (!state.product) return;
  try {
    const recent = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    const others = recent.filter((p) => p.slug !== state.product.slug).slice(0, 4);
    if (!others.length) return;
    document.getElementById('recent-section').hidden = false;
    document.getElementById('recent-products').innerHTML = others.map(productCard).join('');
  } catch (err) {
    console.warn(err);
  }
};

const init = async () => {
  mountHeader();
  mountFooter();

  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) {
    toast('No product specified', 'error');
    setTimeout(() => (window.location.href = '/pages/products.html'), 1200);
    return;
  }

  try {
    const product = await api.get(`/products/${slug}`);
    state.product = product;

    const images = Array.isArray(product.images) ? product.images : [];
    const thumb = product.thumbnail;
    state.gallery = [...images];
    if (thumb && !state.gallery.includes(thumb)) state.gallery.push(thumb);
    state.gallery = state.gallery.filter(Boolean);
    if (!state.gallery.length) state.gallery = [PLACEHOLDER];

    document.getElementById('product-skeleton').hidden = true;
    document.getElementById('product-content').hidden = false;
    document.getElementById('pdp-tabs').hidden = false;

    renderGallery();
    initGalleryNav();
    renderProductInfo(product);
    renderTabs(product);
    initActions();

    renderReviews(product.id);
    renderRelated();
    renderRecentlyViewed();
    updateRecentlyViewed();
  } catch (err) {
    console.error('Product load failed:', err);
    document.getElementById('product-skeleton').innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
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