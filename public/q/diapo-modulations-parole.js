// Diapositive « Implications cliniques » (McAdams 2019) du Cours 7 (élément HTML d'Excalidraw+,
// srcdoc, moitié droite) : les modulations spectro-temporelles locales d'une phrase, d'après la
// figure d'Elliott et Theunissen (2009).
//
// En haut, ▶ joue la phrase (une barre bleue suit la lecture) et trois exemples placent la fenêtre
// sur une modulation surtout temporelle, surtout spectrale (harmoniques) ou spectro-temporelle,
// comme les trois ellipses de la figure d'origine. Au milieu, son spectrogramme (125 à 8000 Hz en
// octaves, fenêtre de 40 ms : les harmoniques sont résolues). Cliquer-glisser sur le spectrogramme
// trace la fenêtre d'analyse (rectangle de forme libre, au moins 100 ms × 0.5 octave) ; en bas, cette fenêtre ≈ la somme de ses trois modulations les plus fortes, en rouge
// (crêtes) et bleu (creux), comme les ellipses de la figure d'origine ; une composante plus faible
// est plus pâle. Cliquer une ellipse fait entendre sa modulation : le ripple de même ω et Ω
// (250 à 8000 Hz, comme sur la diapositive des ripples), son contour s'épaissit pendant l'écoute.
// Pas de valeurs : la figure sert l'intuition (les valeurs sont sur la diapositive
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
import { ajuster, axes, bouton, choix, echelle, figurePrete, H, IMPRESSION, placer, S, T } from './excali/excali.js';
import { BLEU, creerLecteurTampon, creerRipple, imageGris, lireWav, modulationsLocales, nb, ROUGE, spectrogrammeLog } from './modulations.js';

const L = 416, HT = 366, HAUT_SVG = 44;
const G = 66, D = L - 10;
const F_MIN = 125, OCTAVES = 6, PAR_OCTAVE = 32, PAS = 0.005;
const T_MIN = 0.1, O_MIN = 0.5; // plus petite fenêtre analysable (en deçà, aucune modulation n'est résolue)
const lecteur = creerLecteurTampon();
const ripple = creerRipple({ duree: 1.5 });
let son = null, sp = null, fx = null, mods = [], joue = null; // joue : 'phrase', indice d'une composante ou null
const NOIR_P = '#1e1e1e';
// Exemples (fenêtres en s et Hz), trouvés en balayant la phrase (composante dominante, poids de la
// deuxième) : rythme des syllabes ±4 Hz / 0 c/oct ; harmoniques graves d'une voyelle tenue 0 Hz / 2 c/oct ;
// harmoniques qui montent avec la voix +3 Hz / 2.1 c/oct (deuxième composante à 0.46).
const EXEMPLES = [
  { texte: 'Temporelle', ta: 0.2, tb: 1.0, fa: 500, fb: 1000 },
  { texte: 'Spectrale', ta: 0.345, tb: 0.455, fa: 145, fb: 1100 },
  { texte: 'Spectro-temporelle', ta: 0.825, tb: 0.975, fa: 250, fb: 500 },
];
const etat = { ...EXEMPLES[2] };

// Analyse d'une fenêtre { ta, tb, fa, fb } : trames et lignes analysées, extrait en gris (60 dB
// sous le maximum de la phrase) et ses trois modulations les plus fortes.
function analyser(f) {
  const t0 = Math.max(0, Math.round(f.ta / PAS)), t1 = Math.min(sp.trames, Math.round(f.tb / PAS));
  const j0 = Math.max(0, Math.round(Math.log2(f.fa / F_MIN) * PAR_OCTAVE));
  const j1 = Math.min(sp.lignes - 1, Math.round(Math.log2(f.fb / F_MIN) * PAR_OCTAVE));
  const nt = t1 - t0, nj = j1 - j0 + 1;
  const sous = new Float32Array(nt * nj);
  for (let a = 0; a < nt; a++) for (let b = 0; b < nj; b++) sous[a * nj + b] = sp.db[(t0 + a) * sp.lignes + j0 + b];
  return { t0, t1, j0, j1, duree: nt * PAS, octaves: (nj - 1) / PAR_OCTAVE, extrait: imageGris(sous, nt, nj, 60, sp.max), mods: modulationsLocales(sp, t0, j0, nt, nj, 3) };
}
const melange = (c, a) => { // c : couleur hex, a ∈ [0, 1] : part de la couleur sur le blanc
  const v = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  return v.map((x) => Math.round(255 + (x - 255) * a));
};
const R_ = melange(ROUGE, 1), B_ = melange(BLEU, 1);
// Composante (temps horizontal, octaves vers le haut, comme dans le spectrogramme) en image w × h :
// rouge = crête, bleu = creux ; contraste proportionnel au poids.
function imageComposante(m, duree, octaves, w, h) {
  const toile = document.createElement('canvas');
  toile.width = w; toile.height = h;
  const g = toile.getContext('2d'), img = g.createImageData(w, h);
  for (let j = 0; j < h; j++) {
    const x = (1 - (j + 0.5) / h) * octaves;
    for (let k = 0; k < w; k++) {
      const t = (k + 0.5) / w * duree;
      const v = Math.cos(2 * Math.PI * (m.om * t - m.Om * x) + m.phase);
      const c = v >= 0 ? R_ : B_, a = m.poids * Math.abs(v) ** 0.8, o = 4 * (j * w + k);
      for (let q = 0; q < 3; q++) img.data[o + q] = Math.round(255 + (c[q] - 255) * a);
      img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return toile.toDataURL();
}
async function chargerPhrase() {
  const r = await fetch('sons/modulations/parole.wav');
  if (!r.ok) throw new Error(`Son introuvable (${r.status})`);
  son = lireWav(await r.arrayBuffer());
  sp = spectrogrammeLog(son.x, son.taux, { fMin: F_MIN, octaves: OCTAVES, parOctave: PAR_OCTAVE, pas: PAS, fenetre: 0.04 });
}
// Spectrogramme de la phrase et ses axes, entre fy.r1 et fy.r0 ; renvoie l'échelle du temps.
function tracerSpectrogramme(image, gAxes, fy, { titreX = 'Temps (s)', formatX = (v) => nb(v) } = {}) {
  const duree = son.x.length / son.taux, x = echelle(0, duree, G, D);
  image.setAttribute('x', x(0)); image.setAttribute('width', x(sp.trames * PAS) - x(0));
  image.setAttribute('href', imageGris(sp.db, sp.trames, sp.lignes, 60));
  axes(gAxes, { x, y: fy, ticksX: [0, 0.5, 1, 1.5].filter((v) => v <= duree), ticksY: [250, 500, 1000, 2000, 4000, 8000], titreX, titreY: 'kHz',
    formatX, formatY: (v) => nb(v / 1000) });
  return x;
}

const demo = document.getElementById('demo');
if (IMPRESSION) imprimer(); else interactif();

function interactif() {
  const ligne = placer(H('div', 'lecture', null, demo), 0, 0, L);
  ligne.style.cssText += 'display:flex;align-items:center;gap:16px';
  // Un seul son à la fois : la phrase (▶) ou la modulation d'une ellipse ; relancer le même l'arrête.
  function ecouter(quoi) {
    const meme = lecteur.enCours() && joue === quoi;
    lecteur.arreter();
    if (meme) return;
    if (quoi === 'phrase') { if (!son) return; lecteur.jouer(son.x, son.taux, finEcoute); suivre(); }
    else { const m = mods[quoi]; if (!m) return; lecteur.jouer(ripple.signal(m.om, m.Om, 0.9), ripple.taux, finEcoute); }
    joue = quoi;
    rendreLecture();
  }
  function finEcoute() { joue = null; rendreLecture(); }
  const jouer = bouton(ligne, '', () => ecouter('phrase'), { largeur: 34, jouer: true, titre: 'Écouter' });
  const exemples = choix(ligne, EXEMPLES.map((e, i) => ({ texte: e.texte, valeur: i })), 2,
    (i) => { Object.assign(etat, EXEMPLES[i]); if (typeof joue === 'number') lecteur.arreter(); rendre(); }, { compact: true, egal: false });

  const svg = placer(S('svg', { width: L, height: HT - HAUT_SVG }), 0, HAUT_SVG);
  demo.append(svg);
  const fy = echelle(F_MIN, F_MIN * 2 ** OCTAVES, 172, 6, true);
  const image = S('image', { x: G, y: fy.r1, height: fy.r0 - fy.r1, preserveAspectRatio: 'none' }, svg);
  const gAxes = S('g', {}, svg);
  const cadre = S('rect', { fill: 'none', stroke: BLEU, 'stroke-width': 2 }, svg);
  const curseurT = S('line', { y1: fy.r1, y2: fy.r0, stroke: BLEU, 'stroke-width': 2, visibility: 'hidden' }, svg);
  const zone = S('rect', { x: G, y: fy.r1, width: D - G, height: fy.r0 - fy.r1, fill: 'transparent' }, svg);
  zone.style.cursor = 'crosshair';
  zone.style.touchAction = 'none';

  // Bas : la fenêtre (extrait du spectrogramme, cadre bleu) = composante 1 + 2 + 3 + …
  // Largeurs : extrait 64, « = » et « + » dans 32, ellipses 56, « + … » final 32 → 348 (x 58 à 406).
  const Y_BAS = 264, HC = 64, WC = 64, RX = 28, RY = 32, PAS_SIGNE = 32;
  const X0 = D - (WC + PAS_SIGNE + 3 * 2 * RX + 2 * PAS_SIGNE + PAS_SIGNE);
  // L'extrait et les ellipses prennent les proportions de la fenêtre (dans leur boîte, bornées) : les
  // stries gardent à peu près l'inclinaison du spectrogramme.
  const CXE = X0 + WC / 2;
  const extrait = S('image', { preserveAspectRatio: 'none' }, svg);
  const cadreExtrait = S('rect', { fill: 'none', stroke: BLEU, 'stroke-width': 2 }, svg);
  const signe = (x, t) => T(svg, x, Y_BAS + 6, t, 'titre-axe');
  signe(X0 + WC + PAS_SIGNE / 2, '=');
  const composantes = [0, 1, 2].map((i) => {
    const cx = X0 + WC + PAS_SIGNE + RX + i * (2 * RX + PAS_SIGNE);
    const clip = S('clipPath', { id: 'ellipse' + i }, S('defs', {}, svg));
    const forme = S('ellipse', { cx, cy: Y_BAS }, clip);
    const im = S('image', { preserveAspectRatio: 'none', 'clip-path': `url(#ellipse${i})` }, svg);
    const contour = S('ellipse', { cx, cy: Y_BAS, class: 'trait' }, svg);
    contour.style.cssText = 'fill:transparent;cursor:pointer'; // tout l'intérieur se clique (.trait : fill none)
    contour.addEventListener('click', () => ecouter(i));
    signe(cx + RX + PAS_SIGNE / 2, i < 2 ? '+' : '+ …');
    return { cx, forme, im, contour };
  });

  // Cliquer-glisser trace la fenêtre (rectangle de forme libre) ; un simple clic ne change rien.
  // Taille minimale T_MIN × O_MIN, bornée au spectrogramme.
  const point = (e) => {
    const r = svg.getBoundingClientRect(), k = r.width / L;
    return { t: fx.inverse((e.clientX - r.left) / k), f: fy.inverse((e.clientY - r.top) / k), px: e.clientX, py: e.clientY };
  };
  let depart = null, avant = null;
  function tracer(e) {
    const p = point(e), duree = son.x.length / son.taux, fMax = F_MIN * 2 ** OCTAVES;
    let ta = Math.max(0, Math.min(depart.t, p.t)), tb = Math.min(duree, Math.max(depart.t, p.t));
    let fa = Math.max(F_MIN, Math.min(depart.f, p.f)), fb = Math.min(fMax, Math.max(depart.f, p.f));
    if (tb - ta < T_MIN) { const c = Math.min(duree - T_MIN / 2, Math.max(T_MIN / 2, (ta + tb) / 2)); ta = c - T_MIN / 2; tb = c + T_MIN / 2; }
    if (Math.log2(fb / fa) < O_MIN) {
      const c = Math.min(OCTAVES - O_MIN / 2, Math.max(O_MIN / 2, Math.log2(Math.sqrt(fa * fb) / F_MIN)));
      fa = F_MIN * 2 ** (c - O_MIN / 2); fb = F_MIN * 2 ** (c + O_MIN / 2);
    }
    Object.assign(etat, { ta, tb, fa, fb });
    if (typeof joue === 'number') lecteur.arreter(); // ses composantes changent
    rendre();
  }
  zone.addEventListener('pointerdown', (e) => {
    if (!sp) return;
    zone.setPointerCapture(e.pointerId);
    depart = point(e); avant = { ...etat };
  });
  zone.addEventListener('pointermove', (e) => {
    if (!depart || !zone.hasPointerCapture(e.pointerId)) return;
    if (Math.hypot(e.clientX - depart.px, e.clientY - depart.py) < 6) return; // pas encore un glissement
    exemples.valeur(null);
    tracer(e);
  });
  zone.addEventListener('pointerup', (e) => {
    if (depart && Math.hypot(e.clientX - depart.px, e.clientY - depart.py) < 6) { Object.assign(etat, avant); rendre(); }
    depart = null;
  });

  function rendre() {
    if (!sp) return;
    const an = analyser(etat), { t0, t1, j0, j1, duree, octaves } = an;
    // Fenêtre dessinée exactement sur les trames et lignes analysées.
    const xa = fx(t0 * PAS), xb = fx(t1 * PAS), ya = fy(F_MIN * 2 ** (j1 / PAR_OCTAVE)), yb = fy(F_MIN * 2 ** (j0 / PAR_OCTAVE));
    cadre.setAttribute('x', xa); cadre.setAttribute('y', ya);
    cadre.setAttribute('width', xb - xa); cadre.setAttribute('height', yb - ya);

    // Proportions de la fenêtre à l'écran, ramenées dans chaque boîte du bas (bornées à 0.6–2.2 :
    // une fenêtre très large ou très haute deviendrait un trait illisible ; les stries s'aplatissent
    // un peu, la composante reste la même).
    const asp = Math.min(2.2, Math.max(0.6, (xb - xa) / Math.max(1, yb - ya)));
    const dans = (lb, hb) => (asp > lb / hb ? [lb, lb / asp] : [hb * asp, hb]);
    const [we, he] = dans(WC, HC);
    for (const e of [extrait, cadreExtrait]) {
      e.setAttribute('x', CXE - we / 2); e.setAttribute('y', Y_BAS - he / 2); e.setAttribute('width', we); e.setAttribute('height', he);
    }
    extrait.setAttribute('href', an.extrait);

    const [rx, ry] = dans(2 * RX, 2 * RY).map((v) => v / 2);
    mods = an.mods;
    mods.forEach((m, i) => {
      const { cx, forme, im, contour } = composantes[i];
      for (const e of [forme, contour]) { e.setAttribute('rx', rx); e.setAttribute('ry', ry); }
      im.setAttribute('x', cx - rx); im.setAttribute('y', Y_BAS - ry); im.setAttribute('width', 2 * rx); im.setAttribute('height', 2 * ry);
      im.setAttribute('href', imageComposante(m, duree, octaves, Math.max(8, Math.round(4 * rx)), Math.max(8, Math.round(4 * ry))));
    });
  }

  function rendreLecture() {
    jouer.lecture(joue === 'phrase');
    composantes.forEach((c, i) => { c.contour.style.strokeWidth = joue === i ? 3 : ''; });
  }
  function suivre() {
    const t = lecteur.temps();
    if (lecteur.enCours() && t >= 0 && fx) {
      curseurT.setAttribute('x1', fx(Math.min(t, son.x.length / son.taux)));
      curseurT.setAttribute('x2', fx(Math.min(t, son.x.length / son.taux)));
      curseurT.setAttribute('visibility', 'visible');
    } else curseurT.setAttribute('visibility', 'hidden');
    if (lecteur.enCours()) requestAnimationFrame(suivre);
  }

  ajuster(demo, L, HT, { surMasque: () => lecteur.arreter(), surAffiche: () => rendre() });

  chargerPhrase().then(() => { fx = tracerSpectrogramme(image, gAxes, fy); rendre(); })
    .catch((e) => { demo.textContent = e.message; });
}

// Version imprimée : la phrase et ses trois fenêtres d'exemple à la fois ; sous elle, la modulation la
// plus forte de chaque fenêtre, une flèche vers sa fenêtre. Colonnes dans l'ordre des fenêtres dans
// le temps (spectrale, temporelle, spectro-temporelle) : les flèches ne se croisent pas.
function imprimer() {
  const svg = placer(S('svg', { width: L, height: HT }), 0, 0);
  demo.append(svg);
  const fy = echelle(F_MIN, F_MIN * 2 ** OCTAVES, 168, 8, true);
  const image = S('image', { y: fy.r1, height: fy.r0 - fy.r1, preserveAspectRatio: 'none' }, svg);
  const gAxes = S('g', {}, svg);
  ajuster(demo, L, HT);
  chargerPhrase().then(() => {
    // Sans titre d'axe (une flèche le traverserait) : l'unité est sur la dernière graduation.
    const x = tracerSpectrogramme(image, gAxes, fy, { titreX: null, formatX: (v) => (v === 1.5 ? '1.5 s' : nb(v)) });
    const ORDRE = [1, 0, 2], Y = 290, LB = 80, HB = 70, COL = (L - 8) / 3;
    ORDRE.forEach((k, i) => {
      const ex = EXEMPLES[k], an = analyser(ex);
      const xa = x(an.t0 * PAS), xb = x(an.t1 * PAS), ya = fy(F_MIN * 2 ** (an.j1 / PAR_OCTAVE)), yb = fy(F_MIN * 2 ** (an.j0 / PAR_OCTAVE));
      S('rect', { x: xa, y: ya, width: xb - xa, height: yb - ya, fill: 'none', stroke: BLEU, 'stroke-width': 2 }, svg);
      const cx = 4 + i * COL + COL / 2;
      const asp = Math.min(2.2, Math.max(0.6, (xb - xa) / Math.max(1, yb - ya)));
      const [w, h] = asp > LB / HB ? [LB, LB / asp] : [HB * asp, HB];
      const clip = S('clipPath', { id: 'imp' + i }, S('defs', {}, svg));
      S('ellipse', { cx, cy: Y, rx: w / 2, ry: h / 2 }, clip);
      S('image', { x: cx - w / 2, y: Y - h / 2, width: w, height: h, preserveAspectRatio: 'none', 'clip-path': `url(#imp${i})`,
        href: imageComposante(an.mods[0], an.duree, an.octaves, Math.round(4 * w), Math.round(4 * h)) }, svg);
      S('ellipse', { cx, cy: Y, rx: w / 2, ry: h / 2, class: 'trait' }, svg).style.fill = 'none';
      T(svg, cx, Y + HB / 2 + 22, ex.texte, 'graduation', 'middle').setAttribute('font-size', 14);
      // Flèche du haut de l'ellipse vers le bas de la fenêtre (au milieu de son bord, à 3 px).
      fleche(svg, cx, Y - h / 2 - 6, (xa + xb) / 2, yb + 3);
    });
    figurePrete();
  }).catch((e) => { demo.textContent = e.message; });
}
// Flèche propre (trait droit, pointe pleine), jamais dessinée à la main.
function fleche(svg, x1, y1, x2, y2) {
  const a = Math.atan2(y2 - y1, x2 - x1), l = 9, e = 4.5;
  const bx = x2 - l * Math.cos(a), by = y2 - l * Math.sin(a);
  S('line', { x1, y1, x2: bx, y2: by, stroke: NOIR_P, 'stroke-width': 1.8 }, svg);
  S('path', { d: `M${x2},${y2} L${bx - e * Math.sin(a)},${by + e * Math.cos(a)} L${bx + e * Math.sin(a)},${by - e * Math.cos(a)} Z`, fill: NOIR_P }, svg);
}
