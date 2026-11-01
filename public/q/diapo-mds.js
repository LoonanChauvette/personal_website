// Diapositive MDS du Cours 7 (élément HTML d'Excalidraw+, document srcdoc, origine « null »).
//
// Carte 2D des sons calculée à partir du résultat gardé de l'écoute des paires
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
// Survoler un point : traits vers les autres sons, avec la dissimilarité jugée.
// Cliquer un point : l'instrument joue (un second clic arrête).
import { apiGarde, COULEURS, svg, txt, nombreEntier } from './commun.js';
import { aligner, mds, pasGuttman, stress } from './mds.js';

const conf = JSON.parse(document.getElementById('config').textContent);
const ID = String(conf.id || 'c7paires');
const URL_SIMULE = String(conf.simule || 'donnees/c7paires-simule.json');

const L = 1000; // repère du SVG
const H = 820;
const MARGE = { g: 70, d: 40, h: 40, b: 70 };
const ROUGE = COULEURS.rouge;

const racine = document.getElementById('mds');
racine.innerHTML = `
  <header class="barre">
    <div class="bascule" role="group" aria-label="Données">
      <button type="button" data-source="classe">Classe</button>
      <button type="button" data-source="simule">Simulé</button>
    </div>
    <span class="stress" id="stress"></span>
  </header>
  <div class="carte" id="carte"></div>
  <footer class="pied">
    <span class="source" id="source"></span>
    <button type="button" id="rejouer" class="discret" title="Repartir de positions au hasard">Recalculer</button>
  </footer>`;

const ui = {
  carte: document.getElementById('carte'),
  stress: document.getElementById('stress'),
  source: document.getElementById('source'),
  rejouer: document.getElementById('rejouer'),
  boutons: [...racine.querySelectorAll('[data-source]')],
};

const donnees = { classe: null, simule: null, erreurClasse: null };
let choix = null; // source choisie à la main (sinon : classe si elle existe)
let vue = null; // { cle, sons, delta, final, echelle } de la source affichée
let animation = 0;
let survol = null;
const audios = new Map();
let enLecture = null;

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

function preparer(g) {
  const res = g.resultats;
  const parCle = new Map((g.gabarit?.sons || []).map((s) => [s.cle, s]));
  const sons = res.sons.map((cle) => ({ cle, ...(parCle.get(cle) || {}) }));
  const delta = res.matrice;
  const { points, stress: s } = mds(delta);
  // Échelle commune aux deux axes (les distances doivent rester comparables).
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const etendue = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1e-9);
  const echelle = Math.min((L - MARGE.g - MARGE.d) / etendue, (H - MARGE.h - MARGE.b) / etendue) * 0.86;
  const centre = [(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2];
  return { g, sons, delta, final: points, stressFinal: s, echelle, centre, etendue };
}

// ─── Tracé ─────────────────────────────────────────────────────────────────
function versEcran(v, p) {
  const cx = MARGE.g + (L - MARGE.g - MARGE.d) / 2;
  const cy = MARGE.h + (H - MARGE.h - MARGE.b) / 2;
  return [cx + (p[0] - v.centre[0]) * v.echelle, cy - (p[1] - v.centre[1]) * v.echelle];
}

function nomDe(son) {
  return son.nom || son.cle;
}

function tracer(v, X) {
  const E = X.map((p) => versEcran(v, p));
  const s = svg('svg', { viewBox: `0 0 ${L} ${H}`, role: 'img', 'aria-label': 'Carte MDS des sons' });
  // Cadre et axes (sans graduation : les dimensions n'ont pas encore de sens).
  s.appendChild(svg('rect', { x: MARGE.g, y: MARGE.h, width: L - MARGE.g - MARGE.d, height: H - MARGE.h - MARGE.b, fill: 'none', stroke: COULEURS.filet, 'stroke-width': 2 }));
  s.appendChild(txt(MARGE.g + (L - MARGE.g - MARGE.d) / 2, H - 22, 'Dimension 1', { taille: 34, ancre: 'middle', couleur: '#6b7078' }));
  const d2 = txt(0, 0, 'Dimension 2', { taille: 34, ancre: 'middle', couleur: '#6b7078' });
  d2.setAttribute('transform', `translate(${MARGE.g - 24} ${MARGE.h + (H - MARGE.h - MARGE.b) / 2}) rotate(-90)`);
  s.appendChild(d2);

  // Survol : traits vers les autres sons (dessinés sous les points, chiffres au-dessus).
  const chiffres = [];
  if (survol !== null) {
    const i = survol;
    v.sons.forEach((_, j) => {
      if (j === i) return;
      const dij = v.delta[i][j];
      const [x1, y1] = E[i];
      const [x2, y2] = E[j];
      s.appendChild(svg('line', { x1, y1, x2, y2, stroke: '#2f6fd6', 'stroke-width': 4, 'stroke-dasharray': '12 9', opacity: 0.85 }));
      const [mx, my] = [x1 + 0.6 * (x2 - x1), y1 + 0.6 * (y2 - y1)];
      const etiquette = dij === null || dij === undefined ? '—' : String(Math.round(dij));
      const largeur = 22 * etiquette.length + 18;
      chiffres.push(svg('g', { class: 'chiffre' }, [
        svg('rect', { x: mx - largeur / 2, y: my - 22, width: largeur, height: 44, rx: 10, fill: '#ffffff', stroke: '#2f6fd6', 'stroke-width': 3 }),
        txt(mx, my + 11, etiquette, { taille: 32, ancre: 'middle', graisse: 700, couleur: COULEURS.marine }),
      ]));
    });
  }

  v.sons.forEach((son, i) => {
    const [x, y] = E[i];
    const g = svg('g', { class: `point${enLecture === i ? ' joue' : ''}${survol === i ? ' survol' : ''}`, 'data-i': i, tabindex: 0, role: 'button', 'aria-label': `${nomDe(son)} : écouter` });
    g.appendChild(svg('circle', { cx: x, cy: y, r: 44, fill: 'transparent' })); // zone de clic
    g.appendChild(svg('circle', { class: 'disque', cx: x, cy: y, r: 17, fill: COULEURS.marine }));
    const hautOk = y - 34 > MARGE.h + 30;
    const t = txt(x, hautOk ? y - 32 : y + 58, nomDe(son), { taille: 36, ancre: 'middle', graisse: 600 });
    t.setAttribute('paint-order', 'stroke');
    t.setAttribute('stroke', '#ffffff');
    t.setAttribute('stroke-width', 8);
    g.appendChild(t);
    s.appendChild(g);
  });
  chiffres.forEach((c) => s.appendChild(c));
  ui.carte.replaceChildren(s);
}

function formaterStress(v) {
  return v.toLocaleString('fr-CA', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function majTexte(v, s) {
  ui.stress.textContent = `Stress = ${formaterStress(s)}`;
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
  ui.carte.innerHTML = `<p class="message">${texte}</p>`;
  ui.stress.textContent = '';
  ui.source.textContent = '';
}

// Les points partent au hasard (dans l'étendue de la solution) et descendent le stress.
// Chaque image est alignée (Procrustes) sur la solution finale : seule la forme bouge.
function animer(v) {
  cancelAnimationFrame(animation);
  const n = v.sons.length;
  let X = Array.from({ length: n }, () => [(Math.random() - 0.5) * v.etendue, (Math.random() - 0.5) * v.etendue]);
  let images = 0;
  let precedent = Infinity;
  const pas = () => {
    if (vue !== v) return;
    const Y = pasGuttman(X, v.delta);
    X = X.map((p, i) => p.map((c, k) => c + 0.2 * (Y[i][k] - c)));
    const s = stress(X, v.delta);
    const A = aligner(X, v.final);
    v.courant = A;
    tracer(v, A);
    majTexte(v, s);
    images += 1;
    if (images < 180 && (images < 30 || precedent - s > 1e-5)) {
      precedent = s;
      animation = requestAnimationFrame(pas);
    } else if (s > v.stressFinal + 1e-3) {
      glisser(v, A); // départ tombé dans un minimum local : rejoindre la meilleure solution
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
    v.courant = X;
    tracer(v, X);
    majTexte(v, stress(X, v.delta));
    if (t < 1) animation = requestAnimationFrame(pas);
  };
  animation = requestAnimationFrame(pas);
}

async function afficher({ rejouer = false } = {}) {
  const src = source();
  ui.boutons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.source === src)));
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
    if (!rejouer && vue && vue.cleSource === cle) return;
    const v = preparer(g);
    v.cleSource = cle;
    vue = v;
    survol = null;
    if (visible()) animer(v);
    else {
      v.courant = v.final;
      tracer(v, v.final);
      majTexte(v, v.stressFinal);
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
      if (vue) tracer(vue, vue.courant || vue.final);
    };
    a.play().catch(() => {
      enLecture = null;
      if (vue) tracer(vue, vue.courant || vue.final);
    });
  }
  tracer(vue, vue.courant || vue.final);
}

// ─── Événements ────────────────────────────────────────────────────────────
function pointDe(e) {
  const g = e.target.closest && e.target.closest('.point');
  return g ? Number(g.dataset.i) : null;
}

ui.carte.addEventListener('pointerover', (e) => {
  const i = pointDe(e);
  if (i === null || i === survol || !vue) return;
  survol = i;
  tracer(vue, vue.courant || vue.final);
});
ui.carte.addEventListener('pointerleave', () => {
  if (survol === null || !vue) return;
  survol = null;
  tracer(vue, vue.courant || vue.final);
});
ui.carte.addEventListener('pointerout', (e) => {
  if (!vue || survol === null) return;
  const vers = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.point');
  if (vers) return;
  survol = null;
  tracer(vue, vue.courant || vue.final);
});
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
