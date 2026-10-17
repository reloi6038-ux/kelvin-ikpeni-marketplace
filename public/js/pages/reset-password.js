import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { toast } from '../components/toast.js';
import { api } from '../api.js';
import { auth } from '../auth.js';

const init = () => {
  mountHeader();
  mountFooter();

  const token = new URLSearchParams(window.location.search).get('token');
  if (!token) {
    toast('Invalid reset link', 'error');
    setTimeout(() => (window.location.href = '/pages/forgot-password.html'), 1200);
    return;
  }

  const form = document.getElementById('rp-form');
  const btn = document.getElementById('rp-btn');
  const errBox = document.getElementById('rp-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errBox.classList.remove('is-visible');
    const p1 = document.getElementById('rp-password').value;
    const p2 = document.getElementById('rp-password2').value;

    if (p1 !== p2) {
      errBox.textContent = 'Passwords do not match';
      errBox.classList.add('is-visible');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Resetting…';

    try {
      const data = await api.post(`/auth/reset-password/${token}`, { password: p1 });
      if (data?.user) auth.setUser(data.user);
      toast('Password reset. You are now signed in.', 'success');
      setTimeout(() => (window.location.href = '/'), 800);
    } catch (err) {
      errBox.textContent = err.message;
      errBox.classList.add('is-visible');
      btn.disabled = false;
      btn.textContent = 'Reset password';
    }
  });
};

document.addEventListener('DOMContentLoaded', init);