// Spectre moyen d'un son et ses descripteurs de bruit (courbes de tools/descripteurs_timbre.mjs,
// clé « spectre »), commun à la vue « Comparer » des corrélats (diapo-correlats.js) et à la
// diapositive « Bruit (noisiness) » (diapo-bruit.js). Fréquence log de 100 Hz à 10 kHz, dB sous
// le maximum (plancher DB_MIN, ou cadre.dbMin).
//   rapport_bruit : l'énergie non harmonique (hors des harmoniques) en gris sous le spectre.
//   platitude, crete : dans chaque bande d'octave (250 Hz à 8 kHz, séparées en pointillé), deux
//     paliers (moyenne arithmétique et géométrique de l'énergie ; maximum et moyenne) ; l'écart
//     entre les deux paliers est la valeur dans la bande, le descripteur est la moyenne des bandes.
import { axes, chemin, echelle, S } from './excali/excali.js';

export const F_MIN_BRUIT = 100, F_MAX_BRUIT = 10000, DB_MIN = -110;
const TICKS = [100, 250, 500, 1000, 2000, 4000, 8000];
const fmtF = (f) => (f >= 8000 ? `${f / 1000} kHz` : f >= 1000 ? `${f / 1000}k` : String(f));
const fDb = (v) => (v === 0 ? '0 dB' : String(v));

/** cadre : { g, d, h, b } (gauche, droite, haut, bas du tracé), dbMin et ticksDb facultatifs.
 *  → éléments de légende. */
export function tracerSpectreBruit(g, cle, sp, cadre, coul) {
  const dbMin = cadre.dbMin ?? DB_MIN;
  const X = echelle(F_MIN_BRUIT, F_MAX_BRUIT, cadre.g, cadre.d, true), Y = echelle(dbMin, 0, cadre.b, cadre.h);
  const visibles = (vs) => vs.map((v, i) => [(i + 0.5) * sp.df, v]).filter(([f, v]) => f >= F_MIN_BRUIT && v !== null)
    .map(([f, v]) => [X(f), Y(Math.max(dbMin, v))]);
  if (cle === 'rapport_bruit') {
    const pts = visibles(sp.bruit);
    S('path', { d: chemin([[pts[0][0], cadre.b], ...pts, [pts[pts.length - 1][0], cadre.b]]) + 'Z', fill: '#ced4da', stroke: 'none' }, g);
  }
  const parBande = cle === 'crete' || cle === 'platitude';
  if (parBande) {
    for (const f of [...new Set(sp.bandes.flat().filter((_, i) => i % 5 < 2))]) {
      S('line', { x1: X(f), x2: X(f), y1: cadre.h, y2: cadre.b, stroke: '#ced4da', 'stroke-width': 1, 'stroke-dasharray': '2 3' }, g);
    }
  }
  S('path', { d: chemin(visibles(sp.db)), fill: 'none', stroke: coul, 'stroke-width': 1, 'stroke-linejoin': 'round' }, g);
  // Axes par-dessus le spectre et le bruit (sinon le remplissage gris couvre l'axe des x).
  const finir = (items) => { axes(g, { x: X, y: Y, ticksX: TICKS, ticksY: cadre.ticksDb || [-100, -50, 0], formatX: fmtF, formatY: fDb }); return items; };
  if (!parBande) return finir([{ type: 'ligne', couleur: coul, texte: 'spectre' }, { type: 'plein', couleur: '#ced4da', texte: 'énergie non harmonique' }]);
  for (const [bas, haut, max, arith, geo] of sp.bandes) {
    const [p1, p2] = (cle === 'crete' ? [max, arith] : [arith, geo]).map((v) => Math.max(dbMin, v));
    const x0 = X(bas) + 3, x1 = X(haut) - 3;
    S('line', { x1: x0, x2: x1, y1: Y(p1), y2: Y(p1), stroke: '#1e1e1e', 'stroke-width': 1.5, 'stroke-dasharray': cle === 'crete' ? '4 3' : null }, g);
    S('line', { x1: x0, x2: x1, y1: Y(p2), y2: Y(p2), stroke: '#1e1e1e', 'stroke-width': 1.5, 'stroke-dasharray': cle === 'crete' ? null : '4 3' }, g);
    const xe = (x0 + x1) / 2; // écart : la valeur dans la bande
    S('line', { x1: xe, x2: xe, y1: Y(p1), y2: Y(p2), stroke: '#1e1e1e', 'stroke-width': 1.5 }, g);
  }
  return finir(cle === 'crete'
    ? [{ type: 'tiret', texte: 'maximum' }, { type: 'ligne', texte: 'moyenne' }, { type: 'ecart', texte: 'crête' }]
    : [{ type: 'ligne', texte: 'arithm.' }, { type: 'tiret', texte: 'géom.' }, { type: 'ecart', texte: 'écart' }]);
}
