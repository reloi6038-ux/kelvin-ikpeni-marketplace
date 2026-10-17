/**
 * header.js
 * ---------
 * Injects the site header + mobile menu drawer.
 * Loads categories from the API and wires up:
 *  - Search form (with live suggestions)
 *  - Category navigation (links to /pages/category.html?slug=...)
 *  - Mobile drawer
 *  - Sticky shadow on scroll
 *  - Live cart + wishlist badges
 *  - Logged-in user state + logout menu
 */

import { api } from '../api.js';
import { auth } from '../auth.js';

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
        <div class="header__account-wrap" style="position: relative;">
          <a href="/pages/login.html" class="header__action" id="account-link">
            <span class="header__action-icon">👤</span>
            <span class="header__action-label">
              <small id="account-greeting">Sign in</small>
              <strong id="account-label">Account</strong>
            </span>
          </a>
          <div class="header__account-menu" id="account-menu" style="display:none; position: absolute; top: 100%; right: 0; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); box-shadow: var(--shadow-lg); min-width: 200px; z-index: 100; padding: 8px; margin-top: 8px;">
            <a href="/pages/account.html" style="display: block; padding: 10px 16px; color: var(--text-primary); text-decoration: none; border-radius: var(--border-radius-sm);" class="dropdown-item">My Profile</a>
            <a href="/pages/account.html#orders" style="display: block; padding: 10px 16px; color: var(--text-primary); text-decoration: none; border-radius: var(--border-radius-sm);" class="dropdown-item">My Orders</a>
            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 4px 0;" />
            <button id="header-logout-btn" style="display: block; width: 100%; text-align: left; padding: 10px 16px; color: var(--color-danger); background: none; border: none; cursor: pointer; border-radius: var(--border-radius-sm);" class="dropdown-item">Log out</button>
          </div>
        </div>

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

const loadCategories = async () => {
  try {
    const data = await api.get('/categories?level=0');
    const nav = document.getElementById('category-nav');
    const mobileNav = document.getElementById('mobile-menu-nav');
    if (!nav) return;

    const featured = data.categories.slice(0, 10);

    featured.forEach((cat) => {
      const a = document.createElement('a');
      a.href = `/pages/category.html?slug=${encodeURIComponent(cat.slug)}`;
      a.className = 'header__nav-link';
      a.textContent = cat.name;
      nav.appendChild(a);

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

const initSearch = () => {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const box = document.getElementById('search-suggestions');
  if (!form || !input || !box) return;

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
            <img class="search-suggestions__img" src="${p.thumbnail || (p.images && p.images[0]) || '/images/placeholders/product.svg'}" alt="" onerror="this.onerror=null;this.src='/images/placeholders/product.svg';" />
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

  document.addEventListener('click', (e) => {
    if (!form.contains(e.target) && !box.contains(e.target)) {
      box.classList.remove('is-active');
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') box.classList.remove('is-active');
  });
};

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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
  });
};

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

  // Fetch real counts if logged in
  if (auth.isLoggedIn()) {
    api.get('/cart').then(data => {
      if (data.itemCount > 0 && cartBadge) {
        cartBadge.textContent = data.itemCount;
        cartBadge.style.display = 'flex';
        localStorage.setItem('cartCount', String(data.itemCount));
      }
    }).catch(() => {});

    api.get('/wishlist').then(data => {
      if (data.count > 0 && wishlistBadge) {
        wishlistBadge.textContent = data.count;
        wishlistBadge.style.display = 'flex';
        localStorage.setItem('wishlistCount', String(data.count));
      }
    }).catch(() => {});
  }
};

const initAccountLabel = () => {
  const greeting = document.getElementById('account-greeting');
  const label = document.getElementById('account-label');
  const link = document.getElementById('account-link');
  const menu = document.getElementById('account-menu');
  if (!greeting || !label || !link) return;

  const user = auth.getUser();
  if (user) {
    const firstName = (user.name || '').split(' ')[0] || 'Account';
    greeting.textContent = `Hi, ${firstName}`;
    label.textContent = 'My Account';
    link.href = '/pages/account.html';

    // Show dropdown on hover
    link.addEventListener('mouseenter', () => { if(menu) menu.style.display = 'block'; });
    link.parentElement.addEventListener('mouseleave', () => { if(menu) menu.style.display = 'none'; });

    document.getElementById('header-logout-btn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      await auth.logout();
      window.location.href = '/';
    });
  } else {
    greeting.textContent = 'Sign in';
    label.textContent = 'Account';
    link.href = '/pages/login.html';
  }
};

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