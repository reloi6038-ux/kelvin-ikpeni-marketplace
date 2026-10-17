import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { toast } from '../components/toast.js';
import { auth } from '../auth.js';

const init = () => {
  mountHeader();
  mountFooter();

  // Already logged in? Redirect.
  if (auth.isLoggedIn()) {
    const redirect = new URLSearchParams(window.location.search).get('redirect') || '/';
    window.location.href = redirect;
    return;
  }

  const form = document.getElementById('login-form');
  const btn = document.getElementById('login-btn');
  const errBox = document.getElementById('login-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errBox.classList.remove('is-visible');
    btn.disabled = true;
    btn.textContent = 'Signing in…';

    try {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      await auth.login(email, password);
      toast('Welcome back!', 'success', 'Signed in');

      const redirect = new URLSearchParams(window.location.search).get('redirect') || '/';
      setTimeout(() => (window.location.href = redirect), 600);
    } catch (err) {
      errBox.textContent = err.message;
      errBox.classList.add('is-visible');
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
  });
};

document.addEventListener('DOMContentLoaded', init);