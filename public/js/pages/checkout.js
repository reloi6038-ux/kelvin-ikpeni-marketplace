import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { toast } from '../components/toast.js';
import { api, formatNaira } from '../api.js';
import { auth } from '../auth.js';

let cartData = null;

const render = (cart) => {
  cartData = cart;
  const layout = document.getElementById('checkout-layout');
  const empty = document.getElementById('checkout-empty');

  if (!cart.items.length) {
    layout.style.display = 'none';
    empty.style.display = 'flex';
    return;
  }

  layout.style.display = 'grid';
  empty.style.display = 'none';

  document.getElementById('checkout-items').innerHTML = cart.items
    .map(
      (item) => `
      <div style="display: grid; grid-template-columns: 50px 1fr auto; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border-color); align-items: center;">
        <img src="${item.image}" style="width:50px;height:50px;border-radius:6px;object-fit:cover;" />
        <div>
          <div style="font-size: 0.85rem; font-weight: 500;">${item.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Qty: ${item.quantity}</div>
        </div>
        <div style="font-weight: 600; font-size: 0.9rem;">${formatNaira(item.lineTotal)}</div>
      </div>
    `
    )
    .join('');

  document.getElementById('co-subtotal').textContent = formatNaira(cart.subtotal);
  document.getElementById('co-delivery').textContent = cart.deliveryFee === 0 ? 'FREE' : formatNaira(cart.deliveryFee);
  document.getElementById('co-total').textContent = formatNaira(cart.total);

  const disc = document.getElementById('co-discount-row');
  if (cart.discount > 0) {
    document.getElementById('co-discount').textContent = `−${formatNaira(cart.discount)}`;
    disc.style.display = 'flex';
  } else {
    disc.style.display = 'none';
  }

  // Prefill user info
  const user = auth.getUser();
  if (user) {
    document.getElementById('ship-name').value = user.name || '';
    document.getElementById('ship-phone').value = user.phone || '';
  }
};

const placeOrder = async () => {
  const btn = document.getElementById('place-order-btn');
  btn.disabled = true;
  btn.textContent = 'Processing…';

  const shippingAddress = {
    fullName: document.getElementById('ship-name').value.trim(),
    phone: document.getElementById('ship-phone').value.trim(),
    street: document.getElementById('ship-street').value.trim(),
    city: document.getElementById('ship-city').value.trim(),
    state: document.getElementById('ship-state').value.trim(),
    postalCode: document.getElementById('ship-postal').value.trim(),
    country: 'Nigeria',
  };

  if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state) {
    toast('Please fill all required fields', 'warning');
    btn.disabled = false;
    btn.textContent = 'Pay Now →';
    return;
  }

  const customerNote = document.getElementById('ship-notes').value.trim();

  try {
    // 1. Create the order
    const order = await api.post('/orders', {
      shippingAddress,
      deliveryMethod: 'standard',
      customerNote,
    });

    // 2. Initialize Paystack payment
    const pay = await api.post('/payments/initialize', { orderNumber: order.orderNumber });

    // 3. Redirect to Paystack
    window.location.href = pay.authorizationUrl;
  } catch (err) {
    toast(err.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Pay Now →';
  }
};

const init = async () => {
  mountHeader();
  mountFooter();

  if (!auth.isLoggedIn()) {
    window.location.href = '/pages/login.html?redirect=/pages/checkout.html';
    return;
  }

  try {
    const cart = await api.get('/cart');
    render(cart);
  } catch (err) {
    toast(err.message, 'error');
  }

  document.getElementById('place-order-btn')?.addEventListener('click', placeOrder);
};

document.addEventListener('DOMContentLoaded', init);