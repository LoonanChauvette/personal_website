// Diapositive « Modulations spectro-temporelles » du Cours 7 (élément HTML d'Excalidraw+, srcdoc,
// moitié droite) : un ripple (bruit à modulation spectro-temporelle) réglé directement.
//
// En haut, ▶ et la profondeur (0 = bruit non modulé, 1 = complètement modulé). Au milieu, le plan
// des modulations : glisser la pointe de la flèche règle la vélocité ω (Hz, horizontale ; à droite
// les stries montent, à gauche elles descendent) et la densité Ω (cycles/octave, verticale) ; ses
// deux composantes sont tracées et chiffrées le long de leur segment. Couleurs comme les
// soulignements du texte de la diapositive : ω orange, Ω rouge, profondeur bleu. En bas,
// l'enveloppe spectro-temporelle du ripple (2 s, 250 à 8000 Hz en octaves), une barre bleue suit
// la lecture. Le son est calculé ici (modulations.js) ; changer un réglage pendant la lecture la
// relance avec le nouveau son.
//
// Document hôte (tools/modulations_cours7.py) :
//   <base href="https://SITE/q/"> <link rel="stylesheet" href="…/q/excali/excali.css">
//   <script src="…/q/excali/rough.js"></script> <div id="demo" class="demo"></div>
//   <script type="application/json" id="config">{"id": "c7ripple"}</script>
import { ajuster, axes, bouton, echelle, figurePrete, H, IMPRESSION, placer, S, T } from './excali/excali.js';
import { C_DENSITE, C_OMEGA, C_PROFONDEUR, GRIS, NOIR, creerLecteurTampon, creerRipple, curseur, nb, O_MAX, planModulations, W_MAX } from './modulations.js';

const L = 420, HT = 384, HAUT_SVG = 44;
const G = 64, D = L - 10; // bords horizontaux communs du plan et de l'enveloppe
const etat = { om: 4, Om: 1, m: 0.9 };
const ripple = creerRipple();
const lecteur = creerLecteurTampon();

const demo = document.getElementById('demo');
if (IMPRESSION) imprimer(); else interactif();

function interactif() {
  const ligne = placer(H('div', 'lecture', null, demo), 0, 0, L);
  ligne.style.cssText += 'display:flex;align-items:center;gap:10px';
  const jouer = bouton(ligne, '', () => { if (lecteur.enCours()) { lecteur.arreter(); rendre(); } else lancer(); },
    { largeur: 34, jouer: true, titre: 'Écouter' });
  H('span', null, 'Profondeur', ligne).style.marginLeft = '10px';
  curseur(ligne, { largeur: 170, min: 0, max: 1, valeur: etat.m, cle: 'profondeur', couleur: C_PROFONDEUR,
    action: (v, fin) => { etat.m = Math.round(v * 20) / 20; rendre(); if (fin) relancer(); } });
  const valeurM = H('span', null, '', ligne);
  valeurM.style.color = C_PROFONDEUR;

  const svg = placer(S('svg', { width: L, height: HT - HAUT_SVG }), 0, HAUT_SVG);
  svg.style.overflow = 'visible'; // valeur de ω au-dessus de son segment, même tout en haut du plan
  demo.append(svg);

  // Plan (ω, Ω) : la pointe de la flèche se glisse ; un clic ailleurs dans le plan l'y amène.
  // (Pas de poignée ronde : elle cacherait la pointe.)
  const plan = planModulations(S('g', {}, svg), { gauche: G, droite: D, haut: 24, bas: 118 }); // haut : place du titre « Ω (c/oct) »
  const zone = S('rect', { x: G - 8, y: 4, width: D - G + 16, height: 124, fill: 'transparent' }, svg);
  zone.style.cursor = 'pointer';
  zone.style.touchAction = 'none';
  const regler = (e) => {
    const r = svg.getBoundingClientRect(), k = r.width / L;
    const px = (e.clientX - r.left) / k, py = (e.clientY - r.top) / k;
    etat.om = Math.max(-W_MAX, Math.min(W_MAX, Math.round(plan.x.inverse(px) * 2) / 2));
    etat.Om = Math.max(0, Math.min(O_MAX, Math.round(plan.y.inverse(py) * 4) / 4));
    rendre();
  };
  zone.addEventListener('pointerdown', (e) => { zone.setPointerCapture(e.pointerId); regler(e); });
  zone.addEventListener('pointermove', (e) => { if (zone.hasPointerCapture(e.pointerId)) regler(e); });
  zone.addEventListener('pointerup', () => relancer());

  // Enveloppe spectro-temporelle : temps 0–2 s, fréquence 250–8000 Hz (une ligne par octave).
  const tx = echelle(0, ripple.duree, G, D);
  const fy = echelle(ripple.fMin, ripple.fMin * 2 ** ripple.octaves, 300, 178, true);
  const image = S('image', { x: G, y: fy.r1, width: D - G, height: fy.r0 - fy.r1, preserveAspectRatio: 'none' }, svg);
  axes(S('g', {}, svg), { x: tx, y: fy, ticksX: [0, 0.5, 1, 1.5, 2], ticksY: [250, 500, 1000, 2000, 4000, 8000],
    titreX: 'Temps (s)', titreY: 'kHz', formatX: (v) => nb(v), formatY: (v) => nb(v / 1000) });
  const curseurT = S('line', { y1: fy.r1, y2: fy.r0, stroke: NOIR, 'stroke-width': 2, visibility: 'hidden' }, svg);

  function enveloppe() { image.setAttribute('href', enveloppeImage(etat, 2 * (D - G), 2 * (fy.r0 - fy.r1))); }
  function rendre() {
    plan.fleche(etat.om, etat.Om);
    valeurM.textContent = etat.m.toFixed(2);
    jouer.lecture(lecteur.enCours());
    enveloppe();
  }

  function lancer() {
    lecteur.jouer(ripple.signal(etat.om, etat.Om, etat.m), ripple.taux, () => rendre());
    rendre();
    suivre();
  }
  function relancer() { if (lecteur.enCours()) lancer(); }

  function suivre() {
    const t = lecteur.temps();
    if (lecteur.enCours() && t >= 0) {
      curseurT.setAttribute('x1', tx(Math.min(t, ripple.duree)));
      curseurT.setAttribute('x2', tx(Math.min(t, ripple.duree)));
      curseurT.setAttribute('visibility', 'visible');
    } else curseurT.setAttribute('visibility', 'hidden');
    if (lecteur.enCours()) requestAnimationFrame(suivre);
  }

  ajuster(demo, L, HT, { surMasque: () => { lecteur.arreter(); rendre(); }, surAffiche: () => rendre() });
  rendre();
}

// Version imprimée : quatre rangées. Purement temporelle (Ω = 0), purement spectrale (ω = 0),
// les deux (descendantes, ascendantes, plus denses et plus rapides), puis la profondeur (0 : bruit
// non modulé). Valeurs au-dessus de chaque enveloppe, dans la couleur du soulignement de la
// diapositive ; graduations sur la colonne de gauche et sous la rangée du bas seulement.
function imprimer() {
  const RANGEES = [
    [{ om: 2, Om: 0 }, { om: 4, Om: 0 }, { om: 8, Om: 0 }],
    [{ om: 0, Om: 0.5 }, { om: 0, Om: 1 }, { om: 0, Om: 2 }],
    [{ om: -4, Om: 1 }, { om: 4, Om: 1 }, { om: 8, Om: 2 }],
    [{ m: 0 }, { m: 0.5 }, { m: 1 }],
  ];
  const etiquette = (i, p) => (i === 0 ? [[`ω = ${nb(p.om)} Hz`, C_OMEGA]]
    : i === 1 ? [[`Ω = ${nb(p.Om)} c/oct`, C_DENSITE]]
      : i === 2 ? [[`${nb(p.om)} Hz`, C_OMEGA], ['  ·  ', GRIS], [`${nb(p.Om)} c/oct`, C_DENSITE]]
        : [[`profondeur ${nb(p.m)}`, C_PROFONDEUR]]);
  const GI = 58, DI = L - 6, ECART = 14, LARG = (DI - GI - 2 * ECART) / 3, HAUT_I = 58, PAS = 86;
  const svg = placer(S('svg', { width: L, height: HT }), 0, 0);
  demo.append(svg);
  RANGEES.forEach((rg, i) => rg.forEach((r, j) => {
    const p = { om: 4, Om: 1, m: 1, ...r }, g0 = GI + j * (LARG + ECART), h = 20 + i * PAS;
    const x = echelle(0, ripple.duree, g0, g0 + LARG), y = echelle(ripple.fMin, ripple.fMin * 2 ** ripple.octaves, h + HAUT_I, h, true);
    const t = T(svg, g0 + LARG / 2, h - 7, '', 'graduation', 'middle');
    for (const [texte, c] of etiquette(i, p)) S('tspan', { fill: c }, t).textContent = texte;
    S('image', { x: g0, y: h, width: LARG, height: HAUT_I, preserveAspectRatio: 'none', href: enveloppeImage(p, 2 * LARG, 2 * HAUT_I) }, svg);
    const bas = i === RANGEES.length - 1, gauche = j === 0;
    axes(S('g', {}, svg), { x, y, ticksX: bas && gauche ? [0, 1, 2] : [], ticksY: gauche ? [250, 1000, 4000] : [],
      titreX: bas && gauche ? 'Temps (s)' : null, titreY: gauche ? 'kHz' : null, formatX: (v) => nb(v), formatY: (v) => nb(v / 1000) });
  }));
  ajuster(demo, L, HT);
  figurePrete();
}

// Enveloppe spectro-temporelle d'un réglage { om, Om, m } (gris : niveau), en image w × h.
function enveloppeImage({ om, Om, m }, w, h) {
  const toile = document.createElement('canvas');
  toile.width = Math.round(w); toile.height = Math.round(h);
  const g = toile.getContext('2d'), img = g.createImageData(toile.width, toile.height);
  for (let j = 0; j < toile.height; j++) {
    const x = (1 - (j + 0.5) / toile.height) * ripple.octaves;
    for (let i = 0; i < toile.width; i++) {
      const t = (i + 0.5) / toile.width * ripple.duree;
      const v = (1 + m * Math.sin(2 * Math.PI * (om * t - Om * x))) / 2; // 0 … 1
      const o = 4 * (j * toile.width + i), gris = Math.round(255 * (1 - 0.85 * v));
      img.data[o] = img.data[o + 1] = img.data[o + 2] = gris;
      img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return toile.toDataURL();
}
