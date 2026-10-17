import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { api } from '../api.js';
import { auth } from '../auth.js';

const init = async () => {
  mountHeader();
  mountFooter();

  if (!auth.isLoggedIn()) {
    window.location.href = '/pages/login.html';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const reference = params.get('reference') || params.get('trxref');

  const title = document.getElementById('pc-title');
  const message = document.getElementById('pc-message');
  const loader = document.getElementById('pc-loader');
  const icon = document.getElementById('pc-icon');
  const actions = document.getElementById('pc-actions');

  if (!reference) {
    title.textContent = 'Payment not found';
    message.textContent = 'No reference in URL. Please check your orders.';
    loader.hidden = true;
    icon.hidden = false;
    icon.textContent = '⚠️';
    actions.hidden = false;
    return;
  }

  try {
    const data = await api.get(`/payments/verify/${reference}`);
    if (data.status === 'success') {
      loader.hidden = true;
      icon.hidden = false;
      icon.textContent = '✅';
      title.textContent = 'Payment successful!';
      message.innerHTML = `Your order <strong>${data.orderNumber || ''}</strong> has been confirmed. We'll notify you when it ships.`;
      actions.hidden = false;
      // Refresh cart badge
      localStorage.setItem('cartCount', '0');
      const badge = document.getElementById('cart-count');
      if (badge) badge.style.display = 'none';
    }
  } catch (err) {
    loader.hidden = true;
    icon.hidden = false;
    icon.textContent = '❌';
    title.textContent = 'Payment failed';
    message.textContent = err.message || 'Please try again or contact support.';
    actions.hidden = false;
  }
};

document.addEventListener('DOMContentLoaded', init);