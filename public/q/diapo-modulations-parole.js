// Diapositive « Implications cliniques » (McAdams 2019) du Cours 7 (élément HTML d'Excalidraw+,
// srcdoc, moitié droite) : les modulations spectro-temporelles locales d'une phrase, d'après la
// figure d'Elliott et Theunissen (2009).
//
// En haut, ▶ joue la phrase (une barre bleue suit la lecture) et trois exemples placent la fenêtre
// sur une modulation surtout temporelle, surtout spectrale (harmoniques) ou spectro-temporelle,
// comme les trois ellipses de la figure d'origine. Au milieu, son spectrogramme (125 à 8000 Hz en
// octaves, fenêtre de 40 ms : les harmoniques sont résolues). Cliquer-glisser sur le spectrogramme
// déplace la fenêtre d'analyse de 300 ms × 1.5 octave, qui reste où on la lâche ; en bas, cette fenêtre ≈ la somme de ses trois modulations les plus fortes, en rouge
// (crêtes) et bleu (creux), comme les ellipses de la figure d'origine ; une composante plus faible
// est plus pâle. Pas de valeurs : la figure sert l'intuition (les valeurs sont sur la diapositive
// des ripples).
// Spectrogramme et analyse calculés ici (modulations.js).
//
// Son : sons/modulations/parole.wav, « La parole est d'argent, le silence est d'or » (Lepticed7,
// Lingua Libre, CC BY-SA 4.0 ; silences retirés, 300 ms d'amorce).
//
// Document hôte (tools/modulations_cours7.py) :
//   <base href="https://SITE/q/"> <link rel="stylesheet" href="…/q/excali/excali.css">
//   <script src="…/q/excali/rough.js"></script> <div id="demo" class="demo"></div>
//   <script type="application/json" id="config">{"id": "c7modparole"}</script>
import { ajuster, axes, bouton, choix, echelle, H, placer, S, T } from './excali/excali.js';
import { BLEU, creerLecteurTampon, imageGris, lireWav, modulationsLocales, nb, ROUGE, spectrogrammeLog } from './modulations.js';

const L = 416, HT = 366, HAUT_SVG = 44;
const G = 66, D = L - 10;
const F_MIN = 125, OCTAVES = 6, PAR_OCTAVE = 32, PAS = 0.005;
const FEN_T = 0.3, FEN_O = 1.5; // fenêtre d'analyse : 300 ms × 1.5 octave
const lecteur = creerLecteurTampon();
let son = null, sp = null, fx = null;
// Exemples (centre de la fenêtre), choisis en balayant la phrase : composante dominante
// −4 Hz / 0.25 c/oct (attaque de syllabe), ≈ 0 Hz / 2 c/oct (harmoniques d'une voyelle tenue),
// −3.5 Hz / 1.6 c/oct (transition de formant descendante vers 2 kHz).
const EXEMPLES = [
  { texte: 'Temporelle', t: 0.7, f: 1345 },
  { texte: 'Spectrale', t: 0.4, f: 476 },
  { texte: 'Spectro-temporelle', t: 1.02, f: 2000 },
];
const etat = { t: EXEMPLES[2].t, f: EXEMPLES[2].f };

const demo = document.getElementById('demo');
const ligne = placer(H('div', 'lecture', null, demo), 0, 0, L);
ligne.style.cssText += 'display:flex;align-items:center;gap:16px';
const jouer = bouton(ligne, '', () => {
  if (lecteur.enCours()) lecteur.arreter(); else if (son) { lecteur.jouer(son.x, son.taux, rendreLecture); suivre(); }
  rendreLecture();
}, { largeur: 34, jouer: true, titre: 'Écouter' });
const exemples = choix(ligne, EXEMPLES.map((e, i) => ({ texte: e.texte, valeur: i })), 2,
  (i) => { etat.t = EXEMPLES[i].t; etat.f = EXEMPLES[i].f; rendre(); }, { compact: true, egal: false });

const svg = placer(S('svg', { width: L, height: HT - HAUT_SVG }), 0, HAUT_SVG);
demo.append(svg);
const fy = echelle(F_MIN, F_MIN * 2 ** OCTAVES, 172, 6, true);
const image = S('image', { x: G, y: fy.r1, height: fy.r0 - fy.r1, preserveAspectRatio: 'none' }, svg);
const gAxes = S('g', {}, svg);
const cadre = S('rect', { fill: 'none', stroke: BLEU, 'stroke-width': 2 }, svg);
const curseurT = S('line', { y1: fy.r1, y2: fy.r0, stroke: BLEU, 'stroke-width': 2, visibility: 'hidden' }, svg);
const zone = S('rect', { x: G, y: fy.r1, width: D - G, height: fy.r0 - fy.r1, fill: 'transparent' }, svg);
zone.style.cursor = 'grab';
zone.style.touchAction = 'none';

// Bas : la fenêtre (extrait du spectrogramme, cadre bleu) = composante 1 + 2 + 3 + …
// Largeurs : extrait 64, « = » et « + » dans 32, ellipses 56, « + … » final 32 → 348 (x 58 à 406).
const Y_BAS = 262, HC = 50, WC = 64, RX = 28, RY = 24, PAS_SIGNE = 32;
const X0 = D - (WC + PAS_SIGNE + 3 * 2 * RX + 2 * PAS_SIGNE + PAS_SIGNE);
const extrait = S('image', { x: X0, y: Y_BAS - HC / 2, width: WC, height: HC, preserveAspectRatio: 'none' }, svg);
S('rect', { x: X0, y: Y_BAS - HC / 2, width: WC, height: HC, fill: 'none', stroke: BLEU, 'stroke-width': 2 }, svg);
const signe = (x, t) => T(svg, x, Y_BAS + 6, t, 'titre-axe');
signe(X0 + WC + PAS_SIGNE / 2, '=');
const composantes = [0, 1, 2].map((i) => {
  const cx = X0 + WC + PAS_SIGNE + RX + i * (2 * RX + PAS_SIGNE);
  const clip = S('clipPath', { id: 'ellipse' + i }, S('defs', {}, svg));
  S('ellipse', { cx, cy: Y_BAS, rx: RX, ry: RY }, clip);
  const im = S('image', { x: cx - RX, y: Y_BAS - RY, width: 2 * RX, height: 2 * RY, preserveAspectRatio: 'none', 'clip-path': `url(#ellipse${i})` }, svg);
  S('ellipse', { cx, cy: Y_BAS, rx: RX, ry: RY, class: 'trait' }, svg);
  signe(cx + RX + PAS_SIGNE / 2, i < 2 ? '+' : '+ …');
  return im;
});
const toile = document.createElement('canvas');
toile.width = 4 * RX; toile.height = 4 * RY;

function regler(e) {
  if (!sp) return;
  const r = svg.getBoundingClientRect(), k = r.width / L;
  etat.t = fx.inverse((e.clientX - r.left) / k);
  etat.f = fy.inverse((e.clientY - r.top) / k);
  rendre();
}
// Cliquer-glisser (le survol seul ne fait rien) : la fenêtre suit le pointeur et reste où on la lâche.
zone.addEventListener('pointerdown', (e) => { zone.setPointerCapture(e.pointerId); exemples.valeur(null); regler(e); });
zone.addEventListener('pointermove', (e) => { if (zone.hasPointerCapture(e.pointerId)) regler(e); });

const melange = (c, a) => { // c : couleur hex, a ∈ [0, 1] : part de la couleur sur le blanc
  const v = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  return v.map((x) => Math.round(255 + (x - 255) * a));
};
const R_ = melange(ROUGE, 1), B_ = melange(BLEU, 1);

function rendre() {
  if (!sp) return;
  const nt = Math.round(FEN_T / PAS), nj = Math.round(FEN_O * PAR_OCTAVE) + 1;
  const t0 = Math.max(0, Math.min(sp.trames - nt, Math.round((etat.t - FEN_T / 2) / PAS)));
  const xo = Math.log2(etat.f / F_MIN);
  const j0 = Math.max(0, Math.min(sp.lignes - nj, Math.round((xo - FEN_O / 2) * PAR_OCTAVE)));
  // Fenêtre dessinée exactement sur les trames et lignes analysées.
  const xa = fx(t0 * PAS), xb = fx((t0 + nt) * PAS);
  const ya = fy(F_MIN * 2 ** ((j0 + nj - 1) / PAR_OCTAVE)), yb = fy(F_MIN * 2 ** (j0 / PAR_OCTAVE));
  cadre.setAttribute('x', xa); cadre.setAttribute('y', ya);
  cadre.setAttribute('width', xb - xa); cadre.setAttribute('height', yb - ya);

  // Extrait : mêmes gris que le spectrogramme (plage de 60 dB sous le maximum de la phrase).
  const sous = new Float32Array(nt * nj);
  for (let a = 0; a < nt; a++) for (let b = 0; b < nj; b++) sous[a * nj + b] = sp.db[(t0 + a) * sp.lignes + j0 + b];
  extrait.setAttribute('href', imageGris(sous, nt, nj, 60, sp.max));

  // Composantes (temps horizontal, octaves vers le haut, comme dans le spectrogramme) :
  // rouge = crête, bleu = creux ; contraste proportionnel au poids.
  modulationsLocales(sp, t0, j0, nt, nj, 3).forEach((m, i) => {
    const { width: w, height: h } = toile, g = toile.getContext('2d'), img = g.createImageData(w, h);
    for (let j = 0; j < h; j++) {
      const x = (1 - (j + 0.5) / h) * FEN_O;
      for (let k = 0; k < w; k++) {
        const t = (k + 0.5) / w * FEN_T;
        const v = Math.cos(2 * Math.PI * (m.om * t - m.Om * x) + m.phase);
        const c = v >= 0 ? R_ : B_, a = m.poids * Math.abs(v) ** 0.8, o = 4 * (j * w + k);
        for (let q = 0; q < 3; q++) img.data[o + q] = Math.round(255 + (c[q] - 255) * a);
        img.data[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    composantes[i].setAttribute('href', toile.toDataURL());
  });
}

function rendreLecture() { jouer.lecture(lecteur.enCours()); }
function suivre() {
  const t = lecteur.temps();
  if (lecteur.enCours() && t >= 0 && fx) {
    curseurT.setAttribute('x1', fx(Math.min(t, son.x.length / son.taux)));
    curseurT.setAttribute('x2', fx(Math.min(t, son.x.length / son.taux)));
    curseurT.setAttribute('visibility', 'visible');
  } else curseurT.setAttribute('visibility', 'hidden');
  if (lecteur.enCours()) requestAnimationFrame(suivre);
}

ajuster(demo, L, HT, { surMasque: () => { lecteur.arreter(); rendreLecture(); }, surAffiche: () => rendre() });

(async () => {
  try {
    const r = await fetch('sons/modulations/parole.wav');
    if (!r.ok) throw new Error(`Son introuvable (${r.status})`);
    son = lireWav(await r.arrayBuffer());
    sp = spectrogrammeLog(son.x, son.taux, { fMin: F_MIN, octaves: OCTAVES, parOctave: PAR_OCTAVE, pas: PAS, fenetre: 0.04 });
    const duree = son.x.length / son.taux;
    fx = echelle(0, duree, G, D);
    image.setAttribute('x', fx(0)); image.setAttribute('width', fx(sp.trames * PAS) - fx(0));
    image.setAttribute('href', imageGris(sp.db, sp.trames, sp.lignes, 60));
    const ticks = [0, 0.5, 1, 1.5].filter((v) => v <= duree);
    axes(gAxes, { x: fx, y: fy, ticksX: ticks, ticksY: [250, 500, 1000, 2000, 4000, 8000], titreX: 'Temps (s)', titreY: 'kHz',
      formatX: (v) => nb(v), formatY: (v) => nb(v / 1000) });
    rendre();
  } catch (e) {
    demo.textContent = e.message;
  }
})();
