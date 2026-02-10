// ui.js
// Gestion des vues, listes, formulaires et interactions

class UIManager {
  constructor() {
    this.currentView = 'home';
    this.currentVisite = null;
  }

  init() {
    this.setupNavigation();
    this.setupEventListeners();
    this.updateStats();
    if (auth.isAuthenticated()) {
      this.showAppScreen();
      this.showView('home');
    }
  }

  /* NAVIGATION */
  setupNavigation() {
    document.getElementById('menuBtn').addEventListener('click', () => {
      document.getElementById('sideMenu').classList.add('active');
    });
    document.getElementById('closeMenuBtn').addEventListener('click', () => {
      document.getElementById('sideMenu').classList.remove('active');
    });

    document.querySelectorAll('.menu-list a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = e.currentTarget.dataset.view;
        this.showView(view);
        document.getElementById('sideMenu').classList.remove('active');
      });
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
      if (await utils.confirm('Voulez-vous vraiment vous déconnecter ?')) {
        auth.logout();
        this.showAuthScreen();
      }
    });
  }

  setupEventListeners() {
    document.getElementById('newVisitBtn').addEventListener('click', () => this.showNewVisitForm());
    document.getElementById('addVisitBtn')?.addEventListener('click', () => this.showNewVisitForm());
    document.getElementById('addSiteBtn').addEventListener('click', () => this.showNewSiteForm());

    document.getElementById('syncBtn').addEventListener('click', () => this.syncData());
    document.getElementById('backToVisitesBtn').addEventListener('click', () => this.showView('visites'));

    document.getElementById('exportVisitBtn').addEventListener('click', () => this.exportCurrentVisite());
    document.getElementById('exportActionsBtn').addEventListener('click', () => this.exportAllActions());

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.showTab(tab);
      });
    });

    document.getElementById('filterPriorite')?.addEventListener('change', () => this.filterActions());
    document.getElementById('filterStatut')?.addEventListener('change', () => this.filterActions());
  }

  /* VUES */
  showView(viewName) {
    document.querySelectorAll('.menu-list a').forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewName);
    });
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${viewName}View`).classList.add('active');

    const titles = { home:'Accueil', sites:'Sites', visites:'Visites', dashboard:'Dashboard', actions:'Plan d\'Actions' };
    document.getElementById('screenTitle').textContent = titles[viewName] || 'App';
    this.currentView = viewName;

    switch (viewName) {
      case 'home': this.updateStats(); this.loadRecentVisites(); break;
      case 'sites': this.loadSites(); break;
      case 'visites': this.loadVisites(); break;
      case 'dashboard': this.loadDashboard(); break;
      case 'actions': this.loadAllActions(); break;
    }
  }

  async updateStats() {
    const sites    = await db.getAll('sites');
    const visites  = await db.getAll('visites');
    const constats = await db.getAll('constats');
    const nc = constats.filter(c => c.statut === 'NC');

    document.getElementById('statSites').textContent    = sites.length;
    document.getElementById('statVisites').textContent  = visites.length;
    document.getElementById('statConstats').textContent = constats.length;
    document.getElementById('statNC').textContent       = nc.length;
  }

  async loadRecentVisites() {
    const visites = await db.getAll('visites');
    const recent  = visites.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
    const sites   = await db.getAll('sites');
    const c = document.getElementById('recentVisitsList');

    if (!recent.length) { c.innerHTML = '<div class="list-item"><div class="muted">Aucune visite récente</div></div>'; return; }

    c.innerHTML = recent.map(v=>{
      const site = sites.find(s=>s.id===v.siteId);
      return `
        <div class="list-item" data-id="${v.id}">
          <div class="list-item-header">
            <div class="list-item-title">${site?site.nom:'Site inconnu'}</div>
            <span class="badge badge-info">${utils.formatDate(v.date)}</span>
          </div>
          <div class="list-item-meta">
            <span>Auditeur: ${v.auditeur}</span>
            <span>Objectif: ${v.objectif||'—'}</span>
          </div>
        </div>`;
    }).join('');

    c.querySelectorAll('.list-item').forEach(item=>{
      item.addEventListener('click', ()=>{
        this.showVisiteDetail(Number(item.dataset.id));
      });
    });
  }

  async loadSites() {
    const sites = await db.getAll('sites');
    const c = document.getElementById('sitesList');
    if (!sites.length) { c.innerHTML = '<div class="list-item"><div class="muted">Aucun site enregistré</div></div>'; return; }
    c.innerHTML = sites.map(s=>`
      <div class="list-item">
        <div class="list-item-header">
          <div class="list-item-title">${s.nom}</div>
          <span class="badge badge-info">${s.type||''}</span>
        </div>
        <div class="list-item-meta">
          <span>${s.adresse||''}</span>
        </div>
      </div>
    `).join('');
  }

  async loadVisites() {
    const visites = await db.getAll('visites');
    const sites   = await db.getAll('sites');
    const c = document.getElementById('visitesList');

    if (!visites.length) { c.innerHTML = '<div class="list-item"><div class="muted">Aucune visite enregistrée</div></div>'; return; }

    const sorted = visites.sort((a,b)=>new Date(b.date)-new Date(a.date));
    c.innerHTML = sorted.map(v=>{
      const site = sites.find(s=>s.id===v.siteId);
      return `
        <div class="list-item" data-id="${v.id}">
          <div class="list-item-header">
            <div class="list-item-title">${site?site.nom:'Site inconnu'}</div>
            <span class="badge badge-info">${utils.formatDate(v.date)}</span>
          </div>
          <div class="list-item-meta">
            <span>Auditeur: ${v.auditeur}</span>
            <span>Objectif: ${v.objectif||'—'}</span>
          </div>
        </div>`;
    }).join('');

    c.querySelectorAll('.list-item').forEach(item=>{
      item.addEventListener('click', ()=>this.showVisiteDetail(Number(item.dataset.id)));
    });
  }

  async showVisiteDetail(visiteId) {
    this.currentVisite = await db.get('visites', visiteId);
    const site = this.currentVisite ? await db.get('sites', this.currentVisite.siteId) : null;

    document.getElementById('visiteDetailTitle').textContent = site ? site.nom : 'Visite';
    document.getElementById('visiteDetailView').classList.add('active');
    document.getElementById('visitesView').classList.remove('active');

    this.loadVisiteInfo();
    this.loadZones();
    this.loadConstats();
    this.loadVisiteActions();

    document.getElementById('addZoneBtn').onclick    = () => this.showNewZoneForm();
    document.getElementById('addConstatBtn').onclick = () => this.showNewConstatForm();
  }

  showTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab===tab));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById(`tab${tab.charAt(0).toUpperCase()+tab.slice(1)}`).classList.add('active');
  }

  async loadVisiteInfo() {
    if (!this.currentVisite) return;
    const site = await db.get('sites', this.currentVisite.siteId);
    const c = document.getElementById('visiteInfo');
    c.innerHTML = `
      <div class="info-row"><div class="info-label">Site</div><div class="info-value">${site?.nom || 'Inconnu'}</div></div>
      <div class="info-row"><div class="info-label">Date</div><div class="info-value">${utils.formatDate(this.currentVisite.date)}</div></div>
      <div class="info-row"><div class="info-label">Auditeur</div><div class="info-value">${this.currentVisite.auditeur}</div></div>
      <div class="info-row"><div class="info-label">Accompagnateurs</div><div class="info-value">${this.currentVisite.accompagnateurs || '—'}</div></div>
      <div class="info-row"><div class="info-label">Objectif</div><div class="info-value">${this.currentVisite.objectif || '—'}</div></div>
      <div class="info-row"><div class="info-label">Périmètre</div><div class="info-value">${this.currentVisite.perimetre || '—'}</div></div>
    `;
  }

  /* FORMULAIRES */
  async showNewSiteForm() {
    utils.openFormModal({
      title: 'Nouveau Site',
      bodyHTML: `
        <div class="grid-2">
          <div><label>Nom *</label><input id="sNom" /></div>
          <div><label>Type *</label>
            <select id="sType">
              <option>Industrie</option><option>Commerce</option>
              <option>Hôpital</option><option>Hôtel</option><option>Administration</option>
            </select>
          </div>
          <div><label>Adresse</label><input id="sAdr" /></div>
          <div><label>Voisinage</label><input id="sVoi" /></div>
          <div><label>Année mise en service</label><input id="sAn" type="number" min="1900" max="2100" /></div>
        </div>
      `,
      onSave: async () => {
        const site = {
          id: utils.uid(),
          nom: document.getElementById('sNom').value.trim(),
          type: document.getElementById('sType').value,
          adresse: document.getElementById('sAdr').value.trim(),
          voisinage: document.getElementById('sVoi').value.trim(),
          anneeMiseService: document.getElementById('sAn').value
        };
        if (!site.nom) { utils.showToast('Nom obligatoire', 'error'); return false; }
        await db.add('sites', site);
        utils.showToast('Site créé', 'success');
        this.showView('sites');
      }
    });
  }

  async showNewVisitForm() {
    const sites = await db.getAll('sites');
    if (!sites.length) { utils.showToast('Créez d’abord un site', 'warn'); return; }

    utils.openFormModal({
      title: 'Nouvelle Visite',
      bodyHTML: `
        <div class="grid-2">
          <div><label>Site *</label><select id="vSite">${sites.map(s=>`<option value="${s.id}">${s.nom}</option>`).join('')}</select></div>
          <div><label>Date *</label><input id="vDate" type="date" value="${new Date().toISOString().slice(0,10)}" /></div>
          <div><label>Auditeur *</label><input id="vAud" value="${auth.getUser()?.email || ''}" /></div>
          <div><label>Accompagnateurs</label><input id="vAcc" /></div>
          <div><label>Objectif</label><input id="vObj" /></div>
          <div><label>Périmètre</label><input id="vPer" /></div>
        </div>
      `,
      onSave: async () => {
        const visite = {
          id: utils.uid(),
          siteId: Number(document.getElementById('vSite').value),
          date: document.getElementById('vDate').value,
          auditeur: document.getElementById('vAud').value.trim(),
          accompagnateurs: document.getElementById('vAcc').value.trim(),
          objectif: document.getElementById('vObj').value.trim(),
          perimetre: document.getElementById('vPer').value.trim()
        };
        if (!visite.siteId || !visite.date || !visite.auditeur) { utils.showToast('Champs * obligatoires', 'error'); return false; }
        await db.add('visites', visite);
        utils.showToast('Visite créée', 'success');
        this.showView('visites');
      }
    });
  }

  async showNewZoneForm() {
    if (!this.currentVisite) return utils.showToast('Aucune visite sélectionnée', 'warn');
    utils.openFormModal({
      title: 'Nouvelle Zone',
      bodyHTML: `
        <div class="grid-2">
          <div><label>Nom *</label><input id="zNom" /></div>
          <div><label>Usage</label><input id="zUsage" /></div>
          <div><label>Surface (m²)</label><input id="zSurf" type="number" min="0" /></div>
          <div><label>Bâtiment</label><input id="zBat" /></div>
        </div>
      `,
      onSave: async () => {
        const zone = {
          id: utils.uid(),
          visiteId: this.currentVisite.id,
          nom: document.getElementById('zNom').value.trim(),
          usage: document.getElementById('zUsage').value.trim(),
          surface: Number(document.getElementById('zSurf').value || 0),
          batiment: document.getElementById('zBat').value.trim()
        };
        if (!zone.nom) { utils.showToast('Nom obligatoire', 'error'); return false; }
        await db.add('zones', zone);
        utils.showToast('Zone ajoutée', 'success');
        this.loadZones();
      }
    });
  }

  async showNewConstatForm() {
    if (!this.currentVisite) return utils.showToast('Aucune visite sélectionnée', 'warn');

    const familles = [
      'Protection Incendie','Électricité','Procédés','Stockage','ATEX',
      'Maintenance','HSE','Sûreté','Infrastructures','Circulation','Bâtiment'
    ];

    utils.openFormModal({
      title: 'Nouveau Constat',
      bodyHTML: `
        <div class="grid-2">
          <div><label>Famille *</label><select id="cFam">${familles.map(f=>`<option>${f}</option>`).join('')}</select></div>
          <div><label>Point de contrôle *</label><input id="cPoint" /></div>
          <div><label>Statut *</label><select id="cStat"><option>C</option><option>NC</option><option>SO</option></select></div>
          <div><label>Probabilité (1-5)</label><input id="cProb" type="number" min="1" max="5" value="2" /></div>
          <div><label>Gravité (1-5)</label><input id="cGrav" type="number" min="1" max="5" value="3" /></div>
          <div><label>Maîtrise (0-3)</label><input id="cMait" type="number" min="0" max="3" value="2" /></div>
          <div><label>Impact (1-4)</label><input id="cImp" type="number" min="1" max="4" value="2" /></div>
          <div><label>Preuve</label><select id="cPrev"><option>Observation</option><option>Document</option><option>Entretien</option></select></div>
          <div class="full"><label>Commentaire</label><textarea id="cCom" rows="2"></textarea></div>
          <div><label>Action</label><input id="cAct" /></div>
          <div><label>Responsable</label><input id="cResp" /></div>
          <div><label>Échéance</label><input id="cEch" type="date" /></div>
          <div><label>Statut action</label><select id="cStAct"><option>Ouvert</option><option>En cours</option><option>Clos</option></select></div>
        </div>
      `,
      onSave: async () => {
        const prob = Number(document.getElementById('cProb').value || 1);
        const grav = Number(document.getElementById('cGrav').value || 1);
        const { score, criticite } = scoring.calcMatrice(prob, grav);
        const maitrise = Number(document.getElementById('cMait').value || 0);
        const impact   = Number(document.getElementById('cImp').value || 1);
        const scoreAss = scoring.calcAssureur(maitrise, impact);

        const constat = {
          id: utils.uid(),
          visiteId: this.currentVisite.id,
          zoneId: null, // possibilité d’associer à une zone plus tard
          famille: document.getElementById('cFam').value,
          pointControle: document.getElementById('cPoint').value.trim(),
          statut: document.getElementById('cStat').value,
          probabilite: prob, gravite: grav, scoreMatrice: score,
          maitrise, impact, scoreAssureur: scoreAss,
          criticite, priorite: this._prioriteFromCriticite(criticite),
          preuve: document.getElementById('cPrev').value,
          commentaire: document.getElementById('cCom').value.trim(),
          action: document.getElementById('cAct').value.trim(),
          responsable: document.getElementById('cResp').value.trim(),
          echeance: document.getElementById('cEch').value,
          statutAction: document.getElementById('cStAct').value
        };

        if (!constat.famille || !constat.pointControle) { utils.showToast('Champs * obligatoires', 'error'); return false; }
        await db.add('constats', constat);
        utils.showToast('Constat ajouté', 'success');
        this.loadConstats();
        this.loadVisiteActions();
      }
    });
  }

  _prioriteFromCriticite(criticite) {
    switch (criticite) {
      case 'Catastrophique':
      case 'Critique': return 'P1 - Critique';
      case 'Élevé':    return 'P2 - Moyenne';
      default:         return 'P3 - Faible';
    }
  }

  /* LISTES & TABS */
  async loadZones() {
    const zones = await db.getZonesByVisite(this.currentVisite.id);
    const c = document.getElementById('zonesList');
    if (!zones.length) { c.innerHTML = '<div class="list-item"><div class="muted">Aucune zone définie</div></div>'; return; }

    c.innerHTML = zones.map(z => `
      <div class="list-item">
        <div class="list-item-title">${z.nom}</div>
        <div class="list-item-meta">
          <span>${z.usage||''}</span>
          ${z.surface?`<span>${z.surface} m²</span>`:''}
        </div>
      </div>
    `).join('');
  }

  async loadConstats() {
    const constats = await db.getConstatsByVisite(this.currentVisite.id);
    const c = document.getElementById('constatsList');
    if (!constats.length) { c.innerHTML = '<div class="list-item"><div class="muted">Aucun constat enregistré</div></div>'; return; }

    c.innerHTML = constats.map(x => `
      <div class="list-item">
        <div class="list-item-header">
          <div class="list-item-title">${x.pointControle}</div>
          <span class="badge badge-${scoring.getCriticiteColor(x.criticite)}">${x.criticite||'N/A'}</span>
        </div>
        <div class="list-item-meta">
          <span>Famille: ${x.famille}</span>
          <span>Statut: ${x.statut}</span>
          <span>Score: ${x.scoreMatrice||'-'}</span>
        </div>
      </div>
    `).join('');
  }

  async loadVisiteActions() {
    const constats = await db.getConstatsByVisite(this.currentVisite.id);
    const nc = constats.filter(c => c.statut === 'NC');
    const c = document.getElementById('actionsList');
    if (!nc.length) { c.innerHTML = '<div class="list-item"><div class="muted">Aucune action à traiter</div></div>'; return; }

    c.innerHTML = nc.map(x => `
      <div class="list-item">
        <div class="list-item-header">
          <div class="list-item-title">${x.pointControle}</div>
          <span class="badge badge-${scoring.getCriticiteColor(x.criticite)}">${x.priorite||'N/A'}</span>
        </div>
        <div class="list-item-meta">
          <span>Action: ${x.action||'À définir'}</span>
          <span>Statut: ${x.statutAction||'Ouvert'}</span>
          <span>Échéance: ${x.echeance? utils.formatDate(x.echeance): '—'}</span>
        </div>
      </div>
    `).join('');
  }

  async loadAllActions() {
    const constats = await db.getAllConstats();
    const nc = constats.filter(c => c.statut === 'NC');
    this.renderActionsList(nc);
  }

  renderActionsList(constats) {
    const c = document.getElementById('allActionsList');
    if (!constats.length) { c.innerHTML = '<div class="list-item"><div class="muted">Aucune action à traiter</div></div>'; return; }
    const sorted = constats.sort((a,b) => (b.scoreMatrice||0)-(a.scoreMatrice||0));
    c.innerHTML = sorted.map(x => `
      <div class="list-item">
        <div class="list-item-header">
          <div class="list-item-title">${x.pointControle}</div>
          <span class="badge badge-${scoring.getCriticiteColor(x.criticite)}">${x.priorite||'N/A'}</span>
        </div>
        <div class="list-item-meta">
          <span>Famille: ${x.famille}</span>
          <span>Score: ${x.scoreMatrice||'-'}</span>
          <span>Statut: ${x.statutAction||'Ouvert'}</span>
        </div>
      </div>
    `).join('');
  }

  async filterActions() {
    const priorite = document.getElementById('filterPriorite').value;
    const statut   = document.getElementById('filterStatut').value;
    let constats = await db.getNCConstats();
    if (priorite) constats = constats.filter(c => c.criticite === priorite);
    if (statut)   constats = constats.filter(c => c.statutAction === statut);
    this.renderActionsList(constats);
  }

  /* DASHBOARD & EXPORTS */
  async loadDashboard() { if (typeof dashboardManager !== 'undefined') await dashboardManager.render(); }
  async exportCurrentVisite() { if (!this.currentVisite) return utils.showToast('Aucune visite en cours', 'warn'); if (typeof exportManager !== 'undefined') await exportManager.exportVisite(this.currentVisite.id); }
  async exportAllActions() { if (typeof exportManager !== 'undefined') await exportManager.exportActions(); }

  /* ECRANS */
  showAuthScreen() { document.getElementById('authScreen').classList.add('active'); document.getElementById('appScreen').classList.remove('active'); }
  showAppScreen()  { document.getElementById('authScreen').classList.remove('active'); document.getElementById('appScreen').classList.add('active'); }
}

// instance globale
const ui = new UIManager();
