// commun.js — client HTTP, stockage local, utilitaires et rendu SVG des résultats.
// Aucune dépendance externe : seul ./core.js est importé (logique pure partagée).
import { normaliserGabarit } from './core.js';

// ─────────────────────────────────────────────────────────────
// Constantes de style (spec « Style »)
// ─────────────────────────────────────────────────────────────
export const COULEURS = Object.freeze({
  encre: '#16181d',
  marine: '#1A3556',
  filet: '#d7dae0',
  fond: '#ffffff',
  vert: '#1c5233',
  rouge: '#c92a2a',
});

export const POLICE = "'Source Sans 3', system-ui, -apple-system, 'Segoe UI', sans-serif";

const NS_SVG = 'http://www.w3.org/2000/svg';
const CLE_APPAREIL = 'poll:appareil';
const CLE_ENSEIGNANT = 'poll:cle';
const CLE_BANQUE = 'poll:banque';
const PREFIXE_REPONSE = 'poll:rep:';

// ─────────────────────────────────────────────────────────────
// Stockage local (tolérant : navigation privée, quota)
// ─────────────────────────────────────────────────────────────
function lireLocal(cle) {
  try {
    return localStorage.getItem(cle);
  } catch {
    return null;
  }
}

function ecrireLocal(cle, valeur) {
  try {
    localStorage.setItem(cle, valeur);
    return true;
  } catch {
    return false;
  }
}

function oterLocal(cle) {
  try {
    localStorage.removeItem(cle);
  } catch {
    /* sans conséquence */
  }
}

function alea128() {
  const octets = new Uint8Array(16);
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(octets);
  } else {
    for (let i = 0; i < 16; i += 1) octets[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(octets, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Identifiant d'appareil : 128 bits aléatoires, gardé dans localStorage.
// Sans stockage (élément HTML d'Excalidraw+, origine « null »), il reste en
// mémoire pour la durée du document : sinon chaque envoi compterait un appareil.
let appareilMemoire = null;
export function appareil() {
  let id = lireLocal(CLE_APPAREIL);
  if (!id || !/^[0-9a-f]{32}$/.test(id)) {
    id = appareilMemoire || alea128();
    if (!ecrireLocal(CLE_APPAREIL, id)) appareilMemoire = id;
  }
  return id;
}

export function lireCleEnseignant() {
  const cle = (lireLocal(CLE_ENSEIGNANT) || '').trim();
  return cle || null;
}

export function garderCleEnseignant(cle) {
  const propre = String(cle || '').trim();
  if (!propre) return false;
  return ecrireLocal(CLE_ENSEIGNANT, propre);
}

export function oublierCleEnseignant() {
  oterLocal(CLE_ENSEIGNANT);
}

export function lireBanqueTexte() {
  return lireLocal(CLE_BANQUE) || '';
}

export function garderBanqueTexte(texte) {
  return ecrireLocal(CLE_BANQUE, String(texte || ''));
}

// Réponse gardée par (séance, id, tour) : réaffichée après rechargement.
export function cleReponseLocale(seance, id, tour) {
  return `${PREFIXE_REPONSE}${seance}:${id}:${tour}`;
}

export function lireReponseLocale(seance, id, tour) {
  const brut = lireLocal(cleReponseLocale(seance, id, tour));
  if (!brut) return null;
  try {
    const objet = JSON.parse(brut);
    if (!objet || typeof objet !== 'object' || !('reponse' in objet)) return null;
    return { reponse: objet.reponse, envoye: objet.envoye !== false, quand: objet.quand || null };
  } catch {
    return null;
  }
}

export function garderReponseLocale(seance, id, tour, reponse, envoye) {
  return ecrireLocal(
    cleReponseLocale(seance, id, tour),
    JSON.stringify({ reponse, envoye: !!envoye, quand: Date.now() }),
  );
}

// ─────────────────────────────────────────────────────────────
// Client HTTP
// ─────────────────────────────────────────────────────────────
async function appel(op, options = {}) {
  const {
    methode = 'GET',
    corps = null,
    cle = null,
    signal = null,
    entetesSupplementaires = null,
    parametres = null,
  } = options;
  const entetes = { Accept: 'application/json' };
  if (corps !== null && corps !== undefined) entetes['Content-Type'] = 'application/json';
  // Jeton de diapositive (texte) en en-tête ; sinon le cookie de session suffit.
  if (typeof cle === 'string' && cle) entetes.Authorization = `Bearer ${cle}`;
  if (entetesSupplementaires) Object.assign(entetes, entetesSupplementaires);

  let requete = `/api/poll?op=${encodeURIComponent(op)}`;
  if (parametres) {
    for (const [nom, valeur] of Object.entries(parametres)) {
      if (valeur === undefined || valeur === null) continue;
      requete += `&${encodeURIComponent(nom)}=${encodeURIComponent(valeur)}`;
    }
  }

  let reponse;
  try {
    reponse = await fetch(requete, {
      method: methode,
      headers: entetes,
      cache: 'no-store',
      credentials: 'same-origin',
      body: corps === null || corps === undefined ? undefined : JSON.stringify(corps),
      signal,
    });
  } catch (e) {
    if (e && e.name === 'AbortError') throw e;
    const err = new Error('Réseau indisponible');
    err.reseau = true;
    err.statut = 0;
    throw err;
  }

  let donnees = null;
  try {
    donnees = await reponse.json();
  } catch {
    donnees = null;
  }

  if (!reponse.ok) {
    const err = new Error((donnees && donnees.erreur) || `Erreur ${reponse.status}`);
    err.statut = reponse.status;
    err.corps = donnees;
    throw err;
  }
  return donnees;
}

export function apiEtat() {
  // Réponse identique pour tous : le CDN la partage (s-maxage=1).
  return appel('etat');
}

// Résultat gardé d'une question (dernière révélation), visible après le cours.
export function apiGarde(id) {
  return appel('garde', { parametres: { id } });
}

export function apiEffacerGarde(corps, cle) {
  return appel('garde_effacer', { methode: 'POST', corps, cle });
}

export function apiPresence(idAppareil) {
  return appel('presence', { methode: 'POST', corps: { appareil: idAppareil } });
}

export function apiRepondre({ seance, id, tour, appareil: idAppareil, reponse }) {
  return appel('repondre', {
    methode: 'POST',
    corps: { seance, id, tour, appareil: idAppareil, reponse },
  });
}

// Session de l'enseignant (cookie HttpOnly posé par /api/poll?op=connexion).
// Rend {connecte, login, type, expire, cours}.
export async function apiMoi() {
  try {
    return await appel('moi');
  } catch {
    return { connecte: false };
  }
}

export function adresseConnexion(retour = location.pathname + location.search + location.hash) {
  return `/api/poll?op=connexion&retour=${encodeURIComponent(retour)}`;
}

export function apiEnseignant(op, corps, cle) {
  const corpsAutorise = corps === undefined ? {} : corps;
  return appel(op, { methode: 'POST', corps: corpsAutorise, cle });
}

export function apiResultats(cle) {
  return appel('resultats', { cle });
}

export function messageErreur(err) {
  if (!err) return 'Erreur inconnue';
  if (err.reseau) return 'Réseau indisponible';
  switch (err.statut) {
    case 400:
      return err.message || 'Données refusées';
    case 401:
      return 'Clé enseignant absente ou refusée';
    case 403:
      return 'Clé enseignant refusée';
    case 409:
      return 'Question fermée ou périmée';
    case 429:
      return 'Trop d’envois — patientez un instant';
    case 503:
      return 'Service momentanément indisponible';
    default:
      return err.message || 'Erreur inattendue';
  }
}

// ─────────────────────────────────────────────────────────────
// Adresse de la salle, QR, plein écran, presse-papiers
// ─────────────────────────────────────────────────────────────
export function urlSalle() {
  return new URL('./', import.meta.url).href;
}

// Forme affichée en clair : « loonanchauvette.com/q ».
export function adresseCourte() {
  const u = new URL(urlSalle());
  const chemin = u.pathname.replace(/\/+$/, '');
  return u.host + chemin;
}

// QR local via public/q/vendor/qrcode.js (global `qrcode`).
export function qrSvg(texte, { cellSize = 8, margin = 4, titre = null } = {}) {
  const generateur = globalThis.qrcode;
  if (typeof generateur !== 'function') return null;
  try {
    const qr = generateur(0, 'M');
    qr.addData(texte);
    qr.make();
    const balisage = qr.createSvgTag({
      cellSize,
      margin,
      scalable: true,
      alt: `QR code vers ${texte}`,
      title: titre || `QR code vers ${texte}`,
    });
    const enveloppe = document.createElement('div');
    enveloppe.innerHTML = balisage;
    const svgQr = enveloppe.firstElementChild;
    if (svgQr) svgQr.setAttribute('aria-label', `QR code vers ${texte}`);
    return svgQr;
  } catch {
    return null;
  }
}

export async function basculerPleinEcran() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    } else {
      await document.exitFullscreen();
    }
  } catch {
    /* refus du navigateur : sans conséquence */
  }
}

export async function copierTexte(texte) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texte);
      return true;
    }
  } catch {
    /* essai suivant */
  }
  try {
    const zone = document.createElement('textarea');
    zone.value = texte;
    zone.setAttribute('readonly', '');
    zone.style.position = 'fixed';
    zone.style.opacity = '0';
    document.body.appendChild(zone);
    zone.select();
    const ok = document.execCommand('copy');
    zone.remove();
    return ok;
  } catch {
    return false;
  }
}

export function telecharger(nom, contenu, type = 'text/csv;charset=utf-8') {
  try {
    const blob = new Blob([contenu], { type });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = nom;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// Formatage
// ─────────────────────────────────────────────────────────────
export function formaterNombre(v, { min = 0, max = 0 } = {}) {
  return new Intl.NumberFormat('fr-CA', { minimumFractionDigits: min, maximumFractionDigits: max })
    .format(v).replace(/\u00a0/g, '\u202f').replace(',', '.');
}

export function nombreEntier(v) {
  const n = Number(v);
  return formaterNombre(Number.isFinite(n) ? n : 0);
}

export function nombreDecimal(v, decimales = 1) {
  const n = Number(v);
  return Number.isFinite(n) ? formaterNombre(n, { min: decimales, max: decimales }) : '—';
}

export function formaterDuree(ms) {
  const secondes = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
  return `${Math.floor(secondes / 60)}:${String(secondes % 60).padStart(2, '0')}`;
}

export function echapper(texte) {
  return String(texte == null ? '' : texte)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─────────────────────────────────────────────────────────────
// Gabarits : options, réponses lisibles
// ─────────────────────────────────────────────────────────────
function gabaritNormalise(type, gabarit) {
  try {
    return normaliserGabarit(type, gabarit || {});
  } catch {
    return gabarit || {};
  }
}

export function optionsDe(type, gabarit) {
  if (type === 'vraifaux') {
    return [
      { cle: 'V', texte: 'Vrai' },
      { cle: 'F', texte: 'Faux' },
    ];
  }
  const g = gabaritNormalise(type, gabarit);
  const options = Array.isArray(g.options) ? g.options : [];
  if (!options.length) {
    return ['A', 'B', 'C', 'D'].map((cle) => ({ cle, texte: '' }));
  }
  return options.map((o) => ({ cle: String(o.cle), texte: String(o.texte || '') }));
}

// Réponse telle qu'on la montre à l'étudiant.
export function formaterReponse(type, gabarit, valeur) {
  const g = gabaritNormalise(type, gabarit);
  if (valeur === null || valeur === undefined) return '';
  if (type === 'vraifaux') return valeur === 'V' ? 'Vrai' : 'Faux';
  if (type === 'choix' || type === 'multiple') {
    const cles = Array.isArray(valeur) ? valeur : [valeur];
    return cles
      .map((cle) => {
        const option = optionsDe(type, g).find((o) => o.cle === String(cle));
        return option && option.texte ? `${option.cle} — ${option.texte}` : String(cle);
      })
      .join(', ');
  }
  if (type === 'echelle' || type === 'curseur') return formaterNombre(valeur, { max: 3 });
  if (type === 'nombre') return `${formaterNombre(valeur, { max: 6 })}${g.unite ? ' ' + g.unite : ''}`;
  if (type === 'nuage') return Array.isArray(valeur) ? valeur.join(' · ') : String(valeur);
  if (type === 'texte') return String(valeur);
  if (type === 'classement') {
    const cles = Array.isArray(valeur) ? valeur : [];
    return cles
      .map((cle) => {
        const item = (Array.isArray(g.items) ? g.items : []).find((i) => String(i.cle) === String(cle));
        return item && item.texte ? item.texte : String(cle);
      })
      .join(' › ');
  }
  if (type === 'serie' && valeur && typeof valeur === 'object') {
    return (g.questions || [])
      .filter((sq) => valeur[sq.cle] !== undefined)
      .map((sq) => {
        const { cle, type: t, ...sous } = sq;
        return `${cle}. ${formaterReponse(t, sous, valeur[cle])}`;
      })
      .join('  ·  ');
  }
  return String(valeur);
}

// ─────────────────────────────────────────────────────────────
// SVG : briques de base
// ─────────────────────────────────────────────────────────────
export function svg(nom, attrs = {}, enfants = []) {
  const e = document.createElementNS(NS_SVG, nom);
  for (const [cle, valeur] of Object.entries(attrs)) {
    if (valeur === null || valeur === undefined) continue;
    e.setAttribute(cle, String(valeur));
  }
  for (const enfant of enfants) {
    if (enfant === null || enfant === undefined || enfant === false) continue;
    e.appendChild(typeof enfant === 'string' ? document.createTextNode(enfant) : enfant);
  }
  return e;
}

export function txt(x, y, contenu, o = {}) {
  return svg(
    'text',
    {
      x,
      y,
      'font-size': o.taille ?? 34,
      'font-weight': o.graisse ?? 400,
      'text-anchor': o.ancre ?? 'start',
      fill: o.couleur ?? COULEURS.encre,
      'font-family': POLICE,
      'letter-spacing': o.interlettre ?? null,
    },
    [String(contenu)],
  );
}

let contexteMesure = null;
function mesureur() {
  if (contexteMesure) return contexteMesure;
  if (typeof document === 'undefined') return null;
  const toile = document.createElement('canvas');
  contexteMesure = toile.getContext('2d');
  return contexteMesure;
}

function largeurTexte(texte, taille, graisse = 400) {
  const ctx = mesureur();
  const contenu = String(texte || '');
  if (ctx) {
    ctx.font = `${graisse} ${taille}px ${POLICE}`;
    return ctx.measureText(contenu).width;
  }
  return contenu.length * taille * 0.52;
}

function couperTexte(texte, taille, largeurMax, graisse = 400) {
  let t = String(texte || '');
  if (largeurTexte(t, taille, graisse) <= largeurMax) return t;
  while (t.length > 1 && largeurTexte(`${t}…`, taille, graisse) > largeurMax) t = t.slice(0, -1);
  return `${t.replace(/\s+$/, '')}…`;
}

function enrouler(texte, taille, largeurMax, graisse = 400, maxLignes = 6) {
  const mots = String(texte || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  if (!mots.length) return [''];
  const lignes = [];
  let courante = '';
  for (const mot of mots) {
    const essai = courante ? `${courante} ${mot}` : mot;
    if (courante && largeurTexte(essai, taille, graisse) > largeurMax) {
      lignes.push(courante);
      courante = mot;
    } else {
      courante = essai;
    }
    if (lignes.length > maxLignes) break;
  }
  if (courante) lignes.push(courante);
  if (lignes.length > maxLignes) {
    const garde = lignes.slice(0, maxLignes);
    garde[maxLignes - 1] = couperTexte(
      `${garde[maxLignes - 1]} ${lignes.slice(maxLignes).join(' ')}`,
      taille,
      largeurMax,
      graisse,
    );
    return garde;
  }
  return lignes;
}

function cheminCoche(x, y, taille) {
  const d = [
    `M ${x + taille * 0.06} ${y + taille * 0.52}`,
    `L ${x + taille * 0.36} ${y + taille * 0.84}`,
    `L ${x + taille * 0.96} ${y + taille * 0.10}`,
  ].join(' ');
  return svg('path', {
    d,
    fill: 'none',
    stroke: COULEURS.vert,
    'stroke-width': Math.max(3, taille * 0.16),
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
}

function racineSvg(largeur, hauteur, enfants, opts = {}) {
  const svgEl = svg(
    'svg',
    {
      viewBox: `0 0 ${largeur} ${hauteur}`,
      width: '100%',
      preserveAspectRatio: 'xMidYMid meet',
      role: 'img',
      'aria-label': opts.etiquette || 'Résultats de la question',
      class: opts.classe || 'graphique',
    },
    enfants,
  );
  svgEl.setAttribute('style', 'width:100%;height:auto;display:block;font-family:' + POLICE);
  return svgEl;
}

function mesures(opts = {}) {
  const compact = !!opts.compact;
  // Tracé à la taille réelle d'un écran (px CSS) : tailles de lecture d'une page web.
  if (opts.echelle === 'ecran') {
    return {
      compact: true,
      echelleEcran: true,
      bw: Number(opts.largeur) || 360,
      pad: 8,
      ligne: 48,
      barreH: 16,
      fsLettre: 22,
      fsOption: 16,
      fsChiffre: 16,
      fsNote: 14,
      fsTitre: 17,
      fsCarte: 16,
      ecartRang: 12,
    };
  }
  return {
    compact,
    bw: Number(opts.largeur) || (compact ? 760 : 1600),
    pad: compact ? 20 : 40,
    ligne: compact ? 104 : 132,
    barreH: compact ? 34 : 46,
    fsLettre: compact ? 54 : 62,
    fsOption: compact ? 40 : 34,
    fsChiffre: compact ? 38 : 44,
    fsNote: compact ? 30 : 30,
    fsTitre: compact ? 36 : 42,
    fsCarte: compact ? 34 : 32,
    ecartRang: compact ? 22 : 30,
  };
}

function compteDe(comptes, cle) {
  if (!comptes) return 0;
  if (comptes[cle] !== undefined && comptes[cle] !== null) return Number(comptes[cle]) || 0;
  const cible = String(cle);
  for (const [k, v] of Object.entries(comptes)) {
    if (String(k) === cible) return Number(v) || 0;
  }
  return 0;
}

function vide(message, opts = {}) {
  const m = mesures(opts);
  return racineSvg(
    m.bw,
    m.compact ? 150 : 180,
    [txt(m.pad, m.compact ? 90 : 110, message, { taille: m.fsTitre, couleur: COULEURS.encre })],
    opts,
  );
}

// ─────────────────────────────────────────────────────────────
// Barres horizontales : choix, multiple, vrai/faux
// ─────────────────────────────────────────────────────────────
// Ligne « barre » commune aux choix et aux valeurs numériques. Colonnes fixes, mesurées :
//   [coche] [étiquette] [barre ……………] [%] [vous]
// - étiquette : lettre (choix) ou valeur (nombre), colonne à la largeur de la plus longue ;
// - libellé d'option éventuel : au-dessus de la barre, sur 2 lignes au plus (jamais coupé
//   au milieu d'un mot ; « … » seulement au-delà de 2 lignes) ;
// - % : juste après la barre, aligné à gauche (colonne de largeur « 100 % ») ;
// - réponse de l'étudiant : rangée teintée + « vous » dans sa propre colonne (rien ne déborde).
function rangeesBarres(m, lignes, n, opts) {
  const avecCoche = lignes.some((l) => l.bonne);
  const avecVous = lignes.some((l) => l.vous);
  const ecart = Math.round(m.fsChiffre * 0.4);
  const colCoche = avecCoche ? Math.round(m.fsLettre * 0.95) : 0;
  const colEtiq = Math.max(...lignes.map((l) => largeurTexte(l.etiquette, l.fsEtiquette, 700))) + ecart;
  const colPct = largeurTexte('100 %', m.fsChiffre, 600) + ecart;
  const fsVous = m.fsNote;
  const colVous = avecVous ? largeurTexte('vous', fsVous, 700) + ecart : 0;
  const xEtiq = m.pad + colCoche;
  const xBarre = xEtiq + colEtiq;
  const largBarre = Math.max(80, m.bw - m.pad - xBarre - colPct - colVous);
  const xPct = xBarre + largBarre + ecart;
  const pasTexte = Math.round(m.fsOption * 1.3);
  const enfants = [];
  let y = m.pad;
  for (const l of lignes) {
    const part = n ? l.v / n : 0;
    const textes = l.texte ? enrouler(l.texte, m.fsOption, m.bw - m.pad - xBarre, 600, 2) : [];
    const hTexte = textes.length * pasTexte + (textes.length ? 6 : 0);
    const hRang = Math.max(hTexte + m.barreH, l.fsEtiquette * 1.05);
    const yBarre = y + hTexte + Math.max(0, (hRang - hTexte - m.barreH) / 2);
    const g = svg('g', {}, [
      svg('title', {}, [`${l.titre} : ${nombreEntier(part * 100)} %, ${nombreEntier(l.v)} réponse${l.v === 1 ? '' : 's'}${l.bonne ? ' — bonne réponse' : ''}${l.vous ? ' — votre réponse' : ''}`]),
    ]);
    if (l.vous) {
      const m2 = Math.round(m.pad * 0.5);
      g.appendChild(svg('rect', { x: m2, y: y - m2, width: m.bw - 2 * m2, height: hRang + 2 * m2, rx: 10, fill: '#e8eef6', class: 'vous' }));
    }
    // Étiquette (et coche) : alignées sur la première ligne du libellé, ou centrées sur la barre.
    const yEtiq = textes.length ? y + m.fsOption * 0.95 : yBarre + m.barreH / 2 + l.fsEtiquette * 0.36;
    if (l.bonne) g.appendChild(cheminCoche(m.pad, yEtiq - m.fsLettre * 0.62, m.fsLettre * 0.66));
    g.appendChild(txt(xEtiq, yEtiq, l.etiquette, { taille: l.fsEtiquette, graisse: 700, couleur: l.bonne ? COULEURS.vert : COULEURS.marine }));
    textes.forEach((t, k) => g.appendChild(txt(xBarre, y + m.fsOption * 0.95 + k * pasTexte, t, { taille: m.fsOption, graisse: 600 })));
    g.appendChild(svg('rect', { x: xBarre, y: yBarre, width: largBarre, height: m.barreH, fill: COULEURS.fond, stroke: COULEURS.filet, 'stroke-width': 2 }));
    if (part > 0) {
      g.appendChild(svg('rect', { x: xBarre, y: yBarre, width: Math.max(4, largBarre * part), height: m.barreH, fill: l.bonne ? COULEURS.vert : COULEURS.marine }));
    }
    const yChiffre = yBarre + m.barreH / 2 + m.fsChiffre * 0.36;
    g.appendChild(txt(xPct, yChiffre, `${nombreEntier(part * 100)} %`, { taille: m.fsChiffre, graisse: 600 }));
    if (l.vous) {
      g.appendChild(txt(m.bw - m.pad, yBarre + m.barreH / 2 + fsVous * 0.36, 'vous', {
        taille: fsVous, graisse: 700, ancre: 'end', couleur: l.bonne ? COULEURS.vert : COULEURS.rouge,
      }));
    }
    enfants.push(g);
    y += hRang + m.ecartRang;
  }
  return { enfants, hauteur: y - m.ecartRang + m.pad };
}

function rendreBarres(type, gabarit, res, opts) {
  const m = mesures(opts);
  const options = optionsDe(type, gabarit);
  const bonnes = new Set((opts.bonnes || []).map(String));
  const miennes = new Set((Array.isArray(opts.maReponse) ? opts.maReponse : [opts.maReponse]).filter((v) => v != null).map(String));
  const n = Math.max(0, Number(res.n) || 0);
  // Vrai/Faux : le mot entier tient lieu d'étiquette (pas de « V » + « Vrai »).
  const vf = type === 'vraifaux';
  const lignes = options.map((o) => ({
    etiquette: vf ? o.texte : o.cle,
    fsEtiquette: vf ? m.fsOption : m.fsLettre,
    texte: vf ? '' : o.texte,
    titre: `${o.cle}${o.texte && !vf ? ' — ' + o.texte : ''}`,
    v: compteDe(res.comptes, o.cle),
    bonne: bonnes.has(o.cle),
    vous: miennes.has(o.cle),
  }));
  const { enfants, hauteur } = rangeesBarres(m, lignes, n, opts);
  let h = hauteur;
  if (type === 'multiple') {
    enfants.push(txt(m.pad, h + m.fsNote * 0.4, 'Part des répondants — plusieurs choix possibles', { taille: m.fsNote }));
    h += m.fsNote * 1.4;
  }
  return racineSvg(m.bw, h, enfants, opts);
}

// ─────────────────────────────────────────────────────────────
// Nombre, valeurs fréquentes : une barre par valeur (au plus 5 + « autres »)
// ─────────────────────────────────────────────────────────────
function rendreValeurs(gabarit, res, opts) {
  const m = mesures(opts);
  const g = gabarit || {};
  const unite = g.unite ? ` ${g.unite}` : '';
  const tol = Number(g.tolerance) || 0;
  const bonnes = (opts.bonnes || []).map(Number).filter(Number.isFinite);
  const estBonne = (v) => bonnes.some((b) => Math.abs(v - b) <= tol + 1e-9);
  const n = Math.max(0, Number(res.n) || 0);
  const fmtV = (v) => formaterNombre(v, { max: 3 });
  const mienne = opts.maReponse != null ? Number(opts.maReponse) : null;
  const lignes = res.frequentes.map((f) => {
    const v = Number(f.valeur);
    return { etiquette: fmtV(v) + unite, fsEtiquette: m.fsOption, texte: '', titre: fmtV(v) + unite, v: Number(f.n) || 0, bonne: estBonne(v), vous: mienne === v };
  });
  const autres = n - lignes.reduce((s, l) => s + l.v, 0);
  if (autres > 0) lignes.push({ etiquette: 'Autres', fsEtiquette: m.fsOption, texte: '', titre: 'Autres', v: autres, bonne: false, vous: false });
  const { enfants, hauteur } = rangeesBarres(m, lignes, n, opts);
  return racineSvg(m.bw, hauteur, enfants, opts);
}

// ─────────────────────────────────────────────────────────────
// Histogramme vertical : échelle et nombre
// ─────────────────────────────────────────────────────────────
function rendreHistogramme(type, gabarit, res, opts) {
  const m = mesures(opts);
  const g = gabaritNormalise(type, gabarit);
  const compact = m.compact;
  const hauteur = compact ? 430 : 640;
  const haut = compact ? 110 : 150;
  const enfants = [];

  // Séries : {libelle, valeur, effectif}
  let series = [];
  let legende = '';
  if (type === 'echelle') {
    const min = Number.isFinite(Number(g.min)) ? Number(g.min) : 1;
    const max = Number.isFinite(Number(g.max)) ? Number(g.max) : 5;
    const nb = Math.max(2, Math.min(12, Math.round(max - min + 1)));
    for (let i = 0; i < nb; i += 1) {
      const valeur = min + i;
      series.push({ libelle: String(valeur), effectif: compteDe(res.comptes, valeur) });
    }
    legende = `Moyenne ${nombreDecimal(res.moyenne, 1)} sur ${nombreEntier(max)}`;
  } else {
    const classes = Array.isArray(res.classes) ? res.classes : [];
    // Autant de décimales que la largeur des classes l'exige (classes de 0,125 → « 4,125 »).
    const pas = classes.length ? Math.abs(Number(classes[0].a) - Number(classes[0].de)) : 1;
    let dec = 0;
    while (dec < 3 && Math.abs(pas * 10 ** dec - Math.round(pas * 10 ** dec)) > 1e-9) dec += 1;
    const fmt = (v) => (dec ? nombreDecimal(v, dec) : nombreEntier(v));
    series = classes.map((c) => ({
      libelle: Number(c.de) === Number(c.a) ? fmt(c.de) : `${fmt(c.de)}–${fmt(c.a)}`,
      effectif: Number(c.n) || 0,
    }));
    legende = `Médiane ${nombreDecimal(res.mediane, 0)}${g.unite ? ' ' + g.unite : ''}`;
  }

  if (!series.length) return vide('Aucune réponse', opts);
  const maxEffectif = Math.max(1, ...series.map((s) => s.effectif));
  const x0 = m.pad + 10;
  const x1 = m.bw - m.pad - 10;
  const largDispo = x1 - x0;
  const pas = largDispo / series.length;
  const largBarre = Math.min(compact ? 54 : 110, pas * 0.62);

  // Étiquettes larges : on les incline plutôt que de les laisser se chevaucher.
  const largeurEtiquette = Math.max(
    ...series.map((s) => largeurTexte(s.libelle, m.fsChiffre, 600)),
  );
  const tourner = largeurEtiquette > pas * 0.92;
  const basAxe = hauteur - (tourner ? (compact ? 150 : 250) : compact ? 150 : 190);

  series.forEach((s, i) => {
    const centre = x0 + pas * (i + 0.5);
    const hBarre = ((basAxe - haut) * s.effectif) / maxEffectif;
    const groupe = svg('g', {}, []);
    groupe.appendChild(svg('title', {}, [`${s.libelle} : ${s.effectif} réponse${s.effectif === 1 ? '' : 's'}`]));
    groupe.appendChild(
      svg('rect', {
        x: centre - largBarre / 2,
        y: basAxe - hBarre,
        width: largBarre,
        height: Math.max(hBarre, s.effectif ? 2 : 0),
        fill: COULEURS.marine,
      }),
    );
    if (s.effectif) {
      groupe.appendChild(
        txt(centre, basAxe - hBarre - 12, nombreEntier(s.effectif), {
          taille: m.fsChiffre,
          graisse: 600,
          ancre: 'middle',
        }),
      );
    }
    if (tourner) {
      groupe.appendChild(
        svg('g', { transform: `translate(${centre} ${basAxe + 26}) rotate(-45)` }, [
          txt(0, 0, s.libelle, {
            taille: m.fsChiffre,
            graisse: 600,
            ancre: 'end',
            couleur: COULEURS.encre,
          }),
        ]),
      );
    } else {
      groupe.appendChild(
        txt(centre, basAxe + (compact ? 46 : 58), s.libelle, {
          taille: m.fsChiffre,
          graisse: 600,
          ancre: 'middle',
          couleur: COULEURS.encre,
        }),
      );
    }
    enfants.push(groupe);
  });

  enfants.push(
    svg('line', {
      x1: x0,
      y1: basAxe,
      x2: x1,
      y2: basAxe,
      stroke: COULEURS.encre,
      'stroke-width': 2,
    }),
  );

  if (type === 'echelle') {
    const ancreMin = String(g.ancre_min || '').trim();
    const ancreMax = String(g.ancre_max || '').trim();
    const yAncres = basAxe + (tourner ? (compact ? 128 : 205) : compact ? 92 : 112);
    if (ancreMin) {
      enfants.push(txt(x0, yAncres, couperTexte(ancreMin, m.fsNote, largDispo * 0.45), {
        taille: m.fsNote,
        couleur: COULEURS.encre,
      }));
    }
    if (ancreMax) {
      enfants.push(txt(x1, yAncres, couperTexte(ancreMax, m.fsNote, largDispo * 0.45), {
        taille: m.fsNote,
        ancre: 'end',
        couleur: COULEURS.encre,
      }));
    }
  }

  enfants.push(
    txt(x0, compact ? 62 : 82, legende, {
      taille: m.fsTitre,
      graisse: 700,
      couleur: COULEURS.encre,
    }),
  );

  return racineSvg(m.bw, hauteur, enfants, opts);
}

// ─────────────────────────────────────────────────────────────
// Curseur : points en bandes + moyenne et médiane
// ─────────────────────────────────────────────────────────────
function rendreCurseur(gabarit, res, opts) {
  const m = mesures(opts);
  const g = gabaritNormalise('curseur', gabarit);
  const compact = m.compact;
  const min = Number.isFinite(Number(g.min)) ? Number(g.min) : 0;
  const max = Number.isFinite(Number(g.max)) ? Number(g.max) : 100;
  const valeurs = (Array.isArray(res.valeurs) ? res.valeurs : [])
    .map(Number)
    .filter((v) => Number.isFinite(v))
    .map((v) => Math.min(max, Math.max(min, v)))
    .sort((a, b) => a - b);
  if (!valeurs.length) return vide('Aucune réponse', opts);

  const hauteur = compact ? 420 : 600;
  const hautPistes = compact ? 150 : 200;
  const yAxe = hauteur - (compact ? 170 : 210);
  const x0 = m.pad + 10;
  const x1 = m.bw - m.pad - 10;
  const largeurAxe = x1 - x0;
  const versX = (v) => x0 + ((v - min) / (max - min || 1)) * largeurAxe;
  const enfants = [];

  // Bandes : un point par valeur, empilés par paquets de 14 px.
  const bandes = new Map();
  const positions = valeurs.map((v) => versX(v));
  positions.forEach((x) => {
    const b = Math.round(x / (compact ? 16 : 14));
    bandes.set(b, (bandes.get(b) || 0) + 1);
  });
  const pileMax = Math.max(1, ...bandes.values());
  const pasPile = Math.min(compact ? 20 : 22, Math.max(7, (yAxe - hautPistes) / pileMax));
  const compteur = new Map();

  positions.forEach((x) => {
    const b = Math.round(x / (compact ? 16 : 14));
    const rang = compteur.get(b) || 0;
    compteur.set(b, rang + 1);
    enfants.push(
      svg('circle', {
        cx: x,
        cy: yAxe - (compact ? 16 : 20) - rang * pasPile,
        r: compact ? 7 : 9,
        fill: COULEURS.marine,
      }),
    );
  });

  // Axe et graduations
  enfants.push(svg('line', { x1: x0, y1: yAxe, x2: x1, y2: yAxe, stroke: COULEURS.encre, 'stroke-width': 2 }));
  const millieu = min + (max - min) / 2;
  [min, millieu, max].forEach((v) => {
    const x = versX(v);
    enfants.push(svg('line', { x1: x, y1: yAxe, x2: x, y2: yAxe + 10, stroke: COULEURS.encre, 'stroke-width': 2 }));
    enfants.push(
      txt(x, yAxe + (compact ? 42 : 50), nombreEntier(v), {
        taille: m.fsChiffre,
        graisse: 600,
        ancre: v === min ? 'start' : v === max ? 'end' : 'middle',
      }),
    );
  });

  // Moyenne (trait plein) et médiane (tiretés)
  if (Number.isFinite(Number(res.moyenne))) {
    const x = versX(Number(res.moyenne));
    const trait = svg('line', {
      x1: x,
      y1: yAxe,
      x2: x,
      y2: hautPistes - (compact ? 24 : 40),
      stroke: COULEURS.marine,
      'stroke-width': compact ? 5 : 6,
    });
    trait.appendChild(svg('title', {}, [`Moyenne ${nombreDecimal(res.moyenne, 1)}`]));
    enfants.push(trait);
  }
  if (Number.isFinite(Number(res.mediane))) {
    const x = versX(Number(res.mediane));
    const trait = svg('line', {
      x1: x,
      y1: yAxe,
      x2: x,
      y2: hautPistes + (compact ? 10 : 20),
      stroke: COULEURS.encre,
      'stroke-width': compact ? 3 : 4,
      'stroke-dasharray': '12 10',
    });
    trait.appendChild(svg('title', {}, [`Médiane ${nombreDecimal(res.mediane, 1)}`]));
    enfants.push(trait);
  }

  // Légende
  const yLegende = compact ? 58 : 74;
  let x = m.pad + 6;
  enfants.push(svg('line', { x1: x, y1: yLegende - 10, x2: x + 46, y2: yLegende - 10, stroke: COULEURS.marine, 'stroke-width': 6 }));
  enfants.push(
    txt(x + 58, yLegende, `Moyenne ${nombreDecimal(res.moyenne, 1)}`, {
      taille: m.fsNote + 4,
      graisse: 700,
    }),
  );
  x += 58 + largeurTexte(`Moyenne ${nombreDecimal(res.moyenne, 1)}`, m.fsNote + 4, 700) + (compact ? 26 : 44);
  enfants.push(svg('line', {
    x1: x,
    y1: yLegende - 10,
    x2: x + 46,
    y2: yLegende - 10,
    stroke: COULEURS.encre,
    'stroke-width': 4,
    'stroke-dasharray': '12 10',
  }));
  enfants.push(
    txt(x + 58, yLegende, `Médiane ${nombreDecimal(res.mediane, 1)}`, {
      taille: m.fsNote + 4,
      graisse: 700,
    }),
  );

  // Ancres + effectif
  const ancreMin = String(g.ancre_min || '').trim();
  const ancreMax = String(g.ancre_max || '').trim();
  const yAncres = yAxe + (compact ? 92 : 112);
  if (ancreMin) {
    enfants.push(
      txt(x0, yAncres, couperTexte(ancreMin, m.fsNote, largeurAxe * 0.42), {
        taille: m.fsNote,
      }),
    );
  }
  if (ancreMax) {
    enfants.push(
      txt(x1, yAncres, couperTexte(ancreMax, m.fsNote, largeurAxe * 0.42), {
        taille: m.fsNote,
        ancre: 'end',
      }),
    );
  }

  return racineSvg(m.bw, hauteur, enfants, opts);
}

// ─────────────────────────────────────────────────────────────
// Nuage de mots
// ─────────────────────────────────────────────────────────────
function rendreNuage(gabarit, res, opts) {
  const m = mesures(opts);
  const compact = m.compact;
  const mots = (Array.isArray(res.mots) ? res.mots : [])
    .map((x) => ({ mot: String(x.mot || ''), n: Number(x.n) || 0 }))
    .filter((x) => x.mot)
    .slice(0, compact ? 30 : 45);
  if (!mots.length) return vide('Aucune réponse', opts);

  const maxN = Math.max(...mots.map((x) => x.n));
  // Tailles proportionnelles à l'échelle du tracé (fsOption) : à l'écran, de 1× à 2.4× le texte.
  const fsMin = Math.round(m.fsOption * (m.echelleEcran ? 1 : 0.95));
  const fsMax = Math.round(m.fsOption * (m.echelleEcran ? 2.4 : 2.1));
  const largMax = m.bw - m.pad * 2;
  const gapMot = Math.round(fsMin * 0.55);

  const tailles = mots.map((x, i) => {
    let t;
    if (maxN > 1) t = fsMin + (fsMax - fsMin) * Math.sqrt(x.n / maxN);
    else t = fsMin + (fsMax - fsMin) * (0.35 + 0.65 * (1 - i / Math.max(1, mots.length)));
    // Jamais plus large que le cadre : un mot long est réduit, pas coupé.
    const l = largeurTexte(x.mot, t, 700);
    return l > largMax ? Math.max(fsMin * 0.8, (t * largMax) / l) : t;
  });

  // Placement en lignes centrées, sans chevauchement.
  const lignes = [];
  let courante = [];
  let largeurCourante = 0;
  mots.forEach((x, i) => {
    const taille = tailles[i];
    const largeur = Math.min(largeurTexte(x.mot, taille, 700), largMax);
    const ajout = courante.length ? gapMot + largeur : largeur;
    if (courante.length && largeurCourante + ajout > largMax) {
      lignes.push({ mots: courante, largeur: largeurCourante });
      courante = [{ ...x, taille, largeur }];
      largeurCourante = largeur;
    } else {
      courante.push({ ...x, taille, largeur });
      largeurCourante += ajout;
    }
  });
  if (courante.length) lignes.push({ mots: courante, largeur: largeurCourante });

  const enfants = [];
  let y = m.pad + (m.echelleEcran ? 8 : compact ? 40 : 50);
  lignes.forEach((ligne) => {
    const hauteurLigne = Math.max(...ligne.mots.map((x) => x.taille)) * 1.06;
    y += hauteurLigne * 0.78;
    let x = (m.bw - ligne.largeur) / 2;
    ligne.mots.forEach((mot) => {
      const groupe = svg('g', {}, []);
      groupe.appendChild(svg('title', {}, [`${mot.mot} : ${nombreEntier(mot.n)} fois`]));
      groupe.appendChild(
        txt(x, y, mot.mot, {
          taille: mot.taille,
          graisse: 700,
          couleur: COULEURS.marine,
        }),
      );
      enfants.push(groupe);
      x += mot.largeur + gapMot;
    });
    y += hauteurLigne * 0.42 + (m.echelleEcran ? 6 : compact ? 12 : 16);
  });
  const hauteur = Math.max(m.echelleEcran ? 80 : compact ? 180 : 220, y + m.pad);

  return racineSvg(m.bw, hauteur, enfants, { ...opts, etiquette: opts.etiquette || 'Nuage de mots' });
}

// ─────────────────────────────────────────────────────────────
// Cartes de texte libre
// ─────────────────────────────────────────────────────────────
function rendreCartes(gabarit, res, opts) {
  const m = mesures(opts);
  const masques = opts.masques instanceof Set ? opts.masques : new Set(opts.masques || []);
  const toutes = Array.isArray(res.reponses) ? res.reponses : [];
  const visibles = toutes.filter((r) => !masques.has(String(r.cle)));
  if (!visibles.length) {
    return vide(toutes.length ? 'Réponses masquées' : 'Aucune réponse', opts);
  }

  const colonnes = m.compact ? 1 : visibles.length > 1 ? 2 : 1;
  const largeurCol = (m.bw - m.pad * 2 - (colonnes - 1) * m.pad) / colonnes;
  const padCarte = m.compact ? 16 : 24;
  const tailleTexte = m.fsCarte;
  const interligne = tailleTexte * 1.34;
  const yColonnes = new Array(colonnes).fill(m.pad);
  const enfants = [];
  const cartes = [];

  visibles.forEach((reponse, i) => {
    const col = i % colonnes;
    const lignes = enrouler(String(reponse.texte || ''), tailleTexte, largeurCol - padCarte * 2, 400, 7);
    const hauteurCarte = lignes.length * interligne + padCarte * 2;
    const x = m.pad + col * (largeurCol + m.pad);
    const y = yColonnes[col];
    yColonnes[col] = y + hauteurCarte + m.pad * 0.7;
    cartes.push({ x, y, hauteurCarte, lignes, cle: reponse.cle });
  });

  const hauteur = Math.max(...yColonnes) + m.pad * 0.3;
  cartes.forEach((carte) => {
    enfants.push(
      svg('rect', {
        x: carte.x,
        y: carte.y,
        width: largeurCol,
        height: carte.hauteurCarte,
        fill: COULEURS.fond,
        stroke: COULEURS.filet,
        'stroke-width': 2,
        rx: 10,
      }),
    );
    carte.lignes.forEach((ligne, i) => {
      enfants.push(
        txt(carte.x + padCarte, carte.y + padCarte + tailleTexte + i * interligne, ligne, {
          taille: tailleTexte,
        }),
      );
    });
  });

  if (masques.size) {
    const masquees = toutes.filter((r) => masques.has(String(r.cle))).length;
    if (masquees) {
      enfants.push(
        txt(m.bw - m.pad, hauteur + (m.compact ? 22 : 28), `${masquees} réponse${masquees > 1 ? 's' : ''} masquée${masquees > 1 ? 's' : ''}`, {
          taille: m.fsNote,
          ancre: 'end',
          couleur: COULEURS.encre,
        }),
      );
    }
  }

  return racineSvg(m.bw, hauteur + (masques.size ? 40 : 0), enfants, {
    ...opts,
    etiquette: opts.etiquette || 'Réponses libres',
  });
}

// ─────────────────────────────────────────────────────────────
// Classement : rangs moyens
// ─────────────────────────────────────────────────────────────
function rendreClassement(gabarit, res, opts) {
  const m = mesures(opts);
  const g = gabaritNormalise('classement', gabarit);
  const items = Array.isArray(g.items) ? g.items : [];
  const rangs = (Array.isArray(res.rangs) ? res.rangs : []).slice().sort((a, b) => Number(a.rang_moyen) - Number(b.rang_moyen));
  if (!rangs.length) return vide('Aucune réponse', opts);

  const maxRang = Math.max(...rangs.map((r) => Number(r.rang_moyen) || 1), items.length || rangs.length);
  const colValeur = m.fsChiffre * 4.2;
  const xBarre = m.pad;
  const largBarre = m.bw - m.pad * 2 - colValeur;
  const hauteur = m.pad + m.fsTitre * 2 + rangs.length * m.ligne + m.pad;
  const enfants = [
    txt(m.pad, m.pad + m.fsTitre * 0.9, 'Rang moyen — 1 = premier', {
      taille: m.fsTitre,
      graisse: 700,
    }),
  ];

  rangs.forEach((rang, i) => {
    const cle = String(rang.cle);
    const item = items.find((x) => String(x.cle) === cle);
    const libelle = item && item.texte ? item.texte : cle;
    const haut = m.pad + m.fsTitre * 1.9 + i * m.ligne;
    const valeur = Number(rang.rang_moyen) || 0;
    const part = Math.min(1, Math.max(0, valeur / maxRang));
    const groupe = svg('g', {}, []);
    groupe.appendChild(svg('title', {}, [`${libelle} : rang moyen ${nombreDecimal(valeur, 2)}`]));
    groupe.appendChild(
      txt(xBarre, haut + m.fsOption, couperTexte(libelle, m.fsOption, largBarre - m.pad), {
        taille: m.fsOption,
        graisse: 600,
      }),
    );
    groupe.appendChild(
      svg('rect', {
        x: xBarre,
        y: haut + m.fsOption + 10,
        width: largBarre,
        height: m.barreH - (m.compact ? 6 : 10),
        fill: COULEURS.fond,
        stroke: COULEURS.filet,
        'stroke-width': 2,
      }),
    );
    groupe.appendChild(
      svg('rect', {
        x: xBarre,
        y: haut + m.fsOption + 10,
        width: Math.max(4, (largBarre - 4) * part),
        height: m.barreH - (m.compact ? 6 : 10),
        fill: COULEURS.marine,
      }),
    );
    groupe.appendChild(
      txt(m.bw - m.pad, haut + m.fsOption + (m.barreH - (m.compact ? 6 : 10)) * 0.8, nombreDecimal(valeur, 2), {
        taille: m.fsChiffre,
        graisse: 600,
        ancre: 'end',
      }),
    );
    enfants.push(groupe);
  });

  return racineSvg(m.bw, hauteur, enfants, { ...opts, etiquette: opts.etiquette || 'Classement par rang moyen' });
}

// ─────────────────────────────────────────────────────────────
// Aiguillage public
// ─────────────────────────────────────────────────────────────
// opts : { compact, largeur, bonnes:[cles] (à ne fournir qu'à la révélation),
//         masques:[cles], etiquette }
export function rendreResultats(type, gabarit, resultats, opts = {}) {
  if (!resultats || !Number.isFinite(Number(resultats.n)) || Number(resultats.n) === 0) {
    return vide('Aucune réponse', opts);
  }
  const res = resultats;
  try {
    switch (type) {
      case 'choix':
      case 'multiple':
      case 'vraifaux':
        return rendreBarres(type, gabarit, res, opts);
      case 'echelle':
        return rendreHistogramme(type, gabarit, res, opts);
      case 'nombre':
        // Peu de valeurs distinctes, ou une bonne réponse connue : barres des valeurs
        // fréquentes (la bonne en vert à la révélation) ; sinon histogramme par classes.
        return Array.isArray(res.frequentes) && res.frequentes.length &&
          ((opts.bonnes && opts.bonnes.length) || (Number(res.distinctes) || 99) <= 5)
          ? rendreValeurs(gabarit, res, opts)
          : rendreHistogramme(type, gabarit, res, opts);
      case 'curseur':
        return rendreCurseur(gabarit, res, opts);
      case 'nuage':
        return rendreNuage(gabarit, res, opts);
      case 'texte':
        return rendreCartes(gabarit, res, opts);
      case 'classement':
        return rendreClassement(gabarit, res, opts);
      case 'serie':
        return rendreSerie(gabarit, res, opts);
      default:
        return vide('Type de résultats non pris en charge', opts);
    }
  } catch (err) {
    return vide('Résultats indisponibles', opts);
  }
}

// Série. Disposition commune avec le formulaire (dispositionSerie) :
// - « matrice » (dans une diapositive, énoncés imprimés à côté) : en-têtes Son 1… / a, b, c ;
// - « liste » (téléphone, navigateur, écran) : un bloc par colonne (titre + détail), une ligne
//   par sous-question : son nom en clair à gauche, les réponses à droite.
// Révélée (opts.bonnes fourni) : la bonne réponse en vert sur la première ligne, puis les trois
// mauvaises réponses les plus fréquentes en rouge. Avant : les trois plus fréquentes.
// opts.maReponse (étudiant) : sa réponse est marquée « vous » (ajoutée si hors des trois).
// Les types sans réponse courte (nuage, texte, classement…) gardent leur petit graphique.
export function dispositionSerie(g, enDiapo) {
  const matrice = (g.titres_colonnes || []).length > 0 || (g.titres_lignes || []).length > 0;
  return enDiapo && matrice ? 'matrice' : 'liste';
}

function lignesSousQuestion(sq, sous, mienne, revele) {
  const { type, ...gab } = sq;
  const fmtV = (v) => formaterNombre(v, { max: 3 });
  const unite = gab.unite ? ` ${gab.unite}` : '';
  let lignes = null;
  if (['choix', 'vraifaux'].includes(type)) {
    const bonnes = new Set((gab.bonnes || []).map(String));
    lignes = optionsDe(type, gab).map((o) => ({
      libelle: type === 'vraifaux' ? (o.cle === 'V' ? 'Vrai' : 'Faux') : o.cle,
      v: compteDe(sous && sous.comptes, o.cle),
      bonne: bonnes.has(o.cle),
      vous: mienne !== undefined && String(mienne) === o.cle,
    }));
  } else if (type === 'nombre') {
    const tol = Number(gab.tolerance) || 0;
    const bonnes = (gab.bonnes || []).map(Number);
    const estBonne = (v) => bonnes.some((b) => Math.abs(v - b) <= tol + 1e-9);
    lignes = (sous && Array.isArray(sous.frequentes) ? sous.frequentes : []).map((f) => ({
      libelle: fmtV(Number(f.valeur)) + unite,
      v: Number(f.n) || 0,
      bonne: estBonne(Number(f.valeur)),
      vous: mienne !== undefined && Number(mienne) === Number(f.valeur),
    }));
    if (bonnes.length && !lignes.some((l) => l.bonne)) lignes.push({ libelle: fmtV(bonnes[0]) + unite, v: 0, bonne: true, vous: false });
    if (mienne !== undefined && !lignes.some((l) => l.vous)) {
      lignes.push({ libelle: fmtV(Number(mienne)) + unite, v: 0, bonne: estBonne(Number(mienne)), vous: true, horsListe: true });
    }
  } else if (type === 'echelle' && sous && sous.comptes) {
    lignes = Object.entries(sous.comptes).map(([k, v]) => ({ libelle: k, v: Number(v) || 0, bonne: false, vous: String(mienne) === k }));
  }
  if (!lignes) return null;
  lignes.sort((a, b) => b.v - a.v);
  const corrige = revele && lignes.some((l) => l.bonne);
  let montrees;
  if (corrige) {
    const bonne = lignes.filter((l) => l.bonne).sort((a, b) => b.v - a.v)[0];
    const erreurs = lignes.filter((l) => !l.bonne && (l.v > 0 || l.vous));
    montrees = [bonne, ...erreurs.slice(0, 3)];
    const maLigne = erreurs.find((l) => l.vous);
    if (maLigne && !montrees.includes(maLigne)) montrees[montrees.length - 1] = maLigne;
  } else {
    montrees = lignes.filter((l) => l.v > 0 || l.vous).slice(0, 3);
  }
  return { montrees, corrige };
}

function rendreSerie(gabarit, res, opts) {
  const g = gabaritNormalise('serie', gabarit);
  const sousQ = g.questions || [];
  const colonnes = Math.max(1, Math.min(3, Number(g.colonnes) || 1));
  const nLignes = Math.ceil(sousQ.length / colonnes);
  const tCol = Array.isArray(g.titres_colonnes) ? g.titres_colonnes : [];
  const tLig = Array.isArray(g.titres_lignes) ? g.titres_lignes : [];
  const details = Array.isArray(g.details_colonnes) ? g.details_colonnes : [];
  const disposition = dispositionSerie(g, !!opts.enDiapo);
  const revele = opts.bonnes !== undefined;
  const pct = (v, n) => `${nombreEntier(n ? (100 * v) / n : 0)} %`;
  const mesReponses = opts.maReponse && typeof opts.maReponse === 'object' ? opts.maReponse : {};
  const nomDe = (sq, i) => sq.texte || tLig[i % nLignes] || sq.etiquette || sq.cle;

  // Réponses d'une sous-question : une ligne par valeur (valeur, %, « vous »).
  function valeurs(sq) {
    const sous = (res.parties || {})[sq.cle];
    const n = Number(sous && sous.n) || 0;
    const mienne = mesReponses[sq.cle];
    const { cle: _c, etiquette: _e, texte: _t, ...gab } = sq;
    const corps = element2('div', 'serie-graphique');
    const r = lignesSousQuestion(gab, sous, mienne, revele);
    if (!r) {
      const { type, ...sansType } = gab;
      corps.appendChild(rendreResultats(type, sansType, sous, { ...opts, maReponse: mienne, bonnes: revele ? gab.bonnes || [] : undefined, etiquette: `Question ${sq.cle}` }));
      return corps;
    }
    corps.classList.add('serie-valeurs');
    if (!r.montrees.length) corps.appendChild(element2('div', 'serie-ligne vide', '—'));
    for (const l of r.montrees) {
      const classe = r.corrige ? (l.bonne ? 'bonne' : 'faux') : '';
      const ligne = element2('div', `serie-ligne ${classe} ${l.vous ? 'est-vous' : ''}`.replace(/\s+/g, ' ').trim());
      ligne.append(
        element2('b', 'valeur', (r.corrige && l.bonne ? '✓ ' : '') + l.libelle),
        element2('span', 'part', l.horsListe ? '' : pct(l.v, n)),
      );
      if (l.vous) ligne.append(element2('span', 'vous', 'vous'));
      ligne.title = `${l.libelle} : ${pct(l.v, n)} (${nombreEntier(l.v)})${r.corrige && l.bonne ? ' — bonne réponse' : ''}`;
      corps.appendChild(ligne);
    }
    return corps;
  }

  const conteneur = document.createElement('div');
  conteneur.setAttribute('role', 'group');
  conteneur.setAttribute('aria-label', opts.etiquette || 'Résultats de la série');
  if (disposition === 'matrice') {
    conteneur.className = 'serie-resultats matrice';
    conteneur.style.setProperty('--cols', String(colonnes));
    conteneur.style.setProperty('--lignes', String(nLignes));
    for (let c = 0; c < colonnes; c++) {
      const t = element2('div', 'serie-titre-col', tCol[c] || '');
      t.style.gridRow = '1'; t.style.gridColumn = String(c + 2);
      conteneur.appendChild(t);
    }
    for (let r = 0; r < nLignes; r++) {
      const t = element2('div', 'serie-titre-lig', tLig[r] || '');
      t.style.gridRow = String(r + 2); t.style.gridColumn = '1';
      conteneur.appendChild(t);
    }
    sousQ.forEach((sq, i) => {
      const bloc = element2('div', 'serie-bloc');
      bloc.style.gridColumn = String(Math.floor(i / nLignes) + 2);
      bloc.style.gridRow = String((i % nLignes) + 2);
      bloc.appendChild(valeurs(sq));
      conteneur.appendChild(bloc);
    });
    return conteneur;
  }

  // Noms longs : nom au-dessus des réponses (même règle que le formulaire).
  const longs = sousQ.some((sq, k) => nomDe(sq, k).length > 26);
  conteneur.className = `serie-resultats liste ${longs ? 'empile' : 'cote-a-cote'}`;
  const groupes = tCol.length ? Array.from({ length: colonnes }, (_, c) => sousQ.slice(c * nLignes, (c + 1) * nLignes)) : [sousQ];
  let i = 0;
  groupes.forEach((membres, c) => {
    const groupe = element2('section', 'serie-groupe');
    if (tCol.length) {
      const tete = element2('div', 'serie-groupe-tete');
      tete.appendChild(element2('span', 'serie-groupe-titre', tCol[c] || ''));
      if (details[c]) tete.appendChild(element2('span', 'serie-groupe-detail', details[c]));
      groupe.appendChild(tete);
    }
    for (const sq of membres) {
      const rangee = element2('div', 'serie-rangee');
      const nom = element2('div', 'serie-libelle');
      if (!tCol.length && sq.etiquette) nom.appendChild(element2('span', 'serie-num', sq.etiquette));
      nom.appendChild(element2('span', 'serie-texte', nomDe(sq, i)));
      rangee.append(nom, valeurs(sq));
      groupe.appendChild(rangee);
      i += 1;
    }
    conteneur.appendChild(groupe);
  });
  return conteneur;
}

function element2(tag, classe, texte) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texte !== undefined) e.textContent = texte;
  return e;
}

// Remplace le contenu d'un conteneur par le graphique.
export function dessinerResultats(conteneur, type, gabarit, resultats, opts = {}) {
  if (!conteneur) return null;
  conteneur.replaceChildren();
  const dessin = rendreResultats(type, gabarit, resultats, opts);
  conteneur.appendChild(dessin);
  return dessin;
}
