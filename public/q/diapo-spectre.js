// Diapositives « enveloppe spectrale » du Cours 7 (éléments HTML d'Excalidraw+, srcdoc), dans le
// style des démos (excali/excali.css, excali/excali.js). Un script, une vue par diapositive selon
// l'identifiant de la configuration :
//   - c7centroide (« Centroïde spectral et clarté », 390 × 390) : échelle « sombre ↔ clair » du
//     centroïde et spectre du son choisi. Instruments : les 12 instruments de McAdams et al.
//     (1995) (même F0, 311 Hz) ; Synthèse : un son harmonique de 311 Hz dont un curseur règle
//     l'énergie dans les aigus (pente en dB/octave), joué en continu.
//   - c7etalement, c7asymetrie, c7kurtosis (« Autres descripteurs », 786 × 300) : enveloppe de
//     synthèse (bruit filtré ou son harmonique) sur des échelles linéaires, réglée par un curseur
//     qui ne change que le descripteur de la diapositive ; jouée en continu.
//   - c7flux (« Flux spectral », 786 × 285) : harmoniques dans le temps (gris : niveau) et centroïde
//     au fil du son (comme la vue « variation du centroïde » des corrélats), à côté du classement
//     des 12 instruments selon le flux spectral (échelle log, sans valeur : nombres peu parlants).
//   - c7pente (« Pente et coupure spectrale », 786 × 280) : le même son en deux tracés alignés
//     sur les deux colonnes de texte, pente (droite de régression) et coupure (95 % de l'énergie).
// Autres spectres : harmoniques en dB (0 dB : la plus forte), fréquence en échelle log, comme les
// corrélats. Données : donnees/mcadams1995.json, descripteurs-mcadams1995.json et
// courbes-mcadams1995.json (tools/descripteurs_timbre.mjs).
//
// Document hôte (tools/spectre_cours7.py) :
//   <base href="https://SITE/q/"> <link rel="stylesheet" href="…/q/excali/excali.css">
//   <script src="…/q/excali/rough.js"></script> <div id="demo" class="demo"></div>
//   <script type="application/json" id="config">{"id": "c7centroide"}</script>
import { ajuster, axes, bouton, chemin, choix, ECART_COMMANDES, echelle, H, placer, R, S, T } from './excali/excali.js';
import { creerLecteur } from './correlats-donnees.js';

const conf = JSON.parse(document.getElementById('config')?.textContent || '{}');
const VUE = String(conf.id || 'c7centroide').replace(/^c7/, '');
const TAILLES = { centroide: [390, 390], etalement: [786, 300], asymetrie: [786, 300], kurtosis: [786, 300], pente: [786, 280], flux: [786, 285] };
const [L, HT] = TAILLES[VUE] || TAILLES.centroide;
const BLEU = '#1971c2', ORANGE = '#f08c00', GRIS = '#868e96', NOIR = '#1e1e1e';
// Les 12 instruments (sans les hybrides de McAdams et al., 1995).
const INSTRUMENTS = ['hrn', 'tpt', 'tbn', 'hrp', 'vbs', 'hcd', 'can', 'bsn', 'cnt', 'gtr', 'stg', 'pno'];
const PENTE_SONS = ['hrn', 'cnt', 'bsn', 'stg', 'tpt'];
const F_MIN = 250, F_MAX = 8000, F0 = 311;
const TICKS_F = [250, 500, 1000, 2000, 4000, 8000];
const fmtF = (f) => (f >= 8000 ? `${f / 1000} kHz` : f >= 1000 ? `${f / 1000}k` : String(f));
const fDb = (v) => (v === 0 ? '0 dB' : String(v).replace('-', '−'));
const nb = (v, d = 0) => v.toFixed(d).replace('-', '−'); // point décimal, comme les autres figures
const hz = (v) => `${Math.round(v)} Hz`;
const DESC = {
  centroide: { nom: 'Centroïde', val: hz },
  etalement: { nom: 'Étendue', val: hz },
  asymetrie: { nom: 'Asymétrie', val: (v) => nb(v, 2) },
  kurtosis: { nom: 'Kurtosis', val: (v) => nb(v, 1) },
  flux: { nom: 'Flux', val: (v) => v.toPrecision(2) },
  pente_spectrale: { nom: 'Pente', val: (v) => `${nb(v, 1)} dB/oct` },
  rolloff: { nom: 'Coupure', val: hz },
};

const lecteur = creerLecteur();
const demo = document.getElementById('demo');
let sons = []; // { cle, nom, fichier, valeurs, h: { f, db } }

// ─── Spectre ─────────────────────────────────────────────────────────────
// Harmoniques (barres) de h = { f, db } dans la boîte b = { g, d, h, b } ; renvoie les échelles.
function spectre(g, h, b, coul, cle) {
  const FX = echelle(F_MIN, F_MAX, b.g, b.d, true), Y = echelle(-60, 0, b.b, b.h);
  axes(g, { x: FX, y: Y, ticksX: TICKS_F, ticksY: [-60, -30, 0], formatX: fmtF, formatY: fDb });
  const fx = (f) => FX(Math.max(F_MIN, Math.min(F_MAX, f)));
  const barres = () => h.db.forEach((v, i) => {
    if (h.f[i] > F_MAX) return;
    S('line', { x1: FX(h.f[i]), x2: FX(h.f[i]), y1: b.b, y2: Math.min(b.b, Y(Math.max(-60, v))), stroke: coul, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
  });
  const marque = (x, c = NOIR, tiret = '5 4') => S('line', { x1: x, x2: x, y1: b.h, y2: b.b, stroke: c, 'stroke-width': 1.2, 'stroke-dasharray': tiret }, g);
  const zone = (x0, x1, k) => R('rectangle', g, [x0, b.h, Math.max(3, x1 - x0), b.b - b.h], { cle: k, stroke: 'none', fill: '#ced4da', hachureGap: 4, fillWeight: 1 });
  return { FX, Y, fx, barres, marque, zone };
}

// Droite de régression des harmoniques (dB) selon le log2 du rang, coupée au tracé.
function regression(h) {
  const n = h.db.length, pts = h.db.map((v, i) => [Math.log2(i + 1), v]);
  const mx = pts.reduce((a, q) => a + q[0], 0) / n, my = pts.reduce((a, q) => a + q[1], 0) / n;
  const p = pts.reduce((a, q) => a + (q[0] - mx) * (q[1] - my), 0) / pts.reduce((a, q) => a + (q[0] - mx) ** 2, 0);
  return (i) => my + p * (Math.log2(i + 1) - mx);
}

// Flèche propre (jamais dessinée à la main).
function fleche(g, x1, x2, y, c = NOIR) {
  const s = Math.sign(x2 - x1) || 1;
  S('line', { x1, x2: x2 - s * 5, y1: y, y2: y, stroke: c, 'stroke-width': 1.8 }, g);
  S('path', { d: chemin([[x2, y], [x2 - s * 7, y - 4], [x2 - s * 7, y + 4]]) + 'Z', fill: c }, g);
}

// Légende alignée à droite (x) sur la ligne y. Éléments : { type, texte, couleur }.
function legende(g, x, y, items) {
  for (const it of [...items].reverse()) {
    const t = T(g, x, y + 4, it.texte, 'indice', 'end');
    t.setAttribute('font-size', 13);
    x -= t.getComputedTextLength() + 5;
    const c = it.couleur || NOIR;
    if (it.type === 'barre') S('line', { x1: x - 6, x2: x - 6, y1: y - 5, y2: y + 5, stroke: c, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    else if (it.type === 'zone') R('rectangle', g, [x - 16, y - 5, 16, 10], { cle: 'lz' + it.texte, stroke: 'none', fill: c, hachureGap: 3, fillWeight: 1 });
    else if (it.type === 'fleche') fleche(g, x - 18, x - 2, y, c);
    else S('line', { x1: x - 18, x2: x - 2, y1: y, y2: y, stroke: c, 'stroke-width': 1.5, 'stroke-dasharray': it.type === 'tiret' ? '4 3' : it.type === 'pointille' ? '2 3' : null }, g);
    x -= (it.type === 'barre' ? 12 : 18) + 14;
  }
}

// Tracé d'un moment (centroïde, étendue, asymétrie, kurtosis), comme sur la diapositive des corrélats.
function moment(g, son, b, cle, coul = BLEU) {
  const v = son.valeurs, sp = spectre(g, son.h, b, coul, cle);
  const cx = sp.fx(v.centroide);
  if (cle !== 'centroide') sp.zone(sp.fx(v.centroide - v.etalement), sp.fx(v.centroide + v.etalement), 'et' + son.cle);
  if (cle === 'kurtosis') for (const s of [-2, 2]) {
    const f = v.centroide + s * v.etalement;
    if (f > F_MIN) sp.marque(sp.fx(f), GRIS, '2 3');
  }
  sp.barres();
  sp.marque(cx);
  if (cle === 'asymetrie') { // traîne : du côté opposé à la masse, longueur selon l'asymétrie
    const l = Math.min(Math.abs(v.asymetrie), 4) / 4 * 140 + 20;
    fleche(g, cx, cx + Math.sign(v.asymetrie) * l, sp.Y(-20));
  }
  legende(g, b.d, b.h - 14, {
    centroide: [{ type: 'barre', couleur: coul, texte: 'harmonique' }, { type: 'tiret', texte: 'centroïde' }],
    etalement: [{ type: 'tiret', texte: 'centroïde' }, { type: 'zone', couleur: '#adb5bd', texte: '± 1 écart type (étendue)' }],
    asymetrie: [{ type: 'tiret', texte: 'centroïde' }, { type: 'fleche', texte: 'traîne (longueur : asymétrie)' }],
    kurtosis: [{ type: 'zone', couleur: '#adb5bd', texte: '± 1 écart type' }, { type: 'pointille', couleur: GRIS, texte: '± 2 écarts types' }],
  }[cle]);
}

// Ligne de lecture : ▶, nom (couleur), valeur à droite.
function entete(parent, son, texteValeur, coul = BLEU) {
  parent.replaceChildren();
  const b = bouton(parent, '', () => { lecteur.jouer(son, rendre); rendre(); }, { largeur: 34, hauteur: 26, jouer: true, titre: `Écouter : ${son.nom}` });
  if (lecteur.enCours() === son) b.lecture(true);
  H('span', null, son.nom, parent).style.color = coul;
  const val = H('span', null, texteValeur, parent);
  val.style.marginLeft = 'auto';
  val.style.color = coul;
}

function ligne(x, y, l) {
  const e = placer(H('div', 'lecture', null, demo), x, y, l);
  e.style.display = 'flex';
  e.style.alignItems = 'center';
  e.style.gap = '8px';
  return e;
}

// ─── Autres descripteurs : spectre + classement ────────────────────────────
function vueClassement(cle, { log = false, valeurs = true, tracer = null, valeurTete = null } = {}) {
  const GL = 470, XL = 500, LL = L - XL;
  const tete = ligne(0, 0, GL);
  const svg = placer(S('svg', { width: GL, height: HT - 34 }), 0, 34);
  const liste = placer(S('svg', { width: LL, height: HT }), XL, 0);
  demo.append(svg, liste);
  const tri = () => [...sons].sort((a, b) => a.valeurs[cle] - b.valeurs[cle]);
  let choisi = tracer ? tri()[sons.length - 1] : tri()[0];
  return () => {
    entete(tete, choisi, valeurTete ? valeurTete(choisi) : DESC[cle].val(choisi.valeurs[cle]));
    svg.replaceChildren();
    const boite = { g: 46, d: GL - 22, h: 26, b: HT - 34 - 24 };
    if (tracer) tracer(svg, choisi, boite);
    else moment(svg, choisi, boite, cle);
    // Classement : du plus faible au plus fort ; un point sur une petite échelle commune.
    liste.replaceChildren();
    const haut = valeurs ? 0 : 18, ordre = tri(), pas = (HT - haut) / ordre.length;
    const vals = ordre.map((s) => s.valeurs[cle]);
    const X = echelle(Math.min(...vals), Math.max(...vals), 130, valeurs ? LL - 74 : LL - 12, log);
    S('line', { x1: X.r0, x2: X.r0, y1: haut + 4, y2: HT - 4, stroke: '#dee2e6' }, liste);
    S('line', { x1: X.r1, x2: X.r1, y1: haut + 4, y2: HT - 4, stroke: '#dee2e6' }, liste);
    if (!valeurs) { // bouts de l'échelle, en haut
      T(liste, X.r0, 12, 'faible', 'indice', 'start').setAttribute('font-size', 12);
      T(liste, X.r1, 12, 'élevé', 'indice', 'end').setAttribute('font-size', 12);
    }
    ordre.forEach((s, i) => {
      const y = haut + pas * (i + 0.5), actif = s === choisi, coul = actif ? BLEU : NOIR;
      const r = S('g', { class: 'cliquable' }, liste);
      S('rect', { x: 0, y: y - pas / 2, width: LL, height: pas, fill: 'transparent' }, r);
      if (actif) S('rect', { x: 0, y: y - pas / 2 + 1, width: LL, height: pas - 2, fill: '#e7f5ff', rx: 4 }, r);
      const n = T(r, 6, y + 5, s.nom, 'indice', 'start');
      const v = valeurs ? T(r, LL - 4, y + 5, DESC[cle].val(s.valeurs[cle]), 'indice', 'end') : null;
      for (const t of [n, v].filter(Boolean)) { t.setAttribute('font-size', 14); t.style.fill = coul; if (actif) t.setAttribute('font-weight', 700); }
      S('line', { x1: X.r0, x2: X(s.valeurs[cle]), y1: y, y2: y, stroke: actif ? BLEU : '#ced4da', 'stroke-width': 2 }, r);
      S('circle', { cx: X(s.valeurs[cle]), cy: y, r: actif ? 5 : 4, fill: actif ? BLEU : GRIS }, r);
      S('title', {}, r).textContent = `Choisir et écouter : ${s.nom}`;
      r.addEventListener('click', () => {
        if (choisi !== s) { choisi = s; lecteur.arreter(); }
        lecteur.jouer(s, rendre);
        rendre();
      });
    });
  };
}

// ─── Flux : harmoniques dans le temps et centroïde ─────────────────────────
function tracerFlux(g, son, b) {
  const c = son.courbe, f0 = c.harmoniques.f0, nh = c.harmoniques.db.length;
  const tX = echelle(0, c.duree, b.g, b.d), fMax = (nh + 0.5) * f0, Y = echelle(0, fMax, b.b, b.h + 16);
  const pasT = c.duree > 1.2 ? 0.4 : c.duree > 0.6 ? 0.2 : 0.1, ticksT = [];
  for (let t = 0; t <= c.duree + 1e-9; t += pasT) ticksT.push(Number(t.toFixed(2)));
  const pasH = c.harmogramme.length > 1 ? c.harmogramme[1][0] - c.harmogramme[0][0] : 0.023, hh = Math.abs(Y(f0) - Y(2 * f0)) * 0.55; // une ligne par harmonique
  for (const [t, niveau, rel] of c.harmogramme) {
    const x0 = tX(Math.max(0, t - pasH / 2)), w = tX(Math.min(c.duree, t + pasH / 2)) - x0;
    rel.forEach((vr, i) => {
      const v = niveau + vr;
      if (v > -60) S('rect', { x: x0, y: Y((i + 1) * f0) - hh / 2, width: w + 0.3, height: hh + 0.3, fill: '#495057', 'fill-opacity': ((v + 60) / 60) ** 1.5 * 0.45 }, g);
    });
  }
  axes(g, { x: tX, y: Y, ticksX: ticksT, ticksY: [0, 3000, 6000].filter((f) => f <= fMax), formatX: (t) => (t === ticksT[ticksT.length - 1] ? `${nb(t, 1)} s` : nb(t, 1)),
    formatY: (f) => (f === 6000 ? '6 kHz' : String(f / 1000)) });
  S('path', { d: chemin(c.trames.map(([t, f]) => [tX(t), Y(Math.min(fMax, f))])), fill: 'none', stroke: BLEU, 'stroke-width': 2 }, g);
  legende(g, b.d, b.h - 14, [{ type: 'barre', couleur: '#868e96', texte: 'harmoniques (foncé : fort)' }, { type: 'ligne', couleur: BLEU, texte: 'centroïde' }]);
}

// ─── Pente et coupure ──────────────────────────────────────────────────────
function vuePente() {
  const barre = placer(H('div', null, null, demo), 0, 0);
  barre.style.display = 'flex';
  barre.style.gap = ECART_COMMANDES + 'px';
  const parCle = new Map(sons.map((s) => [s.cle, s]));
  const liste = PENTE_SONS.map((c) => parCle.get(c)).filter(Boolean);
  let choisi = liste[0];
  const jouer = bouton(barre, '', () => { lecteur.jouer(choisi, rendre); rendre(); }, { largeur: 34, jouer: true, titre: 'Écouter' });
  choix(barre, liste.map((s) => ({ texte: s.nom, valeur: s.cle })), choisi.cle,
    (c) => { choisi = parCle.get(c); lecteur.arreter(); rendre(); }, { compact: true, egal: false });
  // Deux tracés sous les deux colonnes de texte de la diapositive (x 0 et 400).
  const COL = 386, X2 = 400, Y0 = 46;
  const svg = placer(S('svg', { width: L, height: HT - Y0 }), 0, Y0);
  demo.append(svg);
  return () => {
    jouer.lecture(lecteur.enCours() === choisi);
    svg.replaceChildren();
    const h = choisi.h, v = choisi.valeurs;
    [['pente_spectrale', 0], ['rolloff', X2]].forEach(([cle, x0]) => {
      const g = S('g', { transform: `translate(${x0} 0)` }, svg);
      const b = { g: 46, d: COL - 22, h: 34, b: HT - Y0 - 24 };
      const t = T(g, 0, 14, `${DESC[cle].nom} : ${DESC[cle].val(v[cle])}`, 'indice', 'start');
      t.setAttribute('font-size', 15);
      t.setAttribute('font-weight', 700);
      t.style.fill = BLEU;
      const sp = spectre(g, h, b, BLEU, cle);
      if (cle === 'pente_spectrale') {
        sp.barres();
        const fit = regression(h);
        const clip = S('clipPath', { id: 'zp' }, g);
        S('rect', { x: b.g, y: b.h, width: b.d - b.g, height: b.b - b.h }, clip);
        S('path', { d: chemin(h.db.map((_, i) => [sp.FX(h.f[0] * (i + 1)), sp.Y(fit(i))])), fill: 'none', stroke: NOIR, 'stroke-width': 1.8, 'stroke-dasharray': '6 4', 'clip-path': 'url(#zp)' }, g);
        legende(g, b.d, 14, [{ type: 'barre', couleur: BLEU, texte: 'harmonique' }, { type: 'tiret', texte: 'régression' }]);
      } else {
        sp.zone(sp.fx(v.rolloff), b.d, 'ro' + choisi.cle);
        sp.barres();
        sp.marque(sp.fx(v.rolloff));
        legende(g, b.d, 14, [{ type: 'tiret', texte: 'coupure' }, { type: 'zone', couleur: '#adb5bd', texte: "5 % de l'énergie" }]);
      }
    });
  };
}

// ─── Centroïde et clarté ───────────────────────────────────────────────────
// Son de synthèse : 20 harmoniques de F0, niveau de l'harmonique h = pente × log2(h) dB.
const NH = 20;
const ampsSynth = (p) => Array.from({ length: NH }, (_, i) => 10 ** ((p * Math.log2(i + 1)) / 20));
function synthese(p) {
  const a = ampsSynth(p), m = Math.max(...a);
  const f = a.map((_, i) => F0 * (i + 1));
  const c = a.reduce((s, x, i) => s + x * f[i], 0) / a.reduce((s, x) => s + x, 0); // amplitudes, comme les descripteurs
  return { cle: 'synth', nom: 'Son de synthèse', h: { f, db: a.map((x) => 20 * Math.log10(x / m)) }, valeurs: { centroide: c } };
}

// Lecture continue du son de synthèse (Web Audio), 300 ms de silence avant le son.
function creerSynth() {
  let ctx = null, osc = null, gain = null;
  const onde = (p) => {
    const a = ampsSynth(p), reel = new Float32Array(NH + 1), imag = new Float32Array(NH + 1);
    a.forEach((x, i) => { imag[i + 1] = x; });
    return ctx.createPeriodicWave(reel, imag);
  };
  return {
    enCours: () => !!osc,
    jouer(p) {
      ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume();
      const t = ctx.currentTime + 0.3;
      gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.03);
      osc = ctx.createOscillator();
      osc.frequency.value = F0;
      osc.setPeriodicWave(onde(p));
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
    },
    regler(p) { if (osc) osc.setPeriodicWave(onde(p)); },
    arreter() {
      if (!osc) return;
      const t = ctx.currentTime;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.03);
      osc.stop(t + 0.05);
      osc = gain = null;
    },
  };
}

// Curseur dessiné (port de teaching-demos, shared/pitch/kit.js).
function curseur(parent, { largeur, min, max, valeur, action, cle = 'curseur' }) {
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
  const regler = (e) => {
    const r = s.getBoundingClientRect(), echelleX = r.width / largeur;
    const q = Math.min(1, Math.max(0, ((e.clientX - r.left) / echelleX - x0) / (x1 - x0)));
    courant = min + q * (max - min);
    afficher();
    action(courant);
  };
  s.addEventListener('pointerdown', (e) => { s.setPointerCapture(e.pointerId); regler(e); });
  s.addEventListener('pointermove', (e) => { if (s.hasPointerCapture(e.pointerId)) regler(e); });
  afficher();
  return s;
}

function vueCentroide() {
  const etat = { mode: 'instruments', p: -12 };
  let choisi = sons.find((s) => s.cle === 'hrn') || sons[0];
  const synth = creerSynth();
  const arreter = () => { lecteur.arreter(); synth.arreter(); };
  arreterTout = () => synth.arreter();
  choix(placer(H('div', null, null, demo), 0, 0), [{ texte: 'Instruments', valeur: 'instruments', titre: 'McAdams et al. (1995) : 12 instruments, même F0 (311 Hz)' },
    { texte: 'Synthèse', valeur: 'synthese', titre: 'Son harmonique de 311 Hz, 20 harmoniques' }], etat.mode,
  (m) => { etat.mode = m; arreter(); rendre(); }, { compact: true });
  const tete = ligne(0, 44, L);
  // Synthèse : ▶ et curseur de la pente (énergie dans les aigus).
  const reglage = placer(H('div', null, null, demo), 0, 42);
  reglage.style.display = 'flex';
  reglage.style.alignItems = 'center';
  reglage.style.gap = '8px';
  const jouerS = bouton(reglage, '', () => { if (synth.enCours()) synth.arreter(); else synth.jouer(etat.p); rendre(); }, { largeur: 34, jouer: true, titre: 'Écouter (en continu)' });
  const aigu = H('span', 'indice-html', 'aigus', null);
  const grave = H('span', 'indice-html', 'graves', reglage);
  curseur(reglage, { largeur: 186, min: -24, max: -3, valeur: etat.p, cle: 'pente', action: (p) => { etat.p = p; synth.regler(p); rendre(); } });
  reglage.append(aigu);
  const valS = H('span', null, '', reglage);
  valS.style.marginLeft = 'auto';
  valS.style.color = BLEU;
  for (const e of [grave, aigu]) e.style.position = 'static';
  reglage.style.width = L + 'px';
  const svg = placer(S('svg', { width: L, height: HT - 80 }), 0, 80);
  demo.append(svg);
  const YE = 40; // échelle sombre ↔ clair
  const fGauche = 400, fDroite = 3200;
  return () => {
    const instr = etat.mode === 'instruments';
    tete.hidden = !instr;
    reglage.hidden = instr;
    const son = instr ? choisi : synthese(etat.p);
    if (instr) entete(tete, choisi, `centroïde : ${hz(choisi.valeurs.centroide)}`);
    else {
      jouerS.lecture(synth.enCours());
      valS.textContent = `${hz(son.valeurs.centroide)}`;
      valS.title = `Pente : ${nb(etat.p, 1)} dB/octave`;
    }
    svg.replaceChildren();
    // Échelle du centroïde (log) : sombre à gauche, clair à droite ; un point par instrument.
    const X = echelle(fGauche, fDroite, 14, L - 14, true), y = YE;
    S('line', { x1: X.r0, x2: X.r1, y1: y, y2: y, class: 'trait' }, svg);
    for (const f of [500, 1000, 2000]) {
      S('line', { x1: X(f), x2: X(f), y1: y, y2: y + 4, class: 'trait' }, svg);
      T(svg, X(f), y + 17, f >= 1000 ? `${f / 1000} kHz` : `${f} Hz`);
    }
    for (const [x, texte, ancre] of [[X.r0, 'sombre', 'start'], [X.r1, 'clair', 'end']]) {
      const t = T(svg, x, y - 12, texte, 'indice', ancre);
      t.style.fill = NOIR;
    }
    const pos = (f) => X(Math.max(fGauche, Math.min(fDroite, f)));
    if (instr) {
      const ordre = [...sons].sort((a, b) => (a === choisi) - (b === choisi)); // le choisi par-dessus
      ordre.forEach((s) => {
        const actif = s === choisi;
        const c = S('g', { class: 'cliquable' }, svg);
        S('circle', { cx: pos(s.valeurs.centroide), cy: y, r: 10, fill: 'transparent' }, c); // cible plus large que le point
        S('circle', { cx: pos(s.valeurs.centroide), cy: y, r: actif ? 6 : 4.5, fill: actif ? BLEU : GRIS, 'fill-opacity': actif ? 1 : 0.75 }, c);
        S('title', {}, c).textContent = `${s.nom} : ${hz(s.valeurs.centroide)}`;
        c.addEventListener('click', () => { if (choisi !== s) { choisi = s; lecteur.arreter(); } lecteur.jouer(s, rendre); rendre(); });
      });
    } else {
      sons.forEach((s) => S('circle', { cx: pos(s.valeurs.centroide), cy: y, r: 3, fill: '#ced4da' }, svg));
      S('circle', { cx: pos(son.valeurs.centroide), cy: y, r: 6, fill: BLEU }, svg);
    }
    moment(svg, son, { g: 46, d: L - 22, h: 96, b: HT - 80 - 24 }, 'centroide');
  };
}

// ─── Étendue, asymétrie, kurtosis : enveloppe de synthèse ──────────────────
// Enveloppe spectrale (amplitude, 0 à 1) sur une échelle linéaire de 0 à 8 kHz, réglée par un
// curseur ; seul le descripteur de la diapositive change :
//   - étendue : gaussienne centrée à 4 kHz, écart type de 150 à 1200 Hz ;
//   - asymétrie : deux demi-gaussiennes (mode à 4 kHz), traîne plus longue d'un côté ;
//   - kurtosis : gaussienne généralisée de même écart type (900 Hz), de pointue à plate ; la
//     gaussienne de même aire en pointillé (kurtosis 3).
// Moments calculés sur les amplitudes, comme les descripteurs, sur ce qui est joué : la
// densité du bruit, ou les harmoniques (F0 ≈ 200 Hz). Son en boucle (IFFT, phases aléatoires
// fixes), énergie constante, 300 ms de silence avant le son.
const F_LIN = 8000, PAS_F = 10, CENTRE = 4000, F0_SYNTH = 200;
const gamma = (z) => { // Lanczos
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * t ** (z + 0.5) * Math.exp(-t) * x;
};
const REGLAGES = {
  etalement: { min: 150, max: 1200, depart: 400, gauche: 'étroite', droite: 'large', nom: 'étendue',
    forme: (s) => (f) => Math.exp(-0.5 * ((f - CENTRE) / s) ** 2) },
  asymetrie: { min: -0.8, max: 0.8, depart: 0.6, gauche: 'traîne grave', droite: 'traîne aiguë', nom: 'asymétrie',
    forme: (a) => (f) => { const s = 700 * (f < CENTRE ? 1 - a : 1 + a); return Math.exp(-0.5 * ((f - CENTRE) / s) ** 2); } },
  kurtosis: { min: 0, max: 1, depart: 0.2, gauche: 'pointue', droite: 'plate', nom: 'kurtosis',
    // q de 0 à 1 → β de 0,8 à 10 (log) ; échelle choisie pour un écart type de 900 Hz.
    forme: (q) => { const b = 0.8 * (10 / 0.8) ** q, al = 900 * Math.sqrt(gamma(1 / b) / gamma(3 / b)); return (f) => Math.exp(-((Math.abs(f - CENTRE) / al) ** b)); } },
};

function moments(f, a) {
  const s = a.reduce((x, y) => x + y, 0);
  const c = f.reduce((x, fi, i) => x + fi * a[i], 0) / s;
  const m = (k) => f.reduce((x, fi, i) => x + (fi - c) ** k * a[i], 0) / s;
  const v = m(2), e = Math.sqrt(v);
  return { centroide: c, etalement: e, asymetrie: m(3) / e ** 3, kurtosis: m(4) / v ** 2 };
}

// FFT complexe en place (radix 2) ; inverse si inv.
function fft(re, im, inv) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let b = n >> 1;
    for (; j & b; b >>= 1) j ^= b;
    j ^= b;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let l = 2; l <= n; l <<= 1) {
    const a = ((inv ? 2 : -2) * Math.PI) / l, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += l) {
      let cr = 1, ci = 0;
      for (let k = 0; k < l / 2; k++) {
        const p = i + k, q = p + l / 2, tr = re[q] * cr - im[q] * ci, ti = re[q] * ci + im[q] * cr;
        re[q] = re[p] - tr; im[q] = im[p] - ti; re[p] += tr; im[p] += ti;
        [cr, ci] = [cr * wr - ci * wi, cr * wi + ci * wr];
      }
    }
  }
}

// Lecture en boucle d'un spectre (amplitude par fréquence), fondu de 60 ms à chaque réglage.
function creerBoucle() {
  const N = 1 << 16;
  let ctx = null, courant = null, phases = null;
  const tampon = (amp, harmonique) => {
    const sr = ctx.sampleRate, df = sr / N, re = new Float64Array(N), im = new Float64Array(N);
    const k0 = Math.round(F0_SYNTH / df);
    for (let k = 1; k < N / 2 && k * df <= F_LIN; k++) {
      if (harmonique && k % k0) continue;
      const a = amp(k * df);
      re[k] = a * Math.cos(phases[k]); im[k] = a * Math.sin(phases[k]);
      re[N - k] = re[k]; im[N - k] = -im[k];
    }
    fft(re, im, true);
    let e = 0;
    for (let i = 0; i < N; i++) e += re[i] ** 2;
    const g = 0.07 / Math.sqrt(e / N || 1); // énergie constante
    const b = ctx.createBuffer(1, N, sr), d = b.getChannelData(0);
    for (let i = 0; i < N; i++) d[i] = Math.max(-0.95, Math.min(0.95, re[i] * g));
    return b;
  };
  const lancer = (amp, harmonique, delai) => {
    const t = ctx.currentTime + delai, s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = tampon(amp, harmonique);
    s.loop = true;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1, t + 0.06);
    s.connect(g).connect(ctx.destination);
    s.start(t);
    return { s, g };
  };
  const couper = (v) => {
    const t = ctx.currentTime;
    v.g.gain.cancelScheduledValues(t);
    v.g.gain.setValueAtTime(v.g.gain.value, t);
    v.g.gain.linearRampToValueAtTime(0, t + 0.06);
    v.s.stop(t + 0.08);
  };
  return {
    enCours: () => !!courant,
    jouer(amp, harmonique) {
      ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume();
      if (!phases) { let x = 12345; phases = Float64Array.from({ length: N / 2 }, () => ((x = (x * 16807) % 2147483647) / 2147483647) * 2 * Math.PI); }
      courant = lancer(amp, harmonique, 0.3);
    },
    regler(amp, harmonique) {
      if (!courant) return;
      couper(courant);
      courant = lancer(amp, harmonique, 0);
    },
    arreter() { if (courant) { couper(courant); courant = null; } },
  };
}

function vueSynthMoment(cle) {
  const r = REGLAGES[cle];
  const etat = { p: r.depart, harmonique: false };
  const boucle = creerBoucle();
  arreterTout = () => boucle.arreter();
  const forme = () => r.forme(etat.p);
  let attente = 0; // réglage du son au plus toutes les 100 ms pendant le glissement
  const resonner = () => {
    if (attente) return;
    attente = setTimeout(() => { attente = 0; boucle.regler(forme(), etat.harmonique); }, 100);
  };
  const barre = placer(H('div', null, null, demo), 0, 0);
  barre.style.cssText += `display:flex;align-items:center;gap:${ECART_COMMANDES}px;width:${L}px`;
  const jouer = bouton(barre, '', () => { if (boucle.enCours()) boucle.arreter(); else boucle.jouer(forme(), etat.harmonique); rendre(); }, { largeur: 34, jouer: true, titre: 'Écouter (en continu)' });
  choix(barre, [{ texte: 'Bruit', valeur: false, titre: 'Bruit filtré : enveloppe continue' }, { texte: 'Harmonique', valeur: true, titre: `Son harmonique (F0 ≈ ${F0_SYNTH} Hz) : l'enveloppe est échantillonnée par les harmoniques` }],
    etat.harmonique, (v) => { etat.harmonique = v; boucle.regler(forme(), v); rendre(); }, { compact: true });
  const reglage = H('div', null, null, barre);
  reglage.style.cssText = 'display:flex;align-items:center;gap:8px;flex:1';
  H('span', 'indice-html', r.gauche, reglage).style.position = 'static';
  curseur(reglage, { largeur: 200, min: r.min, max: r.max, valeur: r.depart, cle: 'c' + cle, action: (p) => { etat.p = p; resonner(); rendre(); } });
  H('span', 'indice-html', r.droite, reglage).style.position = 'static';
  const val = H('span', null, '', reglage);
  val.style.cssText = `margin-left:auto;color:${BLEU};font-weight:700`;
  const svg = placer(S('svg', { width: L, height: HT - 44 }), 0, 44);
  demo.append(svg);
  const fs = Array.from({ length: F_LIN / PAS_F + 1 }, (_, i) => i * PAS_F);
  return () => {
    jouer.lecture(boucle.enCours());
    const amp = forme(), env = fs.map(amp);
    const fh = Array.from({ length: Math.floor(F_LIN / F0_SYNTH) }, (_, i) => (i + 1) * F0_SYNTH);
    const m = etat.harmonique ? moments(fh, fh.map(amp)) : moments(fs, env);
    val.textContent = `${r.nom} : ${cle === 'etalement' ? hz(m.etalement) : nb(m[cle], cle === 'kurtosis' ? 1 : 2)}`;
    val.title = `centroïde ${hz(m.centroide)} ; étendue ${hz(m.etalement)} ; asymétrie ${nb(m.asymetrie, 2)} ; kurtosis ${nb(m.kurtosis, 1)}`;
    svg.replaceChildren();
    // Gaussienne de référence (kurtosis) : même centroïde, même écart type, même aire.
    let ref = null;
    if (cle === 'kurtosis') {
      const g = fs.map((f) => Math.exp(-0.5 * ((f - m.centroide) / m.etalement) ** 2));
      const k = env.reduce((a, b) => a + b, 0) / g.reduce((a, b) => a + b, 0);
      ref = g.map((v) => v * k);
    }
    const yMax = Math.max(1, ...(ref || [0])) * 1.05;
    const b = { g: 34, d: L - 24, h: 30, b: HT - 44 - 24 };
    const X = echelle(0, F_LIN, b.g, b.d), Y = echelle(0, yMax, b.b, b.h);
    const zone = (f0, f1, k) => R('rectangle', svg, [X(Math.max(0, f0)), b.h, Math.max(3, X(Math.min(F_LIN, f1)) - X(Math.max(0, f0))), b.b - b.h], { cle: k, stroke: 'none', fill: '#ced4da', hachureGap: 4, fillWeight: 1 });
    if (cle !== 'asymetrie') zone(m.centroide - m.etalement, m.centroide + m.etalement, 'z' + cle);
    if (cle === 'kurtosis') for (const s of [-2, 2]) {
      const x = X(m.centroide + s * m.etalement);
      S('line', { x1: x, x2: x, y1: b.h, y2: b.b, stroke: GRIS, 'stroke-width': 1, 'stroke-dasharray': '2 3' }, svg);
    }
    const pts = fs.map((f, i) => [X(f), Y(env[i])]);
    if (etat.harmonique) {
      S('path', { d: chemin(pts), fill: 'none', stroke: GRIS, 'stroke-width': 1.2 }, svg);
      fh.forEach((f) => { const a = amp(f); if (a > 0.004) S('line', { x1: X(f), x2: X(f), y1: b.b, y2: Y(a), stroke: BLEU, 'stroke-width': 3, 'stroke-linecap': 'round' }, svg); });
    } else {
      S('path', { d: chemin([[X(0), b.b], ...pts, [X(F_LIN), b.b]]) + 'Z', fill: '#a5d8ff', 'fill-opacity': 0.55, stroke: BLEU, 'stroke-width': 2 }, svg);
    }
    if (ref) S('path', { d: chemin(fs.map((f, i) => [X(f), Y(ref[i])])), fill: 'none', stroke: NOIR, 'stroke-width': 1.5, 'stroke-dasharray': '2 4' }, svg);
    axes(svg, { x: X, y: Y, ticksX: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000], ticksY: [], formatX: (f) => (f === F_LIN ? '8 kHz' : f ? `${f / 1000}k` : '0') });
    T(svg, b.g + 6, b.h + 2, 'amplitude', 'indice', 'start').setAttribute('font-size', 13);
    const cx = X(m.centroide);
    S('line', { x1: cx, x2: cx, y1: b.h, y2: b.b, stroke: NOIR, 'stroke-width': 1.2, 'stroke-dasharray': '5 4' }, svg);
    if (cle === 'asymetrie' && Math.abs(m.asymetrie) > 0.05) { // traîne : longueur selon l'asymétrie
      const l = Math.min(Math.abs(m.asymetrie), 1.2) / 1.2 * 160 + 20;
      fleche(svg, cx, cx + Math.sign(m.asymetrie) * l, Y(0.5 * yMax));
    }
    const source = etat.harmonique ? { type: 'barre', couleur: BLEU, texte: 'harmonique' } : { type: 'ligne', couleur: BLEU, texte: 'enveloppe' };
    legende(svg, b.d, b.h - 14, {
      etalement: [source, { type: 'tiret', texte: 'centroïde' }, { type: 'zone', couleur: '#adb5bd', texte: '± 1 écart type (étendue)' }],
      asymetrie: [source, { type: 'tiret', texte: 'centroïde' }, { type: 'fleche', texte: 'traîne (longueur : asymétrie)' }],
      kurtosis: [source, { type: 'pointille', texte: 'gaussienne (kurtosis 3)' }, { type: 'zone', couleur: '#adb5bd', texte: '± 1 écart type' }, { type: 'pointille', couleur: GRIS, texte: '± 2' }],
    }[cle]);
  };
}

// ─── Mise en route ─────────────────────────────────────────────────────────
let rendre = () => {}, arreterTout = () => {};

ajuster(demo, L, HT, { surMasque: () => { lecteur.arreter(); arreterTout(); rendre(); } });

(async () => {
  try {
    const lire = async (u) => {
      const r = await fetch(u, { cache: 'no-cache' });
      if (!r.ok) throw new Error(`Données introuvables (${u})`);
      return r.json();
    };
    const [ref, desc, courbes] = await Promise.all(['donnees/mcadams1995.json', 'donnees/descripteurs-mcadams1995.json', 'donnees/courbes-mcadams1995.json'].map(lire));
    const meta = new Map(ref.gabarit.sons.map((s) => [s.cle, s]));
    const valeurs = new Map(desc.sons.map((s) => [s.cle, s]));
    sons = INSTRUMENTS.filter((c) => meta.has(c) && valeurs.has(c) && courbes.sons[c]).map((c) => ({
      cle: c, nom: meta.get(c).nom, fichier: meta.get(c).fichier, valeurs: valeurs.get(c), h: courbes.sons[c].harmoniques, courbe: courbes.sons[c] }));
    rendre = VUE === 'pente' ? vuePente() : VUE === 'centroide' ? vueCentroide()
      : VUE === 'flux' ? vueClassement('flux', { log: true, valeurs: false, tracer: tracerFlux, valeurTete: (s) => `variation du centroïde : ± ${hz(s.valeurs.variation_centroide)}` })
        : vueSynthMoment(VUE);
    rendre();
    document.fonts?.ready.then(() => rendre()); // largeurs de texte mesurées avec la vraie police
  } catch (e) {
    demo.textContent = e.message;
  }
})();
