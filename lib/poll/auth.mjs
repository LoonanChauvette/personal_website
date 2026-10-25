// lib/poll/auth.js — connexion de l'enseignant (GitHub) et autorisations.
//
// Trois façons d'agir en enseignant :
//   1. Session (cookie HttpOnly) : connexion GitHub, ou écran approuvé depuis un
//      téléphone déjà connecté. Sert le projecteur, la télécommande, l'administration.
//   2. Jeton de diapositive (« diapo:<id>:<signature> ») : glissé dans un élément HTML
//      d'Excalidraw+, qui n'a ni cookies ni stockage. Ne permet que lancer, fermer,
//      révéler ou relancer SA question, et seulement quand le cours est démarré.
//   3. Clé enseignant (POLL_TEACHER_KEY) en en-tête : scripts et tests. Elle n'est
//      plus jamais saisie dans une page ; elle signe aussi les jetons de diapositive.
//
// Les sessions vivent dans le stockage (Upstash), donc se révoquent une à une.

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const DUREE_SESSION_S = 14 * 24 * 3600; // navigateur personnel
export const DUREE_APPAREIL_S = 5 * 3600; // écran de la salle : la durée d'un cours
export const DUREE_DEMANDE_S = 600; // une demande d'écran vit 10 min
export const DUREE_COURS_S = 4 * 3600; // « Démarrer le cours » : 4 h par défaut
const DUREE_OAUTH_S = 600;

const OPS_DIAPO = new Set(["lancer", "fermer", "reveler", "relancer", "garde_effacer"]);
const RE_JETON = /^diapo:([A-Za-z0-9_.-]{1,40}):([A-Za-z0-9_-]{32})$/;
const ALPHABET_CODE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans 0/O, 1/I

const env = () => globalThis.process?.env || {};
const enDev = () => env().POLL_DEV === "1";

// ─── Clés de stockage ───────────────────────────────────────────────────────
const cleSession = (id) => `poll:auth:session:${empreinte(id)}`;
const cleOauth = (etat) => `poll:auth:oauth:${empreinte(etat)}`;
const cleDemande = (id) => `poll:auth:demande:${empreinte(id)}`;
const cleCode = (code) => `poll:auth:code:${code}`;
export const cleCours = (salle) => `poll:${salle}:cours`;

// On ne stocke que l'empreinte des identifiants secrets : une fuite du stockage
// ne donne pas de cookie valide.
function empreinte(valeur) {
  return createHash("sha256").update(String(valeur), "utf8").digest("base64url");
}

function aleatoire(n = 32) {
  return randomBytes(n).toString("base64url");
}

export function memeValeur(a, b) {
  const ha = createHash("sha256").update(String(a), "utf8").digest();
  const hb = createHash("sha256").update(String(b), "utf8").digest();
  return timingSafeEqual(ha, hb);
}

// ─── Cookies ────────────────────────────────────────────────────────────────
// En production : préfixe __Host- (HTTPS, chemin /, pas de domaine). En dev (http
// local), le même cookie sans Secure.
export function nomCookie(base) {
  return enDev() ? `lp_${base}` : `__Host-lp_${base}`;
}

export function lireCookies(req) {
  const brut = req.headers?.cookie || "";
  const sortie = {};
  for (const morceau of String(brut).split(";")) {
    const i = morceau.indexOf("=");
    if (i < 0) continue;
    const nom = morceau.slice(0, i).trim();
    if (!nom) continue;
    try {
      sortie[nom] = decodeURIComponent(morceau.slice(i + 1).trim());
    } catch {
      /* cookie illisible : ignoré */
    }
  }
  return sortie;
}

export function cookie(base, valeur, maxAge) {
  const parties = [`${nomCookie(base)}=${encodeURIComponent(valeur)}`, "Path=/", "HttpOnly", "SameSite=Lax"];
  if (!enDev()) parties.push("Secure");
  parties.push(`Max-Age=${Math.max(0, Math.floor(maxAge))}`);
  return parties.join("; ");
}

export function ajouterCookie(res, valeur) {
  const actuel = res.getHeader?.("Set-Cookie");
  const liste = actuel ? (Array.isArray(actuel) ? actuel : [actuel]) : [];
  res.setHeader("Set-Cookie", [...liste, valeur]);
}

// ─── Sessions ───────────────────────────────────────────────────────────────
export async function creerSession(store, { login, type, duree }) {
  const id = aleatoire(32);
  const expire = Date.now() + duree * 1000;
  await store.set(cleSession(id), JSON.stringify({ login, type, expire, cree: Date.now() }), duree);
  return { id, expire };
}

export async function lireSession(store, req) {
  const id = lireCookies(req)[nomCookie("session")];
  if (!id || id.length > 100) return null;
  const brut = await store.get(cleSession(id));
  if (!brut) return null;
  try {
    const s = JSON.parse(brut);
    if (!s || Number(s.expire) <= Date.now()) return null;
    return { ...s, id };
  } catch {
    return null;
  }
}

export async function supprimerSession(store, id) {
  if (id) await store.del(cleSession(id));
}

// Requête authentifiée par cookie qui modifie quelque chose : l'Origin, si le
// navigateur l'envoie, doit être le site lui-même (SameSite=Lax couvre déjà le
// cas général ; ceci ferme les sous-domaines et les vieux navigateurs).
export function origineAcceptable(req) {
  const origine = req.headers?.origin;
  if (!origine) return true;
  const hote = req.headers?.["x-forwarded-host"] || req.headers?.host;
  if (!hote) return false;
  try {
    return new URL(origine).host === String(hote).split(",")[0].trim();
  } catch {
    return false;
  }
}

// ─── Jetons de diapositive ─────────────────────────────────────────────────
export function jetonDiapo(cleEnseignant, salle, id) {
  const signature = createHmac("sha256", String(cleEnseignant))
    .update(`diapo:${salle}:${id}`, "utf8")
    .digest("base64url")
    .slice(0, 32);
  return `diapo:${id}:${signature}`;
}

export function lireJeton(fourni, cleEnseignant, salle) {
  const m = RE_JETON.exec(String(fourni || ""));
  if (!m) return null;
  return memeValeur(fourni, jetonDiapo(cleEnseignant, salle, m[1])) ? { id: m[1] } : { invalide: true };
}

export function opPermiseDiapo(op, idQuestion, idJeton) {
  return OPS_DIAPO.has(op) && idQuestion === idJeton;
}

// ─── Cours démarré (les jetons de diapositive ne marchent que pendant le cours) ─
export async function lireCours(store, salle) {
  const brut = await store.get(cleCours(salle));
  if (!brut) return null;
  try {
    const c = JSON.parse(brut);
    return Number(c.jusqua) > Date.now() ? c : null;
  } catch {
    return null;
  }
}

export async function demarrerCours(store, salle, duree = DUREE_COURS_S) {
  const c = { depuis: Date.now(), jusqua: Date.now() + duree * 1000 };
  await store.set(cleCours(salle), JSON.stringify(c), duree);
  return c;
}

export async function terminerCours(store, salle) {
  await store.del(cleCours(salle));
}

// ─── Accès à l'API du sondage ──────────────────────────────────────────────
// → { niveau: "cle" | "session" | "diapo", id?, login? } ; sinon { code, message }.
export async function verifierAcces(req, store, salle) {
  const attendue = env().POLL_TEACHER_KEY || "";
  if (!attendue) return { code: 503, message: "Serveur non configuré : définissez POLL_TEACHER_KEY." };

  const entete = req.headers?.authorization || req.headers?.Authorization || "";
  const m = /^Bearer\s+(.+)$/i.exec(String(entete).trim());
  if (m) {
    const fourni = m[1].trim();
    const jeton = lireJeton(fourni, attendue, salle);
    if (jeton?.invalide) return { code: 403, message: "Jeton de diapositive invalide." };
    if (jeton) {
      if (!(await lireCours(store, salle))) {
        return { code: 423, message: "Cours non démarré : démarrez-le depuis /admin." };
      }
      return { niveau: "diapo", id: jeton.id };
    }
    if (memeValeur(fourni, attendue)) return { niveau: "cle" };
    return { code: 403, message: "Clé enseignant invalide." };
  }

  const session = await lireSession(store, req);
  if (session) {
    if (String(req.method || "GET").toUpperCase() !== "GET" && !origineAcceptable(req)) {
      return { code: 403, message: "Origine refusée." };
    }
    return { niveau: "session", login: session.login, type: session.type };
  }
  return { code: 401, message: "Connexion requise : ouvrez /admin pour vous connecter." };
}

// ─── GitHub ─────────────────────────────────────────────────────────────────
function github() {
  const e = env();
  // POLL_GITHUB_BASE : en dev, un faux GitHub servi par dev/server.mjs.
  const base = (enDev() && e.POLL_GITHUB_BASE) || "";
  return {
    autoriser: base ? `${base}/login/oauth/authorize` : "https://github.com/login/oauth/authorize",
    jeton: base ? `${base}/login/oauth/access_token` : "https://github.com/login/oauth/access_token",
    utilisateur: base ? `${base}/api/user` : "https://api.github.com/user",
    id: e.GITHUB_CLIENT_ID || "",
    secret: e.GITHUB_CLIENT_SECRET || "",
    admin: String(e.POLL_ADMIN_GITHUB_ID || "").trim(),
  };
}

export function configurationGithub() {
  const g = github();
  const manque = [];
  if (!g.id) manque.push("GITHUB_CLIENT_ID");
  if (!g.secret) manque.push("GITHUB_CLIENT_SECRET");
  if (!g.admin) manque.push("POLL_ADMIN_GITHUB_ID");
  if (!env().POLL_TEACHER_KEY) manque.push("POLL_TEACHER_KEY");
  return { ok: manque.length === 0, manque, ...g };
}

// Seul un chemin du site, jamais une autre origine (« //exemple.com », « /\… »).
export function retourSur(valeur, defaut = "/admin/") {
  const v = String(valeur || "");
  if (!v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\") || v.length > 300) return defaut;
  return /^[\x21-\x7e]+$/.test(v) ? v : defaut;
}

function origineDuSite(req) {
  const hote = String(req.headers?.["x-forwarded-host"] || req.headers?.host || "").split(",")[0].trim();
  const proto = String(req.headers?.["x-forwarded-proto"] || (enDev() ? "http" : "https")).split(",")[0].trim();
  return `${proto}://${hote}`;
}

// GITHUB_CALLBACK_URL fixe l'adresse déclarée dans l'application GitHub : sans
// elle, une visite sur www.… enverrait une adresse différente et GitHub refuserait.
export function adresseRetourGithub(req) {
  const fixe = String(env().GITHUB_CALLBACK_URL || "").trim();
  if (/^https?:\/\/[^/]+\/api\/auth\/callback$/.test(fixe)) return fixe;
  return `${origineDuSite(req)}/api/auth/callback`;
}

export async function debutConnexion(store, req, retour) {
  const g = configurationGithub();
  const etat = aleatoire(24);
  await store.set(cleOauth(etat), JSON.stringify({ retour: retourSur(retour) }), DUREE_OAUTH_S);
  const url = new URL(g.autoriser);
  url.searchParams.set("client_id", g.id);
  url.searchParams.set("redirect_uri", adresseRetourGithub(req));
  url.searchParams.set("state", etat);
  url.searchParams.set("allow_signup", "false");
  // Aucune portée : seul l'identifiant public du compte est lu.
  return { url: url.href, etat };
}

export async function finConnexion(store, req, { code, etat, etatCookie }, fetchImpl = fetch) {
  const g = configurationGithub();
  if (!code || !etat || !etatCookie || !memeValeur(etat, etatCookie)) {
    return { erreur: "Connexion interrompue (état invalide). Recommencez." };
  }
  const brut = await store.get(cleOauth(etat));
  await store.del(cleOauth(etat));
  if (!brut) return { erreur: "Connexion expirée. Recommencez." };
  const { retour } = JSON.parse(brut);

  const r = await fetchImpl(g.jeton, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: g.id, client_secret: g.secret, code, redirect_uri: adresseRetourGithub(req) }),
  });
  const jeton = await r.json().catch(() => ({}));
  if (!r.ok || !jeton.access_token) return { erreur: "GitHub a refusé la connexion." };

  const u = await fetchImpl(g.utilisateur, {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${jeton.access_token}`, "User-Agent": "live-poll" },
  });
  const profil = await u.json().catch(() => ({}));
  if (!u.ok || profil.id === undefined) return { erreur: "Profil GitHub illisible." };
  // On compare l'identifiant numérique, qui ne change pas si le pseudo change.
  if (String(profil.id) !== g.admin) return { erreur: `Le compte ${profil.login || "?"} n'a pas accès.`, refuse: true };

  const session = await creerSession(store, { login: profil.login, type: "github", duree: DUREE_SESSION_S });
  return { session, retour, login: profil.login };
}

// ─── Écran de la salle approuvé depuis le téléphone ─────────────────────────
function codeLisible() {
  const octets = randomBytes(6);
  let c = "";
  for (const o of octets) c += ALPHABET_CODE[o % ALPHABET_CODE.length];
  return c;
}

export const formaterCode = (code) => `${code.slice(0, 3)}-${code.slice(3)}`;
export const normaliserCode = (saisie) => String(saisie || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

export async function creerDemande(store) {
  const id = aleatoire(32);
  let code = codeLisible();
  for (let i = 0; i < 4 && (await store.get(cleCode(code))); i += 1) code = codeLisible();
  const demande = { code, statut: "attente", cree: Date.now() };
  await store.pipeline([
    ["set", cleDemande(id), JSON.stringify(demande), DUREE_DEMANDE_S],
    ["set", cleCode(code), empreinte(id), DUREE_DEMANDE_S],
  ]);
  return { id, code };
}

// Le téléphone connecté approuve le code affiché sur l'écran.
export async function approuverDemande(store, code, login) {
  const c = normaliserCode(code);
  if (c.length !== 6) return { erreur: "Code invalide." };
  const empreinteId = await store.get(cleCode(c));
  if (!empreinteId) return { erreur: "Code inconnu ou expiré." };
  const cle = `poll:auth:demande:${empreinteId}`;
  const brut = await store.get(cle);
  if (!brut) return { erreur: "Demande expirée." };
  const demande = JSON.parse(brut);
  demande.statut = "approuvee";
  demande.par = login;
  await store.set(cle, JSON.stringify(demande), DUREE_DEMANDE_S);
  await store.del(cleCode(c));
  return { ok: true, code: formaterCode(c) };
}

// L'écran interroge avec son identifiant secret ; une fois approuvé, il reçoit sa
// session (une seule fois) et la demande disparaît.
export async function suivreDemande(store, id) {
  if (!id || String(id).length > 100) return { statut: "inconnue" };
  const cle = cleDemande(id);
  const brut = await store.get(cle);
  if (!brut) return { statut: "inconnue" };
  const demande = JSON.parse(brut);
  if (demande.statut !== "approuvee") return { statut: "attente", code: formaterCode(demande.code) };
  await store.del(cle);
  const session = await creerSession(store, {
    login: demande.par,
    type: "appareil",
    duree: DUREE_APPAREIL_S,
  });
  return { statut: "approuvee", session };
}
