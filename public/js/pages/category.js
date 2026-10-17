/**
 * category.js
 * -----------
 * Category page controller for /pages/category.html.
 * Reads ?slug= from URL, loads the category + its children,
 * fetches products scoped to the category, and renders filters,
 * sort, pagination.
 */

import { api } from '../api.js';
import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { productCard } from '../components/productCard.js';
import { toast } from '../components/toast.js';

const PRICE_PRESETS = [
  { label: 'Under ₦10k', min: 0, max: 10000 },
  { label: '₦10k – ₦50k', min: 10000, max: 50000 },
  { label: '₦50k – ₦200k', min: 50000, max: 200000 },
  { label: '₦200k – ₦1M', min: 200000, max: 1000000 },
  { label: 'Above ₦1M', min: 1000000, max: null },
];

const RATING_OPTIONS = [4.5, 4, 3.5, 3];

const state = {
  page: 1,
  limit: 20,
  sort: 'latest',
  category: '',
  categoryData: null,
  brands: [],
  minPrice: null,
  maxPrice: null,
  rating: null,
  inStock: false,
  onSale: false,
  flashSale: false,
};

/* ═══════════════════════════════════════════════════════════
   URL state
   ═══════════════════════════════════════════════════════════ */
const readUrlState = () => {
  const p = new URLSearchParams(window.location.search);
  state.page = Number(p.get('page')) || 1;
  state.limit = Number(p.get('limit')) || 20;
  state.sort = p.get('sort') || 'latest';
  state.category = p.get('slug') || '';
  state.brands = p.get('brand') ? p.get('brand').split(',').filter(Boolean) : [];
  state.minPrice = p.get('minPrice') ? Number(p.get('minPrice')) : null;
  state.maxPrice = p.get('maxPrice') ? Number(p.get('maxPrice')) : null;
  state.rating = p.get('rating') ? Number(p.get('rating')) : null;
  state.inStock = p.get('inStock') === 'true';
  state.onSale = p.get('onSale') === 'true';
  state.flashSale = p.get('flashSale') === 'true';
};

const writeUrlState = () => {
  const p = new URLSearchParams();
  if (state.category) p.set('slug', state.category);
  if (state.page > 1) p.set('page', state.page);
  if (state.sort !== 'latest') p.set('sort', state.sort);
  if (state.brands.length) p.set('brand', state.brands.join(','));
  if (state.minPrice !== null) p.set('minPrice', state.minPrice);
  if (state.maxPrice !== null) p.set('maxPrice', state.maxPrice);
  if (state.rating !== null) p.set('rating', state.rating);
  if (state.inStock) p.set('inStock', 'true');
  if (state.onSale) p.set('onSale', 'true');
  if (state.flashSale) p.set('flashSale', 'true');
  const qs = p.toString();
  window.history.replaceState(
    {},
    '',
    qs ? `${window.location.pathname}?${qs}` : window.location.pathname
  );
};

const buildQueryString = () => {
  const p = new URLSearchParams();
  p.set('page', state.page);
  p.set('limit', state.limit);
  p.set('sort', state.sort);
  if (state.category) p.set('category', state.category);
  if (state.brands.length) p.set('brand', state.brands.join(','));
  if (state.minPrice !== null) p.set('minPrice', state.minPrice);
  if (state.maxPrice !== null) p.set('maxPrice', state.maxPrice);
  if (state.rating !== null) p.set('rating', state.rating);
  if (state.inStock) p.set('inStock', 'true');
  if (state.onSale) p.set('onSale', 'true');
  if (state.flashSale) p.set('flashSale', 'true');
  return p.toString();
};

/* ═══════════════════════════════════════════════════════════
   Render helpers
   ═══════════════════════════════════════════════════════════ */
const renderProducts = (products, total) => {
  const grid = document.getElementById('products-grid');
  const count = document.getElementById('listing-count');
  if (!grid) return;

  count.textContent = total
    ? `${total.toLocaleString()} product${total === 1 ? '' : 's'}`
    : 'No products found';

  if (!products.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state__icon">🔍</div>
        <h3 class="empty-state__title">No products in this category yet</h3>
        <p class="empty-state__message">Try adjusting your filters or explore other categories.</p>
        <button class="btn btn-primary" id="empty-clear">Clear filters</button>
      </div>
    `;
    document.getElementById('empty-clear')?.addEventListener('click', clearAllFilters);
    return;
  }

  grid.innerHTML = products.map(productCard).join('');
};

const renderPagination = (pagination) => {
  const el = document.getElementById('pagination');
  if (!el) return;
  const { page, pages } = pagination;
  if (pages <= 1) {
    el.innerHTML = '';
    return;
  }

  const parts = [];
  const addBtn = (label, target, opts = {}) => {
    parts.push(`
      <button class="pagination__btn ${opts.active ? 'is-active' : ''}"
        data-page="${target}" ${opts.disabled ? 'disabled' : ''}>${label}</button>
    `);
  };

  addBtn('‹', page - 1, { disabled: page <= 1 });
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, page + 2);
  if (start > 1) {
    addBtn('1', 1);
    if (start > 2) parts.push('<span class="pagination__ellipsis">…</span>');
  }
  for (let i = start; i <= end; i++) addBtn(String(i), i, { active: i === page });
  if (end < pages) {
    if (end < pages - 1) parts.push('<span class="pagination__ellipsis">…</span>');
    addBtn(String(pages), pages);
  }
  addBtn('›', page + 1, { disabled: page >= pages });

  el.innerHTML = parts.join('');
  el.querySelectorAll('button[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = Number(btn.dataset.page);
      if (!p || p === state.page) return;
      state.page = p;
      writeUrlState();
      loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
};

const renderSubcategories = (children) => {
  const el = document.getElementById('filter-categories');
  if (!el) return;
  if (!children || !children.length) {
    el.innerHTML = '<p class="text-muted text-xs">No subcategories.</p>';
    return;
  }
  el.innerHTML = children
    .map(
      (c) => `
      <label class="filter-option">
        <input type="radio" name="subcat" value="${c.slug}" ${
        state.category === c.slug ? 'checked' : ''
      } />
        <span>${c.name}</span>
      </label>
    `
    )
    .join('');

  el.querySelectorAll('input[name="subcat"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.category = input.value;
      state.page = 1;
      writeUrlState();
      loadProducts();
    });
  });
};

const renderBrandsFilter = (brands) => {
  const el = document.getElementById('filter-brands');
  if (!el) return;
  if (!brands.length) {
    el.innerHTML = '<p class="text-muted text-xs">No brands available.</p>';
    return;
  }
  el.innerHTML = brands
    .map(
      (b) => `
      <label class="filter-option">
        <input type="checkbox" value="${b.name}" ${
        state.brands.includes(b.name) ? 'checked' : ''
      } />
        <span>${b.name}</span>
        <span class="filter-option__count">${b.count}</span>
      </label>
    `
    )
    .join('');

  el.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.addEventListener('change', () => {
      const brand = input.value;
      if (input.checked) {
        if (!state.brands.includes(brand)) state.brands.push(brand);
      } else {
        state.brands = state.brands.filter((b) => b !== brand);
      }
      state.page = 1;
      writeUrlState();
      loadProducts();
    });
  });
};

const renderRatingFilter = () => {
  const el = document.getElementById('filter-rating');
  if (!el) return;
  el.innerHTML =
    RATING_OPTIONS.map(
      (r) => `
      <label class="filter-option">
        <input type="radio" name="rating" value="${r}" ${
        state.rating === r ? 'checked' : ''
      } />
        <span>${'★'.repeat(Math.floor(r))}${r % 1 ? '☆' : ''} & up</span>
      </label>
    `
    ).join('') +
    `<label class="filter-option">
      <input type="radio" name="rating" value="" ${state.rating === null ? 'checked' : ''} />
      <span>Any rating</span>
    </label>`;

  el.querySelectorAll('input[name="rating"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.rating = input.value ? Number(input.value) : null;
      state.page = 1;
      writeUrlState();
      loadProducts();
    });
  });
};

const renderPricePresets = () => {
  const el = document.getElementById('price-presets');
  if (!el) return;
  el.innerHTML = PRICE_PRESETS.map(
    (p) =>
      `<button class="filter-price__preset" data-min="${p.min}" data-max="${
        p.max ?? ''
      }">${p.label}</button>`
  ).join('');
  el.querySelectorAll('.filter-price__preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.minPrice = Number(btn.dataset.min);
      state.maxPrice = btn.dataset.max ? Number(btn.dataset.max) : null;
      const minEl = document.getElementById('price-min');
      const maxEl = document.getElementById('price-max');
      if (minEl) minEl.value = state.minPrice ?? '';
      if (maxEl) maxEl.value = state.maxPrice ?? '';
      state.page = 1;
      writeUrlState();
      loadProducts();
    });
  });
};

const renderActiveChips = () => {
  const el = document.getElementById('active-filters');
  if (!el) return;
  const chips = [];
  state.brands.forEach((b) => chips.push({ label: `Brand: ${b}`, key: `brand:${b}` }));
  if (state.minPrice !== null || state.maxPrice !== null)
    chips.push({ label: 'Price range', key: 'price' });
  if (state.rating !== null) chips.push({ label: `${state.rating}★ & up`, key: 'rating' });
  if (state.inStock) chips.push({ label: 'In stock', key: 'inStock' });
  if (state.onSale) chips.push({ label: 'On sale', key: 'onSale' });
  if (state.flashSale) chips.push({ label: 'Flash sale', key: 'flashSale' });

  if (!chips.length) {
    el.hidden = true;
    el.innerHTML = '';
    return;
  }
  el.hidden = false;
  el.innerHTML = chips
    .map(
      (c) =>
        `<span class="chip" data-key="${c.key}">${c.label} <button class="chip__remove" aria-label="Remove">×</button></span>`
    )
    .join('');
  el.querySelectorAll('.chip__remove').forEach((btn) =>
    btn.addEventListener('click', () => removeFilterByKey(btn.parentElement.dataset.key))
  );
};

const removeFilterByKey = (key) => {
  if (key === 'price') {
    state.minPrice = null;
    state.maxPrice = null;
    const minEl = document.getElementById('price-min');
    const maxEl = document.getElementById('price-max');
    if (minEl) minEl.value = '';
    if (maxEl) maxEl.value = '';
  } else if (key === 'rating') state.rating = null;
  else if (key === 'inStock') state.inStock = false;
  else if (key === 'onSale') state.onSale = false;
  else if (key === 'flashSale') state.flashSale = false;
  else if (key.startsWith('brand:')) state.brands = state.brands.filter((x) => x !== key.slice(6));
  state.page = 1;
  writeUrlState();
  syncCheckboxesFromState();
  loadProducts();
};

const clearAllFilters = () => {
  state.page = 1;
  state.brands = [];
  state.minPrice = null;
  state.maxPrice = null;
  state.rating = null;
  state.inStock = false;
  state.onSale = false;
  state.flashSale = false;
  writeUrlState();
  syncCheckboxesFromState();
  loadProducts();
};

const syncCheckboxesFromState = () => {
  const instock = document.getElementById('filter-instock');
  const onsale = document.getElementById('filter-onsale');
  const flash = document.getElementById('filter-flash');
  const minEl = document.getElementById('price-min');
  const maxEl = document.getElementById('price-max');
  if (instock) instock.checked = state.inStock;
  if (onsale) onsale.checked = state.onSale;
  if (flash) flash.checked = state.flashSale;
  if (minEl) minEl.value = state.minPrice ?? '';
  if (maxEl) maxEl.value = state.maxPrice ?? '';
};

/* ═══════════════════════════════════════════════════════════
   Loaders
   ═══════════════════════════════════════════════════════════ */
const loadProducts = async () => {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  grid.innerHTML = Array.from({ length: 8 })
    .map(() => '<div class="skeleton skeleton-image" style="aspect-ratio:3/4;"></div>')
    .join('');

  try {
    const data = await api.get(`/products?${buildQueryString()}`);
    renderProducts(data.products, data.pagination.total);
    renderPagination(data.pagination);
    renderActiveChips();
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <div class="empty-state__icon">⚠️</div>
      <h3 class="empty-state__title">Couldn't load products</h3>
      <p class="empty-state__message">${err.message}</p>
    </div>`;
    toast('Could not load products', 'error');
  }
};

const loadCategoryData = async () => {
  if (!state.category) {
    toast('No category specified', 'error');
    setTimeout(() => (window.location.href = '/pages/products.html'), 1200);
    return;
  }
  try {
    const cat = await api.get(`/categories/${state.category}`);
    state.categoryData = cat;

    // Update hero
    const hero = document.getElementById('category-hero');
    if (hero) hero.hidden = false;
    document.getElementById('category-icon').textContent = cat.icon || '📦';
    document.getElementById('category-title').textContent = cat.name;
    document.getElementById('category-description').textContent = cat.description || '';
    document.getElementById('listing-title').textContent = cat.name;
    document.getElementById('breadcrumb-current').textContent = cat.name;
    document.title = `${cat.name} — Kelvin Ikpeni Marketplace`;

    renderSubcategories(cat.children || []);
  } catch (err) {
    console.error('Category load failed:', err);
    toast('Category not found', 'error');
    setTimeout(() => (window.location.href = '/pages/products.html'), 1200);
  }
};

const loadFacets = async () => {
  try {
    const data = await api.get(`/products/facets?category=${encodeURIComponent(state.category)}`);
    renderBrandsFilter(data.brands);
  } catch (err) {
    console.warn('Facets failed:', err.message);
  }
};

/* ═══════════════════════════════════════════════════════════
   Init
   ═══════════════════════════════════════════════════════════ */
const init = async () => {
  mountHeader();
  mountFooter();
  readUrlState();
  syncCheckboxesFromState();
  renderRatingFilter();
  renderPricePresets();

  // Sort
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.value = state.sort;
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      state.page = 1;
      writeUrlState();
      loadProducts();
    });
  }

  // Price inputs (debounced)
  let priceTimer;
  const priceHandler = () => {
    clearTimeout(priceTimer);
    priceTimer = setTimeout(() => {
      const min = document.getElementById('price-min')?.value;
      const max = document.getElementById('price-max')?.value;
      state.minPrice = min ? Number(min) : null;
      state.maxPrice = max ? Number(max) : null;
      state.page = 1;
      writeUrlState();
      loadProducts();
    }, 500);
  };
  document.getElementById('price-min')?.addEventListener('input', priceHandler);
  document.getElementById('price-max')?.addEventListener('input', priceHandler);

  // Availability checkboxes
  document.getElementById('filter-instock')?.addEventListener('change', (e) => {
    state.inStock = e.target.checked;
    state.page = 1;
    writeUrlState();
    loadProducts();
  });
  document.getElementById('filter-onsale')?.addEventListener('change', (e) => {
    state.onSale = e.target.checked;
    state.page = 1;
    writeUrlState();
    loadProducts();
  });
  document.getElementById('filter-flash')?.addEventListener('change', (e) => {
    state.flashSale = e.target.checked;
    state.page = 1;
    writeUrlState();
    loadProducts();
  });

  // Clear all
  document.getElementById('clear-filters')?.addEventListener('click', clearAllFilters);

  // Mobile sidebar
  const sidebar = document.getElementById('filters-sidebar');
  document.getElementById('open-filters')?.addEventListener('click', () =>
    sidebar?.classList.add('is-open')
  );
  document.getElementById('close-filters')?.addEventListener('click', () =>
    sidebar?.classList.remove('is-open')
  );
  sidebar?.addEventListener('click', (e) => {
    if (e.target === sidebar) sidebar.classList.remove('is-open');
  });

  // Load
  await loadCategoryData();
  await loadFacets();
  await loadProducts();
};

document.addEventListener('DOMContentLoaded', init);