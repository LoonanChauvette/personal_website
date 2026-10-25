// api/poll.js — gestionnaire unique de l'API du sondage (Vercel, Node).
//
// Tout passe par /api/poll?op=… conformément au tableau « API » de docs/spec.md.
// L'état public est mis en cache CDN une seconde ; les mutations et les résultats
// enseignants ne sont jamais mis en cache.

import { TYPES, agreger, normaliserGabarit, validerReponse } from "../lib/poll/core.mjs";
import { ErreurStockage, TTL_DEFAUT, creerStoreDepuisEnv } from "../lib/poll/store.mjs";
import {
  DUREE_COURS_S,
  ajouterCookie,
  approuverDemande,
  configurationGithub,
  cookie,
  creerDemande,
  debutConnexion,
  demarrerCours,
  finConnexion,
  jetonDiapo,
  lireCookies,
  lireCours,
  lireSession,
  nomCookie,
  opPermiseDiapo,
  origineAcceptable,
  retourSur,
  suivreDemande,
  supprimerSession,
  terminerCours,
  verifierAcces as verifierAccesAuth,
} from "../lib/poll/auth.mjs";

const MAX_ECRITURES = 30;
const FENETRE_PRESENCE_MS = 20_000;
const PRESENCE_RECENTE_MS = 30_000;
const CACHE_ETAT = "public, s-maxage=1, stale-while-revalidate=2";
const CACHE_PRIVE = "no-store";

// Les diapositives Excalidraw+ (élément HTML, origine « null ») appellent l'API :
// elle répond à toute origine, mais SANS cookies (pas d'Allow-Credentials). Le
// navigateur n'envoie donc jamais la session à une autre origine ; une diapositive
// ne s'authentifie qu'avec son jeton, en en-tête.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
  "Access-Control-Max-Age": "86400",
};

const OPS_ENSEIGNANT = new Set([
  "lancer",
  "fermer",
  "reveler",
  "masquer_resultats",
  "publier_resultats",
  "relancer",
  "nouvelle_seance",
  "effacer",
  "moderer",
]);

// ---------------------------------------------------------------------------
// Stockage
// ---------------------------------------------------------------------------

let stockage = null;

export function _reinitialiserStockage() {
  stockage = null;
}

export function _stockageCourant() {
  if (!stockage) stockage = creerStoreDepuisEnv(globalThis.process?.env || {});
  return stockage;
}

function salleCourante() {
  const salle = (globalThis.process?.env?.POLL_ROOM || "aud6001").trim();
  return salle || "aud6001";
}

const cleEtat = (salle) => `poll:${salle}:etat`;
const cleRep = (salle, seance, id, tour) => `poll:${salle}:${seance}:${id}:${tour}:rep`;
const cleN = (salle, seance, id, tour) => `poll:${salle}:${seance}:${id}:${tour}:n`;
const cleMasques = (salle, seance, id, tour) => `poll:${salle}:${seance}:${id}:${tour}:masques`;
const clePresence = (salle) => `poll:${salle}:presence`;

async function lireEtat(store, salle) {
  const brut = await store.get(cleEtat(salle));
  if (!brut) return null;
  try {
    const etat = JSON.parse(brut);
    if (!etat || typeof etat !== "object") return null;
    return etat;
  } catch {
    return null;
  }
}

async function ecrireEtat(store, salle, etat) {
  etat.maj = Date.now();
  await store.set(cleEtat(salle), JSON.stringify(etat), TTL_DEFAUT);
}

// ---------------------------------------------------------------------------
// Réponses HTTP
// ---------------------------------------------------------------------------

function envoyer(res, code, charge, entetes = {}) {
  for (const [nom, valeur] of Object.entries({ "Cache-Control": CACHE_PRIVE, ...CORS, ...entetes })) {
    res.setHeader(nom, valeur);
  }
  res.status(code).json(charge);
  return res;
}

const erreur = (res, code, message, entetes) => envoyer(res, code, { erreur: message }, entetes);

function methode(req) {
  return String(req.method || "GET").toUpperCase();
}

function lireOp(req) {
  const brut = req.query?.op;
  const op = Array.isArray(brut) ? brut[0] : brut;
  return typeof op === "string" ? op.trim().toLowerCase() : "";
}

function lireCorps(req) {
  let corps = req.body;
  if (corps === undefined || corps === null || corps === "") return {};
  if (typeof corps === "string" || (typeof Buffer !== "undefined" && Buffer.isBuffer(corps))) {
    const texte = typeof corps === "string" ? corps : corps.toString("utf8");
    if (texte.trim() === "") return {};
    try {
      corps = JSON.parse(texte);
    } catch {
      throw new ErreurRequete("Corps JSON invalide.");
    }
  }
  if (typeof corps !== "object" || Array.isArray(corps)) {
    throw new ErreurRequete("Un objet JSON est attendu.");
  }
  return corps;
}

class ErreurRequete extends Error {}

// ---------------------------------------------------------------------------
// Authentification enseignant
// ---------------------------------------------------------------------------

export { jetonDiapo };

// Accès enseignant : session (cookie), jeton de diapositive, ou clé en en-tête.
// Rend l'accès, ou répond l'erreur et rend null.
async function verifierAcces(req, res) {
  const acces = await verifierAccesAuth(req, _stockageCourant(), salleCourante());
  if (acces.code) {
    erreur(res, acces.code, acces.message);
    return null;
  }
  return acces;
}

async function exigerEnseignant(req, res) {
  const acces = await verifierAcces(req, res);
  if (!acces) return false;
  if (acces.niveau === "diapo") {
    erreur(res, 403, "Jeton de diapositive : opération réservée à l'enseignant connecté.");
    return false;
  }
  return true;
}

function accesDiapoPermis(acces, op, idQuestion) {
  if (acces.niveau !== "diapo") return true;
  return opPermiseDiapo(op, idQuestion, acces.id);
}

// ---------------------------------------------------------------------------
// Présence des appareils (compteur approximatif de l'écran)
// ---------------------------------------------------------------------------

const presences = new Map();

function appareilValide(valeur) {
  return typeof valeur === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(valeur);
}

async function noterPresence(store, salle, appareil) {
  if (!appareilValide(appareil)) return;
  const maintenant = Date.now();
  const dernier = presences.get(appareil) || 0;
  if (maintenant - dernier < FENETRE_PRESENCE_MS) return;
  presences.set(appareil, maintenant);
  if (presences.size > 5000) presences.clear();
  try {
    await store.hset(clePresence(salle), appareil, String(maintenant), TTL_DEFAUT);
  } catch {
    // La présence est un indicateur d'appoint : une écriture perdue n'est pas une panne.
  }
}

function comptePresence(hash, maintenant = Date.now()) {
  let n = 0;
  for (const valeur of Object.values(hash || {})) {
    const ts = Number(valeur);
    if (Number.isFinite(ts) && maintenant - ts < PRESENCE_RECENTE_MS) n += 1;
  }
  return n;
}

// ---------------------------------------------------------------------------
// Vues
// ---------------------------------------------------------------------------

function questionPublique(question, nbReponses, enseignant = false) {
  const gabarit = { ...question.gabarit };
  if (!enseignant && question.statut !== "revelee") delete gabarit.bonnes;
  const vue = {
    id: question.id,
    tour: question.tour,
    type: question.type,
    gabarit,
    statut: question.statut,
    ouverte_a: question.ouverte_a,
    revision: question.revision,
    nb_reponses: nbReponses,
  };
  // Révéler = projeter : l'agrégat est public dès la révélation (l'écran n'a pas
  // besoin de la clé). « publie » dit seulement si les téléphones l'affichent aussi.
  if (question.statut === "revelee" && question.resultats) {
    vue.resultats = question.resultats;
    vue.publie = !!question.publie;
  }
  return vue;
}

async function reponseEnseignant(store, salle, etat) {
  let nb = 0;
  if (etat?.question) {
    nb = await store.hlen(cleRep(salle, etat.seance, etat.question.id, etat.question.tour));
  }
  return {
    salle,
    seance: etat?.seance ?? null,
    question: etat?.question ? questionPublique(etat.question, nb, true) : null,
    serveur_ms: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Calcul des résultats
// ---------------------------------------------------------------------------

async function lireReponses(store, salle, seance, question) {
  const cleR = cleRep(salle, seance, question.id, question.tour);
  const cleM = cleMasques(salle, seance, question.id, question.tour);
  const [reponses, masques] = await store.pipeline([
    ["hgetall", cleR],
    ["hgetall", cleM],
  ]);
  const valeurs = [];
  const detail = [];
  for (const [appareil, brut] of Object.entries(reponses || {})) {
    let valeur;
    try {
      valeur = JSON.parse(brut);
    } catch {
      continue;
    }
    const masque = Boolean((masques || {})[appareil]);
    valeurs.push({ cle: appareil, valeur, masque });
    detail.push({ cle: appareil, valeur, masque });
  }
  return { valeurs, detail };
}

function agregerPublic(type, gabarit, valeurs) {
  return agreger(
    type,
    gabarit,
    valeurs.filter((v) => !v.masque).map((v) => v.valeur),
  );
}

// ---------------------------------------------------------------------------
// Opérations
// ---------------------------------------------------------------------------

async function operationEtat(req, res) {
  if (!["GET", "HEAD"].includes(methode(req))) {
    return erreur(res, 405, "Méthode non permise : utilisez GET.", { Allow: "GET" });
  }
  const salle = salleCourante();
  const store = _stockageCourant();

  const etat = await lireEtat(store, salle);
  let nb = 0;
  if (etat?.question) {
    nb = await store.hlen(cleRep(salle, etat.seance, etat.question.id, etat.question.tour));
  }

  return envoyer(
    res,
    200,
    {
      salle,
      seance: etat?.seance ?? null,
      question: etat?.question ? questionPublique(etat.question, nb, false) : null,
      serveur_ms: Date.now(),
    },
    { "Cache-Control": CACHE_ETAT },
  );
}

async function operationRepondre(req, res) {
  if (methode(req) !== "POST") {
    return erreur(res, 405, "Méthode non permise : utilisez POST.", { Allow: "POST" });
  }
  const corps = lireCorps(req);
  const { seance, id, tour, appareil, reponse } = corps;
  const salle = salleCourante();
  const store = _stockageCourant();

  if (!appareilValide(appareil)) {
    return erreur(res, 400, "Identifiant d'appareil invalide.");
  }

  const etat = await lireEtat(store, salle);
  if (!etat?.question) return erreur(res, 409, "Aucune question ouverte.");
  if (String(seance ?? "") !== etat.seance) return erreur(res, 409, "Séance expirée.");
  if (String(id ?? "") !== etat.question.id || Number(tour) !== etat.question.tour) {
    return erreur(res, 409, "Question périmée.");
  }
  if (etat.question.statut !== "ouverte") return erreur(res, 409, "Question fermée.");

  const validation = validerReponse(etat.question.type, etat.question.gabarit, reponse);
  if (!validation.ok) return erreur(res, 400, validation.erreur);

  const question = etat.question;
  const cleCompteur = cleN(salle, etat.seance, question.id, question.tour);
  const total = await store.hincrby(cleCompteur, appareil, 1, TTL_DEFAUT);
  if (total > MAX_ECRITURES) {
    return erreur(res, 429, "Limite de 30 envois atteinte pour cette question.");
  }

  const cleR = cleRep(salle, etat.seance, question.id, question.tour);
  await store.pipeline([
    ["hset", cleR, appareil, JSON.stringify(validation.valeur)],
    ["expire", cleR, TTL_DEFAUT],
  ]);
  // Un appareil qui répond est connecté : utile quand l'état vient du cache CDN.
  await noterPresence(store, salle, appareil);

  return envoyer(res, 200, { ok: true });
}

async function operationResultats(req, res) {
  if (!["GET", "HEAD"].includes(methode(req))) {
    return erreur(res, 405, "Méthode non permise : utilisez GET.", { Allow: "GET" });
  }
  if (!(await exigerEnseignant(req, res))) return res;

  const salle = salleCourante();
  const store = _stockageCourant();
  const etat = await lireEtat(store, salle);
  const maintenant = Date.now();

  let resultats = null;
  let reponses = null;
  let nb = 0;
  if (etat?.question) {
    const question = etat.question;
    const { valeurs, detail } = await lireReponses(store, salle, etat.seance, question);
    nb = valeurs.length;
    resultats = agregerPublic(question.type, question.gabarit, valeurs);
    if (question.type === "texte" || question.type === "nuage") {
      reponses = detail;
    }
  }

  let appareils = 0;
  try {
    appareils = comptePresence(await store.hgetall(clePresence(salle)), maintenant);
  } catch {
    appareils = 0;
  }

  return envoyer(
    res,
    200,
    {
      salle,
      seance: etat?.seance ?? null,
      question: etat?.question ? questionPublique(etat.question, nb, true) : null,
      resultats,
      reponses,
      nb_respondants: nb,
      appareils_connectes: appareils,
      serveur_ms: maintenant,
    },
    { "Cache-Control": CACHE_PRIVE },
  );
}

function nouvelleSeance() {
  const alea = Math.random().toString(36).slice(2, 6);
  return `s-${Date.now().toString(36)}-${alea}`;
}

async function operationLancer(req, res) {
  const corps = lireCorps(req);
  const salle = salleCourante();
  const store = _stockageCourant();

  if (corps.type === undefined || corps.type === null) {
    return erreur(res, 400, "Champ « type » manquant.");
  }
  const type = String(corps.type).trim().toLowerCase();
  if (!TYPES.includes(type)) return erreur(res, 400, `Type de question inconnu : « ${corps.type} ».`);

  let gabaritBrut = corps.gabarit ?? {};
  if (typeof gabaritBrut !== "object" || Array.isArray(gabaritBrut)) {
    return erreur(res, 400, "Le gabarit doit être un objet JSON.");
  }
  gabaritBrut = { ...gabaritBrut };
  if (corps.texte !== undefined) gabaritBrut.texte = corps.texte;
  if (corps.bonnes !== undefined) gabaritBrut.bonnes = corps.bonnes;

  let gabarit;
  try {
    gabarit = normaliserGabarit(type, gabaritBrut);
  } catch (e) {
    return erreur(res, 400, e.message);
  }

  const etat = (await lireEtat(store, salle)) || { seance: nouvelleSeance(), question: null, seq: 0 };
  let seq = Number.isInteger(etat.seq) ? etat.seq : 0;

  let id;
  if (corps.id === undefined || corps.id === null || String(corps.id).trim() === "") {
    seq += 1;
    id = `R${seq}`;
  } else {
    id = String(corps.id).trim();
    if (!/^[A-Za-z0-9_.-]{1,40}$/.test(id)) {
      return erreur(res, 400, `Identifiant de question invalide : « ${id} ».`);
    }
  }

  // Diapositive Excalidraw+ (si_nouveau) : elle lance sa question en s'affichant.
  // Revenir sur la diapositive, ou un second écran ouvert sur la même présentation,
  // ne doit jamais effacer des réponses : on ne relance que si la question n'a
  // encore ni réponse ni révélation dans cette séance.
  if (corps.si_nouveau === true && etat.seance) {
    const enCours = etat.question?.id === id ? etat.question : null;
    const revelees = Array.isArray(etat.revelees) ? etat.revelees : [];
    const reponses = await store.hlen(cleRep(salle, etat.seance, id, enCours ? enCours.tour : 1));
    if ((enCours && enCours.statut === "ouverte") || revelees.includes(id) || reponses > 0) {
      return envoyer(res, 200, { ...(await reponseEnseignant(store, salle, etat)), deja: true });
    }
  }

  const revision = (etat.question?.revision ?? 0) + 1;
  etat.seance = etat.seance || nouvelleSeance();
  etat.seq = seq;
  // Une même question de banque peut être relancée dans la même séance : on efface
  // les réponses du tour 1 pour ne jamais réafficher celles d'un lancement précédent.
  await store.del(
    cleRep(salle, etat.seance, id, 1),
    cleN(salle, etat.seance, id, 1),
    cleMasques(salle, etat.seance, id, 1),
  );
  etat.question = {
    id,
    tour: 1,
    type,
    gabarit,
    statut: "ouverte",
    ouverte_a: Date.now(),
    revision,
    publie: false,
    resultats: null,
  };
  await ecrireEtat(store, salle, etat);
  return envoyer(res, 200, await reponseEnseignant(store, salle, etat));
}

async function operationMutation(req, res, op) {
  if (methode(req) !== "POST") {
    return erreur(res, 405, "Méthode non permise : utilisez POST.", { Allow: "POST" });
  }
  const acces = await verifierAcces(req, res);
  if (!acces) return res;

  const corps = lireCorps(req);
  const salle = salleCourante();
  const store = _stockageCourant();
  const etat = await lireEtat(store, salle);
  if (!accesDiapoPermis(acces, op, etat?.question?.id)) {
    return erreur(res, 403, "Jeton de diapositive : cette question ou cette opération n'est pas la sienne.");
  }

  if (op === "nouvelle_seance") {
    const nouveau = { seance: nouvelleSeance(), question: null, seq: 0 };
    await ecrireEtat(store, salle, nouveau);
    return envoyer(res, 200, await reponseEnseignant(store, salle, nouveau));
  }

  if (!etat?.question) return erreur(res, 409, "Aucune question en cours.");
  const question = etat.question;

  switch (op) {
    case "effacer": {
      etat.question = null;
      break;
    }

    case "fermer": {
      if (question.statut === "ouverte") {
        question.statut = "fermee";
        question.revision += 1;
      }
      break;
    }

    case "relancer": {
      question.tour += 1;
      question.statut = "ouverte";
      question.ouverte_a = Date.now();
      question.revision += 1;
      question.publie = false;
      question.resultats = null;
      break;
    }

    case "reveler": {
      etat.revelees = [...new Set([...(Array.isArray(etat.revelees) ? etat.revelees : []), question.id])].slice(-200);
      question.statut = "revelee";
      question.revision += 1;
      const { valeurs } = await lireReponses(store, salle, etat.seance, question);
      question.resultats = agregerPublic(question.type, question.gabarit, valeurs);
      break;
    }

    case "publier_resultats": {
      if (question.statut !== "revelee") {
        return erreur(res, 409, "Les résultats ne sont pas encore révélés.");
      }
      if (!question.resultats) {
        const { valeurs } = await lireReponses(store, salle, etat.seance, question);
        question.resultats = agregerPublic(question.type, question.gabarit, valeurs);
      }
      question.publie = true;
      question.revision += 1;
      break;
    }

    case "masquer_resultats": {
      if (question.statut !== "revelee") {
        return erreur(res, 409, "Les résultats ne sont pas encore révélés.");
      }
      question.publie = false;
      question.revision += 1;
      break;
    }

    case "moderer": {
      if (String(corps.id ?? "") !== question.id || Number(corps.tour) !== question.tour) {
        return erreur(res, 409, "Question périmée.");
      }
      const cible = corps.cle_reponse;
      if (typeof cible !== "string" || !cible.trim() || cible.length > 128) {
        return erreur(res, 400, "Identifiant de réponse invalide.");
      }
      const cleM = cleMasques(salle, etat.seance, question.id, question.tour);
      if (corps.masque === true) {
        await store.hset(cleM, cible, "1", TTL_DEFAUT);
      } else {
        await store.pipeline([
          ["hdel", cleM, cible],
          ["expire", cleM, TTL_DEFAUT],
        ]);
      }
      if (question.statut === "revelee") {
        const { valeurs } = await lireReponses(store, salle, etat.seance, question);
        question.resultats = agregerPublic(question.type, question.gabarit, valeurs);
      }
      break;
    }

    default:
      return erreur(res, 400, `Opération inconnue : « ${op} ».`);
  }

  await ecrireEtat(store, salle, etat);
  return envoyer(res, 200, await reponseEnseignant(store, salle, etat));
}

// ---------------------------------------------------------------------------
// Connexion, cours, diapositives
// ---------------------------------------------------------------------------

function rediriger(res, adresse, entetes = {}) {
  for (const [nom, valeur] of Object.entries({ "Cache-Control": CACHE_PRIVE, ...entetes })) res.setHeader(nom, valeur);
  res.setHeader("Location", adresse);
  res.status(302).end("");
  return res;
}

function pageErreur(res, code, message) {
  const echappe = String(message).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", CACHE_PRIVE);
  res.status(code).end(
    `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width">` +
      `<title>Connexion</title><body style="font:18px system-ui;max-width:36rem;margin:3rem auto;padding:0 1rem">` +
      `<p>${echappe}</p><p><a href="/admin/">Retour</a></p></body></html>`,
  );
  return res;
}

function premier(valeur) {
  return Array.isArray(valeur) ? valeur[0] : valeur;
}

async function operationConnexion(req, res) {
  const config = configurationGithub();
  if (!config.ok) return pageErreur(res, 503, `Connexion non configurée : il manque ${config.manque.join(", ")}.`);
  const { url, etat } = await debutConnexion(_stockageCourant(), req, premier(req.query?.retour));
  ajouterCookie(res, cookie("oauth", etat, 600));
  return rediriger(res, url);
}

async function operationRetourGithub(req, res) {
  const etatCookie = lireCookies(req)[nomCookie("oauth")];
  ajouterCookie(res, cookie("oauth", "", 0));
  if (premier(req.query?.error)) return pageErreur(res, 400, "Connexion annulée sur GitHub.");
  const r = await finConnexion(_stockageCourant(), req, {
    code: premier(req.query?.code),
    etat: premier(req.query?.state),
    etatCookie,
  });
  if (r.erreur) return pageErreur(res, r.refuse ? 403 : 400, r.erreur);
  ajouterCookie(res, cookie("session", r.session.id, (r.session.expire - Date.now()) / 1000));
  return rediriger(res, r.retour);
}

async function operationMoi(req, res) {
  const store = _stockageCourant();
  const session = await lireSession(store, req);
  const cours = session ? await lireCours(store, salleCourante()) : null;
  return envoyer(res, 200, {
    connecte: !!session,
    login: session?.login ?? null,
    type: session?.type ?? null,
    expire: session?.expire ?? null,
    cours,
    salle: salleCourante(),
  });
}

async function operationDeconnexion(req, res) {
  if (methode(req) !== "POST") return erreur(res, 405, "Méthode non permise : utilisez POST.", { Allow: "POST" });
  if (!origineAcceptable(req)) return erreur(res, 403, "Origine refusée.");
  const store = _stockageCourant();
  const session = await lireSession(store, req);
  if (session) await supprimerSession(store, session.id);
  ajouterCookie(res, cookie("session", "", 0));
  return envoyer(res, 200, { ok: true });
}

// Écran de la salle : il demande un code, le téléphone connecté l'approuve.
async function operationDemandeAppareil(req, res) {
  if (methode(req) !== "POST") return erreur(res, 405, "Méthode non permise : utilisez POST.", { Allow: "POST" });
  if (!origineAcceptable(req)) return erreur(res, 403, "Origine refusée.");
  const { id, code } = await creerDemande(_stockageCourant());
  ajouterCookie(res, cookie("demande", id, 600));
  return envoyer(res, 200, { code: `${code.slice(0, 3)}-${code.slice(3)}`, expire_dans: 600 });
}

async function operationSuivreAppareil(req, res) {
  const id = lireCookies(req)[nomCookie("demande")];
  const r = await suivreDemande(_stockageCourant(), id);
  if (r.statut === "approuvee") {
    ajouterCookie(res, cookie("demande", "", 0));
    ajouterCookie(res, cookie("session", r.session.id, (r.session.expire - Date.now()) / 1000));
    return envoyer(res, 200, { statut: "approuvee" });
  }
  return envoyer(res, 200, r);
}

async function operationApprouverAppareil(req, res) {
  if (methode(req) !== "POST") return erreur(res, 405, "Méthode non permise : utilisez POST.", { Allow: "POST" });
  const store = _stockageCourant();
  const session = await lireSession(store, req);
  // Seule une connexion GitHub approuve un appareil : un écran approuvé ne peut
  // pas en approuver un autre.
  if (!session || session.type !== "github") return erreur(res, 401, "Connexion GitHub requise.");
  if (!origineAcceptable(req)) return erreur(res, 403, "Origine refusée.");
  const r = await approuverDemande(store, lireCorps(req).code, session.login);
  if (r.erreur) return erreur(res, 400, r.erreur);
  return envoyer(res, 200, r);
}

async function operationCours(req, res, op) {
  if (methode(req) !== "POST") return erreur(res, 405, "Méthode non permise : utilisez POST.", { Allow: "POST" });
  if (!(await exigerEnseignant(req, res))) return res;
  const store = _stockageCourant();
  const salle = salleCourante();
  if (op === "cours_terminer") {
    await terminerCours(store, salle);
    return envoyer(res, 200, { cours: null });
  }
  const heures = Number(lireCorps(req).heures);
  const duree = Number.isFinite(heures) && heures > 0 && heures <= 12 ? Math.round(heures * 3600) : DUREE_COURS_S;
  // Un nouveau cours = une nouvelle séance (réponses du cours précédent écartées).
  // Prolonger un cours déjà démarré garde la séance.
  const nouvelle = !(await lireCours(store, salle));
  if (nouvelle) await ecrireEtat(store, salle, { seance: nouvelleSeance(), question: null, seq: 0 });
  const cours = await demarrerCours(store, salle, duree);
  return envoyer(res, 200, { cours, nouvelle_seance: nouvelle });
}

// Jetons de diapositive pour une liste de questions (génération des diapositives).
async function operationJetons(req, res) {
  if (methode(req) !== "POST") return erreur(res, 405, "Méthode non permise : utilisez POST.", { Allow: "POST" });
  if (!(await exigerEnseignant(req, res))) return res;
  const ids = lireCorps(req).ids;
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 200) return erreur(res, 400, "Liste « ids » attendue.");
  const cle = globalThis.process?.env?.POLL_TEACHER_KEY;
  const jetons = {};
  for (const id of ids) {
    const propre = String(id).trim();
    if (!/^[A-Za-z0-9_.-]{1,40}$/.test(propre)) return erreur(res, 400, `Identifiant invalide : « ${propre} ».`);
    jetons[propre] = jetonDiapo(cle, salleCourante(), propre);
  }
  return envoyer(res, 200, { salle: salleCourante(), jetons });
}

// ---------------------------------------------------------------------------
// Point d'entrée
// ---------------------------------------------------------------------------

export default async function handler(req, res) {
  try {
    if (methode(req) === "OPTIONS") {
      for (const [nom, valeur] of Object.entries(CORS)) res.setHeader(nom, valeur);
      res.status(204).end();
      return res;
    }
    const op = lireOp(req);

    if (!op) return erreur(res, 400, "Paramètre op manquant.");
    // « lancer » crée la question : il a sa propre opération.
    if (OPS_ENSEIGNANT.has(op) && op !== "lancer") {
      return await operationMutation(req, res, op);
    }

    switch (op) {
      case "connexion":
        return await operationConnexion(req, res);
      case "retour_github":
        return await operationRetourGithub(req, res);
      case "moi":
        return await operationMoi(req, res);
      case "deconnexion":
        return await operationDeconnexion(req, res);
      case "appareil_demande":
        return await operationDemandeAppareil(req, res);
      case "appareil_suivre":
        return await operationSuivreAppareil(req, res);
      case "appareil_approuver":
        return await operationApprouverAppareil(req, res);
      case "cours_demarrer":
      case "cours_terminer":
        return await operationCours(req, res, op);
      case "jetons":
        return await operationJetons(req, res);

      case "etat":
        return await operationEtat(req, res);

      case "repondre":
        return await operationRepondre(req, res);

      case "presence": {
        // Signal léger (toutes les ~20 s par appareil), jamais mis en cache : il ne
        // passe pas par « etat », dont la réponse est partagée par le CDN.
        if (methode(req) !== "POST") {
          return erreur(res, 405, "Méthode non permise : utilisez POST.", { Allow: "POST" });
        }
        const { appareil } = lireCorps(req);
        if (!appareilValide(appareil)) return erreur(res, 400, "Identifiant d'appareil invalide.");
        await noterPresence(_stockageCourant(), salleCourante(), appareil);
        return envoyer(res, 200, { ok: true }, { "Cache-Control": CACHE_PRIVE });
      }

      case "resultats":
        return await operationResultats(req, res);

      case "lancer": {
        if (methode(req) !== "POST") {
          return erreur(res, 405, "Méthode non permise : utilisez POST.", { Allow: "POST" });
        }
        const acces = await verifierAcces(req, res);
        if (!acces) return res;
        if (!accesDiapoPermis(acces, "lancer", String(lireCorps(req).id ?? "").trim())) {
          return erreur(res, 403, "Jeton de diapositive : il ne lance que sa propre question.");
        }
        return await operationLancer(req, res);
      }

      default:
        return erreur(res, 400, `Opération inconnue : « ${op} ».`);
    }
  } catch (e) {
    if (e instanceof ErreurRequete) return erreur(res, 400, e.message);
    if (e instanceof ErreurStockage) {
      return erreur(res, 503, "Stockage non configuré.");
    }
    // eslint-disable-next-line no-console
    console.error("api/poll :", e);
    return erreur(res, 500, "Erreur interne du serveur.");
  }
}
