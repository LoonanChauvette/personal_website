// Positionnement multidimensionnel (MDS) métrique, sans dépendance.
// Utilisé par la diapositive MDS du Cours 7 (diapo-mds.js) et par les tests (Node).
//
// Entrée : matrice de dissimilarité n × n, symétrique, diagonale 0, `null` pour une
// paire sans note (poids nul : jamais remplacée par 0). Sortie : n points en `dim`
// dimensions (1, 2 ou 3 ; 2 par défaut).
//
//   - torgerson(delta, dim) : MDS classique (double centrage, premiers vecteurs propres) ;
//   - pasGuttman(X, delta)  : une itération SMACOF (transformée de Guttman, poids 0/1) ;
//   - mds(delta, {dim})     : SMACOF (Torgerson + départs au hasard à graine fixe), axes principaux ;
//   - stress(X, delta)      : stress-1 de Kruskal (forme métrique) ;
//   - aligner(X, ref)       : Procrustes (translation, rotation, symétrie, échelle) vers ref.

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
  const m = Array.from({ length: X[0].length }, (_, k) => X.reduce((s, p) => s + p[k], 0) / n);
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
  const BX = B.map((ligne) => Array.from({ length: X[0].length }, (_, k) => ligne.reduce((s, b, j) => s + b * X[j][k], 0)));
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

// Valeurs et vecteurs propres d'une matrice symétrique (Jacobi), valeurs décroissantes.
// vecteurs[k] : k-ième vecteur propre (norme 1).
export function propres(S) {
  const n = S.length;
  const A = S.map((l) => l.slice());
  const V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let balayage = 0; balayage < 100; balayage += 1) {
    let hors = 0;
    for (let p = 0; p < n; p += 1) for (let q = p + 1; q < n; q += 1) hors += A[p][q] ** 2;
    if (hors < 1e-22) break;
    for (let p = 0; p < n; p += 1) {
      for (let q = p + 1; q < n; q += 1) {
        if (Math.abs(A[p][q]) < 1e-300) continue;
        const theta = (A[q][q] - A[p][p]) / (2 * A[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < n; k += 1) {
          const [akp, akq] = [A[k][p], A[k][q]];
          A[k][p] = c * akp - s * akq;
          A[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k += 1) {
          const [apk, aqk] = [A[p][k], A[q][k]];
          A[p][k] = c * apk - s * aqk;
          A[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k += 1) {
          const [vkp, vkq] = [V[k][p], V[k][q]];
          V[k][p] = c * vkp - s * vkq;
          V[k][q] = s * vkp + c * vkq;
        }
      }
    }
  }
  const ordre = Array.from({ length: n }, (_, i) => i).sort((i, j) => A[j][j] - A[i][i]);
  return { valeurs: ordre.map((i) => A[i][i]), vecteurs: ordre.map((i) => V.map((l) => l[i])) };
}

// MDS classique. Les paires manquantes prennent la moyenne des paires connues (départ seulement).
export function torgerson(delta, dim = 2) {
  const n = delta.length;
  const connues = [];
  for (let i = 0; i < n; i += 1) for (let j = i + 1; j < n; j += 1) if (connue(delta[i][j])) connues.push(delta[i][j]);
  const defaut = connues.length ? connues.reduce((s, v) => s + v, 0) / connues.length : 1;
  const D2 = delta.map((l, i) => l.map((v, j) => (i === j ? 0 : (connue(v) ? v : defaut) ** 2)));
  const ml = D2.map((l) => l.reduce((s, v) => s + v, 0) / n);
  const mt = ml.reduce((s, v) => s + v, 0) / n;
  const Bc = D2.map((l, i) => l.map((v, j) => -0.5 * (v - ml[i] - ml[j] + mt)));
  const { valeurs, vecteurs } = propres(Bc);
  // Valeur propre nulle ou négative : petite dispersion (SMACOF a besoin d'un départ non dégénéré).
  return Array.from({ length: n }, (_, i) => Array.from({ length: dim }, (_, k) => (
    vecteurs[k][i] * Math.sqrt(Math.max(valeurs[k], 1e-6 * Math.abs(valeurs[0]) + 1e-9)))));
}

// Axes principaux de la configuration (dimension 1 = plus grande étendue), sens fixé par le
// premier son (côté négatif de chaque axe : à gauche, en bas, devant).
export function orienter(X) {
  const C = centrer(X);
  const dim = C[0].length;
  const cov = Array.from({ length: dim }, (_, a) => Array.from({ length: dim }, (_, b) => C.reduce((s, p) => s + p[a] * p[b], 0)));
  const { vecteurs } = propres(cov);
  const R = C.map((p) => vecteurs.map((u) => u.reduce((s, x, k) => s + x * p[k], 0)));
  for (let k = 0; k < dim; k += 1) {
    if (R[0][k] > 1e-12) R.forEach((p) => { p[k] = -p[k]; });
  }
  return R;
}

// Procrustes : translation, transformation orthogonale (rotation ou symétrie) et échelle
// qui rapprochent X de ref. Q = U Vᵀ pour AᵀB = U Σ Vᵀ, calculé comme M (MᵀM)^(-1/2).
export function aligner(X, ref) {
  const A = centrer(X);
  const B = centrer(ref);
  const dim = A[0].length;
  const M = Array.from({ length: dim }, (_, a) => Array.from({ length: dim }, (_, b) => A.reduce((s, p, i) => s + p[a] * B[i][b], 0)));
  const MtM = Array.from({ length: dim }, (_, a) => Array.from({ length: dim }, (_, b) => M.reduce((s, l) => s + l[a] * l[b], 0)));
  const { valeurs, vecteurs } = propres(MtM);
  const plafond = Math.max(valeurs[0], 1e-300);
  // (MᵀM)^(-1/2) = Σ_k v_k v_kᵀ / √λ_k (λ quasi nul : direction ignorée).
  const racineInv = Array.from({ length: dim }, (_, a) => Array.from({ length: dim }, (_, b) => vecteurs.reduce(
    (s, u, k) => (valeurs[k] > 1e-12 * plafond ? s + (u[a] * u[b]) / Math.sqrt(valeurs[k]) : s), 0)));
  const Q = M.map((l) => Array.from({ length: dim }, (_, b) => l.reduce((s, m, k) => s + m * racineInv[k][b], 0)));
  let trace = 0;
  for (let a = 0; a < dim; a += 1) for (let b = 0; b < dim; b += 1) trace += Q[a][b] * M[a][b];
  const norme = A.reduce((s, p) => s + p.reduce((t, v) => t + v * v, 0), 0);
  const echelle = norme > 0 ? trace / norme : 1;
  const mref = Array.from({ length: dim }, (_, k) => ref.reduce((t, p) => t + p[k], 0) / ref.length);
  return A.map((p) => Array.from({ length: dim }, (_, b) => echelle * p.reduce((s, v, a) => s + v * Q[a][b], 0) + mref[b]));
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
// En 1D, SMACOF reste souvent bloqué sur un mauvais ordre des points : plus de départs.
// Au-delà de 8 sons (données de la littérature), 8 départs suffisent et restent rapides.
function departsParDefaut(n, dim) {
  if (n > 8) return 8;
  return dim === 1 ? 80 : 24;
}

export function mds(delta, { dim = 2, iterations = 1000, tolerance = 1e-9, departs = departsParDefaut(delta.length, dim) } = {}) {
  if (![1, 2, 3].includes(dim)) throw new Error('Nombre de dimensions : 1, 2 ou 3.');
  verifier(delta);
  let meilleur = descendre(torgerson(delta, dim), delta, iterations, tolerance);
  const connues = delta.flat().filter(connue);
  const etendue = Math.max(...connues, 1e-9);
  const hasard = alea(7);
  for (let k = 0; k < departs; k += 1) {
    const X0 = delta.map(() => Array.from({ length: dim }, () => (hasard() - 0.5) * etendue));
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
