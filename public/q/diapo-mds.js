// Diapositive MDS du Cours 7 (élément HTML d'Excalidraw+, document srcdoc, origine « null »).
//
// Carte des sons calculée à partir du résultat gardé de l'écoute des paires
// (op=garde&id=c7paires, lisible sans clé) : les points partent au hasard puis se placent
// (itérations SMACOF) pour que leurs distances respectent les dissimilarités jugées.
//
// Document hôte (tools/questions_cours7.py) :
//   <base href="https://SITE/q/">
//   <script type="application/json" id="config">{"id": "c7paires", "reference": "donnees/…json",
//     "sous_ensemble": ["tpt", …]}</script>
//   <main id="mds"></main>
//
// Bascule Classe / McAdams 1995 : « McAdams 1995 » affiche la matrice de dissimilarité de
// McAdams et al. (1995), 18 timbres de synthèse (tools/donnees_reference.mjs), toujours
// disponible. Sans résultat de la classe, la diapositive part sur ces données.
// « sous_ensemble » : les timbres de McAdams entendus par la classe, dans l'ordre de ses sons
// (tools/cours7_paires.json). McAdams montre alors ces seuls timbres (sous-matrice publiée),
// tournés sur la carte de la classe quand elle porte les mêmes sons ; « 18 sons » : tout le jeu.
// Bascule 1D / 2D / 3D : nombre de dimensions de la carte (le stress de chacune s'affiche).
//   1D : points sur une droite, arcs au survol ; 3D : points dans une boîte (comme les figures
//   d'espaces timbraux), glisser pour tourner.
//   3D, « Vertical : D1 / D2 / D3 » : la vue tourne pour mettre cet axe à la verticale ; les
//   tiges descendent le long de cet axe jusqu'au fond de la boîte (la coordonnée se lit à la
//   longueur de la tige).
// Survoler un point : traits vers les autres sons, avec la dissimilarité jugée (au-delà de
// 8 sons : nom complet seulement, les points sont étiquetés par leur abréviation).
// Cliquer un point : l'instrument joue (un second clic arrête), si le son est fourni.
import { apiGarde, COULEURS, svg, txt, nombreEntier } from './commun.js';
import { aligner, mds, pasGuttman, stress } from './mds.js';

const conf = JSON.parse(document.getElementById('config').textContent);
const ID = String(conf.id || 'c7paires');
// La clé « simule » des premières versions de la diapositive est ignorée (fichier retiré).
const URL_REFERENCE = String(conf.reference || 'donnees/mcadams1995.json');
const SOUS = Array.isArray(conf.sous_ensemble) ? conf.sous_ensemble.map(String) : [];
const BEAUCOUP = 8; // au-delà : abréviations, pas de traits au survol

const L = 1000; // repère du SVG
const H = 820;
const MARGE = { g: 70, d: 40, h: 64, b: 70 };
const ZONE = { x0: MARGE.g, x1: L - MARGE.d, y0: MARGE.h, y1: H - MARGE.b };
const CENTRE = [(ZONE.x0 + ZONE.x1) / 2, (ZONE.y0 + ZONE.y1) / 2];
const GRIS = '#6b7078';
const BLEU = '#2f6fd6';
const LIGNE_1D = ZONE.y0 + (ZONE.y1 - ZONE.y0) * 0.62; // arcs au-dessus, noms au-dessous

const racine = document.getElementById('mds');
racine.innerHTML = `
  <header class="barre">
    <div class="bascule" role="group" aria-label="Données">
      <button type="button" data-source="classe">Classe</button>
      <button type="button" data-source="reference" title="McAdams et al. (1995), timbres de synthèse">McAdams</button>
    </div>
    <div class="bascule" role="group" aria-label="Nombre de dimensions">
      <button type="button" data-dim="1">1D</button>
      <button type="button" data-dim="2">2D</button>
      <button type="button" data-dim="3">3D</button>
    </div>
  </header>
  <div class="zone">
    <div class="carte" id="carte"></div>
    <div class="axe-vertical" id="axe-vertical" hidden>
      <span>Vertical</span>
      <div class="bascule petite" role="group" aria-label="Axe vertical">
        <button type="button" data-axe="0">D1</button>
        <button type="button" data-axe="1">D2</button>
        <button type="button" data-axe="2">D3</button>
      </div>
    </div>
  </div>
  <footer class="pied">
    <span class="source" id="source"></span>
    <div class="etendue" id="etendue" hidden>
      <div class="bascule petite" role="group" aria-label="Timbres de McAdams">
        <button type="button" data-tous="0" title="Les timbres entendus en classe">${SOUS.length}</button>
        <button type="button" data-tous="1" title="Les 18 timbres de l'article">18</button>
      </div>
      <span>timbres</span>
    </div>
    <button type="button" id="rejouer" class="discret" title="Repartir de positions au hasard">Recalculer</button>
  </footer>`;

const ui = {
  carte: document.getElementById('carte'),
  source: document.getElementById('source'),
  rejouer: document.getElementById('rejouer'),
  boutons: [...racine.querySelectorAll('[data-source]')],
  dims: [...racine.querySelectorAll('[data-dim]')],
  axeVertical: document.getElementById('axe-vertical'),
  axes: [...racine.querySelectorAll('[data-axe]')],
  etendue: document.getElementById('etendue'),
  tous: [...racine.querySelectorAll('[data-tous]')],
};

const donnees = { classe: null, reference: null, erreurClasse: null };
let choix = null; // source choisie à la main (sinon : classe si elle existe)
let dim = 2;
let tous = !SOUS.length; // McAdams : les 18 timbres, ou ceux entendus en classe
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
  return produit(rotX(0.35), produit(rotY(-0.6), MISE_DEBOUT[k]));
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

let axeVertical = 1; // D2 à la verticale par défaut
let rotation = vueCible(axeVertical);
let virage = 0; // animation du changement d'axe vertical
let glissement = null; // rotation à la souris en cours
let rotationAuto = true; // la 3D tourne d'elle-même jusqu'au premier glissement

function visible() {
  return !document.hidden && window.innerWidth > 0 && window.innerHeight > 0;
}

function source() {
  if (choix) return choix;
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
  const v = { g, cleSource, dim, sons, delta, final: points, stressFinal: s };
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
    // 3D : boîte autour des points ; sa demi-diagonale tient dans le cadre quelle que soit la rotation.
    const marge = 0.08 * v.etendue;
    v.boite = etendues.map(([a, b]) => [a - marge, b + marge]);
    v.rayon = 0.5 * Math.hypot(...v.boite.map(([a, b]) => b - a));
    v.echelle = (Math.min(largeur, hauteur) / 2 / v.rayon) * 1.12; // coins hors cadre seulement aux angles extrêmes
  }
  return v;
}

// ─── Tracé ─────────────────────────────────────────────────────────────────
// Position à l'écran [x, y, profondeur] (profondeur > 0 : vers le spectateur, 3D seulement).
function versEcran(v, p) {
  if (v.dim === 1) return [CENTRE[0] + (p[0] - v.centre[0]) * v.echelle, LIGNE_1D, 0];
  if (v.dim === 2) return [CENTRE[0] + (p[0] - v.centre[0]) * v.echelle, CENTRE[1] - (p[1] - v.centre[1]) * v.echelle, 0];
  const d = p.map((c, k) => c - v.centre[k]);
  const [x, y, z] = rotation.map((l) => l.reduce((s, r, k) => s + r * d[k], 0));
  return [CENTRE[0] + x * v.echelle, CENTRE[1] - y * v.echelle, z / v.rayon];
}

function nomDe(son) {
  return son.nom || son.cle;
}

function etiquetteBlanche(t) {
  t.setAttribute('paint-order', 'stroke');
  t.setAttribute('stroke', '#ffffff');
  t.setAttribute('stroke-width', 8);
  return t;
}

function pastille(x, y, etiquette) {
  const largeur = 22 * etiquette.length + 18;
  return svg('g', { class: 'chiffre' }, [
    svg('rect', { x: x - largeur / 2, y: y - 22, width: largeur, height: 44, rx: 10, fill: '#ffffff', stroke: BLEU, 'stroke-width': 3 }),
    txt(x, y + 11, etiquette, { taille: 32, ancre: 'middle', graisse: 700, couleur: COULEURS.marine }),
  ]);
}

function axes(s, v) {
  const gris = { taille: 32, ancre: 'middle', couleur: GRIS };
  if (v.dim === 2) {
    s.appendChild(svg('rect', { x: ZONE.x0, y: ZONE.y0, width: ZONE.x1 - ZONE.x0, height: ZONE.y1 - ZONE.y0, fill: 'none', stroke: COULEURS.filet, 'stroke-width': 2 }));
    s.appendChild(txt(CENTRE[0], H - 22, 'Dimension 1', gris));
    const d2 = txt(0, 0, 'Dimension 2', gris);
    d2.setAttribute('transform', `translate(${ZONE.x0 - 24} ${CENTRE[1]}) rotate(-90)`);
    s.appendChild(d2);
  } else if (v.dim === 1) {
    s.appendChild(svg('line', { x1: ZONE.x0, y1: LIGNE_1D, x2: ZONE.x1, y2: LIGNE_1D, stroke: COULEURS.filet, 'stroke-width': 3 }));
    s.appendChild(txt(CENTRE[0], H - 22, 'Dimension 1', gris));
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
    s.appendChild(svg('polygon', { points: sol.map(([x, y]) => `${x},${y}`).join(' '), fill: '#e7f0fb', 'fill-opacity': 0.6, stroke: 'none' }));
    const arete = (b1, b2, attrs) => {
      const [A, B] = [coin(b1), coin(b2)];
      s.appendChild(svg('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: '#adb5bd', 'stroke-width': 2.5, ...attrs }));
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
    const nommer = ([A, B], j) => {
      const actif = j === k;
      s.appendChild(svg('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: actif ? COULEURS.marine : '#495057', 'stroke-width': 4.5, 'stroke-linecap': 'round' }));
      const [mx, my] = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
      let angle = (Math.atan2(B[1] - A[1], B[0] - A[0]) * 180) / Math.PI;
      if (angle > 90) angle -= 180;
      if (angle <= -90) angle += 180;
      // Décalage perpendiculaire à l'arête, du côté opposé au centre de la boîte.
      const c = versEcran(v, v.centre);
      const lg = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
      let [nx, ny] = [-(B[1] - A[1]) / lg, (B[0] - A[0]) / lg];
      if (nx * (mx - c[0]) + ny * (my - c[1]) < 0) [nx, ny] = [-nx, -ny];
      const t = txt(0, 0, `Dimension ${j + 1}`, { taille: 30, ancre: 'middle', graisse: 700, couleur: actif ? COULEURS.marine : '#495057' });
      t.setAttribute('transform', `translate(${mx + nx * 30} ${my + ny * 30}) rotate(${angle}) translate(0 10)`);
      s.appendChild(etiquetteBlanche(t));
    };
    nommer(arete(bitsDe([[a, 1 - fa], [b, 0], [k, 0]]), bitsDe([[a, 1 - fa], [b, 1], [k, 0]])), b);
    nommer(arete(bitsDe([[b, 1 - fb], [a, 0], [k, 0]]), bitsDe([[b, 1 - fb], [a, 1], [k, 0]])), a);
    const exterieures = [bitsDe([[a, fa], [b, 1 - fb]]), bitsDe([[a, 1 - fa], [b, fb]])].map((bits) => {
      const haut = [...bits];
      haut[k] = 1;
      return [coin(bits), coin(haut)];
    });
    nommer(exterieures[0][0][0] < exterieures[1][0][0] ? exterieures[0] : exterieures[1], k);
    s.appendChild(txt(ZONE.x1, H - 22, 'Glisser pour tourner', { taille: 28, ancre: 'end', couleur: GRIS }));
  }
}

// 3D : tige de chaque point jusqu'au fond de la boîte, le long de l'axe vertical choisi :
// la longueur de la tige est la coordonnée sur cet axe.
function tiges(s, v, X) {
  const k = axeVertical;
  const [a, b] = [0, 1, 2].filter((j) => j !== k);
  const pas = v.rayon * 0.025; // ombre : petit disque sur le fond
  X.forEach((p) => {
    const pied = p.map((c, j) => (j === k ? v.boite[k][0] : c));
    const [x1, y1] = versEcran(v, p);
    const [x2, y2] = versEcran(v, pied);
    s.appendChild(svg('line', { x1, y1, x2, y2, stroke: '#868e96', 'stroke-width': 2.5, 'stroke-dasharray': '6 6' }));
    const ombre = Array.from({ length: 12 }, (_, m) => {
      const t = (m / 12) * 2 * Math.PI;
      return versEcran(v, pied.map((c, j) => c + (j === a ? pas * Math.cos(t) : 0) + (j === b ? pas * Math.sin(t) : 0)));
    }).map(([x, y]) => `${x},${y}`).join(' ');
    s.appendChild(svg('polygon', { points: ombre, fill: '#868e96' }));
  });
}

function tracer(v, X) {
  const E = X.map((p) => versEcran(v, p));
  const s = svg('svg', { viewBox: `0 0 ${L} ${H}`, role: 'img', 'aria-label': `Carte MDS des sons en ${v.dim} dimension${v.dim > 1 ? 's' : ''}` });
  axes(s, v);
  if (v.dim === 3) tiges(s, v, X);
  const st = txt(ZONE.x1, 44, `Stress = ${formaterStress(v.stressCourant ?? v.stressFinal)}`, { taille: 34, ancre: 'end', couleur: GRIS });
  st.setAttribute('class', 'stress');
  s.appendChild(st);

  // Survol : traits (arcs en 1D) vers les autres sons, sous les points ; chiffres au-dessus.
  // Beaucoup de sons : nom complet du son survolé en haut à gauche, sans traits.
  const nombreux = v.sons.length > BEAUCOUP;
  const chiffres = [];
  if (survol !== null && nombreux) {
    const son = v.sons[survol];
    s.appendChild(etiquetteBlanche(txt(ZONE.x0 - 50, 44, son.abrege && son.nom ? `${son.abrege} : ${son.nom}` : nomDe(son),
      { taille: 30, graisse: 700, couleur: COULEURS.marine })));
  } else if (survol !== null) {
    const i = survol;
    v.sons.forEach((_, j) => {
      if (j === i) return;
      const dij = v.delta[i][j];
      const etiquette = dij === null || dij === undefined ? '—' : String(Math.round(dij));
      const [x1, y1] = E[i];
      const [x2, y2] = E[j];
      const trait = { fill: 'none', stroke: BLEU, 'stroke-width': 4, 'stroke-dasharray': '12 9', opacity: 0.85 };
      if (v.dim === 1) {
        const h = Math.min(Math.abs(x2 - x1) * 0.9, (LIGNE_1D - ZONE.y0) * 1.8);
        s.appendChild(svg('path', { ...trait, d: `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1 - h} ${x2} ${y2}` }));
        chiffres.push(pastille((x1 + x2) / 2, y1 - h / 2, etiquette));
      } else {
        s.appendChild(svg('line', { ...trait, x1, y1, x2, y2 }));
        chiffres.push(pastille(x1 + 0.6 * (x2 - x1), y1 + 0.6 * (y2 - y1), etiquette));
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
    const g = svg('g', {
      class: `point${enLecture === i ? ' joue' : ''}${survol === i ? ' survol' : ''}${son.fichier ? '' : ' muet'}`,
      'data-i': i, tabindex: 0, role: son.fichier ? 'button' : 'img', 'aria-label': son.fichier ? `${nomDe(son)} : écouter` : nomDe(son),
    });
    const r0 = nombreux ? 13 : 17;
    const r = v.dim === 3 ? r0 * (1 + 0.3 * z) : r0;
    g.appendChild(svg('circle', { cx: x, cy: y, r: 44, fill: 'transparent' })); // zone de clic
    g.appendChild(svg('circle', { class: 'disque', cx: x, cy: y, r, fill: COULEURS.marine, 'fill-opacity': v.dim === 3 ? 0.6 + 0.4 * (z + 1) / 2 : 1 }));
    let ty;
    if (v.dim === 1) ty = y + 56 + (nombreux ? 36 : 42) * rang1D.get(i);
    else ty = y - 34 > ZONE.y0 + 30 ? y - r - 15 : y + r + 41;
    const nom = nombreux ? son.abrege || son.cle : nomDe(son);
    g.appendChild(etiquetteBlanche(txt(x, ty, nom, { taille: nombreux ? 30 : 36, ancre: 'middle', graisse: 600 })));
    s.appendChild(g);
  }
  chiffres.forEach((c) => s.appendChild(c));
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
  return v.toLocaleString('fr-CA', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function majTexte(v) {
  const res = v.g.resultats;
  const n = res.n || 0;
  const dont = res.simulees || 0;
  ui.source.classList.toggle('simulee', source() === 'classe' && dont > 0);
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
  ui.axes.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.axe) === k)));
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
  ui.boutons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.source === src)));
  ui.dims.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.dim) === dim)));
  ui.axes.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.axe) === axeVertical)));
  ui.axeVertical.hidden = dim !== 3;
  ui.etendue.hidden = src !== 'reference' || !SOUS.length;
  ui.tous.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.tous === '1') === tous)));
  let g;
  try {
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
  const pleine = ui.carte.clientWidth || 1;
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
ui.boutons.forEach((b) => b.addEventListener('click', () => {
  choix = b.dataset.source;
  afficher({ rejouer: true });
}));
ui.dims.forEach((b) => b.addEventListener('click', () => {
  dim = Number(b.dataset.dim);
  afficher({ rejouer: true });
}));
ui.axes.forEach((b) => b.addEventListener('click', () => virer(Number(b.dataset.axe))));
ui.tous.forEach((b) => b.addEventListener('click', () => {
  tous = b.dataset.tous === '1';
  afficher({ rejouer: true });
}));
ui.rejouer.addEventListener('click', () => afficher({ rejouer: true }));

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

await chargerClasse();
await afficher();
etaitVisible = visible();
