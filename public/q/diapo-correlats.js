// Diapositive « Corrélats acoustiques » du Cours 7 (élément HTML d'Excalidraw+, srcdoc).
//
// Interprète les dimensions de l'espace timbral : corrélation de chaque descripteur acoustique
// (donnees/descripteurs-mcadams1995.json, tools/descripteurs_timbre.mjs) avec chaque
// dimension de la carte MDS (correlats.js, correlats-donnees.js).
//   - McAdams : les 18 timbres et la matrice de McAdams et al. (1995).
//   - Classe : le résultat gardé de l'écoute des paires (op=garde&id=c7paires) ; ses six sons
//     sont des timbres de McAdams (« sous_ensemble »), donc mêmes descripteurs. La ligne
//     « ≈ McAdams » indique à quelle dimension de McAdams (mêmes six sons) chaque dimension de
//     la classe ressemble le plus.
// Cliquer une case : nuage de points descripteur × dimension. Cliquer un point : le son joue.
// La diapositive suivante (diapo-paire.js) compare deux sons sur un descripteur.
//
// Document hôte (tools/correlats_cours7.py) :
//   <base href="https://SITE/q/"> <main id="correlats"></main>
//   <script type="application/json" id="config">{"id": "c7paires", "reference": "donnees/mcadams1995.json",
//     "descripteurs": "donnees/descripteurs-mcadams1995.json", "sous_ensemble": ["tpt", …]}</script>
import { svg, txt } from './commun.js';
import { creerDonnees, creerLecteur, pointsEtiquetes, surAffichage, virgule } from './correlats-donnees.js';

const conf = JSON.parse(document.getElementById('config').textContent);
const donnees = creerDonnees(conf);
const lecteur = creerLecteur();

const BLEU = '#1971c2';
const ORANGE = '#e8590c';
const GRIS = '#6b7078';
const FILET = '#d7dae0';

const racine = document.getElementById('correlats');
racine.innerHTML = `
  <header class="barre">
    <div class="bascule" role="group" aria-label="Données">
      <button type="button" data-source="classe">Classe</button>
      <button type="button" data-source="reference" title="McAdams et al. (1995), 18 timbres de synthèse">McAdams</button>
    </div>
    <div class="bascule" role="group" aria-label="Nombre de dimensions">
      <button type="button" data-dim="2">2D</button>
      <button type="button" data-dim="3">3D</button>
    </div>
    <span class="seuil" id="seuil"></span>
  </header>
  <div class="corps">
    <table class="table" id="table" aria-label="Corrélations entre descripteurs et dimensions"></table>
    <div class="nuage"><svg id="nuage" viewBox="0 0 1000 760" role="img" aria-label="Nuage de points"></svg></div>
  </div>
  <footer class="pied"><span id="source" class="source"></span></footer>`;

const ui = {
  table: document.getElementById('table'),
  nuage: document.getElementById('nuage'),
  seuil: document.getElementById('seuil'),
  source: document.getElementById('source'),
};

let choix = null; // 'classe' | 'reference' (null : classe si disponible)
let dim = 3;
let selection = null; // { cle, k }

function source() {
  if (choix) return choix;
  return donnees.d.classe ? 'classe' : 'reference';
}

// ─── Table ─────────────────────────────────────────────────────────────────
function fond(r, faible) {
  if (r === null) return 'transparent';
  const a = Math.min(1, Math.abs(r)) ** 1.5 * (faible ? 0.25 : 0.85);
  return r >= 0 ? `rgba(25, 113, 194, ${a})` : `rgba(232, 89, 12, ${a})`;
}

function rendreTable(v) {
  const { analyse } = v;
  const desc = donnees.d.descripteurs.descripteurs;
  const dims = Array.from({ length: dim }, (_, k) => k);
  let html = '<thead><tr><th class="nom">Descripteur</th>' + dims.map((k) => `<th>D${k + 1}</th>`).join('') + '</tr>';
  if (v.comparaison) {
    html += '<tr class="info"><th class="nom">≈ McAdams</th>' + v.comparaison.map((c) =>
      `<td title="Corrélation avec la dimension de McAdams la plus proche (mêmes six sons)">${c.dim === null ? '—' : `D${c.dim + 1} (${virgule(Math.abs(c.r))})`}</td>`).join('') + '</tr>';
  }
  html += '</thead><tbody>';
  let famille = null;
  for (const l of analyse.lignes) {
    const d = desc.find((x) => x.cle === l.cle);
    const sep = famille !== null && d.famille !== famille ? ' class="sep"' : '';
    famille = d.famille;
    html += `<tr${sep} data-cle="${d.cle}"><th class="nom" title="${d.definition}">${d.nom}</th>`;
    for (const k of dims) {
      const r = l.r[k];
      const classes = ['case'];
      if (r !== null && Math.abs(r) < analyse.seuil) classes.push('faible');
      if (analyse.meilleurs[k] === l.cle) classes.push('meilleur');
      if (selection && selection.cle === l.cle && selection.k === k) classes.push('choisi');
      html += `<td class="${classes.join(' ')}" data-k="${k}" style="background:${fond(r, classes.includes('faible'))}">${virgule(r)}</td>`;
    }
    html += '</tr>';
  }
  ui.table.innerHTML = html + '</tbody>';
  ui.seuil.textContent = `n = ${analyse.n} sons · significatif si |r| ≥ ${virgule(analyse.seuil)}`;
}

// ─── Nuage de points ───────────────────────────────────────────────────────
const NL = 1000, NH = 760, M = { g: 120, d: 30, h: 96, b: 110 };

function rendreNuage(v) {
  const s = ui.nuage;
  s.replaceChildren();
  if (!selection) return;
  const d = donnees.d.descripteurs.descripteurs.find((x) => x.cle === selection.cle);
  const xs = v.sons.map((x) => v.valeurs[x.desc][d.cle]);
  const ys = v.points.map((p) => p[selection.k]);
  const r = v.analyse.lignes.find((l) => l.cle === d.cle).r[selection.k];
  const etendue = (a) => { const lo = Math.min(...a), hi = Math.max(...a), m = (hi - lo) * 0.08 || 1; return [lo - m, hi + m]; };
  const [x0, x1] = etendue(xs), [y0, y1] = etendue(ys);
  const X = (x) => M.g + ((x - x0) / (x1 - x0)) * (NL - M.g - M.d);
  const Y = (y) => NH - M.b - ((y - y0) / (y1 - y0)) * (NH - M.h - M.b);
  s.appendChild(svg('rect', { x: M.g, y: M.h, width: NL - M.g - M.d, height: NH - M.h - M.b, fill: 'none', stroke: FILET, 'stroke-width': 2 }));
  const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  const pente = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / (xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1);
  const yAt = (x) => my + pente * (x - mx);
  s.appendChild(svg('clipPath', { id: 'cadre' }, [svg('rect', { x: M.g, y: M.h, width: NL - M.g - M.d, height: NH - M.h - M.b })]));
  s.appendChild(svg('line', { x1: X(x0), y1: Y(yAt(x0)), x2: X(x1), y2: Y(yAt(x1)), stroke: r >= 0 ? BLEU : ORANGE, 'stroke-width': 4, 'stroke-dasharray': '14 10', 'clip-path': 'url(#cadre)' }));
  const faible = r !== null && Math.abs(r) < v.analyse.seuil;
  const cx = NL / 2 + M.g / 2 - M.d / 2;
  s.appendChild(txt(cx, 36, `r = ${virgule(r)}${faible ? ' (non significatif)' : ''}`, { taille: 38, ancre: 'middle', graisse: 700, couleur: faible ? GRIS : '#16181d' }));
  s.appendChild(txt(cx, 72, `Attribut : ${d.attribut.toLowerCase()}`, { taille: 28, ancre: 'middle', couleur: GRIS }));
  s.appendChild(txt(cx, NH - 40, `${d.nom}${d.unite ? ` (${d.unite})` : ''}`, { taille: 32, ancre: 'middle', couleur: GRIS }));
  const ty = txt(0, 0, `Dimension ${selection.k + 1}`, { taille: 32, ancre: 'middle', couleur: GRIS });
  ty.setAttribute('transform', `translate(${M.g - 60} ${(M.h + NH - M.b) / 2}) rotate(-90)`);
  s.appendChild(ty);
  for (const g of pointsEtiquetes(svg, txt, v.sons, xs.map(X), ys.map(Y), { bornes: [M.g - 10, NL], surClic: (son) => lecteur.jouer(son) })) s.appendChild(g);
}

// ─── Rendu et commandes ────────────────────────────────────────────────────
function rendre() {
  if (!donnees.d.reference) return;
  const v = donnees.vue(source(), dim);
  if (!selection || selection.k >= dim) selection = { cle: 'attaque', k: 0 };
  for (const b of racine.querySelectorAll('[data-source]')) {
    b.setAttribute('aria-pressed', String(b.dataset.source === source()));
    if (b.dataset.source === 'classe') {
      b.disabled = !donnees.d.classe;
      b.title = donnees.d.classe ? 'Résultat de la classe (écoute des paires)' : "La classe n'a pas encore fait l'écoute des paires";
    }
  }
  for (const b of racine.querySelectorAll('[data-dim]')) b.setAttribute('aria-pressed', String(Number(b.dataset.dim) === dim));
  rendreTable(v);
  rendreNuage(v);
  ui.source.textContent = v.source;
  ui.source.classList.toggle('simulee', !!v.simulee);
}

racine.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b?.dataset.source && !b.disabled) { choix = b.dataset.source; rendre(); return; }
  if (b?.dataset.dim) { dim = Number(b.dataset.dim); rendre(); return; }
  const c = e.target.closest('td.case');
  if (c) { selection = { cle: c.parentElement.dataset.cle, k: Number(c.dataset.k) }; rendre(); }
});

surAffichage(async () => { await donnees.chargerClasse(); rendre(); }, () => lecteur.arreter());

(async () => {
  try {
    await donnees.charger();
    await donnees.chargerClasse();
    rendre();
  } catch (e) {
    racine.innerHTML = `<p class="erreur">${e.message}</p>`;
  }
})();
