// scoring.js
// Matrice 5×5 + Score assureur + mapping couleurs

const scoring = {
  matrixLevels: {
    1: { level: 'Faible',         color: 'success',  range: [1,  5]  },
    2: { level: 'Modéré',         color: 'info',     range: [6,  10] },
    3: { level: 'Élevé',          color: 'warning',  range: [11, 15] },
    4: { level: 'Critique',       color: 'danger',   range: [16, 20] },
    5: { level: 'Catastrophique', color: 'critical', range: [21, 25] }
  },

  calcMatrice(prob, grav) {
    const p = Math.min(5, Math.max(1, Number(prob) || 1));
    const g = Math.min(5, Math.max(1, Number(grav) || 1));
    const score = p * g; // 1..25
    const level = Object.values(this.matrixLevels).find(l => score >= l.range[0] && score <= l.range[1]) || this.matrixLevels[1];
    return { score, criticite: level.level, color: level.color };
  },

  calcAssureur(maitrise, impact) {
    const m = Math.min(3, Math.max(0, Number(maitrise) || 0)); // 0..3
    const i = Math.min(4, Math.max(1, Number(impact)   || 1)); // 1..4
    return (4 - m) * i * 2; // 0..32
  },

  getCriticiteColor(level) {
    switch(level){
      case 'Faible':         return 'success';
      case 'Modéré':         return 'info';
      case 'Élevé':          return 'warning';
      case 'Critique':       return 'danger';
      case 'Catastrophique': return 'critical';
      default:               return 'info';
    }
  }
};
