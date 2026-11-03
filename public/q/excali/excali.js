// Commandes et formes dessinées (style Excalidraw) pour les éléments HTML des diapositives.
// Port des outils de teaching-demos (shared/pitch/kit.js, commit 3d85b29) : mêmes boutons,
// mêmes graines, même rendu que les démos. Demande rough.js (global « rough ») chargé avant.
// Ne jamais appeler preventDefault sur ← → (navigation des diapositives Excalidraw).
const SVGNS = 'http://www.w3.org/2000/svg';

export function S(tag, attrs = {}, parent = null) {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

export function H(tag, cls, texte, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (texte !== undefined && texte !== null) e.textContent = texte;
  if (parent) parent.appendChild(e);
  return e;
}

export function placer(e, x, y, l = null) {
  e.style.left = x + 'px';
  e.style.top = y + 'px';
  if (l !== null) e.style.width = l + 'px';
  return e;
}

export function T(parent, x, y, texte, cls = 'graduation', ancre = 'middle', extra = {}) {
  const t = S('text', { x, y, class: cls, 'text-anchor': ancre, ...extra }, parent);
  t.textContent = texte;
  return t;
}

export function chemin(points) {
  let d = '';
  for (let i = 0; i < points.length; i++) d += (i ? 'L' : 'M') + points[i][0].toFixed(2) + ' ' + points[i][1].toFixed(2);
  return d;
}

/** Échelle linéaire (ou log) d → r, avec .inverse. */
export function echelle(d0, d1, r0, r1, log = false) {
  const f = log ? Math.log : (v) => v;
  const a = f(d0), b = f(d1);
  const s = (v) => r0 + ((f(v) - a) / (b - a)) * (r1 - r0);
  s.inverse = (p) => { const v = a + ((p - r0) / (r1 - r0)) * (b - a); return log ? Math.exp(v) : v; };
  s.d0 = d0; s.d1 = d1; s.r0 = r0; s.r1 = r1;
  return s;
}

/** Axes « données » : noirs 1 px, graduations de 4 px vers l'extérieur, ni grille ni cadre. */
export function axes(g, { x, y, ticksX = [], ticksY = [], titreX, titreY, formatX = String, formatY = String }) {
  const bas = Math.max(y.r0, y.r1), gauche = Math.min(x.r0, x.r1);
  S('line', { x1: x.r0, x2: x.r1, y1: bas, y2: bas, class: 'trait' }, g);
  for (const v of ticksX) {
    const px = x(v);
    S('line', { x1: px, x2: px, y1: bas, y2: bas + 4, class: 'trait' }, g);
    T(g, px, bas + 17, formatX(v));
  }
  if (titreX) T(g, (x.r0 + x.r1) / 2, bas + 35, titreX, 'titre-axe');
  S('line', { x1: gauche, x2: gauche, y1: y.r0, y2: y.r1, class: 'trait' }, g);
  for (const v of ticksY) {
    const py = y(v);
    S('line', { x1: gauche - 4, x2: gauche, y1: py, y2: py, class: 'trait' }, g);
    T(g, gauche - 7, py + 4, formatY(v), 'graduation', 'end');
  }
  if (titreY) {
    const large = Math.max(1, ...ticksY.map((v) => String(formatY(v)).length));
    const dx = gauche - 8 - large * 7 - 12;
    T(g, dx, (y.r0 + y.r1) / 2, titreY, 'titre-axe', 'middle', { transform: `rotate(-90 ${dx} ${(y.r0 + y.r1) / 2})` });
  }
}

// ─── rough.js ──────────────────────────────────────────────────────────────
const RG = window.rough.generator();
const RC = window.rough.svg(document.createElementNS(SVGNS, 'svg'));
/** Graine stable : une même forme garde le même tracé d'une image à l'autre. */
export function graine(s) {
  let h = 2166136261;
  for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 2147483646) + 1;
}
const STYLE_ROUGH = { roughness: 1, bowing: 1, stroke: '#1e1e1e', strokeWidth: 1.3, fillStyle: 'hachure', hachureGap: 5, fillWeight: 0.9, hachureAngle: -41, preserveVertices: true };

/** Forme rough.js : rectangle | line | ellipse | circle | polygon | linearPath | path. */
export function R(forme, parent, args, opts = {}) {
  const { cle, ...o } = opts;
  const d = RG[forme](...args, { ...STYLE_ROUGH, ...o, seed: graine(cle ?? forme + JSON.stringify(args)) });
  const g = RC.draw(d);
  if (parent) parent.appendChild(g);
  return g;
}

// ─── Commandes ─────────────────────────────────────────────────────────────
export function icone(type, taille = 12, cle = 'i') {
  const s = S('svg', { class: 'icone', width: taille, height: taille, viewBox: `0 0 ${taille} ${taille}` });
  const opts = { cle: cle + type, fill: '#1e1e1e', fillStyle: 'solid', strokeWidth: 1, roughness: 0.6 };
  if (type === 'jouer') R('polygon', s, [[[1, 0.5], [taille - 0.5, taille / 2], [1, taille - 0.5]]], opts);
  else R('rectangle', s, [1, 1, taille - 2, taille - 2], opts);
  return s;
}

/**
 * Bouton dessiné (contour rough), largeur fixe. bascule=true : état aria-pressed (hachures bleu
 * clair). jouer=true : icône ▶ dessinée, lecture(enCours) bascule ▶ / ■.
 */
export function bouton(parent, texte, action, { largeur = 110, hauteur = 32, bascule = false, actif = false, jouer = false, titre = null, couleur = '#1e1e1e', fond = '#a5d8ff' } = {}) {
  const b = H('button', 'btn', null, parent);
  b.type = 'button';
  b.style.width = largeur + 'px';
  b.style.height = hauteur + 'px';
  const f = S('svg', { class: 'fond', width: largeur, height: hauteur }, b);
  const a = S('g', { class: 'actif' }, f);
  R('rectangle', a, [2, 2, largeur - 4, hauteur - 4], { cle: 'ba' + texte + largeur, stroke: 'none', fill: fond, hachureGap: 5, fillWeight: 1.2 });
  R('rectangle', f, [1.5, 1.5, largeur - 3, hauteur - 3], { cle: 'b' + texte + largeur, stroke: couleur });
  let ic = null;
  if (jouer) { ic = icone('jouer', 11, texte); b.appendChild(ic); }
  const t = H('span', 'texte', texte, b);
  if (couleur !== '#1e1e1e') t.style.color = couleur;
  if (titre) b.title = titre;
  if (bascule) b.setAttribute('aria-pressed', String(actif));
  b.addEventListener('click', () => action(b));
  b.lecture = (enCours) => {
    if (!ic) return;
    const n = icone(enCours ? 'arreter' : 'jouer', 11, texte);
    ic.replaceWith(n); ic = n;
  };
  b.actif = (v) => b.setAttribute('aria-pressed', String(!!v));
  return b;
}

/** Rangée de boutons exclusifs de même largeur. → élément avec .valeur(v) et .boutons. */
export function choix(parent, options, valeur, action, { largeur = 90, ecart = 2 } = {}) {
  const g = H('div', null, null, parent);
  g.style.display = 'flex';
  g.style.gap = ecart + 'px';
  g.boutons = options.map((o) => {
    const b = bouton(g, o.texte, () => { if (!b.disabled) { g.valeur(o.valeur); action(o.valeur); } }, { bascule: true, actif: o.valeur === valeur, largeur: o.largeur || largeur, titre: o.titre });
    b.valeurChoix = o.valeur;
    return b;
  });
  g.valeur = (v) => g.boutons.forEach((b) => b.actif(b.valeurChoix === v));
  return g;
}

/**
 * Met le repère fixe (largeur × hauteur) à l'échelle de l'élément, centré. surMasque() est
 * appelé quand Excalidraw réduit l'élément à 0 × 0 (diapositive quittée), surAffiche() quand
 * il reparaît.
 */
export function ajuster(racine, largeur, hauteur, { surMasque = () => {}, surAffiche = () => {} } = {}) {
  racine.style.width = largeur + 'px';
  racine.style.height = hauteur + 'px';
  let derniere = '', masque = false;
  const f = () => {
    const cle = innerWidth + 'x' + innerHeight;
    if (cle === derniere) return;
    derniere = cle;
    if (innerWidth < 8 || innerHeight < 8) { if (!masque) { masque = true; surMasque(); } return; }
    if (masque) { masque = false; surAffiche(); }
    const marge = window.self === window.top ? 32 : 1;
    const s = Math.min((innerWidth - 2 * marge) / largeur, (innerHeight - 2 * marge) / hauteur) || 1;
    racine.style.transform = `scale(${s})`;
    racine.style.left = Math.max(0, (innerWidth - largeur * s) / 2) + 'px';
    racine.style.top = Math.max(0, (innerHeight - hauteur * s) / 2) + 'px';
  };
  addEventListener('resize', f);
  if (window.ResizeObserver) new ResizeObserver(f).observe(document.documentElement);
  setInterval(f, 400);
  document.addEventListener('visibilitychange', () => { if (document.hidden) surMasque(); });
  f();
}
