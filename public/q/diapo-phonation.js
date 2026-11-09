// Diapositive « Bruit et voix » du Cours 7 (élément HTML d'Excalidraw+, srcdoc, moitié droite) :
// les cinq modes de phonation des puces (rauque, craquée, modale, murmurée, chuchotement), un même
// locuteur. Au-dessus de chaque bouton, sa glotte (découpée par viewBox dans
// images/glotte-phonation.png, où l'ordre est inverse). Cliquer un mode ou sa glotte
// le joue et affiche son spectrogramme
// (large bande : les impulsions glottiques font des stries verticales, le bruit remplit les
// harmoniques) ; recliquer le mode l'arrête ou le rejoue, cliquer le spectrogramme aussi. Une
// barre bleue suit la lecture.
// Spectrogrammes calculés ici à partir des WAV ; même échelle de temps pour les cinq sons.
// Sons : sons/phonation/ (Marasek, IMS Stuttgart, tutoriel EGG « Types of phonation », 8 kHz ;
// crêtes égalisées, 300 ms d'amorce, retirée de l'affichage).
//
// Document hôte (tools/phonation_cours7.py) :
//   <base href="https://SITE/q/"> <link rel="stylesheet" href="…/q/excali/excali.css">
//   <script src="…/q/excali/rough.js"></script> <div id="demo" class="demo"></div>
//   <script type="application/json" id="config">{"id": "c7phonation"}</script>
import { ajuster, axes, choix, echelle, figurePrete, H, IMPRESSION, placer, S, T } from './excali/excali.js';

const L = 444, HT = 324;
const HAUT_GLOTTE = 60, HAUT_SVG = HAUT_GLOTTE + 4 + 44;
const BLEU = '#1971c2';
const T_MAX = 1.2, F_MAX = 4000; // s, Hz (sons à 8 kHz)
// cx : centre de la glotte dans images/glotte-phonation.png (1055 × 244 px)
const SONS = [
  { cle: 'rauque', nom: 'Rauque', cx: 870 }, // (constricted) voiceless
  { cle: 'craquee', nom: 'Craquée', cx: 688 },
  { cle: 'modale', nom: 'Modale', cx: 501 },
  { cle: 'murmuree', nom: 'Murmurée', cx: 319 },
  { cle: 'chuchotement', nom: 'Chuchotement', cx: 137 }, // (spread) voiceless
].map((s) => ({ ...s, fichier: `sons/phonation/${s.cle}.wav` }));
const AMORCE = 0.3; // s de silence en tête de chaque fichier

const x = echelle(0, T_MAX, 44, L - 14);
const y = echelle(0, F_MAX, HT - HAUT_SVG - 44, 6);
const etat = { son: 2 };
let lecture = null; // { son, a }

const demo = document.getElementById('demo');
const DECOUPE_IMPR = { l: 162, y: 71, h: 140 }; // même découpe que les glottes interactives
const chargerSons = () => Promise.all(SONS.map(async (s) => {
  const r = await fetch(s.fichier);
  if (!r.ok) throw new Error(`Son introuvable : ${s.fichier} (${r.status})`);
  s.image = spectrogramme(lireWav(await r.arrayBuffer()));
}));
if (IMPRESSION) imprimer(); else interactif();

function interactif() {
  const choisir = (i) => { etat.son = i; modes.valeur(i); basculer(SONS[i]); };
  // Une glotte (sans les étiquettes ni la flèche) par bouton, centrée sur lui ; assez étroite pour que
  // deux voisines ne se touchent pas (centres des boutons à 77 px au plus près).
  const DECOUPE = { l: 162, y: 71, h: 140 };
  const LARG_GLOTTE = HAUT_GLOTTE * DECOUPE.l / DECOUPE.h;
  const glottes = placer(S('svg', { width: L, height: HAUT_GLOTTE }), 0, 0);
  demo.append(glottes);
  const vues = SONS.map((s, i) => {
    const v = S('svg', { y: 0, width: LARG_GLOTTE, height: HAUT_GLOTTE,
      viewBox: `${s.cx - DECOUPE.l / 2} ${DECOUPE.y} ${DECOUPE.l} ${DECOUPE.h}` }, glottes);
    S('image', { href: 'images/glotte-phonation.png', width: 1055, height: 244, 'pointer-events': 'none' }, v);
    // Le clic tombe sur ce rectangle : l'image, même rognée, capterait les clics des colonnes voisines.
    S('rect', { x: s.cx - DECOUPE.l / 2, y: DECOUPE.y, width: DECOUPE.l, height: DECOUPE.h, fill: 'transparent' }, v);
    v.style.overflow = 'hidden'; // excali.css met overflow: visible sur tous les svg
    v.style.cursor = 'pointer';
    v.addEventListener('click', () => choisir(i));
    return v;
  });
  const ligne = placer(H('div', null, null, demo), 0, HAUT_GLOTTE + 4);
  const modes = choix(ligne, SONS.map((s, i) => ({ texte: s.nom, valeur: i, titre: `Écouter : ${s.nom.toLowerCase()}` })), etat.son,
    (i) => { etat.son = i; basculer(SONS[i]); }, { compact: true, egal: false });
  modes.style.width = L + 'px';
  modes.style.justifyContent = 'space-between'; // la rangée occupe toute la largeur du tracé
  // Centre chaque glotte sur son bouton (mesuré : la largeur des boutons dépend de la police).
  const CENTRES = [35, 114, 191, 273, 382]; // avant mesure
  function alignerGlottes() {
    vues.forEach((v, i) => {
      const b = modes.boutons[i];
      const c = b.offsetWidth ? b.offsetLeft + b.offsetWidth / 2 : CENTRES[i];
      v.setAttribute('x', c - LARG_GLOTTE / 2);
    });
  }
  alignerGlottes();
  requestAnimationFrame(alignerGlottes);
  if (document.fonts) document.fonts.ready.then(alignerGlottes);
  const svg = placer(S('svg', { width: L, height: HT - HAUT_SVG }), 0, HAUT_SVG);
  demo.append(svg);
  const image = S('image', { x: x(0), y: y(F_MAX), height: y(0) - y(F_MAX), preserveAspectRatio: 'none' }, svg);
  image.style.cursor = 'pointer';
  image.addEventListener('click', () => basculer(SONS[etat.son]));
  axes(S('g', {}, svg), { x, y, ticksX: [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2], ticksY: [0, 1000, 2000, 3000, 4000],
    titreX: 'Temps (s)', titreY: 'kHz', formatX: (v) => v.toFixed(1), formatY: (v) => v / 1000 });
  const curseur = S('line', { y1: y(F_MAX), y2: y(0), stroke: BLEU, 'stroke-width': 2, visibility: 'hidden' }, svg);

  function basculer(son) {
    if (lecture?.son === son) { arreter(); rendre(); return; }
    arreter();
    const a = new Audio(son.fichier);
    lecture = { son, a };
    a.addEventListener('ended', () => { if (lecture?.a === a) { lecture = null; rendre(); } });
    a.play().catch(() => { lecture = null; rendre(); });
    rendre();
    suivre();
  }
  function arreter() { if (lecture) { lecture.a.pause(); lecture = null; } }

  function suivre() {
    const t = lecture ? lecture.a.currentTime - AMORCE : -1;
    if (lecture && t >= 0 && lecture.son === SONS[etat.son]) {
      curseur.setAttribute('x1', x(Math.min(t, T_MAX)));
      curseur.setAttribute('x2', x(Math.min(t, T_MAX)));
      curseur.setAttribute('visibility', 'visible');
    } else curseur.setAttribute('visibility', 'hidden');
    if (lecture) requestAnimationFrame(suivre);
  }

  function rendre() {
    const s = SONS[etat.son];
    if (s.image) {
      image.setAttribute('href', s.image.url);
      image.setAttribute('width', x(s.image.duree) - x(0));
    }
    suivre();
  }

  ajuster(demo, L, HT, { surMasque: () => { arreter(); rendre(); }, surAffiche: () => { alignerGlottes(); rendre(); } });

  chargerSons().then(rendre).catch((e) => { demo.textContent = e.message; });
}

// Version imprimée : les cinq spectrogrammes sur deux rangées (3 + 2), chacun sous sa glotte et son
// nom ; même échelle de temps et de fréquence (fréquences sur la colonne de gauche, temps sous le
// premier tracé de la rangée du bas).
function imprimer() {
  const G = 34, D = L - 6, ECART = 14, COLS = 3, LARG = (D - G - ECART * (COLS - 1)) / COLS;
  const HG = 34, LG = HG * DECOUPE_IMPR.l / DECOUPE_IMPR.h, RANG = 150, H0 = 42, H1 = 132;
  const svg = placer(S('svg', { width: L, height: HT }), 0, 0);
  demo.append(svg);
  ajuster(demo, L, HT);
  chargerSons().then(() => {
    SONS.forEach((s, i) => {
      const col = i % COLS, rang = Math.floor(i / COLS), g0 = G + col * (LARG + ECART), h = rang * RANG;
      const x = echelle(0, T_MAX, g0, g0 + LARG), y = echelle(0, F_MAX, h + H1, h + H0);
      const v = S('svg', { x: g0, y: h, width: LG, height: HG,
        viewBox: `${s.cx - DECOUPE_IMPR.l / 2} ${DECOUPE_IMPR.y} ${DECOUPE_IMPR.l} ${DECOUPE_IMPR.h}` }, svg);
      S('image', { href: 'images/glotte-phonation.png', width: 1055, height: 244 }, v);
      v.style.overflow = 'hidden';
      T(svg, g0 + LG + 6, h + HG / 2 + 5, s.nom, 'graduation', 'start').setAttribute('font-size', 14);
      S('image', { x: x(0), y: y(F_MAX), width: x(s.image.duree) - x(0), height: y(0) - y(F_MAX), preserveAspectRatio: 'none', href: s.image.url }, svg);
      const temps = rang === 1 && col === 0;
      axes(S('g', {}, svg), { x, y, ticksX: temps ? [0, 0.5, 1] : [], ticksY: col ? [] : [0, 2000, 4000],
        titreX: temps ? 'Temps (s)' : null, titreY: col ? null : 'kHz', formatX: (t) => t.toFixed(1).replace(/\.0$/, ''), formatY: (f) => f / 1000 });
    });
    figurePrete();
  }).catch((e) => { demo.textContent = e.message; });
}

// WAV PCM 16 bits mono ; l'amorce (zéros en tête) n'est pas affichée.
function lireWav(buf) {
  const v = new DataView(buf);
  let i = 12, taux = 0, debut = 0, fin = 0;
  while (i + 8 <= v.byteLength) {
    const id = String.fromCharCode(v.getUint8(i), v.getUint8(i + 1), v.getUint8(i + 2), v.getUint8(i + 3));
    const n = v.getUint32(i + 4, true);
    if (id === 'fmt ') taux = v.getUint32(i + 12, true);
    if (id === 'data') { debut = i + 8; fin = i + 8 + n; }
    i += 8 + n + (n & 1);
  }
  const x = new Float32Array((fin - debut) / 2);
  for (let k = 0; k < x.length; k++) x[k] = v.getInt16(debut + 2 * k, true) / 32768;
  let d = 0;
  while (d < x.length && x[d] === 0) d++;
  return { x: x.subarray(d), taux };
}

// Spectrogramme large bande (fenêtre de Hann de 8 ms, pas de 1 ms, 60 dB de dynamique), en gris.
function spectrogramme({ x: s, taux }) {
  const N = 256, FEN = Math.round(0.008 * taux), PAS = Math.max(1, Math.round(0.001 * taux));
  const nb = Math.round(F_MAX / taux * N), trames = Math.max(1, Math.floor((s.length - FEN) / PAS));
  const hann = Float32Array.from({ length: FEN }, (_, k) => 0.5 - 0.5 * Math.cos(2 * Math.PI * k / (FEN - 1)));
  const db = new Float32Array(trames * nb);
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let t = 0; t < trames; t++) {
    re.fill(0); im.fill(0);
    for (let k = 0; k < FEN; k++) re[k] = s[t * PAS + k] * hann[k];
    fft(re, im);
    for (let k = 0; k < nb; k++) db[t * nb + k] = 10 * Math.log10(re[k] ** 2 + im[k] ** 2 + 1e-12);
  }
  let max = -Infinity;
  for (const v of db) if (v > max) max = v;
  const c = document.createElement('canvas');
  c.width = trames; c.height = nb;
  const g = c.getContext('2d'), img = g.createImageData(trames, nb);
  for (let t = 0; t < trames; t++) {
    for (let k = 0; k < nb; k++) {
      const z = Math.max(0, Math.min(1, (db[t * nb + k] - (max - 60)) / 60));
      const o = 4 * ((nb - 1 - k) * trames + t), gris = Math.round(255 * (1 - z ** 1.3));
      img.data[o] = img.data[o + 1] = img.data[o + 2] = gris;
      img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return { url: c.toDataURL(), duree: (FEN + (trames - 1) * PAS) / taux };
}

function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let b = n >> 1;
    for (; j & b; b >>= 1) j ^= b;
    j ^= b;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let l = 2; l <= n; l <<= 1) {
    const a = -2 * Math.PI / l;
    for (let i = 0; i < n; i += l) {
      for (let k = 0; k < l / 2; k++) {
        const wr = Math.cos(a * k), wi = Math.sin(a * k), p = i + k + l / 2;
        const xr = re[p] * wr - im[p] * wi, xi = re[p] * wi + im[p] * wr;
        re[p] = re[i + k] - xr; im[p] = im[i + k] - xi;
        re[i + k] += xr; im[i + k] += xi;
      }
    }
  }
}

