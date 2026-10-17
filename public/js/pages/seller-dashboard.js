import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { toast } from '../components/toast.js';
import { api, formatNaira } from '../api.js';
import { auth } from '../auth.js';

let dashboardData = null;

const loadDashboard = async () => {
  const loading = document.getElementById('dashboard-loading');
  const pending = document.getElementById('dashboard-pending');
  const content = document.getElementById('dashboard-content');

  try {
    dashboardData = await api.get('/sellers/dashboard');
    
    loading.style.display = 'none';
    content.style.display = 'block';

    // Populate Stats
    document.getElementById('seller-store-name').textContent = dashboardData.seller.storeName;
    document.getElementById('stat-products').textContent = dashboardData.stats.totalProducts;
    document.getElementById('stat-orders').textContent = dashboardData.stats.totalOrders;
    document.getElementById('stat-revenue').textContent = formatNaira(dashboardData.stats.totalSales || 0);
    document.getElementById('stat-payout').textContent = formatNaira(dashboardData.stats.pendingPayout || 0);

    // Load specific tabs
    loadProducts();
    loadOrders();

  } catch (err) {
    loading.style.display = 'none';
    if (err.message.includes('pending approval')) {
      pending.style.display = 'block';
    } else {
      toast(err.message, 'error');
    }
  }
};

const loadProducts = async () => {
  try {
    const data = await api.get('/sellers/my-products');
    const tbody = document.getElementById('products-body');
    
    if (!data.products.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="padding: var(--space-4); text-align: center; color: var(--text-muted);">No products yet.</td></tr>';
      return;
    }

    tbody.innerHTML = data.products.map(p => `
      <tr style="border-bottom: 1px solid var(--border-color); font-size: var(--text-sm);">
        <td style="padding: var(--space-3); display: flex; align-items: center; gap: var(--space-3);">
          <img src="${p.thumbnail || p.images?.[0] || '/images/placeholders/product.svg'}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;" />
          <span style="font-weight: 500;">${p.name}</span>
        </td>
        <td style="padding: var(--space-3);">${formatNaira(p.price)}</td>
        <td style="padding: var(--space-3);">${p.stock}</td>
        <td style="padding: var(--space-3);">
          <span class="badge ${p.status === 'active' ? 'badge-success' : p.status === 'pending' ? 'badge-warning' : 'badge-outline'}">
            ${p.status}
          </span>
        </td>
        <td style="padding: var(--space-3);">
          <a href="/pages/product.html?slug=${p.slug}" target="_blank" class="btn btn-ghost btn-sm">View</a>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.warn(err);
  }
};

const loadOrders = async () => {
  try {
    const data = await api.get('/sellers/orders');
    const list = document.getElementById('orders-list');

    if (!data.orders.length) {
      list.innerHTML = '<p class="text-muted text-sm">No orders yet.</p>';
      return;
    }

    list.innerHTML = data.orders.map(order => `
      <div class="card" style="padding: var(--space-4); margin-bottom: var(--space-3);">
        <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-3); flex-wrap: wrap; gap: var(--space-2);">
          <strong>${order.orderNumber}</strong>
          <span class="badge badge-info">${order.status.toUpperCase()}</span>
        </div>
        <div style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-3);">
          Customer: ${order.shippingAddress.fullName} • ${order.shippingAddress.phone}
        </div>
        
        <table style="width: 100%; font-size: var(--text-sm); margin-bottom: var(--space-3);">
          ${order.items.map(item => `
            <tr style="border-top: 1px solid var(--border-color);">
              <td style="padding: 8px 0;">${item.quantity}x ${item.name}</td>
              <td style="padding: 8px 0; text-align: right;">${formatNaira(item.subtotal)}</td>
            </tr>
          `).join('')}
        </table>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: var(--space-3);">
          <div style="font-weight: 600;">Your Total: ${formatNaira(order.sellerSubtotal)}</div>
          ${order.status === 'processing' ? `
            <button class="btn btn-primary btn-sm" onclick="fulfillOrder('${order.orderNumber}')">Mark as Shipped</button>
          ` : `
            <span class="text-muted text-xs">Status: ${order.items[0].status}</span>
          `}
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.warn(err);
  }
};

window.fulfillOrder = async (orderNumber) => {
  if (!confirm('Mark this order as shipped?')) return;
  try {
    await api.put(`/sellers/orders/${orderNumber}/fulfill`, { trackingNumber: 'TEST-TRK-001' });
    toast('Order marked as shipped', 'success');
    loadOrders();
  } catch (err) {
    toast(err.message, 'error');
  }
};

const initTabs = () => {
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('is-active'));
      document.querySelectorAll('.account-tab').forEach(t => t.hidden = true);
      btn.classList.add('is-active');
      document.getElementById(`tab-${btn.dataset.tab}`)?.removeAttribute('hidden');
    });
  });
};

const initModal = async () => {
  const modal = document.getElementById('product-modal');
  const addBtn = document.getElementById('add-product-btn');
  
  addBtn.addEventListener('click', () => {
    if (!dashboardData) {
      toast('You must be an approved seller', 'warning');
      return;
    }
    modal.style.display = 'flex';
  });

  document.getElementById('close-modal').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Load categories into dropdown
  try {
    const data = await api.get('/categories?level=1'); // Get level 1 (subcategories) for precision
    const select = document.getElementById('np-category');
    select.innerHTML = data.categories.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
  } catch (err) {
    console.warn('Failed to load categories');
  }

  document.getElementById('add-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    try {
      await api.post('/sellers/products', {
        name: document.getElementById('np-name').value,
        category: document.getElementById('np-category').value,
        price: Number(document.getElementById('np-price').value),
        stock: Number(document.getElementById('np-stock').value),
        description: document.getElementById('np-desc').value,
      });
      toast('Product submitted for approval', 'success');
      modal.style.display = 'none';
      e.target.reset();
      loadProducts();
    } catch (err) {
      toast(err.message, 'error');
    }
    btn.disabled = false;
    btn.textContent = 'Submit for Approval';
  });
};

const init = async () => {
  mountHeader();
  mountFooter();

  if (!auth.isLoggedIn()) {
    window.location.href = '/pages/login.html?redirect=/pages/seller-dashboard.html';
    return;
  }

  initTabs();
  await loadDashboard();
  await initModal();
};

document.addEventListener('DOMContentLoaded', init);