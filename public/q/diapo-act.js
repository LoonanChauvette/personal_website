// Diapositive « Implications cliniques » (Audible Contrast Threshold, Zaar et al. 2024) du Cours 7
// (élément HTML d'Excalidraw+, srcdoc, en haut à droite) : une séquence du test ACT à écouter.
//
// Stimulus d'après Zaar et al. (2024) : bouffées de bruit rose de 1 s, bande 354 à 2000 Hz ; certaines
// portent une modulation spectro-temporelle montante de 4 Hz et 2 cycles/octave (un ripple, comme
// sur la diapositive des ripples), les autres non ; même niveau efficace. Le patient appuie quand il
// entend une bouffée modulée ; le clinicien baisse le contraste (la profondeur de modulation, en dB
// re modulation complète, 20·log10 m) jusqu'au seuil. (Le test clinique l'exprime en dB nCL,
// normalisé sur de jeunes normo-entendants, et adapte le niveau à l'audiogramme : pas ici.)
//
// En haut, ▶ tire une nouvelle séquence de 9 bouffées (3 modulées, jamais la première ni deux de
// suite) et la joue ; le contraste (bleu, comme la profondeur des ripples) se règle de −30 à 0 dB,
// affiché sur trois lignes : dB FS (re modulation complète, l'axe « STM threshold » de la figure des
// régressions), ≈ dB nCL de la clinique (dB FS + 16 : 16 dB nCL = modulation complète, 0 dB nCL
// ≈ −16 dB FS ; décalage rapporté par une source secondaire, pas vérifié) et m linéaire.
// Au milieu, le spectrogramme (200 à 3000 Hz en octaves) se dévoile derrière la barre de lecture ;
// les cadres rouges des bouffées modulées n'apparaissent qu'à la fin : la classe compte d'abord à
// l'oreille. À l'arrêt, changer le contraste refait la même séquence (mêmes bruits) à ce contraste.
//
// Document hôte (tools/act_cours7.py) :
//   <base href="https://SITE/q/"> <link rel="stylesheet" href="…/q/excali/excali.css">
//   <script src="…/q/excali/rough.js"></script> <div id="demo" class="demo"></div>
//   <script type="application/json" id="config">{"id": "c7act"}</script>
import { ajuster, axes, bouton, echelle, H, placer, S } from './excali/excali.js';
import { C_PROFONDEUR, NOIR, ROUGE, creerLecteurTampon, creerRipple, curseur, imageGris, nb, spectrogrammeLog } from './modulations.js';

const L = 400, HT = 170, HAUT_SVG = 40;
const G = 66, D = L - 8;
const TAUX = 22050, N = 9, NB_MOD = 3, F_BAS = 354, F_HAUT = 2000, OM = 4, OMEGA_S = 2, RAMPE = 0.05;
const F_MIN = 200, OCTAVES = Math.log2(3000 / 200), PAR_OCTAVE = 24, PAS = 0.02;
const NCL = 16; // dB nCL ≈ dB FS + 16 : 16 dB nCL = modulation complète (0 dB FS)
const etat = { db: -6 };
const lecteur = creerLecteurTampon();
let seq = null; // { bouffees: [ripple], modulees: Set, x: Float32Array }
let revele = true;

const demo = document.getElementById('demo');
const ligne = placer(H('div', 'lecture', null, demo), 0, 0, L);
ligne.style.cssText += 'display:flex;align-items:center;gap:10px';
const jouer = bouton(ligne, '', () => { if (lecteur.enCours()) lecteur.arreter(); else lancer(); },
  { largeur: 34, jouer: true, titre: 'Nouvelle séquence' });
H('span', null, 'Contraste', ligne).style.marginLeft = '10px';
curseur(ligne, { largeur: 140, min: -30, max: 0, valeur: etat.db, cle: 'contraste', couleur: C_PROFONDEUR,
  action: (v, fin) => {
    etat.db = Math.round(v);
    afficher();
    if (fin && !lecteur.enCours()) { synthetiser(); dessiner(); }
  } });
const valeur = H('div', null, null, ligne); // trois lignes : dB FS, dB nCL, m
valeur.style.cssText = `color:${C_PROFONDEUR};white-space:nowrap;font-size:12px;line-height:13px;text-align:right;margin-left:auto`;
const [valeurFs, valeurNcl, valeurM] = [0, 1, 2].map(() => H('div', null, '', valeur));
function afficher() { // m = 10^(dB/20), deux chiffres significatifs
  const m = 10 ** (etat.db / 20);
  valeurFs.textContent = nb(etat.db) + ' dB FS';
  valeurNcl.textContent = '≈ ' + nb(etat.db + NCL) + ' dB nCL';
  valeurM.textContent = (m >= 0.995 ? '1' : m >= 0.1 ? m.toFixed(2) : m.toFixed(3));
}
afficher();

const svg = placer(S('svg', { width: L, height: HT - HAUT_SVG }), 0, HAUT_SVG);
demo.append(svg);
const fy = echelle(F_MIN, F_MIN * 2 ** OCTAVES, 84, 4, true);
const fx = echelle(0, N, G, D);
const image = S('image', { x: G, y: fy.r1, width: D - G, height: fy.r0 - fy.r1, preserveAspectRatio: 'none' }, svg);
const voile = S('rect', { y: fy.r1, height: fy.r0 - fy.r1, fill: '#fff' }, svg); // partie pas encore jouée
const gCadres = S('g', {}, svg);
axes(S('g', {}, svg), { x: fx, y: fy, ticksX: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], ticksY: [250, 500, 1000, 2000],
  titreX: 'Temps (s)', titreY: 'kHz', formatX: (v) => nb(v), formatY: (v) => nb(v / 1000) });
const curseurT = S('line', { y1: fy.r1, y2: fy.r0, stroke: NOIR, 'stroke-width': 2, visibility: 'hidden' }, svg);

// Tirage : NB_MOD bouffées modulées parmi 2…N, jamais deux de suite.
function tirer() {
  let m;
  do {
    m = new Set();
    while (m.size < NB_MOD) m.add(1 + Math.floor(Math.random() * (N - 1)));
  } while ([...m].some((i) => m.has(i + 1)));
  const graine = Math.floor(Math.random() * 1e9);
  seq = {
    modulees: m,
    bouffees: Array.from({ length: N }, (_, i) => creerRipple({ taux: TAUX, duree: 1, fMin: F_BAS, octaves: Math.log2(F_HAUT / F_BAS), parOctave: 100, graine: graine + 7919 * i })),
  };
}

// Séquence au contraste courant : bouffées de même niveau efficace, rampes en cosinus de 50 ms.
function synthetiser() {
  const n = TAUX, r = Math.round(RAMPE * TAUX), x = new Float32Array(N * n), m = 10 ** (etat.db / 20);
  seq.bouffees.forEach((b, i) => {
    const y = b.signal(OM, OMEGA_S, seq.modulees.has(i) ? m : 0);
    for (let k = 0; k < n; k++) {
      const g = k < r ? 0.5 - 0.5 * Math.cos(Math.PI * k / r) : k >= n - r ? 0.5 - 0.5 * Math.cos(Math.PI * (n - 1 - k) / r) : 1;
      x[i * n + k] = y[k] * g;
    }
  });
  seq.x = x;
}

function dessiner() {
  const sp = spectrogrammeLog(seq.x, TAUX, { fMin: F_MIN, octaves: OCTAVES, parOctave: PAR_OCTAVE, pas: PAS, fenetre: 0.02, N: 1024 }); // FFT courte : la séquence dure 9 s
  image.setAttribute('href', imageGris(sp.db, sp.trames, sp.lignes, 35));
  gCadres.replaceChildren();
  for (const i of seq.modulees) {
    S('rect', { x: fx(i) + 1.5, y: fy(F_HAUT), width: fx(i + 1) - fx(i) - 3, height: fy(F_BAS) - fy(F_HAUT),
      fill: 'none', stroke: ROUGE, 'stroke-width': 2 }, gCadres);
  }
  montrer(revele ? N : 0);
}

function montrer(t) { // spectrogramme dévoilé jusqu'à t s ; cadres seulement une fois tout dévoilé
  voile.setAttribute('x', fx(t)); voile.setAttribute('width', Math.max(0, D - fx(t)));
  gCadres.setAttribute('visibility', revele ? 'visible' : 'hidden');
}

function lancer() {
  tirer(); synthetiser();
  revele = false;
  dessiner();
  lecteur.jouer(seq.x, TAUX, () => { revele = true; montrer(N); curseurT.setAttribute('visibility', 'hidden'); jouer.lecture(false); });
  jouer.lecture(true);
  suivre();
}

function suivre() {
  if (!lecteur.enCours()) return;
  const t = Math.max(0, Math.min(N, lecteur.temps()));
  montrer(t);
  curseurT.setAttribute('x1', fx(t)); curseurT.setAttribute('x2', fx(t));
  curseurT.setAttribute('visibility', 'visible');
  requestAnimationFrame(suivre);
}

ajuster(demo, L, HT, { surMasque: () => lecteur.arreter() });
tirer(); synthetiser(); dessiner();
