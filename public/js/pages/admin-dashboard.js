import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { toast } from '../components/toast.js';
import { api, formatNaira } from '../api.js';
import { auth } from '../auth.js';

const loadStats = async () => {
  try {
    const data = await api.get('/admin/dashboard');
    document.getElementById('admin-revenue').textContent = formatNaira(data.stats.totalRevenue);
    document.getElementById('admin-orders').textContent = data.stats.orderCount;
    document.getElementById('admin-users').textContent = data.stats.userCount;
    document.getElementById('admin-sellers').textContent = data.stats.sellerCount;
  } catch (err) {
    toast('Failed to load stats', 'error');
  }
};

const loadPendingSellers = async () => {
  const list = document.getElementById('pending-sellers-list');
  try {
    const data = await api.get('/admin/sellers/pending');
    if (!data.sellers.length) {
      list.innerHTML = '<p class="text-muted text-sm">No pending applications.</p>';
      return;
    }
    list.innerHTML = data.sellers.map(s => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3) 0; border-bottom: 1px solid var(--border-color);">
        <div>
          <div style="font-weight: 600;">${s.storeName}</div>
          <div class="text-xs text-muted">${s.user?.name} (${s.user?.email})</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="approveSeller('${s._id}')">Approve</button>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p class="text-danger text-sm">${err.message}</p>`;
  }
};

const loadPendingProducts = async () => {
  const list = document.getElementById('pending-products-list');
  try {
    const data = await api.get('/admin/products/pending');
    if (!data.products.length) {
      list.innerHTML = '<p class="text-muted text-sm">No pending products.</p>';
      return;
    }
    list.innerHTML = data.products.map(p => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3) 0; border-bottom: 1px solid var(--border-color);">
        <div>
          <div style="font-weight: 600;">${p.name}</div>
          <div class="text-xs text-muted">By: ${p.seller?.storeName} • ${formatNaira(p.price)}</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="approveProduct('${p._id}')">Approve</button>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p class="text-danger text-sm">${err.message}</p>`;
  }
};

window.approveSeller = async (id) => {
  try {
    await api.put(`/admin/sellers/${id}/approve`);
    toast('Seller approved', 'success');
    loadPendingSellers();
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.approveProduct = async (id) => {
  try {
    await api.put(`/admin/products/${id}/approve`);
    toast('Product approved and live', 'success');
    loadPendingProducts();
  } catch (err) {
    toast(err.message, 'error');
  }
};

const init = async () => {
  mountHeader();
  mountFooter();

  const user = auth.getUser();
  if (!user || user.role !== 'admin') {
    toast('Admin access required', 'error');
    setTimeout(() => window.location.href = '/', 1500);
    return;
  }

  document.getElementById('admin-loading').style.display = 'none';
  document.getElementById('admin-content').style.display = 'block';

  await Promise.all([
    loadStats(),
    loadPendingSellers(),
    loadPendingProducts(),
  ]);
};

document.addEventListener('DOMContentLoaded', init);