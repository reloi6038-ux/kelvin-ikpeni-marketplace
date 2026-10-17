/**
 * auth.js — client-side auth helpers.
 * Keeps a copy of the logged-in user in localStorage for quick UI updates.
 * The JWT itself lives in an httpOnly cookie (invisible to JS).
 */

import { api } from './api.js';

const USER_KEY = 'user';

export const auth = {
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  },

  isLoggedIn() {
    return !!this.getUser();
  },

  isAdmin() {
    return this.getUser()?.role === 'admin';
  },

  async login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    if (data?.user) this.setUser(data.user);
    return data.user;
  },

  async register(payload) {
    const data = await api.post('/auth/register', payload);
    if (data?.user) this.setUser(data.user);
    return data.user;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    this.setUser(null);
  },

  async refresh() {
    try {
      const user = await api.get('/auth/me');
      this.setUser(user);
      return user;
    } catch {
      this.setUser(null);
      return null;
    }
  },

  /**
   * Redirect to login if not authenticated.
   */
  requireLogin(redirectBack = true) {
    if (this.isLoggedIn()) return true;
    const back = redirectBack ? `?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}` : '';
    window.location.href = `/pages/login.html${back}`;
    return false;
  },
};

export default auth;