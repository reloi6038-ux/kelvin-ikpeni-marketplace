import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { toast } from '../components/toast.js';
import { api } from '../api.js';

const init = () => {
  mountHeader();
  mountFooter();

  const form = document.getElementById('fp-form');
  const btn = document.getElementById('fp-btn');
  const errBox = document.getElementById('fp-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errBox.classList.remove('is-visible');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const email = document.getElementById('fp-email').value.trim();
      await api.post('/auth/forgot-password', { email });
      toast('Check your inbox for a reset link.', 'success', 'Email sent');
      form.reset();
    } catch (err) {
      errBox.textContent = err.message;
      errBox.classList.add('is-visible');
    }
    btn.disabled = false;
    btn.textContent = 'Send reset link';
  });
};

document.addEventListener('DOMContentLoaded', init);