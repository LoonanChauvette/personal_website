// Administration : connexion GitHub, approbation de l'écran de la salle, cours,
// génération des diapositives de sondage pour Excalidraw+.
import { parserBanque } from '/q/core.js';
import { adresseConnexion, qrSvg, telecharger } from '/q/commun.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const retour = params.get('retour');

async function api(op, { methode = 'GET', corps } = {}) {
  const r = await fetch(`/api/poll?op=${encodeURIComponent(op)}`, {
    method: methode,
    headers: corps === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: corps === undefined ? undefined : JSON.stringify(corps),
    credentials: 'same-origin',
    cache: 'no-store',
  });
  const donnees = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error(donnees.erreur || `Erreur ${r.status}`);
    e.statut = r.status;
    throw e;
  }
  return donnees;
}

// ─── Invité : connexion GitHub, ou approbation depuis le téléphone ──────────
let suivi = null;

async function demanderApprobation() {
  $('btn-demande').disabled = true;
  try {
    const d = await api('appareil_demande', { methode: 'POST' });
    const brut = d.code.replace('-', '');
    $('demande-code').textContent = d.code;
    const lien = new URL(`/admin/#approuver=${brut}`, location.origin).href;
    $('demande-qr').replaceChildren();
    const svg = qrSvg(lien, { cellSize: 6, margin: 2 });
    if (svg) $('demande-qr').appendChild(svg);
    $('demande').hidden = false;
    $('demande-etat').textContent = 'En attente d’approbation… (10 minutes)';
    clearInterval(suivi);
    const fin = Date.now() + d.expire_dans * 1000;
    suivi = setInterval(async () => {
      if (Date.now() > fin) {
        clearInterval(suivi);
        $('demande-etat').textContent = 'Code expiré. Recommencez.';
        $('btn-demande').disabled = false;
        return;
      }
      const s = await api('appareil_suivre').catch(() => null);
      if (s && s.statut === 'approuvee') {
        clearInterval(suivi);
        $('demande-etat').textContent = 'Approuvé.';
        location.href = retour && retour.startsWith('/') && !retour.startsWith('//') ? retour : '/q/ecran.html';
      }
    }, 2000);
  } catch (err) {
    $('demande-etat').textContent = err.message;
    $('demande').hidden = false;
    $('btn-demande').disabled = false;
  }
}

// ─── Connecté ───────────────────────────────────────────────────────────────
function afficherCours(cours) {
  const actif = !!cours;
  $('cours-etat').classList.toggle('actif', actif);
  $('cours-etat').textContent = actif
    ? `Cours démarré jusqu’à ${new Date(cours.jusqua).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}`
    : 'Aucun cours en cours';
  $('btn-cours').textContent = actif ? 'Prolonger (4 h)' : 'Démarrer le cours (4 h)';
  $('btn-fin-cours').hidden = !actif;
}

async function approuver(code) {
  $('approuver-message').textContent = '…';
  try {
    const r = await api('appareil_approuver', { methode: 'POST', corps: { code } });
    $('approuver-message').textContent = `Ordinateur ${r.code} approuvé.`;
    $('champ-code').value = '';
  } catch (err) {
    $('approuver-message').textContent = err.message;
  }
}

// ─── Diapositives Excalidraw+ ──────────────────────────────────────────────
// Gabarit « empty » de l'enseignant : cadre 854 × 480, titre Lilita (famille 7)
// en 36 px à (+34, +11), corps en famille 5, © gris #ced4da en bas.
const L = 854;
const H = 480;
const PAS_X = L + 350;
const PAS_Y = H + 160;

function identifiant() {
  const a = crypto.getRandomValues(new Uint8Array(15));
  return btoa(String.fromCharCode(...a)).replace(/[+/=]/g, (c) => ({ '+': '-', '/': '_', '=': '' })[c]);
}

function graine() {
  return crypto.getRandomValues(new Uint32Array(1))[0] >>> 1;
}

function base(type, x, y, largeur, hauteur, extra = {}) {
  return {
    id: identifiant(),
    type,
    x,
    y,
    width: largeur,
    height: hauteur,
    angle: 0,
    strokeColor: '#1e1e1e',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: graine(),
    version: 1,
    versionNonce: graine(),
    isDeleted: false,
    boundElements: [],
    updated: Date.now(),
    link: null,
    locked: false,
    ...extra,
  };
}

function couper(texte, largeur) {
  const lignes = [];
  for (const para of String(texte).split('\n')) {
    let ligne = '';
    for (const mot of para.split(/\s+/)) {
      if (!mot) continue;
      if (ligne && (ligne + ' ' + mot).length > largeur) {
        lignes.push(ligne);
        ligne = mot;
      } else ligne = ligne ? `${ligne} ${mot}` : mot;
    }
    lignes.push(ligne);
  }
  return lignes.join('\n');
}

function texte(x, y, contenu, taille, { famille = 5, couleur = '#1e1e1e', cadre = null, largeur = null, alignement = 'left' } = {}) {
  const t = largeur ? couper(contenu, largeur) : contenu;
  const lignes = t.split('\n');
  return base('text', x, y, Math.max(...lignes.map((l) => l.length)) * taille * 0.55, lignes.length * taille * 1.25, {
    strokeColor: couleur,
    frameId: cadre,
    text: t,
    originalText: t,
    fontSize: taille,
    fontFamily: famille,
    textAlign: alignement,
    verticalAlign: 'top',
    containerId: null,
    autoResize: true,
    lineHeight: 1.25,
  });
}

function documentDiapo(q, jeton, role) {
  const site = location.origin;
  const conf = JSON.stringify({ id: q.id, type: q.type, gabarit: q.gabarit, jeton, role }).replace(/</g, '\\u003c');
  return (
    '<!doctype html><html lang="fr"><head><meta charset="utf-8">' +
    `<base href="${site}/q/"><link rel="stylesheet" href="${site}/q/diapo.css">` +
    `</head><body><main id="diapo"></main><script type="application/json" id="question">${conf}</script>` +
    `<script src="${site}/q/vendor/qrcode.js"></script>` +
    `<script type="module" src="${site}/q/diapo.js"></script></body></html>`
  );
}

function lignesOptions(q) {
  const g = q.gabarit || {};
  if (Array.isArray(g.options) && g.options.length && q.type !== 'vraifaux') {
    return g.options.map((o) => `${o.cle}.  ${o.texte || ''}`.trim());
  }
  if (q.type === 'vraifaux') return ['Vrai ou faux ?'];
  if (q.type === 'classement') return (g.items || []).map((i, k) => `${k + 1}.  ${i.texte}`);
  if (q.type === 'curseur' || q.type === 'echelle') {
    const min = g.min ?? (q.type === 'curseur' ? 0 : 1);
    const max = g.max ?? (q.type === 'curseur' ? 100 : 5);
    return [`De ${min}${g.ancre_min ? ` (${g.ancre_min})` : ''} à ${max}${g.ancre_max ? ` (${g.ancre_max})` : ''}`];
  }
  if (q.type === 'nombre') return [`Réponse en nombre${g.unite ? ` (${g.unite})` : ''}`];
  if (q.type === 'nuage') return ['Un à trois mots'];
  return ['Réponse libre'];
}

function diapositives(banque, jetons, titre) {
  const elements = [];
  const adresse = `${location.host}/q`;
  banque.questions.forEach((q, rang) => {
    const y = 80 + rang * PAS_Y;
    for (const [colonne, role] of [
      [0, 'question'],
      [1, 'resultats'],
    ]) {
      const x = 80 + colonne * PAS_X;
      const cadre = base('frame', x, y, L, H, {
        name: `${q.id} · ${role === 'question' ? 'question' : 'résultats'}`,
        customData: {
          slidesOrder: rang * 2 + colonne,
          presenterNotes:
            role === 'question'
              ? `Sondage ${q.id} : la question s'ouvre à l'affichage. → pour fermer et révéler.`
              : `Sondage ${q.id} : la question se ferme et le graphique apparaît à l'affichage.`,
        },
      });
      const c = cadre.id;
      elements.push(cadre);
      elements.push(texte(x + 34, y + 11, titre || 'Question', 36, { famille: 7, cadre: c }));
      const enonce = q.gabarit?.texte || '';
      if (role === 'question') {
        const t = texte(x + 34, y + 80, enonce, 20, { famille: 6, cadre: c, largeur: 38 });
        elements.push(t);
        let oy = t.y + t.height + 16;
        for (const ligne of lignesOptions(q)) {
          const o = texte(x + 34, oy, ligne, 15, { cadre: c, largeur: 48 });
          elements.push(o);
          oy += o.height + 6;
        }
        elements.push(
          base('iframe', x + 476, y + 70, 350, 360, {
            frameId: c,
            strokeColor: 'transparent',
            roughness: 0,
            customData: { generationData: { status: 'done', html: documentDiapo(q, jetons[q.id], 'question') } },
          }),
        );
      } else {
        const t = texte(x + 34, y + 70, enonce, 17, { famille: 6, cadre: c, largeur: 34 });
        elements.push(t);
        let oy = t.y + t.height + 14;
        for (const ligne of lignesOptions(q)) {
          const o = texte(x + 34, oy, ligne, 13, { cadre: c, largeur: 44 });
          elements.push(o);
          oy += o.height + 5;
        }
        elements.push(
          base('iframe', x + 410, y + 70, 416, 370, {
            frameId: c,
            strokeColor: 'transparent',
            roughness: 0,
            customData: { generationData: { status: 'done', html: documentDiapo(q, jetons[q.id], 'resultats') } },
          }),
        );
      }
      elements.push(texte(x + 34, y + 452, adresse, 11, { famille: 8, couleur: '#ced4da', cadre: c }));
      elements.push(texte(x + 712, y + 452, '© Loonan Chauvette, 2026', 8.25, { famille: 8, couleur: '#ced4da', cadre: c }));
    }
  });
  elements.forEach((e, i) => {
    e.index = `a${i.toString(36).padStart(3, '0')}`;
  });
  return {
    type: 'excalidraw',
    version: 2,
    source: `${location.origin}/admin`,
    elements,
    appState: { viewBackgroundColor: '#ffffff', gridSize: 20 },
    files: {},
  };
}

async function produireDiapositives(ev) {
  ev.preventDefault();
  const chemin = $('champ-banque').value.trim();
  $('diapos-message').textContent = '…';
  try {
    const r = await fetch(chemin, { cache: 'no-store' });
    if (!r.ok) throw new Error(`Banque introuvable (${r.status}).`);
    const banque = parserBanque(await r.text());
    if (!banque.questions.length) throw new Error('Aucune question dans cette banque.');
    const { jetons } = await api('jetons', { methode: 'POST', corps: { ids: banque.questions.map((q) => q.id) } });
    const scene = diapositives(banque, jetons, banque.titre.replace(/^Cours \d+\s*[–-]\s*/, '') || 'Question');
    const nom = (chemin.split('/').pop() || 'banque').replace(/\.md$/, '');
    telecharger(`sondages-${nom}.excalidraw`, JSON.stringify(scene), 'application/json');
    $('diapos-message').textContent = `${banque.questions.length} questions → ${banque.questions.length * 2} diapositives.`;
  } catch (err) {
    $('diapos-message').textContent = err.message;
  }
}

// ─── Démarrage ──────────────────────────────────────────────────────────────
async function demarrer() {
  const moi = await api('moi').catch(() => ({ connecte: false }));
  $('adresse-admin').textContent = `${location.host}/admin`;
  if (!moi.connecte) {
    $('vue-invite').hidden = false;
    $('lien-github').href = adresseConnexion(`/admin/${location.search}${location.hash}`);
    $('btn-demande').addEventListener('click', demanderApprobation);
    return;
  }
  // Connecté et arrivé par « ?retour=… » (touche K de l'écran) : on y retourne.
  if (retour && retour.startsWith('/') && !retour.startsWith('//') && !location.hash) {
    location.replace(retour);
    return;
  }
  $('vue-admin').hidden = false;
  $('qui').textContent =
    moi.type === 'appareil'
      ? `Ordinateur approuvé par ${moi.login}, jusqu’à ${new Date(moi.expire).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}.`
      : `Connecté : ${moi.login}.`;
  // Un ordinateur approuvé ne peut pas en approuver un autre.
  $('carte-approuver').hidden = moi.type !== 'github';
  afficherCours(moi.cours);

  $('btn-deconnexion').addEventListener('click', async () => {
    await api('deconnexion', { methode: 'POST' }).catch(() => {});
    location.href = '/admin/';
  });
  $('btn-cours').addEventListener('click', async () => {
    try {
      afficherCours((await api('cours_demarrer', { methode: 'POST', corps: { heures: 4 } })).cours);
    } catch (err) {
      $('cours-etat').textContent = err.message;
    }
  });
  $('btn-fin-cours').addEventListener('click', async () => {
    await api('cours_terminer', { methode: 'POST' }).catch(() => {});
    afficherCours(null);
  });
  $('form-approuver').addEventListener('submit', (ev) => {
    ev.preventDefault();
    approuver($('champ-code').value);
  });
  $('form-diapos').addEventListener('submit', produireDiapositives);
  let confirmer = false;
  $('btn-effacer-gardes').addEventListener('click', async () => {
    if (!confirmer) {
      confirmer = true;
      $('btn-effacer-gardes').textContent = 'Confirmer : tout effacer';
      $('gardes-message').textContent = 'Les graphiques de toutes les diapositives disparaîtront.';
      return;
    }
    confirmer = false;
    $('btn-effacer-gardes').textContent = 'Effacer tous les résultats gardés';
    try {
      await api('garde_effacer', { methode: 'POST', corps: { tous: true } });
      $('gardes-message').textContent = 'Résultats gardés effacés.';
    } catch (err) {
      $('gardes-message').textContent = err.message;
    }
  });

  // Lien du QR code de l'écran : #approuver=ABC234 (page neuve, ou déjà ouverte).
  const lireLien = () => {
    const m = /approuver=([A-Za-z0-9]{6})/.exec(location.hash);
    if (!m || moi.type !== 'github') return;
    $('champ-code').value = `${m[1].slice(0, 3)}-${m[1].slice(3)}`.toUpperCase();
    history.replaceState(null, '', location.pathname);
    $('approuver-message').textContent = 'Vérifiez que ce code est bien celui affiché dans la salle, puis approuvez.';
    $('champ-code').focus();
  };
  window.addEventListener('hashchange', lireLien);
  lireLien();
}

demarrer();
