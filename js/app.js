// app.js
// Bootstrap : ouvre la DB, branche l'auth, lance l'UI

window.addEventListener('load', async () => {
  await db.open();

  // Auth
  const loginBtn = document.getElementById('loginBtn');
  loginBtn.onclick = () => {
    const email = document.getElementById('authEmail').value.trim();
    const pass  = document.getElementById('authPassword').value;
    if (!email) return utils.showToast('Email requis', 'error');
    auth.login(email, pass);
    ui.showAppScreen();
    ui.showView('home');
  };

  if (auth.isAuthenticated()) {
    ui.showAppScreen();
    ui.showView('home');
  }

  // UI
  ui.init();
});
