// Test script to verify meta-analysis fixes
const testStudies = [
  { name: 'Study 1', beta: 0.5, se: 0.1, n: 100 },
  { name: 'Study 2', beta: 0.3, se: 0.2, n: 150 },
  { name: 'Study 3', beta: 0.7, se: 0.15, n: 120 }
];

// Simulate the meta-analysis calculations
function runMetaAnalysis(studies, model = 'fixed') {
  // Weights = 1 / SE^2
  studies.forEach((s) => {
    s.w = 1 / (s.se * s.se);
    s.ci95lo = s.beta - 1.96 * s.se;
    s.ci95hi = s.beta + 1.96 * s.se;
  });

  const W = studies.reduce((sum, s) => sum + s.w, 0);
  const betaFE = studies.reduce((sum, s) => sum + s.w * s.beta, 0) / W;
  const seFE = Math.sqrt(1 / W);
  const Q = studies.reduce((sum, s) => sum + s.w * (s.beta - betaFE) ** 2, 0);
  const k = studies.length;
  const df = k - 1;

  // Fixed I2 calculation with division by zero protection
  const I2 = Q > 0 ? Math.max(0, ((Q - df) / Q) * 100) : 0;

  let betaPool = betaFE;
  let sePool = seFE;
  let tauSq = 0;

  if (model === 'random') {
    // Fixed Tau2 calculation with denominator check
    const C = W - studies.reduce((sum, s) => sum + s.w ** 2, 0) / W;
    tauSq = C > 0 ? Math.max(0, (Q - df) / C) : 0;

    const wRE = studies.map((s) => 1 / (s.se ** 2 + tauSq));
    const Wre = wRE.reduce((a, b) => a + b, 0);
    betaPool = wRE.reduce((sum, w, i) => sum + w * studies[i].beta, 0) / Wre;
    sePool = Math.sqrt(1 / Wre);
    studies.forEach((s, i) => (s.wRE = wRE[i]));
  }

  const zPool = betaPool / sePool;
  const pPool = 2 * (1 - normCDF(Math.abs(zPool)));
  const ci95lo = betaPool - 1.96 * sePool;
  const ci95hi = betaPool + 1.96 * sePool;

  return { betaPool, sePool, ci95lo, ci95hi, zPool, pPool, Q, I2, df, k, tauSq, model };
}

function normCDF(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly =
    t *
    (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0
    ? 1 - 0.3989422804 * Math.exp(-0.5 * z * z) * poly
    : 0.3989422804 * Math.exp(-0.5 * z * z) * poly;
}

// Test cases
console.log('Testing meta-analysis fixes...');

// Test 1: Normal case
console.log('\n=== Test 1: Normal case (fixed effects) ===');
const result1 = runMetaAnalysis(testStudies, 'fixed');
console.log('Results:', JSON.stringify(result1, null, 2));

// Test 2: Random effects
console.log('\n=== Test 2: Normal case (random effects) ===');
const result2 = runMetaAnalysis(testStudies, 'random');
console.log('Results:', JSON.stringify(result2, null, 2));

// Test 3: Edge case with identical studies (should produce Q=0)
console.log('\n=== Test 3: Identical studies (Q should be 0) ===');
const identicalStudies = [
  { name: 'Study A', beta: 0.5, se: 0.1, n: 100 },
  { name: 'Study B', beta: 0.5, se: 0.1, n: 100 },
  { name: 'Study C', beta: 0.5, se: 0.1, n: 100 }
];
const result3 = runMetaAnalysis(identicalStudies, 'fixed');
console.log('Q:', result3.Q);
console.log('I2:', result3.I2);
console.log('TauSq:', result3.tauSq);

// Test 4: Edge case that might cause denominator <= 0 in TauSq
console.log('\n=== Test 4: Potential denominator issue ===');
const edgeCaseStudies = [
  { name: 'Study X', beta: 0.1, se: 0.05, n: 50 },
  { name: 'Study Y', beta: 0.1, se: 0.05, n: 50 }
];
const result4 = runMetaAnalysis(edgeCaseStudies, 'random');
console.log('Results:', JSON.stringify(result4, null, 2));

console.log('\n=== All tests completed ===');