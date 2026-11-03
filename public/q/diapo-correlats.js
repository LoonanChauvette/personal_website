// Diapositive « Corrélats acoustiques » du Cours 7 (élément HTML d'Excalidraw+, srcdoc), dans
// le style des démos (excali/excali.css, excali/excali.js : Excalifont, commandes dessinées).
//
// Interprète les dimensions de l'espace timbral avec 13 descripteurs acoustiques
// (donnees/descripteurs-mcadams1995.json et courbes-mcadams1995.json,
// tools/descripteurs_timbre.mjs). Deux vues, même sélection (descripteur × dimension) :
//   - Corrélations : r de Pearson de chaque descripteur avec chaque dimension de la carte MDS
//     (correlats.js ; mêmes calculs et mêmes axes que la diapositive MDS), à côté du nuage
//     descripteur × dimension. Hachures : corrélation significative (bleu > 0, orange < 0).
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
import { ajuster, axes, bouton, chemin, choix, echelle, H, placer, R, S, T } from './excali/excali.js';
import { creerDonnees, creerLecteur } from './correlats-donnees.js';

const L = 786, HT = 384;
const COUL = { A: '#1971c2', B: '#f08c00' };
const GRIS = '#868e96';
const conf = JSON.parse(document.getElementById('config').textContent);
const donnees = creerDonnees({ courbes: 'donnees/courbes-mcadams1995.json', ...conf });
const lecteur = creerLecteur();
const nb = (v, d = 2) => (v === null || v === undefined || !Number.isFinite(v) ? '-' : v.toFixed(d).replace('-', '−'));

const etat = { vue: 'correlations', choix: null, dim: 3, cle: 'attaque', k: 0, A: null, B: null, prochain: 'A' };
const source = () => etat.choix || (donnees.d.classe ? 'classe' : 'reference');

// ─── Mise en place ─────────────────────────────────────────────────────────
const demo = document.getElementById('demo');
const barre = placer(H('div', null, null, demo), 0, 0);
barre.style.display = 'flex';
barre.style.gap = '28px'; // groupes bien séparés, boutons d'un même groupe serrés (choix)
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
const droite = placer(S('svg', { width: 330, height: HT - 44 }), L - 330, 44);
demo.append(gauche, droite);
const panneaux = ['A', 'B'].map((p, i) => {
  const tete = placer(H('div', 'lecture', null, demo), 0, 46 + i * 170, 440);
  tete.style.display = 'flex';
  tete.style.alignItems = 'center';
  tete.style.gap = '10px';
  return { p, tete };
});

// ─── Corrélations : table ──────────────────────────────────────────────────
function rendreTable(v) {
  const g = gauche;
  g.replaceChildren();
  const desc = donnees.d.descripteurs.descripteurs;
  const xs = [262, 322, 382].slice(0, etat.dim);
  let y = 16;
  xs.forEach((x, k) => T(g, x, y, `D${k + 1}`, 'titre-axe'));
  if (v.comparaison) {
    y += 19;
    T(g, 0, y, 'proche de McAdams', 'indice', 'start');
    v.comparaison.forEach((c, k) => T(g, xs[k], y, c.dim === null ? '-' : `D${c.dim + 1} ${nb(Math.abs(c.r))}`, 'graduation'));
  }
  y += 6;
  let famille = null;
  for (const l of v.analyse.lignes) {
    const d = desc.find((x) => x.cle === l.cle);
    y += famille !== null && d.famille !== famille ? 26 : 21;
    famille = d.famille;
    const nom = T(g, 0, y, d.nom, 'lecture-svg', 'start');
    nom.setAttribute('font-size', 15);
    if (d.cle === etat.cle) nom.setAttribute('fill', '#1971c2');
    l.r.slice(0, etat.dim).forEach((r, k) => {
      const x = xs[k], sig = r !== null && Math.abs(r) >= v.analyse.seuil;
      const cellule = S('g', { class: 'cliquable' }, g);
      S('rect', { x: x - 28, y: y - 15, width: 56, height: 20, fill: 'transparent' }, cellule);
      if (sig) {
        const fort = Math.abs(r);
        R('rectangle', cellule, [x - 26, y - 14, 52, 18], { cle: `c${d.cle}${k}`, stroke: 'none', fill: r > 0 ? '#a5d8ff' : '#ffd8a8',
          hachureGap: fort > 0.8 ? 2.5 : fort > 0.65 ? 3.5 : 5, fillWeight: 1.2 });
      }
      if (d.cle === etat.cle && k === etat.k) R('rectangle', cellule, [x - 27, y - 15, 54, 20], { cle: `s${d.cle}${k}`, strokeWidth: 1.5 });
      const t = T(cellule, x, y, nb(r));
      t.setAttribute('font-size', 15);
      t.setAttribute('fill', sig ? '#1e1e1e' : GRIS);
      cellule.addEventListener('click', () => { etat.cle = d.cle; etat.k = k; etat.A = etat.B = null; rendre(); });
    });
  }
}

// ─── Nuage descripteur × dimension (les deux vues) ─────────────────────────
function rendreNuage(v, d, surComparer) {
  const g = droite;
  g.replaceChildren();
  const ligne = v.analyse.lignes.find((l) => l.cle === d.cle);
  const r = ligne.r[etat.k];
  const xs = v.sons.map((s) => v.valeurs[s.desc][d.cle]);
  const ys = v.points.map((p) => p[etat.k]);
  const marge = (a) => { const lo = Math.min(...a), hi = Math.max(...a), m = (hi - lo) * 0.12 || 1; return [lo - m, hi + m]; };
  const [x0, x1] = marge(xs), [y0, y1] = marge(ys);
  const X = echelle(x0, x1, 46, 322), Y = echelle(y0, y1, 280, 52);
  let ticksX = [];
  if (d.cle === 'attaque') ticksX = [2, 5, 10, 20, 50, 100, 200].map((ms) => Math.log10(ms / 1000)).filter((t) => t >= x0 && t <= x1);
  else { const pasX = nicePas(x1 - x0); for (let t = Math.ceil(x0 / pasX) * pasX; t <= x1; t += pasX) ticksX.push(t); }
  axes(g, { x: X, y: Y, ticksX, formatX: (t) => formatDesc(d, t, true), titreX: `${d.nom}${d.unite && d.cle !== 'attaque' ? ` (${d.unite})` : d.cle === 'attaque' ? ' (ms, échelle log)' : ''}`, titreY: `Dimension ${etat.k + 1}` });
  // Ligne d'en-tête : r en bleu (une seule taille).
  const tete = T(g, 184, 16, '', 'lecture-svg');
  tete.setAttribute('font-size', 16);
  tete.append(`${d.nom} × D${etat.k + 1} : r = `);
  const val = S('tspan', { fill: Math.abs(r ?? 0) >= v.analyse.seuil ? '#1971c2' : GRIS }, tete);
  val.textContent = nb(r);
  const attr = T(g, 184, 36, d.attribut.toLowerCase(), 'indice');
  attr.setAttribute('font-size', 14);
  // Droite de régression (propre, pointillée).
  const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  const pente = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / (xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1);
  const clip = S('clipPath', { id: 'zone' }, g);
  S('rect', { x: 46, y: 52, width: 276, height: 228 }, clip);
  S('line', { x1: X(x0), y1: Y(my + pente * (x0 - mx)), x2: X(x1), y2: Y(my + pente * (x1 - mx)), stroke: GRIS, 'stroke-width': 1.2, 'stroke-dasharray': '6 5', 'clip-path': 'url(#zone)' }, g);
  // Points : disques noirs pleins ; A et B en couleur.
  const px = xs.map(X), py = ys.map(Y);
  const occupe = px.map((x, i) => [x - 5, py[i] - 5, x + 5, py[i] + 5]);
  const libre = (b) => b[0] >= 40 && b[2] <= 336 && !occupe.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
  v.sons.forEach((son, i) => {
    const role = surComparer && (son.desc === etat.A ? 'A' : son.desc === etat.B ? 'B' : null);
    const c = role ? COUL[role] : '#1e1e1e';
    const p = S('g', { class: 'cliquable' }, g);
    S('circle', { cx: px[i], cy: py[i], r: 12, fill: 'transparent' }, p);
    S('circle', { cx: px[i], cy: py[i], r: role ? 6 : 3.5, fill: c }, p);
    const w = son.etiquette.length * 7.5 + 2;
    const essais = [[px[i] + 8, py[i] + 4, 'start'], [px[i] - 8, py[i] + 4, 'end'], [px[i], py[i] - 9, 'middle'], [px[i], py[i] + 17, 'middle']];
    const boite = ([x, y, a]) => { const gx = a === 'start' ? x : a === 'end' ? x - w : x - w / 2; return [gx, y - 11, gx + w, y + 2]; };
    const [lx, ly, a] = essais.find((e) => libre(boite(e))) || essais[0];
    occupe.push(boite([lx, ly, a]));
    const t = T(p, lx, ly, son.etiquette, 'graduation', a);
    if (role) t.setAttribute('fill', c);
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

// Valeur lisible d'un descripteur (graduation ou en-tête).
function formatDesc(d, v, court = false) {
  if (d.cle === 'attaque') { const ms = 10 ** v * 1000; return `${ms < 10 ? nb(ms, 1) : Math.round(ms)}${court ? '' : ' ms'}`; }
  if (d.unite === 'Hz') return `${Math.round(v)}${court ? '' : ' Hz'}`;
  if (d.unite === 's') return `${nb(v, 2)}${court ? '' : ' s'}`;
  if (['flux', 'platitude'].includes(d.cle)) return nb(v, court ? 3 : 4);
  return `${nb(v, court ? 0 : 1)}${court || !d.unite ? '' : ` ${d.unite}`}`;
}

// ─── Comparer : représentation du descripteur pour A et B ──────────────────
// Panneau : 440 × 140 sous son en-tête ; tracé (50, 8) → (430, 112), à la même échelle pour A et B.
const P = { g: 50, d: 404, h: 8, b: 112 };

function rendrePanneaux(v, d) {
  const g = gauche;
  g.replaceChildren();
  const ca = donnees.d.courbes.sons[etat.A], cb = donnees.d.courbes.sons[etat.B];
  const commun = {
    duree: Math.max(ca.duree, cb.duree),
    centroideMax: Math.ceil(Math.max(...[...ca.trames, ...cb.trames].map((q) => q[1])) / 500) * 500,
    fluxMax: Math.max(0.02, ...[...ca.flux, ...cb.flux].map((q) => q[1])),
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
    tracer(zone, d, donnees.d.courbes.sons[etat[p]], COUL[p], { ...commun, valeur: v.valeurs[etat[p]][d.cle], centroide: v.valeurs[etat[p]].centroide }, p);
  }
}

function tracer(g, d, c, coul, e, p) {
  const tX = echelle(0, e.duree, P.g, P.d);
  const pasT = e.duree > 1.2 ? 0.4 : e.duree > 0.6 ? 0.2 : 0.1;
  const ticksT = [];
  for (let t = 0; t <= e.duree + 1e-9; t += pasT) ticksT.push(Number(t.toFixed(2)));
  const fT = (t) => (t === ticksT[ticksT.length - 1] ? `${nb(t, 1)} s` : nb(t, 1));
  const env = c.enveloppe.v.map((a, i) => [c.enveloppe.t0 + i * c.enveloppe.pas, a]);
  const lin = echelle(0, 1, P.b, P.h);
  const zoneHachee = (x0, x1, cle) => R('rectangle', g, [x0, P.h, Math.max(3, x1 - x0), P.b - P.h], { cle, stroke: 'none', fill: '#ced4da', hachureGap: 4, fillWeight: 1 });
  const seuil = (y, texte) => {
    S('line', { x1: P.g, x2: P.d, y1: y, y2: y, stroke: GRIS, 'stroke-width': 1, 'stroke-dasharray': '4 4' }, g);
    T(g, P.d + 2, y + 4, texte, 'graduation', 'start');
  };
  const courbe = (pts) => S('path', { d: chemin(pts), fill: 'none', stroke: coul, 'stroke-width': 1.5 }, g);
  const marque = (x) => S('line', { x1: x, x2: x, y1: P.h, y2: P.b, stroke: '#1e1e1e', 'stroke-width': 1.2, 'stroke-dasharray': '5 4' }, g);
  if (d.famille === 'temporel') {
    if (d.cle === 'decroissance') {
      const Y = echelle(-60, 0, P.b, P.h);
      axes(g, { x: tX, y: Y, ticksX: ticksT, ticksY: [-60, -30, 0], formatX: fT, formatY: String, titreY: 'dB' });
      courbe(env.map(([t, a]) => [tX(t), Y(Math.max(-60, 20 * Math.log10(Math.max(a, 1e-6))))]));
      const [a, b, t1, t2] = c.decroissance;
      S('line', { x1: tX(t1), y1: Y(Math.max(-60, a + b * t1)), x2: tX(t2), y2: Y(Math.max(-60, a + b * t2)), stroke: '#1e1e1e', 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }, g);
      return;
    }
    axes(g, { x: tX, y: lin, ticksX: ticksT, ticksY: [], formatX: fT });
    if (d.cle === 'attaque') {
      const [t1, t2] = c.attaque;
      zoneHachee(tX(t1), tX(t2), 'att' + p);
      seuil(lin(0.1), '10 %'); seuil(lin(0.9), '90 %');
    } else if (d.cle === 'centroide_temporel') {
      marque(tX(c.centroide_temporel));
    } else if (d.cle === 'duree_effective') {
      seuil(lin(0.4), '40 %');
      for (const [a, b] of c.duree_effective) R('line', g, [tX(a), lin(0.4), tX(b), lin(0.4)], { cle: 'de' + p + a, stroke: '#1e1e1e', strokeWidth: 4 });
    }
    courbe(env.map(([t, a]) => [tX(t), lin(a)]));
    return;
  }
  if (d.famille === 'spectral' && d.cle !== 'pente_spectrale') {
    const fX = echelle(0, 6000, P.g, P.d), Y = echelle(-80, 0, P.b, P.h);
    axes(g, { x: fX, y: Y, ticksX: [0, 2000, 4000, 6000], ticksY: [-80, -40, 0], formatX: (f) => (f === 6000 ? '6000 Hz' : String(f)), formatY: String, titreY: 'dB' });
    if (d.cle === 'etalement') zoneHachee(fX(Math.max(0, e.centroide - e.valeur)), fX(Math.min(6000, e.centroide + e.valeur)), 'et' + p);
    S('path', { d: chemin(c.spectre.db.map((db, i) => [fX(i * c.spectre.df), Y(db)])), fill: 'none', stroke: coul, 'stroke-width': 1 }, g);
    if (d.cle === 'centroide') marque(fX(Math.min(e.valeur, 6000)));
    if (d.cle === 'etalement') marque(fX(e.centroide));
    if (d.cle === 'rolloff') marque(fX(Math.min(e.valeur, 6000)));
    return;
  }
  if (d.famille === 'structure fine' || d.cle === 'pente_spectrale') {
    const db = c.harmoniques.db, n = db.length;
    const hX = echelle(0.5, 20.5, P.g, P.d), Y = echelle(-60, 0, P.b, P.h);
    axes(g, { x: hX, y: Y, ticksX: [1, 5, 10, 15, 20], ticksY: [-60, -30, 0], formatX: (h) => (h === 1 ? 'harm. 1' : String(h)), formatY: String, titreY: 'dB' });
    db.forEach((v, i) => {
      const h = i + 1, pair = h % 2 === 0;
      const teinte = d.cle === 'impairs_pairs' ? (h === 1 ? '#ced4da' : pair ? GRIS : coul) : coul;
      S('line', { x1: hX(h), x2: hX(h), y1: P.b, y2: Y(Math.max(-60, v)), stroke: teinte, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    });
    if (d.cle === 'irregularite') {
      for (let i = 1; i < n - 1; i++) {
        const m = Math.max(-60, (db[i - 1] + db[i] + db[i + 1]) / 3);
        S('line', { x1: hX(i + 1) - 7, x2: hX(i + 1) + 7, y1: Y(m), y2: Y(m), stroke: '#1e1e1e', 'stroke-width': 1.5 }, g);
      }
    }
    if (d.cle === 'pente_spectrale') {
      const pts = db.map((v, i) => [Math.log2(i + 1), v]);
      const mx = pts.reduce((a, q) => a + q[0], 0) / n, my = pts.reduce((a, q) => a + q[1], 0) / n;
      const b = pts.reduce((a, q) => a + (q[0] - mx) * (q[1] - my), 0) / pts.reduce((a, q) => a + (q[0] - mx) ** 2, 0);
      S('path', { d: chemin(db.map((_, i) => [hX(i + 1), Y(Math.max(-60, my + b * (Math.log2(i + 1) - mx)))])), fill: 'none', stroke: '#1e1e1e', 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }, g);
    }
    if (d.cle === 'impairs_pairs') T(g, P.d, P.h + 4, 'impaires en couleur, paires en gris', 'indice', 'end');
    return;
  }
  if (d.cle === 'variation_centroide') {
    const Y = echelle(0, e.centroideMax, P.b, P.h);
    axes(g, { x: tX, y: Y, ticksX: ticksT, ticksY: [0, e.centroideMax], formatX: fT, formatY: String, titreY: 'Hz' });
    const tr = c.trames;
    const moy = tr.reduce((a, q) => a + q[1] * q[2] ** 2, 0) / tr.reduce((a, q) => a + q[2] ** 2, 0);
    R('rectangle', g, [P.g, Y(moy + e.valeur), P.d - P.g, Math.max(3, Y(moy - e.valeur) - Y(moy + e.valeur))], { cle: 'vc' + p, stroke: 'none', fill: '#ced4da', hachureGap: 4 });
    S('line', { x1: P.g, x2: P.d, y1: Y(moy), y2: Y(moy), stroke: '#1e1e1e', 'stroke-width': 1, 'stroke-dasharray': '5 4' }, g);
    courbe(tr.map(([t, f]) => [tX(t), Y(f)]));
    return;
  }
  // Flux : 1 − corrélation entre trames successives (enveloppe grise en fond).
  const Y = echelle(0, e.fluxMax, P.b, P.h);
  axes(g, { x: tX, y: Y, ticksX: ticksT, ticksY: [], formatX: fT, titreY: 'flux' });
  S('path', { d: chemin([[tX(env[0][0]), P.b], ...env.map(([t, a]) => [tX(t), lin(a)]), [tX(env[env.length - 1][0]), P.b]]), fill: '#e9ecef', stroke: 'none' }, g);
  courbe(c.flux.map(([t, f]) => [tX(t), Y(Math.min(f, e.fluxMax))]));
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
    : `${v.analyse.n} sons · significatif : |r| > ${nb(v.analyse.seuil)}`;
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
  } catch (e) {
    demo.textContent = e.message;
  }
})();
