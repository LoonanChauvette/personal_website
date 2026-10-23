// Écran de projection : aucune commande visible, raccourcis clavier, lancement par fragment.
import {
  apiEtat,
  apiEnseignant,
  apiResultats,
  messageErreur,
  lireCleEnseignant,
  garderCleEnseignant,
  urlSalle,
  adresseCourte,
  qrSvg,
  formaterDuree,
  nombreEntier,
  dessinerResultats,
  basculerPleinEcran,
  lireBanqueTexte,
} from './commun.js';
import { parserBanque, parserLancement } from './core.js';

const ui = {
  scene: document.getElementById('scene'),
  vueRepos: document.getElementById('vue-repos'),
  vueQuestion: document.getElementById('vue-question'),
  vueResultats: document.getElementById('vue-resultats'),
  qr: document.getElementById('qr'),
  qrCoin: document.getElementById('qr-coin'),
  adresse: document.getElementById('adresse'),
  appareils: document.getElementById('appareils'),
  texteQuestion: document.getElementById('texte-question'),
  nb: document.getElementById('nb-reponses'),
  unite: document.getElementById('unite-reponses'),
  etatQuestion: document.getElementById('etat-question'),
  minuteur: document.getElementById('minuteur'),
  texteResultats: document.getElementById('texte-resultats'),
  graphique: document.getElementById('graphique'),
  piedResultats: document.getElementById('pied-resultats'),
  aide: document.getElementById('aide'),
  toast: document.getElementById('toast'),
};

const params = new URLSearchParams(location.search);
let integre = params.get('integre') === '1';
let cle = lireCleEnseignant();
let etat = null;
let banque = { titre: '', questions: [] };
let signatureVue = null;
let signatureGraphique = null;
let vide = false;
let echecs = 0;
let enCours = false;
let deltaServeur = 0;
let aideVisible = false;
let boucleEtat = null;
let intervalleResultats = null;
let intervalleAppareils = null;
let minuterieToast = null;

if (integre) document.documentElement.classList.add('integre');

// ─────────────────────────────────────────────────────────────
// QR code et adresse
// ─────────────────────────────────────────────────────────────
function preparerQr() {
  const url = urlSalle();
  ui.adresse.textContent = adresseCourte();
  const grand = qrSvg(url, { cellSize: 10, margin: 2 });
  if (grand) ui.qr.appendChild(grand);
  const petit = qrSvg(url, { cellSize: 4, margin: 1 });
  if (petit) ui.qrCoin.appendChild(petit);
}

// ─────────────────────────────────────────────────────────────
// Affichage
// ─────────────────────────────────────────────────────────────
function afficherVue(nom) {
  ui.vueRepos.classList.toggle('actif', nom === 'repos');
  ui.vueQuestion.classList.toggle('actif', nom === 'question');
  ui.vueResultats.classList.toggle('actif', nom === 'resultats');
  // Le petit QR est un rappel pendant la question ; au repos, le grand suffit.
  ui.qrCoin.hidden = nom === 'repos';
}

function texteDans(conteneur, message) {
  conteneur.replaceChildren();
  const p = document.createElement('p');
  p.className = 'pied-resultats';
  p.textContent = message;
  conteneur.appendChild(p);
}

function rendreVue() {
  const q = etat && etat.question ? etat.question : null;
  signatureGraphique = null;
  vide = !q && integre;
  ui.scene.classList.toggle('vide', vide);

  if (!q) {
    afficherVue('repos');
    ui.texteQuestion.textContent = '';
    ui.etatQuestion.hidden = true;
    ui.graphique.replaceChildren();
    ui.texteResultats.textContent = '';
    ui.piedResultats.textContent = '';
    return;
  }

  const g = q.gabarit || {};

  if (q.statut === 'revelee') {
    afficherVue('resultats');
    ui.texteResultats.textContent = !g.masquer_texte && g.texte ? String(g.texte) : '';
    ui.texteResultats.hidden = !ui.texteResultats.textContent;
    ui.graphique.replaceChildren();
    ui.piedResultats.textContent = `${nombreEntier(q.nb_reponses || 0)} réponse${Number(q.nb_reponses) === 1 ? '' : 's'}`;
    if (q.resultats) dessinerGraphique(q.resultats, []);
    else if (cle) chargerResultats();
    else texteDans(ui.graphique, 'Résultats non publiés');
    return;
  }

  afficherVue('question');
  if (!g.masquer_texte && g.texte) {
    ui.texteQuestion.textContent = String(g.texte);
    ui.texteQuestion.hidden = false;
  } else {
    ui.texteQuestion.textContent = '';
    ui.texteQuestion.hidden = true;
  }
  ui.etatQuestion.hidden = q.statut !== 'fermee';
  ui.etatQuestion.textContent = q.statut === 'fermee' ? 'Question fermée' : '';
  ui.texteResultats.textContent = '';
  ui.graphique.replaceChildren();
  ui.piedResultats.textContent = '';
}

function majCompteur() {
  const q = etat && etat.question;
  if (!q) return;
  const n = Number(q.nb_reponses) || 0;
  ui.nb.textContent = nombreEntier(n);
  ui.unite.textContent = n === 1 ? 'réponse' : 'réponses';
}

function majChrono() {
  const q = etat && etat.question;
  if (!q || q.statut !== 'ouverte') {
    ui.minuteur.textContent = '';
    return;
  }
  const ouverture = Number(q.ouverte_a);
  if (!Number.isFinite(ouverture)) {
    ui.minuteur.textContent = '';
    return;
  }
  ui.minuteur.textContent = formaterDuree(Date.now() + deltaServeur - ouverture);
}

function appliquer(nouvelEtat) {
  etat = nouvelEtat;
  const serveur = Number(nouvelEtat && nouvelEtat.serveur_ms);
  deltaServeur = Number.isFinite(serveur) ? serveur - Date.now() : 0;
  const q = etat && etat.question ? etat.question : null;
  const sig = q
    ? [q.id, q.tour, q.statut, q.type, JSON.stringify(q.gabarit || {})].join('|')
    : 'repos';
  if (sig !== signatureVue) {
    signatureVue = sig;
    rendreVue();
  }
  majCompteur();
  majChrono();
}

// ─────────────────────────────────────────────────────────────
// Résultats
// ─────────────────────────────────────────────────────────────
function dessinerGraphique(resultats, masques) {
  const q = etat && etat.question;
  if (!q || !resultats) {
    if (q) texteDans(ui.graphique, 'Aucune réponse');
    return;
  }
  const sig = [q.id, q.tour, JSON.stringify(resultats), JSON.stringify(masques || [])].join('|');
  if (sig === signatureGraphique) return;
  signatureGraphique = sig;
  dessinerResultats(ui.graphique, q.type, q.gabarit, resultats, {
    bonnes: q.statut === 'revelee' ? (q.gabarit && q.gabarit.bonnes) || [] : [],
    masques: masques || [],
    etiquette: 'Résultats de la question',
  });
  const n = Number(resultats.n);
  if (Number.isFinite(n)) {
    ui.piedResultats.textContent = `${nombreEntier(n)} réponse${n === 1 ? '' : 's'}`;
  }
}

async function chargerResultats() {
  if (!cle || !etat || !etat.question || etat.question.statut !== 'revelee') return;
  try {
    const reponse = await apiResultats(cle);
    if (!etat || !etat.question || etat.question.statut !== 'revelee') return;
    if (reponse.resultats) dessinerGraphique(reponse.resultats, reponse.masques || []);
    else texteDans(ui.graphique, 'Aucune réponse');
  } catch (err) {
    if (err.statut === 401 || err.statut === 403) toast('Clé refusée — appuyez sur K.');
  }
}

async function chargerAppareils() {
  if (!cle || !etat || etat.question) return;
  try {
    const reponse = await apiResultats(cle);
    const n = Number(reponse.appareils_connectes);
    if (!Number.isFinite(n)) return;
    ui.appareils.textContent = `≈ ${nombreEntier(n)} appareil${n === 1 ? '' : 's'} connecté${n === 1 ? '' : 's'} (estimation)`;
    ui.appareils.hidden = false;
  } catch {
    /* compteur facultatif : on n'insiste pas */
  }
}

// ─────────────────────────────────────────────────────────────
// Boucles d'interrogation
// ─────────────────────────────────────────────────────────────
function gererBouclesAnnexes() {
  const q = etat && etat.question;
  const veutResultats = !!(cle && q && q.statut === 'revelee');
  if (veutResultats && !intervalleResultats) {
    intervalleResultats = setInterval(() => {
      chargerResultats();
    }, 1500);
  } else if (!veutResultats && intervalleResultats) {
    clearInterval(intervalleResultats);
    intervalleResultats = null;
  }

  const veutAppareils = !!(cle && !q);
  if (veutAppareils && !intervalleAppareils) {
    intervalleAppareils = setInterval(() => {
      chargerAppareils();
    }, 8000);
  } else if (!veutAppareils && intervalleAppareils) {
    clearInterval(intervalleAppareils);
    intervalleAppareils = null;
  }
}

function planifierEtat() {
  clearTimeout(boucleEtat);
  const q = etat && etat.question;
  const base = q ? 2000 : 4000;
  const delai = Math.min(15000, base * 2 ** Math.max(0, echecs));
  boucleEtat = setTimeout(rafraichir, delai);
}

async function rafraichir() {
  if (enCours) return;
  enCours = true;
  try {
    const nouvelEtat = await apiEtat();
    echecs = 0;
    appliquer(nouvelEtat);
  } catch {
    echecs += 1;
  } finally {
    enCours = false;
    planifierEtat();
    gererBouclesAnnexes();
  }
}

async function lireEtatMaintenant() {
  try {
    const nouvelEtat = await apiEtat();
    echecs = 0;
    appliquer(nouvelEtat);
    gererBouclesAnnexes();
    return true;
  } catch (err) {
    toast(messageErreur(err));
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// Messages discrets
// ─────────────────────────────────────────────────────────────
function toast(message) {
  ui.toast.textContent = message;
  ui.toast.hidden = false;
  clearTimeout(minuterieToast);
  minuterieToast = setTimeout(() => {
    ui.toast.hidden = true;
  }, 3500);
}

function afficherAide() {
  aideVisible = true;
  ui.aide.hidden = false;
}

function masquerAide() {
  aideVisible = false;
  ui.aide.hidden = true;
}

// ─────────────────────────────────────────────────────────────
// Clé enseignant
// ─────────────────────────────────────────────────────────────
function demanderCle() {
  if (integre) {
    toast('Clé enseignant requise — ouvrez /q/ecran.html pour la saisir.');
    return;
  }
  const saisie = window.prompt('Clé enseignant (gardée dans ce navigateur seulement) :');
  if (!saisie || !saisie.trim()) return;
  cle = saisie.trim();
  garderCleEnseignant(cle);
  toast('Clé enregistrée — raccourcis actifs.');
  lireEtatMaintenant();
}

function exigerCle() {
  if (cle) return true;
  toast('Lecture seule — appuyez sur K pour saisir la clé enseignant.');
  return false;
}

// ─────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────
async function agir(op, corps = {}) {
  if (!exigerCle()) return false;
  try {
    await apiEnseignant(op, corps, cle);
    await lireEtatMaintenant();
    return true;
  } catch (err) {
    if (err.statut === 401 || err.statut === 403) toast('Clé refusée — appuyez sur K pour la corriger.');
    else toast(messageErreur(err));
    return false;
  }
}

const LANCEMENTS = {
  a: 'choix:4',
  b: 'choix:2',
  v: 'vraifaux',
  e: 'echelle:1..5',
  c: 'curseur',
  n: 'nombre',
  m: 'nuage',
  t: 'texte',
};

async function lancerRapide(touche) {
  const chaine = LANCEMENTS[touche];
  if (!chaine) return;
  const spec = parserLancement(chaine) || { type: chaine.split(':')[0] };
  await agir('lancer', { type: spec.type, gabarit: spec.gabarit || undefined });
}

async function lancerLettres(nombre) {
  const actuel = etat && etat.question ? etat.question : null;
  const type = actuel && (actuel.type === 'choix' || actuel.type === 'multiple') ? actuel.type : 'choix';
  const spec = parserLancement(`${type}:${nombre}`) || { type };
  await agir('lancer', { type: spec.type, gabarit: spec.gabarit || undefined });
}

async function lancerBanque(entree) {
  if (!entree) return;
  await agir('lancer', { id: entree.id, type: entree.type, gabarit: entree.gabarit });
}

async function entree() {
  const q = etat && etat.question;
  if (!q) return;
  if (q.statut === 'ouverte') {
    await agir('fermer');
    return;
  }
  if (q.statut === 'fermee') {
    await agir('reveler');
  }
}

async function retourQr() {
  if (!etat || !etat.question) return;
  if (!exigerCle()) return;
  etat = { ...(etat || {}), question: null };
  signatureVue = null;
  rendreVue();
  gererBouclesAnnexes();
  try {
    await apiEnseignant('effacer', {}, cle);
  } catch {
    /* l'état suivant tranchera */
  }
  await lireEtatMaintenant();
}

async function pasDeBanque(pas) {
  if (!banque.questions.length) {
    toast('Aucune banque chargée — ouvrez /q/ecran.html?banque=/q/banques/cours7.md');
    return;
  }
  const q = etat && etat.question;
  let index = q ? banque.questions.findIndex((x) => x.id === q.id) : -1;
  if (index === -1) index = pas > 0 ? -1 : banque.questions.length;
  const suivant = banque.questions[(index + pas + banque.questions.length) % banque.questions.length];
  await lancerBanque(suivant);
}

async function lancerCible(cible) {
  const entree = banque.questions.find((q) => q.id === cible);
  if (entree) {
    await lancerBanque(entree);
    return true;
  }
  const spec = parserLancement(cible);
  if (spec) {
    await agir('lancer', { type: spec.type, gabarit: spec.gabarit || undefined });
    return true;
  }
  toast(`Lancement inconnu : ${cible}`);
  return false;
}

// Lancement par fragment (#lancer=…). Le fragment est retiré de l'URL pour que
// le lien de la diapositive reste réutilisable et qu'un rechargement ne relance
// pas la question. Un changement de fragment seul ne recharge pas la page :
// on écoute donc aussi « hashchange » (écran déjà ouvert, clic sur la diapositive).
async function declencherCible(cible) {
  if (!cle) {
    if (integre) {
      toast('Clé enseignant requise pour lancer depuis une diapositive.');
      return;
    }
    demanderCle();
    if (!cle) return;
  }
  await lancerCible(cible);
}

function retirerFragment() {
  history.replaceState(null, '', location.pathname + location.search);
  // Filet de sécurité : juste après un changement de fragment, certains
  // navigateurs réappliquent l'URL ; on la nettoie une seconde fois.
  setTimeout(() => {
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }, 80);
}

function traiterFragment() {
  const hash = location.hash.replace(/^#/, '');
  if (!hash) return;
  const fragment = new URLSearchParams(hash);
  const cible = fragment.get('lancer');
  if (!cible) return;
  retirerFragment();
  if (integre) {
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entreeObservee of entrees) {
          if (entreeObservee.isIntersecting && entreeObservee.intersectionRatio >= 0.25) {
            observateur.disconnect();
            declencherCible(cible);
            break;
          }
        }
      },
      { threshold: [0, 0.25, 0.5] },
    );
    observateur.observe(ui.scene);
  } else {
    declencherCible(cible);
  }
}

// ─────────────────────────────────────────────────────────────
// Banque de questions
// ─────────────────────────────────────────────────────────────
async function chargerBanque(url) {
  let markdown = '';
  if (url) {
    try {
      const reponse = await fetch(url, { cache: 'no-store' });
      if (reponse.ok) markdown = await reponse.text();
      else toast(`Banque inaccessible (${reponse.status}).`);
    } catch {
      toast('Banque inaccessible — vérifiez l’adresse.');
    }
  }
  if (!markdown) markdown = lireBanqueTexte();
  if (!markdown) return;
  try {
    banque = parserBanque(markdown);
  } catch (err) {
    banque = { titre: '', questions: [] };
    toast(`Banque illisible : ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────
// Clavier
// ─────────────────────────────────────────────────────────────
document.addEventListener('keydown', (ev) => {
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
  const touche = ev.key;
  const bas = touche.length === 1 ? touche.toLowerCase() : touche;

  if (aideVisible) {
    ev.preventDefault();
    masquerAide();
    return;
  }

  if (bas === 'f') {
    ev.preventDefault();
    basculerPleinEcran();
    return;
  }
  if (touche === '?' || bas === '?') {
    ev.preventDefault();
    afficherAide();
    return;
  }
  if (bas === 'k') {
    ev.preventDefault();
    demanderCle();
    return;
  }
  if (touche === 'Enter') {
    ev.preventDefault();
    entree();
    return;
  }
  if (touche === 'Escape') {
    ev.preventDefault();
    retourQr();
    return;
  }
  if (bas === 'r') {
    ev.preventDefault();
    agir('relancer');
    return;
  }
  if (touche === 'ArrowRight' || touche === 'ArrowLeft') {
    ev.preventDefault();
    pasDeBanque(touche === 'ArrowRight' ? 1 : -1);
    return;
  }
  if (/^[1-6]$/.test(touche)) {
    ev.preventDefault();
    lancerLettres(Number(touche));
    return;
  }
  if (Object.prototype.hasOwnProperty.call(LANCEMENTS, bas)) {
    ev.preventDefault();
    lancerRapide(bas);
  }
});

// ─────────────────────────────────────────────────────────────
// Démarrage
// ─────────────────────────────────────────────────────────────
async function demarrer() {
  preparerQr();

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) rafraichir();
  });
  window.addEventListener('hashchange', () => {
    traiterFragment();
  });

  await chargerBanque(params.get('banque'));
  await rafraichir();

  // Fragment présent au chargement : lancement automatique.
  traiterFragment();

  if (!vide && cle) chargerAppareils();
  gererBouclesAnnexes();
  setInterval(majChrono, 500);
}

demarrer();
