/**
 * listing.js
 * ----------
 * Product listing controller for /pages/products.html.
 * Reads filters from URL params, fetches products + facets, renders grid + pagination.
 * URL is the source of truth — every filter change updates the URL.
 */

import { api, formatNaira } from '../api.js';
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
  search: '',
  category: '',
  brands: [],
  minPrice: null,
  maxPrice: null,
  rating: null,
  inStock: false,
  onSale: false,
  flashSale: false,
};

/**
 * Parse URL params into state.
 */
const readUrlState = () => {
  const p = new URLSearchParams(window.location.search);
  state.page = Number(p.get('page')) || 1;
  state.limit = Number(p.get('limit')) || 20;
  state.sort = p.get('sort') || 'latest';
  state.search = p.get('search') || '';
  state.category = p.get('category') || '';
  state.brands = p.get('brand') ? p.get('brand').split(',').filter(Boolean) : [];
  state.minPrice = p.get('minPrice') ? Number(p.get('minPrice')) : null;
  state.maxPrice = p.get('maxPrice') ? Number(p.get('maxPrice')) : null;
  state.rating = p.get('rating') ? Number(p.get('rating')) : null;
  state.inStock = p.get('inStock') === 'true';
  state.onSale = p.get('onSale') === 'true';
  state.flashSale = p.get('flashSale') === 'true';
};

/**
 * Write state back into the URL (without reloading the page).
 */
const writeUrlState = () => {
  const p = new URLSearchParams();
  if (state.page > 1) p.set('page', state.page);
  if (state.limit !== 20) p.set('limit', state.limit);
  if (state.sort !== 'latest') p.set('sort', state.sort);
  if (state.search) p.set('search', state.search);
  if (state.category) p.set('category', state.category);
  if (state.brands.length) p.set('brand', state.brands.join(','));
  if (state.minPrice !== null) p.set('minPrice', state.minPrice);
  if (state.maxPrice !== null) p.set('maxPrice', state.maxPrice);
  if (state.rating !== null) p.set('rating', state.rating);
  if (state.inStock) p.set('inStock', 'true');
  if (state.onSale) p.set('onSale', 'true');
  if (state.flashSale) p.set('flashSale', 'true');

  const qs = p.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState({}, '', url);
};

/**
 * Build query string for the API call.
 */
const buildQueryString = () => {
  const p = new URLSearchParams();
  p.set('page', state.page);
  p.set('limit', state.limit);
  p.set('sort', state.sort);
  if (state.search) p.set('search', state.search);
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

/* ───────────────  RENDER HELPERS  ─────────────── */

const renderProducts = (products, total) => {
  const grid = document.getElementById('products-grid');
  const count = document.getElementById('listing-count');

  count.textContent = total
    ? `${total.toLocaleString()} product${total === 1 ? '' : 's'} found`
    : 'No products found';

  if (!products.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state__icon">🔍</div>
        <h3 class="empty-state__title">No products match your filters</h3>
        <p class="empty-state__message">Try clearing some filters or searching with different keywords.</p>
        <button class="btn btn-primary" id="empty-clear">Clear all filters</button>
      </div>
    `;
    document.getElementById('empty-clear')?.addEventListener('click', clearAllFilters);
    return;
  }

  grid.innerHTML = products.map(productCard).join('');
};

const renderPagination = (pagination) => {
  const el = document.getElementById('pagination');
  const { page, pages } = pagination;

  if (pages <= 1) {
    el.innerHTML = '';
    return;
  }

  const parts = [];
  const addBtn = (label, targetPage, opts = {}) => {
    parts.push(`
      <button
        class="pagination__btn ${opts.active ? 'is-active' : ''}"
        data-page="${targetPage}"
        ${opts.disabled ? 'disabled' : ''}
      >${label}</button>
    `);
  };

  addBtn('‹', page - 1, { disabled: page <= 1 });

  // Compute page numbers with ellipsis
  const windowSize = 2;
  const start = Math.max(1, page - windowSize);
  const end = Math.min(pages, page + windowSize);

  if (start > 1) {
    addBtn('1', 1);
    if (start > 2) parts.push('<span class="pagination__ellipsis">…</span>');
  }

  for (let i = start; i <= end; i++) {
    addBtn(String(i), i, { active: i === page });
  }

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

const renderCategoriesFilter = (categories) => {
  const el = document.getElementById('filter-categories');
  if (!el) return;

  const items = [
    `<label class="filter-option">
      <input type="radio" name="cat" value="" ${!state.category ? 'checked' : ''} />
      <span>All Categories</span>
    </label>`,
    ...categories.map(
      (c) => `
      <label class="filter-option">
        <input type="radio" name="cat" value="${c.slug}" ${state.category === c.slug ? 'checked' : ''} />
        <span>${c.name}</span>
      </label>
    `
    ),
  ];

  el.innerHTML = items.join('');

  el.querySelectorAll('input[name="cat"]').forEach((input) => {
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
        <input type="checkbox" value="${b.name}" ${state.brands.includes(b.name) ? 'checked' : ''} />
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

  el.innerHTML = RATING_OPTIONS.map(
    (r) => `
    <label class="filter-option">
      <input type="radio" name="rating" value="${r}" ${state.rating === r ? 'checked' : ''} />
      <span>${'★'.repeat(Math.floor(r))}${r % 1 ? '☆' : ''} & up</span>
    </label>
  `
  ).join('') + `
    <label class="filter-option">
      <input type="radio" name="rating" value="" ${state.rating === null ? 'checked' : ''} />
      <span>Any rating</span>
    </label>
  `;

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
    (p) => `<button class="filter-price__preset" data-min="${p.min}" data-max="${p.max ?? ''}">${p.label}</button>`
  ).join('');

  el.querySelectorAll('.filter-price__preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.minPrice = Number(btn.dataset.min);
      state.maxPrice = btn.dataset.max ? Number(btn.dataset.max) : null;
      document.getElementById('price-min').value = state.minPrice ?? '';
      document.getElementById('price-max').value = state.maxPrice ?? '';
      state.page = 1;
      writeUrlState();
      loadProducts();
    });
  });
};

const renderActiveChips = () => {
  const el = document.getElementById('active-filters');
  const chips = [];

  if (state.search) chips.push({ label: `Search: "${state.search}"`, key: 'search' });
  if (state.category) chips.push({ label: `Category: ${state.category}`, key: 'category' });
  state.brands.forEach((b) => chips.push({ label: `Brand: ${b}`, key: `brand:${b}` }));
  if (state.minPrice !== null || state.maxPrice !== null) {
    chips.push({
      label: `Price: ${formatNaira(state.minPrice || 0)} – ${state.maxPrice ? formatNaira(state.maxPrice) : '∞'}`,
      key: 'price',
    });
  }
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
      (c) => `<span class="chip" data-key="${c.key}">${c.label} <button class="chip__remove" aria-label="Remove filter">×</button></span>`
    )
    .join('');

  el.querySelectorAll('.chip__remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.parentElement.dataset.key;
      removeFilterByKey(key);
    });
  });

  document.getElementById('clear-filters').hidden = false;
};

const removeFilterByKey = (key) => {
  if (key === 'search') state.search = '';
  else if (key === 'category') state.category = '';
  else if (key === 'price') {
    state.minPrice = null;
    state.maxPrice = null;
    document.getElementById('price-min').value = '';
    document.getElementById('price-max').value = '';
  } else if (key === 'rating') state.rating = null;
  else if (key === 'inStock') state.inStock = false;
  else if (key === 'onSale') state.onSale = false;
  else if (key === 'flashSale') state.flashSale = false;
  else if (key.startsWith('brand:')) {
    const b = key.slice(6);
    state.brands = state.brands.filter((x) => x !== b);
  }

  state.page = 1;
  writeUrlState();
  syncCheckboxesFromState();
  loadProducts();
};

const clearAllFilters = () => {
  state.page = 1;
  state.search = '';
  state.category = '';
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
  document.getElementById('filter-instock').checked = state.inStock;
  document.getElementById('filter-onsale').checked = state.onSale;
  document.getElementById('filter-flash').checked = state.flashSale;
  document.getElementById('price-min').value = state.minPrice ?? '';
  document.getElementById('price-max').value = state.maxPrice ?? '';
};

/* ───────────────  LOADERS  ─────────────── */

const loadProducts = async () => {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = Array.from({ length: 8 })
    .map(() => '<div class="skeleton skeleton-image" style="aspect-ratio:3/4;"></div>')
    .join('');

  try {
    const data = await api.get(`/products?${buildQueryString()}`);
    renderProducts(data.products, data.pagination.total);
    renderPagination(data.pagination);
    renderActiveChips();
    updateDocumentTitle(data.pagination.total);
  } catch (err) {
    console.error('Failed to load products:', err);
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state__icon">⚠️</div>
        <h3 class="empty-state__title">Couldn't load products</h3>
        <p class="empty-state__message">${err.message}</p>
        <button class="btn btn-primary" onclick="location.reload()">Retry</button>
      </div>
    `;
    toast('Could not load products', 'error');
  }
};

const loadCategories = async () => {
  try {
    const data = await api.get('/categories?level=0');
    renderCategoriesFilter(data.categories);
  } catch (err) {
    console.warn('Categories failed to load:', err.message);
  }
};

const loadFacets = async () => {
  try {
    const params = new URLSearchParams();
    if (state.category) params.set('category', state.category);
    const data = await api.get(`/products/facets?${params.toString()}`);
    renderBrandsFilter(data.brands);
  } catch (err) {
    console.warn('Facets failed to load:', err.message);
  }
};

const updateDocumentTitle = (total) => {
  if (state.search) {
    document.title = `Search: "${state.search}" (${total}) — Kelvin Ikpeni Marketplace`;
  } else if (state.category) {
    document.title = `${state.category} (${total}) — Kelvin Ikpeni Marketplace`;
  }
};

/* ───────────────  INIT  ─────────────── */

const init = async () => {
  mountHeader();
  mountFooter();
  readUrlState();
  syncCheckboxesFromState();
  renderRatingFilter();
  renderPricePresets();

  // Sync sort dropdown
  document.getElementById('sort-select').value = state.sort;
  document.getElementById('sort-select').addEventListener('change', (e) => {
    state.sort = e.target.value;
    state.page = 1;
    writeUrlState();
    loadProducts();
  });

  // Price inputs (debounced)
  let priceTimer;
  const priceHandler = () => {
    clearTimeout(priceTimer);
    priceTimer = setTimeout(() => {
      const min = document.getElementById('price-min').value;
      const max = document.getElementById('price-max').value;
      state.minPrice = min ? Number(min) : null;
      state.maxPrice = max ? Number(max) : null;
      state.page = 1;
      writeUrlState();
      loadProducts();
    }, 500);
  };
  document.getElementById('price-min').addEventListener('input', priceHandler);
  document.getElementById('price-max').addEventListener('input', priceHandler);

  // Availability checkboxes
  document.getElementById('filter-instock').addEventListener('change', (e) => {
    state.inStock = e.target.checked;
    state.page = 1;
    writeUrlState();
    loadProducts();
  });
  document.getElementById('filter-onsale').addEventListener('change', (e) => {
    state.onSale = e.target.checked;
    state.page = 1;
    writeUrlState();
    loadProducts();
  });
  document.getElementById('filter-flash').addEventListener('change', (e) => {
    state.flashSale = e.target.checked;
    state.page = 1;
    writeUrlState();
    loadProducts();
  });

  // Clear all
  document.getElementById('clear-filters').addEventListener('click', clearAllFilters);

  // Mobile sidebar open/close
  const sidebar = document.getElementById('filters-sidebar');
  document.getElementById('open-filters')?.addEventListener('click', () => sidebar.classList.add('is-open'));
  document.getElementById('close-filters')?.addEventListener('click', () => sidebar.classList.remove('is-open'));
  sidebar.addEventListener('click', (e) => {
    if (e.target === sidebar) sidebar.classList.remove('is-open');
  });

  // Load data in parallel
  await Promise.all([loadCategories(), loadFacets()]);
  await loadProducts();
};

document.addEventListener('DOMContentLoaded', init);