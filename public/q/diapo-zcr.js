// Diapositive « Bruit (noisiness) : mesure temporelle » du Cours 7 (élément HTML d'Excalidraw+,
// srcdoc), dans le style des démos (excali/excali.css, excali/excali.js).
//
// Passages par zéro (zero-crossing rate) : deux sons contrastés par catégorie (parole, musique,
// environnement), en colonnes. Pour chaque son : 10 ms d'onde représentatives, les passages par
// zéro marqués d'un point, leur nombre dans la fenêtre, et le taux moyen sur tout le son (passages
// par seconde). Bleu : peu de passages ; orange : beaucoup. Cliquer ▶ ou l'onde : le son joue.
// Données : donnees/zcr-sons.json (tools/zcr_sons.mjs) ; sons : sons/zcr/ et la clarinette de
// McAdams et al. (1995). Source et licence de chaque son dans l'infobulle de son nom.
//
// Document hôte (tools/zcr_cours7.py) :
//   <base href="https://SITE/q/"> <link rel="stylesheet" href="…/q/excali/excali.css">
//   <script src="…/q/excali/rough.js"></script> <div id="demo" class="demo"></div>
//   <script type="application/json" id="config">{"id": "c7zcr"}</script>
import { ajuster, bouton, chemin, echelle, H, placer, S, T } from './excali/excali.js';
import { creerLecteur } from './correlats-donnees.js';

const L = 786, HT = 300;
const COUL = ['#1971c2', '#f08c00'];
const GRIS = '#868e96';
const COL = 250, ECART = (L - 3 * COL) / 2; // trois colonnes
const RANG = 136, HAUT_RANG = 30; // hauteur d'un son ; y de son tracé sous la ligne de lecture
const conf = JSON.parse(document.getElementById('config')?.textContent || '{}');
const lecteur = creerLecteur();
const milliers = (v) => Math.round(v).toLocaleString('fr-CA').replace(/\s/g, ' ');

const demo = document.getElementById('demo');
const svg = placer(S('svg', { width: L, height: HT }), 0, 0);
demo.append(svg);
let donnees = null;
const tetes = [];

function source(s) {
  const q = s.source;
  return q.licence ? `${q.titre}, ${q.auteur}, ${q.licence} (Wikimedia Commons)` : q.titre;
}

function rendre() {
  if (!donnees) return;
  svg.replaceChildren();
  tetes.forEach((t) => t.remove());
  tetes.length = 0;
  donnees.categories.forEach((c, j) => {
    const x0 = j * (COL + ECART);
    T(svg, x0 + COL / 2, 16, c.nom, 'titre-axe');
    c.sons.forEach((s, i) => {
      const y0 = 28 + i * RANG, coul = COUL[i];
      // Ligne de lecture : ▶, nom (source en infobulle), taux moyen à droite.
      const tete = placer(H('div', 'lecture', null, demo), x0, y0, COL);
      tete.style.display = 'flex';
      tete.style.alignItems = 'center';
      tete.style.gap = '8px';
      tetes.push(tete);
      const b = bouton(tete, '', () => jouer(s), { largeur: 34, hauteur: 26, jouer: true, titre: `Écouter : ${s.nom}` });
      if (lecteur.enCours() === s) b.lecture(true);
      const nom = H('span', null, s.nom, tete);
      nom.style.color = coul;
      nom.title = source(s);
      const val = H('span', null, `${milliers(s.zcr)}/s`, tete);
      val.style.marginLeft = 'auto';
      val.style.color = coul;
      val.title = 'Passages par zéro par seconde, en moyenne sur tout le son';
      tracer(S('g', { transform: `translate(${x0} ${y0 + HAUT_RANG})`, class: 'cliquable' }, svg), s, coul);
    });
  });
}

// 10 ms d'onde (amplitude ramenée à son maximum), ligne du zéro, un point par passage.
function tracer(g, s, coul) {
  g.addEventListener('click', () => jouer(s));
  const o = s.onde, dur = o.v.length * o.dt * 1000, h = 70;
  const X = echelle(0, dur, 2, COL - 2), Y = echelle(-1, 1, h, 4);
  S('rect', { x: 0, y: 0, width: COL, height: h + 26, fill: '#fff', 'fill-opacity': 0 }, g); // zone cliquable
  S('line', { x1: X(0), x2: X(dur), y1: Y(0), y2: Y(0), stroke: GRIS, 'stroke-width': 1 }, g);
  S('path', { d: chemin(o.v.map((v, k) => [X(k * o.dt * 1000), Y(v)])), fill: 'none', stroke: coul, 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, g);
  let n = 0;
  for (let k = 1; k < o.v.length; k++) {
    const [a, b] = [o.v[k - 1], o.v[k]];
    if ((a < 0) === (b < 0)) continue;
    n++;
    S('circle', { cx: X((k - 1 + a / (a - b)) * o.dt * 1000), cy: Y(0), r: 2.2, fill: '#1e1e1e' }, g);
  }
  // Échelle de temps : 0 et 10 ms, et le nombre de passages dans la fenêtre.
  const bas = h + 6;
  S('line', { x1: X(0), x2: X(dur), y1: bas, y2: bas, class: 'trait' }, g);
  for (const t of [0, dur]) S('line', { x1: X(t), x2: X(t), y1: bas, y2: bas + 4, class: 'trait' }, g);
  T(g, X(0), bas + 17, '0', 'graduation', 'start');
  T(g, X(dur), bas + 17, `${Math.round(dur)} ms`, 'graduation', 'end');
  T(g, X(dur / 2), bas + 17, `${n} passage${n > 1 ? 's' : ''} par zéro`, 'graduation');
}

function jouer(s) {
  lecteur.jouer(s, () => rendre());
  rendre();
}

ajuster(demo, L, HT, { surMasque: () => { lecteur.arreter(); rendre(); } });

(async () => {
  try {
    const r = await fetch(conf.donnees || 'donnees/zcr-sons.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error(`Données introuvables (${r.status})`);
    donnees = await r.json();
    rendre();
  } catch (e) {
    demo.textContent = e.message;
  }
})();
