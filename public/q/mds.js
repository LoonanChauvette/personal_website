// Positionnement multidimensionnel (MDS) métrique, sans dépendance.
// Utilisé par la diapositive MDS du Cours 7 (diapo-mds.js) et par les tests (Node).
//
// Entrée : matrice de dissimilarité n × n, symétrique, diagonale 0, `null` pour une
// paire sans note (poids nul : jamais remplacée par 0). Sortie : n points en 2D.
//
//   - torgerson(delta)      : MDS classique (double centrage, deux premiers vecteurs propres) ;
//   - pasGuttman(X, delta)  : une itération SMACOF (transformée de Guttman, poids 0/1) ;
//   - mds(delta)            : SMACOF (Torgerson + départs au hasard à graine fixe), axes principaux ;
//   - stress(X, delta)      : stress-1 de Kruskal (forme métrique) ;
//   - aligner(X, ref)       : Procrustes (translation, rotation, symétrie, échelle) vers ref.

const DIM = 2;

function distance(p, q) {
  let s = 0;
  for (let k = 0; k < p.length; k += 1) s += (p[k] - q[k]) ** 2;
  return Math.sqrt(s);
}

function connue(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

export function centrer(X) {
  const n = X.length;
  const m = Array.from({ length: DIM }, (_, k) => X.reduce((s, p) => s + p[k], 0) / n);
  return X.map((p) => p.map((v, k) => v - m[k]));
}

// Stress-1 de Kruskal sur les paires connues : sqrt(Σ (δ − d)² / Σ δ²).
export function stress(X, delta) {
  let num = 0;
  let den = 0;
  for (let i = 0; i < X.length; i += 1) {
    for (let j = i + 1; j < X.length; j += 1) {
      if (!connue(delta[i][j])) continue;
      const d = distance(X[i], X[j]);
      num += (delta[i][j] - d) ** 2;
      den += delta[i][j] ** 2;
    }
  }
  return den > 0 ? Math.sqrt(num / den) : 0;
}

// Transformée de Guttman avec poids 0/1 (paires manquantes ignorées).
// Poids tous égaux à 1 : X' = B(X) X / n. Sinon : X' = V⁺ B(X) X, V⁺ par pseudo-inverse.
export function pasGuttman(X, delta) {
  const n = X.length;
  const B = Array.from({ length: n }, () => new Array(n).fill(0));
  let complet = true;
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      if (i === j) continue;
      if (!connue(delta[i][j])) {
        complet = false;
        continue;
      }
      const d = distance(X[i], X[j]);
      B[i][j] = d > 1e-12 ? -delta[i][j] / d : 0;
    }
    B[i][i] = -B[i].reduce((s, v) => s + v, 0);
  }
  const BX = B.map((ligne) => Array.from({ length: DIM }, (_, k) => ligne.reduce((s, b, j) => s + b * X[j][k], 0)));
  if (complet) return BX.map((p) => p.map((v) => v / n));
  return multiplier(pseudoInverseV(delta), BX);
}

function multiplier(A, M) {
  return A.map((ligne) => Array.from({ length: M[0].length }, (_, k) => ligne.reduce((s, a, j) => s + a * M[j][k], 0)));
}

// V = Σ w_ij (e_i − e_j)(e_i − e_j)ᵀ ; V⁺ = (V + 11ᵀ/n)⁻¹ − 11ᵀ/n (graphe des paires connexe).
function pseudoInverseV(delta) {
  const n = delta.length;
  const V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => {
    if (i === j) return 0;
    return connue(delta[i][j]) ? -1 : 0;
  }));
  for (let i = 0; i < n; i += 1) V[i][i] = -V[i].reduce((s, v) => s + v, 0);
  const inv = inverser(V.map((l) => l.map((v) => v + 1 / n)));
  return inv.map((l) => l.map((v) => v - 1 / n));
}

function inverser(A) {
  const n = A.length;
  const M = A.map((l, i) => [...l, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < n; c += 1) {
    let p = c;
    for (let r = c + 1; r < n; r += 1) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) throw new Error('Paires connues insuffisantes pour placer les sons.');
    [M[c], M[p]] = [M[p], M[c]];
    const pivot = M[c][c];
    for (let k = 0; k < 2 * n; k += 1) M[c][k] /= pivot;
    for (let r = 0; r < n; r += 1) {
      if (r === c) continue;
      const f = M[r][c];
      for (let k = 0; k < 2 * n; k += 1) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((l) => l.slice(n));
}

// MDS classique. Les paires manquantes prennent la moyenne des paires connues (départ seulement).
export function torgerson(delta) {
  const n = delta.length;
  const connues = [];
  for (let i = 0; i < n; i += 1) for (let j = i + 1; j < n; j += 1) if (connue(delta[i][j])) connues.push(delta[i][j]);
  const defaut = connues.length ? connues.reduce((s, v) => s + v, 0) / connues.length : 1;
  const D2 = delta.map((l, i) => l.map((v, j) => (i === j ? 0 : (connue(v) ? v : defaut) ** 2)));
  const ml = D2.map((l) => l.reduce((s, v) => s + v, 0) / n);
  const mt = ml.reduce((s, v) => s + v, 0) / n;
  const Bc = D2.map((l, i) => l.map((v, j) => -0.5 * (v - ml[i] - ml[j] + mt)));
  const vecteurs = [];
  const valeurs = [];
  for (let k = 0; k < DIM; k += 1) {
    // Puissance itérée avec déflation ; départ fixe (résultat reproductible).
    let v = Array.from({ length: n }, (_, i) => Math.cos(1 + i * (k + 2)));
    let lambda = 0;
    for (let it = 0; it < 500; it += 1) {
      let w = Bc.map((l) => l.reduce((s, b, j) => s + b * v[j], 0));
      vecteurs.forEach((u, m) => {
        const p = u.reduce((s, x, j) => s + x * v[j], 0);
        w = w.map((x, j) => x - valeurs[m] * p * u[j]);
      });
      const norme = Math.sqrt(w.reduce((s, x) => s + x * x, 0));
      if (norme < 1e-12) break;
      lambda = w.reduce((s, x, j) => s + x * v[j], 0);
      v = w.map((x) => x / norme);
    }
    vecteurs.push(v);
    valeurs.push(Math.max(lambda, 0));
  }
  return Array.from({ length: n }, (_, i) => vecteurs.map((u, k) => u[i] * Math.sqrt(valeurs[k])));
}

// Axes principaux de la configuration, sens fixé par le premier son (en bas à gauche).
export function orienter(X) {
  const C = centrer(X);
  const sxx = C.reduce((s, p) => s + p[0] * p[0], 0);
  const syy = C.reduce((s, p) => s + p[1] * p[1], 0);
  const sxy = C.reduce((s, p) => s + p[0] * p[1], 0);
  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const [c, s] = [Math.cos(theta), Math.sin(theta)];
  let R = C.map(([x, y]) => [c * x + s * y, -s * x + c * y]);
  if (R[0][0] > 0) R = R.map(([x, y]) => [-x, y]);
  if (R[0][1] > 0) R = R.map(([x, y]) => [x, -y]);
  return R;
}

// Procrustes : translation, rotation (ou symétrie) et échelle qui rapprochent X de ref.
export function aligner(X, ref) {
  const A = centrer(X);
  const B = centrer(ref);
  let meilleur = null;
  for (const miroir of [1, -1]) {
    const M = A.map(([x, y]) => [x, miroir * y]);
    let a = 0;
    let b = 0;
    let norme = 0;
    M.forEach(([x, y], i) => {
      a += x * B[i][0] + y * B[i][1];
      b += x * B[i][1] - y * B[i][0];
      norme += x * x + y * y;
    });
    const r = Math.hypot(a, b);
    if (!meilleur || r > meilleur.r) meilleur = { r, miroir, c: a / r, s: b / r, norme };
  }
  const { miroir, c, s, r, norme } = meilleur;
  const echelle = norme > 0 ? r / norme : 1;
  const mref = Array.from({ length: DIM }, (_, k) => ref.reduce((t, p) => t + p[k], 0) / ref.length);
  return A.map(([x, y0]) => {
    const y = miroir * y0;
    return [echelle * (c * x - s * y) + mref[0], echelle * (s * x + c * y) + mref[1]];
  });
}

// Descente SMACOF depuis X jusqu'à convergence.
function descendre(X, delta, iterations, tolerance) {
  let s = stress(X, delta);
  for (let it = 0; it < iterations; it += 1) {
    const Y = pasGuttman(X, delta);
    const t = stress(Y, delta);
    X = Y;
    const gain = s - t;
    s = t;
    if (gain < tolerance) break;
  }
  return { X, s };
}

// Générateur pseudo-aléatoire à graine (départs reproductibles).
function alea(graine) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Solution de référence : SMACOF depuis Torgerson et depuis des départs au hasard (graine
// fixe), meilleur stress gardé (évite les minima locaux), puis axes principaux.
export function mds(delta, { iterations = 1000, tolerance = 1e-10, departs = 24 } = {}) {
  verifier(delta);
  let meilleur = descendre(torgerson(delta), delta, iterations, tolerance);
  const connues = delta.flat().filter(connue);
  const etendue = Math.max(...connues, 1e-9);
  const hasard = alea(7);
  for (let k = 0; k < departs; k += 1) {
    const X0 = delta.map(() => [(hasard() - 0.5) * etendue, (hasard() - 0.5) * etendue]);
    const r = descendre(X0, delta, iterations, tolerance);
    if (r.s < meilleur.s - 1e-9) meilleur = r;
  }
  return { points: orienter(meilleur.X), stress: meilleur.s };
}

export function verifier(delta) {
  const n = delta.length;
  if (n < 3) throw new Error('Il faut au moins trois sons.');
  for (let i = 0; i < n; i += 1) {
    if (!Array.isArray(delta[i]) || delta[i].length !== n) throw new Error('Matrice non carrée.');
    const connus = delta[i].filter((v, j) => j !== i && connue(v)).length;
    if (connus < 2) throw new Error('Un son a moins de deux paires notées.');
  }
}
