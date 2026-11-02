// Données communes aux diapositives « corrélats acoustiques » du Cours 7 (diapo-correlats.js,
// diapo-paire.js) : McAdams et al. (1995), descripteurs, résultat gardé de la classe, cartes MDS.
// La carte est calculée comme sur la diapositive MDS (mds.js, mêmes départs) : mêmes axes.
import { apiGarde } from './commun.js';
import { mds } from './mds.js';
import { analyser, correspondance } from './correlats.js';

export function creerDonnees(conf) {
  const ID = String(conf.id || 'c7paires');
  const SOUS = Array.isArray(conf.sous_ensemble) ? conf.sous_ensemble.map(String) : [];
  const urls = {
    reference: String(conf.reference || 'donnees/mcadams1995.json'),
    descripteurs: String(conf.descripteurs || 'donnees/descripteurs-mcadams1995.json'),
    courbes: conf.courbes ? String(conf.courbes) : null,
  };
  const d = { reference: null, descripteurs: null, courbes: null, classe: null };
  const solutions = new Map();

  async function charger() {
    const lire = async (u) => {
      const r = await fetch(u, { cache: 'no-cache' });
      if (!r.ok) throw new Error(`Données introuvables (${u})`);
      return r.json();
    };
    [d.reference, d.descripteurs, d.courbes] = await Promise.all([
      lire(urls.reference), lire(urls.descripteurs), urls.courbes ? lire(urls.courbes) : null]);
  }

  async function chargerClasse() {
    try {
      const r = await apiGarde(ID);
      const g = r && r.garde;
      d.classe = g && g.resultats && Array.isArray(g.resultats.matrice) && SOUS.length === g.resultats.sons.length ? g : null;
    } catch {
      /* hors ligne : McAdams seulement */
    }
  }

  function solution(cle, delta, dim) {
    const k = `${cle}|${dim}`;
    if (!solutions.has(k)) solutions.set(k, mds(delta, { dim }));
    return solutions.get(k).points;
  }

  // source : 'classe' | 'reference'. → sons [{ desc, etiquette, nom, fichier }], points, valeurs,
  // analyse, comparaison (classe : dimension de McAdams la plus proche), texte de source.
  function vue(source, dim) {
    const ref = d.reference;
    const valeurs = Object.fromEntries(d.descripteurs.sons.map((s) => [s.cle, s]));
    const refSons = new Map(ref.gabarit.sons.map((s) => [s.cle, s]));
    const liste = d.descripteurs.descripteurs;
    if (source === 'classe' && d.classe) {
      const g = d.classe;
      const parCle = new Map((g.gabarit?.sons || []).map((s) => [s.cle, s]));
      const sons = g.resultats.sons.map((c, i) => {
        const s = parCle.get(c) || {};
        return { desc: SOUS[i], etiquette: s.abrege || c, nom: s.nom || c, fichier: s.fichier };
      });
      const points = solution(`classe|${g.revele_a || ''}`, g.resultats.matrice, dim); // paires sans note : poids nul
      const pm = solution('reference', ref.resultats.matrice, dim);
      const sousMc = SOUS.map((c) => pm[ref.resultats.sons.indexOf(c)]);
      const n = g.resultats.n ?? 0;
      return { sons, points, valeurs, analyse: analyser(points, SOUS, valeurs, liste), comparaison: correspondance(points, sousMc),
        source: `Classe : ${n} participant${n > 1 ? 's' : ''}${g.resultats.simulees ? ` (dont ${g.resultats.simulees} simulés)` : ''}, 6 timbres de McAdams et al. (1995)`,
        simulee: !!g.resultats.simulees };
    }
    const cles = ref.resultats.sons;
    const sons = cles.map((c) => ({ desc: c, etiquette: refSons.get(c)?.abrege || c, nom: refSons.get(c)?.nom || c, fichier: refSons.get(c)?.fichier }));
    const points = solution('reference', ref.resultats.matrice, dim);
    return { sons, points, valeurs, analyse: analyser(points, cles, valeurs, liste), comparaison: null,
      source: 'McAdams et al. (1995), Psychological Research 58 ; descripteurs calculés sur leurs sons' };
  }

  return { d, charger, chargerClasse, vue };
}

// Lecture d'un son au clic (un second clic sur le même son l'arrête).
export function creerLecteur() {
  let lecture = null;
  return {
    jouer(son, surFin) {
      if (!son?.fichier) return;
      if (lecture && lecture.son === son) { lecture.a.pause(); lecture = null; surFin?.(); return; }
      if (lecture) lecture.a.pause();
      const a = new Audio(son.fichier);
      lecture = { son, a };
      a.addEventListener('ended', () => { if (lecture?.a === a) { lecture = null; surFin?.(); } });
      a.play().catch(() => { lecture = null; surFin?.(); });
    },
    arreter() { if (lecture) { lecture.a.pause(); lecture = null; } },
    enCours: () => lecture?.son ?? null,
  };
}

// Relit le résultat de la classe à chaque affichage de la diapositive (Excalidraw remet
// l'élément à sa taille) ; coupe le son quand on la quitte.
export function surAffichage(rafraichir, couper) {
  let visible = window.innerWidth > 8;
  const verifier = async () => {
    const v = window.innerWidth > 8 && window.innerHeight > 8 && !document.hidden;
    if (v && !visible) await rafraichir();
    if (!v) couper();
    visible = v;
  };
  addEventListener('resize', verifier);
  document.addEventListener('visibilitychange', verifier);
}

export const virgule = (v, d = 2) => (v === null || v === undefined ? '—' : v.toFixed(d).replace('-', '−').replace('.', ','));

// Points étiquetés d'un nuage (SVG) : étiquette à droite, à gauche, au-dessus ou au-dessous, la
// première place libre. bornes : [gauche, droite] du repère. surClic(son), classe(son) facultatifs.
export function pointsEtiquetes(svg, txt, sons, px, py, { bornes = [0, 1000], surClic = () => {}, classe = () => '' } = {}) {
  const occupe = sons.map((_, i) => [px[i] - 13, py[i] - 13, px[i] + 13, py[i] + 13]);
  const chevauche = (b) => occupe.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
  return sons.map((son, i) => {
    const w = son.etiquette.length * 15 + 4, h = 26;
    const essais = [[px[i] + 18, py[i] + 10, 'start'], [px[i] - 18, py[i] + 10, 'end'], [px[i], py[i] - 20, 'middle'], [px[i], py[i] + 40, 'middle']];
    const boite = ([x, y, a]) => { const g = a === 'start' ? x : a === 'end' ? x - w : x - w / 2; return [g, y - h + 4, g + w, y + 4]; };
    const [lx, ly, ancre] = essais.find((e) => { const b = boite(e); return b[0] >= bornes[0] && b[2] <= bornes[1] && !chevauche(b); }) || essais[0];
    occupe.push(boite([lx, ly, ancre]));
    const g = svg('g', { class: `point ${classe(son)}`.trim(), tabindex: 0, role: 'button', 'aria-label': son.nom }, [
      svg('circle', { class: 'disque', cx: px[i], cy: py[i], r: 13, fill: '#1a3556', stroke: '#fff', 'stroke-width': 3 }),
      txt(lx, ly, son.etiquette, { taille: 28, couleur: '#1a3556', ancre }),
    ]);
    const t = svg('title', {});
    t.textContent = son.nom;
    g.appendChild(t);
    g.addEventListener('click', () => surClic(son));
    return g;
  });
}
