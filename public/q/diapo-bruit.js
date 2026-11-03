// Diapositive « Bruit (noisiness) » du Cours 7 (élément HTML d'Excalidraw+, srcdoc, demi-largeur),
// dans le style des démos (excali/excali.css, excali/excali.js).
//
// Bascule entre trois descripteurs de bruit (rapport de bruit, platitude spectrale, facteur de
// crête) et entre trois instruments réels (flûte, violon, clarinette). Le spectre moyen du son
// choisi montre le descripteur (spectre-bruit.js : bruit hors des harmoniques en gris ; paliers par
// bande d'octave pour la platitude et la crête) ; au-dessus, la valeur des trois sons, le choisi
// en bleu. ▶ : le son joue.
// Données : donnees/bruit-sons.json (tools/bruit_sons.mjs, mêmes calculs que les corrélats).
//
// Document hôte (tools/bruit_cours7.py) :
//   <base href="https://SITE/q/"> <link rel="stylesheet" href="…/q/excali/excali.css">
//   <script src="…/q/excali/rough.js"></script> <div id="demo" class="demo"></div>
//   <script type="application/json" id="config">{"id": "c7bruit"}</script>
import { ajuster, bouton, choix, ECART_COMMANDES, H, placer, S, T } from './excali/excali.js';
import { creerLecteur } from './correlats-donnees.js';
import { tracerSpectreBruit } from './spectre-bruit.js';

const L = 400, HT = 370;
const BLEU = '#1971c2', GRIS = '#868e96';
const HAUT_SVG = 120; // y du tracé (sous les commandes et les valeurs)
const CADRE = { g: 40, d: L - 10, h: 30, b: HT - HAUT_SVG - 26 };
const NOMS = { rapport_bruit: 'Ratio de bruit', platitude: 'Platitude', crete: 'Crête' };
const conf = JSON.parse(document.getElementById('config')?.textContent || '{}');
const lecteur = creerLecteur();
const etat = { cle: 'rapport_bruit', son: 0 };
const nb = (v, d) => v.toFixed(d).replace('.', ',').replace('-', '−');
const valeur = (cle, v) => (cle === 'platitude' ? nb(v, 3) : `${nb(v, 1)} dB`);

const demo = document.getElementById('demo');
const ligne1 = placer(H('div', null, null, demo), 0, 0);
const ligne2 = placer(H('div', null, null, demo), 0, 44);
ligne2.style.display = 'flex';
ligne2.style.gap = ECART_COMMANDES + 'px';
const valeurs = placer(H('div', 'lecture', null, demo), 0, 88, L);
valeurs.style.display = 'flex';
valeurs.style.justifyContent = 'space-between';
const svg = placer(S('svg', { width: L, height: HT - HAUT_SVG }), 0, HAUT_SVG);
demo.append(svg);
let donnees = null, jouer = null;

function rendre() {
  if (!donnees) return;
  const son = donnees.sons[etat.son];
  jouer.lecture(lecteur.enCours() === son);
  valeurs.replaceChildren();
  for (const [i, s] of donnees.sons.entries()) {
    const e = H('span', null, `${s.nom} ${valeur(etat.cle, s[etat.cle])}`, valeurs);
    e.style.color = i === etat.son ? BLEU : GRIS;
  }
  svg.replaceChildren();
  legende(svg, tracerSpectreBruit(svg, etat.cle, son.spectre, CADRE, BLEU));
}

// Légende alignée à droite au-dessus du tracé.
function legende(g, items) {
  let x = CADRE.d;
  const y = 10;
  for (const it of [...items].reverse()) {
    const t = T(g, x, y + 4, it.texte, 'indice', 'end');
    t.setAttribute('font-size', 13);
    x -= t.getComputedTextLength() + 5;
    const c = it.couleur || '#1e1e1e';
    if (it.type === 'ecart') S('line', { x1: x - 6, x2: x - 6, y1: y - 6, y2: y + 6, stroke: c, 'stroke-width': 1.5 }, g);
    else if (it.type === 'plein') S('rect', { x: x - 16, y: y - 5, width: 16, height: 10, fill: c }, g);
    else S('line', { x1: x - 18, x2: x - 2, y1: y, y2: y, stroke: c, 'stroke-width': 1.5, 'stroke-dasharray': it.type === 'tiret' ? '4 3' : null }, g);
    x -= (it.type === 'ecart' ? 12 : 18) + 14;
  }
}

ajuster(demo, L, HT, { surMasque: () => { lecteur.arreter(); rendre(); } });

(async () => {
  try {
    const r = await fetch(conf.donnees || 'donnees/bruit-sons.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error(`Données introuvables (${r.status})`);
    donnees = await r.json();
    choix(ligne1, donnees.descripteurs.map((d) => ({ texte: NOMS[d.cle] || d.nom, valeur: d.cle, titre: d.definition })), etat.cle,
      (v) => { etat.cle = v; rendre(); }, { compact: true });
    jouer = bouton(ligne2, '', () => { lecteur.jouer(donnees.sons[etat.son], rendre); rendre(); }, { largeur: 34, jouer: true, titre: 'Écouter' });
    choix(ligne2, donnees.sons.map((s, i) => ({ texte: s.nom, valeur: i })), etat.son,
      (i) => { etat.son = i; lecteur.arreter(); rendre(); }, { compact: true });
    rendre();
    document.fonts?.ready.then(rendre); // largeurs de la légende mesurées avec la vraie police
  } catch (e) {
    demo.textContent = e.message;
  }
})();
