// Diapositive « Corrélats acoustiques » du Cours 7 (élément HTML d'Excalidraw+, srcdoc), dans
// le style des démos (excali/excali.css, excali/excali.js : Excalifont, commandes dessinées).
//
// Interprète les dimensions de l'espace timbral avec 19 descripteurs acoustiques en cinq familles
// (temporel, spectral, harmonique, bruit, spectro-temporel ; donnees/descripteurs-mcadams1995.json
// et courbes-mcadams1995.json, tools/descripteurs_timbre.mjs). Deux vues, même sélection
// (descripteur × dimension) :
//   - Corrélations : r de Pearson de chaque descripteur avec chaque dimension de la carte MDS
//     (correlats.js ; mêmes calculs et mêmes axes que la diapositive MDS), à côté du nuage
//     descripteur × dimension. Une famille ouverte à la fois (cliquer son nom) ; la ligne de
//     famille donne son |r| le plus fort. Étoile : meilleur descripteur de chaque dimension.
//     Hachures si significative (p < 0,05, seuil dans l'infobulle), aussi sur la ligne de famille :
//     jaune r > 0, bleu r < 0, plus serrées si forte ; sinon valeur en gris.
//   - Comparer : le descripteur représenté pour deux sons A (bleu) et B (orange), à la même
//     échelle, à côté du même nuage où A et B sont mis en évidence (comme McAdams, 2013).
// Données : McAdams et al. (1995), 18 timbres ; ou la classe (résultat gardé de c7paires, six
// timbres de McAdams : « sous_ensemble »), avec la dimension de McAdams la plus proche.
// Cliquer une case : choisir descripteur et dimension. Cliquer un point : le son joue
// (Comparer : il devient A puis B).
//
// Document hôte (tools/correlats_cours7.py) :
//   <base href="https://SITE/q/"> <link rel="stylesheet" href="…/q/excali/excali.css">
//   <script src="…/q/excali/rough.js"></script> <div id="demo" class="demo"></div>
//   <script type="application/json" id="config">{"id": "c7paires", "sous_ensemble": ["tpt", …]}</script>
import { ajuster, axes, bouton, chemin, choix, ECART_COMMANDES, echelle, H, placer, R, S, T } from './excali/excali.js';
import { creerDonnees, creerLecteur } from './correlats-donnees.js';
import { COULEURS_DIMENSIONS as COUL_DIM } from './dimensions.js';
import { tracerSpectreBruit } from './spectre-bruit.js';

const L = 786, HT = 384;
const COUL = { A: '#1971c2', B: '#f08c00' };
const GRIS = '#868e96';
const conf = JSON.parse(document.getElementById('config').textContent);
const donnees = creerDonnees({ courbes: 'donnees/courbes-mcadams1995.json', ...conf });
const lecteur = creerLecteur();
const nb = (v, d = 2) => (v === null || v === undefined || !Number.isFinite(v) ? '-' : v.toFixed(d).replace('-', '−'));

const etat = { vue: 'correlations', choix: null, dim: 3, cle: 'attaque', k: 0, A: null, B: null, prochain: 'A', ouverte: 'temporel' };
const source = () => etat.choix || (donnees.d.classe ? 'classe' : 'reference');

// ─── Mise en place ─────────────────────────────────────────────────────────
const demo = document.getElementById('demo');
const barre = placer(H('div', null, null, demo), 0, 0);
barre.style.display = 'flex';
barre.style.gap = ECART_COMMANDES + 'px'; // groupes séparés, boutons d'un même groupe serrés (choix)
const cVue = choix(barre, [{ texte: 'Corrélations', valeur: 'correlations' }, { texte: 'Comparer', valeur: 'comparer' }], etat.vue,
  (v) => { etat.vue = v; rendre(); }, { largeur: 112 });
const cSource = choix(barre, [{ texte: 'Classe', valeur: 'classe' }, { texte: 'McAdams', valeur: 'reference', titre: 'McAdams et al. (1995), 18 timbres de synthèse' }], null,
  (v) => { etat.choix = v; etat.A = etat.B = null; rendre(); }, { largeur: 80 });
const cDim = choix(barre, [{ texte: '2D', valeur: 2 }, { texte: '3D', valeur: 3 }], etat.dim, (v) => { etat.dim = v; etat.k = Math.min(etat.k, v - 1); rendre(); }, { largeur: 40 });
const cAxe = choix(barre, [0, 1, 2].map((k) => ({ texte: `D${k + 1}`, valeur: k })), etat.k, (v) => { etat.k = v; rendre(); }, { largeur: 40 });
const info = placer(H('div', 'indice-html', null, demo), 0, 8);
info.style.right = '0px';
info.style.left = 'auto';
info.style.textAlign = 'right';

const gauche = placer(S('svg', { width: 450, height: HT - 44 }), 0, 44);
const droite = placer(S('svg', { width: 346, height: HT - 44 }), L - 346, 44); // nuage : jusqu'au bord droit et au bas des panneaux
demo.append(gauche, droite);
const panneaux = ['A', 'B'].map((p, i) => {
  const tete = placer(H('div', 'lecture', null, demo), 0, 46 + i * 170, 440);
  tete.style.display = 'flex';
  tete.style.alignItems = 'center';
  tete.style.gap = '10px';
  return { p, tete };
});

// ─── Corrélations : table ──────────────────────────────────────────────────
const XS = [262, 322, 382]; // colonnes D1, D2, D3

// Étoile dessinée (meilleur descripteur d'une dimension).
function etoile(g, cx, cy, r, cle) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  return R('polygon', g, [pts], { cle, fill: '#1e1e1e', fillStyle: 'solid', strokeWidth: 0.8, roughness: 0.4 });
}

// Chevron de famille : ▸ fermée, ▾ ouverte.
function chevron(g, x, y, ouvert) {
  const pts = ouvert ? [[x - 4.5, y - 2.5], [x + 4.5, y - 2.5], [x, y + 3.5]] : [[x - 2.5, y - 4.5], [x + 3.5, y], [x - 2.5, y + 4.5]];
  S('path', { d: chemin(pts) + 'Z', fill: '#1e1e1e' }, g);
}

function cellule(g, x, y, r, { sig, choisie, meilleure, gris, cle, titre, action }) {
  const c = S('g', { class: 'cliquable' }, g);
  S('rect', { x: x - 30, y: y - 15, width: 60, height: 20, fill: 'transparent' }, c);
  if (sig && r !== null) { // significative : jaune positive, bleu négative, plus serré si forte
    const fort = Math.abs(r);
    R('rectangle', c, [x - 26, y - 14, 52, 18], { cle: 'c' + cle, stroke: 'none', fill: r > 0 ? '#fcc419' : '#74c0fc',
      hachureGap: fort > 0.8 ? 2.5 : fort > 0.65 ? 3.5 : 5, fillWeight: 1.2 });
  }
  if (choisie) R('rectangle', c, [x - 29, y - 15, 58, 20], { cle: 's' + cle, strokeWidth: 1.5 });
  const t = T(c, x - 5, y, gris ? nb(Math.abs(r)) : nb(r));
  t.setAttribute('font-size', gris ? 14 : 15);
  t.style.fill = sig ? '#1e1e1e' : GRIS; // style : la feuille (svg text) l'emporte sur l'attribut
  if (meilleure) etoile(c, x + 20, y - 5, 4.5, 'e' + cle);
  const ti = S('title', {}, c);
  ti.textContent = titre;
  c.addEventListener('click', action);
}

function rendreTable(v) {
  const g = gauche;
  g.replaceChildren();
  const { descripteurs: desc, familles } = donnees.d.descripteurs;
  const xs = XS.slice(0, etat.dim);
  const lignes = new Map(v.analyse.lignes.map((l) => [l.cle, l]));
  const meilleurs = v.analyse.meilleurs;
  let y = 16;
  xs.forEach((x, k) => T(g, x - 3, y, `D${k + 1}`, 'titre-axe', 'middle', { style: `fill: ${COUL_DIM[k]}` })); // couleurs de la carte MDS
  if (v.comparaison) {
    y += 19;
    T(g, 0, y, 'proche de McAdams', 'indice', 'start');
    v.comparaison.forEach((c, k) => T(g, xs[k] - 3, y, c.dim === null ? '-' : `D${c.dim + 1} ${nb(Math.abs(c.r))}`, 'graduation', 'middle',
      c.dim === null ? {} : { style: `fill: ${COUL_DIM[c.dim]}` }));
  }
  y += 4;
  for (const f of familles) {
    const membres = desc.filter((d) => d.famille === f.cle);
    const ouverte = etat.ouverte === f.cle;
    y += 25;
    const tete = S('g', { class: 'cliquable' }, g);
    S('rect', { x: 0, y: y - 17, width: xs[0] - 32, height: 24, fill: 'transparent' }, tete);
    chevron(tete, 5, y - 5, ouverte);
    const nom = T(tete, 16, y, f.nom, 'titre-axe', 'start');
    nom.setAttribute('font-weight', 700);
    if (membres.some((d) => d.cle === etat.cle)) nom.style.fill = '#1971c2'; // famille du descripteur choisi
    const ti = S('title', {}, tete);
    ti.textContent = ouverte ? 'Replier' : `Afficher les ${membres.length} descripteurs`;
    tete.addEventListener('click', () => { etat.ouverte = ouverte ? null : f.cle; rendre(); });
    // Famille : son |r| le plus fort pour chaque dimension (cliquer : ce descripteur).
    xs.forEach((x, k) => {
      const fort = membres.map((d) => lignes.get(d.cle)).filter((l) => l.r[k] !== null)
        .sort((a, b) => Math.abs(b.r[k]) - Math.abs(a.r[k]))[0];
      if (!fort) return;
      const d = desc.find((x2) => x2.cle === fort.cle);
      cellule(g, x, y, fort.r[k], { gris: true, sig: Math.abs(fort.r[k]) >= v.analyse.seuil, meilleure: !ouverte && meilleurs[k] === fort.cle, cle: `f${f.cle}${k}`,
        titre: `${f.nom} : |r| le plus fort avec D${k + 1} (${d.nom})`,
        action: () => { etat.cle = fort.cle; etat.k = k; etat.ouverte = f.cle; etat.A = etat.B = null; rendre(); } });
    });
    if (!ouverte) continue;
    for (const d of membres) {
      const l = lignes.get(d.cle);
      y += 21;
      const nomD = T(g, 16, y, d.nom, 'lecture-svg', 'start');
      nomD.setAttribute('font-size', 15);
      if (d.cle === etat.cle) nomD.style.fill = '#1971c2';
      const tiD = S('title', {}, nomD);
      tiD.textContent = d.definition;
      l.r.slice(0, etat.dim).forEach((r, k) => {
        cellule(g, xs[k], y, r, { sig: r !== null && Math.abs(r) >= v.analyse.seuil, choisie: d.cle === etat.cle && k === etat.k,
          meilleure: meilleurs[k] === d.cle, cle: `${d.cle}${k}`,
          titre: `${d.nom} × D${k + 1} : r = ${nb(r)}${r !== null && Math.abs(r) >= v.analyse.seuil ? ' (significatif, p < 0.05)' : ''}`,
          action: () => { etat.cle = d.cle; etat.k = k; etat.A = etat.B = null; rendre(); } });
      });
    }
  }
  // Légende, en bas.
  const yl = HT - 44 - 8;
  etoile(g, 6, yl - 5, 5, 'leg');
  T(g, 16, yl, 'Meilleur descripteur de la dimension', 'indice', 'start');
}

// ─── Nuage descripteur × dimension (les deux vues) ─────────────────────────
// Texte ramené à la largeur disponible (police réduite au besoin).
function ajusterTexte(t, largeur, taille) {
  for (let f = taille; f >= 11; f -= 0.5) {
    t.setAttribute('font-size', f);
    if (t.getComputedTextLength() <= largeur) return;
  }
}

function rendreNuage(v, d, surComparer) {
  const g = droite;
  g.replaceChildren();
  const ligne = v.analyse.lignes.find((l) => l.cle === d.cle);
  const r = ligne.r[etat.k];
  const xs = v.sons.map((s) => v.valeurs[s.desc][d.cle]);
  const ys = v.points.map((p) => p[etat.k]);
  const marge = (a) => { const lo = Math.min(...a), hi = Math.max(...a), m = (hi - lo) * 0.12 || 1; return [lo - m, hi + m]; };
  const [x0, x1] = marge(xs), [y0, y1] = marge(ys);
  const X = echelle(x0, x1, 46, 326), Y = echelle(y0, y1, 298, 52); // marge à droite : la dernière graduation reste entière
  let ticksX = [], pasX = null;
  if (d.cle === 'attaque') ticksX = [2, 5, 10, 20, 50, 100, 200].map((ms) => Math.log10(ms / 1000)).filter((t) => t >= x0 && t <= x1);
  else { pasX = nicePas(x1 - x0); for (let t = Math.ceil(x0 / pasX) * pasX; t <= x1 + pasX * 1e-9; t += pasX) ticksX.push(t); }
  axes(g, { x: X, y: Y, ticksX, formatX: (t) => formatDesc(d, t, true, pasX), titreX: `${d.nom}${d.cle === 'attaque' ? ' (ms, échelle log)' : d.unite ? ` (${d.unite})` : ''}` });
  // Titre vertical près de l'axe (pas de graduations à gauche).
  T(g, 34, 175, `Dimension ${etat.k + 1}`, 'titre-axe', 'middle', { transform: 'rotate(-90 34 175)', style: `fill: ${COUL_DIM[etat.k]}` });
  // Ligne d'en-tête : r en bleu (une seule taille), ramenée à la largeur du cadre.
  const tete = T(g, 186, 18, '', 'lecture-svg'); // centré sur le tracé (46 → 326) ; accents dans le cadre
  tete.append(`${d.nom} × `);
  S('tspan', { style: `fill: ${COUL_DIM[etat.k]}` }, tete).textContent = `D${etat.k + 1}`;
  tete.append(' : r = ');
  const val = S('tspan', { fill: Math.abs(r ?? 0) >= v.analyse.seuil ? '#1971c2' : GRIS }, tete);
  val.textContent = nb(r);
  ajusterTexte(tete, 340, 16);
  const attr = T(g, 186, 37, d.attribut.toLowerCase(), 'indice');
  ajusterTexte(attr, 340, 14);
  // Droite de régression (propre, pointillée).
  const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  const pente = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / (xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1);
  const clip = S('clipPath', { id: 'zone' }, g);
  S('rect', { x: 46, y: 52, width: 280, height: 246 }, clip);
  S('line', { x1: X(x0), y1: Y(my + pente * (x0 - mx)), x2: X(x1), y2: Y(my + pente * (x1 - mx)), stroke: GRIS, 'stroke-width': 1.2, 'stroke-dasharray': '6 5', 'clip-path': 'url(#zone)' }, g);
  // Points : disques noirs pleins ; A et B en couleur.
  const px = xs.map(X), py = ys.map(Y);
  const occupe = px.map((x, i) => [x - 5, py[i] - 5, x + 5, py[i] + 5]);
  const chevauche = (b) => occupe.reduce((t, o) => t + Math.max(0, Math.min(b[2], o[2]) - Math.max(b[0], o[0])) * Math.max(0, Math.min(b[3], o[3]) - Math.max(b[1], o[1])), 0);
  const dedans = (b) => b[0] >= 50 && b[2] <= 344 && b[1] >= 44 && b[3] <= 302; // jamais sur les axes ni hors du cadre
  v.sons.forEach((son, i) => {
    const role = surComparer && (son.desc === etat.A ? 'A' : son.desc === etat.B ? 'B' : null);
    const c = role ? COUL[role] : '#1e1e1e';
    const p = S('g', { class: 'cliquable' }, g);
    S('circle', { cx: px[i], cy: py[i], r: 12, fill: 'transparent' }, p);
    S('circle', { cx: px[i], cy: py[i], r: role ? 6 : 3.5, fill: c }, p);
    const t = T(p, px[i], py[i], son.etiquette, 'graduation', 'start');
    const w = t.getComputedTextLength() + 2; // largeur mesurée (police réelle)
    // Étiquette : à droite, à gauche, au-dessus, au-dessous, puis en diagonale ; sinon la place
    // la moins recouverte (deux points presque confondus).
    const essais = [[px[i] + 8, py[i] + 4, 'start'], [px[i] - 8, py[i] + 4, 'end'], [px[i], py[i] - 9, 'middle'], [px[i], py[i] + 17, 'middle'],
      [px[i] + 6, py[i] - 7, 'start'], [px[i] - 6, py[i] - 7, 'end'], [px[i] + 6, py[i] + 15, 'start'], [px[i] - 6, py[i] + 15, 'end']];
    const boite = ([x, y, a]) => { const gx = a === 'start' ? x : a === 'end' ? x - w : x - w / 2; return [gx, y - 11, gx + w, y + 2]; };
    const possibles = essais.filter((e) => dedans(boite(e)));
    const [lx, ly, a] = possibles.find((e) => chevauche(boite(e)) === 0)
      || [...possibles].sort((e1, e2) => chevauche(boite(e1)) - chevauche(boite(e2)))[0] || essais[1];
    occupe.push(boite([lx, ly, a]));
    t.setAttribute('x', lx);
    t.setAttribute('y', ly);
    t.setAttribute('text-anchor', a);
    if (role) t.style.fill = c;
    const titre = S('title', {}, p);
    titre.textContent = son.nom;
    p.addEventListener('click', () => {
      if (surComparer && son.desc !== etat.A && son.desc !== etat.B) {
        etat[etat.prochain] = son.desc;
        etat.prochain = etat.prochain === 'A' ? 'B' : 'A';
        rendre();
      }
      lecteur.jouer(son, () => rendre());
      rendre();
    });
  });
}

function nicePas(etendue) {
  const brut = etendue / 4, p = 10 ** Math.floor(Math.log10(brut)), m = brut / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

// Valeur lisible d'un descripteur : graduation (court, décimales du pas) ou en-tête (3 chiffres
// significatifs et unité).
function formatDesc(d, v, court = false, pas = null) {
  if (d.cle === 'attaque') {
    const ms = 10 ** v * 1000;
    const t = ms < 10 ? (court && Math.abs(ms - Math.round(ms)) < 0.05 ? String(Math.round(ms)) : nb(ms, 1)) : Math.round(ms);
    return `${t}${court ? '' : ' ms'}`;
  }
  const a = Math.abs(v);
  const dec = pas ? Math.max(0, -Math.floor(Math.log10(pas) + 1e-9))
    : a >= 100 || a === 0 ? 0 : Math.min(6, 2 - Math.floor(Math.log10(a)));
  return `${nb(v, dec)}${court || !d.unite ? '' : d.unite.startsWith('/') ? d.unite : ` ${d.unite}`}`;
}

// ─── Comparer : représentation du descripteur pour A et B ──────────────────
// Panneau : 440 × 140 sous son en-tête ; tracé (50, 8) → (404, 112), à la même échelle pour A et
// B. Légende en haut à droite (panneau A seulement) : le tracé commence 16 px plus bas.
const P = { g: 50, d: 404, h: 8, b: 112 };
// Fréquence : toujours en échelle log (harmoniques de ~311 Hz à ~6,2 kHz ; bruit jusqu'à 10 kHz).
const F_MIN = 250, F_MAX = 8000;
const TICKS_F = [100, 250, 500, 1000, 2000, 4000, 8000];
const fmtF = (f) => (f >= 8000 ? `${f / 1000} kHz` : f >= 1000 ? `${f / 1000}k` : String(f));
const HAUT = P.h + 16;

function rendrePanneaux(v, d) {
  const g = gauche;
  g.replaceChildren();
  const ca = donnees.d.courbes.sons[etat.A], cb = donnees.d.courbes.sons[etat.B];
  const fort = (c) => c.harmoniques.ecarts.filter((_, i) => c.harmoniques.db[i] >= -40).map(Math.abs);
  const commun = {
    duree: Math.max(ca.duree, cb.duree),
    centroideMax: Math.ceil(Math.max(...[...ca.trames, ...cb.trames].map((q) => q[1])) / 500) * 500,
    ecartMax: Math.min(3, Math.max(0.2, ...fort(ca), ...fort(cb)) * 1.25),
  };
  for (const [i, { p, tete }] of panneaux.entries()) {
    const son = v.sons.find((s) => s.desc === etat[p]);
    tete.replaceChildren();
    const b = bouton(tete, '', () => lecteur.jouer(son, () => rendre()), { largeur: 34, hauteur: 26, jouer: true, titre: `Écouter ${son.nom}` });
    if (lecteur.enCours() === son) b.lecture(true);
    const nom = H('span', null, son.nom, tete);
    nom.style.color = COUL[p];
    nom.style.overflow = 'hidden';
    nom.style.textOverflow = 'ellipsis';
    const val = H('span', null, formatDesc(d, v.valeurs[etat[p]][d.cle]), tete);
    val.style.marginLeft = 'auto';
    val.style.color = COUL[p];
    const zone = S('g', { transform: `translate(0 ${32 + i * 170})` }, g);
    tracer(zone, d, donnees.d.courbes.sons[etat[p]], COUL[p], { ...commun, valeurs: v.valeurs[etat[p]] }, p, i === 0);
  }
}

// Légende alignée à droite en haut du tracé. Éléments : { type, texte, couleur }.
function legende(g, items) {
  let x = P.d;
  const y = P.h + 6;
  for (const it of [...items].reverse()) {
    const t = T(g, x, y + 4, it.texte, 'indice', 'end');
    t.setAttribute('font-size', 13);
    x -= t.getComputedTextLength() + 5;
    const c = it.couleur || '#1e1e1e';
    if (it.type === 'barre') S('line', { x1: x - 6, x2: x - 6, y1: y - 5, y2: y + 5, stroke: c, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    else if (it.type === 'point') S('circle', { cx: x - 6, cy: y, r: 3, fill: c }, g);
    else if (it.type === 'ecart') S('line', { x1: x - 6, x2: x - 6, y1: y - 6, y2: y + 6, stroke: c, 'stroke-width': 1.5 }, g);
    else if (it.type === 'zone') R('rectangle', g, [x - 16, y - 5, 16, 10], { cle: 'lz' + it.texte, stroke: 'none', fill: c, hachureGap: 3, fillWeight: 1 });
    else if (it.type === 'plein') S('rect', { x: x - 16, y: y - 5, width: 16, height: 10, fill: c }, g);
    else if (it.type === 'fleche') fleche(g, x - 18, x - 2, y, c);
    else if (it.type !== 'texte') S('line', { x1: x - 18, x2: x - 2, y1: y, y2: y, stroke: c, 'stroke-width': 1.5, 'stroke-dasharray': it.type === 'tiret' ? '4 3' : null }, g);
    x -= it.type === 'texte' ? 9 : (['barre', 'point', 'ecart'].includes(it.type) ? 12 : 18) + 14;
  }
}

// Flèche propre (jamais dessinée à la main).
function fleche(g, x1, x2, y, c) {
  const s = Math.sign(x2 - x1) || 1;
  S('line', { x1, x2: x2 - s * 5, y1: y, y2: y, stroke: c, 'stroke-width': 1.8 }, g);
  S('path', { d: chemin([[x2, y], [x2 - s * 7, y - 4], [x2 - s * 7, y + 4]]) + 'Z', fill: c }, g);
}

function tracer(g, d, c, coul, e, p, avecLegende) {
  const vals = e.valeurs;
  const leg = (items) => { if (avecLegende) legende(g, items); };
  const tX = echelle(0, e.duree, P.g, P.d);
  const pasT = e.duree > 1.2 ? 0.4 : e.duree > 0.6 ? 0.2 : 0.1;
  const ticksT = [];
  for (let t = 0; t <= e.duree + 1e-9; t += pasT) ticksT.push(Number(t.toFixed(2)));
  const fT = (t) => (t === ticksT[ticksT.length - 1] ? `${nb(t, 1)} s` : nb(t, 1));
  const env = c.enveloppe.v.map((a, i) => [c.enveloppe.t0 + i * c.enveloppe.pas, a]);
  const lin = echelle(0, 1, P.b, HAUT);
  const zoneHachee = (x0, x1, cle, y0 = HAUT, y1 = P.b) => R('rectangle', g, [x0, y0, Math.max(3, x1 - x0), y1 - y0], { cle, stroke: 'none', fill: '#ced4da', hachureGap: 4, fillWeight: 1 });
  const horizontale = (y, tiret = true) => S('line', { x1: P.g, x2: P.d, y1: y, y2: y, stroke: '#1e1e1e', 'stroke-width': 1, 'stroke-dasharray': tiret ? '4 4' : null }, g);
  const courbe = (pts, larg = 1.5) => S('path', { d: chemin(pts), fill: 'none', stroke: coul, 'stroke-width': larg }, g);
  const marque = (x) => S('line', { x1: x, x2: x, y1: HAUT, y2: P.b, stroke: '#1e1e1e', 'stroke-width': 1.2, 'stroke-dasharray': '5 4' }, g);
  const barre = (x, y, teinte = coul, larg = 4) => S('line', { x1: x, x2: x, y1: P.b, y2: Math.min(P.b, y), stroke: teinte, 'stroke-width': larg, 'stroke-linecap': 'round' }, g);
  const H_ = c.harmoniques, nh = H_.db.length;
  const fDb = (v) => (v === 0 ? '0 dB' : String(v)); // unité sur la graduation du haut (pas de titre tourné)
  const dbH = (v) => Math.min(0, Math.max(-60, v)); // jamais hors du tracé (droites ajustées comprises)

  // ── Temporel : enveloppe (linéaire).
  if (d.famille === 'temporel') {
    axes(g, { x: tX, y: lin, ticksX: ticksT, ticksY: [], formatX: fT });
    const [t1, t2] = c.attaque;
    const etiquette = (y, texte) => T(g, P.d + 3, y + 4, texte, 'graduation', 'start');
    if (d.cle === 'attaque' || d.cle === 'croissance') {
      if (d.cle === 'attaque') zoneHachee(tX(t1), tX(t2), 'att' + p);
      horizontale(lin(0.1)); etiquette(lin(0.1), '10 %');
      horizontale(lin(0.9)); etiquette(lin(0.9), '90 %');
    } else if (d.cle === 'centroide_temporel') {
      marque(tX(c.centroide_temporel));
    } else if (d.cle === 'duree_effective') {
      horizontale(lin(0.4)); etiquette(lin(0.4), '40 %');
      for (const [a, b] of c.duree_effective) R('line', g, [tX(a), lin(0.4), tX(b), lin(0.4)], { cle: 'de' + p + a, stroke: '#1e1e1e', strokeWidth: 4 });
    }
    courbe(env.map(([t, a]) => [tX(t), lin(a)]));
    if (d.cle === 'croissance') {
      S('line', { x1: tX(t1), y1: lin(0.1), x2: tX(t2), y2: lin(0.9), stroke: '#1e1e1e', 'stroke-width': 2 }, g);
      for (const [t, a] of [[t1, 0.1], [t2, 0.9]]) S('circle', { cx: tX(t), cy: lin(a), r: 3, fill: '#1e1e1e' }, g);
    }
    leg({ attaque: [{ type: 'ligne', couleur: coul, texte: 'enveloppe' }, { type: 'zone', couleur: '#adb5bd', texte: 'de 10 % à 90 %' }],
      croissance: [{ type: 'ligne', couleur: coul, texte: 'enveloppe' }, { type: 'ligne', texte: 'pente de 10 % à 90 %' }],
      centroide_temporel: [{ type: 'ligne', couleur: coul, texte: 'enveloppe' }, { type: 'tiret', texte: 'centroïde temporel' }],
      duree_effective: [{ type: 'ligne', couleur: coul, texte: 'enveloppe' }, { type: 'ligne', texte: 'au-dessus de 40 %' }] }[d.cle]);
    return;
  }

  // ── Spectral et harmonique : les harmoniques, toujours en fréquence (échelle log) et en dB.
  const FX = echelle(F_MIN, F_MAX, P.g, P.d, true);
  const axesF = (Y, ticksY = [-60, -30, 0], formatY = fDb) => axes(g, { x: FX, y: Y, ticksX: TICKS_F.filter((f) => f >= F_MIN && f <= F_MAX), ticksY, formatX: fmtF, formatY });
  const fx = (f) => FX(Math.max(F_MIN, Math.min(F_MAX, f)));
  const Ydb = echelle(-60, 0, P.b, HAUT);
  const barres = (teinte = () => coul) => H_.db.forEach((v, i) => barre(FX(H_.f[i]), Ydb(dbH(v)), teinte(i + 1), 3));
  // Droite de régression des harmoniques (dB) en fonction du log de la fréquence : droite ici.
  const regression = () => {
    const pts = H_.db.map((v, i) => [Math.log2(i + 1), v]);
    const mx = pts.reduce((a, q) => a + q[0], 0) / nh, my = pts.reduce((a, q) => a + q[1], 0) / nh;
    const b = pts.reduce((a, q) => a + (q[0] - mx) * (q[1] - my), 0) / pts.reduce((a, q) => a + (q[0] - mx) ** 2, 0);
    return (i) => my + b * (Math.log2(i + 1) - mx);
  };
  const droite = (fit, tiret = '6 4') => {
    const clip = S('clipPath', { id: 'zp' + p }, g);
    S('rect', { x: P.g, y: HAUT, width: P.d - P.g, height: P.b - HAUT }, clip);
    S('path', { d: chemin(H_.db.map((_, i) => [FX(H_.f[0] * (i + 1)), Ydb(fit(i))])), fill: 'none', stroke: '#1e1e1e', 'stroke-width': 1.5, 'stroke-dasharray': tiret, 'clip-path': `url(#zp${p})` }, g);
  };
  if (d.famille === 'spectral') {
    axesF(Ydb);
    if (d.cle === 'pente_spectrale') {
      barres();
      droite(regression());
      leg([{ type: 'barre', couleur: coul, texte: 'harmonique' }, { type: 'tiret', texte: 'pente (dB/octave)' }]);
      return;
    }
    if (d.cle === 'rolloff') {
      zoneHachee(fx(vals.rolloff), P.d, 'ro' + p);
      barres();
      marque(fx(vals.rolloff));
      leg([{ type: 'barre', couleur: coul, texte: 'harmonique' }, { type: 'tiret', texte: 'coupure' }, { type: 'zone', couleur: '#adb5bd', texte: "5 % de l'énergie" }]);
      return;
    }
    // Moments (calculés sur les amplitudes) : centroïde, ± écart type, traîne, ± 2 écarts types.
    const cx = fx(vals.centroide);
    if (d.cle !== 'centroide') zoneHachee(fx(vals.centroide - vals.etalement), fx(vals.centroide + vals.etalement), 'et' + p);
    if (d.cle === 'kurtosis') for (const s of [-2, 2]) {
      const f = vals.centroide + s * vals.etalement;
      if (f <= F_MIN) continue;
      const x = fx(f);
      S('line', { x1: x, x2: x, y1: HAUT, y2: P.b, stroke: GRIS, 'stroke-width': 1, 'stroke-dasharray': '2 3' }, g);
    }
    barres();
    marque(cx);
    if (d.cle === 'asymetrie') { // traîne : du côté opposé à la masse, longueur selon l'asymétrie
      const l = Math.min(Math.abs(vals.asymetrie), 4) / 4 * 140 + 20;
      fleche(g, cx, cx + Math.sign(vals.asymetrie) * l, Ydb(-20), '#1e1e1e');
    }
    leg({ centroide: [{ type: 'barre', couleur: coul, texte: 'harmonique' }, { type: 'tiret', texte: 'centroïde' }],
      etalement: [{ type: 'tiret', texte: 'centroïde' }, { type: 'zone', couleur: '#adb5bd', texte: '± 1 écart type' }],
      asymetrie: [{ type: 'tiret', texte: 'centroïde' }, { type: 'fleche', texte: 'traîne (longueur : asymétrie)' }],
      kurtosis: [{ type: 'zone', couleur: '#adb5bd', texte: '± 1 écart type' }, { type: 'tiret', couleur: GRIS, texte: '± 2 écarts types' }] }[d.cle]);
    return;
  }

  if (d.famille === 'harmonique') {
    if (d.cle === 'inharmonicite') { // écart de chaque partiel à h × F0, en %
      const m = e.ecartMax, Y = echelle(-m, m, P.b, HAUT);
      const pasY = m >= 2 ? 1 : m >= 1 ? 0.5 : m >= 0.4 ? 0.2 : 0.1;
      const tY = [-Math.floor(m / pasY) * pasY, 0, Math.floor(m / pasY) * pasY];
      axesF(Y, tY, (v) => `${nb(v, pasY < 1 ? 1 : 0)}${v > 0 ? ' %' : ''}`);
      horizontale(Y(0));
      H_.ecarts.forEach((v, i) => {
        const x = FX(H_.f0 * (i + 1)), y = Y(Math.max(-m, Math.min(m, v)));
        const o = H_.db[i] < -40 ? 0.3 : 1;
        S('line', { x1: x, x2: x, y1: Y(0), y2: y, stroke: coul, 'stroke-width': 2, 'stroke-opacity': o }, g);
        S('circle', { cx: x, cy: y, r: 3, fill: coul, 'fill-opacity': o }, g);
      });
      leg([{ type: 'tiret', texte: 'h × F0' }, { type: 'point', couleur: coul, texte: 'écart du partiel (pâle : faible)' }]);
      return;
    }
    axesF(Ydb);
    if (d.cle === 'impairs_pairs') {
      barres((h) => (h === 1 ? '#ced4da' : h % 2 ? coul : GRIS));
      leg([{ type: 'barre', couleur: coul, texte: 'impaires' }, { type: 'barre', couleur: GRIS, texte: 'paires' }, { type: 'barre', couleur: '#ced4da', texte: 'fondamentale (exclue)' }]);
      return;
    }
    barres();
    if (d.cle === 'deviation') {
      const fit = regression();
      H_.db.forEach((v, i) => S('line', { x1: FX(H_.f[i]), x2: FX(H_.f[i]), y1: Ydb(dbH(v)), y2: Ydb(dbH(fit(i))), stroke: '#1e1e1e', 'stroke-width': 1.5 }, g));
      droite(fit, '6 4');
      leg([{ type: 'barre', couleur: coul, texte: 'harmonique' }, { type: 'tiret', texte: 'pente spectrale' }, { type: 'ecart', texte: 'écart' }]);
      return;
    }
    // Irrégularité : moyenne des voisines (h − 1, h, h + 1), un trait par harmonique.
    for (let i = 1; i < nh - 1; i++) {
      const m = (H_.db[i - 1] + H_.db[i] + H_.db[i + 1]) / 3, x = FX(H_.f[i]);
      const demi = Math.min(7, 0.4 * (FX(H_.f[i + 1]) - FX(H_.f[i - 1])));
      S('line', { x1: x - demi, x2: x + demi, y1: Ydb(dbH(m)), y2: Ydb(dbH(m)), stroke: '#1e1e1e', 'stroke-width': 1.5 }, g);
    }
    leg([{ type: 'barre', couleur: coul, texte: 'harmonique' }, { type: 'ligne', texte: 'moyenne des voisines' }]);
    return;
  }

  // ── Bruit : spectre moyen complet (0 à 10 kHz), ou l'onde.
  if (d.famille === 'bruit') {
    if (d.cle === 'zcr') {
      const o = c.onde, dur = o.v.length * o.dt * 1000;
      const X = echelle(0, dur, P.g, P.d), Y = echelle(-1, 1, P.b, HAUT);
      axes(g, { x: X, y: Y, ticksX: [0, 2, 4, 6, 8, 10].filter((t) => t <= dur + 1e-6), ticksY: [], formatX: (t) => (t === 10 ? '10 ms' : String(t)) });
      S('line', { x1: P.g, x2: P.d, y1: Y(0), y2: Y(0), stroke: GRIS, 'stroke-width': 1 }, g);
      courbe(o.v.map((v, i) => [X(i * o.dt * 1000), Y(v)]), 1.3);
      for (let i = 1; i < o.v.length; i++) {
        const [a, b] = [o.v[i - 1], o.v[i]];
        if ((a < 0) !== (b < 0)) S('circle', { cx: X((i - 1 + a / (a - b)) * o.dt * 1000), cy: Y(0), r: 2.6, fill: '#1e1e1e' }, g);
      }
      leg([{ type: 'ligne', couleur: coul, texte: 'onde (10 ms)' }, { type: 'point', texte: 'passage par zéro' }]);
      return;
    }
    leg(tracerSpectreBruit(g, d.cle, c.spectre, { g: P.g, d: P.d, h: HAUT, b: P.b }, coul));
    return;
  }

  // ── Spectro-temporel : les harmoniques dans le temps (gris : niveau).
  const pasH = c.harmogramme.length > 1 ? c.harmogramme[1][0] - c.harmogramme[0][0] : 0.023;
  const harmogramme = (Yh, Hh) => { // Yh(h) : centre de la rangée de l'harmonique h ; Hh(h) : sa hauteur
    for (const [t, niveau, rel] of c.harmogramme) {
      const x0 = tX(t - pasH / 2), w = tX(t + pasH / 2) - x0;
      rel.forEach((vr, i) => {
        const v = niveau + vr;
        if (v <= -60) return;
        S('rect', { x: x0, y: Yh(i + 1) - Hh(i + 1) / 2, width: w + 0.3, height: Hh(i + 1) + 0.3, fill: '#495057', 'fill-opacity': ((v + 60) / 60) ** 1.5 * 0.4 }, g);
      });
    }
  };
  if (d.cle === 'variation_centroide') {
    const f0 = H_.f0, Y = echelle(0, (nh + 0.5) * f0, P.b, HAUT);
    harmogramme((h) => Y(h * f0), () => Math.abs(Y(f0) - Y(2 * f0)));
    axes(g, { x: tX, y: Y, ticksX: ticksT, ticksY: [0, 3000, 6000], formatX: fT, formatY: (f) => (f === 6000 ? '6 kHz' : String(f / 1000)) });
    const tr = c.trames;
    const moy = tr.reduce((a, q) => a + q[1] * q[2] ** 2, 0) / tr.reduce((a, q) => a + q[2] ** 2, 0);
    const yb = Y(Math.max(0, moy - vals.variation_centroide)), yh = Y(Math.min((nh + 0.5) * f0, moy + vals.variation_centroide));
    R('rectangle', g, [P.g, yh, P.d - P.g, Math.max(3, yb - yh)], { cle: 'vc' + p, stroke: 'none', fill: '#dee2e6', hachureGap: 4, fillWeight: 1 }); // gris hachuré, comme la première version
    S('line', { x1: P.g, x2: P.d, y1: Y(moy), y2: Y(moy), stroke: '#1e1e1e', 'stroke-width': 1, 'stroke-dasharray': '5 4' }, g);
    courbe(tr.map(([t, f]) => [tX(t), Y(f)]), 2);
    leg([{ type: 'plein', couleur: '#868e96', texte: 'harmoniques' }, { type: 'ligne', couleur: coul, texte: 'centroïde' }, { type: 'zone', couleur: '#ced4da', texte: '± 1 écart type' }]);
    return;
  }
  // Flux : spectres successifs superposés (chacun ramené à son maximum : la corrélation ne
  // compare que leur forme), du plus pâle (début) au plus foncé (fin). Formes confondues : flux
  // faible ; formes qui changent : flux élevé.
  const FXf = echelle(F_MIN, F_MAX, P.g, P.d, true), Y = echelle(-60, 0, P.b, HAUT);
  axes(g, { x: FXf, y: Y, ticksX: TICKS_F.filter((f) => f >= F_MIN), ticksY: [-60, -30, 0], formatX: fmtF, formatY: fDb });
  const tr = c.harmogramme, n = Math.min(8, tr.length);
  for (let j = 0; j < n; j++) {
    const rel = tr[Math.round((j * (tr.length - 1)) / Math.max(1, n - 1))][2];
    S('path', { d: chemin(rel.map((v, i) => [FXf(H_.f0 * (i + 1)), Y(v)])), fill: 'none', stroke: coul, 'stroke-width': 1.4,
      'stroke-opacity': 0.2 + (0.8 * j) / Math.max(1, n - 1) }, g);
  }
  leg([{ type: 'ligne', couleur: coul + '44', texte: 'début' }, { type: 'ligne', couleur: coul, texte: 'fin du son' }, { type: 'texte', texte: '(spectres successifs)' }]);
}

// ─── Rendu ─────────────────────────────────────────────────────────────────
function paireParDefaut(v, d) {
  const cles = v.sons.map((s) => s.desc);
  if (source() === 'reference' && d.cle === 'attaque' && cles.includes('vbs') && cles.includes('hrn')) return ['vbs', 'hrn']; // McAdams (2013)
  const tri = [...cles].sort((a, b) => v.valeurs[a][d.cle] - v.valeurs[b][d.cle]);
  return [tri[0], tri[tri.length - 1]];
}

function rendre() {
  if (!donnees.d.reference) return;
  const comparer = etat.vue === 'comparer';
  const dim = comparer ? 3 : etat.dim;
  const v = donnees.vue(source(), dim);
  const d = donnees.d.descripteurs.descripteurs.find((x) => x.cle === etat.cle);
  const cles = v.sons.map((s) => s.desc);
  if (!cles.includes(etat.A) || !cles.includes(etat.B)) [etat.A, etat.B] = paireParDefaut(v, d);
  cVue.valeur(etat.vue);
  cSource.valeur(source());
  const bClasse = cSource.boutons[0];
  bClasse.disabled = !donnees.d.classe;
  bClasse.title = donnees.d.classe ? 'Résultat de la classe (écoute des paires)' : "La classe n'a pas encore fait l'écoute des paires";
  cDim.hidden = comparer;
  cAxe.hidden = !comparer;
  cDim.valeur(etat.dim);
  cAxe.valeur(etat.k);
  const g = donnees.d.classe;
  info.textContent = source() === 'classe' && g
    ? `${g.resultats.n} participants${g.resultats.simulees ? ` (${g.resultats.simulees} simulés)` : ''}`
    : '';
  info.style.color = source() === 'classe' && g?.resultats.simulees ? '#e03131' : '';
  for (const { tete } of panneaux) tete.hidden = !comparer;
  if (comparer) rendrePanneaux(v, d);
  else rendreTable(v);
  rendreNuage(v, d, comparer);
}

ajuster(demo, L, HT, {
  surMasque: () => lecteur.arreter(),
  surAffiche: async () => { await donnees.chargerClasse(); rendre(); },
});

(async () => {
  try {
    await donnees.charger();
    await donnees.chargerClasse();
    rendre();
    document.fonts?.ready.then(rendre); // largeurs de texte mesurées avec la vraie police
  } catch (e) {
    demo.textContent = e.message;
  }
})();
