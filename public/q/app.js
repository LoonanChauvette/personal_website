import { corriger } from './core.js';
// Page étudiante : un seul écran, un seul gabarit à la fois, états écrits en clair.
import {
  apiEtat,
  apiGarde,
  apiPresence,
  apiRepondre,
  appareil,
  messageErreur,
  optionsDe,
  formaterReponse,
  lireReponseLocale,
  garderReponseLocale,
  dessinerResultats,
  dispositionSerie,
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

// Diapositive étudiante (élément HTML d'Excalidraw+) : le document porte
// <script type="application/json" id="question">{"id": "…"}</script> et n'affiche
// que cette question dans le formulaire intégré.
const DIAPO = (() => {
  try {
    const c = JSON.parse(document.getElementById('question')?.textContent || 'null');
    return c && c.id ? { id: String(c.id) } : null;
  } catch {
    return null;
  }
})();
if (DIAPO) document.documentElement.classList.add('integre');

let seance = null;
let question = null;
let signature = null;
let questionPrecedente = null;
let reponseLocale = null;
let cleReponseMemoire = null; // séance:id:tour de reponseLocale
let messageLocal = null;
let erreurLocale = null;
let minuterieErreur = null;
let essaiEnvoi = null;
let envoiEnCours = false;
let minuterie = null;
let echecs = 0;
let signatureResultats = null;
// Fonction d'envoi des contrôles : envoyer() pour une question simple ; une série la
// remplace le temps de construire chaque sous-question (la réponse rejoint l'objet commun).
let envoyerSous = (reponse) => envoyer(reponse);

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
      return 'Ajoutez un mot ou une courte expression.';
    case 'texte':
      return 'Écrivez votre réponse, puis Envoyer.';
    case 'classement':
      return 'Placez les éléments dans l’ordre, puis Envoyer.';
    case 'serie':
      return 'Répondez à chaque question, puis Envoyer.';
    default:
      return 'Répondez ci-dessous.';
  }
}

// ─── Contrôles par type ───
function grilleLettres(q, multiple) {
  const envoi = envoyerSous;
  const options = optionsDe(q.type, q.gabarit);
  const avecTextes = DIAPO || !(q.gabarit && q.gabarit.masquer_texte);
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
    // Dans une série en colonnes, la place manque : « V » / « F » (l'énoncé dit « vrai ou faux »).
    const court = q.court === true;
    const nomOption = court ? option.cle : option.cle === 'V' && q.type === 'vraifaux' ? 'Vrai' : option.cle === 'F' && q.type === 'vraifaux' ? 'Faux' : option.cle;
    if (court && q.type === 'vraifaux') bouton.setAttribute('aria-label', option.cle === 'V' ? 'Vrai' : 'Faux');
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
        envoi(option.cle);
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
      envoi([...selection].sort());
    });
    enfants.push(boutonEnvoyer);
  }

  const conteneur = element('div', 'zone-controles');
  enfants.forEach((e) => conteneur.appendChild(e));
  return { element: conteneur, lire: () => (multiple ? [...selection].sort() : [...selection][0] || null) };
}

function controleEchelle(q) {
  const envoi = envoyerSous;
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
      envoi(valeur);
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
  const envoi = envoyerSous;
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
      if (estOuverte()) envoi(Number(piste.value));
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
  const envoi = envoyerSous;
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
    envoi(valeur);
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
  const max = Number(q.gabarit?.max_mots) || 3;
  const conteneur = element('div', 'zone-controles nuage-controles');
  const champ = element('div', 'champ');
  const entree = element('input');
  entree.type = 'text';
  entree.maxLength = 40;
  entree.autocomplete = 'off';
  entree.setAttribute('aria-label', 'Votre entrée');
  entree.placeholder = 'Mot ou courte expression';
  const bouton = element('button', 'bouton-envoyer', 'Ajouter');
  bouton.type = 'button';
  const pastilles = element('div', 'nuage-pastilles');
  const aide = element('p', 'aide');
  let valeurs = reponseLocale?.envoye ? (Array.isArray(reponseLocale.reponse) ? [...reponseLocale.reponse] : [reponseLocale.reponse]) : [];
  let occupe = false;
  function afficher() {
    pastilles.replaceChildren();
    valeurs.forEach((valeur, index) => {
      const pastille = element('span', 'nuage-pastille');
      pastille.appendChild(element('span', '', valeur));
      const retirer = element('button', 'nuage-retirer', '×');
      retirer.type = 'button';
      retirer.setAttribute('aria-label', `Retirer ${valeur}`);
      retirer.disabled = !estOuverte() || occupe;
      retirer.addEventListener('click', () => modifier(valeurs.filter((_, i) => i !== index)));
      pastille.appendChild(retirer);
      pastilles.appendChild(pastille);
    });
    entree.disabled = !estOuverte() || occupe || valeurs.length >= max;
    bouton.disabled = entree.disabled;
    aide.textContent = valeurs.length >= max ? 'Retirez une entrée pour en ajouter une autre' : `Jusqu’à ${max} entrées de 3 mots et 40 caractères au plus.`;
  }
  async function modifier(suivantes) {
    if (!estOuverte() || occupe) return;
    occupe = true;
    afficher();
    const ok = await envoyerSous(suivantes);
    if (ok) { valeurs = suivantes; entree.value = ''; }
    occupe = false;
    afficher();
  }
  bouton.addEventListener('click', () => {
    const valeur = entree.value.trim().replace(/\s+/g, ' ');
    if (!valeur || valeur.split(/\s+/).length > 3 || Array.from(valeur).length > 40) {
      signalerErreur('Entrez une expression de 1 à 3 mots et 40 caractères au plus.');
      return;
    }
    modifier([...valeurs, valeur]);
  });
  entree.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); bouton.click(); }
  });
  champ.appendChild(entree);
  conteneur.append(champ, pastilles, aide, bouton);
  conteneur.actualiserNuage = afficher;
  afficher();
  return { element: conteneur, lire: () => valeurs };
}

function controleTexte(q) {
  const envoi = envoyerSous;
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
    envoi(texte);
  });

  conteneur.appendChild(bouton);
  return { element: conteneur, lire: () => zone.value };
}

function controleClassement(q) {
  const envoi = envoyerSous;
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
    envoi(ordre.map((item) => item.cle));
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
    case 'serie':
      return controleSerie(q);
    default:
      return { element: element('p', 'aide', 'Type de question inconnu.'), lire: () => null };
  }
}

// Série : plusieurs sous-questions, un seul bouton « Envoyer » (objet {cle: réponse} ; réponse
// partielle admise, un nouvel envoi remplace le précédent). Deux dispositions :
// - « matrice » : dans la diapositive seulement (énoncés imprimés à côté) ; en-têtes des
//   colonnes (Son 1…) et des lignes (a, b, c), une cellule par sous-question.
// - « liste » : téléphone et navigateur ; un bloc par colonne (titre + détail), une ligne par
//   sous-question avec son nom en clair. Libellés courts : nom à gauche, commande dans une
//   colonne de largeur fixe à droite (toutes les commandes alignées) ; sinon nom au-dessus.
function controleSerie(q) {
  const g = q.gabarit || {};
  const sous = Array.isArray(g.questions) ? g.questions : [];
  const colonnes = Math.max(1, Math.min(3, Number(g.colonnes) || 1));
  const nLignes = Math.ceil(sous.length / colonnes);
  const tCol = Array.isArray(g.titres_colonnes) ? g.titres_colonnes : [];
  const tLig = Array.isArray(g.titres_lignes) ? g.titres_lignes : [];
  const details = Array.isArray(g.details_colonnes) ? g.details_colonnes : [];
  const disposition = dispositionSerie(g, !!DIAPO);
  const conteneur = element('div', 'zone-controles serie');
  const reponses = reponseLocale && reponseLocale.reponse && typeof reponseLocale.reponse === 'object' && !Array.isArray(reponseLocale.reponse)
    ? { ...reponseLocale.reponse }
    : {};
  const lecteurs = [];
  const nomDe = (sq, i) => sq.texte || tLig[i % nLignes] || sq.etiquette || sq.cle;

  // Commande d'une sous-question (son propre « Envoyer » retiré : envoi commun).
  function commande(sq, court) {
    const { cle, type, etiquette: _e, texte: _t, ...gab } = sq;
    const souq = { id: q.id, tour: q.tour, type, gabarit: gab, statut: q.statut, court };
    const local = reponseLocale;
    reponseLocale = reponses[cle] !== undefined ? { reponse: reponses[cle], envoye: true } : null;
    const envoyerOrig = envoyerSous;
    envoyerSous = (valeur) => {
      reponses[cle] = valeur;
      return Promise.resolve(true);
    };
    const ctrl = construireControles(souq);
    envoyerSous = envoyerOrig;
    reponseLocale = local;
    for (const b of ctrl.element.querySelectorAll('.bouton-envoyer')) b.remove();
    ctrl.element.classList.add('serie-controle');
    if (gab.unite) ctrl.element.dataset.unite = gab.unite;
    lecteurs.push([cle, ctrl.lire]);
    return ctrl.element;
  }

  if (disposition === 'matrice') {
    const grille = element('div', 'serie-grille matrice');
    grille.style.setProperty('--cols', String(colonnes));
    grille.style.setProperty('--lignes', String(nLignes));
    for (let c = 0; c < colonnes; c++) {
      const t = element('div', 'serie-titre-col', tCol[c] || '');
      t.style.gridRow = '1';
      t.style.gridColumn = String(c + 2);
      grille.appendChild(t);
    }
    for (let r = 0; r < nLignes; r++) {
      const t = element('div', 'serie-titre-lig', tLig[r] || '');
      t.style.gridRow = String(r + 2);
      t.style.gridColumn = '1';
      grille.appendChild(t);
    }
    sous.forEach((sq, i) => {
      const rangee = element('div', 'serie-rangee');
      rangee.style.gridColumn = String(Math.floor(i / nLignes) + 2);
      rangee.style.gridRow = String((i % nLignes) + 2);
      rangee.setAttribute('aria-label', `${tCol[Math.floor(i / nLignes)] || ''} ${nomDe(sq, i)}`.trim());
      rangee.appendChild(commande(sq, true));
      grille.appendChild(rangee);
    });
    conteneur.appendChild(grille);
  } else {
    // Un groupe par colonne quand la série a des titres de colonnes ; sinon un seul groupe.
    const groupes = tCol.length ? Array.from({ length: colonnes }, (_, c) => sous.slice(c * nLignes, (c + 1) * nLignes)) : [sous];
    const longs = sous.some((sq, i) => nomDe(sq, i).length > 26);
    const liste = element('div', `serie-liste ${longs ? 'empile' : 'cote-a-cote'}`);
    let i = 0;
    groupes.forEach((membres, c) => {
      const groupe = element('section', 'serie-groupe');
      if (tCol.length) {
        const tete = element('div', 'serie-groupe-tete');
        tete.appendChild(element('span', 'serie-groupe-titre', tCol[c] || ''));
        if (details[c]) tete.appendChild(element('span', 'serie-groupe-detail', details[c]));
        groupe.appendChild(tete);
        groupe.setAttribute('aria-label', tCol[c] || '');
      }
      for (const sq of membres) {
        const rangee = element('div', 'serie-rangee');
        const nom = element('div', 'serie-libelle');
        if (!tCol.length && sq.etiquette) nom.appendChild(element('span', 'serie-num', sq.etiquette));
        nom.appendChild(element('span', 'serie-texte', nomDe(sq, i)));
        rangee.append(nom, commande(sq, false));
        groupe.appendChild(rangee);
        i += 1;
      }
      liste.appendChild(groupe);
    });
    conteneur.appendChild(liste);
  }

  const lire = () => {
    for (const [cle, lireSous] of lecteurs) {
      const v = lireSous();
      const vide = v === null || v === undefined || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && !v.length);
      if (!vide) reponses[cle] = typeof v === 'string' ? v.trim().replace(',', '.') : v;
      else delete reponses[cle];
    }
    return { ...reponses };
  };
  const bouton = element('button', 'bouton-envoyer', 'Envoyer');
  bouton.type = 'button';
  bouton.addEventListener('click', () => {
    if (!estOuverte()) return;
    const r = lire();
    if (!Object.keys(r).length) {
      signalerErreur('Répondez à au moins une question.');
      return;
    }
    envoyer(r);
  });
  conteneur.appendChild(bouton);
  return { element: conteneur, lire };
}

// ─── Construction / mise à jour de l'écran ───
function construire(q) {
  messageLocal = null;
  erreurLocale = null;
  essaiEnvoi = null;
  signatureResultats = null;
  // La révélation reconstruit l'écran (le gabarit reçoit les bonnes réponses). Dans une
  // diapositive (iframe isolée), le stockage local peut être indisponible : la réponse gardée
  // en mémoire pour la même question et le même tour est conservée.
  const cleQ = `${seance}:${q.id}:${q.tour}`;
  const lue = lireReponseLocale(seance, q.id, q.tour);
  if (lue || cleQ !== cleReponseMemoire) reponseLocale = lue;
  cleReponseMemoire = cleQ;

  ui.zone.replaceChildren();
  ui.zone.hidden = false;
  ui.resultats.replaceChildren();
  ui.resultats.hidden = true;
  ui.reessai.hidden = true;

  const gab = q.gabarit || {};
  ui.texte.classList.toggle('long', DIAPO && String(gab.texte || '').length > 100);
  if (gab.masquer_texte && !DIAPO) {
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
  ui.maReponse.classList.remove('vide', 'juste', 'faux', 'partiel');
  const etiquette = question.type === 'nuage' ? 'Vos mots' : 'Votre réponse';
  ui.maReponse.textContent = `${etiquette} : ${formaterReponse(question.type, question.gabarit, reponseLocale.reponse)}`;
  // Série révélée : chaque réponse est déjà marquée « vous » dans la grille ; la ligne donne le score.
  // Diapositive révélée : la réponse est marquée sur le graphique ; la ligne garde le verdict
  // (types corrigés seulement : un nuage garde « Vos mots : … »).
  const corrigeable = ['choix', 'vraifaux', 'multiple', 'nombre'].includes(question.type) && (question.gabarit?.bonnes || []).length;
  if (question.statut === 'revelee' && (question.type === 'serie' || (DIAPO && corrigeable))) ui.maReponse.textContent = question.type === 'serie' ? 'Vos réponses' : 'Votre réponse';
  if (question.statut === 'revelee') {
    const correction = corriger(question.type, question.gabarit, reponseLocale.reponse);
    if (correction.statut) {
      let verdict = '✓ Bonne réponse';
      if (question.type === 'serie' && correction.parties) {
        const parties = Object.values(correction.parties).filter((v) => v !== null);
        verdict = `${parties.filter((v) => v === 'juste').length} sur ${parties.length} justes`;
      } else if (correction.statut === 'faux') {
        const bonnes = question.gabarit?.bonnes || [];
        // Diapositive : lettre seule (les libellés sont sur la diapositive), sinon le verdict déborde.
        const bonne = DIAPO && question.type !== 'nombre'
          ? bonnes.map((b) => (question.type === 'vraifaux' ? (b === 'V' ? 'Vrai' : 'Faux') : b)).join(', ')
          : formaterReponse(question.type, question.gabarit, question.type === 'multiple' ? bonnes : bonnes[0]);
        verdict = bonnes.length ? `✗ Bonne réponse : ${bonne}` : '✗ Réponse incorrecte';
      } else if (correction.statut === 'partiel') {
        const parties = Object.values(correction.parties).filter((v) => v !== null);
        verdict = `${parties.filter((v) => v === 'juste').length} sur ${parties.length} justes`;
      }
      ui.maReponse.appendChild(element('span', `verdict ${correction.statut}`, ` · ${verdict}`));
    }
  }
}

// Rotation du téléphone, fenêtre redimensionnée : le graphique (tracé à la largeur réelle)
// est retracé à la nouvelle largeur.
let largeurTracee = 0;
addEventListener('resize', () => {
  if (DIAPO || ui.resultats.hidden) return;
  const l = ui.resultats.parentElement.clientWidth;
  if (Math.abs(l - largeurTracee) < 8) return;
  signatureResultats = null;
  majResultats();
});

function majResultats() {
  // Diapositive étudiante : révéler = projeter, le graphique y remplace la zone de réponse.
  const visibles = !!(question && question.statut === 'revelee' && question.resultats && (question.publie || DIAPO));
  // Résultats visibles : ils remplacent la zone de réponse (fermée, la réponse de l'étudiant
  // est marquée dans le graphique), sur la diapositive comme sur le téléphone.
  ui.zone.hidden = visibles || !question;
  if (DIAPO) document.documentElement.classList.toggle('revele', visibles);
  if (!visibles) {
    ui.resultats.replaceChildren();
    ui.resultats.hidden = true;
    signatureResultats = null;
    return;
  }
  const sig = JSON.stringify([question.resultats, reponseLocale?.reponse, question.gabarit]);
  if (sig === signatureResultats) {
    ui.resultats.hidden = false;
    return;
  }
  signatureResultats = sig;
  ui.resultats.replaceChildren();
  // Sur la diapositive, les libellés des options sont déjà imprimés : lettres seules.
  const gabarit = DIAPO && Array.isArray(question.gabarit?.options)
    ? { ...question.gabarit, options: question.gabarit.options.map((o) => ({ ...o, texte: '' })) }
    : question.gabarit;
  // Téléphone / navigateur : tracé à la largeur réelle (en px CSS), pour que les tailles de
  // police du graphique soient les vraies (un tracé de 760 réduit à 350 px les divise par 2).
  // Diapositive : l'élément est mis à l'échelle avec la diapositive, tracé compact de base.
  largeurTracee = ui.resultats.parentElement.clientWidth;
  const largeur = DIAPO ? undefined : Math.max(280, Math.round(largeurTracee - 36));
  dessinerResultats(ui.resultats, question.type, gabarit, question.resultats, {
    compact: true,
    largeur,
    echelle: DIAPO ? undefined : 'ecran',
    enDiapo: !!DIAPO,
    bonnes: (question.gabarit && question.gabarit.bonnes) || [],
    maReponse: reponseLocale?.envoye ? reponseLocale.reponse : undefined,
    etiquette: 'Résultats de la question',
  });
  if (!DIAPO) ui.resultats.prepend(element('p', 'titre-resultats', 'Résultats'));
  ui.resultats.hidden = false;
}

function basculerControles(ouvert) {
  for (const controle of ui.zone.querySelectorAll('button, input, textarea, select')) {
    controle.disabled = !ouvert;
  }
  ui.zone.querySelector('.nuage-controles')?.actualiserNuage?.();
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

  const enCours = etat.question || null;
  // Sur une diapositive, une autre question en cours équivaut à « pas encore ouverte »,
  // sauf si cette question a déjà été révélée : son résultat gardé s'affiche.
  let q = DIAPO && enCours && enCours.id !== DIAPO.id ? null : enCours;
  if (DIAPO && !q && garde && garde.resultats) {
    q = { id: garde.id, tour: 0, type: garde.type, gabarit: garde.gabarit, statut: 'revelee', resultats: garde.resultats, publie: true };
  }
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
    ecrireEtat(DIAPO ? 'Pas encore ouverte' : 'En attente de la prochaine question');
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
  // Diapositive hors écran : aucune interrogation ; l'affichage (resize) relance.
  if (DIAPO && masque()) return;
  const base = masque() ? DELAI_CACHE : DELAI_VISIBLE;
  const delai = Math.min(PLAFOND, base * 2 ** Math.max(0, echecs));
  minuterie = setTimeout(interroger, delai);
}

// Hors écran, Excalidraw réduit l'élément à 0 × 0 sans masquer le document.
function masque() {
  return document.hidden || (DIAPO && (window.innerWidth === 0 || window.innerHeight === 0));
}
if (DIAPO) {
  let avant = masque();
  window.addEventListener('resize', () => {
    const maintenant = masque();
    if (avant && !maintenant) interroger();
    avant = maintenant;
  });
}

let garde = null; // diapositive étudiante : dernier résultat révélé de sa question
async function lireGarde() {
  if (!DIAPO) return;
  try {
    const r = await apiGarde(DIAPO.id);
    garde = r && r.garde ? r.garde : null;
  } catch {
    /* sans résultat gardé, rien ne change */
  }
}

async function interroger() {
  try {
    const [etat] = await Promise.all([apiEtat(), lireGarde()]);
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
  if (masque() || maintenant - dernierePresence < 20000) return;
  dernierePresence = maintenant;
  apiPresence(appareil()).catch(() => {});
}
