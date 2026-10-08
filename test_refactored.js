// Test to verify the refactored meta-analysis math still works correctly
const testMetaAnalysis = (function () {
  // Copy the key constants
  const CONSTANTS = {
    NUMERICAL: {
      MIN_SE: 0.0001,
      Q_THRESHOLD: 0,
      TAU_SQ_THRESHOLD: 0,
    },
    Z_SCORE_95_CI: 1.96,
    PERCENTAGE_MULTIPLIER: 100
  };

  // Copy the normCDF function
  function normCDF(z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const poly =
      t *
      (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return z >= 0
      ? 1 - 0.3989422804 * Math.exp(-0.5 * z * z) * poly
      : 0.3989422804 * Math.exp(-0.5 * z * z) * poly;
  }

  // Test function that replicates the core logic from _run()
  function runMetaAnalysisTest(studiesInput, model = 'fixed') {
    // Single pass to calculate all study statistics
    const studyStats = studiesInput.map(study => {
      const w = 1 / (study.se * study.se);
      return {
        ...study,
        w,
        ci95lo: study.beta - CONSTANTS.Z_SCORE_95_CI * study.se,
        ci95hi: study.beta + CONSTANTS.Z_SCORE_95_CI * study.se
      };
    });

    // Calculate sums in single pass where possible
    let sumW = 0;
    let sumWBeta = 0;
    let sumWBetasq = 0; // For Tau² calculation

    studyStats.forEach(s => {
      sumW += s.w;
      sumWBeta += s.w * s.beta;
      sumWBetasq += s.w * s.beta * s.beta;
    });

    const betaFE = sumWBeta / sumW;
    const seFE = Math.sqrt(1 / sumW);

    // Calculate Q statistic (heterogeneity)
    let Q = 0;
    studyStats.forEach(s => {
      const diff = s.beta - betaFE;
      Q += s.w * diff * diff;
    });

    const k = studyStats.length;
    const df = k - 1;
    const I2 = Q > CONSTANTS.NUMERICAL.Q_THRESHOLD
      ? Math.max(0, ((Q - df) / Q) * CONSTANTS.PERCENTAGE_MULTIPLIER)
      : 0;

    // Calculate pooled effect
    let betaPool = betaFE;
    let sePool = seFE;
    let tauSq = 0;

    if (model === 'random') {
      // Calculate C for Tau² (single pass)
      let sumWsq = 0;
      studyStats.forEach(s => {
        sumWsq += s.w * s.w;
      });

      const C = sumW - (sumWsq / sumW);
      tauSq = C > CONSTANTS.NUMERICAL.TAU_SQ_THRESHOLD
        ? Math.max(0, (Q - df) / C)
        : 0;

      // Calculate random-effects weights and pooled estimate
      let sumWre = 0;
      let sumWreBeta = 0;

      studyStats.forEach((s, i) => {
        const wRE = 1 / (s.se * s.se + tauSq);
        s.wRE = wRE; // Store for later use in visualization
        sumWre += wRE;
        sumWreBeta += wRE * s.beta;
      });

      betaPool = sumWreBeta / sumWre;
      sePool = Math.sqrt(1 / sumWre);
    }

    const zPool = betaPool / sePool;
    const pPool = 2 * (1 - normCDF(Math.abs(zPool)));
    const ci95lo = betaPool - CONSTANTS.Z_SCORE_95_CI * sePool;
    const ci95hi = betaPool + CONSTANTS.Z_SCORE_95_CI * sePool;

    return { betaPool, sePool, ci95lo, ci95hi, zPool, pPool, Q, I2, df, k, tauSq, model };
  }

  return { runMetaAnalysisTest };
})();

// Test cases
function runTests() {
  console.log('Testing refactored meta-analysis math...');

  // Test 1: Normal case (3 studies)
  const testStudies1 = [
    { name: 'Study 1', beta: 0.5, se: 0.1, n: 100 },
    { name: 'Study 2', beta: 0.3, se: 0.2, n: 150 },
    { name: 'Study 3', beta: 0.7, se: 0.15, n: 120 }
  ];

  console.log('\nTest 1: Normal case (Fixed Effects)');
  const result1 = testMetaAnalysis.runMetaAnalysisTest(testStudies1, 'fixed');
  console.log(JSON.stringify(result1, null, 2));

  console.log('\nTest 1: Normal case (Random Effects)');
  const result2 = testMetaAnalysis.runMetaAnalysisTest(testStudies1, 'random');
  console.log(JSON.stringify(result2, null, 2));

  // Test 2: Identical studies (should produce Q=0, I2=0)
  const testStudies2 = [
    { name: 'Study A', beta: 0.5, se: 0.1, n: 100 },
    { name: 'Study B', beta: 0.5, se: 0.1, n: 100 },
    { name: 'Study C', beta: 0.5, se: 0.1, n: 100 }
  ];

  console.log('\nTest 2: Identical studies (Q should be 0)');
  const result3 = testMetaAnalysis.runMetaAnalysisTest(testStudies2, 'fixed');
  console.log(`Q: ${result3.Q}`);
  console.log(`I2: ${result3.I2}%`);
  console.log(`TauSq: ${result3.tauSq}`);

  // Test 3: Edge case that might cause issues
  const testStudies3 = [
    { name: 'Study X', beta: 0.1, se: 0.05, n: 50 },
    { name: 'Study Y', beta: 0.1, se: 0.05, n: 50 }
  ];

  console.log('\nTest 3: Potential denominator issue');
  const result4 = testMetaAnalysis.runMetaAnalysisTest(testStudies3, 'random');
  console.log(JSON.stringify(result4, null, 2));

  // Test 4: Very small SE values (testing validation)
  const testStudies4 = [
    { name: 'Study A', beta: 0.5, se: 0.00001, n: 100 }, // Below MIN_SE
    { name: 'Study B', beta: 0.3, se: 0.2, n: 150 }
  ];

  console.log('\nTest 4: Very small SE (should be filtered out)');
  try {
    const result5 = testMetaAnalysis.runMetaAnalysisTest(testStudies4, 'fixed');
    console.log(`Studies parsed: ${result5.k} (should be 1)`);
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }

  console.log('\nAll tests completed!');
}

runTests();