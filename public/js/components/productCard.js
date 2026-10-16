/**
 * productCard.js
 * --------------
 * Renders a reusable product card used across:
 *  - Homepage (featured, trending, best sellers, new arrivals, recommended, flash sale)
 *  - Product listings page (Stage 8)
 *  - Category pages (Stage 8)
 *  - Search results (Stage 8)
 *  - Wishlist (Stage 11)
 *
 * Reads from a plain product object with fields matching the Mongoose Product model.
 */

import { formatNaira, calcDiscount, renderStars } from '../api.js';

const PLACEHOLDER_IMAGE = '/images/placeholders/product.svg';

/**
 * Safely resolve a product's primary image.
 */
const resolveImage = (product) => {
  if (product.thumbnail) return product.thumbnail;
  if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
  return PLACEHOLDER_IMAGE;
};

/**
 * Build the badges row for a product (discount, flash, featured, new, out-of-stock).
 */
const buildBadges = (product) => {
  const badges = [];
  const discount = calcDiscount(product.price, product.previousPrice);

  if (discount > 0) {
    badges.push(`<span class="badge badge-discount">-${discount}%</span>`);
  }

  if (product.isFlashSale) {
    badges.push(`<span class="badge badge-flash">⚡ Flash</span>`);
  }

  if (product.stock === 0) {
    badges.push(`<span class="badge badge-danger">Out of Stock</span>`);
  } else if (product.isFeatured && discount === 0 && !product.isFlashSale) {
    badges.push(`<span class="badge badge-featured">Featured</span>`);
  }

  return badges.length
    ? `<div class="product-card__badges">${badges.join('')}</div>`
    : '';
};

/**
 * Build the stock status line under the button.
 */
const buildStockLine = (product) => {
  if (product.stock === 0) {
    return `<p class="product-card__stock product-card__stock--out mt-2">Out of stock</p>`;
  }
  if (product.stock <= 5) {
    return `<p class="product-card__stock product-card__stock--low mt-2">Only ${product.stock} left in stock</p>`;
  }
  return '';
};

/**
 * Main renderer.
 * @param {Object} product
 * @returns {string} HTML string
 */
export const productCard = (product) => {
  const image = resolveImage(product);
  const inStock = product.stock > 0;
  const rating = product.rating?.average || 0;
  const ratingCount = product.rating?.count || 0;
  const productUrl = `/pages/product.html?slug=${encodeURIComponent(product.slug)}`;

  return `
    <article class="product-card" data-product-id="${product._id || ''}">
      <div class="product-card__media">
        <a href="${productUrl}" aria-label="${product.name}">
          <img
            src="${image}"
            alt="${product.name}"
            class="product-card__image"
            loading="lazy"
            onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}';"
          />
        </a>

        ${buildBadges(product)}

        <div class="product-card__actions">
          <button
            type="button"
            class="product-card__action"
            title="Add to wishlist"
            aria-label="Add to wishlist"
            data-action="wishlist"
            data-product-id="${product._id || ''}"
          >♡</button>
          <button
            type="button"
            class="product-card__action"
            title="Quick view"
            aria-label="Quick view"
            data-action="quickview"
            data-product-id="${product._id || ''}"
          >👁</button>
        </div>
      </div>

      <div class="product-card__body">
        <span class="product-card__brand">${product.brand || ''}</span>
        <a href="${productUrl}" class="product-card__title" title="${product.name}">
          ${product.name}
        </a>

        <div class="product-card__rating">
          <span class="product-card__stars">${renderStars(rating)}</span>
          <span>${rating.toFixed(1)} (${ratingCount})</span>
        </div>

        <div class="product-card__price-block">
          ${
            product.previousPrice && product.previousPrice > product.price
              ? `<span class="product-card__previous">${formatNaira(product.previousPrice)}</span>`
              : ''
          }
          <span class="product-card__price">${formatNaira(product.price)}</span>
        </div>
      </div>

      <div class="product-card__footer">
        <button
          type="button"
          class="btn btn-primary btn-sm btn-block"
          data-action="add-to-cart"
          data-product-id="${product._id || ''}"
          ${!inStock ? 'disabled' : ''}
        >
          ${inStock ? '🛒 Add to Cart' : 'Out of Stock'}
        </button>
        ${buildStockLine(product)}
      </div>
    </article>
  `;
};

export default productCard;