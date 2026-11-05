// Diapositives « enveloppe spectrale » du Cours 7 (éléments HTML d'Excalidraw+, srcdoc), dans le
// style des démos (excali/excali.css, excali/excali.js). Un script, une vue par diapositive selon
// l'identifiant de la configuration :
//   - c7centroide (« Centroïde spectral et clarté », 390 × 390) : échelle « sombre ↔ clair » du
//     centroïde et spectre du son choisi. Instruments : les 12 instruments de McAdams et al.
//     (1995) (même F0, 311 Hz) ; Synthèse : un son harmonique de 311 Hz dont un curseur règle
//     l'énergie dans les aigus (pente en dB/octave), joué en continu.
//   - c7etalement (« Autres descripteurs », 786 × 300) : enveloppe de synthèse (bruit filtré ou
//     son harmonique) sur des échelles linéaires, réglée par un curseur qui ne change que
//     l'étendue ; jouée en continu.
//   - c7asymetrie (786 × 300) : bruits colorés (brun, rose, blanc, bleu, violet) de 20 Hz à 5 kHz,
//     joués en continu ; spectre en fréquence log et dB dans la couleur du bruit, aire partagée au
//     centroïde (part de la densité dessous / dessus).
//   - c7kurtosis (786 × 300) : bruit filtré par trois enveloppes de même étendue (plate,
//     gaussienne, pointue), joué en continu ; dB, gaussienne de même étendue en référence.
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
  return { FX, Y, fx, barres, marque, zone, centroide: (x) => ligneCentroide(g, x, b.h, b.b) };
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

// Centroïde : tirets orange épais (l'harmonique reste visible entre les tirets), triangle en haut.
function ligneCentroide(g, x, y1, y2) {
  S('line', { x1: x, x2: x, y1, y2, stroke: ORANGE, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }, g);
  S('path', { d: chemin([[x - 6, y1 - 8], [x + 6, y1 - 8], [x, y1]]) + 'Z', fill: ORANGE }, g);
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
    else S('line', { x1: x - 18, x2: x - 2, y1: y, y2: y, stroke: c, 'stroke-width': it.type === 'tiret' && c === ORANGE ? 2.5 : 1.5, 'stroke-dasharray': it.type === 'tiret' ? '4 3' : it.type === 'pointille' ? '2 3' : null }, g);
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
  sp.centroide(cx);
  if (cle === 'asymetrie') { // traîne : du côté opposé à la masse, longueur selon l'asymétrie
    const l = Math.min(Math.abs(v.asymetrie), 4) / 4 * 140 + 20;
    fleche(g, cx, cx + Math.sign(v.asymetrie) * l, sp.Y(-20));
  }
  legende(g, b.d, b.h - 14, {
    centroide: [{ type: 'barre', couleur: coul, texte: 'harmonique' }, { type: 'tiret', couleur: ORANGE, texte: 'centroïde' }],
    etalement: [{ type: 'tiret', couleur: ORANGE, texte: 'centroïde' }, { type: 'zone', couleur: '#adb5bd', texte: '± 1 écart type (étendue)' }],
    asymetrie: [{ type: 'tiret', couleur: ORANGE, texte: 'centroïde' }, { type: 'fleche', texte: 'traîne (longueur : asymétrie)' }],
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

// ─── Étendue : enveloppe de synthèse ───────────────────────────────────────
// Enveloppe spectrale (amplitude, 0 à 1) sur une échelle linéaire de 0 à 8 kHz : gaussienne
// centrée à 4 kHz, écart type de 150 à 1200 Hz (curseur).
// Moments calculés sur les amplitudes, comme les descripteurs, sur ce qui est joué : la
// densité du bruit, ou les harmoniques (F0 ≈ 200 Hz). Son en boucle (IFFT, phases aléatoires
// fixes), énergie constante, 300 ms de silence avant le son.
const F_LIN = 8000, PAS_F = 10, CENTRE = 4000, F0_SYNTH = 200;
const REGLAGES = {
  etalement: { min: 150, max: 1200, depart: 400, gauche: 'étroite', droite: 'large', nom: 'étendue',
    forme: (s) => (f) => Math.exp(-0.5 * ((f - CENTRE) / s) ** 2) },
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
function creerBoucle(fMax = F_LIN) {
  const N = 1 << 16;
  let ctx = null, courant = null, phases = null;
  const tampon = (amp, harmonique) => {
    const sr = ctx.sampleRate, df = sr / N, re = new Float64Array(N), im = new Float64Array(N);
    const k0 = Math.round(F0_SYNTH / df);
    for (let k = 1; k < N / 2 && k * df <= fMax; k++) {
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
    val.textContent = `${r.nom} : ${hz(m.etalement)}`;
    val.title = `centroïde ${hz(m.centroide)} ; étendue ${hz(m.etalement)} ; asymétrie ${nb(m.asymetrie, 2)} ; kurtosis ${nb(m.kurtosis, 1)}`;
    svg.replaceChildren();
    const yMax = 1.05;
    const b = { g: 34, d: L - 24, h: 30, b: HT - 44 - 24 };
    const X = echelle(0, F_LIN, b.g, b.d), Y = echelle(0, yMax, b.b, b.h);
    const zone = (f0, f1, k) => R('rectangle', svg, [X(Math.max(0, f0)), b.h, Math.max(3, X(Math.min(F_LIN, f1)) - X(Math.max(0, f0))), b.b - b.h], { cle: k, stroke: 'none', fill: '#ced4da', hachureGap: 4, fillWeight: 1 });
    zone(m.centroide - m.etalement, m.centroide + m.etalement, 'z' + cle);
    const pts = fs.map((f, i) => [X(f), Y(env[i])]);
    if (etat.harmonique) {
      S('path', { d: chemin(pts), fill: 'none', stroke: GRIS, 'stroke-width': 1.2 }, svg);
      fh.forEach((f) => { const a = amp(f); if (a > 0.004) S('line', { x1: X(f), x2: X(f), y1: b.b, y2: Y(a), stroke: BLEU, 'stroke-width': 3, 'stroke-linecap': 'round' }, svg); });
    } else {
      S('path', { d: chemin([[X(0), b.b], ...pts, [X(F_LIN), b.b]]) + 'Z', fill: '#a5d8ff', 'fill-opacity': 0.55, stroke: BLEU, 'stroke-width': 2 }, svg);
    }
    axes(svg, { x: X, y: Y, ticksX: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000], ticksY: [], formatX: (f) => (f === F_LIN ? '8 kHz' : f ? `${f / 1000}k` : '0') });
    T(svg, b.g + 6, b.h + 2, 'amplitude', 'indice', 'start').setAttribute('font-size', 13);
    ligneCentroide(svg, X(m.centroide), b.h, b.b);
    const source = etat.harmonique ? { type: 'barre', couleur: BLEU, texte: 'harmonique' } : { type: 'ligne', couleur: BLEU, texte: 'enveloppe' };
    legende(svg, b.d, b.h - 14, [source, { type: 'tiret', couleur: ORANGE, texte: 'centroïde' }, { type: 'zone', couleur: '#adb5bd', texte: '± 1 écart type (étendue)' }]);
  };
}

// ─── Asymétrie : bruits colorés ────────────────────────────────────────────
// Amplitude ∝ f^α de 20 Hz à 5 kHz (puissance ∝ f^2α) : brun (−1), rose (−1/2), blanc (0), bleu
// (1/2), violet (1), chacun tracé dans sa couleur. Échelles log (fréquence) et dB (0 dB à 1 kHz) :
// une droite par bruit, pente de −6 à +6 dB/octave. Au-dessus du tracé, une barre donne la part de
// la densité (amplitudes, fréquence linéaire, comme les moments) sous et au-dessus du centroïde : pas
// d'aire partagée sur le tracé, que l'échelle log déformerait (le blanc, 50 / 50, y paraîtrait
// 85 / 15). Joué en continu (même boucle que l'étendue).
const BRUITS = [
  { cle: 'brun', nom: 'Brun', alpha: -1, couleur: '#8b5a2b' },
  { cle: 'rose', nom: 'Rose', alpha: -0.5, couleur: '#e64980' },
  { cle: 'blanc', nom: 'Blanc', alpha: 0, couleur: '#868e96' }, // gris : le blanc ne se verrait pas
  { cle: 'bleu', nom: 'Bleu', alpha: 0.5, couleur: '#1971c2' },
  { cle: 'violet', nom: 'Violet', alpha: 1, couleur: '#7048e8' },
];
const F_BAS = 20, F_HAUT = 5000;
const pct = (v) => `${Math.round(100 * v)} %`;

// Part de la densité sous / au-dessus du centroïde : une barre partagée (foncé / pâle), entre ses
// deux étiquettes, puis le centroïde ; le tout aligné à droite en x. Indépendant des axes du tracé.
function barreParts(g, x, y, dessous, coul) {
  const texte = (t, ancre) => { const e = T(g, x, y + 4, t, 'indice', ancre); e.setAttribute('font-size', 13); return e.getComputedTextLength(); };
  x -= texte('centroïde', 'end') + 5;
  S('line', { x1: x - 18, x2: x - 2, y1: y, y2: y, stroke: ORANGE, 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }, g);
  x -= 18 + 22;
  x -= texte(`${pct(1 - dessous)} au-dessus`, 'end') + 6;
  const LB = 150, xs = x - LB * (1 - dessous);
  S('rect', { x: x - LB, y: y - 6, width: LB * dessous, height: 12, fill: coul, 'fill-opacity': 0.55 }, g);
  S('rect', { x: xs, y: y - 6, width: LB * (1 - dessous), height: 12, fill: coul, 'fill-opacity': 0.12 }, g);
  S('rect', { x: x - LB, y: y - 6, width: LB, height: 12, fill: 'none', stroke: coul, 'stroke-width': 1 }, g);
  S('line', { x1: xs, x2: xs, y1: y - 9, y2: y + 9, stroke: ORANGE, 'stroke-width': 2.5 }, g);
  x -= LB + 6;
  texte(`sous le centroïde : ${pct(dessous)}`, 'end');
}

function vueAsymetrie() {
  let choisi = BRUITS[1];
  const boucle = creerBoucle(F_HAUT);
  arreterTout = () => boucle.arreter();
  const amp = (b) => (f) => (f < F_BAS || f > F_HAUT ? 0 : (f / 1000) ** b.alpha);
  const barre = placer(H('div', null, null, demo), 0, 0);
  barre.style.cssText += `display:flex;align-items:center;gap:${ECART_COMMANDES}px;width:${L}px`;
  const jouer = bouton(barre, '', () => { if (boucle.enCours()) boucle.arreter(); else boucle.jouer(amp(choisi), false); rendre(); }, { largeur: 34, jouer: true, titre: 'Écouter (en continu)' });
  choix(barre, BRUITS.map((b) => ({ texte: `Bruit ${b.nom.toLowerCase()}`, valeur: b.cle, titre: `Amplitude ∝ f^${nb(b.alpha, b.alpha % 1 ? 1 : 0)} (${b.alpha * 6 > 0 ? '+' : b.alpha ? '−' : ''}${Math.abs(b.alpha * 6)} dB/octave)` })),
    choisi.cle, (c) => { choisi = BRUITS.find((b) => b.cle === c); boucle.regler(amp(choisi), false); rendre(); }, { compact: true });
  const val = H('span', null, '', barre);
  val.style.cssText = 'margin-left:auto;font-weight:700;white-space:nowrap';
  const svg = placer(S('svg', { width: L, height: HT - 44 }), 0, 44);
  demo.append(svg);
  const fs = Array.from({ length: (F_HAUT - F_BAS) / PAS_F + 1 }, (_, i) => F_BAS + i * PAS_F);
  // Tracé : points espacés en log (le pas linéaire de 10 Hz serait trop grossier à 20 Hz).
  const ft = Array.from({ length: 241 }, (_, i) => F_BAS * (F_HAUT / F_BAS) ** (i / 240));
  return () => {
    jouer.lecture(boucle.enCours());
    const coul = choisi.couleur, a = fs.map(amp(choisi)), m = moments(fs, a);
    const dessous = fs.reduce((p, f, i) => p + (f < m.centroide ? a[i] : 0), 0) / a.reduce((p, q) => p + q, 0);
    val.textContent = `asymétrie : ${nb(Math.abs(m.asymetrie) < 0.005 ? 0 : m.asymetrie, 2)}`;
    val.style.color = coul;
    val.title = `centroïde ${hz(m.centroide)} ; étendue ${hz(m.etalement)}`;
    svg.replaceChildren();
    const b = { g: 62, d: L - 24, h: 30, b: HT - 44 - 24 };
    const X = echelle(F_BAS, F_HAUT, b.g, b.d, true), Y = echelle(-40, 40, b.b, b.h);
    const niveau = (f) => Y(20 * choisi.alpha * Math.log10(f / 1000));
    const cx = X(m.centroide);
    const pts = ft.map((f) => [X(f), niveau(f)]);
    S('path', { d: chemin([[X(F_BAS), b.b], ...pts, [X(F_HAUT), b.b]]) + 'Z', fill: coul, 'fill-opacity': 0.25, stroke: 'none' }, svg);
    S('path', { d: chemin(pts), fill: 'none', stroke: coul, 'stroke-width': 2.5 }, svg);
    axes(svg, { x: X, y: Y, ticksX: [20, 50, 100, 200, 500, 1000, 2000, 5000], ticksY: [-40, -20, 0, 20, 40],
      formatX: (f) => (f === F_HAUT ? '5 kHz' : f >= 1000 ? `${f / 1000}k` : String(f)), formatY: (v) => (v === 40 ? '+40 dB' : v > 0 ? `+${v}` : fDb(v).replace(' dB', '')) });
    ligneCentroide(svg, cx, b.h, b.b);
    barreParts(svg, b.d, b.h - 20, dessous, coul); // plus haut : le triangle du centroïde passe dessous
  };
}

// ─── Kurtosis : bruit filtré ───────────────────────────────────────────────
// Trois enveloppes de même centroïde (2,5 kHz) et de même étendue (500 Hz), jouées en continu :
// plate (passe-bande à flancs raides, Butterworth d'ordre 16 en amplitude), gaussienne, pointue
// (flancs exponentiels : une droite de chaque côté en dB). Tracé en dB de 0 à 5 kHz (0 dB : le plus
// haut de l'enveloppe et de la gaussienne), aire ombrée ; gaussienne de même centroïde, même étendue
// et même aire (kurtosis 3) en pointillé, seule référence (pas d'écarts types : superflus). Moments sur les amplitudes, comme les descripteurs.
const C_KURT = 2500, S_KURT = 500;
const FORMES_K = [
  { cle: 'plate', nom: 'Plate', amp: (f) => 1 / Math.sqrt(1 + ((f - C_KURT) / 818) ** 32) },
  { cle: 'gauss', nom: 'Gaussienne', amp: (f) => Math.exp(-0.5 * ((f - C_KURT) / S_KURT) ** 2) },
  { cle: 'pointue', nom: 'Pointue', amp: (f) => Math.exp(-Math.abs(f - C_KURT) / 354) },
];
function vueKurtosis() {
  let choisi = FORMES_K[0];
  const boucle = creerBoucle();
  arreterTout = () => boucle.arreter();
  const barre = placer(H('div', null, null, demo), 0, 0);
  barre.style.cssText += `display:flex;align-items:center;gap:${ECART_COMMANDES}px;width:${L}px`;
  const jouer = bouton(barre, '', () => { if (boucle.enCours()) boucle.arreter(); else boucle.jouer(choisi.amp, false); rendre(); }, { largeur: 34, jouer: true, titre: 'Écouter (en continu)' });
  choix(barre, FORMES_K.map((k) => ({ texte: k.nom, valeur: k.cle })),
    choisi.cle, (c) => { choisi = FORMES_K.find((k) => k.cle === c); boucle.regler(choisi.amp, false); rendre(); }, { compact: true });
  const val = H('span', null, '', barre);
  val.style.cssText = 'margin-left:auto;white-space:nowrap';
  const svg = placer(S('svg', { width: L, height: HT - 44 }), 0, 44);
  demo.append(svg);
  const DB_MIN = -60, F_MAX = 5000;
  const fs = Array.from({ length: F_LIN / PAS_F + 1 }, (_, i) => i * PAS_F);
  return () => {
    jouer.lecture(boucle.enCours());
    const lin = fs.map(choisi.amp), m = moments(fs, lin), c = m.centroide, e = m.etalement;
    val.replaceChildren();
    H('span', null, `étendue : ${hz(e)}  ·  `, val).style.color = GRIS;
    Object.assign(H('span', null, `kurtosis : ${nb(m.kurtosis, 1)}`, val).style, { color: BLEU, fontWeight: 700 });
    svg.replaceChildren();
    // Gaussienne de même aire ; une seule référence de 0 dB pour les deux courbes.
    const g = fs.map((f) => Math.exp(-0.5 * ((f - c) / e) ** 2));
    const kg = lin.reduce((p, q) => p + q, 0) / g.reduce((p, q) => p + q, 0), ref = Math.max(...lin, kg);
    const vis = fs.map((f, k) => k).filter((k) => fs[k] <= F_MAX);
    const b = { g: 46, d: L - 24, h: 30, b: HT - 44 - 24 };
    const X = echelle(0, F_MAX, b.g, b.d), Y = echelle(DB_MIN, 0, b.b, b.h);
    const y = (v) => Y(Math.max(DB_MIN, 20 * Math.log10(Math.max(1e-9, v / ref))));
    const pts = vis.map((k) => [X(fs[k]), y(lin[k])]);
    S('path', { d: chemin([[X(0), b.b], ...pts, [X(F_MAX), b.b]]) + 'Z', fill: '#a5d8ff', 'fill-opacity': 0.55, stroke: 'none' }, svg);
    S('path', { d: chemin(pts), fill: 'none', stroke: BLEU, 'stroke-width': 2 }, svg);
    S('path', { d: chemin(vis.map((k) => [X(fs[k]), y(g[k] * kg)])), fill: 'none', stroke: NOIR, 'stroke-width': 1.5, 'stroke-dasharray': '2 4' }, svg);
    axes(svg, { x: X, y: Y, ticksX: [0, 1000, 2000, 3000, 4000, 5000], ticksY: [-60, -30, 0], formatX: (f) => (f === F_MAX ? '5 kHz' : f ? `${f / 1000}k` : '0'), formatY: fDb });
    ligneCentroide(svg, X(c), b.h, b.b);
    legende(svg, b.d, b.h - 14, [{ type: 'ligne', couleur: BLEU, texte: 'enveloppe' }, { type: 'pointille', texte: 'gaussienne (kurtosis 3)' }]);
  };
}

// ─── Mise en route ─────────────────────────────────────────────────────────
let rendre = () => {}, arreterTout = () => {};

ajuster(demo, L, HT, { surMasque: () => { lecteur.arreter(); arreterTout(); rendre(); }, surAffiche: () => rendre() }); // légendes remesurées

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
      : VUE === 'asymetrie' ? vueAsymetrie() : VUE === 'kurtosis' ? vueKurtosis()
      : VUE === 'flux' ? vueClassement('flux', { log: true, valeurs: false, tracer: tracerFlux, valeurTete: (s) => `variation du centroïde : ± ${hz(s.valeurs.variation_centroide)}` })
        : vueSynthMoment(VUE);
    rendre();
    document.fonts?.ready.then(() => rendre()); // largeurs de texte mesurées avec la vraie police
  } catch (e) {
    demo.textContent = e.message;
  }
})();
