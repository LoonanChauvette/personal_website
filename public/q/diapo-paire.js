// Diapositive « Comparer deux sons » du Cours 7 (élément HTML d'Excalidraw+, srcdoc), après
// « Corrélats acoustiques » (diapo-correlats.js).
//
// Un descripteur, deux sons (A en bleu, B en orange) : à gauche, la représentation du
// descripteur pour chacun, à la même échelle (enveloppe et seuils, spectre moyen, harmoniques,
// évolution dans le temps) ; à droite, le nuage descripteur × dimension la plus corrélée, A et
// B mis en évidence (comme les figures de McAdams, 2013). Cliquer un point : il devient A ou B
// (en alternance) et joue. ▶ : écouter A ou B.
// Courbes : donnees/courbes-mcadams1995.json (tools/descripteurs_timbre.mjs).
//
// Document hôte (tools/correlats_cours7.py) : <main id="paire"></main>, même config que
// diapo-correlats.js, plus "courbes": "donnees/courbes-mcadams1995.json".
import { svg, txt } from './commun.js';
import { creerDonnees, creerLecteur, pointsEtiquetes, surAffichage, virgule } from './correlats-donnees.js';

const conf = JSON.parse(document.getElementById('config').textContent);
const donnees = creerDonnees({ courbes: 'donnees/courbes-mcadams1995.json', ...conf });
const lecteur = creerLecteur();

const COUL = { A: '#1971c2', B: '#e8590c' };
const GRIS = '#6b7078';
const FILET = '#d7dae0';
const DIM = 3;

const racine = document.getElementById('paire');
racine.innerHTML = `
  <header class="barre">
    <div class="bascule" role="group" aria-label="Données">
      <button type="button" data-source="classe">Classe</button>
      <button type="button" data-source="reference" title="McAdams et al. (1995), 18 timbres de synthèse">McAdams</button>
    </div>
    <select id="descripteur" aria-label="Descripteur" title="Descripteur comparé ; cliquer deux points du nuage pour choisir A et B"></select>
    <div class="bascule" role="group" aria-label="Dimension du nuage">
      <button type="button" data-k="0">D1</button>
      <button type="button" data-k="1">D2</button>
      <button type="button" data-k="2">D3</button>
    </div>

  </header>
  <div class="corps paire">
    <div class="panneaux">
      <section class="panneau" data-p="A"><div class="tete"></div><svg viewBox="0 0 1000 300"></svg></section>
      <section class="panneau" data-p="B"><div class="tete"></div><svg viewBox="0 0 1000 300"></svg></section>
    </div>
    <div class="nuage"><svg id="nuage" viewBox="0 0 1000 900" role="img" aria-label="Nuage de points"></svg></div>
  </div>
  <footer class="pied"><span id="source" class="source"></span></footer>`;

const ui = { select: document.getElementById('descripteur'), nuage: document.getElementById('nuage'), source: document.getElementById('source') };

let choix = null;
let cle = 'attaque';
const paire = { A: null, B: null }; // clés de descripteurs des sons (ex. 'vbs')
let prochain = 'A';
let dimChoisie = null; // null : la dimension la plus corrélée au descripteur

function source() {
  if (choix) return choix;
  return donnees.d.classe ? 'classe' : 'reference';
}

// ─── Valeurs lisibles ──────────────────────────────────────────────────────
function valeurTexte(d, v) {
  if (d.cle === 'attaque') { const ms = 10 ** v * 1000; return `${virgule(ms, ms < 10 ? 1 : 0)} ms`; }
  if (d.unite === 'Hz') return `${Math.round(v)} Hz`;
  if (d.unite === 's') return `${virgule(v, 2)} s`;
  if (['flux', 'platitude'].includes(d.cle)) return virgule(v, 4);
  return `${virgule(v, 1)}${d.unite ? ` ${d.unite}` : ''}`;
}

// ─── Représentation d'un descripteur pour un son ───────────────────────────
// Repère du panneau : 1000 × 300, cadre de tracé (G, H) → (D, B).
const P = { g: 80, d: 980, h: 16, b: 250 };

function cadre(s, etiqX, ticksX, X, etiqY) {
  s.appendChild(svg('line', { x1: P.g, y1: P.b, x2: P.d, y2: P.b, stroke: GRIS, 'stroke-width': 2 }));
  s.appendChild(svg('line', { x1: P.g, y1: P.h, x2: P.g, y2: P.b, stroke: GRIS, 'stroke-width': 2 }));
  for (const [v, t] of ticksX) s.appendChild(txt(X(v), P.b + 30, t, { taille: 22, ancre: 'middle', couleur: GRIS }));
  s.appendChild(txt(P.d, P.b + 30, etiqX, { taille: 22, ancre: 'end', couleur: GRIS }));
  if (etiqY) {
    const t = txt(0, 0, etiqY, { taille: 22, ancre: 'middle', couleur: GRIS });
    t.setAttribute('transform', `translate(${P.g - 30} ${(P.h + P.b) / 2}) rotate(-90)`);
    s.appendChild(t);
  }
}

const chemin = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L');
const ticks = (lo, hi, n, fmt) => Array.from({ length: n + 1 }, (_, i) => lo + ((hi - lo) * i) / n).map((v) => [v, fmt(v)]);
const ligneV = (s, x, coul, tiret = '') => s.appendChild(svg('line', { x1: x, y1: P.h, x2: x, y2: P.b, stroke: coul, 'stroke-width': 3, 'stroke-dasharray': tiret }));
const ligneH = (s, y, coul, tiret = '8 6') => s.appendChild(svg('line', { x1: P.g, y1: y, x2: P.d, y2: y, stroke: coul, 'stroke-width': 2, 'stroke-dasharray': tiret }));
const note = (s, x, y, t, coul, ancre = 'start') => s.appendChild(txt(x, y, t, { taille: 24, couleur: coul, ancre, graisse: 600 }));

// Échelles communes aux deux sons (comparaison à la même échelle).
function echelles(d, ca, cb) {
  const dureeMax = Math.max(ca.duree, cb.duree);
  return { dureeMax };
}

function tracer(s, d, c, coul, e) {
  s.replaceChildren();
  const tempsX = (t) => P.g + (t / e.dureeMax) * (P.d - P.g);
  const pasT = e.dureeMax > 1.2 ? 0.4 : e.dureeMax > 0.6 ? 0.2 : 0.1;
  const ticksT = Array.from({ length: Math.floor(e.dureeMax / pasT) }, (_, i) => (i + 1) * pasT)
    .filter((v) => v < e.dureeMax * 0.86).map((v) => [v, virgule(v, 1)]);
  const env = c.enveloppe.v.map((v, i) => [c.enveloppe.t0 + i * c.enveloppe.pas, v]);
  const lin = (v) => P.b - v * (P.b - P.h);
  if (d.famille === 'temporel') {
    if (d.cle === 'decroissance') {
      const db = (v) => Math.max(-60, 20 * Math.log10(Math.max(v, 1e-6)));
      const Y = (v) => P.h + (-v / 60) * (P.b - P.h);
      cadre(s, 'temps (s)', ticksT, tempsX, 'dB');
      s.appendChild(svg('path', { d: chemin(env.map(([t, v]) => [tempsX(t), Y(db(v))])), fill: 'none', stroke: coul, 'stroke-width': 3 }));
      const [a, b, t1, t2] = c.decroissance;
      s.appendChild(svg('line', { x1: tempsX(t1), y1: Y(Math.max(-60, a + b * t1)), x2: tempsX(t2), y2: Y(Math.max(-60, a + b * t2)), stroke: '#16181d', 'stroke-width': 3, 'stroke-dasharray': '10 6' }));
      return;
    }
    cadre(s, 'temps (s)', ticksT, tempsX, 'amplitude');
    s.appendChild(svg('path', { d: chemin([[tempsX(env[0][0]), P.b], ...env.map(([t, v]) => [tempsX(t), lin(v)]), [tempsX(env[env.length - 1][0]), P.b]]), fill: coul, 'fill-opacity': 0.15, stroke: coul, 'stroke-width': 3 }));
    if (d.cle === 'attaque') {
      ligneH(s, lin(0.1), GRIS); ligneH(s, lin(0.9), GRIS);
      const [t1, t2] = c.attaque;
      s.appendChild(svg('rect', { x: tempsX(t1), y: P.h, width: Math.max(3, tempsX(t2) - tempsX(t1)), height: P.b - P.h, fill: '#16181d', 'fill-opacity': 0.12 }));
      ligneV(s, tempsX(t1), '#16181d'); ligneV(s, tempsX(t2), '#16181d');
      note(s, P.d - 4, lin(0.9) - 8, '90 %', GRIS, 'end'); note(s, P.d - 4, lin(0.1) - 8, '10 %', GRIS, 'end');
    } else if (d.cle === 'centroide_temporel') {
      ligneV(s, tempsX(c.centroide_temporel), '#16181d', '10 6');
    } else if (d.cle === 'duree_effective') {
      ligneH(s, lin(0.4), GRIS);
      note(s, P.d - 4, lin(0.4) - 8, '40 %', GRIS, 'end');
      for (const [a, b] of c.duree_effective) s.appendChild(svg('line', { x1: tempsX(a), y1: lin(0.4), x2: tempsX(b), y2: lin(0.4), stroke: '#16181d', 'stroke-width': 8 }));
    }
    return;
  }
  if (d.famille === 'spectral' && d.cle !== 'pente_spectrale') {
    const fmax = 6000, X = (f) => P.g + (f / fmax) * (P.d - P.g), Y = (db) => P.h + (-db / 80) * (P.b - P.h);
    cadre(s, 'fréquence (Hz)', ticks(0, fmax, 3, (v) => String(Math.round(v))).slice(1, -1), X, 'dB');
    const pts = c.spectre.db.map((v, i) => [X(i * c.spectre.df), Y(v)]);
    s.appendChild(svg('path', { d: chemin([[P.g, P.b], ...pts, [pts[pts.length - 1][0], P.b]]), fill: coul, 'fill-opacity': 0.15, stroke: coul, 'stroke-width': 2 }));
    const v = e.valeur;
    if (d.cle === 'centroide') ligneV(s, X(Math.min(v, fmax)), '#16181d', '10 6');
    if (d.cle === 'rolloff') ligneV(s, X(Math.min(v, fmax)), '#16181d', '10 6');
    if (d.cle === 'etalement') {
      const cg = e.centroide;
      s.appendChild(svg('rect', { x: X(Math.max(0, cg - v)), y: P.h, width: X(Math.min(fmax, cg + v)) - X(Math.max(0, cg - v)), height: P.b - P.h, fill: '#16181d', 'fill-opacity': 0.1 }));
      ligneV(s, X(cg), '#16181d', '10 6');
    }
    return;
  }
  if (d.famille === 'structure fine' || d.cle === 'pente_spectrale') {
    const db = c.harmoniques.db, n = db.length;
    const X = (h) => P.g + ((h - 0.5) / 20) * (P.d - P.g), Y = (v) => P.h + (Math.min(60, -v) / 60) * (P.b - P.h);
    cadre(s, 'rang', [1, 5, 10, 15].map((h) => [h, String(h)]), X, 'dB');
    db.forEach((v, i) => {
      const h = i + 1;
      const impair = h >= 3 && h % 2 === 1, pair = h % 2 === 0;
      const remplissage = d.cle === 'impairs_pairs' ? (impair ? coul : pair ? '#adb5bd' : '#dee2e6') : coul;
      s.appendChild(svg('rect', { x: X(h) - 14, y: Y(v), width: 28, height: P.b - Y(v), fill: remplissage, 'fill-opacity': d.cle === 'impairs_pairs' ? 0.9 : 0.55 }));
    });
    if (d.cle === 'irregularite') {
      for (let i = 1; i < n - 1; i++) {
        const m = (db[i - 1] + db[i] + db[i + 1]) / 3;
        s.appendChild(svg('line', { x1: X(i + 1) - 18, y1: Y(m), x2: X(i + 1) + 18, y2: Y(m), stroke: '#16181d', 'stroke-width': 3 }));
      }
    }
    if (d.cle === 'pente_spectrale') {
      const pts = db.map((v, i) => [Math.log2(i + 1), v]);
      const mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n;
      const b = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0);
      s.appendChild(svg('path', { d: chemin(db.map((_, i) => [X(i + 1), Y(my + b * (Math.log2(i + 1) - mx))])), fill: 'none', stroke: '#16181d', 'stroke-width': 3, 'stroke-dasharray': '10 6' }));
    }
    if (d.cle === 'impairs_pairs') note(s, P.d - 4, P.h + 22, 'impaires en couleur, paires en gris', GRIS, 'end');
    return;
  }
  // Spectro-temporel : évolution dans le temps.
  if (d.cle === 'variation_centroide') {
    const fmax = e.centroideMax, Y = (f) => P.b - (f / fmax) * (P.b - P.h);
    cadre(s, 'temps (s)', ticksT, tempsX, 'centroïde (Hz)');
    const tr = c.trames;
    const moy = tr.reduce((a, q) => a + q[1] * q[2] ** 2, 0) / tr.reduce((a, q) => a + q[2] ** 2, 0);
    s.appendChild(svg('rect', { x: P.g, y: Y(moy + e.valeur), width: P.d - P.g, height: Math.max(2, Y(moy - e.valeur) - Y(moy + e.valeur)), fill: '#16181d', 'fill-opacity': 0.08 }));
    ligneH(s, Y(moy), '#16181d');
    s.appendChild(svg('path', { d: chemin(tr.map(([t, f]) => [tempsX(t), Y(f)])), fill: 'none', stroke: coul, 'stroke-width': 3 }));
    note(s, P.g + 8, P.h + 22, `${fmax} Hz`, GRIS);
    return;
  }
  // Flux : 1 − corrélation entre trames successives, dans le temps (énergie en fond).
  const fmax = e.fluxMax, Y = (f) => P.b - (Math.min(f, fmax) / fmax) * (P.b - P.h);
  cadre(s, 'temps (s)', ticksT, tempsX, 'flux');
  s.appendChild(svg('path', { d: chemin([[tempsX(env[0][0]), P.b], ...env.map(([t, v]) => [tempsX(t), lin(v)]), [tempsX(env[env.length - 1][0]), P.b]]), fill: '#adb5bd', 'fill-opacity': 0.2, stroke: 'none' }));
  s.appendChild(svg('path', { d: chemin(c.flux.map(([t, f]) => [tempsX(t), Y(f)])), fill: 'none', stroke: coul, 'stroke-width': 3 }));
}

// ─── Nuage : descripteur × dimension (par défaut la plus corrélée) ─────────
const meilleureDim = (ligne) => ligne.r.reduce((m, r, i) => (Math.abs(r ?? 0) > Math.abs(ligne.r[m] ?? 0) ? i : m), 0);
const NL = 1000, NH = 900, M = { g: 110, d: 30, h: 70, b: 100 };

function rendreNuage(v, d) {
  const s = ui.nuage;
  s.replaceChildren();
  const ligne = v.analyse.lignes.find((l) => l.cle === d.cle);
  const k = dimChoisie ?? meilleureDim(ligne);
  for (const b of racine.querySelectorAll('[data-k]')) b.setAttribute('aria-pressed', String(Number(b.dataset.k) === k));
  const r = ligne.r[k];
  const xs = v.sons.map((x) => v.valeurs[x.desc][d.cle]);
  const ys = v.points.map((p) => p[k]);
  const etendue = (a) => { const lo = Math.min(...a), hi = Math.max(...a), m = (hi - lo) * 0.08 || 1; return [lo - m, hi + m]; };
  const [x0, x1] = etendue(xs), [y0, y1] = etendue(ys);
  const X = (x) => M.g + ((x - x0) / (x1 - x0)) * (NL - M.g - M.d);
  const Y = (y) => NH - M.b - ((y - y0) / (y1 - y0)) * (NH - M.h - M.b);
  s.appendChild(svg('rect', { x: M.g, y: M.h, width: NL - M.g - M.d, height: NH - M.h - M.b, fill: 'none', stroke: FILET, 'stroke-width': 2 }));
  const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  const pente = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / (xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1);
  s.appendChild(svg('clipPath', { id: 'cadre' }, [svg('rect', { x: M.g, y: M.h, width: NL - M.g - M.d, height: NH - M.h - M.b })]));
  s.appendChild(svg('line', { x1: X(x0), y1: Y(my + pente * (x0 - mx)), x2: X(x1), y2: Y(my + pente * (x1 - mx)), stroke: GRIS, 'stroke-width': 3, 'stroke-dasharray': '12 9', 'clip-path': 'url(#cadre)' }));
  s.appendChild(txt((NL + M.g) / 2, 44, `Dimension ${k + 1} : r = ${virgule(r)}`, { taille: 36, ancre: 'middle', graisse: 700 }));
  s.appendChild(txt((NL + M.g) / 2, NH - 30, `${d.nom}${d.unite ? ` (${d.unite})` : ''}`, { taille: 32, ancre: 'middle', couleur: GRIS }));
  const ty = txt(0, 0, `Dimension ${k + 1}`, { taille: 32, ancre: 'middle', couleur: GRIS });
  ty.setAttribute('transform', `translate(${M.g - 55} ${(M.h + NH - M.b) / 2}) rotate(-90)`);
  s.appendChild(ty);
  const role = (son) => (son.desc === paire.A ? 'A' : son.desc === paire.B ? 'B' : '');
  const pts = pointsEtiquetes(svg, txt, v.sons, xs.map(X), ys.map(Y), {
    bornes: [M.g - 10, NL],
    classe: (son) => (role(son) ? `choisi-${role(son)}` : ''),
    surClic: (son) => {
      if (son.desc === paire.A || son.desc === paire.B) { lecteur.jouer(son); return; }
      paire[prochain] = son.desc;
      prochain = prochain === 'A' ? 'B' : 'A';
      lecteur.jouer(son);
      rendre();
    },
  });
  for (const g of pts) {
    s.appendChild(g);
    const p = g.getAttribute('class').match(/choisi-(A|B)/)?.[1];
    if (p) {
      const c = g.querySelector('circle');
      c.setAttribute('fill', COUL[p]);
      c.setAttribute('r', 17);
      g.querySelector('text').setAttribute('fill', COUL[p]);
      g.querySelector('text').setAttribute('font-weight', 700);
    }
  }
}

// ─── Rendu ─────────────────────────────────────────────────────────────────
function paireParDefaut(v, d) {
  const cles = v.sons.map((s) => s.desc);
  if (source() === 'reference' && d.cle === 'attaque' && cles.includes('vbs') && cles.includes('hrn')) return ['vbs', 'hrn']; // comme McAdams (2013)
  const tri = [...cles].sort((a, b) => v.valeurs[a][d.cle] - v.valeurs[b][d.cle]);
  return [tri[0], tri[tri.length - 1]];
}

function rendre() {
  if (!donnees.d.reference) return;
  const v = donnees.vue(source(), DIM);
  const desc = donnees.d.descripteurs.descripteurs;
  const d = desc.find((x) => x.cle === cle);
  const cles = v.sons.map((s) => s.desc);
  if (!cles.includes(paire.A) || !cles.includes(paire.B)) [paire.A, paire.B] = paireParDefaut(v, d);
  for (const b of racine.querySelectorAll('[data-source]')) {
    b.setAttribute('aria-pressed', String(b.dataset.source === source()));
    if (b.dataset.source === 'classe') b.disabled = !donnees.d.classe;
  }
  const ca = donnees.d.courbes.sons[paire.A], cb = donnees.d.courbes.sons[paire.B];
  const base = echelles(d, ca, cb);
  base.centroideMax = Math.ceil(Math.max(...[...ca.trames, ...cb.trames].map((q) => q[1])) / 500) * 500;
  base.fluxMax = Math.max(0.02, ...[...ca.flux, ...cb.flux].map((q) => q[1]));
  for (const p of ['A', 'B']) {
    const son = v.sons.find((s) => s.desc === paire[p]);
    const val = v.valeurs[paire[p]][d.cle];
    const el = racine.querySelector(`.panneau[data-p="${p}"]`);
    el.querySelector('.tete').innerHTML = `<button type="button" class="jouer" data-p="${p}" style="--c:${COUL[p]}" aria-label="Écouter ${son.nom}">▶</button>` +
      `<b class="nom-son" style="color:${COUL[p]}" title="${son.nom}">${son.nom}</b><span class="valeur"><b>${valeurTexte(d, val)}</b></span>`;
    tracer(el.querySelector('svg'), d, donnees.d.courbes.sons[paire[p]], COUL[p], { ...base, valeur: val, centroide: v.valeurs[paire[p]].centroide });
  }
  rendreNuage(v, d);
  ui.source.textContent = v.source;
  ui.source.classList.toggle('simulee', !!v.simulee);
}

function remplirSelect() {
  const desc = donnees.d.descripteurs.descripteurs;
  const familles = [...new Set(desc.map((d) => d.famille))];
  ui.select.innerHTML = familles.map((f) => `<optgroup label="${f[0].toUpperCase() + f.slice(1)}">` +
    desc.filter((d) => d.famille === f).map((d) => `<option value="${d.cle}"${d.cle === cle ? ' selected' : ''}>${d.nom}</option>`).join('') + '</optgroup>').join('');
}

ui.select.addEventListener('change', () => {
  cle = ui.select.value;
  dimChoisie = null;
  const v = donnees.vue(source(), DIM);
  [paire.A, paire.B] = paireParDefaut(v, donnees.d.descripteurs.descripteurs.find((x) => x.cle === cle));
  prochain = 'A';
  rendre();
});

racine.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.source && !b.disabled) { choix = b.dataset.source; paire.A = paire.B = null; rendre(); return; }
  if (b.dataset.k !== undefined) { dimChoisie = Number(b.dataset.k); rendre(); return; }
  if (b.classList.contains('jouer')) {
    const v = donnees.vue(source(), DIM);
    lecteur.jouer(v.sons.find((s) => s.desc === paire[b.dataset.p]));
  }
});

surAffichage(async () => { await donnees.chargerClasse(); rendre(); }, () => lecteur.arreter());

(async () => {
  try {
    await donnees.charger();
    await donnees.chargerClasse();
    remplirSelect();
    rendre();
  } catch (e) {
    racine.innerHTML = `<p class="erreur">${e.message}</p>`;
  }
})();
