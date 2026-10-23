// lib/poll/store.js — stockage minimal du sondage.
//
// Deux implémentations de la même interface :
//   get, set(cle, valeur, ttl), hset(cle, champ, valeur, ttl), hgetall(cle),
//   hdel(cle, …champs), hincrby(cle, champ, n, ttl), hlen(cle), expire(cle, ttl),
//   del(…cles), pipeline([[methode, …args], …]).
//
// MemoryStore : mémoire du processus, pour le serveur de développement et les tests.
// UpstashStore : API REST d'Upstash, par fetch, sans SDK.

export const TTL_DEFAUT = 36 * 60 * 60; // 36 h — rétention maximale de la spec

const METHODES_PIPELINE = new Set([
  "get",
  "set",
  "hset",
  "hgetall",
  "hdel",
  "hincrby",
  "hlen",
  "expire",
  "del",
]);

export class ErreurStockage extends Error {
  constructor(message) {
    super(message);
    this.name = "ErreurStockage";
  }
}

// ---------------------------------------------------------------------------
// MemoryStore
// ---------------------------------------------------------------------------

export class MemoryStore {
  constructor({ horloge = () => Date.now() } = {}) {
    this.horloge = horloge;
    this.donnees = new Map();
  }

  _lire(cle) {
    const entree = this.donnees.get(cle);
    if (!entree) return null;
    if (entree.expire !== null && entree.expire <= this.horloge()) {
      this.donnees.delete(cle);
      return null;
    }
    return entree;
  }

  _ecrire(cle, entree, ttl) {
    if (ttl !== undefined && ttl !== null) {
      if (!Number.isFinite(ttl) || ttl <= 0) throw new ErreurStockage("TTL invalide.");
      entree.expire = this.horloge() + Math.round(ttl * 1000);
    }
    this.donnees.set(cle, entree);
    return entree;
  }

  async get(cle) {
    const entree = this._lire(cle);
    if (!entree) return null;
    if (entree.type !== "chaine") throw new ErreurStockage(`La clé « ${cle} » n'est pas une chaîne.`);
    return entree.valeur;
  }

  async set(cle, valeur, ttl) {
    if (typeof valeur !== "string") throw new ErreurStockage("set attend une chaîne.");
    this._ecrire(cle, { type: "chaine", valeur, expire: null }, ttl);
    return "OK";
  }

  async hset(cle, champ, valeur, ttl) {
    if (typeof champ !== "string" || champ === "") throw new ErreurStockage("Champ vide.");
    if (typeof valeur !== "string") throw new ErreurStockage("hset attend une chaîne.");
    const existante = this._lire(cle);
    const entree = existante || { type: "hash", valeur: new Map(), expire: null };
    if (entree.type !== "hash") throw new ErreurStockage(`La clé « ${cle} » n'est pas un hash.`);
    const nouveau = entree.valeur.has(champ) ? 0 : 1;
    entree.valeur.set(champ, valeur);
    this._ecrire(cle, entree, ttl);
    return nouveau;
  }

  async hgetall(cle) {
    const entree = this._lire(cle);
    if (!entree) return {};
    if (entree.type !== "hash") throw new ErreurStockage(`La clé « ${cle} » n'est pas un hash.`);
    return Object.fromEntries(entree.valeur);
  }

  async hdel(cle, ...champs) {
    const entree = this._lire(cle);
    if (!entree) return 0;
    if (entree.type !== "hash") throw new ErreurStockage(`La clé « ${cle} » n'est pas un hash.`);
    let supprimes = 0;
    for (const champ of champs) if (entree.valeur.delete(champ)) supprimes += 1;
    if (entree.valeur.size === 0) this.donnees.delete(cle);
    return supprimes;
  }

  async hincrby(cle, champ, n = 1, ttl) {
    const existante = this._lire(cle);
    const entree = existante || { type: "hash", valeur: new Map(), expire: null };
    if (entree.type !== "hash") throw new ErreurStockage(`La clé « ${cle} » n'est pas un hash.`);
    const actuel = entree.valeur.has(champ) ? Number(entree.valeur.get(champ)) : 0;
    if (!Number.isFinite(actuel)) throw new ErreurStockage("Compteur non numérique.");
    const suivant = actuel + Number(n);
    entree.valeur.set(champ, String(suivant));
    this._ecrire(cle, entree, ttl);
    return suivant;
  }

  async hlen(cle) {
    const entree = this._lire(cle);
    if (!entree) return 0;
    if (entree.type !== "hash") throw new ErreurStockage(`La clé « ${cle} » n'est pas un hash.`);
    return entree.valeur.size;
  }

  async expire(cle, ttl) {
    const entree = this._lire(cle);
    if (!entree) return false;
    if (!Number.isFinite(ttl) || ttl <= 0) throw new ErreurStockage("TTL invalide.");
    entree.expire = this.horloge() + Math.round(ttl * 1000);
    return true;
  }

  async del(...cles) {
    let supprimees = 0;
    for (const cle of cles) if (this.donnees.delete(cle)) supprimees += 1;
    return supprimees;
  }

  async pipeline(commandes) {
    const resultats = [];
    for (const [methode, ...args] of commandes) {
      if (!METHODES_PIPELINE.has(methode)) {
        throw new ErreurStockage(`Commande inconnue dans le pipeline : « ${methode} ».`);
      }
      resultats.push(await this[methode](...args));
    }
    return resultats;
  }

  /** Utilitaire de test : secondes restantes avant expiration, ou null. */
  ttlRestant(cle) {
    const entree = this._lire(cle);
    if (!entree || entree.expire === null) return null;
    return Math.round(((entree.expire - this.horloge()) / 1000) * 1000) / 1000;
  }
}

// ---------------------------------------------------------------------------
// UpstashStore
// ---------------------------------------------------------------------------

function normaliserHgetall(resultat) {
  if (!resultat) return {};
  if (Array.isArray(resultat)) {
    const objet = {};
    for (let i = 0; i + 1 < resultat.length; i += 2) objet[resultat[i]] = resultat[i + 1];
    return objet;
  }
  if (typeof resultat === "object") return { ...resultat };
  return {};
}

export class UpstashStore {
  constructor({ url, token, fetchImpl } = {}) {
    if (!url || !token) {
      throw new ErreurStockage(
        "Stockage non configuré : UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN sont requis.",
      );
    }
    this.url = String(url).replace(/\/+$/, "");
    this.token = String(token);
    this.fetch = fetchImpl || globalThis.fetch;
    if (typeof this.fetch !== "function") {
      throw new ErreurStockage("fetch est indisponible dans cet environnement.");
    }
  }

  async _poster(chemin, corps) {
    let reponse;
    try {
      reponse = await this.fetch(`${this.url}${chemin}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(corps),
      });
    } catch (e) {
      throw new ErreurStockage(`Stockage injoignable : ${e.message}`);
    }
    if (!reponse.ok) {
      const texte = await reponse.text().catch(() => "");
      throw new ErreurStockage(
        `Stockage : réponse HTTP ${reponse.status}${texte ? ` — ${texte.slice(0, 200)}` : ""}`,
      );
    }
    try {
      return await reponse.json();
    } catch {
      throw new ErreurStockage("Stockage : réponse JSON illisible.");
    }
  }

  async cmd(...args) {
    const reponse = await this._poster("", args);
    if (reponse && reponse.error) throw new ErreurStockage(`Redis : ${reponse.error}`);
    return reponse ? (reponse.result ?? null) : null;
  }

  _commande(methode, args) {
    switch (methode) {
      case "set": {
        const [cle, valeur, ttl] = args;
        return ttl === undefined || ttl === null
          ? ["SET", cle, valeur]
          : ["SET", cle, valeur, "EX", String(ttl)];
      }
      case "get":
        return ["GET", args[0]];
      case "hset":
        return ["HSET", args[0], args[1], args[2]];
      case "hgetall":
        return ["HGETALL", args[0]];
      case "hdel":
        return ["HDEL", args[0], ...args.slice(1)];
      case "hincrby":
        return ["HINCRBY", args[0], args[1], String(args[2] ?? 1)];
      case "hlen":
        return ["HLEN", args[0]];
      case "expire":
        return ["EXPIRE", args[0], String(args[1])];
      case "del":
        return ["DEL", ...args];
      default:
        throw new ErreurStockage(`Commande inconnue : « ${methode} ».`);
    }
  }

  async pipeline(commandes) {
    const redis = commandes.map(([methode, ...args]) => {
      if (!METHODES_PIPELINE.has(methode)) {
        throw new ErreurStockage(`Commande inconnue dans le pipeline : « ${methode} ».`);
      }
      return this._commande(methode, args);
    });
    const reponse = await this._poster("/pipeline", redis);
    if (!Array.isArray(reponse)) throw new ErreurStockage("Stockage : réponse de pipeline invalide.");
    return reponse.map((r, i) => {
      if (r && r.error) throw new ErreurStockage(`Redis (${redis[i][0]}) : ${r.error}`);
      const valeur = r ? (r.result ?? null) : null;
      // Même contrat que hgetall() : toujours un objet, jamais une liste plate.
      return redis[i][0] === "HGETALL" ? normaliserHgetall(valeur) : valeur;
    });
  }

  async get(cle) {
    return this.cmd("GET", cle);
  }

  async set(cle, valeur, ttl) {
    if (ttl === undefined || ttl === null) return this.cmd("SET", cle, valeur);
    return this.cmd("SET", cle, valeur, "EX", String(ttl));
  }

  async hset(cle, champ, valeur, ttl) {
    if (ttl === undefined || ttl === null) return this.cmd("HSET", cle, champ, valeur);
    const [ajoute] = await this.pipeline([
      ["hset", cle, champ, valeur],
      ["expire", cle, ttl],
    ]);
    return ajoute;
  }

  async hgetall(cle) {
    return normaliserHgetall(await this.cmd("HGETALL", cle));
  }

  async hdel(cle, ...champs) {
    return this.cmd("HDEL", cle, ...champs);
  }

  async hincrby(cle, champ, n = 1, ttl) {
    if (ttl === undefined || ttl === null) return this.cmd("HINCRBY", cle, champ, String(n));
    const [valeur] = await this.pipeline([
      ["hincrby", cle, champ, n],
      ["expire", cle, ttl],
    ]);
    return valeur;
  }

  async hlen(cle) {
    return this.cmd("HLEN", cle);
  }

  async expire(cle, ttl) {
    return this.cmd("EXPIRE", cle, String(ttl));
  }

  async del(...cles) {
    if (cles.length === 0) return 0;
    return this.cmd("DEL", ...cles);
  }
}

// ---------------------------------------------------------------------------
// Sélection depuis l'environnement
// ---------------------------------------------------------------------------

/**
 * Upstash si des variables REST existent (UPSTASH_* ou KV_* de Vercel),
 * MemoryStore uniquement en développement explicite (POLL_DEV=1) ou en test.
 * Sinon : ErreurStockage — jamais de MemoryStore silencieux en production.
 */
export function creerStoreDepuisEnv(env = globalThis.process?.env || {}) {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL || "";
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN || "";
  if (url && token) return new UpstashStore({ url, token });

  const dev = env.POLL_DEV === "1" || env.NODE_ENV === "test";
  if (dev) return new MemoryStore();

  throw new ErreurStockage(
    "Stockage non configuré : définissez UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN " +
      "(ou KV_REST_API_URL et KV_REST_API_TOKEN).",
  );
}
