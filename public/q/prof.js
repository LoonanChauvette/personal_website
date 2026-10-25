// Télécommande de l'enseignant : lancer, fermer, révéler, modérer, banque, export.
import {
  apiEtat,
  apiEnseignant,
  apiResultats,
  messageErreur,
  apiMoi,
  adresseConnexion,
  lireBanqueTexte,
  garderBanqueTexte,
  optionsDe,
  nombreEntier,
  nombreDecimal,
  formaterDuree,
  telecharger,
  copierTexte,
  urlSalle,
} from './commun.js';
import { parserBanque, parserLancement } from './core.js';

const ui = {
  salle: document.getElementById('salle'),
  connexion: document.getElementById('connexion'),
  connecte: document.getElementById('connecte'),
  lienConnexion: document.getElementById('lien-connexion'),
  resume: document.getElementById('resume'),
  compteur: document.getElementById('compteur'),
  unite: document.getElementById('unite'),
  chrono: document.getElementById('chrono'),
  appareils: document.getElementById('appareils'),
  alerte: document.getElementById('alerte'),
  btnFermer: document.getElementById('btn-fermer'),
  btnReveler: document.getElementById('btn-reveler'),
  btnRelancer: document.getElementById('btn-relancer'),
  btnPublier: document.getElementById('btn-publier'),
  btnMasquer: document.getElementById('btn-masquer'),
  carteModeration: document.getElementById('carte-moderation'),
  moderation: document.getElementById('moderation'),
  fichierBanque: document.getElementById('fichier-banque'),
  btnAnalyser: document.getElementById('btn-analyser'),
  champBanque: document.getElementById('champ-banque'),
  banqueMessage: document.getElementById('banque-message'),
  listeBanque: document.getElementById('liste-banque'),
  btnExporter: document.getElementById('btn-exporter'),
  btnNouvelle: document.getElementById('btn-nouvelle'),
  lienEcran: document.getElementById('lien-ecran'),
  lienEtudiants: document.getElementById('lien-etudiants'),
};

const CLE_JOURNAL = 'poll:journal';
// true quand l'enseignant est connecté (cookie de session) : aucune clé à saisir.
let cle = false;
let etat = null;
let resultatsEnseignant = null;
let banque = { titre: '', questions: [] };
let journal = [];
let echecs = 0;
let enCours = false;
let boucle = null;
let intervalleResultats = null;
let minuterieAlerte = null;
let signatureModeration = null;
let questionVue = null;

// ─── Utilitaires ───
function alerte(message) {
  ui.alerte.textContent = message;
  ui.alerte.hidden = false;
  clearTimeout(minuterieAlerte);
  minuterieAlerte = setTimeout(() => {
    ui.alerte.hidden = true;
  }, 6000);
}

function libelleType(type) {
  const noms = {
    choix: 'choix',
    multiple: 'choix multiple',
    vraifaux: 'vrai / faux',
    echelle: 'échelle',
    curseur: 'curseur',
    nombre: 'nombre',
    nuage: 'nuage de mots',
    texte: 'texte libre',
    classement: 'classement',
  };
  return noms[type] || type;
}

function libelleStatut(statut) {
  if (statut === 'ouverte') return 'ouverte';
  if (statut === 'fermee') return 'fermée';
  if (statut === 'revelee') return 'révélée';
  return statut || '—';
}

function compteBrut(comptes, cleValeur) {
  if (!comptes) return 0;
  if (comptes[cleValeur] !== undefined) return Number(comptes[cleValeur]) || 0;
  for (const [k, v] of Object.entries(comptes)) {
    if (String(k) === String(cleValeur)) return Number(v) || 0;
  }
  return 0;
}

// ─── Connexion ───
function afficherCle(moi = null) {
  ui.connexion.hidden = cle;
  ui.connecte.hidden = !cle;
  if (moi && moi.login) ui.connecte.textContent = `Connecté : ${moi.login}${moi.type === 'appareil' ? ' (cet appareil, jusqu’à ce soir)' : ''}.`;
  ui.lienConnexion.href = adresseConnexion();
  document.querySelectorAll('[data-lancer]').forEach((b) => {
    b.disabled = !cle;
  });
}

async function verifierConnexion() {
  const moi = await apiMoi();
  cle = !!moi.connecte;
  afficherCle(moi);
  majBoutons();
  return cle;
}

// ─── État courant ───
function appliquerEtat(nouvelEtat) {
  etat = nouvelEtat;
  const q = etat && etat.question ? etat.question : null;

  if (etat && etat.salle) {
    ui.salle.textContent = `Salle ${etat.salle}${etat.seance ? ' · séance ' + String(etat.seance).slice(0, 8) : ''}`;
  }

  if (!q) {
    ui.resume.textContent = 'Aucune question — l’écran affiche le QR code.';
    ui.compteur.textContent = '0';
    ui.unite.textContent = 'réponse';
    ui.chrono.textContent = '';
    ui.appareils.hidden = true;
    ui.carteModeration.hidden = true;
    resultatsEnseignant = null;
    questionVue = null;
    majBoutons();
    return;
  }

  const detail = `${q.id} · ${libelleType(q.type)} · ${libelleStatut(q.statut)}${q.resultats ? ' · résultats publics' : ''}`;
  ui.resume.textContent = detail;

  const n = Number(q.nb_reponses) || 0;
  ui.compteur.textContent = nombreEntier(n);
  ui.unite.textContent = n === 1 ? 'réponse' : 'réponses';

  if (questionVue !== `${q.id}:${q.tour}`) {
    questionVue = `${q.id}:${q.tour}`;
    signatureModeration = null;
    resultatsEnseignant = null;
  }

  majBoutons();
  majChrono();
}

function majChrono() {
  const q = etat && etat.question;
  if (!q || q.statut !== 'ouverte') {
    ui.chrono.textContent = '';
    return;
  }
  const ouverture = Number(q.ouverte_a);
  if (!Number.isFinite(ouverture)) {
    ui.chrono.textContent = '';
    return;
  }
  const serveur = Number(etat.serveur_ms);
  const delta = Number.isFinite(serveur) ? serveur - Date.now() : 0;
  ui.chrono.textContent = formaterDuree(Date.now() + delta - ouverture);
}

function majBoutons() {
  const q = etat && etat.question;
  const pret = !!cle;
  ui.btnFermer.disabled = !pret || !q || q.statut !== 'ouverte';
  ui.btnReveler.disabled = !pret || !q || q.statut === 'revelee';
  ui.btnRelancer.disabled = !pret || !q;
  ui.btnPublier.disabled = !pret || !q;
  ui.btnMasquer.disabled = !pret || !q;
  ui.btnExporter.disabled = !pret;
  ui.btnNouvelle.disabled = !pret;
}

// ─── Actions ───
async function agir(op, corps = {}) {
  if (!cle) {
    alerte('Connectez-vous d’abord.');
    return;
  }
  try {
    await apiEnseignant(op, corps, cle);
    await rafraichir();
    await rafraichirResultats();
  } catch (err) {
    alerte(messageErreur(err));
  }
}

async function lancerChaine(chaine) {
  const spec = parserLancement(chaine) || { type: chaine.split(':')[0] };
  await agir('lancer', { type: spec.type, gabarit: spec.gabarit || undefined });
}

async function lancerEntree(questionBanque) {
  await agir('lancer', {
    id: questionBanque.id,
    type: questionBanque.type,
    gabarit: questionBanque.gabarit,
  });
}

document.querySelectorAll('[data-lancer]').forEach((bouton) => {
  bouton.addEventListener('click', () => lancerChaine(bouton.dataset.lancer));
});

ui.btnFermer.addEventListener('click', () => agir('fermer'));
ui.btnReveler.addEventListener('click', () => agir('reveler'));
ui.btnRelancer.addEventListener('click', () => agir('relancer'));
ui.btnPublier.addEventListener('click', () => agir('publier_resultats'));
ui.btnMasquer.addEventListener('click', () => agir('masquer_resultats'));

ui.btnNouvelle.addEventListener('click', () => {
  if (!window.confirm('Nouvelle séance ? La séance actuelle sera rendue inaccessible.')) return;
  agir('nouvelle_seance');
});

// ─── Interrogation ───
function planifier() {
  clearTimeout(boucle);
  const base = document.hidden ? 10000 : 2000;
  boucle = setTimeout(rafraichir, Math.min(15000, base * 2 ** Math.max(0, echecs)));
}

async function rafraichir() {
  if (enCours) return;
  enCours = true;
  try {
    const nouvelEtat = await apiEtat();
    echecs = 0;
    appliquerEtat(nouvelEtat);
  } catch {
    echecs += 1;
  } finally {
    enCours = false;
    planifier();
    gererResultats();
  }
}

function gererResultats() {
  const besoin = !!cle && !document.hidden && !!(etat && etat.question);
  if (besoin && !intervalleResultats) {
    intervalleResultats = setInterval(rafraichirResultats, 3000);
  } else if (!besoin && intervalleResultats) {
    clearInterval(intervalleResultats);
    intervalleResultats = null;
  }
}

async function rafraichirResultats() {
  if (!cle || !etat || !etat.question) {
    resultatsEnseignant = null;
    afficherModeration();
    return;
  }
  try {
    const reponse = await apiResultats(cle);
    resultatsEnseignant = reponse;
    const brut = reponse.nb_reponses !== undefined && reponse.nb_reponses !== null
      ? reponse.nb_reponses
      : reponse.nb_respondants;
    if (brut !== undefined && brut !== null) {
      const n = Number(brut);
      ui.compteur.textContent = nombreEntier(n);
      ui.unite.textContent = n === 1 ? 'réponse' : 'réponses';
    }
    if (reponse.appareils_connectes !== undefined) {
      const app = Number(reponse.appareils_connectes);
      if (Number.isFinite(app)) {
        ui.appareils.textContent = `≈ ${nombreEntier(app)} appareil${app === 1 ? '' : 's'} connecté${app === 1 ? '' : 's'} (estimation)`;
        ui.appareils.hidden = false;
      }
    }
    enregistrerJournal(reponse);
    afficherModeration();
  } catch (err) {
    if (err.statut === 401) {
      cle = false;
      afficherCle();
      alerte('Connexion expirée — reconnectez-vous.');
    }
  }
}

// ─── Modération ───
function afficherModeration() {
  const q = etat && etat.question;
  const r = resultatsEnseignant;
  if (!q || !r || (q.type !== 'texte' && q.type !== 'nuage')) {
    ui.carteModeration.hidden = true;
    return;
  }
  // op=resultats expose « reponses » : {cle, valeur, masque} pour texte et nuage.
  const reponses = Array.isArray(r.reponses) ? r.reponses : [];
  const masques = new Set((r.masques || []).map(String));
  for (const reponse of reponses) {
    if (reponse.masque) masques.add(String(reponse.cle));
  }
  const signature = JSON.stringify(reponses) + JSON.stringify([...masques]);
  ui.carteModeration.hidden = false;
  if (signature === signatureModeration) return;
  signatureModeration = signature;

  ui.moderation.replaceChildren();

  if (reponses.length) {
    const liste = document.createElement('ul');
    liste.className = 'moderation-liste';
    reponses.forEach((reponse) => {
      const masquee = masques.has(String(reponse.cle));
      const li = document.createElement('li');
      if (masquee) li.classList.add('masquee');
      const texte = document.createElement('span');
      texte.className = 'texte';
      texte.textContent = Array.isArray(reponse.valeur)
        ? reponse.valeur.join(' · ')
        : String(reponse.valeur === null || reponse.valeur === undefined ? '' : reponse.valeur);
      const bouton = document.createElement('button');
      bouton.type = 'button';
      bouton.className = 'bouton secondaire';
      bouton.textContent = masquee ? 'Afficher' : 'Masquer';
      bouton.addEventListener('click', () => moderer(reponse.cle, !masquee));
      li.appendChild(texte);
      li.appendChild(bouton);
      liste.appendChild(li);
    });
    ui.moderation.appendChild(liste);
    return;
  }

  if (q.type === 'nuage' && r.resultats && Array.isArray(r.resultats.mots)) {
    const p = document.createElement('p');
    p.className = 'note';
    p.textContent =
      'Le nuage regroupe les mots : la modération par réponse n’est possible que si le serveur expose les réponses individuelles. Mots affichés : ' +
      r.resultats.mots.map((m) => `${m.mot} (${m.n})`).join(', ');
    ui.moderation.appendChild(p);
    return;
  }

  const p = document.createElement('p');
  p.className = 'note';
  p.textContent = 'Aucune réponse pour le moment.';
  ui.moderation.appendChild(p);
}

async function moderer(cleReponse, masque) {
  const q = etat && etat.question;
  if (!q) return;
  if (!cle) {
    alerte('Connectez-vous d’abord.');
    return;
  }
  try {
    await apiEnseignant('moderer', { id: q.id, tour: q.tour, cle_reponse: cleReponse, masque }, cle);
    signatureModeration = null;
    await rafraichirResultats();
  } catch (err) {
    alerte(messageErreur(err));
  }
}

// ─── Banque de questions ───
function lienEcran(id) {
  const base = new URL('ecran.html', urlSalle()).href;
  return `${base}#lancer=${encodeURIComponent(id)}`;
}

function apercuQuestion(entree) {
  const g = entree.gabarit || {};
  if (g.texte) return String(g.texte);
  const options = optionsDe(entree.type, g)
    .map((o) => (o.texte ? `${o.cle} — ${o.texte}` : o.cle))
    .join(' · ');
  return options || '(sans texte)';
}

function afficherBanque() {
  ui.listeBanque.replaceChildren();
  for (const entree of banque.questions) {
    const li = document.createElement('li');

    const titre = document.createElement('span');
    titre.className = 'entree-titre';
    titre.textContent = `${entree.id} · ${libelleType(entree.type)}`;
    li.appendChild(titre);

    const apercu = document.createElement('span');
    apercu.className = 'entree-texte';
    apercu.textContent = apercuQuestion(entree);
    li.appendChild(apercu);

    const actions = document.createElement('span');
    actions.className = 'entree-actions';

    const lancer = document.createElement('button');
    lancer.type = 'button';
    lancer.className = 'bouton';
    lancer.textContent = 'Lancer';
    lancer.disabled = !cle;
    lancer.addEventListener('click', () => lancerEntree(entree));
    actions.appendChild(lancer);

    const copier = document.createElement('button');
    copier.type = 'button';
    copier.className = 'bouton secondaire';
    copier.textContent = 'Copier le lien';
    copier.addEventListener('click', async () => {
      const ok = await copierTexte(lienEcran(entree.id));
      ui.banqueMessage.textContent = ok ? 'Lien copié pour la diapositive.' : lienEcran(entree.id);
    });
    actions.appendChild(copier);

    const ouvrir = document.createElement('a');
    ouvrir.className = 'bouton secondaire';
    ouvrir.href = lienEcran(entree.id);
    ouvrir.target = '_blank';
    ouvrir.rel = 'noopener';
    ouvrir.textContent = 'Ouvrir l’écran';
    actions.appendChild(ouvrir);

    li.appendChild(actions);
    ui.listeBanque.appendChild(li);
  }
}

function analyserBanque() {
  const texte = ui.champBanque.value.trim();
  if (!texte) {
    ui.banqueMessage.textContent = 'Collez ou chargez une banque Markdown.';
    return;
  }
  try {
    banque = parserBanque(texte);
    garderBanqueTexte(texte);
    afficherBanque();
    ui.banqueMessage.textContent = `${banque.titre || 'Banque'} — ${banque.questions.length} question${banque.questions.length === 1 ? '' : 's'} gardée${banque.questions.length === 1 ? '' : 's'}.`;
  } catch (err) {
    ui.banqueMessage.textContent = `Banque refusée : ${err.message}`;
  }
}

ui.btnAnalyser.addEventListener('click', analyserBanque);

ui.fichierBanque.addEventListener('change', async () => {
  const fichier = ui.fichierBanque.files && ui.fichierBanque.files[0];
  if (!fichier) return;
  try {
    ui.champBanque.value = await fichier.text();
    analyserBanque();
  } catch {
    ui.banqueMessage.textContent = 'Fichier illisible.';
  } finally {
    ui.fichierBanque.value = '';
  }
});

// ─── Journal et export CSV ───
function chargerJournal() {
  try {
    const brut = localStorage.getItem(CLE_JOURNAL);
    const donnees = brut ? JSON.parse(brut) : [];
    journal = Array.isArray(donnees) ? donnees : [];
  } catch {
    journal = [];
  }
}

function garderJournal() {
  try {
    localStorage.setItem(CLE_JOURNAL, JSON.stringify(journal.slice(-300)));
  } catch {
    /* quota ou mode privé : l'export reste limité à la session */
  }
}

function enregistrerJournal(reponse) {
  const q = reponse && reponse.question;
  if (!q || !reponse.resultats) return;
  if (!(Number(reponse.resultats.n) > 0)) return; // rien à exporter
  const entree = {
    seance: (etat && etat.seance) || q.seance || '',
    id: q.id,
    tour: q.tour,
    type: q.type,
    gabarit: q.gabarit || {},
    resultats: reponse.resultats,
    detail: Array.isArray(reponse.reponses) ? reponse.reponses : null,
    masques: Array.isArray(reponse.reponses)
      ? reponse.reponses.filter((x) => x.masque).map((x) => x.cle)
      : reponse.masques || [],
    quand: Date.now(),
  };
  const index = journal.findIndex(
    (x) => x.seance === entree.seance && x.id === entree.id && x.tour === entree.tour,
  );
  if (index >= 0) journal[index] = entree;
  else journal.push(entree);
  garderJournal();
}

function cellule(valeur) {
  const texte = valeur === null || valeur === undefined ? '' : String(valeur);
  return /[";\r\n]/.test(texte) ? `"${texte.replace(/"/g, '""')}"` : texte;
}

function lignesPour(entree) {
  const { seance, id, tour, type, resultats: res, gabarit } = entree;
  const base = [seance || '', id, tour, type];
  const masquees = new Set((entree.masques || []).map(String));
  const lignes = [];

  if (type === 'choix' || type === 'multiple' || type === 'vraifaux') {
    const n = Number(res.n) || 0;
    for (const option of optionsDe(type, gabarit)) {
      const v = compteBrut(res.comptes, option.cle);
      lignes.push([
        ...base,
        `${option.cle}${option.texte ? ' — ' + option.texte : ''}`,
        '',
        v,
        n ? Math.round((1000 * v) / n) / 10 : 0,
        '',
      ]);
    }
    lignes.push([...base, 'total', '', n, 100, '']);
    return lignes;
  }

  if (type === 'echelle') {
    const entrees = Object.entries(res.comptes || {}).sort((a, b) => Number(a[0]) - Number(b[0]));
    for (const [valeur, nombre] of entrees) lignes.push([...base, `valeur ${valeur}`, '', nombre, '', '']);
    lignes.push([...base, 'moyenne', nombreDecimal(res.moyenne, 2), Number(res.n) || 0, '', '']);
    return lignes;
  }

  if (type === 'nombre') {
    for (const classe of res.classes || []) {
      lignes.push([...base, `${classe.de}–${classe.a}`, '', classe.n, '', '']);
    }
    lignes.push([...base, 'mediane', nombreDecimal(res.mediane, 2), Number(res.n) || 0, '', '']);
    return lignes;
  }

  if (type === 'curseur') {
    lignes.push([...base, 'moyenne', nombreDecimal(res.moyenne, 2), Number(res.n) || 0, '', '']);
    lignes.push([...base, 'mediane', nombreDecimal(res.mediane, 2), Number(res.n) || 0, '', '']);
    return lignes;
  }

  if (type === 'nuage') {
    if (entree.detail && entree.detail.length) {
      for (const d of entree.detail) {
        const mots = Array.isArray(d.valeur) ? d.valeur.join(' · ') : String(d.valeur || '');
        lignes.push([...base, d.cle, mots, '', '', d.masque ? 'oui' : 'non']);
      }
    } else {
      for (const mot of res.mots || []) lignes.push([...base, mot.mot, '', mot.n, '', '']);
    }
    lignes.push([...base, 'total', '', Number(res.n) || 0, '', '']);
    return lignes;
  }

  if (type === 'texte') {
    if (entree.detail && entree.detail.length) {
      for (const d of entree.detail) {
        lignes.push([
          ...base,
          d.cle,
          String(d.valeur === null || d.valeur === undefined ? '' : d.valeur),
          '',
          '',
          d.masque ? 'oui' : 'non',
        ]);
      }
    } else {
      for (const reponse of res.reponses || []) {
        lignes.push([
          ...base,
          reponse.cle,
          reponse.texte,
          '',
          '',
          masquees.has(String(reponse.cle)) ? 'oui' : 'non',
        ]);
      }
    }
    lignes.push([...base, 'total', '', Number(res.n) || 0, '', '']);
    return lignes;
  }

  if (type === 'classement') {
    const items = Array.isArray(gabarit && gabarit.items) ? gabarit.items : [];
    for (const rang of res.rangs || []) {
      const item = items.find((i) => String(i.cle) === String(rang.cle));
      lignes.push([
        ...base,
        item && item.texte ? item.texte : rang.cle,
        nombreDecimal(rang.rang_moyen, 2),
        Number(res.n) || 0,
        '',
        '',
      ]);
    }
    return lignes;
  }

  return lignes;
}

function exporterCsv() {
  const seance = etat && etat.seance;
  const entrees = journal.filter((x) => !seance || x.seance === seance);
  if (!entrees.length) {
    alerte('Aucun résultat à exporter pour cette séance.');
    return;
  }
  const lignes = [['séance', 'question', 'tour', 'type', 'item', 'valeur', 'effectif', 'part', 'masquée']];
  for (const entree of entrees) lignes.push(...lignesPour(entree));
  const csv = '\ufeff' + lignes.map((ligne) => ligne.map(cellule).join(';')).join('\r\n') + '\r\n';
  const jour = new Date().toISOString().slice(0, 10);
  telecharger(`sondage-${seance || 'seance'}-${jour}.csv`, csv);
}

ui.btnExporter.addEventListener('click', exporterCsv);

// ─── Démarrage ───
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    rafraichir();
    rafraichirResultats();
  }
});

setInterval(majChrono, 500);

ui.lienEtudiants.href = urlSalle();
ui.lienEcran.href = new URL('ecran.html', urlSalle()).href;

chargerJournal();
const texteBanque = lireBanqueTexte();
if (texteBanque) {
  ui.champBanque.value = texteBanque;
  try {
    banque = parserBanque(texteBanque);
    afficherBanque();
    ui.banqueMessage.textContent = `${banque.titre || 'Banque'} — ${banque.questions.length} question${banque.questions.length === 1 ? '' : 's'}.`;
  } catch (err) {
    ui.banqueMessage.textContent = `Banque gardée illisible : ${err.message}`;
  }
} else {
  ui.banqueMessage.textContent = 'Collez une banque Markdown ou chargez un fichier .md.';
}

afficherCle();
majBoutons();
verifierConnexion().then(() => {
  rafraichir();
  rafraichirResultats();
});
