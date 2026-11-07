// Modulations spectro-temporelles (Cours 7) : outils partagés par diapo-ripple.js (ripples) et
// diapo-modulations-parole.js (modulations locales d'une phrase).
//
// Convention : un ripple est l'enveloppe 1 + m·sin(2π(ω·t − Ω·x) + φ), x en octaves au-dessus de
// F_MIN, t en secondes. ω > 0 : les stries montent (ascendant) ; ω < 0 : elles descendent.
// La même convention sert à la synthèse, au dessin et à l'analyse locale de la parole, pour que la
// flèche du plan (ω, Ω) ait le même sens partout.
import { echelle, R, S, T } from './excali/excali.js';

export const BLEU = '#1971c2', ROUGE = '#e03131', NOIR = '#1e1e1e', GRIS = '#868e96';
export const W_MAX = 12, O_MAX = 4; // plan des modulations : ω ∈ [−12, 12] Hz, Ω ∈ [0, 4] c/oct
const nb = (v) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(2))).replace('-', '−'); // point décimal

// ─── Ripple : somme de sons purs à fréquences log-aléatoires, modulés en amplitude ─────────────
// s(t) = Σk (1 + m·sin(θ(t) − ψk))·sin(2π fk t + φk), θ = 2πωt, ψk = 2πΩxk
//      = C(t) + m·(sin θ · A(t) − cos θ · B(t)),  A = Σ cos ψk·sk, B = Σ sin ψk·sk, C = Σ sk.
// A, B, C ne dépendent que de Ω : changer ω ou la profondeur ne coûte qu'une combinaison.
export function creerRipple({ taux = 22050, duree = 2, fMin = 250, octaves = 5, parOctave = 60, graine = 7 } = {}) {
  const n = Math.round(taux * duree), K = octaves * parOctave;
  let g = graine;
  const alea = () => ((g = (Math.imul(g, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  const tons = Array.from({ length: K }, () => ({ x: alea() * octaves, phi: alea() * 2 * Math.PI }));
  let cache = null; // { omega_s: Ω, A, B, C }
  function porteuses(Om) {
    if (cache && cache.Om === Om) return cache;
    const A = new Float64Array(n), B = new Float64Array(n), C = new Float64Array(n);
    for (const { x, phi } of tons) {
      const f = fMin * 2 ** x, d = 2 * Math.PI * f / taux;
      const cd = Math.cos(d), sd = Math.sin(d), cp = Math.cos(2 * Math.PI * Om * x), sp = Math.sin(2 * Math.PI * Om * x);
      let s = Math.sin(phi), c = Math.cos(phi); // sin et cos de la porteuse, par rotation
      for (let i = 0; i < n; i++) {
        C[i] += s; A[i] += cp * s; B[i] += sp * s;
        const s2 = s * cd + c * sd; c = c * cd - s * sd; s = s2;
      }
    }
    cache = { Om, A, B, C };
    return cache;
  }
  return {
    taux, duree, fMin, octaves,
    /** Échantillons du ripple (ω Hz, Ω c/oct, profondeur m ∈ [0, 1]) : RMS fixe, rampes de 20 ms. */
    signal(om, Om, m) {
      const { A, B, C } = porteuses(Om);
      const y = new Float32Array(n), w = 2 * Math.PI * om / taux, r = Math.round(0.02 * taux);
      let e = 0;
      for (let i = 0; i < n; i++) {
        y[i] = C[i] + m * (Math.sin(w * i) * A[i] - Math.cos(w * i) * B[i]);
        e += y[i] * y[i];
      }
      let k = 0.12 / Math.sqrt(e / n), pic = 0;
      for (let i = 0; i < n; i++) pic = Math.max(pic, Math.abs(y[i]));
      k = Math.min(k, 0.9 / pic);
      for (let i = 0; i < n; i++) y[i] *= k * Math.min(1, i / r, (n - 1 - i) / r);
      return y;
    },
  };
}

// ─── Lecture (Web Audio) : 300 ms de silence d'amorce, comme tous les sons du cours ────────────
export const AMORCE = 0.3;
export function creerLecteurTampon() {
  let ctx = null, source = null, debut = 0, surFin = null;
  const arreter = () => {
    if (!source) return;
    source.onended = null;
    try { source.stop(); } catch { /* déjà fini */ }
    source = null;
    const f = surFin; surFin = null; f?.();
  };
  return {
    /** Joue y (Float32Array à `taux` Hz) ; surFin() à la fin ou à l'arrêt. */
    jouer(y, taux, fin) {
      arreter();
      ctx ||= new AudioContext();
      ctx.resume?.();
      const a = Math.round(AMORCE * taux), b = ctx.createBuffer(1, a + y.length, taux);
      b.getChannelData(0).set(y, a);
      source = ctx.createBufferSource();
      source.buffer = b;
      source.connect(ctx.destination);
      source.onended = () => { source = null; const f = surFin; surFin = null; f?.(); };
      surFin = fin;
      debut = ctx.currentTime;
      source.start();
    },
    arreter,
    enCours: () => !!source,
    /** Temps écoulé dans le son (amorce retirée), en secondes ; négatif pendant l'amorce. */
    temps: () => (source ? ctx.currentTime - debut - AMORCE : -1),
  };
}

// ─── Spectrogramme en fréquence logarithmique ───────────────────────────────────────────────
export function fft(re, im) {
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

/**
 * Spectrogramme (dB) sur une grille régulière en octaves : trames tous les `pas` s, `parOctave`
 * lignes par octave de fMin à fMin·2^octaves. Fenêtre de Hann de `fenetre` s, FFT complétée de
 * zéros (N = 4096), interpolation linéaire entre les raies.
 */
export function spectrogrammeLog(x, taux, { fMin, octaves, parOctave = 32, pas = 0.005, fenetre = 0.016 } = {}) {
  const N = 4096, L = Math.round(fenetre * taux), P = Math.round(pas * taux);
  const trames = Math.max(1, Math.floor((x.length - L) / P) + 1), lignes = Math.round(octaves * parOctave) + 1;
  const hann = Float64Array.from({ length: L }, (_, k) => 0.5 - 0.5 * Math.cos(2 * Math.PI * k / (L - 1)));
  const raie = Float64Array.from({ length: lignes }, (_, j) => fMin * 2 ** (j / parOctave) / taux * N);
  const db = new Float32Array(trames * lignes), re = new Float64Array(N), im = new Float64Array(N);
  for (let t = 0; t < trames; t++) {
    re.fill(0); im.fill(0);
    for (let k = 0; k < L; k++) re[k] = (x[t * P + k] || 0) * hann[k];
    fft(re, im);
    for (let j = 0; j < lignes; j++) {
      const r = raie[j], k0 = Math.floor(r), a = r - k0;
      const p0 = re[k0] ** 2 + im[k0] ** 2, p1 = re[k0 + 1] ** 2 + im[k0 + 1] ** 2;
      db[t * lignes + j] = 10 * Math.log10(p0 * (1 - a) + p1 * a + 1e-12);
    }
  }
  let max = -Infinity;
  for (const v of db) if (v > max) max = v;
  return { db, trames, lignes, pas, parOctave, fMin, octaves, max };
}

/** Image en gris (noir = fort) d'une grille [trames × lignes], plage de `dyn` dB sous le maximum (le sien, ou maxImpose). */
export function imageGris(db, trames, lignes, dyn = 60, maxImpose = null) {
  let max = maxImpose ?? -Infinity;
  if (maxImpose === null) for (const v of db) if (v > max) max = v;
  const c = document.createElement('canvas');
  c.width = trames; c.height = lignes;
  const g = c.getContext('2d'), img = g.createImageData(trames, lignes);
  for (let t = 0; t < trames; t++) {
    for (let j = 0; j < lignes; j++) {
      const z = Math.max(0, Math.min(1, (db[t * lignes + j] - (max - dyn)) / dyn));
      const o = 4 * ((lignes - 1 - j) * trames + t), v = Math.round(255 * (1 - z ** 1.4));
      img.data[o] = img.data[o + 1] = img.data[o + 2] = v;
      img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL();
}

// ─── Plan des modulations (ω, Ω) : flèche nette et ses projections ─────────────────────────
/**
 * Axes du plan dans g : ω horizontal (−W_MAX … W_MAX Hz), Ω vertical (0 … O_MAX c/oct), origine
 * en bas au milieu. Renvoie { x, y, fleche(ω, Ω) } : la flèche part de l'origine ; deux tirets gris
 * la projettent sur les axes, où la vélocité et la densité s'écrivent en bleu (les graduations
 * qu'elles recouvriraient sont masquées).
 */
export function planModulations(g, { gauche, droite, haut, bas }) {
  const x = echelle(-W_MAX, W_MAX, gauche, droite), y = echelle(0, O_MAX, bas, haut);
  const projX = S('line', { stroke: GRIS, 'stroke-width': 1, 'stroke-dasharray': '4 3' }, g);
  const projY = S('line', { stroke: GRIS, 'stroke-width': 1, 'stroke-dasharray': '4 3' }, g);
  S('line', { x1: gauche, x2: droite, y1: bas, y2: bas, class: 'trait' }, g);
  const etiqX = [-12, -8, -4, 0, 4, 8, 12].map((v) => {
    S('line', { x1: x(v), x2: x(v), y1: bas, y2: bas + 4, class: 'trait' }, g);
    return { v, t: T(g, x(v), bas + 17, nb(v)) };
  });
  T(g, droite, bas + 34, 'ω (Hz)', 'titre-axe', 'end');
  S('line', { x1: x(0), x2: x(0), y1: bas, y2: haut, class: 'trait' }, g);
  const etiqY = [1, 2, 3, 4].map((v) => { // pas de « 0 » : il tomberait sur l'axe des ω (qui a déjà le sien)
    S('line', { x1: x(0) - 4, x2: x(0), y1: y(v), y2: y(v), class: 'trait' }, g);
    return { v, t: T(g, x(0) - 7, y(v) + 4, nb(v), 'graduation', 'end') };
  });
  T(g, x(0) + 8, haut + 4, 'Ω (c/oct)', 'titre-axe', 'start');
  const valX = T(g, 0, bas + 17, ''), valY = T(g, 0, 0, '', 'graduation', 'end');
  valX.style.fill = BLEU; valY.style.fill = BLEU;
  const trait = S('line', { x1: x(0), y1: y(0), stroke: BLEU, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);
  const pointe = S('polygon', { fill: BLEU }, g);
  return {
    x, y,
    fleche(om, Om) {
      const x1 = x(om), y1 = y(Om), dx = x1 - x(0), dy = y1 - y(0), l = Math.hypot(dx, dy);
      // Projections et valeurs : ω sous l'axe horizontal, Ω du côté de l'axe vertical opposé à la pointe.
      projX.setAttribute('x1', x1); projX.setAttribute('x2', x1); projX.setAttribute('y1', y1); projX.setAttribute('y2', y(0));
      projY.setAttribute('x1', x1); projY.setAttribute('x2', x(0)); projY.setAttribute('y1', y1); projY.setAttribute('y2', y1);
      valX.textContent = `${nb(om)} Hz`;
      valX.setAttribute('x', x1);
      valY.textContent = `${nb(Om)} c/oct`;
      const aDroite = om < 0;
      valY.setAttribute('text-anchor', aDroite ? 'start' : 'end');
      valY.setAttribute('x', x(0) + (aDroite ? 7 : -7));
      // À droite de l'axe, près du haut, la valeur passe sous son tiret : sinon elle chevauche « Ω (c/oct) ».
      valY.setAttribute('y', y1 + (aDroite && y1 - y(O_MAX) < 16 ? 18 : 4));
      valY.setAttribute('visibility', Om > 0 ? 'visible' : 'hidden');
      for (const { v, t } of etiqX) t.setAttribute('visibility', Math.abs(x(v) - x1) < 30 ? 'hidden' : 'visible');
      for (const { v, t } of etiqY) t.setAttribute('visibility', !aDroite && Om > 0 && Math.abs(y(v) - y1) < 14 ? 'hidden' : 'visible');
      const vis = l > 1 ? 'visible' : 'hidden';
      trait.setAttribute('visibility', vis); pointe.setAttribute('visibility', vis);
      if (l <= 1) return;
      const ux = dx / l, uy = dy / l, P = 11, D = 5.5, bx = x1 - ux * P, by = y1 - uy * P;
      trait.setAttribute('x2', bx + ux); trait.setAttribute('y2', by + uy);
      pointe.setAttribute('points', `${x1},${y1} ${bx - uy * D},${by + ux * D} ${bx + uy * D},${by - ux * D}`);
    },
  };
}

export { nb };

// ─── Curseur dessiné (port de teaching-demos, shared/pitch/kit.js ; comme diapo-harmonique.js) ─
export function curseur(parent, { largeur, min, max, valeur, action, cle = 'curseur' }) {
  const h = 30, x0 = 12, x1 = largeur - 12, y = h / 2;
  const s = S('svg', { class: 'curseur', width: largeur, height: h }, parent);
  s.style.touchAction = 'none';
  S('rect', { x: 0, y: 0, width: largeur, height: h, fill: 'transparent' }, s);
  R('line', s, [x0, y, x1, y], { cle: cle + 'rail', strokeWidth: 1.5 });
  const clip = S('clipPath', { id: cle + 'clip' }, S('defs', {}, s));
  const rc = S('rect', { x: 0, y: 0, width: 0, height: h }, clip);
  R('line', s, [x0, y, x1, y], { cle: cle + 'actif', stroke: BLEU, strokeWidth: 3 }).setAttribute('clip-path', `url(#${cle}clip)`);
  const p = S('g', { class: 'poignee' }, s);
  R('circle', p, [0, 0, 15], { cle: cle + 'poignee', fill: NOIR, fillStyle: 'solid', roughness: 0.7, strokeWidth: 1.3 });
  let courant = valeur;
  const afficher = () => {
    const px = x0 + ((courant - min) / (max - min)) * (x1 - x0);
    p.setAttribute('transform', `translate(${px} ${y})`);
    rc.setAttribute('width', px);
  };
  const regler = (e, fin = false) => {
    const r = s.getBoundingClientRect(), echelleX = r.width / largeur;
    const q = Math.min(1, Math.max(0, ((e.clientX - r.left) / echelleX - x0) / (x1 - x0)));
    courant = min + q * (max - min);
    afficher();
    action(courant, fin);
  };
  s.addEventListener('pointerdown', (e) => { s.setPointerCapture(e.pointerId); regler(e); });
  s.addEventListener('pointermove', (e) => { if (s.hasPointerCapture(e.pointerId)) regler(e); });
  s.addEventListener('pointerup', (e) => regler(e, true));
  afficher();
  return s;
}

/** WAV PCM 16 bits mono → { x: Float32Array, taux } ; l'amorce (zéros en tête) est retirée. */
export function lireWav(buf) {
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

/**
 * Modulations les plus fortes d'une fenêtre du spectrogramme (dB) : trames t0 … t0+nt, lignes
 * j0 … j0+nj. Plancher à −60 dB du maximum, moyenne et pentes retirées, fenêtre de Hann 2D,
 * transformée évaluée sur la grille ω ∈ [−W_MAX, W_MAX] (pas 0.5 Hz) × Ω ∈ [0, O_MAX] (pas
 * 0.125 c/oct), séparable (temps puis fréquence). Renvoie les `k` composantes les plus fortes,
 * distantes d'au moins une case de résolution (1/durée, 1/étendue) entre elles et de l'origine :
 * [{ om, Om, phase, poids }], poids relatif à la première, convention du ripple
 * cos(2π(ω·t − Ω·x) + phase), t et x comptés depuis le coin bas-gauche de la fenêtre.
 * Une composante « produit » (p. ex. harmoniques × enveloppe syllabique, le « × » de la figure
 * d'Elliott et Theunissen) est elle-même une somme de deux composantes obliques (ω, ±Ω) : la somme
 * des plus fortes la représente.
 */
export function modulationsLocales(sp, t0, j0, nt, nj, k = 3) {
  const { db, lignes, pas, parOctave } = sp;
  const plancher = sp.max - 60; // silences ramenés à −60 dB : leur bruit ne domine pas
  const p = new Float64Array(nt * nj);
  for (let a = 0; a < nt; a++) for (let b = 0; b < nj; b++) p[a * nj + b] = Math.max(plancher, db[(t0 + a) * lignes + j0 + b]);
  // Moyenne et pentes (temps, fréquence) retirées : sinon la pente du spectre, ou un son qui
  // commence, domine toujours et la « modulation » trouvée est presque nulle.
  const ta = (a) => a - (nt - 1) / 2, xb = (b) => b - (nj - 1) / 2;
  let moy = 0, pt = 0, px = 0, st = 0, sx = 0;
  for (let a = 0; a < nt; a++) for (let b = 0; b < nj; b++) {
    const v = p[a * nj + b];
    moy += v; pt += v * ta(a); px += v * xb(b); st += ta(a) ** 2; sx += xb(b) ** 2;
  }
  moy /= nt * nj; pt /= st; px /= sx;
  const ht = (a) => 0.5 - 0.5 * Math.cos(2 * Math.PI * (a + 0.5) / nt), hj = (b) => 0.5 - 0.5 * Math.cos(2 * Math.PI * (b + 0.5) / nj);
  for (let a = 0; a < nt; a++) for (let b = 0; b < nj; b++) p[a * nj + b] = (p[a * nj + b] - moy - pt * ta(a) - px * xb(b)) * ht(a) * hj(b);
  // Sous une case de résolution (1/durée, 1/étendue), une « modulation » n'est que la fenêtre.
  const wMin = 0.75 / (nt * pas), oMin = 0.75 * parOctave / nj;
  const oms = [], Oms = [];
  for (let w = -W_MAX; w <= W_MAX + 1e-9; w += 0.5) oms.push(w);
  for (let o = 0; o <= O_MAX + 1e-9; o += 0.125) Oms.push(o);
  // Temps : Q[ω][b] = Σa p[a][b]·e^{−i2πω·t_a}
  const Qr = new Float64Array(oms.length * nj), Qi = new Float64Array(oms.length * nj);
  oms.forEach((w, q) => {
    for (let a = 0; a < nt; a++) {
      const ph = -2 * Math.PI * w * a * pas, c = Math.cos(ph), s = Math.sin(ph);
      for (let b = 0; b < nj; b++) { const v = p[a * nj + b]; Qr[q * nj + b] += v * c; Qi[q * nj + b] += v * s; }
    }
  });
  // Fréquence : Z[ω][Ω] = Σb Q[ω][b]·e^{+i2πΩ·x_b}
  const cand = [];
  oms.forEach((w, q) => {
    Oms.forEach((o) => {
      if (Math.abs(w) < wMin && o < oMin) return;
      let zr = 0, zi = 0;
      for (let b = 0; b < nj; b++) {
        const ph = 2 * Math.PI * o * b / parOctave, c = Math.cos(ph), s = Math.sin(ph);
        zr += Qr[q * nj + b] * c - Qi[q * nj + b] * s; zi += Qr[q * nj + b] * s + Qi[q * nj + b] * c;
      }
      cand.push({ mag: Math.hypot(zr, zi), om: w, Om: o, phase: Math.atan2(zi, zr) });
    });
  });
  cand.sort((a, b) => b.mag - a.mag);
  const dw = 1 / (nt * pas), dO = parOctave / nj, choisies = [];
  for (const c of cand) {
    if (choisies.length >= k) break;
    if (choisies.some((d) => Math.abs(d.om - c.om) < dw && Math.abs(d.Om - c.Om) < dO)) continue;
    choisies.push(c);
  }
  return choisies.map((c) => ({ ...c, poids: c.mag / choisies[0].mag }));
}
