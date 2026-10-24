// Page étudiante : un seul écran, un seul gabarit à la fois, états écrits en clair.
import {
  apiEtat,
  apiPresence,
  apiRepondre,
  appareil,
  messageErreur,
  optionsDe,
  formaterReponse,
  lireReponseLocale,
  garderReponseLocale,
  dessinerResultats,
  echapper,
} from './commun.js';

const ui = {
  connexion: document.getElementById('connexion'),
  texte: document.getElementById('texte'),
  etat: document.getElementById('etat'),
  maReponse: document.getElementById('ma-reponse'),
  reessai: document.getElementById('reessai'),
  boutonReessai: document.getElementById('btn-reessai'),
  zone: document.getElementById('zone'),
  resultats: document.getElementById('resultats'),
};

const DELAI_VISIBLE = 2000;
const DELAI_CACHE = 10000;
const PLAFOND = 15000;

let seance = null;
let question = null;
let signature = null;
let questionPrecedente = null;
let reponseLocale = null;
let messageLocal = null;
let erreurLocale = null;
let minuterieErreur = null;
let essaiEnvoi = null;
let envoiEnCours = false;
let minuterie = null;
let echecs = 0;
let signatureResultats = null;

// Intégrée dans une planche (?integre=1) : sans pied de page, fond transparent.
// Avec ?question=q18, le cadre ne répond qu'à cette question : un étudiant resté
// sur une ancienne diapositive ne répond pas par erreur à la question en cours.
const parametres = new URLSearchParams(location.search);
const integre = parametres.get('integre') === '1';
const questionCible = integre ? (parametres.get('question') || '').trim() || null : null;
if (integre) document.documentElement.classList.add('integre');
// Cadre hors écran (autre diapositive) : on n'interroge pas le serveur.
let visible = true;
if (integre && 'IntersectionObserver' in window) {
  new IntersectionObserver((entrees) => {
    const avant = visible;
    visible = entrees.some((e) => e.isIntersecting);
    if (visible && !avant) {
      clearTimeout(minuterie);
      interroger();
    }
  }).observe(document.documentElement);
}

// ─── Petites fabriques DOM ───
function element(tag, classe, contenu) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (contenu !== undefined && contenu !== null) e.textContent = contenu;
  return e;
}

function ecrireEtat(texte, options = {}) {
  ui.etat.textContent = texte;
  ui.etat.classList.toggle('erreur', !!options.erreur);
}

function signalerErreur(texte) {
  erreurLocale = texte;
  ecrireEtat(texte, { erreur: true });
  clearTimeout(minuterieErreur);
  minuterieErreur = setTimeout(() => {
    erreurLocale = null;
    majStatut();
  }, 4000);
}

function estOuverte() {
  return !!(question && question.statut === 'ouverte');
}

function consigne(type) {
  switch (type) {
    case 'choix':
      return 'Touchez une lettre.';
    case 'multiple':
      return 'Touchez vos choix, puis Envoyer.';
    case 'vraifaux':
      return 'Touchez Vrai ou Faux.';
    case 'echelle':
      return 'Touchez la valeur qui convient.';
    case 'curseur':
      return 'Touchez la piste ou la poignée, puis ajustez.';
    case 'nombre':
      return 'Entrez un nombre, puis Envoyer.';
    case 'nuage':
      return 'Un ou deux mots, puis Envoyer.';
    case 'texte':
      return 'Écrivez votre réponse, puis Envoyer.';
    case 'classement':
      return 'Placez les éléments dans l’ordre, puis Envoyer.';
    default:
      return 'Répondez ci-dessous.';
  }
}

// ─── Contrôles par type ───
function grilleLettres(q, multiple) {
  const options = optionsDe(q.type, q.gabarit);
  const avecTextes = !(q.gabarit && q.gabarit.masquer_texte) && !questionCible;
  // Liste verticale : lettres alignées, libellé éventuel à droite de la lettre.
  const grille = element('div', 'liste-options');
  if (avecTextes && options.some((o) => o.texte)) grille.classList.add('avec-libelles');

  const selection = new Set();
  if (reponseLocale && reponseLocale.reponse !== null && reponseLocale.reponse !== undefined) {
    const valeur = reponseLocale.reponse;
    if (Array.isArray(valeur)) valeur.forEach((v) => selection.add(String(v)));
    else selection.add(String(valeur));
  }

  const boutons = new Map();
  let boutonEnvoyer = null;

  function majEnvoyer() {
    if (boutonEnvoyer) boutonEnvoyer.disabled = selection.size === 0;
  }

  for (const option of options) {
    const libelle = avecTextes ? option.texte : '';
    const bouton = element('button', multiple ? 'touche case' : 'touche');
    bouton.type = 'button';
    bouton.dataset.cle = option.cle;
    bouton.setAttribute('aria-pressed', selection.has(option.cle) ? 'true' : 'false');
    const nomOption = option.cle === 'V' && q.type === 'vraifaux' ? 'Vrai' : option.cle === 'F' && q.type === 'vraifaux' ? 'Faux' : option.cle;
    bouton.innerHTML =
      (multiple ? '<span class="coche" aria-hidden="true"></span>' : '') +
      `<span class="lettre">${echapper(nomOption)}</span>` +
      (libelle && q.type !== 'vraifaux' ? `<span class="libelle">${echapper(libelle)}</span>` : '');
    bouton.addEventListener('click', () => {
      if (!estOuverte()) return;
      if (multiple) {
        if (selection.has(option.cle)) selection.delete(option.cle);
        else selection.add(option.cle);
        bouton.setAttribute('aria-pressed', selection.has(option.cle) ? 'true' : 'false');
        majEnvoyer();
      } else {
        selection.clear();
        selection.add(option.cle);
        for (const [cle, b] of boutons) b.setAttribute('aria-pressed', cle === option.cle ? 'true' : 'false');
        envoyer(option.cle);
      }
    });
    boutons.set(option.cle, bouton);
    grille.appendChild(bouton);
  }

  const enfants = [grille];
  if (multiple) {
    boutonEnvoyer = element('button', 'bouton-envoyer', 'Envoyer');
    boutonEnvoyer.type = 'button';
    boutonEnvoyer.disabled = selection.size === 0;
    boutonEnvoyer.addEventListener('click', () => {
      if (!estOuverte()) return;
      if (!selection.size) {
        signalerErreur('Choisissez au moins une lettre.');
        return;
      }
      envoyer([...selection].sort());
    });
    enfants.push(boutonEnvoyer);
  }

  const conteneur = element('div', 'zone-controles');
  enfants.forEach((e) => conteneur.appendChild(e));
  return { element: conteneur, lire: () => (multiple ? [...selection].sort() : [...selection][0] || null) };
}

function controleEchelle(q) {
  const g = q.gabarit || {};
  const min = Number.isFinite(Number(g.min)) ? Number(g.min) : 1;
  const max = Number.isFinite(Number(g.max)) ? Number(g.max) : 5;
  const boutons = element('div', 'grille');
  const nombrePoints = Math.max(2, Math.min(12, Math.round(max - min + 1)));
  const valeurInitiale = reponseLocale && reponseLocale.reponse !== null && reponseLocale.reponse !== undefined
    ? Number(reponseLocale.reponse)
    : null;
  const tous = [];

  for (let i = 0; i < nombrePoints; i += 1) {
    const valeur = min + i;
    const bouton = element('button', 'touche');
    bouton.type = 'button';
    bouton.textContent = String(valeur);
    bouton.setAttribute('aria-pressed', valeurInitiale === valeur ? 'true' : 'false');
    bouton.style.justifyContent = 'center';
    bouton.addEventListener('click', () => {
      if (!estOuverte()) return;
      tous.forEach((b) => b.setAttribute('aria-pressed', b === bouton ? 'true' : 'false'));
      envoyer(valeur);
    });
    tous.push(bouton);
    boutons.appendChild(bouton);
  }

  const conteneur = element('div', 'zone-controles');
  conteneur.appendChild(boutons);
  const ancres = element('div', 'ancres');
  ancres.appendChild(element('span', null, String(g.ancre_min || '')));
  ancres.appendChild(element('span', null, String(g.ancre_max || '')));
  if (g.ancre_min || g.ancre_max) conteneur.appendChild(ancres);
  return { element: conteneur, lire: () => valeurInitiale };
}

function controleCurseur(q) {
  const g = q.gabarit || {};
  const min = Number.isFinite(Number(g.min)) ? Number(g.min) : 0;
  const max = Number.isFinite(Number(g.max)) ? Number(g.max) : 100;

  const conteneur = element('div', 'curseur');
  const valeur = element('div', 'valeur-curseur attente', 'Pas encore de réponse');
  const piste = element('input', 'piste-curseur sans-valeur');
  piste.type = 'range';
  piste.min = String(min);
  piste.max = String(max);
  piste.step = '1';
  piste.value = String(Math.round((min + max) / 2));
  piste.setAttribute('aria-label', 'Curseur de réponse');
  piste.setAttribute('aria-valuetext', 'Aucune réponse');

  const ancres = element('div', 'ancres');
  ancres.appendChild(element('span', null, String(g.ancre_min || '')));
  ancres.appendChild(element('span', null, String(g.ancre_max || '')));

  let touche = false;
  let minuterieEnvoi = null;

  function afficherValeur() {
    valeur.textContent = String(piste.value);
    piste.setAttribute('aria-valuetext', String(piste.value));
  }

  function planifierEnvoi(delai) {
    clearTimeout(minuterieEnvoi);
    minuterieEnvoi = setTimeout(() => {
      if (estOuverte()) envoyer(Number(piste.value));
    }, delai);
  }

  function marquerTouche() {
    if (touche) return;
    touche = true;
    piste.classList.remove('sans-valeur');
    valeur.classList.remove('attente');
    afficherValeur();
  }

  if (reponseLocale && reponseLocale.reponse !== null && reponseLocale.reponse !== undefined) {
    const restauree = Number(reponseLocale.reponse);
    if (Number.isFinite(restauree)) {
      piste.value = String(Math.min(max, Math.max(min, restauree)));
      marquerTouche();
    }
  }

  piste.addEventListener('pointerdown', () => {
    if (!estOuverte()) return;
    marquerTouche();
    planifierEnvoi(500);
  });
  piste.addEventListener('keydown', (ev) => {
    if (!estOuverte()) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(ev.key)) {
      marquerTouche();
      planifierEnvoi(500);
    }
  });
  piste.addEventListener('input', () => {
    if (!touche) return;
    afficherValeur();
    planifierEnvoi(450);
  });
  piste.addEventListener('change', () => {
    if (!touche) return;
    afficherValeur();
    planifierEnvoi(250);
  });

  conteneur.appendChild(valeur);
  conteneur.appendChild(piste);
  if (g.ancre_min || g.ancre_max) conteneur.appendChild(ancres);
  return {
    element: conteneur,
    lire: () => (touche ? Number(piste.value) : null),
  };
}

function controleNombre(q) {
  const g = q.gabarit || {};
  const conteneur = element('div', 'zone-controles');
  const champ = element('div', 'champ');
  const entree = element('input');
  entree.type = 'text';
  entree.inputMode = 'decimal';
  entree.autocomplete = 'off';
  entree.setAttribute('aria-label', 'Votre réponse numérique');
  entree.placeholder = '—';
  if (reponseLocale && reponseLocale.reponse !== null && reponseLocale.reponse !== undefined) {
    entree.value = String(reponseLocale.reponse);
  }
  champ.appendChild(entree);
  if (g.unite) champ.appendChild(element('span', 'unite', String(g.unite)));

  const bouton = element('button', 'bouton-envoyer', 'Envoyer');
  bouton.type = 'button';
  bouton.addEventListener('click', () => {
    if (!estOuverte()) return;
    const brut = entree.value.trim().replace(',', '.');
    if (brut === '') {
      signalerErreur('Entrez d’abord un nombre.');
      return;
    }
    const valeur = Number(brut);
    if (!Number.isFinite(valeur)) {
      signalerErreur('Ce n’est pas un nombre valide.');
      return;
    }
    envoyer(valeur);
  });
  entree.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      bouton.click();
    }
  });

  conteneur.appendChild(champ);
  conteneur.appendChild(bouton);
  return { element: conteneur, lire: () => entree.value };
}

function controleNuage(q) {
  const g = q.gabarit || {};
  const maxMots = Number(g.max_mots) || 3;
  const conteneur = element('div', 'zone-controles');
  const champ = element('div', 'champ');
  const entree = element('input');
  entree.type = 'text';
  entree.maxLength = 40;
  entree.autocomplete = 'off';
  entree.setAttribute('aria-label', 'Vos mots');
  entree.placeholder = 'deux mots';
  champ.appendChild(entree);
  conteneur.appendChild(champ);
  conteneur.appendChild(element('p', 'aide', `Jusqu’à ${maxMots} mots, 40 caractères. Un nouvel envoi remplace le précédent.`));

  const bouton = element('button', 'bouton-envoyer', 'Envoyer');
  bouton.type = 'button';
  bouton.addEventListener('click', () => {
    if (!estOuverte()) return;
    const mots = entree.value.trim().split(/\s+/).filter(Boolean);
    if (!mots.length) {
      signalerErreur('Écrivez au moins un mot.');
      return;
    }
    if (mots.length > maxMots) {
      signalerErreur(`${maxMots} mots au maximum.`);
      return;
    }
    if (mots.some((m) => m.length > 40)) {
      signalerErreur('Un mot fait plus de 40 caractères.');
      return;
    }
    envoyer(mots).then((ok) => {
      if (ok) entree.value = '';
    });
  });
  entree.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      bouton.click();
    }
  });

  conteneur.appendChild(bouton);
  return { element: conteneur, lire: () => entree.value };
}

function controleTexte(q) {
  const g = q.gabarit || {};
  const max = Number(g.max) || 280;
  const conteneur = element('div', 'zone-controles');
  const champ = element('div', 'champ');
  const zone = element('textarea');
  zone.maxLength = max;
  zone.rows = 4;
  zone.setAttribute('aria-label', 'Votre réponse');
  if (reponseLocale && reponseLocale.reponse !== null && reponseLocale.reponse !== undefined) {
    zone.value = String(reponseLocale.reponse);
  }
  champ.appendChild(zone);
  conteneur.appendChild(champ);
  const compteur = element('p', 'compteur-caracteres', `${zone.value.length} / ${max}`);
  conteneur.appendChild(compteur);
  zone.addEventListener('input', () => {
    compteur.textContent = `${zone.value.length} / ${max}`;
  });

  const bouton = element('button', 'bouton-envoyer', 'Envoyer');
  bouton.type = 'button';
  bouton.addEventListener('click', () => {
    if (!estOuverte()) return;
    const texte = zone.value.trim();
    if (!texte) {
      signalerErreur('Écrivez d’abord une réponse.');
      return;
    }
    envoyer(texte);
  });

  conteneur.appendChild(bouton);
  return { element: conteneur, lire: () => zone.value };
}

function controleClassement(q) {
  const g = q.gabarit || {};
  const items = Array.isArray(g.items) ? g.items : [];
  const conteneur = element('div', 'zone-controles');
  const liste = element('ol', 'liste-classement');
  liste.setAttribute('aria-label', 'Éléments à classer');

  let ordre = items.map((item) => ({ cle: String(item.cle), texte: String(item.texte || item.cle) }));
  if (reponseLocale && Array.isArray(reponseLocale.reponse)) {
    const demandees = reponseLocale.reponse.map(String);
    const rangees = demandees
      .map((cle) => ordre.find((item) => item.cle === cle))
      .filter(Boolean);
    const restantes = ordre.filter((item) => !demandees.includes(item.cle));
    if (rangees.length === ordre.length) ordre = rangees;
    else ordre = rangees.concat(restantes);
  }

  const lignes = [];

  function redessiner() {
    liste.replaceChildren();
    lignes.length = 0;
    ordre.forEach((item, index) => {
      const li = element('li', 'item-classement');
      li.appendChild(element('span', 'rang', String(index + 1)));
      li.appendChild(element('span', 'libelle', item.texte));
      const fleches = element('span', 'fleches');
      const haut = element('button', 'bouton-fleche', '↑');
      haut.type = 'button';
      haut.setAttribute('aria-label', `Monter ${item.texte}`);
      haut.disabled = index === 0;
      haut.addEventListener('click', () => {
        if (!estOuverte() || index === 0) return;
        [ordre[index - 1], ordre[index]] = [ordre[index], ordre[index - 1]];
        redessiner();
      });
      const bas = element('button', 'bouton-fleche', '↓');
      bas.type = 'button';
      bas.setAttribute('aria-label', `Descendre ${item.texte}`);
      bas.disabled = index === ordre.length - 1;
      bas.addEventListener('click', () => {
        if (!estOuverte() || index === ordre.length - 1) return;
        [ordre[index + 1], ordre[index]] = [ordre[index], ordre[index + 1]];
        redessiner();
      });
      fleches.appendChild(haut);
      fleches.appendChild(bas);
      li.appendChild(fleches);
      liste.appendChild(li);
      lignes.push(li);
    });
  }

  redessiner();
  conteneur.appendChild(liste);

  const bouton = element('button', 'bouton-envoyer', 'Envoyer');
  bouton.type = 'button';
  bouton.addEventListener('click', () => {
    if (!estOuverte()) return;
    envoyer(ordre.map((item) => item.cle));
  });
  conteneur.appendChild(bouton);

  return { element: conteneur, lire: () => ordre.map((item) => item.cle) };
}

function construireControles(q) {
  switch (q.type) {
    case 'choix':
    case 'vraifaux':
      return grilleLettres(q, false);
    case 'multiple':
      return grilleLettres(q, true);
    case 'echelle':
      return controleEchelle(q);
    case 'curseur':
      return controleCurseur(q);
    case 'nombre':
      return controleNombre(q);
    case 'nuage':
      return controleNuage(q);
    case 'texte':
      return controleTexte(q);
    case 'classement':
      return controleClassement(q);
    default:
      return { element: element('p', 'aide', 'Type de question inconnu.'), lire: () => null };
  }
}

// ─── Construction / mise à jour de l'écran ───
function construire(q) {
  messageLocal = null;
  erreurLocale = null;
  essaiEnvoi = null;
  signatureResultats = null;
  reponseLocale = lireReponseLocale(seance, q.id, q.tour);

  ui.zone.replaceChildren();
  ui.zone.hidden = false;
  ui.resultats.replaceChildren();
  ui.resultats.hidden = true;
  ui.reessai.hidden = true;

  const gab = q.gabarit || {};
  if (questionCible) {
    // La question est écrite sur la diapositive, juste à côté.
    ui.texte.textContent = '';
    ui.texte.hidden = true;
  } else if (gab.masquer_texte) {
    ui.texte.textContent = 'Regardez la diapositive';
    ui.texte.hidden = false;
  } else if (gab.texte) {
    ui.texte.textContent = String(gab.texte);
    ui.texte.hidden = false;
  } else {
    ui.texte.textContent = '';
    ui.texte.hidden = true;
  }

  ui.zone.appendChild(construireControles(q).element);
}

// La ligne « Votre réponse » garde sa place pendant toute la question : rien ne saute.
function majMaReponse() {
  if (!question) {
    ui.maReponse.hidden = true;
    ui.maReponse.textContent = '';
    return;
  }
  ui.maReponse.hidden = false;
  if (!reponseLocale || !reponseLocale.envoye) {
    ui.maReponse.textContent = question.statut === 'ouverte' ? 'Modifiable jusqu’à la fermeture.' : 'Aucune réponse envoyée.';
    ui.maReponse.classList.add('vide');
    return;
  }
  ui.maReponse.classList.remove('vide');
  const etiquette = question.type === 'nuage' ? 'Vos mots' : 'Votre réponse';
  ui.maReponse.textContent = `${etiquette} : ${formaterReponse(question.type, question.gabarit, reponseLocale.reponse)}`;
}

function majResultats() {
  if (!question || question.statut !== 'revelee' || !question.resultats || !question.publie) {
    ui.resultats.replaceChildren();
    ui.resultats.hidden = true;
    signatureResultats = null;
    return;
  }
  const sig = JSON.stringify(question.resultats);
  if (sig === signatureResultats) {
    ui.resultats.hidden = false;
    return;
  }
  signatureResultats = sig;
  ui.resultats.replaceChildren();
  dessinerResultats(ui.resultats, question.type, question.gabarit, question.resultats, {
    compact: true,
    etiquette: 'Résultats de la question',
  });
  const titre = element('p', 'titre-resultats', 'Résultats');
  ui.resultats.prepend(titre);
  ui.resultats.hidden = false;
}

function basculerControles(ouvert) {
  for (const controle of ui.zone.querySelectorAll('button, input, textarea, select')) {
    controle.disabled = !ouvert;
  }
}

function majStatut() {
  if (!question) return;
  basculerControles(question.statut === 'ouverte');
  if (erreurLocale) {
    ecrireEtat(erreurLocale, { erreur: true });
    return;
  }
  if (question.statut === 'ouverte') {
    if (messageLocal) ecrireEtat(messageLocal);
    else if (reponseLocale && reponseLocale.envoye) ecrireEtat('Réponse envoyée ✓');
    else ecrireEtat(consigne(question.type));
    return;
  }
  if (question.statut === 'fermee') {
    ecrireEtat('Question fermée');
    return;
  }
  if (question.resultats && question.publie) ecrireEtat('Question fermée');
  else ecrireEtat('Question fermée — les résultats sont à l’écran.');
}

function appliquer(etat) {
  if (!etat || typeof etat !== 'object') return;
  if (etat.seance !== undefined && etat.seance !== seance) {
    seance = etat.seance;
    signature = null;
    questionPrecedente = null;
    reponseLocale = null;
    messageLocal = null;
    essaiEnvoi = null;
  }

  let q = etat.question || null;
  const autreQuestion = !!(q && questionCible && q.id !== questionCible);
  if (autreQuestion) q = null;
  if (!q) {
    question = null;
    signature = null;
    questionPrecedente = null;
    reponseLocale = null;
    ui.zone.replaceChildren();
    ui.zone.hidden = true;
    ui.resultats.replaceChildren();
    ui.resultats.hidden = true;
    ui.texte.hidden = true;
    ui.maReponse.hidden = true;
    ui.reessai.hidden = true;
    ecrireEtat(
      questionCible
        ? autreQuestion
          ? 'Une autre question est en cours : répondez sur sa diapositive.'
          : 'Cette question s’ouvrira ici quand elle sera lancée.'
        : 'En attente de la prochaine question',
    );
    return;
  }

  const sig = [q.id, q.tour, q.type, JSON.stringify(q.gabarit || {})].join('|');
  const cle = `${q.id}:${q.tour}`;
  if (sig !== signature) {
    const nouvelle = cle !== questionPrecedente && q.statut === 'ouverte';
    signature = sig;
    question = q;
    construire(q);
    questionPrecedente = cle;
    const interaction = !navigator.userActivation || navigator.userActivation.hasBeenActive;
    if (nouvelle && !document.hidden && interaction && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(30);
      } catch {
        /* vibration refusée : sans conséquence */
      }
    }
  } else {
    question = q;
  }

  majStatut();
  majMaReponse();
  majResultats();
}

// ─── Envoi ───
async function envoyer(reponse) {
  if (!question || !estOuverte() || envoiEnCours) return false;
  envoiEnCours = true;
  essaiEnvoi = { reponse };
  messageLocal = 'Envoi…';
  erreurLocale = null;
  ecrireEtat('Envoi…');
  garderReponseLocale(seance, question.id, question.tour, reponse, false);
  try {
    await apiRepondre({
      seance,
      id: question.id,
      tour: question.tour,
      appareil: appareil(),
      reponse,
    });
    essaiEnvoi = null;
    messageLocal = 'Réponse envoyée ✓';
    reponseLocale = { reponse, envoye: true, quand: Date.now() };
    garderReponseLocale(seance, question.id, question.tour, reponse, true);
    ui.reessai.hidden = true;
    majStatut();
    majMaReponse();
    return true;
  } catch (err) {
    if (err && err.statut === 409) {
      messageLocal = 'Question fermée';
      essaiEnvoi = null;
      ui.reessai.hidden = true;
      ecrireEtat('Question fermée');
      interroger();
    } else if (err && err.statut === 429) {
      messageLocal = 'Trop d’envois — patientez un instant';
      ecrireEtat(messageLocal, { erreur: true });
      ui.reessai.hidden = false;
    } else {
      messageLocal = 'Échec de l’envoi — nouvel essai';
      ecrireEtat(messageLocal, { erreur: true });
      ui.reessai.hidden = false;
      if (err && err.reseau) {
        ui.connexion.hidden = false;
        ui.connexion.textContent = 'Connexion perdue — nouvel essai en cours';
      }
    }
  } finally {
    envoiEnCours = false;
  }
  return false;
}

ui.boutonReessai.addEventListener('click', () => {
  if (essaiEnvoi) envoyer(essaiEnvoi.reponse);
});

// ─── Interrogation de l'état ───
function planifier() {
  clearTimeout(minuterie);
  const base = document.hidden ? DELAI_CACHE : DELAI_VISIBLE;
  const delai = Math.min(PLAFOND, base * 2 ** Math.max(0, echecs));
  minuterie = setTimeout(interroger, delai);
}

async function interroger() {
  if (!visible) {
    planifier();
    return;
  }
  try {
    const etat = await apiEtat();
    signalerPresence();
    echecs = 0;
    ui.connexion.hidden = true;
    appliquer(etat);
  } catch (err) {
    echecs += 1;
    ui.connexion.hidden = false;
    ui.connexion.textContent = 'Connexion perdue — nouvel essai en cours';
  } finally {
    planifier();
  }
}

document.addEventListener('visibilitychange', () => {
  clearTimeout(minuterie);
  if (document.hidden) planifier();
  else interroger();
});

interroger();

/* Présence : au plus un signal toutes les 20 s, seulement quand l'onglet est visible. */
let dernierePresence = 0;
function signalerPresence() {
  const maintenant = Date.now();
  if (document.hidden || maintenant - dernierePresence < 20000) return;
  dernierePresence = maintenant;
  apiPresence(appareil()).catch(() => {});
}
