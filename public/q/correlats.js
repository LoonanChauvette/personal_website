// Corrélats acoustiques des dimensions d'un espace timbral (Cours 7), sans dépendance.
//
// Pour chaque descripteur acoustique (tools/descripteurs_timbre.mjs) :
//   - corrélation de Pearson avec chaque dimension de la carte MDS (axes principaux, comme la
//     diapositive MDS) : « quelle dimension suit ce paramètre ? » ;
//   - R² ajusté (régression multiple du descripteur sur toutes les coordonnées) : la part du
//     descripteur expliquée par l'espace entier, quelle que soit l'orientation des axes
//     (ajustement de propriété, « property fitting »), corrigée du nombre de sons et de dimensions.
// Avec peu de sons, une forte corrélation peut venir du hasard : seuilCritique(n) donne la
// corrélation minimale significative (p < 0,05, bilatéral).

export function pearson(a, b) {
  const n = a.length;
  if (n < 3 || b.length !== n) return null;
  const ma = a.reduce((s, v) => s + v, 0) / n, mb = b.reduce((s, v) => s + v, 0) / n;
  let ab = 0, aa = 0, bb = 0;
  for (let i = 0; i < n; i++) {
    ab += (a[i] - ma) * (b[i] - mb);
    aa += (a[i] - ma) ** 2;
    bb += (b[i] - mb) ** 2;
  }
  return aa > 0 && bb > 0 ? ab / Math.sqrt(aa * bb) : null;
}

// Moindres carrés y ≈ b0 + Σ bk·xk (X : une ligne par son). → { coefficients, r2 } ou null.
export function regression(y, X) {
  const n = y.length, k = X[0]?.length ?? 0;
  if (n <= k + 1) return null;
  const A = X.map((ligne) => [1, ...ligne]);
  const m = k + 1;
  const M = Array.from({ length: m }, (_, i) => [
    ...Array.from({ length: m }, (_, j) => A.reduce((s, l) => s + l[i] * l[j], 0)),
    A.reduce((s, l, t) => s + l[i] * y[t], 0),
  ]);
  for (let c = 0; c < m; c++) {
    let p = c;
    for (let r = c + 1; r < m; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < m; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let j = c; j <= m; j++) M[r][j] -= f * M[c][j];
    }
  }
  const b = M.map((l, i) => l[m] / l[i]);
  const my = y.reduce((s, v) => s + v, 0) / n;
  let res = 0, tot = 0;
  A.forEach((l, t) => {
    const pred = l.reduce((s, v, i) => s + v * b[i], 0);
    res += (y[t] - pred) ** 2;
    tot += (y[t] - my) ** 2;
  });
  const r2 = tot > 0 ? Math.max(0, 1 - res / tot) : 0;
  // R² ajusté : avec peu de sons et plusieurs dimensions, le R² brut est gonflé par le hasard
  // (6 sons, 3 dimensions : R² ≈ 0,6 attendu sans aucun lien). Borné à 0.
  const r2ajuste = Math.max(0, 1 - ((1 - r2) * (n - 1)) / (n - k - 1));
  return { coefficients: b, r2, r2ajuste };
}

// t de Student bilatéral à 5 % (ddl 1…30, puis approximation normale corrigée).
const T975 = [12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.16, 2.145,
  2.131, 2.12, 2.11, 2.101, 2.093, 2.086, 2.08, 2.074, 2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042];

// Corrélation minimale significative (p < 0,05, bilatéral) avec n sons.
export function seuilCritique(n) {
  const ddl = n - 2;
  if (ddl < 1) return 1;
  const t = ddl <= 30 ? T975[ddl - 1] : 1.96 + 2.4 / ddl;
  return t / Math.sqrt(ddl + t * t);
}

/**
 * points : coordonnées MDS (une ligne par son, dans l'ordre de cles) ;
 * valeurs : { cleSon: { cleDescripteur: nombre } } ; descripteurs : [{ cle, … }].
 * → { n, seuil, lignes: [{ cle, r: [r par dimension], r2 (ajusté) }], meilleurs: [cle par dimension] }
 */
export function analyser(points, cles, valeurs, descripteurs) {
  const dim = points[0]?.length ?? 0;
  const n = points.length;
  const coord = Array.from({ length: dim }, (_, k) => points.map((p) => p[k]));
  const lignes = descripteurs.map((d) => {
    const y = cles.map((c) => valeurs[c]?.[d.cle]);
    if (y.some((v) => !Number.isFinite(v))) return { cle: d.cle, r: coord.map(() => null), r2: null };
    return { cle: d.cle, r: coord.map((x) => pearson(x, y)), r2: regression(y, points)?.r2ajuste ?? null };
  });
  const meilleurs = coord.map((_, k) => {
    let m = null;
    for (const l of lignes) if (l.r[k] !== null && (!m || Math.abs(l.r[k]) > Math.abs(m.r[k]))) m = l;
    return m ? m.cle : null;
  });
  return { n, dim, seuil: seuilCritique(n), lignes, meilleurs };
}

// Correspondance des dimensions de deux cartes des mêmes sons : pour chaque dimension de A, la
// dimension de B la plus corrélée (|r|) et r. Sert à comparer la classe à McAdams.
export function correspondance(A, B) {
  const dimA = A[0]?.length ?? 0, dimB = B[0]?.length ?? 0;
  return Array.from({ length: dimA }, (_, i) => {
    let best = { dim: null, r: 0 };
    for (let j = 0; j < dimB; j++) {
      const r = pearson(A.map((p) => p[i]), B.map((p) => p[j]));
      if (r !== null && Math.abs(r) > Math.abs(best.r)) best = { dim: j, r };
    }
    return best;
  });
}
