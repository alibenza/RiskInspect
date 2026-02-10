// auth.js
// Auth locale (démo)

const auth = {
  login(email, password) {
    // Mode démo : on accepte tout
    localStorage.setItem('vr_user', JSON.stringify({ email, ts: Date.now() }));

    return true;
  },
  logout() {
    localStorage.removeItem('vr_user');
  },
  isAuthenticated() {
    return !!localStorage.getItem('vr_user');
  },
  getUser() {
    try { return JSON.parse(localStorage.getItem('vr_user') || '{}'); }
    catch { return {}; }
  }
};
 
