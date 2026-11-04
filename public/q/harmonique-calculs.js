// Descripteurs harmoniques des diapositives « Descripteurs harmoniques » du Cours 7
// (diapo-harmonique.js), mêmes définitions que tools/descripteurs_timbre.mjs (un test le vérifie) :
//   - rapport impaires / paires : énergie des harmoniques 3, 5, 7… sur celle des 2, 4, 6… (dB) ;
//   - déviation : écart moyen (dB) des harmoniques à la droite de régression (dB selon log2 du rang) ;
//   - irrégularité (Krimphoff et al., 1994) : écart moyen (dB) de chaque harmonique à la moyenne
//     de ses voisines (h − 1, h, h + 1) ;
//   - inharmonicité : écart des partiels à h × F0 (%), pondéré par l'énergie.
const somme = (t) => t.reduce((a, b) => a + b, 0);
const dB = (a) => 20 * Math.log10(Math.max(a, 1e-9));

/** Droite de régression des niveaux (dB) selon log2 du rang : fonction du rang (0 = fondamentale). */
export function droitePente(db) {
  const n = db.length, lx = db.map((_, i) => Math.log2(i + 1));
  const mx = somme(lx) / n, my = somme(db) / n;
  const p = somme(lx.map((x, i) => (x - mx) * (db[i] - my))) / somme(lx.map((x) => (x - mx) ** 2));
  const f = (i) => my + p * (Math.log2(i + 1) - mx);
  f.pente = p; // dB par octave
  return f;
}

/** Moyenne des voisines (dB) de l'harmonique de rang i (1 ≤ i ≤ n − 2). */
export const moyenneVoisines = (db, i) => (db[i - 1] + db[i] + db[i + 1]) / 3;

/** Descripteurs harmoniques à partir des amplitudes (linéaires) des harmoniques 1, 2, 3… */
export function harmoniques(amp) {
  const nb = amp.length, db = amp.map(dB);
  const impairs = somme(amp.filter((_, i) => i >= 2 && i % 2 === 0).map((a) => a * a)); // h = 3, 5, 7…
  const pairs = somme(amp.filter((_, i) => i % 2 === 1).map((a) => a * a)); // h = 2, 4, 6…
  const droite = droitePente(db);
  let irr = 0;
  for (let h = 1; h < nb - 1; h++) irr += Math.abs(db[h] - moyenneVoisines(db, h));
  return {
    impairs_pairs: 10 * Math.log10(impairs / Math.max(pairs, 1e-12)),
    deviation: somme(db.map((v, i) => Math.abs(v - droite(i)))) / nb,
    irregularite: irr / Math.max(1, nb - 2),
  };
}

/** Inharmonicité (%) : partiels de fréquences f et d'amplitudes amp, F0 de référence f0. */
export function inharmonicite(f, amp, f0) {
  const p = amp.map((a) => a * a);
  return (100 * somme(f.map((fi, i) => Math.abs(fi / ((i + 1) * f0) - 1) * p[i]))) / somme(p);
}

// ─── Sons de synthèse ──────────────────────────────────────────────────────
export const NH = 20; // harmoniques du son de synthèse (F0 = 311 Hz, comme McAdams et al., 1995)

/** Son harmonique « plein » (−6 dB/octave, comme une dent de scie) ; harmoniques paires atténuées
 * de `att` dB (0 : plein ; −30 : caverneux, proche d'un signal carré). Amplitudes linéaires. */
export const ampsImpairs = (att) => Array.from({ length: NH }, (_, i) => (1 / (i + 1)) * ((i + 1) % 2 ? 1 : 10 ** (att / 20)));

/** Corde raide : partiel n à n × F0 × √(1 + B n²) (Fletcher, 1964) ; amplitude 1/n. */
export function corde(B, f0, n) {
  return Array.from({ length: n }, (_, i) => ({ f: (i + 1) * f0 * Math.sqrt(1 + B * (i + 1) ** 2), a: 1 / (i + 1) }));
}
