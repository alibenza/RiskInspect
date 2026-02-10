// db.js
// IndexedDB : stores + CRUD + requêtes + seed démo

const db = (() => {
  const DB_NAME = 'VR_DB';
  const DB_VERSION = 1;
  let _db;

  function open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const d = e.target.result;

        if (!d.objectStoreNames.contains('sites')) {
          d.createObjectStore('sites', { keyPath: 'id' });
        }

        if (!d.objectStoreNames.contains('visites')) {

          const os = d.createObjectStore('visites', { keyPath: 'id' });
          os.createIndex('bySite', 'siteId', { unique: false });
          os.createIndex('byDate', 'date',   { unique: false });
        }

        if (!d.objectStoreNames.contains('zones')) {
          const os = d.createObjectStore('zones', { keyPath: 'id' });
          os.createIndex('byVisite', 'visiteId', { unique: false });
        }

        if (!d.objectStoreNames.contains('constats')) {
          const os = 

d.createObjectStore('constats', { keyPath: 'id' });
          os.createIndex('byVisite', 'visiteId',  { unique: false });
          os.createIndex('byFamille', 'famille',  { unique: false });
          os.createIndex('byStatut', 'statut',    { unique: false });
        }
      };

      req.onsuccess = async (e) => {
        _db = e.target.result;
        await seedIfEmpty();
        resolve(_db);
      };

      req.onerror = () => reject(req.error);
    });
  }

  function tx(store, mode='readonly') {
    return _db.transaction(store, mode).objectStore(store);
  }

  async function seedIfEmpty() {
    const sites = await getAll('sites');
    if (sites.length) return;

    // Données démo minimes
    const siteId   = Date.now();
    const visiteId = Date.now() + 1;
    const zoneId   = Date.now() + 2;
    const now      = new Date().toISOString().slice(0,10);

    const site = { id: siteId, nom: 'Usine Démo', type: 'Industrie', adresse: 'ZI Ouest', voisinage:'Indus', anneeMiseService:'2019' };
    const visite = { id: visiteId, siteId, date: 

now, auditeur: 'Ali BENZENOUNE', accompagnateurs:'Resp. HSE', objectif:'Audit démo', perimetre:'Ateliers A-B' };
    const zone = { id: zoneId, visiteId, nom:'Atelier A', usage:'Production', surface:1200, batiment:'A' };

    const { score, criticite } = scoring.calcMatrice(3,4);
    const scoreAssureur = scoring.calcAssureur(2,3);

    const constat = {
      id: Date.now() + 3, visiteId, zoneId,
      famille:'Protection Incendie', pointControle:'Extincteurs', statut:'NC',
      probabilite:3, gravite:4, scoreMatrice:score, maitrise:2, impact:3, scoreAssureur,
      criticite, priorite:'P2 - Moyenne',

      preuve:'Observation', commentaire:'Signalisation partielle',
      action:'Réimplanter & baliser', responsable:'Resp. HSE', echeance: now, statutAction:'Ouvert'
    };

    await add('sites',   site);
    await add('visites', visite);
    await add('zones',   zone);
    await add('constats',constat);
  }

  // --- CRUD génériques ---
  function add(store, value) {
    return new Promise((resolve, reject) => {
      const r = tx(store, 'readwrite').add(value);
      r.onsuccess = () => resolve(value);
      r.onerror   = () => reject(r.error);
    });

  }

  function put(store, value) {
    return new Promise((resolve, reject) => {
      const r = tx(store, 'readwrite').put(value);
      r.onsuccess = () => resolve(value);
      r.onerror   = () => reject(r.error);
    });
  }

  function get(store, key) {
    return new Promise((resolve, reject) => {
      const r = tx(store).get(key);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror   = () => reject(r.error);
    });
  }

  function getAll(store) {
    return new Promise((resolve, reject) => {

      const r = tx(store).getAll();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror   = () => reject(r.error);
    });
  }

  function del(store, key) {
    return new Promise((resolve, reject) => {
      const r = tx(store, 'readwrite').delete(key);
      r.onsuccess = () => resolve(true);
      r.onerror   = () => reject(r.error);
    });
  }

  // --- Requêtes spécifiques ---
  function getZonesByVisite(visiteId) {
    const res = [];
    return new Promise((resolve, reject) => {
      const index = tx('zones').index('byVisite');

      const req = index.openCursor(IDBKeyRange.only(visiteId));
      req.onsuccess = (e) => {
        const cur = e.target.result;
        if (cur) { res.push(cur.value); cur.continue(); } else resolve(res);
      };
      req.onerror = () => reject(req.error);
    });
  }

  function getConstatsByVisite(visiteId) {
    const res = [];
    return new Promise((resolve, reject) => {
      const index = tx('constats').index('byVisite');
      const req = index.openCursor(IDBKeyRange.only(visiteId));
      req.onsuccess = (e) => {

        const cur = e.target.result;
        if (cur) { res.push(cur.value); cur.continue(); } else resolve(res);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function getAllConstats(){ return getAll('constats'); }
  async function getNCConstats(){
    const all = await getAll('constats');
    return all.filter(c => c.statut === 'NC');
  }

  // API publique
  return { open, add, put, get, getAll, del, getZonesByVisite, getConstatsByVisite, getAllConstats, getNCConstats };
})();
 
