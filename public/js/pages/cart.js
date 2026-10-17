/**
 * cart.js
 * -------
 * Shopping cart page controller.
 * Fetches cart from API, renders items, calculates totals,
 * handles quantity updates, removals, coupons, and checkout redirect.
 */

import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { toast } from '../components/toast.js';
import { api, formatNaira } from '../api.js';
import { auth } from '../auth.js';

let cartData = null;

const updateBadge = (count) => {
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'flex';
    localStorage.setItem('cartCount', String(count));
  } else {
    badge.style.display = 'none';
    localStorage.removeItem('cartCount');
  }
};

const renderCart = (data) => {
  cartData = data;
  updateBadge(data.itemCount);

  const loading = document.getElementById('cart-loading');
  const empty = document.getElementById('cart-empty');
  const layout = document.getElementById('cart-layout');
  const itemsEl = document.getElementById('cart-items');
  const couponSection = document.getElementById('coupon-section');

  loading.style.display = 'none';

  if (!data.items.length) {
    empty.style.display = 'flex';
    layout.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  layout.style.display = 'grid';

  // Render items
  itemsEl.innerHTML = data.items.map((item) => `
    <div class="cart-item" data-product-id="${item.productId}">
      <img src="${item.image}" alt="${item.name}" class="cart-item__img" onerror="this.onerror=null;this.src='/images/placeholders/product.svg';" />
      <div class="cart-item__info">
        <div class="cart-item__brand">${item.brand}</div>
        <a href="/pages/product.html?slug=${encodeURIComponent(item.slug)}" class="cart-item__name">${item.name}</a>
        <div class="cart-item__price">${formatNaira(item.price)}</div>
        <div class="cart-item__qty">
          <button class="cart-item__qty-btn" data-qty="${item.quantity - 1}">−</button>
          <input type="number" class="cart-item__qty-input" value="${item.quantity}" min="1" max="${item.stock}" />
          <button class="cart-item__qty-btn" data-qty="${item.quantity + 1}">+</button>
        </div>
      </div>
      <div class="cart-item__right">
        <div class="cart-item__line-total">${formatNaira(item.lineTotal)}</div>
        <button class="cart-item__remove" data-remove>Remove</button>
      </div>
    </div>
  `).join('');

  // Summary
  document.getElementById('sum-subtotal').textContent = formatNaira(data.subtotal);
  document.getElementById('sum-delivery').textContent = data.deliveryFee === 0 ? 'FREE' : formatNaira(data.deliveryFee);
  document.getElementById('sum-total').textContent = formatNaira(data.total);

  const discountRow = document.getElementById('sum-discount-row');
  if (data.discount > 0) {
    document.getElementById('sum-discount').textContent = `−${formatNaira(data.discount)}`;
    discountRow.style.display = 'flex';
  } else {
    discountRow.style.display = 'none';
  }

  // Coupon section
  if (data.coupon) {
    couponSection.innerHTML = `
      <div class="cart-coupon-applied">
        <span>✓ ${data.coupon.code} applied (−${formatNaira(data.coupon.discount)})</span>
        <button id="remove-coupon" aria-label="Remove coupon">×</button>
      </div>
    `;
    document.getElementById('remove-coupon')?.addEventListener('click', removeCoupon);
  } else {
    couponSection.innerHTML = `
      <form class="cart-coupon-form" id="coupon-form">
        <input type="text" class="form-input" id="coupon-input" placeholder="Coupon code" />
        <button type="submit" class="btn btn-outline btn-sm" id="coupon-btn">Apply</button>
      </form>
    `;
    document.getElementById('coupon-form')?.addEventListener('submit', applyCoupon);
  }

  // Wire item actions
  itemsEl.querySelectorAll('.cart-item').forEach((row) => {
    const pid = row.dataset.productId;

    row.querySelectorAll('.cart-item__qty-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const newQty = Number(btn.dataset.qty);
        if (newQty < 1) return;
        updateQuantity(pid, newQty);
      });
    });

    row.querySelector('.cart-item__qty-input')?.addEventListener('change', (e) => {
      const newQty = Number(e.target.value);
      if (newQty >= 1) updateQuantity(pid, newQty);
    });

    row.querySelector('[data-remove]')?.addEventListener('click', () => removeItem(pid));
  });
};

const loadCart = async () => {
  try {
    const data = await api.get('/cart');
    renderCart(data);
  } catch (err) {
    toast(err.message, 'error');
  }
};

const updateQuantity = async (productId, quantity) => {
  try {
    const data = await api.put(`/cart/update/${productId}`, { quantity });
    renderCart(data);
  } catch (err) {
    toast(err.message, 'error');
  }
};

const removeItem = async (productId) => {
  try {
    const data = await api.delete(`/cart/remove/${productId}`);
    renderCart(data);
    toast('Item removed', 'success');
  } catch (err) {
    toast(err.message, 'error');
  }
};

const applyCoupon = async (e) => {
  e.preventDefault();
  const code = document.getElementById('coupon-input').value.trim();
  if (!code) return;
  const btn = document.getElementById('coupon-btn');
  btn.disabled = true;
  btn.textContent = '…';
  try {
    const data = await api.post('/cart/coupon', { code });
    renderCart(data);
    toast('Coupon applied', 'success');
  } catch (err) {
    toast(err.message, 'error');
  }
  btn.disabled = false;
  btn.textContent = 'Apply';
};

const removeCoupon = async () => {
  try {
    const data = await api.delete('/cart/coupon');
    renderCart(data);
    toast('Coupon removed', 'info');
  } catch (err) {
    toast(err.message, 'error');
  }
};

const init = async () => {
  mountHeader();
  mountFooter();

  if (!auth.isLoggedIn()) {
    window.location.href = '/pages/login.html?redirect=/pages/cart.html';
    return;
  }

  // Checkout redirect (fixed)
  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    if (!cartData || !cartData.items || cartData.items.length === 0) {
      toast('Your cart is empty', 'warning');
      return;
    }
    window.location.href = '/pages/checkout.html';
  });

  await loadCart();
};

document.addEventListener('DOMContentLoaded', init);