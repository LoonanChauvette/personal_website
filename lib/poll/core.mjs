// public/q/core.js — logique pure partagée entre le navigateur et le serveur.
//
// Gabarits, validation des réponses, agrégation, lecture de la banque Markdown et
// des raccourcis de lancement. Aucune entrée/sortie, aucune dépendance : ce module
// est importé tel quel par les pages (ESM navigateur) et par api/poll.js (Node).

export const TYPES = Object.freeze([
  "choix",
  "multiple",
  "vraifaux",
  "echelle",
  "curseur",
  "nombre",
  "nuage",
  "texte",
  "classement",
  "serie",
]);

// Une « série » regroupe plusieurs sous-questions sur une même diapositive (une seule
// question pour le serveur : un lancement, une révélation). Sous-types admis : tous sauf
// « serie » (pas d'imbrication).
const MIN_SOUS = 2;
const MAX_SOUS = 9;

const LETTRES = Object.freeze("ABCDEF".split(""));
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;
const MAX_CARACTERES_MOT = 40;

// ---------------------------------------------------------------------------
// Petits utilitaires
// ---------------------------------------------------------------------------

function estObjet(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function texteOu(v, defaut = "") {
  if (v === undefined || v === null) return defaut;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  throw new Error("Une valeur textuelle est attendue.");
}

function entierDans(v, defaut, min, max, nom) {
  if (v === undefined || v === null || v === "") return defaut;
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new Error(`${nom} doit être un nombre entier.`);
  }
  if (n < min || n > max) {
    throw new Error(`${nom} doit être compris entre ${min} et ${max}.`);
  }
  return n;
}

function longueur(texte) {
  return Array.from(texte).length;
}

function arrondir(x, decimales = 6) {
  if (!Number.isFinite(x)) return x;
  const facteur = 10 ** decimales;
  return Math.round(x * facteur) / facteur;
}

function normaliserVraiFaux(v) {
  const s = String(v).trim().toLowerCase();
  if (["v", "vrai", "true"].includes(s)) return "V";
  if (["f", "faux", "false"].includes(s)) return "F";
  throw new Error(`Réponse Vrai/Faux attendue (reçu « ${v} »).`);
}

function normaliserOptions(brut, nbOptions) {
  let liste;
  if (brut === undefined || brut === null) {
    const n = entierDans(nbOptions, 4, MIN_OPTIONS, MAX_OPTIONS, "Le nombre d'options");
    liste = Array.from({ length: n }, (_, i) => ({ cle: LETTRES[i], texte: "" }));
  } else if (Array.isArray(brut)) {
    if (brut.length < MIN_OPTIONS || brut.length > MAX_OPTIONS) {
      throw new Error(
        `Une question à options doit en offrir entre ${MIN_OPTIONS} et ${MAX_OPTIONS} (reçu ${brut.length}).`,
      );
    }
    liste = brut.map((o, i) => {
      if (typeof o === "string") return { cle: LETTRES[i], texte: o.trim() };
      if (!estObjet(o)) throw new Error(`Option ${i + 1} invalide.`);
      const cle = o.cle === undefined || o.cle === null ? LETTRES[i] : String(o.cle).trim().toUpperCase();
      return { cle, texte: texteOu(o.texte).trim() };
    });
  } else {
    throw new Error("Le champ « options » doit être une liste.");
  }

  const vues = new Set();
  for (const o of liste) {
    if (!/^[A-F]$/.test(o.cle)) {
      throw new Error(`Clé d'option invalide « ${o.cle} » : une lettre de A à F est attendue.`);
    }
    if (vues.has(o.cle)) throw new Error(`Clé d'option en double : « ${o.cle} ».`);
    vues.add(o.cle);
  }
  return liste;
}

function normaliserItems(brut) {
  if (brut === undefined || brut === null) {
    return LETTRES.slice(0, 4).map((cle) => ({ cle, texte: "" }));
  }
  if (!Array.isArray(brut)) throw new Error("Le champ « items » doit être une liste.");
  if (brut.length < MIN_OPTIONS || brut.length > MAX_OPTIONS) {
    throw new Error(`Un classement doit compter entre ${MIN_OPTIONS} et ${MAX_OPTIONS} items.`);
  }
  const items = brut.map((o, i) => {
    if (typeof o === "string") return { cle: LETTRES[i], texte: o.trim() };
    if (!estObjet(o)) throw new Error(`Item ${i + 1} invalide.`);
    const cle = o.cle === undefined || o.cle === null ? LETTRES[i] : String(o.cle).trim().toUpperCase();
    return { cle, texte: texteOu(o.texte).trim() };
  });
  const vues = new Set();
  for (const it of items) {
    if (!/^[A-F]$/.test(it.cle)) {
      throw new Error(`Clé d'item invalide « ${it.cle} » : une lettre de A à F est attendue.`);
    }
    if (vues.has(it.cle)) throw new Error(`Clé d'item en double : « ${it.cle} ».`);
    vues.add(it.cle);
  }
  return items;
}

// ---------------------------------------------------------------------------
// Gabarits
// ---------------------------------------------------------------------------

/**
 * Complète un gabarit avec ses valeurs par défaut et le valide.
 * Lève une Error (message en français) si le gabarit est invalide.
 */
export function normaliserGabarit(type, gabarit) {
  if (typeof type !== "string" || !TYPES.includes(type)) {
    throw new Error(`Type de question inconnu : « ${type} ».`);
  }
  if (gabarit !== undefined && gabarit !== null && !estObjet(gabarit)) {
    throw new Error("Le gabarit doit être un objet.");
  }
  const g = gabarit || {};
  const base = {
    texte: texteOu(g.texte).trim(),
    masquer_texte: g.masquer_texte === true,
  };

  switch (type) {
    case "choix":
    case "multiple": {
      const options = normaliserOptions(g.options, g.nb_options);
      const cles = new Set(options.map((o) => o.cle));
      let bonnes = g.bonnes;
      if (bonnes === undefined || bonnes === null) bonnes = [];
      else if (!Array.isArray(bonnes)) bonnes = [bonnes];
      bonnes = [...new Set(bonnes.map((b) => String(b).trim().toUpperCase()))];
      for (const b of bonnes) {
        if (!cles.has(b)) throw new Error(`Bonne réponse « ${b} » absente des options.`);
      }
      return { ...base, options, bonnes };
    }

    case "vraifaux": {
      let bonnes = g.bonnes;
      if (bonnes === undefined || bonnes === null) bonnes = [];
      else if (!Array.isArray(bonnes)) bonnes = [bonnes];
      bonnes = [...new Set(bonnes.map(normaliserVraiFaux))];
      if (bonnes.length > 1) throw new Error("Une question Vrai/Faux n'a qu'une seule bonne réponse.");
      return { ...base, bonnes };
    }

    case "echelle": {
      const min = entierDans(g.min, 1, -1000, 1000, "Le minimum de l'échelle");
      const max = entierDans(g.max, 5, -1000, 1000, "Le maximum de l'échelle");
      if (min >= max) throw new Error("Le minimum de l'échelle doit être inférieur au maximum.");
      if (max - min > 10) throw new Error("Une échelle compte au plus 11 points (max − min ≤ 10).");
      return {
        ...base,
        min,
        max,
        ancre_min: texteOu(g.ancre_min).trim(),
        ancre_max: texteOu(g.ancre_max).trim(),
      };
    }

    case "curseur": {
      const min = entierDans(g.min, 0, -1000, 1000, "Le minimum du curseur");
      const max = entierDans(g.max, 100, -1000, 1000, "Le maximum du curseur");
      if (min >= max) throw new Error("Le minimum du curseur doit être inférieur au maximum.");
      if (max - min > 1000) throw new Error("L'étendue du curseur ne peut dépasser 1000.");
      return {
        ...base,
        min,
        max,
        ancre_min: texteOu(g.ancre_min, "Aucune différence").trim(),
        ancre_max: texteOu(g.ancre_max, "Très différent").trim(),
      };
    }

    case "nombre": {
      // Bonne(s) réponse(s) facultative(s) : nombres, avec une tolérance absolue facultative.
      let bonnes = g.bonnes;
      if (bonnes === undefined || bonnes === null) bonnes = [];
      else if (!Array.isArray(bonnes)) bonnes = [bonnes];
      bonnes = bonnes.map((b) => Number(String(b).replace(",", ".")));
      if (bonnes.some((b) => !Number.isFinite(b))) throw new Error("Bonne réponse numérique invalide.");
      if (bonnes.length > 3) throw new Error("Une question numérique a au plus 3 bonnes réponses.");
      const tolerance = g.tolerance === undefined || g.tolerance === null ? 0 : Number(g.tolerance);
      if (!Number.isFinite(tolerance) || tolerance < 0) throw new Error("Tolérance invalide.");
      return { ...base, unite: texteOu(g.unite).trim().slice(0, 16), bonnes, tolerance };
    }

    case "nuage":
      return { ...base, max_mots: entierDans(g.max_mots, 3, 1, 10, "Le nombre de mots") };

    case "texte":
      return { ...base, max: entierDans(g.max, 280, 1, 2000, "La longueur maximale") };

    case "classement":
      return { ...base, items: normaliserItems(g.items) };

    case "serie": {
      if (!Array.isArray(g.questions)) throw new Error("Une série demande une liste « questions ».");
      if (g.questions.length < MIN_SOUS || g.questions.length > MAX_SOUS) {
        throw new Error(`Une série compte entre ${MIN_SOUS} et ${MAX_SOUS} questions (reçu ${g.questions.length}).`);
      }
      const vues = new Set();
      const questions = g.questions.map((sq, i) => {
        if (!estObjet(sq)) throw new Error(`Sous-question ${i + 1} invalide.`);
        const cle = sq.cle === undefined || sq.cle === null ? String(i + 1) : String(sq.cle).trim();
        if (!/^[A-Za-z0-9_-]{1,12}$/.test(cle)) throw new Error(`Clé de sous-question invalide « ${cle} ».`);
        if (vues.has(cle)) throw new Error(`Clé de sous-question en double : « ${cle} ».`);
        vues.add(cle);
        if (sq.type === "serie") throw new Error("Une série ne peut pas contenir de série.");
        const { type: _t, cle: _c, etiquette, ...reste } = sq;
        let sous;
        try {
          sous = normaliserGabarit(sq.type, reste);
        } catch (e) {
          throw new Error(`Sous-question ${cle} : ${e.message}`);
        }
        // Étiquette courte affichée à la place de la clé (« a », « F0 »…) ; la clé reste l'identifiant.
        return { cle, type: sq.type, etiquette: texteOu(etiquette).trim().slice(0, 24), ...sous };
      });
      // Colonnes : les sous-questions remplissent les colonnes l'une après l'autre
      // (série « 3 sons × 3 questions » → une colonne par son).
      const colonnes = entierDans(g.colonnes, 1, 1, 3, "Le nombre de colonnes");
      // Matrice facultative : titres des colonnes (ex. « Son 1 ») et des lignes (ex.
      // « a · Périodicité ») ; les sous-questions remplissent les colonnes l'une après l'autre.
      const titres = (liste, max, nom) => {
        if (liste === undefined || liste === null) return [];
        if (!Array.isArray(liste) || liste.length > max) throw new Error(`« ${nom} » : au plus ${max} titres.`);
        return liste.map((t) => texteOu(t).trim().slice(0, 40));
      };
      const titres_colonnes = titres(g.titres_colonnes, colonnes, "titres_colonnes");
      const titres_lignes = titres(g.titres_lignes, Math.ceil(questions.length / colonnes), "titres_lignes");
      return { ...base, colonnes, titres_colonnes, titres_lignes, questions };
    }

    default:
      throw new Error(`Type de question inconnu : « ${type} ».`);
  }
}

// ---------------------------------------------------------------------------
// Validation des réponses
// ---------------------------------------------------------------------------

function refus(erreur) {
  return { ok: false, erreur };
}

/**
 * Valide et normalise une réponse.
 * -> {ok:true, valeur} | {ok:false, erreur:"…"}
 */
export function validerReponse(type, gabarit, reponse) {
  let g;
  try {
    g = normaliserGabarit(type, gabarit);
  } catch (e) {
    return refus(`Question mal configurée : ${e.message}`);
  }
  if (reponse === undefined || reponse === null) return refus("Réponse manquante.");

  switch (type) {
    case "choix": {
      if (typeof reponse !== "string") return refus("Une lettre est attendue.");
      const cle = reponse.trim().toUpperCase();
      if (!g.options.some((o) => o.cle === cle)) {
        return refus(`« ${reponse} » ne fait pas partie des options proposées.`);
      }
      return { ok: true, valeur: cle };
    }

    case "multiple": {
      let brut = reponse;
      if (typeof brut === "string") brut = brut.split(/[\s,;]+/).filter(Boolean);
      if (!Array.isArray(brut)) return refus("Une liste de lettres est attendue.");
      const cles = [...new Set(brut.map((r) => String(r).trim().toUpperCase()))].filter(Boolean);
      if (cles.length === 0) return refus("Sélectionnez au moins une réponse.");
      for (const c of cles) {
        if (!g.options.some((o) => o.cle === c)) {
          return refus(`« ${c} » ne fait pas partie des options proposées.`);
        }
      }
      const rang = new Map(g.options.map((o, i) => [o.cle, i]));
      cles.sort((a, b) => rang.get(a) - rang.get(b));
      return { ok: true, valeur: cles };
    }

    case "vraifaux": {
      try {
        return { ok: true, valeur: normaliserVraiFaux(reponse) };
      } catch {
        return refus("Réponse attendue : Vrai (V) ou Faux (F).");
      }
    }

    case "echelle": {
      const n = typeof reponse === "number"
        ? reponse
        : reponse.trim() === "" ? NaN : Number(String(reponse).trim().replace(",", "."));
      if (!Number.isFinite(n)) return refus("Un nombre est attendu.");
      if (!Number.isInteger(n)) return refus("L'échelle attend un nombre entier.");
      if (n < g.min || n > g.max) {
        return refus(`La valeur doit être comprise entre ${g.min} et ${g.max}.`);
      }
      return { ok: true, valeur: n };
    }

    case "curseur": {
      const n = typeof reponse === "number"
        ? reponse
        : reponse.trim() === "" ? NaN : Number(String(reponse).trim().replace(",", "."));
      if (!Number.isFinite(n)) return refus("Un nombre est attendu.");
      if (n < g.min || n > g.max) {
        return refus(`La valeur doit être comprise entre ${g.min} et ${g.max}.`);
      }
      return { ok: true, valeur: arrondir(n, 1) };
    }

    case "nombre": {
      const n = typeof reponse === "number"
        ? reponse
        : reponse.trim() === "" ? NaN : Number(String(reponse).trim().replace(",", "."));
      if (!Number.isFinite(n)) return refus("Un nombre fini est attendu.");
      if (Math.abs(n) > 1e12) return refus("Ce nombre est hors des limites acceptées.");
      return { ok: true, valeur: arrondir(n, 6) };
    }

    case "nuage": {
      const mots = Array.isArray(reponse) ? reponse : typeof reponse === "string" ? [reponse] : null;
      if (!mots || mots.some((m) => typeof m !== "string")) return refus("Des entrées textuelles sont attendues.");
      if (mots.length > g.max_mots) return refus(`Au plus ${g.max_mots} entrées par réponse.`);
      const entrees = mots.map((m) => m.trim().replace(/\s+/g, " "));
      if (entrees.some((m) => !m || longueur(m) > MAX_CARACTERES_MOT || m.split(/\s+/).length > 3)) {
        return refus("Chaque entrée doit compter de 1 à 3 mots et au plus 40 caractères.");
      }
      return { ok: true, valeur: entrees };
    }

    case "texte": {
      if (typeof reponse !== "string") return refus("Un texte est attendu.");
      const t = reponse.trim();
      if (!t) return refus("La réponse est vide.");
      if (longueur(t) > g.max) return refus(`Le texte dépasse ${g.max} caractères.`);
      return { ok: true, valeur: t };
    }

    case "classement": {
      if (!Array.isArray(reponse)) return refus("Un ordre complet est attendu.");
      const cles = reponse.map((r) => String(r).trim().toUpperCase());
      const attendues = g.items.map((i) => i.cle);
      if (cles.length !== attendues.length) return refus("Tous les items doivent être classés.");
      if (new Set(cles).size !== cles.length) return refus("Un item apparaît deux fois.");
      for (const c of cles) {
        if (!attendues.includes(c)) return refus(`« ${c} » n'est pas un item de cette question.`);
      }
      return { ok: true, valeur: cles };
    }

    case "serie": {
      // Réponse = objet {cleSousQuestion: réponse}. Réponse partielle admise (au moins une) :
      // l'étudiant peut répondre au fur et à mesure ; un nouvel envoi remplace le précédent.
      if (!estObjet(reponse)) return refus("Un objet {sous-question: réponse} est attendu.");
      const valeur = {};
      for (const [cle, brute] of Object.entries(reponse)) {
        const sq = g.questions.find((q) => q.cle === cle);
        if (!sq) return refus(`« ${cle} » n'est pas une question de cette série.`);
        if (brute === undefined || brute === null || brute === "") continue;
        const r = validerReponse(sq.type, sq, brute);
        if (!r.ok) return refus(`Question ${cle} : ${r.erreur}`);
        valeur[cle] = r.valeur;
      }
      if (Object.keys(valeur).length === 0) return refus("Répondez à au moins une question.");
      return { ok: true, valeur };
    }

    default:
      return refus(`Type de question inconnu : « ${type} ».`);
  }
}

// ---------------------------------------------------------------------------
// Agrégation
// ---------------------------------------------------------------------------

function moyenne(valeurs) {
  if (valeurs.length === 0) return null;
  const somme = valeurs.reduce((a, b) => a + b, 0);
  return arrondir(somme / valeurs.length, 2);
}

function mediane(trie) {
  if (trie.length === 0) return null;
  const milieu = Math.floor(trie.length / 2);
  const m = trie.length % 2 ? trie[milieu] : (trie[milieu - 1] + trie[milieu]) / 2;
  return arrondir(m, 2);
}

function normaliserMot(mot) {
  return String(mot)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .toLowerCase()
    .trim();
}

function classesNombre(trie) {
  if (trie.length === 0) return [];
  const min = trie[0];
  const max = trie[trie.length - 1];
  if (min === max) return [{ de: min, a: max, n: trie.length }];

  const etendue = max - min;
  const pasBrut = etendue / 8;
  const magnitude = 10 ** Math.floor(Math.log10(pasBrut));
  const normalise = pasBrut / magnitude;
  const facteur = normalise <= 1 ? 1 : normalise <= 2 ? 2 : normalise <= 2.5 ? 2.5 : normalise <= 5 ? 5 : 10;
  const pas = facteur * magnitude;
  const debut = Math.floor(min / pas) * pas;

  const classes = [];
  for (let k = 0; k < 200; k += 1) {
    const de = debut + k * pas;
    if (de > max + 1e-12) break;
    classes.push({ de, a: de + pas, n: 0 });
  }
  if (classes.length === 0) return [{ de: min, a: max, n: trie.length }];

  for (const v of trie) {
    let k = Math.floor((v - debut) / pas);
    if (!Number.isFinite(k) || k < 0) k = 0;
    if (k >= classes.length) k = classes.length - 1;
    classes[k].n += 1;
  }
  return classes.map((c) => ({ de: arrondir(c.de, 6), a: arrondir(c.a, 6), n: c.n }));
}

// Corrige uniquement les questions pour lesquelles une réponse est définie.
export function corriger(type, gabarit, reponse) {
  const g = gabarit || {};
  if (type === "serie") {
    const parties = {};
    for (const sq of g.questions || []) {
      parties[sq.cle] = corriger(sq.type, sq, reponse?.[sq.cle]).statut;
    }
    const valeurs = Object.values(parties).filter((v) => v !== null);
    if (!valeurs.length) return { statut: null, parties };
    const justes = valeurs.filter((v) => v === "juste").length;
    return { statut: justes === valeurs.length ? "juste" : justes === 0 ? "faux" : "partiel", parties };
  }
  if (!["choix", "vraifaux", "multiple", "nombre"].includes(type) || !Array.isArray(g.bonnes) || !g.bonnes.length) return { statut: null };
  let juste = false;
  if (type === "nombre") {
    const n = reponse === null || reponse === undefined || reponse === "" ? NaN : Number(String(reponse).replace(",", "."));
    juste = Number.isFinite(n) && g.bonnes.some((b) => Math.abs(n - Number(b)) <= (Number(g.tolerance) || 0));
  } else if (type === "multiple") {
    const choix = new Set(Array.isArray(reponse) ? reponse : []);
    juste = choix.size === new Set(g.bonnes).size && g.bonnes.every((b) => choix.has(b));
  } else {
    juste = g.bonnes.includes(reponse);
  }
  return { statut: juste ? "juste" : "faux" };
}

/**
 * Agrège des valeurs déjà validées (les valeurs invalides sont ignorées).
 * Chaque entrée peut être une valeur brute, ou {cle, valeur} pour conserver
 * l'identifiant de la réponse (modération des textes).
 */
export function agreger(type, gabarit, valeurs = []) {
  const g = normaliserGabarit(type, gabarit);
  const propres = [];
  for (const entree of Array.isArray(valeurs) ? valeurs : []) {
    const emballee = estObjet(entree) && "valeur" in entree;
    const brute = emballee ? entree.valeur : entree;
    const r = validerReponse(type, g, brute);
    if (!r.ok || (type === "nuage" && r.valeur.length === 0)) continue;
    propres.push({ cle: emballee && entree.cle !== undefined ? String(entree.cle) : null, valeur: r.valeur });
  }
  const n = propres.length;

  switch (type) {
    case "choix": {
      const comptes = {};
      for (const o of g.options) comptes[o.cle] = 0;
      for (const p of propres) comptes[p.valeur] += 1;
      return { n, comptes };
    }

    case "vraifaux": {
      const comptes = { V: 0, F: 0 };
      for (const p of propres) comptes[p.valeur] += 1;
      return { n, comptes };
    }

    case "multiple": {
      const comptes = {};
      for (const o of g.options) comptes[o.cle] = 0;
      for (const p of propres) for (const cle of p.valeur) comptes[cle] += 1;
      return { n, comptes };
    }

    case "echelle": {
      const comptes = {};
      for (let v = g.min; v <= g.max; v += 1) comptes[String(v)] = 0;
      for (const p of propres) comptes[String(p.valeur)] = (comptes[String(p.valeur)] || 0) + 1;
      return { n, comptes, moyenne: moyenne(propres.map((p) => p.valeur)) };
    }

    case "curseur": {
      const triees = propres.map((p) => p.valeur).sort((a, b) => a - b);
      return {
        n,
        valeurs: triees,
        moyenne: moyenne(triees),
        mediane: mediane(triees),
      };
    }

    case "nombre": {
      const triees = propres.map((p) => p.valeur).sort((a, b) => a - b);
      // Valeurs les plus fréquentes (au plus 5) : lisibles telles quelles quand la classe
      // converge vers quelques réponses (calculs à réponse unique).
      const parValeur = new Map();
      for (const v of triees) parValeur.set(v, (parValeur.get(v) || 0) + 1);
      const frequentes = [...parValeur.entries()]
        .sort((a, b) => b[1] - a[1] || a[0] - b[0])
        .slice(0, 5)
        .map(([valeur, k]) => ({ valeur, n: k }));
      return {
        n,
        valeurs: triees,
        mediane: mediane(triees),
        classes: classesNombre(triees),
        frequentes,
        distinctes: parValeur.size,
      };
    }

    case "nuage": {
      const groupes = new Map();
      for (const p of propres) {
        const vus = new Set();
        for (const mot of p.valeur) {
          const forme = normaliserMot(mot);
          if (!forme || vus.has(forme)) continue;
          vus.add(forme);
          let groupe = groupes.get(forme);
          if (!groupe) {
            groupe = { total: 0, formes: new Map() };
            groupes.set(forme, groupe);
          }
          groupe.total += 1;
          groupe.formes.set(mot, (groupe.formes.get(mot) || 0) + 1);
        }
      }
      const mots = [...groupes.values()].map((groupe) => {
        let mot = null;
        let meilleur = -1;
        for (const [forme, compte] of groupe.formes) {
          if (compte > meilleur || (compte === meilleur && mot !== null && forme < mot)) {
            meilleur = compte;
            mot = forme;
          }
        }
        return { mot, n: groupe.total };
      });
      mots.sort((a, b) => b.n - a.n || String(a.mot).localeCompare(String(b.mot), "fr"));
      return { n, mots };
    }

    case "texte": {
      return {
        n,
        reponses: propres.map((p, i) => ({ cle: p.cle === null ? `t${i + 1}` : p.cle, texte: p.valeur })),
      };
    }

    case "classement": {
      const somme = new Map(g.items.map((i) => [i.cle, 0]));
      for (const p of propres) {
        p.valeur.forEach((cle, index) => somme.set(cle, somme.get(cle) + index + 1));
      }
      const rangs = g.items.map((i) => ({
        cle: i.cle,
        rang_moyen: n === 0 ? null : arrondir(somme.get(i.cle) / n, 2),
      }));
      rangs.sort((a, b) => (a.rang_moyen ?? Infinity) - (b.rang_moyen ?? Infinity));
      return { n, rangs };
    }

    case "serie": {
      // Un résultat par sous-question, calculé avec l'agrégation de son propre type.
      // n = nombre d'appareils ayant répondu à au moins une sous-question.
      const parties = {};
      for (const sq of g.questions) {
        const vals = propres.filter((p) => p.valeur[sq.cle] !== undefined)
          .map((p) => (p.cle === null ? p.valeur[sq.cle] : { cle: p.cle, valeur: p.valeur[sq.cle] }));
        const { cle: _c, type: _t, etiquette: _e, ...sous } = sq;
        parties[sq.cle] = agreger(sq.type, sous, vals);
      }
      return { n, parties };
    }

    default:
      throw new Error(`Type de question inconnu : « ${type} ».`);
  }
}

// ---------------------------------------------------------------------------
// Banque Markdown
// ---------------------------------------------------------------------------

function extraireAncres(parametres) {
  const guillemets = [...parametres.matchAll(/«([^»]*)»/g)].map((m) => m[1].trim());
  const droits = [...parametres.matchAll(/"([^"]*)"/g)].map((m) => m[1].trim());
  return [...guillemets, ...droits];
}

function analyserEntete(entete, ligne) {
  const m = entete.match(/^([^\s·|:]+)\s*(?:·|\||:)\s*(.+)$/);
  if (!m) throw new Error(`Ligne ${ligne} : titre attendu sous la forme « ## id · type … ».`);
  const id = m[1].trim();
  if (!/^[A-Za-z0-9_.-]{1,40}$/.test(id)) {
    throw new Error(`Ligne ${ligne} : identifiant de question invalide « ${id} ».`);
  }
  const reste = m[2].trim();
  const mt = reste.match(/^([A-Za-zÀ-ÿ]+)\s*([\s\S]*)$/);
  if (!mt) throw new Error(`Ligne ${ligne} : type de question manquant.`);
  const type = mt[1].toLowerCase();
  if (!TYPES.includes(type)) {
    throw new Error(`Ligne ${ligne} : type de question inconnu « ${mt[1]} ».`);
  }
  return { id, type, parametres: mt[2].trim() };
}

function construireGabarit(type, parametres, lignesTexte, options, ligne) {
  const texte = lignesTexte.join("\n").trim();
  const masquerTexte = /\bmasquer[-_ ]texte\b/i.test(parametres);
  const p = parametres.replace(/\bmasquer[-_ ]texte\b/gi, "").trim();
  const ancres = extraireAncres(p);
  const plage = p.match(/(-?\d+)\s*\.\.\s*(-?\d+)/);

  const optionsUtilisables = ["choix", "multiple", "classement"].includes(type);
  if (!optionsUtilisables && options.length > 0) {
    throw new Error(`Ligne ${options[0].ligne} : options inattendues pour une question « ${type} ».`);
  }

  switch (type) {
    case "choix":
    case "multiple": {
      if (options.length === 0) {
        const m = p.match(/\b(\d+)\b/);
        return {
          texte,
          masquer_texte: masquerTexte,
          nb_options: m ? Number(m[1]) : 4,
          bonnes: [],
        };
      }
      const liste = options.map((o, i) => ({ cle: LETTRES[i], texte: o.texte }));
      const bonnes = options.flatMap((o, i) => (o.coche === true ? [LETTRES[i]] : []));
      return { texte, masquer_texte: masquerTexte, options: liste, bonnes };
    }

    case "vraifaux": {
      const m = p.match(/\[\s*(x|)\s*\]\s*(vrai|v|faux|f)\b/i);
      const bonnes = m && /x/i.test(m[1]) ? [m[2]] : [];
      return { texte, masquer_texte: masquerTexte, bonnes };
    }

    case "echelle":
      return {
        texte,
        masquer_texte: masquerTexte,
        min: plage ? Number(plage[1]) : undefined,
        max: plage ? Number(plage[2]) : undefined,
        ancre_min: ancres[0] || "",
        ancre_max: ancres[1] || "",
      };

    case "curseur":
      return {
        texte,
        masquer_texte: masquerTexte,
        min: plage ? Number(plage[1]) : undefined,
        max: plage ? Number(plage[2]) : undefined,
        ancre_min: ancres[0] || undefined,
        ancre_max: ancres[1] || undefined,
      };

    case "nombre": {
      const unite = p.replace(plage ? plage[0] : "", "").replace(/\s+/g, " ").trim();
      return { texte, masquer_texte: masquerTexte, unite };
    }

    case "nuage": {
      const m = p.match(/\b(\d+)\b/);
      return { texte, masquer_texte: masquerTexte, max_mots: m ? Number(m[1]) : undefined };
    }

    case "texte": {
      const m = p.match(/\b(\d+)\b/);
      return { texte, masquer_texte: masquerTexte, max: m ? Number(m[1]) : undefined };
    }

    case "classement": {
      if (options.length === 0) return { texte, masquer_texte: masquerTexte };
      return {
        texte,
        masquer_texte: masquerTexte,
        items: options.map((o, i) => ({ cle: LETTRES[i], texte: o.texte })),
      };
    }

    default:
      throw new Error(`Ligne ${ligne} : type de question inconnu « ${type} ».`);
  }
}

/**
 * Lit une banque de questions au format Markdown décrit dans docs/spec.md.
 * -> {titre, questions:[{id, type, gabarit}]}
 */
export function parserBanque(markdown) {
  if (typeof markdown !== "string") throw new Error("La banque doit être un texte Markdown.");
  const lignes = markdown.replace(/\r\n?/g, "\n").split("\n");
  let titre = "";
  const questions = [];
  const ids = new Map();
  let courante = null;

  const finaliser = () => {
    if (!courante) return;
    const { entete, ligne, texte, options } = courante;
    courante = null;
    const { id, type, parametres } = analyserEntete(entete, ligne);
    if (ids.has(id)) {
      throw new Error(`Ligne ${ligne} : identifiant « ${id} » déjà utilisé à la ligne ${ids.get(id)}.`);
    }
    ids.set(id, ligne);
    const brut = construireGabarit(type, parametres, texte, options, ligne);
    let gabarit;
    try {
      gabarit = normaliserGabarit(type, brut);
    } catch (e) {
      throw new Error(`Ligne ${ligne} : ${e.message}`);
    }
    questions.push({ id, type, gabarit });
  };

  for (let i = 0; i < lignes.length; i += 1) {
    const brute = lignes[i];
    const t = brute.trim();
    const ligne = i + 1;

    if (/^#\s+/.test(t) && !/^##/.test(t)) {
      if (!titre) titre = t.replace(/^#\s+/, "").trim();
      continue;
    }
    if (/^##\s+/.test(t)) {
      finaliser();
      const entete = t.replace(/^##\s+/, "").trim();
      if (!entete) throw new Error(`Ligne ${ligne} : titre de question vide.`);
      courante = { entete, ligne, texte: [], options: [] };
      continue;
    }
    if (!courante) continue;
    if (!t) continue;

    const m = t.match(/^[-*+]\s+(.*)$/);
    if (m) {
      const contenu = m[1].trim();
      const opt = contenu.match(/^\[( |x|X)\]\s*(.*)$/);
      if (opt) {
        courante.options.push({ ligne, coche: opt[1].toLowerCase() === "x", texte: opt[2].trim() });
      } else {
        courante.options.push({ ligne, coche: null, texte: contenu });
      }
      continue;
    }
    courante.texte.push(t);
  }
  finaliser();

  return { titre, questions };
}

// ---------------------------------------------------------------------------
// Raccourcis de lancement (« choix:4 », « echelle:1..7 », …)
// ---------------------------------------------------------------------------

/**
 * Interprète un raccourci de fragment (#lancer=…).
 * -> {type, gabarit} normalisé, ou null si le raccourci est inconnu.
 */
export function parserLancement(chaine) {
  if (typeof chaine !== "string") return null;
  const s = chaine.trim();
  if (!s) return null;
  const index = s.indexOf(":");
  const type = (index === -1 ? s : s.slice(0, index)).trim().toLowerCase();
  const parametre = index === -1 ? "" : s.slice(index + 1).trim();
  if (!TYPES.includes(type)) return null;

  const plage = parametre.match(/^(-?\d+)\s*\.\.\s*(-?\d+)$/);
  try {
    switch (type) {
      case "choix":
      case "multiple": {
        if (!parametre) return { type, gabarit: normaliserGabarit(type, {}) };
        if (!/^\d+$/.test(parametre)) return null;
        const n = Number(parametre);
        if (n < MIN_OPTIONS || n > MAX_OPTIONS) return null;
        return { type, gabarit: normaliserGabarit(type, { nb_options: n }) };
      }

      case "echelle":
      case "curseur": {
        if (!parametre) return { type, gabarit: normaliserGabarit(type, {}) };
        if (!plage) return null;
        return {
          type,
          gabarit: normaliserGabarit(type, { min: Number(plage[1]), max: Number(plage[2]) }),
        };
      }

      case "nombre":
        return { type, gabarit: normaliserGabarit(type, parametre ? { unite: parametre } : {}) };

      case "nuage":
      case "texte": {
        if (!parametre) return { type, gabarit: normaliserGabarit(type, {}) };
        if (!/^\d+$/.test(parametre)) return null;
        const n = Number(parametre);
        const champ = type === "nuage" ? { max_mots: n } : { max: n };
        return { type, gabarit: normaliserGabarit(type, champ) };
      }

      case "vraifaux":
        if (!parametre) return { type, gabarit: normaliserGabarit(type, {}) };
        if (!/^[vf]$/i.test(parametre)) return null;
        return { type, gabarit: normaliserGabarit(type, { bonnes: [parametre] }) };

      case "classement":
        return parametre ? null : { type, gabarit: normaliserGabarit(type, {}) };

      default:
        return null;
    }
  } catch {
    return null;
  }
}
