/**
 * category.js
 * -----------
 * Category page controller.
 * Fetches category details + products + filter facets.
 * Fully fault-tolerant: never leaves a blank page.
 */

import { api } from '../api.js';
import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { productCard } from '../components/productCard.js';
import { toast } from '../components/toast.js';

// State
const state = {
  categorySlug: '',
  page: 1,
  sort: 'latest',
  brands: [],
  minPrice: null,
  maxPrice: null,
  rating: null,
  inStock: false,
  onSale: false,
  flashSale: false,
};

// URL Helpers
const readUrl = () => {
  const p = new URLSearchParams(window.location.search);
  state.categorySlug = p.get('slug') || '';
  state.page = Number(p.get('page')) || 1;
  state.sort = p.get('sort') || 'latest';
  state.brands = p.get('brand') ? p.get('brand').split(',').filter(Boolean) : [];
  state.minPrice = p.get('minPrice') ? Number(p.get('minPrice')) : null;
  state.maxPrice = p.get('maxPrice') ? Number(p.get('maxPrice')) : null;
  state.rating = p.get('rating') ? Number(p.get('rating')) : null;
  state.inStock = p.get('inStock') === 'true';
  state.onSale = p.get('onSale') === 'true';
  state.flashSale = p.get('flashSale') === 'true';
};

const writeUrl = () => {
  const p = new URLSearchParams();
  if (state.categorySlug) p.set('slug', state.categorySlug);
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
  window.history.replaceState({}, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
};

// Loaders
const loadCategoryData = async () => {
  if (!state.categorySlug) {
    toast('No category specified', 'error');
    window.location.href = '/pages/products.html';
    return false;
  }

  try {
    const cat = await api.get(`/categories/${state.categorySlug}`);
    
    // Update Hero
    const hero = document.getElementById('category-hero');
    if (hero) hero.hidden = false;
    
    document.getElementById('category-icon').textContent = cat.icon || '📦';
    document.getElementById('category-title').textContent = cat.name;
    document.getElementById('category-description').textContent = cat.description || '';
    document.getElementById('listing-title').textContent = cat.name;
    document.getElementById('breadcrumb-current').textContent = cat.name;
    document.title = `${cat.name} — Kelvin Ikpeni Marketplace`;

    // Render Subcategories
    const subcatContainer = document.getElementById('filter-categories');
    if (subcatContainer && cat.children && cat.children.length) {
      subcatContainer.innerHTML = cat.children
        .map(c => `
          <label class="filter-option">
            <input type="radio" name="subcat" value="${c.slug}" ${state.categorySlug === c.slug ? 'checked' : ''} />
            <span>${c.name}</span>
          </label>
        `).join('');

      subcatContainer.querySelectorAll('input[name="subcat"]').forEach(input => {
        input.addEventListener('change', () => {
          state.categorySlug = input.value;
          state.page = 1;
          writeUrl();
          loadCategoryData();
          loadProducts();
        });
      });
    } else if (subcatContainer) {
      subcatContainer.innerHTML = '<p class="text-muted text-xs">No subcategories.</p>';
    }
    
    return true;
  } catch (err) {
    console.error('Category load failed:', err);
    document.getElementById('listing-title').textContent = 'Category Not Found';
    document.getElementById('products-grid').innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">⚠️</div>
        <h3 class="empty-state__title">Category not found</h3>
        <p class="empty-state__message">We couldn't find the category "${state.categorySlug}".</p>
        <a href="/pages/products.html" class="btn btn-primary">Browse All Products</a>
      </div>
    `;
    return false;
  }
};

const loadFacets = async () => {
  try {
    const data = await api.get(`/products/facets?category=${encodeURIComponent(state.categorySlug)}`);
    const brandContainer = document.getElementById('filter-brands');
    
    if (!brandContainer) return;

    if (!data.brands || !data.brands.length) {
      brandContainer.innerHTML = '<p class="text-muted text-xs">No brands available.</p>';
      return;
    }

    brandContainer.innerHTML = data.brands.map(b => `
      <label class="filter-option">
        <input type="checkbox" value="${b.name}" ${state.brands.includes(b.name) ? 'checked' : ''} />
        <span>${b.name}</span>
        <span class="filter-option__count">${b.count}</span>
      </label>
    `).join('');

    brandContainer.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', () => {
        const brand = input.value;
        if (input.checked) {
          if (!state.brands.includes(brand)) state.brands.push(brand);
        } else {
          state.brands = state.brands.filter(b => b !== brand);
        }
        state.page = 1;
        writeUrl();
        loadProducts();
      });
    });
  } catch (err) {
    console.warn('Facets failed:', err.message);
  }
};

const loadProducts = async () => {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = Array.from({ length: 8 }).map(() => '<div class="skeleton" style="aspect-ratio:3/4;"></div>').join('');

  const p = new URLSearchParams();
  p.set('category', state.categorySlug);
  p.set('page', state.page);
  p.set('sort', state.sort);
  if (state.brands.length) p.set('brand', state.brands.join(','));
  if (state.minPrice !== null) p.set('minPrice', state.minPrice);
  if (state.maxPrice !== null) p.set('maxPrice', state.maxPrice);
  if (state.rating !== null) p.set('rating', state.rating);
  if (state.inStock) p.set('inStock', 'true');
  if (state.onSale) p.set('onSale', 'true');

  try {
    const data = await api.get(`/products?${p.toString()}`);
    
    document.getElementById('listing-count').textContent = `${data.pagination.total} products`;
    
    if (!data.products.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-state__icon">🔍</div>
          <h3 class="empty-state__title">No products found</h3>
          <p class="empty-state__message">Try adjusting your filters.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = data.products.map(productCard).join('');
    
    // Pagination (simplified for brevity, works correctly)
    renderPagination(data.pagination);
  } catch (err) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state__icon">⚠️</div>
        <h3 class="empty-state__title">Error loading products</h3>
        <p class="empty-state__message">${err.message}</p>
        <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
      </div>
    `;
  }
};

const renderPagination = (pagination) => {
  const el = document.getElementById('pagination');
  if (pagination.pages <= 1) { el.innerHTML = ''; return; }
  
  // Simple prev / next for stability
  el.innerHTML = `
    <button class="pagination__btn" ${pagination.page === 1 ? 'disabled' : ''} id="prev-page">‹ Prev</button>
    <span class="text-sm">Page ${pagination.page} of ${pagination.pages}</span>
    <button class="pagination__btn" ${pagination.page === pagination.pages ? 'disabled' : ''} id="next-page">Next ›</button>
  `;
  
  document.getElementById('prev-page')?.addEventListener('click', () => {
    if (pagination.page > 1) { state.page--; writeUrl(); loadProducts(); }
  });
  document.getElementById('next-page')?.addEventListener('click', () => {
    if (pagination.page < pagination.pages) { state.page++; writeUrl(); loadProducts(); }
  });
};

// Init
const init = async () => {
  mountHeader();
  mountFooter();
  readUrl();

  // Sort Handler
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.value = state.sort;
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      state.page = 1;
      writeUrl();
      loadProducts();
    });
  }

  // Clear Filters
  document.getElementById('clear-filters')?.addEventListener('click', () => {
    state.brands = [];
    state.minPrice = null;
    state.maxPrice = null;
    state.rating = null;
    state.inStock = false;
    state.onSale = false;
    state.page = 1;
    writeUrl();
    loadCategoryData();
    loadFacets();
    loadProducts();
  });

  // Mobile Sidebar
  const sidebar = document.getElementById('filters-sidebar');
  document.getElementById('open-filters')?.addEventListener('click', () => sidebar?.classList.add('is-open'));
  document.getElementById('close-filters')?.addEventListener('click', () => sidebar?.classList.remove('is-open'));

  // Fetch sequence
  const success = await loadCategoryData();
  if (success) {
    await Promise.all([loadFacets(), loadProducts()]);
  }
};

document.addEventListener('DOMContentLoaded', init);