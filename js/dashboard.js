// dashboard.js
// Graphiques (Chart.js si présent, sinon toast d’info)

const dashboardManager = {
  async render() {
    const constats = await db.getAllConstats();

    // Répartition par criticité
    const labelsCrit = ['Faible','Modéré','Élevé','Critique','Catastrophique'];
    const dataCrit   = labelsCrit.map(l => constats.filter(c => c.criticite === l).length);


    // NC par famille
    const familles = [...new Set(constats.map(c => c.famille).filter(Boolean))];
    const dataNC   = familles.map(f => constats.filter(c => c.famille === f && c.statut === 'NC').length);

    if (typeof Chart === 'undefined') {
      utils.showToast('Chart.js non chargé : affichage minimal du dashboard', 'warn');
      return;
    }

    // Doughnut criticité
    const ctx1 = document.getElementById('chartCriticite');
    new Chart(ctx1, {
      type: 'doughnut',
      data: {

        labels: labelsCrit,
        datasets: [{
          data: dataCrit,
          backgroundColor: ['#22c55e','#38bdf8','#f59e0b','#ef4444','#991b1b'],
          borderWidth: 0
        }]
      },
      options: {
        plugins: { legend: { labels: { color:'#e6ebf2' } } }
      }
    });

    // Bar NC par famille
    const ctx2 = document.getElementById('chartNCFamilles');
    new Chart(ctx2, {
      type: 'bar',

      data: {
        labels: familles,
        datasets: [{
          label: 'NC',
          data: dataNC,
          backgroundColor: '#38bdf8',
          borderWidth: 0
        }]
      },
      options: {
        scales: {
          x: { ticks: { color:'#cfd8ea' }, grid: { color:'#1e2745' } },
          y: { ticks: { color:'#cfd8ea' }, grid: { color:'#1e2745' } }
        },
        plugins: { legend: { labels: { color:'#e6ebf2' } } }
      }
    });
  }

};
