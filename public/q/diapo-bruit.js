// Diapositive « Bruit (noisiness) » du Cours 7 (élément HTML d'Excalidraw+, srcdoc, moitié droite),
// dans le style des démos (excali/excali.css, excali/excali.js).
//
// Bascule entre trois descripteurs de bruit (rapport de bruit, platitude spectrale, facteur de
// crête) et entre trois sons réels, du plus tonal au plus bruité (vibraphone, bouteille soufflée,
// cascade). En haut, une échelle « tonal ↔ bruité » place les trois sons selon le descripteur (la
// crête est inversée : élevée = tonal), le choisi en bleu, avec une phrase d'aide à la lecture ;
// cliquer un point choisit le son. Dessous, le spectre moyen du son choisi montre le descripteur
// (spectre-bruit.js : bruit hors des harmoniques en gris ; paliers par bande d'octave pour la
// platitude et la crête), de −80 à 0 dB. ▶ : le son joue.
// Données : donnees/bruit-sons.json (tools/bruit_sons.mjs, mêmes calculs que les corrélats).
//
// Document hôte (tools/bruit_cours7.py) :
//   <base href="https://SITE/q/"> <link rel="stylesheet" href="…/q/excali/excali.css">
//   <script src="…/q/excali/rough.js"></script> <div id="demo" class="demo"></div>
//   <script type="application/json" id="config">{"id": "c7bruit"}</script>
import { ajuster, bouton, choix, ECART_COMMANDES, figurePrete, H, IMPRESSION, placer, S, T } from './excali/excali.js';
import { creerLecteur } from './correlats-donnees.js';
import { tracerSpectreBruit } from './spectre-bruit.js';

const L = 420, HT = 436;
const BLEU = '#1971c2', GRIS = '#868e96', NOIR = '#1e1e1e';
const HAUT_SVG = 100; // y de l'échelle et du tracé (sous les commandes)
const Y_ECHELLE = 44, Y_LEGENDE = 122; // dans le svg
const CADRE = { g: 40, d: L - 10, h: Y_LEGENDE + 16, b: HT - HAUT_SVG - 28, dbMin: -80, ticksDb: [-80, -40, 0] };
const NOMS = { rapport_bruit: 'Ratio de bruit', platitude: 'Platitude', crete: 'Crête' };
// Échelle tonal → bruité de chaque descripteur (valeurs aux deux bouts) et aide à la lecture.
const ECHELLES = {
  rapport_bruit: { tonal: -80, bruite: 0, aide: 'Plus le ratio est élevé, plus le son est bruité.' },
  platitude: { tonal: 0, bruite: 1, aide: 'Plus la platitude est élevée (vers 1), plus le son est bruité.' },
  crete: { tonal: 25, bruite: 0, aide: 'Plus la crête est élevée (pics marqués), plus le son est tonal.' },
};
const conf = JSON.parse(document.getElementById('config')?.textContent || '{}');
const lecteur = creerLecteur();
const etat = { cle: 'rapport_bruit', son: 0 };
const nb = (v, d) => v.toFixed(d).replace('-', '−'); // point décimal, comme les autres figures
const valeur = (cle, v) => (cle === 'platitude' ? nb(v, 3) : `${nb(v, 1)} dB`);

const demo = document.getElementById('demo');
if (IMPRESSION) demo.hidden = true; // commandes et tracé interactifs remplacés par imprimer()
const ligne1 = placer(H('div', null, null, demo), 0, 0);
const ligne2 = placer(H('div', null, null, demo), 0, 48);
ligne2.style.display = 'flex';
ligne2.style.gap = ECART_COMMANDES + 'px';
const svg = placer(S('svg', { width: L, height: HT - HAUT_SVG }), 0, HAUT_SVG);
demo.append(svg);
let donnees = null, jouer = null, choixSon = null;

function rendre() {
  if (!donnees) return;
  const son = donnees.sons[etat.son];
  jouer.lecture(lecteur.enCours() === son);
  svg.replaceChildren();
  echelle(svg);
  legende(svg, tracerSpectreBruit(svg, etat.cle, son.spectre, CADRE, BLEU));
}

// Échelle tonal ↔ bruité sur toute la largeur : un point par son, son nom et sa valeur l'un sur
// l'autre au-dessus du point ; « tonal » et « bruité » sous les deux bouts, l'aide à la lecture
// dessous.
function echelle(g) {
  const e = ECHELLES[etat.cle], y = Y_ECHELLE, x0 = 8, x1 = L - 8;
  S('line', { x1: x0, x2: x1, y1: y, y2: y, class: 'trait' }, g);
  for (const x of [x0, x1]) S('line', { x1: x, x2: x, y1: y - 4, y2: y + 4, class: 'trait' }, g);
  for (const [x, texte, ancre] of [[x0 - 6, 'tonal', 'start'], [x1 + 6, 'bruité', 'end']]) {
    T(g, x, y + 22, texte, 'indice', ancre).style.fill = NOIR;
  }
  // Points gardés à MARGE des bouts (visuel seulement : le vibraphone, presque à 0 en platitude,
  // ne colle pas au bout « tonal »).
  const MARGE = 30, X = (v) => x0 + MARGE + (x1 - x0 - 2 * MARGE) * Math.min(1, Math.max(0, (v - e.tonal) / (e.bruite - e.tonal)));
  donnees.sons.forEach((s, i) => {
    const x = X(s[etat.cle]), coul = i === etat.son ? BLEU : GRIS;
    const choisir = () => { etat.son = i; choixSon.valeur(i); lecteur.arreter(); rendre(); };
    const textes = [[s.nom, y - 26], [valeur(etat.cle, s[etat.cle]), y - 11]].map(([texte, ty]) => {
      const t = T(g, x, ty, texte, 'indice', 'middle');
      t.setAttribute('font-size', 13);
      t.style.fill = coul;
      const w = t.getComputedTextLength(); // dans le cadre
      t.setAttribute('x', Math.min(L - 2 - w / 2, Math.max(2 + w / 2, x)));
      return t;
    });
    const c = S('circle', { cx: x, cy: y, r: 5, fill: coul, class: 'cliquable' }, g);
    for (const el of [...textes, c]) { el.style.cursor = 'pointer'; el.addEventListener('click', choisir); }
    S('title', {}, c).textContent = s.source || s.nom;
  });
  const aide = T(g, L / 2, y + 50, e.aide, 'indice', 'middle');
  aide.setAttribute('font-size', 13);
  aide.style.fill = NOIR;
}

// Légende alignée à droite au-dessus du tracé.
function legende(g, items, y = Y_LEGENDE) {
  let x = CADRE.d;
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

// Version imprimée : le son le plus tonal et le plus bruité en colonnes (nom en tête), une rangée
// par descripteur (nom à gauche, valeur de chaque son en bleu au-dessus de son spectre) ; même
// échelle partout, fréquences sous la dernière rangée seulement, sans légende (la diapositive
// explique les tracés).
const NOMS_IMPR = { rapport_bruit: 'Ratio de bruit', platitude: 'Platitude spectrale', crete: 'Facteur de crête' };
function imprimer() {
  const page = placer(H('div', 'demo', null, document.body), 0, 0);
  const g = placer(S('svg', { width: L, height: HT }), 0, 0);
  page.append(g);
  const deux = [donnees.sons[0], donnees.sons[donnees.sons.length - 1]], larg = (L - 26 - 40 - 24) / 2;
  const HAUT = 22, BAS = 20, RANG = (HT - HAUT - BAS) / 3;
  const gauche = (i) => 40 + i * (larg + 24);
  deux.forEach((s, i) => {
    const t = T(g, gauche(i) + larg / 2, 15, s.nom, 'indice', 'middle');
    t.setAttribute('font-size', 14); t.style.fill = NOIR; t.style.fontWeight = 700;
  });
  ['rapport_bruit', 'platitude', 'crete'].forEach((cle, k) => {
    const y = HAUT + k * RANG, dernier = k === 2;
    const n = T(g, 2, y + 16, NOMS_IMPR[cle], 'indice', 'start');
    n.setAttribute('font-size', 13); n.style.fill = NOIR;
    deux.forEach((s, i) => {
      tracerSpectreBruit(g, cle, s.spectre, { g: gauche(i), d: gauche(i) + larg, h: y + 31, b: y + RANG - 8, dbMin: -80,
        ticksDb: i ? [] : [-80, 0], ticksF: !dernier ? [] : i ? [100, 1000, 10000] : [100, 1000] }, BLEU);
      const v = T(g, gauche(i) + larg, y + 16, valeur(cle, s[cle]), 'indice', 'end');
      v.setAttribute('font-size', 13); v.style.fill = BLEU;
    });
  });
  ajuster(page, L, HT);
  figurePrete();
}

if (!IMPRESSION) ajuster(demo, L, HT, { surMasque: () => { lecteur.arreter(); rendre(); }, surAffiche: () => rendre() }); // légendes remesurées

(async () => {
  try {
    const r = await fetch(conf.donnees || 'donnees/bruit-sons.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error(`Données introuvables (${r.status})`);
    donnees = await r.json();
    if (IMPRESSION) { await document.fonts?.ready; imprimer(); return; }
    choix(ligne1, donnees.descripteurs.map((d) => ({ texte: NOMS[d.cle] || d.nom, valeur: d.cle, titre: d.definition })), etat.cle,
      (v) => { etat.cle = v; rendre(); }, { compact: true });
    jouer = bouton(ligne2, '', () => { lecteur.jouer(donnees.sons[etat.son], rendre); rendre(); }, { largeur: 34, jouer: true, titre: 'Écouter' });
    choixSon = choix(ligne2, donnees.sons.map((s, i) => ({ texte: s.nom, valeur: i, titre: s.source })), etat.son,
      (i) => { etat.son = i; lecteur.arreter(); rendre(); }, { compact: true, egal: false });
    rendre();
    document.fonts?.ready.then(rendre); // largeurs de la légende mesurées avec la vraie police
  } catch (e) {
    demo.textContent = e.message;
  }
})();
