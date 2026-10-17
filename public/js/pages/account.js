import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { toast } from '../components/toast.js';
import { api } from '../api.js';
import { auth } from '../auth.js';

let currentUser = null;

const loadUser = async () => {
  try {
    currentUser = await api.get('/auth/me');
    auth.setUser(currentUser);
    return currentUser;
  } catch {
    return null;
  }
};

const renderUser = (user) => {
  const initials = (user.name || 'U').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  document.getElementById('acct-avatar').textContent = initials;
  document.getElementById('acct-name').textContent = user.name;
  document.getElementById('acct-email').textContent = user.email;

  document.getElementById('profile-name').value = user.name || '';
  document.getElementById('profile-email').value = user.email || '';
  document.getElementById('profile-phone').value = user.phone || '';
};

const loadOrders = async () => {
  const list = document.getElementById('orders-list');
  try {
    const data = await api.get('/auth/orders');
    if (!data.orders?.length) {
      list.innerHTML = '<p style="color: var(--text-muted);">You haven\'t placed any orders yet.</p>';
      return;
    }
    list.innerHTML = data.orders.map((o) => `
      <div class="card" style="padding: var(--space-4); margin-bottom: var(--space-3);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2);">
          <strong>${o.orderNumber}</strong>
          <span class="badge badge-info">${o.status}</span>
        </div>
        <p style="margin: var(--space-2) 0; color: var(--text-secondary); font-size: var(--text-sm);">
          ${o.items?.length || 0} item(s) · ₦${(o.total || 0).toLocaleString()}
        </p>
        <small style="color: var(--text-muted);">${new Date(o.createdAt).toLocaleDateString()}</small>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p style="color: var(--color-danger);">${err.message}</p>`;
  }
};

const initTabs = () => {
  document.querySelectorAll('[data-tab]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      document.querySelectorAll('.account-tab').forEach((t) => (t.hidden = true));
      document.getElementById(`tab-${tab}`)?.removeAttribute('hidden');

      if (tab === 'orders') loadOrders();
    });
  });
};

const init = async () => {
  mountHeader();
  mountFooter();

  if (!auth.isLoggedIn()) {
    window.location.href = '/pages/login.html?redirect=/pages/account.html';
    return;
  }

  const user = await loadUser();
  if (!user) {
    auth.setUser(null);
    window.location.href = '/pages/login.html';
    return;
  }
  renderUser(user);
  initTabs();

  // Profile form
  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errBox = document.getElementById('profile-error');
    errBox.classList.remove('is-visible');
    const btn = document.getElementById('profile-save');
    btn.disabled = true;
    btn.textContent = 'Saving…';

    try {
      await api.put('/auth/profile', {
        name: document.getElementById('profile-name').value.trim(),
        phone: document.getElementById('profile-phone').value.trim(),
      });
      toast('Profile updated', 'success');
      await loadUser();
    } catch (err) {
      errBox.textContent = err.message;
      errBox.classList.add('is-visible');
    }
    btn.disabled = false;
    btn.textContent = 'Save changes';
  });

  // Password form
  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errBox = document.getElementById('password-error');
    errBox.classList.remove('is-visible');

    const currentPassword = document.getElementById('pw-current').value;
    const newPassword = document.getElementById('pw-new').value;
    const newPassword2 = document.getElementById('pw-new2').value;

    if (newPassword !== newPassword2) {
      errBox.textContent = 'New passwords do not match';
      errBox.classList.add('is-visible');
      return;
    }

    const btn = document.getElementById('pw-save');
    btn.disabled = true;
    btn.textContent = 'Updating…';

    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      toast('Password updated', 'success');
      e.target.reset();
    } catch (err) {
      errBox.textContent = err.message;
      errBox.classList.add('is-visible');
    }
    btn.disabled = false;
    btn.textContent = 'Update password';
  });

  // Logout
  document.getElementById('acct-logout').addEventListener('click', async () => {
    await auth.logout();
    toast('Signed out', 'info');
    setTimeout(() => (window.location.href = '/'), 500);
  });
};

document.addEventListener('DOMContentLoaded', init);