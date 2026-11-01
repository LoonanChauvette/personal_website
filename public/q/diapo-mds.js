// Diapositive MDS du Cours 7 (élément HTML d'Excalidraw+, document srcdoc, origine « null »).
//
// Carte des sons calculée à partir du résultat gardé de l'écoute des paires
// (op=garde&id=c7paires, lisible sans clé) : les points partent au hasard puis se placent
// (itérations SMACOF) pour que leurs distances respectent les dissimilarités jugées.
//
// Document hôte (tools/questions_cours7.py) :
//   <base href="https://SITE/q/">
//   <script type="application/json" id="config">{"id": "c7paires", "simule": "donnees/…json"}</script>
//   <main id="mds"></main>
//
// Bascule Classe / Simulé : « Simulé » affiche un jeu fixe (tools/donnees_mds_simulees.mjs),
// toujours disponible. Sans résultat de la classe, la diapositive part sur « Simulé ».
// Bascule 1D / 2D / 3D : nombre de dimensions de la carte (le stress de chacune s'affiche).
//   1D : points sur une droite, arcs au survol ; 3D : vue en perspective, glisser pour tourner.
// Survoler un point : traits vers les autres sons, avec la dissimilarité jugée.
// Cliquer un point : l'instrument joue (un second clic arrête).
import { apiGarde, COULEURS, svg, txt, nombreEntier } from './commun.js';
import { aligner, mds, pasGuttman, stress } from './mds.js';

const conf = JSON.parse(document.getElementById('config').textContent);
const ID = String(conf.id || 'c7paires');
const URL_SIMULE = String(conf.simule || 'donnees/c7paires-simule.json');

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
      <button type="button" data-source="simule">Simulé</button>
    </div>
    <div class="bascule" role="group" aria-label="Nombre de dimensions">
      <button type="button" data-dim="1">1D</button>
      <button type="button" data-dim="2">2D</button>
      <button type="button" data-dim="3">3D</button>
    </div>
  </header>
  <div class="carte" id="carte"></div>
  <footer class="pied">
    <span class="source" id="source"></span>
    <button type="button" id="rejouer" class="discret" title="Repartir de positions au hasard">Recalculer</button>
  </footer>`;

const ui = {
  carte: document.getElementById('carte'),
  source: document.getElementById('source'),
  rejouer: document.getElementById('rejouer'),
  boutons: [...racine.querySelectorAll('[data-source]')],
  dims: [...racine.querySelectorAll('[data-dim]')],
};

const donnees = { classe: null, simule: null, erreurClasse: null };
let choix = null; // source choisie à la main (sinon : classe si elle existe)
let dim = 2;
let vue = null; // source et solution affichées (voir preparer)
const solutions = new Map(); // `${cleSource}|${dim}` → { points, stress } (la 3D coûte ~0,3 s)
let animation = 0;
let survol = null;
const audios = new Map();
let enLecture = null;
const angle = { lacet: -0.6, tangage: 0.35 }; // vue 3D
let glissement = null; // rotation à la souris en cours
let rotationAuto = true; // la 3D tourne d'elle-même jusqu'au premier glissement

function visible() {
  return !document.hidden && window.innerWidth > 0 && window.innerHeight > 0;
}

function source() {
  if (choix) return choix;
  return donnees.classe ? 'classe' : 'simule';
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

async function chargerSimule() {
  if (donnees.simule) return;
  const r = await fetch(URL_SIMULE, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`Données simulées introuvables (${r.status})`);
  donnees.simule = await r.json();
}

function preparer(g, cleSource) {
  const res = g.resultats;
  const parCle = new Map((g.gabarit?.sons || []).map((s) => [s.cle, s]));
  const sons = res.sons.map((cle) => ({ cle, ...(parCle.get(cle) || {}) }));
  const delta = res.matrice;
  const cle = `${cleSource}|${dim}`;
  if (!solutions.has(cle)) solutions.set(cle, mds(delta, { dim }));
  const { points, stress: s } = solutions.get(cle);
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
    // 3D : rayon autour du centre, constant pendant la rotation.
    v.rayon = Math.max(...points.map((p) => Math.hypot(...p.map((c, k) => c - v.centre[k]))), 1e-9);
    v.echelle = (Math.min(largeur, hauteur) / 2 / v.rayon) * 0.95;
  }
  return v;
}

// ─── Tracé ─────────────────────────────────────────────────────────────────
// Position à l'écran [x, y, profondeur] (profondeur > 0 : vers le spectateur, 3D seulement).
function versEcran(v, p) {
  if (v.dim === 1) return [CENTRE[0] + (p[0] - v.centre[0]) * v.echelle, LIGNE_1D, 0];
  if (v.dim === 2) return [CENTRE[0] + (p[0] - v.centre[0]) * v.echelle, CENTRE[1] - (p[1] - v.centre[1]) * v.echelle, 0];
  const [x, y, z] = p.map((c, k) => c - v.centre[k]);
  const [ca, sa, cb, sb] = [Math.cos(angle.lacet), Math.sin(angle.lacet), Math.cos(angle.tangage), Math.sin(angle.tangage)];
  const x1 = x * ca + z * sa;
  const z1 = -x * sa + z * ca;
  const y2 = y * cb - z1 * sb;
  const z2 = y * sb + z1 * cb;
  return [CENTRE[0] + x1 * v.echelle, CENTRE[1] - y2 * v.echelle, z2 / v.rayon];
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
    // Trois axes depuis le centre (sans graduation : les dimensions n'ont pas encore de sens).
    const o = versEcran(v, v.centre);
    for (let k = 0; k < 3; k += 1) {
      const bout = v.centre.map((c, j) => c + (j === k ? v.rayon * 1.1 : 0));
      const moins = v.centre.map((c, j) => c - (j === k ? v.rayon * 1.1 : 0));
      const [x2, y2] = versEcran(v, bout);
      const [x1, y1] = versEcran(v, moins);
      s.appendChild(svg('line', { x1, y1, x2, y2, stroke: COULEURS.filet, 'stroke-width': 3 }));
      const dx = x2 - o[0];
      const dy = y2 - o[1];
      const n = Math.hypot(dx, dy) || 1;
      s.appendChild(txt(x2 + (dx / n) * 34, y2 + (dy / n) * 34 + 11, `D${k + 1}`, { ...gris, graisse: 600 }));
    }
    s.appendChild(txt(ZONE.x0, H - 22, 'Glisser pour tourner', { taille: 28, couleur: GRIS }));
  }
}

// 3D : tige de chaque point jusqu'au plan D1–D3 (relief lisible sur une image fixe).
function tiges(s, v, X) {
  X.forEach((p) => {
    const [x1, y1] = versEcran(v, p);
    const [x2, y2] = versEcran(v, [p[0], v.centre[1], p[2]]);
    s.appendChild(svg('line', { x1, y1, x2, y2, stroke: '#adb5bd', 'stroke-width': 2.5, 'stroke-dasharray': '6 6' }));
    s.appendChild(svg('ellipse', { cx: x2, cy: y2, rx: 9, ry: 9 * Math.abs(Math.sin(angle.tangage)) + 1.5, fill: '#adb5bd' }));
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
  const chiffres = [];
  if (survol !== null) {
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
  if (v.dim === 1) [...E.keys()].sort((a, b) => E[a][0] - E[b][0]).forEach((i, k) => rang1D.set(i, k % 2));
  // 3D : du plus loin au plus proche (les plus proches recouvrent).
  const ordre = [...E.keys()].sort((a, b) => E[a][2] - E[b][2]);
  for (const i of ordre) {
    const son = v.sons[i];
    const [x, y, z] = E[i];
    const g = svg('g', { class: `point${enLecture === i ? ' joue' : ''}${survol === i ? ' survol' : ''}`, 'data-i': i, tabindex: 0, role: 'button', 'aria-label': `${nomDe(son)} : écouter` });
    const r = v.dim === 3 ? 17 * (1 + 0.3 * z) : 17;
    g.appendChild(svg('circle', { cx: x, cy: y, r: 44, fill: 'transparent' })); // zone de clic
    g.appendChild(svg('circle', { class: 'disque', cx: x, cy: y, r, fill: COULEURS.marine, 'fill-opacity': v.dim === 3 ? 0.6 + 0.4 * (z + 1) / 2 : 1 }));
    let ty;
    if (v.dim === 1) ty = y + 56 + 42 * rang1D.get(i);
    else ty = y - 34 > ZONE.y0 + 30 ? y - r - 15 : y + r + 41;
    g.appendChild(etiquetteBlanche(txt(x, ty, nomDe(son), { taille: 36, ancre: 'middle', graisse: 600 })));
    s.appendChild(g);
  }
  chiffres.forEach((c) => s.appendChild(c));
  ui.carte.replaceChildren(s);
}

function redessiner() {
  if (vue) tracer(vue, vue.courant || vue.final);
}

function formaterStress(v) {
  return v.toLocaleString('fr-CA', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function majTexte(v) {
  const res = v.g.resultats;
  const simule = source() === 'simule';
  const n = res.n || 0;
  const dont = res.simulees || 0;
  ui.source.classList.toggle('simulee', simule || dont > 0);
  if (simule) ui.source.textContent = `Simulé : ${nombreEntier(n)} participants fictifs`;
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
  if (v.dim === 3 && rotationAuto && !glissement) angle.lacet += 0.012;
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

// 3D : la vue continue de tourner un moment après le placement (relief), puis s'arrête.
function tourner(v) {
  v.stressCourant = v.stressFinal;
  if (v.dim !== 3) return redessiner();
  let k = 0;
  const pas = () => {
    if (vue !== v || !rotationAuto || glissement) return;
    k += 1;
    angle.lacet += 0.012 * Math.max(0, 1 - k / 150);
    tracer(v, v.final);
    if (k < 150) animation = requestAnimationFrame(pas);
  };
  animation = requestAnimationFrame(pas);
}

async function afficher({ rejouer = false } = {}) {
  const src = source();
  ui.boutons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.source === src)));
  ui.dims.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.dim) === dim)));
  let g;
  try {
    if (src === 'simule') {
      await chargerSimule();
      g = donnees.simule;
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
  redessiner();
});
ui.carte.addEventListener('pointerleave', () => {
  if (survol === null || !vue) return;
  survol = null;
  redessiner();
});
ui.carte.addEventListener('pointerout', (e) => {
  if (!vue || survol === null) return;
  const vers = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.point');
  if (vers) return;
  survol = null;
  redessiner();
});
// 3D : glisser hors des points fait tourner la vue (la conteneur garde la capture,
// le SVG étant redessiné à chaque image).
ui.carte.addEventListener('pointerdown', (e) => {
  if (!vue || vue.dim !== 3 || pointDe(e) !== null) return;
  glissement = { x: e.clientX, y: e.clientY, id: e.pointerId };
  rotationAuto = false;
  survol = null;
  ui.carte.setPointerCapture(e.pointerId);
  ui.carte.classList.add('tourne');
});
ui.carte.addEventListener('pointermove', (e) => {
  if (!glissement || e.pointerId !== glissement.id) return;
  const pleine = ui.carte.clientWidth || 1;
  angle.lacet += ((e.clientX - glissement.x) / pleine) * Math.PI;
  angle.tangage = Math.max(-1.45, Math.min(1.45, angle.tangage + ((e.clientY - glissement.y) / pleine) * Math.PI));
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
ui.carte.addEventListener('click', (e) => {
  const i = pointDe(e);
  if (i !== null) jouer(i);
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
