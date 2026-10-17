import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { toast } from '../components/toast.js';
import { auth } from '../auth.js';

const init = () => {
  mountHeader();
  mountFooter();

  if (auth.isLoggedIn()) {
    window.location.href = '/';
    return;
  }

  const form = document.getElementById('register-form');
  const btn = document.getElementById('register-btn');
  const errBox = document.getElementById('register-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errBox.classList.remove('is-visible');

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const password2 = document.getElementById('reg-password2').value;

    if (password !== password2) {
      errBox.textContent = 'Passwords do not match';
      errBox.classList.add('is-visible');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Creating account…';

    try {
      await auth.register({ name, email, phone: phone || undefined, password });
      toast('Account created! Check your email to verify.', 'success', 'Welcome');
      setTimeout(() => (window.location.href = '/'), 800);
    } catch (err) {
      errBox.textContent = err.message;
      errBox.classList.add('is-visible');
      btn.disabled = false;
      btn.textContent = 'Create account';
    }
  });
};

document.addEventListener('DOMContentLoaded', init);