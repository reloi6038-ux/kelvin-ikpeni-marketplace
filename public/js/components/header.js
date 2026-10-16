/**
 * header.js
 * ---------
 * Injects the site header + mobile menu drawer.
 * Loads categories from the API and wires up:
 *  - Search form (with live suggestions)
 *  - Category navigation (links to /pages/category.html?slug=...)
 *  - Mobile drawer
 *  - Sticky shadow on scroll
 *  - Badge counters (cart + wishlist) — will be live in Stage 11
 *  - Pre-fills search input when arriving with ?search=...
 */

import { api } from '../api.js';

const HEADER_HTML = `
  <div class="announcement-bar">
    <div class="container announcement-bar__inner">
      <span class="announcement-bar__item">🚚 Free delivery on orders above ₦50,000</span>
      <span class="announcement-bar__item">💰 Pay on delivery available nationwide</span>
      <span class="announcement-bar__item">🔒 100% secure payments via Paystack</span>
    </div>
  </div>

  <header class="header" id="site-header">
    <div class="container header__main">
      <button class="header__mobile-toggle" id="open-mobile-menu" aria-label="Open menu">☰</button>

      <a href="/" class="header__logo" aria-label="Kelvin Ikpeni Marketplace home">
        <img src="/images/logo.svg" alt="" class="header__logo-mark" />
        <span class="header__logo-text">
          Kelvin Ikpeni
          <small>Marketplace</small>
        </span>
      </a>

      <div class="header__search">
        <form class="header__search-form" id="search-form" autocomplete="off" role="search">
          <label for="search-input" class="sr-only">Search products</label>
          <input
            type="search"
            class="header__search-input"
            id="search-input"
            placeholder="Search products, brands, categories…"
          />
          <button type="submit" class="header__search-btn" aria-label="Search">🔍</button>
        </form>
        <div class="search-suggestions" id="search-suggestions"></div>
      </div>

      <div class="header__actions">
        <a href="/pages/login.html" class="header__action" id="account-link">
          <span class="header__action-icon">👤</span>
          <span class="header__action-label">
            <small id="account-greeting">Sign in</small>
            <strong id="account-label">Account</strong>
          </span>
        </a>
        <a href="/pages/wishlist.html" class="header__action" aria-label="Wishlist">
          <span class="header__action-icon">
            ♡
            <span class="header__badge" id="wishlist-count" style="display:none">0</span>
          </span>
          <span class="header__action-label">
            <small>Saved</small>
            <strong>Wishlist</strong>
          </span>
        </a>
        <a href="/pages/cart.html" class="header__action" aria-label="Cart">
          <span class="header__action-icon">
            🛒
            <span class="header__badge" id="cart-count" style="display:none">0</span>
          </span>
          <span class="header__action-label">
            <small>My</small>
            <strong>Cart</strong>
          </span>
        </a>
      </div>
    </div>

    <nav class="header__nav" aria-label="Product categories">
      <div class="container header__nav-inner" id="category-nav">
        <a href="/pages/products.html" class="header__nav-link header__nav-link--all">
          ☰ All Categories
        </a>
        <!-- Category links injected here by loadCategories() -->
      </div>
    </nav>
  </header>

  <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
    <div class="mobile-menu__backdrop" data-close-menu></div>
    <aside class="mobile-menu__panel" role="dialog" aria-label="Navigation menu">
      <div class="mobile-menu__header">
        <strong>Menu</strong>
        <button class="btn-ghost" data-close-menu aria-label="Close menu">✕</button>
      </div>
      <nav class="mobile-menu__nav" id="mobile-menu-nav">
        <a href="/" class="mobile-menu__link">🏠 Home</a>
        <a href="/pages/products.html" class="mobile-menu__link">🛍 All Products</a>
        <a href="/pages/login.html" class="mobile-menu__link">👤 Account</a>
        <a href="/pages/wishlist.html" class="mobile-menu__link">♡ Wishlist</a>
        <a href="/pages/cart.html" class="mobile-menu__link">🛒 Cart</a>
        <a href="/pages/help.html" class="mobile-menu__link">❓ Help</a>
        <!-- Category links injected here -->
      </nav>
    </aside>
  </div>
`;

/* ═══════════════════════════════════════════════════════════
   Load categories and inject navigation links
   ═══════════════════════════════════════════════════════════ */
const loadCategories = async () => {
  try {
    const data = await api.get('/categories?level=0');
    const nav = document.getElementById('category-nav');
    const mobileNav = document.getElementById('mobile-menu-nav');
    if (!nav) return;

    const featured = data.categories.slice(0, 10);

    featured.forEach((cat) => {
      // Desktop nav link
      const a = document.createElement('a');
      a.href = `/pages/category.html?slug=${encodeURIComponent(cat.slug)}`;
      a.className = 'header__nav-link';
      a.textContent = cat.name;
      nav.appendChild(a);

      // Mobile drawer link
      const mA = document.createElement('a');
      mA.href = `/pages/category.html?slug=${encodeURIComponent(cat.slug)}`;
      mA.className = 'mobile-menu__link';
      mA.textContent = `${cat.icon || '📦'} ${cat.name}`;
      mobileNav.appendChild(mA);
    });
  } catch (err) {
    console.warn('Failed to load categories:', err.message);
  }
};

/* ═══════════════════════════════════════════════════════════
   Search — form submit + live suggestions
   ═══════════════════════════════════════════════════════════ */
const initSearch = () => {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const box = document.getElementById('search-suggestions');
  if (!form || !input || !box) return;

  // Pre-fill from URL if ?search=... is present
  const urlParams = new URLSearchParams(window.location.search);
  const presetSearch = urlParams.get('search');
  if (presetSearch) input.value = presetSearch;

  let debounce;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (q) {
      window.location.href = `/pages/products.html?search=${encodeURIComponent(q)}`;
    } else {
      window.location.href = '/pages/products.html';
    }
  });

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const q = input.value.trim();

    if (q.length < 2) {
      box.classList.remove('is-active');
      box.innerHTML = '';
      return;
    }

    debounce = setTimeout(async () => {
      try {
        const data = await api.get(`/products?search=${encodeURIComponent(q)}&limit=6`);
        if (!data.products.length) {
          box.classList.remove('is-active');
          box.innerHTML = '';
          return;
        }

        box.innerHTML = data.products
          .map(
            (p) => `
          <a class="search-suggestions__item" href="/pages/product.html?slug=${encodeURIComponent(p.slug)}">
            <img
              class="search-suggestions__img"
              src="${p.thumbnail || (p.images && p.images[0]) || '/images/placeholders/product.svg'}"
              alt=""
              onerror="this.onerror=null;this.src='/images/placeholders/product.svg';"
            />
            <div class="search-suggestions__info">
              <div class="search-suggestions__name">${p.name}</div>
              <div class="search-suggestions__price">₦${(p.price || 0).toLocaleString('en-NG')}</div>
            </div>
          </a>
        `
          )
          .join('');
        box.classList.add('is-active');
      } catch (err) {
        console.warn('Search suggestions failed:', err.message);
        box.classList.remove('is-active');
      }
    }, 250);
  });

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!form.contains(e.target) && !box.contains(e.target)) {
      box.classList.remove('is-active');
    }
  });

  // Close on Escape
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') box.classList.remove('is-active');
  });
};

/* ═══════════════════════════════════════════════════════════
   Mobile menu
   ═══════════════════════════════════════════════════════════ */
const initMobileMenu = () => {
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;

  const open = () => {
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.getElementById('open-mobile-menu')?.addEventListener('click', open);
  menu.querySelectorAll('[data-close-menu]').forEach((el) =>
    el.addEventListener('click', close)
  );

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
  });
};

/* ═══════════════════════════════════════════════════════════
   Sticky header shadow on scroll
   ═══════════════════════════════════════════════════════════ */
const initScrollShadow = () => {
  const header = document.getElementById('site-header');
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 10) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
};

/* ═══════════════════════════════════════════════════════════
   Badge counters — reads from localStorage for now.
   Stage 11 will replace this with live cart/wishlist APIs.
   ═══════════════════════════════════════════════════════════ */
const initBadges = () => {
  const cartCount = Number(localStorage.getItem('cartCount') || 0);
  const wishlistCount = Number(localStorage.getItem('wishlistCount') || 0);

  const cartBadge = document.getElementById('cart-count');
  const wishlistBadge = document.getElementById('wishlist-count');

  if (cartBadge && cartCount > 0) {
    cartBadge.textContent = cartCount;
    cartBadge.style.display = 'flex';
  }
  if (wishlistBadge && wishlistCount > 0) {
    wishlistBadge.textContent = wishlistCount;
    wishlistBadge.style.display = 'flex';
  }
};

/* ═══════════════════════════════════════════════════════════
   Account label — placeholder for Stage 10 auth
   ═══════════════════════════════════════════════════════════ */
const initAccountLabel = () => {
  const greeting = document.getElementById('account-greeting');
  const label = document.getElementById('account-label');
  const link = document.getElementById('account-link');
  if (!greeting || !label || !link) return;

  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const firstName = (user.name || '').split(' ')[0] || 'Account';
      greeting.textContent = `Hi, ${firstName}`;
      label.textContent = 'My Account';
      link.href = '/pages/account.html';
    }
  } catch {
    // Ignore malformed localStorage
  }
};

/* ═══════════════════════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════════════════════ */
export const mountHeader = () => {
  const target = document.getElementById('site-header');
  if (!target) return;

  target.outerHTML = HEADER_HTML;

  initSearch();
  initMobileMenu();
  initScrollShadow();
  initBadges();
  initAccountLabel();
  loadCategories();
};

export default mountHeader;