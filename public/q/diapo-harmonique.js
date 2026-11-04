// Diapositives « Descripteurs harmoniques » du Cours 7 (éléments HTML d'Excalidraw+, srcdoc), dans
// le style des démos (excali/excali.css, excali/excali.js). Remplacent les figures statiques. Un
// script, une vue par diapositive selon l'identifiant de la configuration :
//   - c7impairs (« Ratio d'harmoniques impaires/paires : Cavernosité », 380 × 384) : échelle
//     « plein ↔ caverneux » du rapport impaires/paires et spectre du son choisi, harmoniques
//     impaires en orange et paires en bleu-vert (couleurs soulignées dans le texte). Instruments :
//     les 12 instruments de McAdams et al. (1995) ; Synthèse : un son de 311 Hz à −6 dB/octave
//     (plein) dont un curseur atténue les harmoniques paires (caverneux), joué en continu.
//   - c7deviation (« Déviation et irrégularité spectrale », 350 × 400) : le même son en deux tracés,
//     écarts à la pente spectrale (déviation) et moyenne des voisines (irrégularité), dessinés comme
//     la vue « Comparer » des corrélats (diapo-correlats.js). Trois
//     instruments contrastés, ou le son de synthèse de c7impairs : les trois descripteurs montent
//     ensemble quand on atténue les paires.
//   - c7inharmonicite (« Inharmonicité », 380 × 200) : corde raide de synthèse (partiel n à
//     n × F0 × √(1 + B n²)), partiels contre les multiples de F0 (tirets) ; un curseur règle la
//     raideur. Son pincé (2,4 s), rejoué à chaque réglage pendant l'écoute.
// Spectres : harmoniques en dB (0 dB : la plus forte), fréquence en échelle log, comme les autres
// diapositives du Cours 7. Valeurs : harmonique-calculs.js (mêmes définitions que les descripteurs
// des corrélats, tools/descripteurs_timbre.mjs). Données : donnees/mcadams1995.json,
// descripteurs-mcadams1995.json et courbes-mcadams1995.json.
//
// Document hôte (tools/harmonique_cours7.py) :
//   <base href="https://SITE/q/"> <link rel="stylesheet" href="…/q/excali/excali.css">
//   <script src="…/q/excali/rough.js"></script> <div id="demo" class="demo"></div>
//   <script type="application/json" id="config">{"id": "c7impairs"}</script>
import { ajuster, axes, bouton, chemin, choix, echelle, H, placer, R, S, T } from './excali/excali.js';
import { creerLecteur } from './correlats-donnees.js';
import { ampsImpairs, corde, droitePente, harmoniques, inharmonicite, moyenneVoisines, NH } from './harmonique-calculs.js';

const conf = JSON.parse(document.getElementById('config')?.textContent || '{}');
const VUE = String(conf.id || 'c7impairs').replace(/^c7/, '');
const TAILLES = { impairs: [380, 384], deviation: [350, 400], inharmonicite: [380, 200] };
const [L, HT] = TAILLES[VUE] || TAILLES.impairs;
// Couleurs de la diapositive : impaires et paires (soulignements du texte).
const IMPAIRE = '#f08c00', PAIRE = '#0c8599';
const BLEU = '#1971c2', GRIS = '#868e96', PALE = '#ced4da', NOIR = '#1e1e1e';
// Les 12 instruments (sans les hybrides de McAdams et al., 1995).
const INSTRUMENTS = ['hrn', 'tpt', 'tbn', 'hrp', 'vbs', 'hcd', 'can', 'bsn', 'cnt', 'gtr', 'stg', 'pno'];
const CONTRASTES = ['cnt', 'hrn', 'tpt']; // déviation : clarinette (les deux), cor (déviation), trompette (aucune)
const F_MIN = 250, F_MAX = 8000, F0 = 311, ATT_MAX = 30;
const TICKS_F = [250, 500, 1000, 2000, 4000, 8000];
const fmtF = (f) => (f >= 8000 ? `${f / 1000} kHz` : f >= 1000 ? `${f / 1000}k` : String(f));
const fDb = (v) => (v === 0 ? '0 dB' : String(v).replace('-', '−'));
const nb = (v, d = 0) => v.toFixed(d).replace('-', '−'); // point décimal, comme les autres figures
const dbH = (v) => Math.min(0, Math.max(-60, v)); // jamais hors du tracé
const couleurRang = (h, fondamentale = IMPAIRE) => (h === 1 ? fondamentale : h % 2 ? IMPAIRE : PAIRE);

const lecteur = creerLecteur();
const demo = document.getElementById('demo');
let sons = []; // { cle, nom, fichier, valeurs, h: { f, db } }

// ─── Outils de tracé ───────────────────────────────────────────────────────
// Harmoniques (barres) de h = { f, db } dans la boîte b = { g, d, h, b }, couleur selon le rang.
function spectre(g, h, b, teinte) {
  const FX = echelle(F_MIN, F_MAX, b.g, b.d, true), Y = echelle(-60, 0, b.b, b.h);
  axes(g, { x: FX, y: Y, ticksX: TICKS_F, ticksY: [-60, -30, 0], formatX: fmtF, formatY: fDb });
  const barres = () => h.db.forEach((v, i) => {
    if (h.f[i] > F_MAX) return;
    S('line', { x1: FX(h.f[i]), x2: FX(h.f[i]), y1: b.b, y2: Math.min(b.b, Y(dbH(v))), stroke: teinte(i + 1), 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
  });
  return { FX, Y, barres };
}

// Flèche propre (jamais dessinée à la main).
function fleche(g, x1, x2, y, c = NOIR) {
  const s = Math.sign(x2 - x1) || 1;
  S('line', { x1, x2: x2 - s * 5, y1: y, y2: y, stroke: c, 'stroke-width': 1.5 }, g);
  S('path', { d: chemin([[x2, y], [x2 - s * 6, y - 3.5], [x2 - s * 6, y + 3.5]]) + 'Z', fill: c }, g);
}

// Légende alignée à droite (x) sur la ligne y. Éléments : { type, texte, couleur }.
function legende(g, x, y, items) {
  for (const it of [...items].reverse()) {
    const t = T(g, x, y + 4, it.texte, 'indice', 'end');
    t.setAttribute('font-size', 13);
    x -= t.getComputedTextLength() + 5;
    const c = it.couleur || NOIR;
    if (it.type === 'barre') S('line', { x1: x - 6, x2: x - 6, y1: y - 5, y2: y + 5, stroke: c, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    else if (it.type === 'ecart') S('line', { x1: x - 6, x2: x - 6, y1: y - 6, y2: y + 6, stroke: c, 'stroke-width': 1.5 }, g);
    else S('line', { x1: x - 18, x2: x - 2, y1: y, y2: y, stroke: c, 'stroke-width': 1.5, 'stroke-dasharray': it.type === 'tiret' ? '4 3' : null }, g);
    x -= (['barre', 'ecart'].includes(it.type) ? 12 : 18) + 14;
  }
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

function rangee(x, y, l) {
  const e = placer(H('div', 'lecture', null, demo), x, y, l);
  e.style.cssText += 'display:flex;align-items:center;gap:8px';
  return e;
}

// Curseur dessiné (port de teaching-demos, shared/pitch/kit.js ; comme diapo-spectre.js).
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

// Réglage « plein ↔ caverneux » : ▶ (en continu) et curseur de l'atténuation des paires.
function reglagePaires(y, etat, synth, { valeur = true } = {}) {
  const r = rangee(0, y, L);
  r.classList.remove('lecture');
  const jouer = bouton(r, '', () => { if (synth.enCours()) synth.arreter(); else synth.jouer(etat.att); rendre(); }, { largeur: 34, jouer: true, titre: 'Écouter (en continu)' });
  H('span', 'indice-html', 'plein', r).style.position = 'static';
  curseur(r, { largeur: valeur ? 150 : 180, min: 0, max: ATT_MAX, valeur: -etat.att, cle: 'paires', action: (p) => { etat.att = -p; synth.regler(etat.att); rendre(); } });
  H('span', 'indice-html', 'caverneux', r).style.position = 'static';
  r.title = 'Atténuation des harmoniques paires';
  const val = valeur ? H('span', null, '', r) : null;
  if (val) { val.style.marginLeft = 'auto'; val.style.color = BLEU; }
  return { r, jouer, val };
}

// ─── Son de synthèse (plein ↔ caverneux) ───────────────────────────────────
// 20 harmoniques de F0 à −6 dB/octave, paires atténuées de `att` dB ; Web Audio, 300 ms de
// silence avant le son.
function synthese(att) {
  const a = ampsImpairs(att), m = Math.max(...a);
  return { cle: 'synth', nom: 'Son de synthèse', h: { f: a.map((_, i) => F0 * (i + 1)), db: a.map((x) => 20 * Math.log10(x / m)) }, valeurs: harmoniques(a) };
}

function creerSynth() {
  let ctx = null, osc = null, gain = null;
  const onde = (att) => {
    const a = ampsImpairs(att), reel = new Float32Array(NH + 1), imag = new Float32Array(NH + 1);
    a.forEach((x, i) => { imag[i + 1] = x; });
    return ctx.createPeriodicWave(reel, imag);
  };
  return {
    enCours: () => !!osc,
    jouer(att) {
      ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume();
      const t = ctx.currentTime + 0.3;
      gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.16, t + 0.03);
      osc = ctx.createOscillator();
      osc.frequency.value = F0;
      osc.setPeriodicWave(onde(att));
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
    },
    regler(att) { if (osc) osc.setPeriodicWave(onde(att)); },
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

// ─── Impaires / paires : cavernosité ───────────────────────────────────────
function vueImpairs() {
  const etat = { mode: 'instruments', att: -20 };
  let choisi = sons.find((s) => s.cle === 'cnt') || sons[0];
  const synth = creerSynth();
  const arreter = () => { lecteur.arreter(); synth.arreter(); };
  arreterTout = () => synth.arreter();
  choix(placer(H('div', null, null, demo), 0, 0), [{ texte: 'Instruments', valeur: 'instruments', titre: 'McAdams et al. (1995) : 12 instruments, même F0 (311 Hz)' },
    { texte: 'Synthèse', valeur: 'synthese', titre: 'Son harmonique de 311 Hz, 20 harmoniques : atténuer les paires' }], etat.mode,
  (m) => { etat.mode = m; arreter(); rendre(); }, { compact: true });
  const tete = rangee(0, 44, L);
  const reglage = reglagePaires(42, etat, synth);
  const svg = placer(S('svg', { width: L, height: HT - 80 }), 0, 80);
  demo.append(svg);
  const YE = 40, V_MIN = -20, V_MAX = 30; // échelle plein ↔ caverneux (dB)
  const texteVal = (v) => `${nb(v, 1)} dB`;
  return () => {
    const instr = etat.mode === 'instruments';
    tete.hidden = !instr;
    reglage.r.hidden = instr;
    const son = instr ? choisi : synthese(etat.att);
    if (instr) entete(tete, choisi, `impaires/paires : ${texteVal(choisi.valeurs.impairs_pairs)}`);
    else {
      reglage.jouer.lecture(synth.enCours());
      reglage.val.textContent = texteVal(son.valeurs.impairs_pairs);
      reglage.val.title = `Paires atténuées de ${nb(-etat.att, 0)} dB`;
    }
    svg.replaceChildren();
    // Échelle du rapport impaires/paires : plein à gauche, caverneux à droite ; un point par instrument.
    const X = echelle(V_MIN, V_MAX, 14, L - 14), y = YE;
    S('line', { x1: X.r0, x2: X.r1, y1: y, y2: y, class: 'trait' }, svg);
    for (const v of [-10, 0, 10, 20]) {
      S('line', { x1: X(v), x2: X(v), y1: y, y2: y + 4, class: 'trait' }, svg);
      T(svg, X(v), y + 17, v === 20 ? '20 dB' : fDb(v).replace(' dB', ''));
    }
    for (const [x, texte, ancre] of [[X.r0, 'plein', 'start'], [X.r1, 'caverneux', 'end']]) T(svg, x, y - 12, texte, 'indice', ancre).style.fill = NOIR;
    const pos = (v) => X(Math.max(V_MIN, Math.min(V_MAX, v)));
    if (instr) {
      const ordre = [...sons].sort((a, b) => (a === choisi) - (b === choisi)); // le choisi par-dessus
      ordre.forEach((s) => {
        const actif = s === choisi, v = s.valeurs.impairs_pairs;
        const c = S('g', { class: 'cliquable' }, svg);
        S('circle', { cx: pos(v), cy: y, r: 10, fill: 'transparent' }, c); // cible plus large que le point
        S('circle', { cx: pos(v), cy: y, r: actif ? 6 : 4.5, fill: actif ? BLEU : GRIS, 'fill-opacity': actif ? 1 : 0.75 }, c);
        S('title', {}, c).textContent = `${s.nom} : ${texteVal(v)}`;
        c.addEventListener('click', () => { if (choisi !== s) { choisi = s; lecteur.arreter(); } lecteur.jouer(s, rendre); rendre(); });
      });
    } else {
      sons.forEach((s) => S('circle', { cx: pos(s.valeurs.impairs_pairs), cy: y, r: 3, fill: PALE }, svg));
      S('circle', { cx: pos(son.valeurs.impairs_pairs), cy: y, r: 6, fill: BLEU }, svg);
    }
    const b = { g: 46, d: L - 22, h: 96, b: HT - 80 - 24 };
    spectre(svg, son.h, b, (h) => couleurRang(h, PALE)).barres();
    legende(svg, b.d, b.h - 14, [{ type: 'barre', couleur: IMPAIRE, texte: 'impaires' }, { type: 'barre', couleur: PAIRE, texte: 'paires' },
      { type: 'barre', couleur: PALE, texte: 'fondamentale (exclue)' }]);
  };
}

// ─── Déviation et irrégularité ─────────────────────────────────────────────
function vueDeviation() {
  const etat = { mode: 'instruments', att: -20 };
  const parCle = new Map(sons.map((s) => [s.cle, s]));
  const liste = CONTRASTES.map((c) => parCle.get(c)).filter(Boolean);
  let choisi = liste[0];
  const synth = creerSynth();
  const arreter = () => { lecteur.arreter(); synth.arreter(); };
  arreterTout = () => synth.arreter();
  choix(placer(H('div', null, null, demo), 0, 0), [{ texte: 'Instruments', valeur: 'instruments', titre: 'McAdams et al. (1995), même F0 (311 Hz)' },
    { texte: 'Synthèse', valeur: 'synthese', titre: 'Son harmonique de 311 Hz, 20 harmoniques : atténuer les paires' }], etat.mode,
  (m) => { etat.mode = m; arreter(); rendre(); }, { compact: true });
  const instr = rangee(0, 42, L);
  instr.classList.remove('lecture');
  const jouerI = bouton(instr, '', () => { lecteur.jouer(choisi, rendre); rendre(); }, { largeur: 34, jouer: true, titre: 'Écouter' });
  choix(instr, liste.map((s) => ({ texte: s.nom, valeur: s.cle })), choisi.cle,
    (c) => { choisi = parCle.get(c); lecteur.arreter(); rendre(); }, { compact: true, egal: false });
  const reglage = reglagePaires(42, etat, synth, { valeur: false });
  const Y0 = 84, PH = (HT - Y0) / 2;
  const svg = placer(S('svg', { width: L, height: HT - Y0 }), 0, Y0);
  demo.append(svg);
  return () => {
    const enInstr = etat.mode === 'instruments';
    instr.hidden = !enInstr;
    reglage.r.hidden = enInstr;
    const son = enInstr ? choisi : synthese(etat.att);
    if (enInstr) jouerI.lecture(lecteur.enCours() === choisi);
    else reglage.jouer.lecture(synth.enCours());
    svg.replaceChildren();
    const h = son.h, v = son.valeurs, nh = h.db.length;
    [['deviation', 'Déviation'], ['irregularite', 'Irrégularité']].forEach(([cle, nom], k) => {
      const g = S('g', { transform: `translate(0 ${k * PH})` }, svg);
      const t = T(g, 0, 14, `${nom} : ${nb(v[cle], 1)} dB`, 'indice', 'start');
      t.setAttribute('font-size', 15);
      t.setAttribute('font-weight', 700);
      t.style.fill = BLEU;
      // Comme la vue « Comparer » des corrélats : harmoniques en bleu, écarts en noir sur les barres.
      const b = { g: 46, d: L - 24, h: 50, b: PH - 24 };
      const sp = spectre(g, h, b, () => BLEU);
      sp.barres();
      const ecart = (i, ref) => S('line', { x1: sp.FX(h.f[i]), x2: sp.FX(h.f[i]), y1: sp.Y(dbH(h.db[i])), y2: sp.Y(dbH(ref)), stroke: NOIR, 'stroke-width': 1.5 }, g);
      if (cle === 'deviation') {
        const fit = droitePente(h.db);
        h.db.forEach((_, i) => ecart(i, fit(i)));
        const clip = S('clipPath', { id: 'zp' }, g);
        S('rect', { x: b.g, y: b.h, width: b.d - b.g, height: b.b - b.h }, clip);
        S('path', { d: chemin(h.db.map((_, i) => [sp.FX(h.f[0] * (i + 1)), sp.Y(fit(i))])), fill: 'none', stroke: NOIR, 'stroke-width': 1.5, 'stroke-dasharray': '6 4', 'clip-path': 'url(#zp)' }, g);
        legende(g, b.d, 34, [{ type: 'barre', couleur: BLEU, texte: 'harmonique' }, { type: 'tiret', texte: 'pente spectrale' }, { type: 'ecart', texte: 'écart' }]);
      } else {
        for (let i = 1; i < nh - 1; i++) { // moyenne des voisines (h − 1, h, h + 1) : un trait par harmonique
          const x = sp.FX(h.f[i]), m = sp.Y(dbH(moyenneVoisines(h.db, i)));
          const demi = Math.min(7, 0.4 * (sp.FX(h.f[i + 1]) - sp.FX(h.f[i - 1])));
          S('line', { x1: x - demi, x2: x + demi, y1: m, y2: m, stroke: NOIR, 'stroke-width': 1.5 }, g);
        }
        legende(g, b.d, 34, [{ type: 'barre', couleur: BLEU, texte: 'harmonique' }, { type: 'ligne', texte: 'moyenne des voisines' }]);
      }
    });
  };
}

// ─── Inharmonicité : corde raide ───────────────────────────────────────────
// Raideur B = B_MAX × q² (curseur q de 0 à 1) ; F0 de référence : le premier partiel.
const F0_CORDE = 220, B_MAX = 0.008, N_TRACE = 8, N_SON = 16, DUREE = 2.4;
function creerCorde() {
  let ctx = null, source = null;
  const tampon = (B) => {
    const sr = ctx.sampleRate, n = Math.round(DUREE * sr), buf = ctx.createBuffer(1, n, sr), d = buf.getChannelData(0);
    corde(B, F0_CORDE, N_SON).forEach(({ f, a }, i) => {
      if (f > sr * 0.45) return;
      const w = (2 * Math.PI * f) / sr, amort = (1.2 + 0.35 * (i + 1)) / sr;
      for (let k = 0; k < n; k++) d[k] += a * Math.sin(w * k) * Math.exp(-amort * k);
    });
    let m = 0;
    for (let k = 0; k < n; k++) m = Math.max(m, Math.abs(d[k]));
    const att = Math.round(0.004 * sr);
    for (let k = 0; k < n; k++) d[k] *= (0.3 / m) * Math.min(1, k / att) * Math.min(1, (n - k) / (0.05 * sr));
    return buf;
  };
  return {
    enCours: () => !!source,
    jouer(B, surFin) {
      ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume();
      this.arreter();
      const s = ctx.createBufferSource();
      s.buffer = tampon(B);
      s.connect(ctx.destination);
      s.onended = () => { if (source === s) { source = null; surFin?.(); } };
      s.start(ctx.currentTime + 0.3); // 300 ms de silence avant le son
      source = s;
    },
    arreter() { if (source) { const s = source; source = null; s.stop(); } },
  };
}

function vueInharmonicite() {
  const etat = { q: 0.5 };
  const B = () => B_MAX * etat.q ** 2;
  const son = creerCorde();
  arreterTout = () => son.arreter();
  let attente = 0; // rejouer au plus toutes les 250 ms pendant le glissement
  const rejouer = () => {
    if (!son.enCours() || attente) return;
    attente = setTimeout(() => { attente = 0; if (son.enCours()) son.jouer(B(), rendre); }, 250);
  };
  const r = rangee(0, 0, L);
  r.classList.remove('lecture');
  const jouer = bouton(r, '', () => { if (son.enCours()) son.arreter(); else son.jouer(B(), rendre); rendre(); }, { largeur: 34, jouer: true, titre: 'Écouter (corde pincée)' });
  H('span', 'indice-html', 'harmonique', r).style.position = 'static';
  curseur(r, { largeur: 150, min: 0, max: 1, valeur: etat.q, cle: 'raideur', action: (q) => { etat.q = q; rejouer(); rendre(); } });
  H('span', 'indice-html', 'inharmonique', r).style.position = 'static';
  const Y0 = 40, svg = placer(S('svg', { width: L, height: HT - Y0 }), 0, Y0);
  demo.append(svg);
  return () => {
    jouer.lecture(son.enCours());
    const p = corde(B(), F0_CORDE, N_SON), f1 = p[0].f;
    const ih = inharmonicite(p.map((x) => x.f), p.map((x) => x.a), f1);
    svg.replaceChildren();
    const b = { g: 8, d: L - 8, h: 22, b: HT - Y0 - 24 }, hMax = 10.6;
    const X = echelle(0, hMax, b.g, b.d), Y = echelle(0, 1, b.b, b.h + 8);
    // Multiples de F0 : tirets gris et étiquettes, comme la figure d'origine.
    for (let h = 1; h < hMax; h++) {
      S('line', { x1: X(h), x2: X(h), y1: b.h, y2: b.b, stroke: GRIS, 'stroke-width': 1, 'stroke-dasharray': '4 4' }, svg);
      T(svg, X(h), b.h - 6, h === 1 ? 'F0' : `${h}F0`, 'indice').setAttribute('font-size', 11);
    }
    S('line', { x1: b.g, x2: b.d, y1: b.b, y2: b.b, class: 'trait' }, svg);
    T(svg, b.d, b.b + 17, 'fréquence', 'indice', 'end').setAttribute('font-size', 12);
    const val = T(svg, b.g, b.b + 18, `Inharmonicité : ${nb(ih, 2)} %`, 'indice', 'start');
    val.setAttribute('font-size', 15);
    val.setAttribute('font-weight', 700);
    val.style.fill = BLEU;
    S('title', {}, val).textContent = `Écart moyen des partiels à h × F0, pondéré par l'énergie ; raideur B = ${B().toExponential(1)}`;
    // Partiels : barres bleues ; flèche du multiple de F0 au partiel quand l'écart se voit.
    p.slice(0, N_TRACE).forEach(({ f, a }, i) => {
      const x = X(f / f1), x0 = X(i + 1), y = Y(a);
      if (x > b.d) return;
      S('line', { x1: x, x2: x, y1: b.b, y2: y, stroke: BLEU, 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
      if (x - x0 > 7) fleche(svg, x0, x, y - 8, NOIR);
    });
  };
}

// ─── Mise en route ─────────────────────────────────────────────────────────
let rendre = () => {}, arreterTout = () => {};

ajuster(demo, L, HT, { surMasque: () => { lecteur.arreter(); arreterTout(); rendre(); }, surAffiche: () => rendre() }); // légendes remesurées

(async () => {
  try {
    if (VUE !== 'inharmonicite') {
      const lire = async (u) => {
        const r = await fetch(u, { cache: 'no-cache' });
        if (!r.ok) throw new Error(`Données introuvables (${u})`);
        return r.json();
      };
      const [ref, desc, courbes] = await Promise.all(['donnees/mcadams1995.json', 'donnees/descripteurs-mcadams1995.json', 'donnees/courbes-mcadams1995.json'].map(lire));
      const meta = new Map(ref.gabarit.sons.map((s) => [s.cle, s]));
      const valeurs = new Map(desc.sons.map((s) => [s.cle, s]));
      sons = INSTRUMENTS.filter((c) => meta.has(c) && valeurs.has(c) && courbes.sons[c]).map((c) => ({
        cle: c, nom: meta.get(c).nom, fichier: meta.get(c).fichier, valeurs: valeurs.get(c), h: courbes.sons[c].harmoniques }));
    }
    rendre = VUE === 'deviation' ? vueDeviation() : VUE === 'inharmonicite' ? vueInharmonicite() : vueImpairs();
    rendre();
    document.fonts?.ready.then(() => rendre()); // largeurs de texte mesurées avec la vraie police
  } catch (e) {
    demo.textContent = e.message;
  }
})();
