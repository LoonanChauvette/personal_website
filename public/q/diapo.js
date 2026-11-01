// Diapositive de sondage dans Excalidraw+ (élément HTML, document srcdoc, origine « null »).
//
// Le document hôte, produit par /admin, fournit :
//   <base href="https://SITE/q/">   → modules et API résolus sur le site
//   <script type="application/json" id="question">{id, type, gabarit, jeton, role}</script>
//   <main id="diapo"></main>
//
// Deux rôles, une paire de diapositives par question :
//   role "question"  : en s'affichant, ouvre la question (si elle n'a encore ni
//                      réponse ni révélation dans la séance), puis compte les réponses.
//   role "resultats" : en s'affichant, ferme et révèle la question, puis trace le graphique.
// L'enseignant n'a donc qu'à avancer avec → dans Excalidraw+.
//
// Garde-fous :
//   - le jeton ne permet que lancer / fermer / révéler / relancer CETTE question ;
//   - il ne marche que pendant un cours démarré depuis /admin (sinon 423, rien ne bouge) ;
//   - aucune action tant que la diapositive n'est pas réellement affichée
//     (Excalidraw masque l'élément hors écran : la fenêtre du document passe à 0 × 0).
import {
  apiEtat,
  apiEnseignant,
  apiGarde,
  apiEffacerGarde,
  messageErreur,
  dessinerResultats,
  nombreEntier,
  formaterDuree,
  adresseCourte,
  urlSalle,
  qrSvg,
} from './commun.js';
import { etapesPaires } from './core.js';

const conf = JSON.parse(document.getElementById('question').textContent);
const Q = { id: String(conf.id), type: conf.type, gabarit: conf.gabarit || {} };
// « unique » : une seule diapositive par question. Elle ouvre la question à
// l'affichage ; le bouton Révéler la ferme et trace le graphique à la même place.
const ROLE = ['resultats', 'unique'].includes(conf.role) ? conf.role : 'question';
const jeton = conf.jeton;
// Sans jeton (deck des étudiants) : lecture seule. La diapositive n'ouvre, ne
// ferme et ne révèle rien ; elle affiche le graphique une fois révélé.
const LECTURE = !(typeof jeton === 'string' && jeton);
const DELAI_AFFICHAGE_MS = 700; // la diapositive doit rester affichée un instant

const racine = document.getElementById('diapo');
const afficherQr = conf.qr !== false;
racine.className = `diapo role-${ROLE}`;
racine.innerHTML = `
  <section class="corps" id="corps" aria-live="polite"></section>
  <footer class="pied">
    ${afficherQr ? '<span class="qr" id="qr" aria-hidden="true"></span><span class="adresse" id="adresse"></span>' : ''}
    <p class="statut" id="statut" role="status"></p>
    <button type="button" id="effacer" class="discret" hidden>Effacer</button>
    <button type="button" id="action" hidden></button>
  </footer>`;

const ui = {
  corps: document.getElementById('corps'),
  statut: document.getElementById('statut'),
  action: document.getElementById('action'),
  effacer: document.getElementById('effacer'),
};
if (afficherQr) {
  document.getElementById('adresse').textContent = adresseCourte();
  const qr = qrSvg(urlSalle(), { cellSize: 3, margin: 1 });
  if (qr) document.getElementById('qr').appendChild(qr);
}

let etat = null;
let signature = null;
let echecs = 0;
let occupe = false;
let minuterie = null;
let deltaServeur = 0;
let affichee = false;
let minuterieAffichage = null;
let dejaAgi = false; // une action automatique par apparition de la diapositive
let blocage = null; // message d'un refus (cours non démarré…)
let garde = null; // dernier résultat révélé de cette question, gardé par le serveur
let confirmerEffacer = false;

// ─── Visibilité ────────────────────────────────────────────────────────────
function estAffichee() {
  return !document.hidden && window.innerWidth > 0 && window.innerHeight > 0;
}

function surVisibilite() {
  const maintenant = estAffichee();
  if (maintenant === affichee) return;
  affichee = maintenant;
  clearTimeout(minuterieAffichage);
  if (!affichee) {
    dejaAgi = false;
    if (PAIRES) arreterLecture();
    return;
  }
  interroger();
  minuterieAffichage = setTimeout(() => {
    if (estAffichee()) agirAutomatiquement();
  }, DELAI_AFFICHAGE_MS);
}

// ─── Vue ───────────────────────────────────────────────────────────────────
function el(nom, classe, texte) {
  const e = document.createElement(nom);
  if (classe) e.className = classe;
  if (texte !== undefined) e.textContent = texte;
  return e;
}

function phase() {
  const q = etat && etat.question;
  if (!q || q.id !== Q.id) {
    // Rien en direct pour cette question : son dernier résultat révélé, s'il existe.
    if (garde && garde.resultats) return { nom: 'gardee', q: { ...garde, statut: 'revelee', nb_reponses: garde.resultats.n }, autre: q ? q.id : null };
    return { nom: 'repos', autre: q ? q.id : null };
  }
  return { nom: q.statut, q };
}

function rendreVue() {
  const p = phase();
  const q = p.q;
  const sig = [ROLE, p.nom, p.autre, q?.tour, q?.statut === 'revelee' ? JSON.stringify(q.resultats) : '', blocage, confirmerEffacer,
    PAIRES ? q?.etape : ''].join('|');
  if (sig === signature) return majDynamique();
  signature = sig;
  ui.corps.replaceChildren();
  ui.corps.className = 'corps';
  bouton(null);
  racine.classList.toggle('paires-ouverte', PAIRES && p.nom === 'ouverte');
  // « Effacer » : seulement sur la diapositive enseignant, quand un résultat est affiché.
  ui.effacer.hidden = LECTURE || !(p.nom === 'revelee' || p.nom === 'gardee');
  ui.effacer.textContent = confirmerEffacer ? 'Confirmer l’effacement' : 'Effacer';
  ui.effacer.classList.toggle('confirmer', confirmerEffacer);

  if (ROLE === 'unique') {
    racine.classList.toggle('revele', p.nom === 'revelee' || p.nom === 'gardee');
    if (p.nom === 'gardee') {
      tracerGraphique(q);
      const n = Number(q.nb_reponses) || 0;
      ui.statut.textContent = blocage || `${nombreEntier(n)} réponse${n === 1 ? '' : 's'} · ${dateCourte(garde.revele_a)}`;
      majDynamique();
      return;
    }
    if (PAIRES && p.nom === 'ouverte') {
      rendrePaires(q);
    } else if (p.nom === 'ouverte' || p.nom === 'fermee') {
      const bloc = el('div', 'compteur');
      bloc.append(el('span', 'nombre', '0'), el('span', 'unite', 'réponses'));
      ui.corps.append(bloc, el('p', 'chrono', ''));
      ui.statut.textContent = blocage || (p.nom === 'ouverte' ? '' : 'Question fermée');
      bouton('Révéler', 'reveler');
    } else if (p.nom === 'revelee') {
      tracerGraphique(q);
      const n = Number(q.nb_reponses) || 0;
      ui.statut.textContent = `${nombreEntier(n)} réponse${n === 1 ? '' : 's'}`;
      bouton('Relancer', 'relancer', true);
    } else {
      ui.corps.append(el('p', 'grand', 'Question prête'));
      ui.statut.textContent = blocage || '';
      bouton('Lancer', 'lancer');
    }
  } else if (ROLE === 'question') {
    if (p.nom === 'ouverte' || p.nom === 'fermee') {
      const bloc = el('div', 'compteur');
      bloc.append(el('span', 'nombre', '0'), el('span', 'unite', 'réponses'));
      ui.corps.append(bloc, el('p', 'chrono', ''));
      ui.statut.textContent = p.nom === 'ouverte' ? 'Répondez sur votre téléphone' : 'Question fermée';
    } else if (p.nom === 'revelee') {
      ui.corps.append(el('p', 'grand', 'Résultats révélés'));
      ui.statut.textContent = 'Diapositive suivante : les résultats';
      bouton('Relancer', 'relancer');
    } else {
      ui.corps.append(el('p', 'grand', 'Question prête'));
      ui.statut.textContent = blocage || 'Elle s’ouvre à l’affichage de la diapositive';
      bouton('Lancer', 'lancer');
    }
  } else if (p.nom === 'revelee' || p.nom === 'gardee') {
    tracerGraphique(q);
    const n = Number(q.nb_reponses) || 0;
    ui.statut.textContent = `${nombreEntier(n)} réponse${n === 1 ? '' : 's'}`;
  } else if (p.nom === 'ouverte' || p.nom === 'fermee') {
    ui.corps.append(el('p', 'grand', LECTURE ? 'Résultats à venir' : 'Révélation…'));
    ui.statut.textContent = blocage || '';
    bouton('Révéler', 'reveler');
  } else {
    ui.corps.append(el('p', 'grand', LECTURE ? 'Résultats à venir' : 'Résultats non disponibles'));
    ui.statut.textContent =
      blocage || (LECTURE ? '' : p.autre ? 'Une autre question est en cours.' : 'Cette question n’a pas été posée.');
  }
  majDynamique();
}

function dateCourte(ms) {
  const d = new Date(Number(ms));
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' }) : '';
}

function tracerGraphique(q) {
  const zone = el('div', 'graphique');
  ui.corps.appendChild(zone);
  if (!q.resultats) return;
  // Les libellés des options sont sur la diapositive : les lettres suffisent.
  const gabarit = Array.isArray(q.gabarit?.options)
    ? { ...q.gabarit, options: q.gabarit.options.map((o) => ({ ...o, texte: '' })) }
    : q.gabarit;
  dessinerResultats(zone, q.type, gabarit, q.resultats, {
    compact: true,
    enDiapo: true,
    bonnes: (q.gabarit && q.gabarit.bonnes) || [],
    etiquette: 'Résultats de la question',
  });
}

function majDynamique() {
  const q = phase().q;
  if (!q) return;
  const nombre = ui.corps.querySelector('.nombre');
  if (nombre) {
    // Paires : réponses à la paire en cours (pas au total de la question).
    const n = Number(PAIRES && q.statut === 'ouverte' ? q.nb_etape : q.nb_reponses) || 0;
    nombre.textContent = nombreEntier(n);
    ui.corps.querySelector('.unite').textContent = n === 1 ? 'réponse' : 'réponses';
  }
  const chrono = ui.corps.querySelector('.chrono');
  if (chrono) {
    const debut = Number(q.ouverte_a);
    chrono.textContent = q.statut === 'ouverte' && Number.isFinite(debut) ? formaterDuree(Date.now() + deltaServeur - debut) : '';
  }
}

// ─── Paires : l'enseignant fait entendre chaque paire, les téléphones la notent ───────
// L'ordre (tiré au lancement) vient de l'état du serveur, jamais de Q.gabarit. Le son ne part
// que d'un clic sur Écouter ou Suivante (geste requis par le navigateur), et seulement une
// fois l'étape acceptée par le serveur : un passage refusé ne fait jamais entendre une autre
// paire que celle que notent les téléphones.
const PAIRES = Q.type === 'paires';
const sons = new Map();
let lecture = { jeton: 0, etat: null, erreur: null, annuler: null };

function audioDe(cle) {
  if (!sons.has(cle)) {
    const son = (Q.gabarit.sons || []).find((s) => s.cle === cle);
    const a = new Audio(son ? new URL(son.fichier, document.baseURI).href : '');
    a.preload = 'auto';
    sons.set(cle, a);
  }
  return sons.get(cle);
}
if (PAIRES) for (const s of Q.gabarit.sons || []) audioDe(s.cle);

function arreterLecture() {
  lecture.jeton += 1;
  // Un son mis en pause ne déclenche jamais « ended » : la lecture en attente est close ici.
  if (lecture.annuler) lecture.annuler();
  lecture.annuler = null;
  for (const a of sons.values()) {
    a.pause();
    a.currentTime = 0;
  }
  lecture.etat = null;
}

function jouerSon(a) {
  return new Promise((fin, echec) => {
    const finir = () => {
      a.removeEventListener('ended', finir);
      a.removeEventListener('error', rater);
      lecture.annuler = null;
      fin();
    };
    lecture.annuler = finir;
    const rater = () => {
      a.removeEventListener('ended', finir);
      a.removeEventListener('error', rater);
      echec(new Error('Son introuvable'));
    };
    a.addEventListener('ended', finir);
    a.addEventListener('error', rater);
    a.currentTime = 0;
    a.play().catch((e) => {
      a.removeEventListener('ended', finir);
      a.removeEventListener('error', rater);
      echec(e);
    });
  });
}

async function jouerEtape(etape, gabarit) {
  arreterLecture();
  const jeton = lecture.jeton;
  lecture.erreur = null;
  const pause = Number.isFinite(Number(gabarit.pause_ms)) ? Number(gabarit.pause_ms) : 500;
  try {
    lecture.etat = 1;
    majLecture();
    await jouerSon(audioDe(etape.a));
    if (jeton !== lecture.jeton) return;
    lecture.etat = 'pause';
    majLecture();
    await new Promise((r) => setTimeout(r, pause));
    if (jeton !== lecture.jeton) return;
    lecture.etat = 2;
    majLecture();
    await jouerSon(audioDe(etape.b));
    if (jeton !== lecture.jeton) return;
    lecture.etat = null;
  } catch (err) {
    if (jeton !== lecture.jeton) return;
    lecture.etat = null;
    lecture.erreur = err && err.name === 'NotAllowedError' ? 'Lecture refusée : cliquez Écouter' : 'Son introuvable';
  }
  majLecture();
}

function majLecture() {
  const zone = ui.corps.querySelector('.lecture');
  if (!zone) return;
  for (const n of [1, 2]) zone.querySelector(`[data-son="${n}"]`)?.classList.toggle('actif', lecture.etat === n);
  const ecouter = ui.corps.querySelector('[data-paires="ecouter"]');
  if (ecouter) ecouter.textContent = lecture.etat ? 'Arrêter' : 'Écouter';
  if (lecture.erreur) {
    ui.statut.textContent = lecture.erreur;
    ui.statut.classList.add('erreur');
  }
}

function rendrePaires(q) {
  const etapes = etapesPaires(q.gabarit || {});
  const n = Number(q.etape) || 0;
  const etape = etapes[n];
  if (!etape) return;
  ui.corps.classList.add('paires');
  ui.corps.append(el('p', `paires-titre${etape.essai ? ' essai' : ''}`,
    etape.essai ? `Entraînement ${etape.numero} sur ${etape.total}` : `Paire ${etape.numero} sur ${etape.total}`));
  if (etape.essai) {
    ui.corps.append(el('p', 'paires-note', 'Réponses non enregistrées'));
  } else {
    const bloc = el('div', 'compteur');
    bloc.append(el('span', 'nombre', '0'), el('span', 'unite', 'réponses'));
    ui.corps.append(bloc);
  }
  const lect = el('p', 'lecture');
  lect.append(el('span', 'son', 'Son 1'), el('span', 'fleche', '→'), el('span', 'son', 'Son 2'));
  lect.children[0].dataset.son = '1';
  lect.children[2].dataset.son = '2';
  ui.corps.append(lect);
  if (!LECTURE) {
    const cmd = el('div', 'commandes');
    const derniere = n === etapes.length - 1;
    const precedente = el('button', 'discret', '◀');
    precedente.type = 'button';
    precedente.dataset.paires = 'precedente';
    precedente.disabled = n === 0;
    precedente.title = 'Étape précédente';
    const ecouter = el('button', null, 'Écouter');
    ecouter.type = 'button';
    ecouter.dataset.paires = 'ecouter';
    const suivante = el('button', 'principal', derniere ? 'Terminer' : etapes[n + 1].essai || etape.essai === etapes[n + 1].essai ? 'Suivante' : 'Commencer');
    suivante.type = 'button';
    suivante.dataset.paires = derniere ? 'terminer' : 'suivante';
    cmd.append(precedente, ecouter, suivante);
    ui.corps.append(cmd);
  }
  ui.statut.textContent = blocage || (etape.essai ? 'Entraînement' : '');
  majLecture();
}

async function agirPaires(action) {
  const q = etat && etat.question;
  if (!q || q.id !== Q.id || q.statut !== 'ouverte' || occupe) return;
  const etapes = etapesPaires(q.gabarit || {});
  const n = Number(q.etape) || 0;
  if (action === 'ecouter') {
    if (lecture.etat) {
      arreterLecture();
      majLecture();
    } else jouerEtape(etapes[n], q.gabarit);
    return;
  }
  occupe = true;
  for (const b of ui.corps.querySelectorAll('button')) b.disabled = true;
  try {
    arreterLecture();
    if (action === 'terminer') {
      if (await envoyer('fermer')) await envoyer('reveler');
    } else {
      const cible = action === 'precedente' ? Math.max(0, n - 1) : Math.min(etapes.length - 1, n + 1);
      // Le son ne part qu'une fois l'étape acceptée : téléphones et salle entendent la même paire.
      if (await envoyer('etape', { etape: cible })) {
        const nouvelle = etat?.question?.id === Q.id ? etapesPaires(etat.question.gabarit || {})[Number(etat.question.etape) || 0] : null;
        if (nouvelle && action === 'suivante') jouerEtape(nouvelle, etat.question.gabarit);
      }
    }
  } finally {
    occupe = false;
    signature = null;
    rendreVue();
  }
}

ui.corps.addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-paires]');
  if (b && !b.disabled) agirPaires(b.dataset.paires);
});

// Bouton de secours : cliquable dans l'éditeur (et en présentation si Excalidraw+ le permet).
function bouton(texte, op, discret = false) {
  if (LECTURE) texte = null;
  ui.action.classList.toggle('discret', discret);
  ui.action.hidden = !texte;
  ui.action.textContent = texte || '';
  ui.action.dataset.op = op || '';
}

// ─── Réseau ────────────────────────────────────────────────────────────────
function appliquer(nouvel) {
  if (!nouvel || !('question' in nouvel)) return;
  etat = nouvel;
  const s = Number(nouvel.serveur_ms);
  deltaServeur = Number.isFinite(s) ? s - Date.now() : 0;
  ui.statut.classList.remove('erreur');
  rendreVue();
}

function delai() {
  // Hors écran : l'affichage de la diapositive (resize) relance l'interrogation.
  if (!estAffichee()) return 300000;
  const n = phase().nom;
  return Math.min(15000, (n === 'ouverte' || n === 'fermee' ? 2000 : 5000) * 2 ** echecs);
}

async function lireGarde() {
  try {
    const r = await apiGarde(Q.id);
    garde = r && r.garde ? r.garde : null;
  } catch {
    /* sans résultat gardé, la diapositive reste utilisable */
  }
}

async function interroger() {
  clearTimeout(minuterie);
  try {
    const [e] = await Promise.all([apiEtat(), lireGarde()]);
    appliquer(e);
    echecs = 0;
  } catch {
    echecs = Math.min(echecs + 1, 3);
    ui.statut.textContent = 'Hors ligne — nouvel essai…';
    ui.statut.classList.add('erreur');
  }
  minuterie = setTimeout(interroger, delai());
}

async function envoyer(op, corps = {}) {
  try {
    appliquer(await apiEnseignant(op, corps, jeton));
    blocage = null;
    // La phase vient de changer (ouverte…) : l'interrogation reprend à son rythme.
    clearTimeout(minuterie);
    minuterie = setTimeout(interroger, delai());
    return true;
  } catch (err) {
    if (err && err.statut === 423) blocage = 'Cours non démarré : /admin';
    else if (err && err.statut === 403) blocage = 'Diapositive périmée : régénérez-la depuis /admin';
    else blocage = messageErreur(err);
    signature = null;
    rendreVue();
    return false;
  }
}

async function agir(op) {
  if (!op || occupe) return;
  occupe = true;
  ui.action.disabled = true;
  try {
    if (op === 'lancer') await envoyer('lancer', { id: Q.id, type: Q.type, gabarit: Q.gabarit });
    else if (op === 'reveler') {
      if (phase().nom === 'ouverte') await envoyer('fermer');
      await envoyer('reveler');
    } else await envoyer(op);
  } finally {
    occupe = false;
    ui.action.disabled = false;
  }
}

// À l'affichage : la diapositive « question » ouvre, la diapositive « résultats » révèle.
async function agirAutomatiquement() {
  if (LECTURE || dejaAgi || occupe) return;
  dejaAgi = true;
  occupe = true;
  try {
    if (!etat) appliquer(await apiEtat());
    const p = phase();
    if (ROLE === 'question' || ROLE === 'unique') {
      if (p.nom === 'repos' && !garde) await envoyer('lancer', { id: Q.id, type: Q.type, gabarit: Q.gabarit, si_nouveau: true });
    } else if (p.nom === 'ouverte') {
      if (await envoyer('fermer')) await envoyer('reveler');
    } else if (p.nom === 'fermee') {
      await envoyer('reveler');
    }
  } catch {
    /* l'interrogation suivante réessaie l'affichage */
  } finally {
    occupe = false;
  }
}

ui.action.addEventListener('click', () => agir(ui.action.dataset.op));
// Effacer en deux clics : le résultat gardé disparaît, la diapositive redevient prête.
ui.effacer.addEventListener('click', async () => {
  if (!confirmerEffacer) {
    confirmerEffacer = true;
    signature = null;
    rendreVue();
    setTimeout(() => {
      if (confirmerEffacer) {
        confirmerEffacer = false;
        signature = null;
        rendreVue();
      }
    }, 4000);
    return;
  }
  confirmerEffacer = false;
  try {
    const r = await apiEffacerGarde({ id: Q.id }, jeton);
    garde = null;
    blocage = null;
    if (r && 'question' in r) appliquer(r);
    else interroger();
  } catch (err) {
    blocage = err && err.statut === 423 ? 'Cours non démarré : /admin' : messageErreur(err);
  }
  signature = null;
  rendreVue();
});
document.addEventListener('visibilitychange', surVisibilite);
window.addEventListener('resize', surVisibilite);
setInterval(majDynamique, 1000);

rendreVue();
surVisibilite();
interroger();
