import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { api } from '../api.js';

const init = async () => {
  mountHeader();
  mountFooter();

  const token = new URLSearchParams(window.location.search).get('token');
  const title = document.getElementById('ve-title');
  const message = document.getElementById('ve-message');
  const loader = document.getElementById('ve-loader');
  const actions = document.getElementById('ve-actions');

  if (!token) {
    title.textContent = 'Invalid link';
    message.textContent = 'No verification token provided.';
    loader.hidden = true;
    actions.hidden = false;
    return;
  }

  try {
    await api.get(`/auth/verify-email/${token}`);
    title.textContent = '✅ Email verified!';
    message.textContent = 'Your account is now fully activated.';
    loader.hidden = true;
    actions.hidden = false;
  } catch (err) {
    title.textContent = '❌ Verification failed';
    message.textContent = err.message;
    loader.hidden = true;
    actions.hidden = false;
  }
};

document.addEventListener('DOMContentLoaded', init);