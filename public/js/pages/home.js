/**
 * home.js
 * -------
 * Homepage controller. Fetches aggregated data from /api/products/homepage
 * and renders all product sections + the flash-sale countdown.
 */

import { api } from '../api.js';
import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { productCard } from '../components/productCard.js';
import { toast } from '../components/toast.js';
import { auth } from '../auth.js';

const renderGrid = (targetId, products) => {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.innerHTML = '';

  if (!products || products.length === 0) {
    target.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: var(--space-8) 0;">
        <div class="empty-state__icon" style="font-size: 2rem;">📦</div>
        <h3 class="empty-state__title">No products yet</h3>
        <p class="empty-state__message text-sm">Check back soon — new products are added daily.</p>
      </div>
    `;
    return;
  }

  target.innerHTML = products.map(productCard).join('');
};

const renderCategories = (categories) => {
  const target = document.getElementById('homepage-categories');
  if (!target) return;

  target.innerHTML = '';

  if (!categories || categories.length === 0) {
    target.innerHTML = '<p class="text-muted">No categories available.</p>';
    return;
  }

  target.innerHTML = categories
    .slice(0, 12)
    .map(
      (c) => `
        <a href="/pages/category.html?slug=${encodeURIComponent(c.slug)}" class="category-card">
          <div class="category-card__icon-wrap">
            <span class="category-card__icon">${c.icon || '📦'}</span>
          </div>
          <span class="category-card__name">${c.name}</span>
          <span class="category-card__count">${
            c.productCount > 0 ? `${c.productCount} items` : 'Browse items'
          }</span>
        </a>
      `
    )
    .join('');
};

const startCountdown = (endTime) => {
  const hoursEl = document.getElementById('flash-hours');
  const minsEl = document.getElementById('flash-mins');
  const secsEl = document.getElementById('flash-secs');
  if (!hoursEl || !minsEl || !secsEl) return;

  const end = new Date(endTime).getTime();

  const tick = () => {
    const diff = end - Date.now();

    if (diff <= 0) {
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    hoursEl.textContent = String(h).padStart(2, '0');
    minsEl.textContent = String(m).padStart(2, '0');
    secsEl.textContent = String(s).padStart(2, '0');
  };

  tick();
  setInterval(tick, 1000);
};

const setupGlobalActions = () => {
  document.addEventListener('click', async (e) => {
    const cartBtn = e.target.closest('[data-action="add-to-cart"]');
    if (cartBtn && !cartBtn.disabled) {
      e.preventDefault();
      const pid = cartBtn.dataset.productId;
      if (!auth.isLoggedIn()) {
        toast('Please sign in to add items to cart', 'warning');
        setTimeout(() => (window.location.href = '/pages/login.html'), 1000);
        return;
      }
      cartBtn.disabled = true;
      const original = cartBtn.textContent;
      cartBtn.textContent = '…';
      try {
        const data = await api.post('/cart/add', { productId: pid, quantity: 1 });
        toast('Added to cart', 'success');
        const badge = document.getElementById('cart-count');
        if (badge && data.itemCount > 0) {
          badge.textContent = data.itemCount;
          badge.style.display = 'flex';
          localStorage.setItem('cartCount', String(data.itemCount));
        }
      } catch (err) {
        toast(err.message, 'error');
      }
      cartBtn.disabled = false;
      cartBtn.textContent = original;
      return;
    }

    const wishlistBtn = e.target.closest('[data-action="wishlist"]');
    if (wishlistBtn) {
      e.preventDefault();
      const pid = wishlistBtn.dataset.productId;
      if (!auth.isLoggedIn()) {
        toast('Please sign in to save items', 'warning');
        setTimeout(() => (window.location.href = '/pages/login.html'), 1000);
        return;
      }
      try {
        await api.post('/wishlist/add', { productId: pid });
        wishlistBtn.classList.add('is-active');
        wishlistBtn.textContent = '♥';
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
      return;
    }
  });
};

const init = async () => {
  mountHeader();
  mountFooter();
  setupGlobalActions();

  try {
    const data = await api.get('/products/homepage');

    renderGrid('featured-products', data.featuredProducts);
    renderGrid('trending-products', data.trendingProducts);
    renderGrid('best-sellers', data.bestSellers);
    renderGrid('new-arrivals', data.newArrivals);
    renderGrid('recommended-products', data.recommended);
    renderGrid('flash-sale-products', data.flashSaleProducts);
    renderCategories(data.categories);

    const firstFlash = data.flashSaleProducts?.[0];
    if (firstFlash?.flashSaleEndsAt) {
      startCountdown(firstFlash.flashSaleEndsAt);
    } else {
      startCountdown(new Date(Date.now() + 24 * 60 * 60 * 1000));
    }
  } catch (err) {
    console.error('Homepage load failed:', err);
    toast('Could not load homepage content. Please refresh.', 'error', 'Oops');

    [
      'featured-products',
      'trending-products',
      'best-sellers',
      'new-arrivals',
      'recommended-products',
      'flash-sale-products',
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state__icon">⚠️</div>
            <h3 class="empty-state__title">Unable to load products</h3>
            <p class="empty-state__message">Please check your connection and refresh the page.</p>
          </div>
        `;
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', init);