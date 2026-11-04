// Diapositive « Bruit (noisiness) : mesure temporelle » du Cours 7 (élément HTML d'Excalidraw+,
// srcdoc), dans le style des démos (excali/excali.css, excali/excali.js).
//
// Passages par zéro (zero-crossing rate) : deux sons contrastés par catégorie (parole, musique,
// environnement), une catégorie à la fois (bascule en haut), les deux sons côte à côte (peu de
// passages à gauche, beaucoup à droite). Pour chaque son : 10 ms d'onde représentatives, les passages par zéro marqués
// d'un point, et le taux moyen sur tout le son (passages par
// seconde). Bleu : peu de passages ; orange : beaucoup. Cliquer ▶ ou l'onde : le son joue.
// Données : donnees/zcr-sons.json (tools/zcr_sons.mjs) ; sons : sons/zcr/ et la clarinette de
// McAdams et al. (1995). Source et licence de chaque son dans l'infobulle de son nom.
//
// Document hôte (tools/zcr_cours7.py) :
//   <base href="https://SITE/q/"> <link rel="stylesheet" href="…/q/excali/excali.css">
//   <script src="…/q/excali/rough.js"></script> <div id="demo" class="demo"></div>
//   <script type="application/json" id="config">{"id": "c7zcr"}</script>
import { ajuster, bouton, chemin, choix, echelle, H, placer, S, T } from './excali/excali.js';
import { creerLecteur } from './correlats-donnees.js';

const L = 786, HT = 300;
const COUL = ['#1971c2', '#f08c00'];
const GRIS = '#868e96';
const HAUT_BARRE = 44, ECART = 28, COL = (L - ECART) / 2, HAUT_RANG = 34; // bascule ; écart et largeur des colonnes ; y du tracé sous la ligne de lecture
const conf = JSON.parse(document.getElementById('config')?.textContent || '{}');
const lecteur = creerLecteur();
const milliers = (v) => Math.round(v).toLocaleString('fr-CA').replace(/\s/g, ' ');

const demo = document.getElementById('demo');
const barre = placer(H('div', null, null, demo), 0, 0);
const svg = placer(S('svg', { width: L, height: HT - HAUT_BARRE }), 0, HAUT_BARRE);
demo.append(svg);
let donnees = null, categorie = 0;
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
  [donnees.categories[categorie]].forEach((c) => {
    c.sons.forEach((s, i) => {
      const x0 = i * (COL + ECART), coul = COUL[i];
      // Ligne de lecture : ▶, nom (source en infobulle), taux moyen à droite.
      const tete = placer(H('div', 'lecture', null, demo), x0, HAUT_BARRE, COL);
      tete.style.display = 'flex';
      tete.style.alignItems = 'center';
      tete.style.gap = '8px';
      tetes.push(tete);
      const b = bouton(tete, '', () => jouer(s), { largeur: 34, hauteur: 26, jouer: true, titre: `Écouter : ${s.nom}` });
      if (lecteur.enCours() === s) b.lecture(true);
      const nom = H('span', null, s.nom, tete);
      nom.style.color = coul;
      nom.title = source(s);
      const val = H('span', null, `${milliers(s.zcr)} par seconde`, tete);
      val.style.marginLeft = 'auto';
      val.style.color = coul;
      val.title = 'Passages par zéro par seconde, en moyenne sur tout le son';
      tracer(S('g', { transform: `translate(${x0} ${HAUT_RANG})`, class: 'cliquable' }, svg), s, coul);
    });
  });
}

// 10 ms d'onde (amplitude ramenée à son maximum), ligne du zéro, un point par passage.
function tracer(g, s, coul) {
  g.addEventListener('click', () => jouer(s));
  const o = s.onde, dur = o.v.length * o.dt * 1000, h = 170;
  const X = echelle(0, dur, 8, COL - 28), Y = echelle(-1, 1, h, 2);
  S('rect', { x: 0, y: 0, width: COL, height: h + 26, fill: '#fff', 'fill-opacity': 0 }, g); // zone cliquable
  S('line', { x1: X(0), x2: X(dur), y1: Y(0), y2: Y(0), stroke: GRIS, 'stroke-width': 1 }, g);
  S('path', { d: chemin(o.v.map((v, k) => [X(k * o.dt * 1000), Y(v)])), fill: 'none', stroke: coul, 'stroke-width': 1.3, 'stroke-linejoin': 'round' }, g);
  for (let k = 1; k < o.v.length; k++) {
    const [a, b] = [o.v[k - 1], o.v[k]];
    if ((a < 0) !== (b < 0)) S('circle', { cx: X((k - 1 + a / (a - b)) * o.dt * 1000), cy: Y(0), r: 2.2, fill: '#1e1e1e' }, g);
  }
  // Échelle de temps : une graduation par milliseconde.
  const bas = h + 6;
  S('line', { x1: X(0), x2: X(dur), y1: bas, y2: bas, class: 'trait' }, g);
  for (let t = 0; t <= Math.round(dur); t++) {
    S('line', { x1: X(t), x2: X(t), y1: bas, y2: bas + 4, class: 'trait' }, g);
    T(g, X(t), bas + 17, t === Math.round(dur) ? `${t} ms` : String(t));
  }
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
    choix(barre, donnees.categories.map((c, j) => ({ texte: c.nom, valeur: j })), categorie,
      (j) => { categorie = j; lecteur.arreter(); rendre(); }, { largeur: 120 });
    rendre();
  } catch (e) {
    demo.textContent = e.message;
  }
})();
