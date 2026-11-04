// Diapositive MDS du Cours 7 (élément HTML d'Excalidraw+, document srcdoc, origine « null »),
// dans le style des démos (excali/excali.css, excali/excali.js : commandes dessinées en
// Excalifont, texte en Nunito, graphiques propres).
//
// Carte des sons calculée à partir du résultat gardé de l'écoute des paires
// (op=garde&id=c7paires, lisible sans clé) : les points partent au hasard puis se placent
// (itérations SMACOF) pour que leurs distances respectent les dissimilarités jugées.
//
// Document hôte (tools/questions_cours7.py, doc_mds) :
//   <base href="https://SITE/q/"> <link rel="stylesheet" href="…/q/excali/excali.css">
//   <script src="…/q/excali/rough.js"></script> <div id="demo" class="demo"></div>
//   <script type="application/json" id="config">{"id": "c7paires", "reference": "donnees/…json",
//     "sous_ensemble": ["tpt", …]}</script>
// Repère fixe 400 × 372 (taille de l'élément sur la diapositive), mis à l'échelle par ajuster().
//
// Bascule Classe / McAdams : « McAdams » affiche la matrice de dissimilarité de
// McAdams et al. (1995), 18 timbres de synthèse (tools/donnees_reference.mjs), toujours
// disponible. Sans résultat de la classe, la diapositive part sur ces données.
// « sous_ensemble » : les timbres de McAdams entendus par la classe, dans l'ordre de ses sons
// (tools/cours7_paires.json). McAdams montre alors ces seuls timbres (sous-matrice publiée),
// tournés sur la carte de la classe quand elle porte les mêmes sons ; « 18 » : tout le jeu.
// Bascule 1D / 2D / 3D : nombre de dimensions de la carte (le stress de chacune s'affiche).
//   1D : points sur une droite, arcs au survol ; 3D : points dans une boîte (comme les figures
//   d'espaces timbraux), glisser pour tourner.
//   3D, « Vertical : D1 / D2 / D3 » : la vue tourne pour mettre cet axe à la verticale ; les
//   tiges descendent le long de cet axe jusqu'au fond de la boîte (la coordonnée se lit à la
//   longueur de la tige).
// Chaque dimension a sa couleur (dimensions.js : axe, nom, corrélat), dans toutes les vues.
// 3D : chaque axe est ramené à la même longueur (cube, comme la figure A–E) et la boîte est
// vue à 45°, un peu aplatie, pour occuper la largeur ; les distances ne s'y lisent pas à l'échelle.
// Survoler un point : traits vers les autres sons, avec la dissimilarité jugée (au-delà de
// 8 sons : nom complet seulement, les points sont étiquetés par leur abréviation).
// Cliquer un point : l'instrument joue (un second clic arrête), si le son est fourni.
//
// Options de départ (config, toutes facultatives) : "source" ("classe" | "reference"), "dim"
// (1, 2, 3), "tous" (true : les 18 timbres de McAdams), "vertical" (0, 1, 2 : axe vertical en 3D).
// "descripteurs" (donnees/descripteurs-mcadams1995.json) : chaque dimension porte en plus son
// corrélat acoustique le plus fort sur la carte affichée (correlats.js, même calcul que la
// diapositive des corrélats), avec r ; en gris si r n'est pas significatif (p ≥ 0.05).
import { apiGarde, nombreEntier } from './commun.js';
import { ajuster, bouton, choix, ECART_COMMANDES, H, placer, R, S, T } from './excali/excali.js';
import { analyser } from './correlats.js';
import { COULEURS_DIMENSIONS as COULEURS } from './dimensions.js';
import { aligner, mds, pasGuttman, stress } from './mds.js';

const conf = JSON.parse(document.getElementById('config').textContent);
const ID = String(conf.id || 'c7paires');
// La clé « simule » des premières versions de la diapositive est ignorée (fichier retiré).
const URL_REFERENCE = String(conf.reference || 'donnees/mcadams1995.json');
const SOUS = Array.isArray(conf.sous_ensemble) ? conf.sous_ensemble.map(String) : [];
const URL_DESCRIPTEURS = conf.descripteurs ? String(conf.descripteurs) : null;
const BEAUCOUP = 8; // au-delà : abréviations, pas de traits au survol

const LD = 400, HD = 372; // repère de l'élément
const L = 400; // repère de la carte (SVG sous la barre de commandes)
const H_ = 304;
const ZONE = { x0: 34, x1: 392, y0: 24, y1: 266 };
const CENTRE = [(ZONE.x0 + ZONE.x1) / 2, (ZONE.y0 + ZONE.y1) / 2];
const ENCRE = '#1e1e1e';
const GRIS = '#868e96';
const BLEU = '#1971c2';
const LIGNE_1D = ZONE.y0 + (ZONE.y1 - ZONE.y0) * 0.62; // arcs au-dessus, noms au-dessous
// 3D : place de la boîte (sous « Vertical » et l'indice, au-dessus des noms des axes du fond).
const ZONE_3D = { x0: 48, x1: 362, y0: 46, y1: 252 };
const APLAT = 0.75; // hauteur à l'écran (la boîte serait sinon plus haute que large)

// ─── Mise en place ─────────────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  .carte svg { touch-action: none; }
  .carte.tourne { cursor: grabbing; }
  .point { cursor: pointer; outline: none; }
  .point.muet { cursor: default; } /* pas de son fourni (données de la littérature) */
  .chiffre, .point text { pointer-events: none; }
  .point:hover .disque, .point.survol .disque, .point:focus-visible .disque, .point.joue .disque { fill: ${BLEU}; }
  .point.survol text, .point.joue text { fill: ${BLEU}; }
  .lecture-carte { font-size: 15px; }
  .message { margin: 0; width: ${L}px; height: ${H_}px; display: flex; align-items: center; justify-content: center;
    text-align: center; color: ${GRIS}; font-size: 16px; padding: 0 40px; }`;
document.head.appendChild(style);

const racine = document.getElementById('demo');
const barre = placer(H('div', null, null, racine), 0, 0);
barre.style.display = 'flex';
barre.style.gap = ECART_COMMANDES + 'px'; // groupes séparés, boutons d'un même groupe serrés
const cSource = choix(barre, [{ texte: 'Classe', valeur: 'classe' },
  { texte: 'McAdams', valeur: 'reference', titre: 'McAdams et al. (1995), timbres de synthèse' }], null,
(v) => { choix_ = v; afficher({ rejouer: true }); }, { largeur: 80 });
const cDim = choix(barre, [1, 2, 3].map((d) => ({ texte: `${d}D`, valeur: d })), 2,
  (v) => { dim = v; afficher({ rejouer: true }); }, { largeur: 40 });
const carte = placer(H('div', 'carte', null, racine), 0, 38);
carte.style.width = L + 'px';
carte.style.height = H_ + 'px';
// 3D : axe vertical, en haut à gauche de la carte.
const axeVerticalUi = placer(H('div', null, null, racine), 0, 40);
axeVerticalUi.style.display = 'flex';
axeVerticalUi.style.alignItems = 'center';
axeVerticalUi.style.gap = '8px';
H('span', 'indice-html', 'Vertical', axeVerticalUi);
const cAxe = choix(axeVerticalUi, [0, 1, 2].map((k) => ({ texte: `D${k + 1}`, valeur: k })), 1, (k) => virer(k), { largeur: 34, hauteur: 28 });
// Pied : source, étendue (McAdams), recalculer.
const pied = placer(H('div', null, null, racine), 0, HD - 28, LD);
pied.style.display = 'flex';
pied.style.alignItems = 'center';
pied.style.gap = ECART_COMMANDES + 'px';
pied.style.height = '28px';
const sourceUi = H('span', 'indice-html', null, pied);
sourceUi.style.overflow = 'hidden';
sourceUi.style.textOverflow = 'ellipsis';
sourceUi.style.flex = '1';
const etendueUi = H('div', null, null, pied);
etendueUi.style.display = 'flex';
etendueUi.style.alignItems = 'center';
etendueUi.style.gap = '8px';
H('span', 'indice-html', 'Timbres', etendueUi); // libellé avant le groupe, comme « Vertical »
const cTous = choix(etendueUi, [{ texte: String(SOUS.length), valeur: false, titre: 'Les timbres entendus en classe' },
  { texte: '18', valeur: true, titre: "Les 18 timbres de l'article" }], !SOUS.length,
(v) => { tous = v; afficher({ rejouer: true }); }, { largeur: 34, hauteur: 28 });
// Recalculer : icône ↻ dessinée (même icône que « Nouvel essai » dans les démos), carrée.
const bRecalc = bouton(pied, '', () => afficher({ rejouer: true }), { largeur: 28, hauteur: 28, titre: 'Recalculer (repartir de positions au hasard)' });
bRecalc.setAttribute('aria-label', 'Recalculer');
const icRecalc = S('svg', { class: 'icone', width: 18, height: 18, viewBox: '0 0 24 24', 'aria-hidden': 'true' }, bRecalc);
R('path', icRecalc, ['M 19 9 A 8 8 0 1 0 20 15'], { cle: 'rafraichir-arc', strokeWidth: 1.8, roughness: 0.7 });
R('polygon', icRecalc, [[[20, 12], [14, 7], [22, 5]]], { cle: 'rafraichir-pointe', fill: '#1e1e1e', fillStyle: 'solid', strokeWidth: 1, roughness: 0.5 });

const ui = { carte, source: sourceUi };
const donnees = { classe: null, reference: null, erreurClasse: null, descripteurs: null };
// Source choisie à la main ou par la config (sinon : classe si elle existe).
let choix_ = ['classe', 'reference'].includes(conf.source) ? conf.source : null;
let dim = [1, 2, 3].includes(conf.dim) ? conf.dim : 2;
let tous = conf.tous === true || !SOUS.length; // McAdams : les 18 timbres, ou ceux entendus en classe
let vue = null; // source et solution affichées (voir preparer)
const solutions = new Map(); // `${cleSource}|${dim}` → { points, stress } (la 3D coûte ~0,3 s)
let animation = 0;
let survol = null;
const audios = new Map();
let enLecture = null;
// ─── Vue 3D : matrice de rotation (repère des données → repère de l'écran) ─────
// Écran : x vers la droite, y vers le haut, z vers le spectateur.
function produit(A, B) {
  return A.map((l) => B[0].map((_, j) => l.reduce((s, a, k) => s + a * B[k][j], 0)));
}
function rotX(t) {
  const [c, s] = [Math.cos(t), Math.sin(t)];
  return [[1, 0, 0], [0, c, -s], [0, s, c]];
}
function rotY(t) {
  const [c, s] = [Math.cos(t), Math.sin(t)];
  return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
}
// Rotation d'angle t autour de l'axe k des données (Rodrigues sur un vecteur de base).
function rotAxe(k, t) {
  const [c, s] = [Math.cos(t), Math.sin(t)];
  const [i, j] = [(k + 1) % 3, (k + 2) % 3];
  const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  M[k][k] = 1;
  M[i][i] = c;
  M[j][j] = c;
  M[i][j] = -s;
  M[j][i] = s;
  return M;
}
// Axe k vers le haut de l'écran (permutations de déterminant +1), puis vue un peu de biais et d'en haut.
const MISE_DEBOUT = [
  [[0, -1, 0], [1, 0, 0], [0, 0, 1]], // D1 vertical
  [[1, 0, 0], [0, 1, 0], [0, 0, 1]], // D2 vertical
  [[1, 0, 0], [0, 0, 1], [0, -1, 0]], // D3 vertical
];
function vueCible(k) {
  return produit(rotX(0.35), produit(rotY(-Math.PI / 4), MISE_DEBOUT[k]));
}
function quaternion(R) {
  const t = R[0][0] + R[1][1] + R[2][2];
  let q;
  if (t > 0) {
    const s = 0.5 / Math.sqrt(t + 1);
    q = [0.25 / s, (R[2][1] - R[1][2]) * s, (R[0][2] - R[2][0]) * s, (R[1][0] - R[0][1]) * s];
  } else if (R[0][0] > R[1][1] && R[0][0] > R[2][2]) {
    const s = 2 * Math.sqrt(1 + R[0][0] - R[1][1] - R[2][2]);
    q = [(R[2][1] - R[1][2]) / s, 0.25 * s, (R[0][1] + R[1][0]) / s, (R[0][2] + R[2][0]) / s];
  } else if (R[1][1] > R[2][2]) {
    const s = 2 * Math.sqrt(1 + R[1][1] - R[0][0] - R[2][2]);
    q = [(R[0][2] - R[2][0]) / s, (R[0][1] + R[1][0]) / s, 0.25 * s, (R[1][2] + R[2][1]) / s];
  } else {
    const s = 2 * Math.sqrt(1 + R[2][2] - R[0][0] - R[1][1]);
    q = [(R[1][0] - R[0][1]) / s, (R[0][2] + R[2][0]) / s, (R[1][2] + R[2][1]) / s, 0.25 * s];
  }
  const n = Math.hypot(...q);
  return q.map((v) => v / n);
}
function matrice([w, x, y, z]) {
  return [
    [1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)],
    [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)],
    [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)],
  ];
}
function slerp(a, b, t) {
  let d = a.reduce((s, v, i) => s + v * b[i], 0);
  const c = d < 0 ? b.map((v) => -v) : b;
  d = Math.abs(d);
  if (d > 0.9995) {
    const q = a.map((v, i) => v + t * (c[i] - v));
    const n = Math.hypot(...q);
    return q.map((v) => v / n);
  }
  const o = Math.acos(d);
  const [ka, kb] = [Math.sin((1 - t) * o) / Math.sin(o), Math.sin(t * o) / Math.sin(o)];
  return a.map((v, i) => ka * v + kb * c[i]);
}

let axeVertical = [0, 1, 2].includes(conf.vertical) ? conf.vertical : 1; // D2 à la verticale par défaut
let rotation = vueCible(axeVertical);
let virage = 0; // animation du changement d'axe vertical
let glissement = null; // rotation à la souris en cours
let rotationAuto = true; // la 3D tourne d'elle-même jusqu'au premier glissement

function visible() {
  return !document.hidden && window.innerWidth > 0 && window.innerHeight > 0;
}

function source() {
  if (choix_) return choix_;
  return donnees.classe ? 'classe' : 'reference';
}

// ─── Données ───────────────────────────────────────────────────────────────
async function chargerClasse() {
  try {
    const r = await apiGarde(ID);
    const g = r && r.garde;
    donnees.classe = g && g.resultats && Array.isArray(g.resultats.matrice) ? g : null;
    donnees.erreurClasse = null;
  } catch (e) {
    donnees.erreurClasse = e.reseau ? 'Réseau indisponible' : e.message;
  }
}

async function chargerReference() {
  if (donnees.reference) return;
  const r = await fetch(URL_REFERENCE, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`Données de McAdams et al. (1995) introuvables (${r.status})`);
  donnees.reference = await r.json();
}

// Descripteurs acoustiques des sons de McAdams (facultatifs : sans eux, pas de corrélats).
async function chargerDescripteurs() {
  if (!URL_DESCRIPTEURS || donnees.descripteurs) return;
  try {
    const r = await fetch(URL_DESCRIPTEURS, { cache: 'no-cache' });
    if (r.ok) donnees.descripteurs = await r.json();
  } catch {
    /* hors ligne : dimensions sans corrélat */
  }
}

// Corrélat le plus fort de chaque dimension de la carte affichée : [{ nom, r, significatif }].
// Classe : ses sons sont les timbres de McAdams « sous_ensemble », dans le même ordre.
function correlatsDe(g, cleSource, points) {
  const d = donnees.descripteurs;
  if (!d) return null;
  const sons = g.resultats.sons;
  const cles = cleSource.startsWith('reference|') ? sons : SOUS.length === sons.length ? SOUS : null;
  if (!cles) return null;
  const valeurs = Object.fromEntries(d.sons.map((s) => [s.cle, s]));
  const a = analyser(points, cles, valeurs, d.descripteurs);
  return a.meilleurs.map((cle, k) => {
    if (!cle) return null;
    const r = a.lignes.find((l) => l.cle === cle).r[k];
    const nom = d.descripteurs.find((x) => x.cle === cle).nom;
    return { nom: nom.charAt(0).toLowerCase() + nom.slice(1), r, significatif: Math.abs(r) >= a.seuil };
  });
}

// Sous-matrice de McAdams pour les timbres entendus en classe (null si l'un manque).
let sousReference = null;
function referenceAffichee() {
  const g = donnees.reference;
  if (tous || !SOUS.length) return g;
  if (sousReference?.de === g) return sousReference.g;
  const idx = SOUS.map((c) => g.resultats.sons.indexOf(c));
  if (idx.some((i) => i < 0)) return g;
  const sous = { ...g, resultats: { ...g.resultats, sons: SOUS, matrice: idx.map((i) => idx.map((j) => g.resultats.matrice[i][j])) } };
  sousReference = { de: g, g: sous };
  return sous;
}

// La classe a-t-elle entendu ces mêmes timbres, dans le même ordre (comparaison point à point) ?
function memesSons(g, classe) {
  if (!classe) return false;
  const noms = (x) => {
    const parCle = new Map((x.gabarit?.sons || []).map((s) => [s.cle, s.nom]));
    return x.resultats.sons.map((c) => parCle.get(c));
  };
  const [a, b] = [noms(g), noms(classe)];
  return a.length === b.length && a.every((n, i) => n && n === b[i]);
}

// Tourne (et retourne) X sur la carte ref sans changer son échelle : le stress reste le même.
function tournerSur(X, ref) {
  const centre = (P) => P[0].map((_, k) => P.reduce((s, p) => s + p[k], 0) / P.length);
  const norme = (P) => {
    const c = centre(P);
    return Math.sqrt(P.reduce((s, p) => s + p.reduce((t, v, k) => t + (v - c[k]) ** 2, 0), 0));
  };
  const A = aligner(X, ref);
  const f = norme(X) / (norme(A) || 1);
  const c = centre(A);
  return A.map((p) => p.map((v, k) => (v - c[k]) * f));
}

function preparer(g, cleSource) {
  const res = g.resultats;
  const parCle = new Map((g.gabarit?.sons || []).map((s) => [s.cle, s]));
  const sons = res.sons.map((cle) => ({ cle, ...(parCle.get(cle) || {}) }));
  const delta = res.matrice;
  const cle = `${cleSource}|${dim}`;
  if (!solutions.has(cle)) solutions.set(cle, mds(delta, { dim }));
  let { points, stress: s } = solutions.get(cle);
  if (cleSource.startsWith('reference|') && memesSons(g, donnees.classe)) {
    const c = donnees.classe;
    const cleClasse = `classe|${c.revele_a || ''}|${c.resultats.n}|${JSON.stringify(c.resultats.matrice)}|${dim}`;
    if (!solutions.has(cleClasse)) solutions.set(cleClasse, mds(c.resultats.matrice, { dim }));
    points = tournerSur(points, solutions.get(cleClasse).points);
  }
  const v = { g, cleSource, dim, sons, delta, final: points, stressFinal: s, correlats: correlatsDe(g, cleSource, points) };
  // Échelle commune à tous les axes (les distances doivent rester comparables).
  const etendues = Array.from({ length: dim }, (_, k) => {
    const c = points.map((p) => p[k]);
    return [Math.min(...c), Math.max(...c)];
  });
  v.centre = etendues.map(([a, b]) => (a + b) / 2);
  v.etendue = Math.max(...etendues.map(([a, b]) => b - a), 1e-9);
  const largeur = ZONE.x1 - ZONE.x0;
  const hauteur = ZONE.y1 - ZONE.y0;
  if (dim === 1) v.echelle = (largeur / v.etendue) * 0.86;
  else if (dim === 2) v.echelle = Math.min(largeur / v.etendue, hauteur / v.etendue) * 0.86;
  else {
    // 3D : boîte autour des points, chaque axe ramené à [−1, 1] (cube). Taille : le cube de la vue
    // de départ remplit ZONE_3D (tourner autour de la verticale ne l'élargit pas : 45° est le plus large).
    v.boite = etendues.map(([a, b]) => [a - 0.08 * (b - a), b + 0.08 * (b - a)]);
    v.demi = v.boite.map(([a, b]) => (b - a) / 2 || 1e-9);
    v.rayon = Math.sqrt(3);
    const R0 = vueCible(axeVertical);
    let [w, h] = [0, 0];
    for (const c of [[1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1]]) {
      const [x, y] = R0.map((l) => l.reduce((s, r, k) => s + r * c[k], 0));
      [w, h] = [Math.max(w, Math.abs(x)), Math.max(h, Math.abs(y) * APLAT)];
    }
    v.echelle = Math.min((ZONE_3D.x1 - ZONE_3D.x0) / 2 / w, (ZONE_3D.y1 - ZONE_3D.y0) / 2 / h);
  }
  return v;
}

function nomDe(son) {
  return son.nom || son.cle;
}

// ─── Tracé ─────────────────────────────────────────────────────────────────
// Position à l'écran [x, y, profondeur] (profondeur > 0 : vers le spectateur, 3D seulement).
function versEcran(v, p) {
  if (v.dim === 1) return [CENTRE[0] + (p[0] - v.centre[0]) * v.echelle, LIGNE_1D, 0];
  if (v.dim === 2) return [CENTRE[0] + (p[0] - v.centre[0]) * v.echelle, CENTRE[1] - (p[1] - v.centre[1]) * v.echelle, 0];
  const d = p.map((c, k) => (c - v.centre[k]) / v.demi[k]);
  const [x, y, z] = rotation.map((l) => l.reduce((s, r, k) => s + r * d[k], 0));
  return [(ZONE_3D.x0 + ZONE_3D.x1) / 2 + x * v.echelle, (ZONE_3D.y0 + ZONE_3D.y1) / 2 - y * v.echelle * APLAT, z / v.rayon];
}
// ─── Tracé ─────────────────────────────────────────────────────────────────
// Données : graphique propre (traits de 1 px, Nunito) ; pas de rough.js (la carte est redessinée
// à chaque image de l'animation).
function pastille(g, x, y, etiquette) {
  const largeur = 8 * etiquette.length + 10;
  const c = S('g', { class: 'chiffre' }, g);
  S('rect', { x: x - largeur / 2, y: y - 9, width: largeur, height: 18, rx: 3, fill: '#fff', stroke: BLEU, 'stroke-width': 1.2 }, c);
  T(c, x, y + 4.5, etiquette, 'graduation', 'middle', { fill: BLEU, stroke: 'none' });
}

// Corrélat d'une dimension, sous son nom : « temps d'attaque (r = −0.71) ». En 3D, le nom seul
// (comme les figures d'espaces timbraux ; les arêtes sont courtes), r dans l'infobulle.
function correlat(v, j) {
  const c = v.correlats && v.correlats[j];
  if (!c) return null;
  const r = `r = ${c.r.toFixed(2).replace('-', '−')}`;
  return { texte: v.dim === 3 ? c.nom : `${c.nom} (${r})`, r, couleur: c.significatif ? null : GRIS };
}

// Nom d'une dimension (et son corrélat dessous), à plat.
function nomAxe(s, v, j, x, y, attrs = {}) {
  const c = correlat(v, j);
  // style (et non fill) : la feuille de style des démos fixe la couleur des textes.
  T(s, x, y, `Dimension ${j + 1}`, 'titre-axe', 'middle', { ...attrs, style: `fill: ${COULEURS[j]}` });
  if (c) T(s, x, y + 15, c.texte, 'graduation', 'middle', { ...attrs, style: `fill: ${c.couleur || COULEURS[j]}` });
}

// Axe d'une dimension en 2D / 1D, dans sa couleur.
function axe(s, j, attrs) {
  S('line', { ...attrs, class: 'trait', style: `stroke: ${COULEURS[j]}; stroke-width: 1.5px` }, s);
}

function axes(s, v) {
  if (v.dim === 2) {
    axe(s, 0, { x1: ZONE.x0, x2: ZONE.x1, y1: ZONE.y1, y2: ZONE.y1 });
    axe(s, 1, { x1: ZONE.x0, x2: ZONE.x0, y1: ZONE.y0, y2: ZONE.y1 });
    nomAxe(s, v, 0, CENTRE[0], ZONE.y1 + 20);
    // Vertical : avec corrélat, les deux lignes à gauche de l'axe.
    const x = v.correlats ? ZONE.x0 - 22 : ZONE.x0 - 12;
    nomAxe(s, v, 1, 0, 0, { transform: `translate(${x} ${CENTRE[1]}) rotate(-90)` });
  } else if (v.dim === 1) {
    axe(s, 0, { x1: ZONE.x0, x2: ZONE.x1, y1: LIGNE_1D, y2: LIGNE_1D });
    nomAxe(s, v, 0, CENTRE[0], ZONE.y1 + 20);
  } else {
    // Boîte ouverte (comme les figures d'espaces timbraux) : seulement le fond et les deux
    // parois du fond de la scène (les plus éloignées du spectateur, recalculées quand la vue
    // tourne). Une arête de devant porte le nom de chaque dimension.
    const k = axeVertical;
    const [a, b] = [0, 1, 2].filter((j) => j !== k);
    const coin = (bits) => versEcran(v, bits.map((bit, j) => v.boite[j][bit]));
    const bitsDe = (fixes) => {
      const bits = [0, 0, 0];
      for (const [j, bit] of fixes) bits[j] = bit;
      return bits;
    };
    // Paroi perpendiculaire à j : côté 0 ou 1, le plus loin du spectateur (profondeur moindre).
    const fond = (j) => {
      const profondeur = (bit) => versEcran(v, v.centre.map((c, m) => (m === j ? v.boite[j][bit] : c)))[2];
      return profondeur(0) < profondeur(1) ? 0 : 1;
    };
    const [fa, fb] = [fond(a), fond(b)];
    const sol = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([u, w]) => coin(bitsDe([[a, u], [b, w], [k, 0]])));
    S('polygon', { points: sol.map(([x, y]) => `${x},${y}`).join(' '), fill: '#e7f5ff', stroke: 'none' }, s);
    const arete = (b1, b2, attrs) => {
      const [A, B] = [coin(b1), coin(b2)];
      S('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: '#ced4da', 'stroke-width': 1, ...attrs }, s);
      return [A, B];
    };
    // Fond : arêtes arrière (contre les parois) ; arêtes avant = axes nommés, plus loin.
    arete(bitsDe([[a, fa], [b, 0], [k, 0]]), bitsDe([[a, fa], [b, 1], [k, 0]]));
    arete(bitsDe([[b, fb], [a, 0], [k, 0]]), bitsDe([[b, fb], [a, 1], [k, 0]]));
    // Parois : arête verticale commune (au fond), arêtes verticales extérieures, arêtes du haut.
    arete(bitsDe([[a, fa], [b, fb], [k, 0]]), bitsDe([[a, fa], [b, fb], [k, 1]]));
    arete(bitsDe([[a, fa], [b, 1 - fb], [k, 0]]), bitsDe([[a, fa], [b, 1 - fb], [k, 1]]));
    arete(bitsDe([[a, 1 - fa], [b, fb], [k, 0]]), bitsDe([[a, 1 - fa], [b, fb], [k, 1]]));
    arete(bitsDe([[a, fa], [b, 0], [k, 1]]), bitsDe([[a, fa], [b, 1], [k, 1]]));
    arete(bitsDe([[b, fb], [a, 0], [k, 1]]), bitsDe([[b, fb], [a, 1], [k, 1]]));
    // Axes nommés : les deux arêtes avant du fond, et l'arête verticale extérieure la plus à gauche.
    // t : position du nom le long de l'arête (0 : A, 1 : B).
    const nommer = ([A, B], j, t = 0.5) => {
      const couleur = COULEURS[j];
      S('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: couleur, 'stroke-width': 2, 'stroke-linecap': 'round' }, s);
      const [mx, my] = [A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])];
      let angle = (Math.atan2(B[1] - A[1], B[0] - A[0]) * 180) / Math.PI;
      if (angle >= 90) angle -= 180; // un axe vertical se lit de bas en haut
      if (angle < -90) angle += 180;
      // Décalage perpendiculaire à l'arête, du côté opposé au centre de la boîte.
      const c = versEcran(v, v.centre);
      const lg = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
      let [nx, ny] = [-(B[1] - A[1]) / lg, (B[0] - A[0]) / lg];
      if (nx * (mx - c[0]) + ny * (my - c[1]) < 0) [nx, ny] = [-nx, -ny];
      // Corrélat : seconde ligne, sous le nom dans le sens de lecture ; les deux restent hors de la boîte.
      const co = correlat(v, j);
      const bas = -nx * Math.sin((angle * Math.PI) / 180) + ny * Math.cos((angle * Math.PI) / 180) > 0;
      const [dNom, dCorr] = !co ? [12, 0] : bas ? [12, 27] : [27, 12];
      T(s, 0, 0, `Dimension ${j + 1}`, 'titre-axe', 'middle',
        { style: `fill: ${couleur}`, transform: `translate(${mx + nx * dNom} ${my + ny * dNom}) rotate(${angle}) translate(0 5)` });
      if (co) {
        const t = T(s, 0, 0, co.texte, 'graduation', 'middle',
          { style: `fill: ${co.couleur || couleur}`, transform: `translate(${mx + nx * dCorr} ${my + ny * dCorr}) rotate(${angle}) translate(0 4.5)` });
        S('title', {}, t).textContent = co.r;
      }
    };
    // Avec corrélats (lignes longues), les deux noms du fond s'écartent de leur coin commun.
    const ecart = v.correlats ? 0.08 : 0;
    nommer(arete(bitsDe([[a, 1 - fa], [b, 0], [k, 0]]), bitsDe([[a, 1 - fa], [b, 1], [k, 0]])), b, 0.5 + (fb ? ecart : -ecart));
    nommer(arete(bitsDe([[b, 1 - fb], [a, 0], [k, 0]]), bitsDe([[b, 1 - fb], [a, 1], [k, 0]])), a, 0.5 + (fa ? ecart : -ecart));
    const exterieures = [bitsDe([[a, fa], [b, 1 - fb]]), bitsDe([[a, 1 - fa], [b, fb]])].map((bits) => {
      const haut = [...bits];
      haut[k] = 1;
      return [coin(bits), coin(haut)];
    });
    nommer(exterieures[0][0][0] < exterieures[1][0][0] ? exterieures[0] : exterieures[1], k);
    // Sous le stress (le bas de la carte porte les noms des dimensions) ; caché par le nom survolé.
    if (survol === null || v.sons.length <= BEAUCOUP) T(s, ZONE.x1, 30, 'Glisser pour tourner', 'indice', 'end');
  }
}

// 3D : tige de chaque point jusqu'au fond de la boîte, le long de l'axe vertical choisi :
// la longueur de la tige est la coordonnée sur cet axe.
function tiges(s, v, X) {
  const k = axeVertical;
  const [a, b] = [0, 1, 2].filter((j) => j !== k);
  const pas = 0.04; // ombre : petit disque sur le fond (unités du cube)
  X.forEach((p) => {
    const pied = p.map((c, j) => (j === k ? v.boite[k][0] : c));
    const [x1, y1] = versEcran(v, p);
    const [x2, y2] = versEcran(v, pied);
    S('line', { x1, y1, x2, y2, stroke: GRIS, 'stroke-width': 1, 'stroke-dasharray': '3 3' }, s);
    const ombre = Array.from({ length: 12 }, (_, m) => {
      const t = (m / 12) * 2 * Math.PI;
      return versEcran(v, pied.map((c, j) => c + (j === a ? pas * v.demi[a] * Math.cos(t) : 0) + (j === b ? pas * v.demi[b] * Math.sin(t) : 0)));
    }).map(([x, y]) => `${x},${y}`).join(' ');
    S('polygon', { points: ombre, fill: GRIS }, s);
  });
}

function tracer(v, X) {
  const E = X.map((p) => versEcran(v, p));
  const s = S('svg', { width: L, height: H_, viewBox: `0 0 ${L} ${H_}`, role: 'img', 'aria-label': `Carte MDS des sons en ${v.dim} dimension${v.dim > 1 ? 's' : ''}` });
  axes(s, v);
  if (v.dim === 3) tiges(s, v, X);
  T(s, ZONE.x1, 12, `Stress = ${formaterStress(v.stressCourant ?? v.stressFinal)}`, 'indice', 'end', { style: 'font-variant-numeric: tabular-nums' });

  // Survol : traits (arcs en 1D) vers les autres sons, sous les points ; chiffres au-dessus.
  // Beaucoup de sons : nom complet du son survolé en haut à gauche, sans traits.
  const nombreux = v.sons.length > BEAUCOUP;
  const chiffres = [];
  if (survol !== null && nombreux) {
    const son = v.sons[survol];
    T(s, v.dim === 3 ? ZONE.x1 : ZONE.x0, v.dim === 3 ? 30 : 12, son.abrege && son.nom ? `${son.abrege} : ${son.nom}` : nomDe(son),
      'titre-axe', v.dim === 3 ? 'end' : 'start', { fill: BLEU });
  } else if (survol !== null) {
    const i = survol;
    v.sons.forEach((_, j) => {
      if (j === i) return;
      const dij = v.delta[i][j];
      const etiquette = dij === null || dij === undefined ? '-' : String(Math.round(dij));
      const [x1, y1] = E[i];
      const [x2, y2] = E[j];
      const trait = { fill: 'none', stroke: BLEU, 'stroke-width': 1.3, 'stroke-dasharray': '5 4' };
      if (v.dim === 1) {
        const h = Math.min(Math.abs(x2 - x1) * 0.9, (LIGNE_1D - ZONE.y0) * 1.8);
        S('path', { ...trait, d: `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1 - h} ${x2} ${y2}` }, s);
        chiffres.push([(x1 + x2) / 2, y1 - h / 2, etiquette]);
      } else {
        S('line', { ...trait, x1, y1, x2, y2 }, s);
        chiffres.push([x1 + 0.6 * (x2 - x1), y1 + 0.6 * (y2 - y1), etiquette]);
      }
    });
  }

  // 1D : noms sous la droite, sur deux rangs alternés (de gauche à droite).
  const rang1D = new Map();
  if (v.dim === 1) [...E.keys()].sort((a, b) => E[a][0] - E[b][0]).forEach((i, k) => rang1D.set(i, k % (nombreux ? 3 : 2)));
  // 3D : du plus loin au plus proche (les plus proches recouvrent).
  const ordre = [...E.keys()].sort((a, b) => E[a][2] - E[b][2]);
  for (const i of ordre) {
    const son = v.sons[i];
    const [x, y, z] = E[i];
    const g = S('g', {
      class: `point${enLecture === i ? ' joue' : ''}${survol === i ? ' survol' : ''}${son.fichier ? '' : ' muet'}`,
      'data-i': i, tabindex: 0, role: son.fichier ? 'button' : 'img', 'aria-label': son.fichier ? `${nomDe(son)} : écouter` : nomDe(son),
    }, s);
    const r0 = nombreux ? 3.5 : 4.5;
    const r = v.dim === 3 ? r0 * (1 + 0.3 * z) : r0;
    S('circle', { cx: x, cy: y, r: 16, fill: 'transparent' }, g); // zone de clic
    S('circle', { class: 'disque', cx: x, cy: y, r: enLecture === i ? r + 2 : r, fill: ENCRE, 'fill-opacity': v.dim === 3 ? 0.6 + 0.4 * (z + 1) / 2 : 1 }, g);
    let ty;
    if (v.dim === 1) ty = y + 22 + (nombreux ? 14 : 17) * rang1D.get(i);
    else ty = y - 14 > ZONE.y0 + 4 ? y - r - 6 : y + r + 15;
    const nom = nombreux ? son.abrege || son.cle : nomDe(son);
    // Nom centré sur le point, sauf au bord de la carte (il resterait coupé).
    const demi = nom.length * (nombreux ? 3.4 : 4.2);
    const ancre = x + demi > L ? 'end' : x - demi < 0 ? 'start' : 'middle';
    T(g, ancre === 'end' ? Math.max(x + 6, L - 1) : ancre === 'start' ? Math.min(x - 6, 1) : x, ty, nom, nombreux ? 'graduation' : 'lecture-carte', ancre);
  }
  chiffres.forEach(([x, y, e]) => pastille(s, x, y, e));
  ui.carte.replaceChildren(s);
}

function redessiner() {
  if (vue) tracer(vue, vue.courant || vue.final);
}

// Survol : redessin à l'image suivante, jamais pendant l'événement. Redessiner remplace le
// SVG ; fait pendant « pointerover », il détacherait l'élément visé par l'appui qui suit
// aussitôt (même geste), et cet appui n'atteindrait plus la carte.
let redessinPrevu = 0;
function redessinerBientot() {
  if (redessinPrevu) return;
  redessinPrevu = requestAnimationFrame(() => {
    redessinPrevu = 0;
    redessiner();
  });
}

function formaterStress(v) {
  return v.toFixed(3); // point décimal, comme les autres figures du cours
}

function majTexte(v) {
  const res = v.g.resultats;
  const n = res.n || 0;
  const dont = res.simulees || 0;
  ui.source.style.color = source() === 'classe' && dont > 0 ? '#e03131' : '';
  if (source() === 'reference') ui.source.textContent = `${v.g.titre || 'Littérature'}`;
  else ui.source.textContent = `Classe : ${nombreEntier(n)} participant${n === 1 ? '' : 's'}${dont ? ` (${nombreEntier(dont)} simulés)` : ''}`;
}

function message(texte) {
  cancelAnimationFrame(animation);
  const p = document.createElement('p');
  p.className = 'message';
  p.textContent = texte;
  ui.carte.replaceChildren(p);
  ui.source.textContent = '';
}

function image(v, X, s) {
  v.courant = X;
  v.stressCourant = s;
  if (v.dim === 3 && rotationAuto && !glissement && !virage) tournerAutour(0.012);
  tracer(v, X);
}

// Les points partent au hasard (dans l'étendue de la solution) et descendent le stress.
// Chaque image est alignée (Procrustes) sur la solution finale : seule la forme bouge.
function animer(v) {
  cancelAnimationFrame(animation);
  const n = v.sons.length;
  let X = Array.from({ length: n }, () => Array.from({ length: v.dim }, () => (Math.random() - 0.5) * v.etendue));
  let images = 0;
  let precedent = Infinity;
  majTexte(v);
  const pas = () => {
    if (vue !== v) return;
    const Y = pasGuttman(X, v.delta);
    X = X.map((p, i) => p.map((c, k) => c + 0.2 * (Y[i][k] - c)));
    const s = stress(X, v.delta);
    const A = aligner(X, v.final);
    image(v, A, s);
    images += 1;
    if (images < 180 && (images < 30 || precedent - s > 1e-5)) {
      precedent = s;
      animation = requestAnimationFrame(pas);
    } else if (s > v.stressFinal + 1e-3) {
      glisser(v, A); // départ tombé dans un minimum local : rejoindre la meilleure solution
    } else {
      tourner(v);
    }
  };
  pas();
}

function glisser(v, depart) {
  let k = 0;
  const pas = () => {
    if (vue !== v) return;
    k += 1;
    const t = Math.min(1, k / 24);
    const X = depart.map((p, i) => p.map((c, d) => c + t * (v.final[i][d] - c)));
    image(v, X, stress(X, v.delta));
    if (t < 1) animation = requestAnimationFrame(pas);
    else tourner(v);
  };
  animation = requestAnimationFrame(pas);
}

// Rotation automatique autour de l'axe vertical choisi (il reste vertical).
function tournerAutour(t) {
  rotation = produit(rotation, rotAxe(axeVertical, t));
}

// Changement d'axe vertical : rotation animée (interpolation de quaternions) vers la vue type.
function virer(k) {
  axeVertical = k;
  cAxe.valeur(k);
  rotationAuto = false;
  cancelAnimationFrame(virage);
  const [qa, qb] = [quaternion(rotation), quaternion(vueCible(k))];
  let n = 0;
  const pas = () => {
    n += 1;
    const t = Math.min(1, n / 40);
    rotation = matrice(slerp(qa, qb, t * t * (3 - 2 * t)));
    redessiner();
    virage = t < 1 ? requestAnimationFrame(pas) : 0;
  };
  virage = requestAnimationFrame(pas);
}

// 3D : la vue continue de tourner un moment après le placement (relief), puis s'arrête.
function tourner(v) {
  v.stressCourant = v.stressFinal;
  if (v.dim !== 3) return redessiner();
  let k = 0;
  const pas = () => {
    if (vue !== v || !rotationAuto || glissement || virage) return;
    k += 1;
    tournerAutour(0.012 * Math.max(0, 1 - k / 150));
    tracer(v, v.final);
    if (k < 150) animation = requestAnimationFrame(pas);
  };
  animation = requestAnimationFrame(pas);
}

async function afficher({ rejouer = false } = {}) {
  const src = source();
  cSource.valeur(src);
  cDim.valeur(dim);
  cAxe.valeur(axeVertical);
  axeVerticalUi.hidden = dim !== 3;
  etendueUi.hidden = src !== 'reference' || !SOUS.length;
  cTous.valeur(tous);
  let g;
  try {
    await chargerDescripteurs();
    if (src === 'reference') {
      await chargerReference();
      g = referenceAffichee();
    } else {
      g = donnees.classe;
      if (!g) {
        vue = null;
        message(donnees.erreurClasse
          ? `Résultat de la classe indisponible (${donnees.erreurClasse}).`
          : 'Pas encore de résultat de la classe : écoute des paires non révélée.');
        return;
      }
    }
    const cle = `${src}|${g.revele_a || ''}|${g.resultats.n}|${JSON.stringify(g.resultats.matrice)}`;
    if (!rejouer && vue && vue.cleSource === cle && vue.dim === dim) return;
    const v = preparer(g, cle);
    vue = v;
    survol = null;
    if (visible()) animer(v);
    else {
      v.courant = v.final;
      majTexte(v);
      tracer(v, v.final);
    }
  } catch (e) {
    vue = null;
    message(e.message || String(e));
  }
}

// ─── Son ───────────────────────────────────────────────────────────────────
function arreter() {
  for (const a of audios.values()) {
    a.pause();
    a.currentTime = 0;
  }
  enLecture = null;
}

function jouer(i) {
  const son = vue && vue.sons[i];
  if (!son || !son.fichier) return;
  const deja = enLecture === i;
  arreter();
  if (!deja) {
    let a = audios.get(son.fichier);
    if (!a) {
      a = new Audio(son.fichier);
      a.preload = 'auto';
      audios.set(son.fichier, a);
    }
    enLecture = i;
    a.onended = () => {
      if (enLecture === i) enLecture = null;
      redessiner();
    };
    a.play().catch(() => {
      enLecture = null;
      redessiner();
    });
  }
  redessiner();
}

// ─── Événements ────────────────────────────────────────────────────────────
function pointDe(e) {
  const g = e.target.closest && e.target.closest('.point');
  return g ? Number(g.dataset.i) : null;
}

ui.carte.addEventListener('pointerover', (e) => {
  const i = pointDe(e);
  if (i === null || i === survol || !vue || glissement) return;
  survol = i;
  redessinerBientot();
});
ui.carte.addEventListener('pointerleave', () => {
  if (survol === null || !vue) return;
  survol = null;
  redessinerBientot();
});
ui.carte.addEventListener('pointerout', (e) => {
  if (!vue || survol === null) return;
  const vers = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.point');
  if (vers) return;
  survol = null;
  redessinerBientot();
});
// 3D : glisser hors des points fait tourner la vue (la conteneur garde la capture,
// le SVG étant redessiné à chaque image).
ui.carte.addEventListener('pointerdown', (e) => {
  if (!vue || vue.dim !== 3 || pointDe(e) !== null) return;
  e.preventDefault(); // pas de sélection de texte pendant le glissement
  glissement = { x: e.clientX, y: e.clientY, id: e.pointerId };
  rotationAuto = false;
  survol = null;
  cancelAnimationFrame(virage);
  virage = 0;
  ui.carte.setPointerCapture(e.pointerId);
  ui.carte.classList.add('tourne');
});
ui.carte.addEventListener('pointermove', (e) => {
  if (!glissement || e.pointerId !== glissement.id) return;
  const pleine = ui.carte.getBoundingClientRect().width || 1; // élément mis à l'échelle
  // Rotation « boule » : autour de la verticale et de l'horizontale de l'écran.
  rotation = produit(rotY(((e.clientX - glissement.x) / pleine) * Math.PI),
    produit(rotX(((e.clientY - glissement.y) / pleine) * Math.PI), rotation));
  glissement.x = e.clientX;
  glissement.y = e.clientY;
  redessiner();
});
for (const fin of ['pointerup', 'pointercancel']) {
  ui.carte.addEventListener(fin, (e) => {
    if (!glissement || e.pointerId !== glissement.id) return;
    glissement = null;
    ui.carte.classList.remove('tourne');
  });
}
// Appui puis relâchement sur le même son (et non « click ») : le SVG est redessiné au survol et
// à chaque image d'animation, et un clic dont l'élément est remplacé entre les deux est perdu.
let appui = null;
ui.carte.addEventListener('pointerdown', (e) => {
  appui = e.button === 0 ? pointDe(e) : null;
});
ui.carte.addEventListener('pointerup', (e) => {
  const i = pointDe(e);
  if (i !== null && i === appui) jouer(i);
  appui = null;
});
ui.carte.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const i = pointDe(e);
  if (i === null) return;
  e.preventDefault();
  jouer(i);
});

// À chaque affichage de la diapositive : relire le résultat gardé, puis rejouer le placement.
let etaitVisible = false;
async function surVisibilite() {
  const v = visible();
  if (v && !etaitVisible) {
    etaitVisible = true;
    await chargerClasse();
    afficher({ rejouer: true });
  } else if (!v && etaitVisible) {
    etaitVisible = false;
    cancelAnimationFrame(animation);
    arreter();
  }
}
document.addEventListener('visibilitychange', surVisibilite);
window.addEventListener('resize', surVisibilite);
ajuster(racine, LD, HD);

await chargerClasse();
await afficher();
etaitVisible = visible();

