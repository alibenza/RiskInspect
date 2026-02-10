// export.js
// Exports JSON/CSV offline-safe

const exportManager = {
  async exportVisite(visiteId) {
    const visite = await db.get('visites', visiteId);
    if (!visite) return utils.showToast('Visite introuvable', 'error');

    const site    = await db.get('sites', visite.siteId);
    const zones   = await 

db.getZonesByVisite(visiteId);
    const constats= await db.getConstatsByVisite(visiteId);

    // Export JSON complet
    const payload = { visite, site, zones, constats };
    utils.download(`visite_${visiteId}.json`, JSON.stringify(payload, null, 2), 'application/json');

    // Export CSV constats
    const headers = [
      'zone','famille','point','statut','prob','grav','scoreMatrice',
      'maitrise','impact','scoreAssureur','criticite','priorite',
      'action','responsable','echeance','statutActio

n'
    ];
    const rows = constats.map(c => [
      (zones.find(z=>z.id===c.zoneId)?.nom)||'',
      c.famille||'', c.pointControle||'', c.statut||'',
      c.probabilite||'', c.gravite||'', c.scoreMatrice||'',
      c.maitrise||'', c.impact||'', c.scoreAssureur||'',
      c.criticite||'', c.priorite||'',
      c.action||'', c.responsable||'', c.echeance||'', c.statutAction||''
    ]);
    const csv = [headers].concat(rows).map(r=>r.map(v=>String(v).replace(/"/g,'""')).map(v=>`"${v}"`).join(';')).join('\n');
    utils.download(`visite_${visiteId}_constats.csv`, csv, 'text/csv');

    utils.showToast('Exports JSON + CSV générés', 'success');
  },

  async exportActions() {
    const constats = await db.getAllConstats();
    const nc = constats.filter(c => c.statut === 'NC');
    const headers = ['visiteId','zoneId','famille','point','criticite','priorite','action','responsable','echeance','statutAction'];
    const rows = nc.map(c => [c.visiteId,c.zoneId||'',c.famille||'',c.pointControle||'',c.criticite||'',c.priorite||'',c.action||'',c.responsable||'',c.echeance||'',c.statutAction||'']);
    const csv = [headers].concat(rows).map(r=>r.map(v=>String(v).replace(/"/g,'""')).map(v=>`"$

{v}"`).join(';')).join('\n');
    utils.download('plan_actions.csv', csv, 'text/csv');
    utils.showToast('Plan d’actions exporté', 'success');
  }
};
 
