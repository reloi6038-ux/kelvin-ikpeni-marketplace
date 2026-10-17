import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { toast } from '../components/toast.js';
import { productCard } from '../components/productCard.js';
import { api } from '../api.js';
import { auth } from '../auth.js';

const updateBadge = (count) => {
  const badge = document.getElementById('wishlist-count');
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'flex';
    localStorage.setItem('wishlistCount', String(count));
  } else {
    badge.style.display = 'none';
    localStorage.removeItem('wishlistCount');
  }
};

const render = (products) => {
  const loading = document.getElementById('wishlist-loading');
  const empty = document.getElementById('wishlist-empty');
  const grid = document.getElementById('wishlist-grid');

  loading.style.display = 'none';
  updateBadge(products.length);

  if (!products.length) {
    empty.style.display = 'flex';
    grid.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  grid.style.display = 'grid';
  grid.innerHTML = products.map(productCard).join('');

  // Wire "Remove from wishlist" — will add real handler next stage
  grid.querySelectorAll('[data-action="wishlist"]').forEach((btn) => {
    btn.classList.add('is-active');
    btn.textContent = '♥';
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const pid = btn.dataset.productId;
      try {
        await api.delete(`/wishlist/remove/${pid}`);
        const data = await api.get('/wishlist');
        render(data.products);
        toast('Removed from wishlist', 'info');
      } catch (err) {
        toast(err.message, 'error');
      }
    });
  });
};

const init = async () => {
  mountHeader();
  mountFooter();

  if (!auth.isLoggedIn()) {
    window.location.href = '/pages/login.html?redirect=/pages/wishlist.html';
    return;
  }

  try {
    const data = await api.get('/wishlist');
    render(data.products);
  } catch (err) {
    toast(err.message, 'error');
  }
};

document.addEventListener('DOMContentLoaded', init);