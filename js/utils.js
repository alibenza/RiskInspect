// utils.js
// Helpers UI : toast, confirm, loader, 

modales, format, CSV, download

const utils = {
  _toastTimer: null,

  showToast(msg, type = 'info', timeout = 2200) {
    const el = document.getElementById('toast');
    if (!el) return alert(msg); // fallback
    el.textContent = msg;
    // Couleur bordure selon type
    el.style.borderColor =
      type === 'success' ? '#187b4a' :
      type === 'error'   ? '#7b1823' :
      type === 'warn'    ? '#7a5c0d' :
                           '#25407a';
    el.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.add('hidden'), timeout);

  },

  async confirm(message) {
    // Mini boîte de dialogue modale (sans dépendance)
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'modal';
      overlay.innerHTML = `
        <div class="modal-content">
          <div class="modal-header"><h3>Confirmation</h3></div>
          <div class="modal-body"><p>${message}</p></div>
          <div class="modal-actions">
            <button id="cCancel" class="btn btn-light">Annuler</button>
            <button id="cOk" class="btn btn-primary">Confirmer</button>
          </div>

        </div>`;
      document.body.appendChild(overlay);
      const cleanup = () => overlay.remove();
      overlay.querySelector('#cCancel').onclick = () => { cleanup(); resolve(false); };
      overlay.querySelector('#cOk').onclick     = () => { cleanup(); resolve(true);  };
    });
  },

  showLoading() {
    document.getElementById('loader')?.classList.remove('hidden');
  },
  hideLoading() {
    document.getElementById('loader')?.classList.add('hidden');
  },


  formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d) ? iso : d.toLocaleDateString('fr-FR', { year:'numeric', month:'2-digit', day:'2-digit' });
  },

  uid() { return Date.now(); },

  // Ouvre une modale formulaire générique
  openFormModal({ title, bodyHTML, onSave, onCancel }) {
    const overlay = document.getElementById('modalOverlay');
    const titleEl = document.getElementById('modalTitle');
    const bodyEl  = document.getElementById('modalBody');

    if (!overlay || !titleEl || !bodyEl) return;

    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHTML;
    overlay.classList.remove('hidden');

    const close = () => overlay.classList.add('hidden');

    document.getElementById('modalCloseBtn').onclick  = () => { close(); onCancel?.(); };
    document.getElementById('modalCancelBtn').onclick = () => { close(); onCancel?.(); };
    document.getElementById('modalSaveBtn').onclick   = async () => {
      const ok = await onSave?.();
      if (ok !== false) close();
    };

  },

  // CSV util
  toCSV(rows, sep = ';') {
    const esc = (v) => {
      if (v == null) return '';
      const s = String(v).replace(/"/g, '""');
      return /[;\n",]/.test(s) ? `"${s}"` : s;
    };
    return rows.map(r => r.map(esc).join(sep)).join('\n');
  },

  // Téléchargement client
  download(filename, blobOrText, type = 'text/csv;charset=utf-8') {
    const blob = blobOrText instanceof Blob ? blobOrText : new Blob([blobOrText], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 

a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};
