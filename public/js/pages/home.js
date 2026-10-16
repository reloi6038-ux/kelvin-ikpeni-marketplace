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

/**
 * Render a grid of product cards into a target element.
 * @param {string} targetId
 * @param {Array} products
 */
const renderGrid = (targetId, products) => {
  const target = document.getElementById(targetId);
  if (!target) return;

  if (!products || products.length === 0) {
    target.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">🛒</div>
        <h3 class="empty-state__title">No products yet</h3>
        <p class="empty-state__message">Check back soon — new products are added daily.</p>
      </div>
    `;
    return;
  }

  target.innerHTML = products.map(productCard).join('');
};

/**
 * Render the category card grid.
 */
const renderCategories = (categories) => {
  const target = document.getElementById('homepage-categories');
  if (!target) return;

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
          <span class="category-card__count">${c.productCount || 0} items</span>
        </a>
      `
    )
    .join('');
};

/**
 * Live countdown timer for the flash sale section.
 * @param {string|Date} endTime
 */
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

/**
 * Global "Add to Cart" + "Wishlist" click handler.
 * Stage 11 will replace the toast messages with real API calls.
 */
const setupGlobalActions = () => {
  document.addEventListener('click', (e) => {
    const cartBtn = e.target.closest('[data-action="add-to-cart"]');
    if (cartBtn && !cartBtn.disabled) {
      e.preventDefault();
      toast('Added to cart — full cart arrives in Stage 11', 'success', 'Added');
      return;
    }

    const wishlistBtn = e.target.closest('[data-action="wishlist"]');
    if (wishlistBtn) {
      e.preventDefault();
      toast('Saved to wishlist — wishlist page arrives in Stage 11', 'info', 'Saved');
      return;
    }

    const quickViewBtn = e.target.closest('[data-action="quickview"]');
    if (quickViewBtn) {
      e.preventDefault();
      const card = quickViewBtn.closest('.product-card');
      const title = card?.querySelector('.product-card__title')?.textContent?.trim();
      toast(`Quick view for "${title}" arrives in Stage 8`, 'info', 'Coming soon');
    }
  });
};

/**
 * Newsletter form (placeholder — will wire to backend later).
 */
const setupNewsletter = () => {
  const form = document.querySelector('.newsletter__form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('.newsletter__input');
    const email = input?.value?.trim();
    if (!email) return;
    toast(`Thanks! We'll notify ${email} about new deals.`, 'success', 'Subscribed');
    input.value = '';
  });
};

/**
 * Main init.
 */
const init = async () => {
  mountHeader();
  mountFooter();
  setupGlobalActions();
  setupNewsletter();

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
      // Fallback: 24 hours from now (so the timer is never dead)
      startCountdown(new Date(Date.now() + 24 * 60 * 60 * 1000));
    }
  } catch (err) {
    console.error('Homepage load failed:', err);
    toast('Could not load homepage content. Please refresh.', 'error', 'Oops');

    // Remove skeletons so the page doesn't hang on loading state
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