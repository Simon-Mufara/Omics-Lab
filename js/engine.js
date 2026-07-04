/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Simulation Engine
   Quality tracking, error propagation, scoring
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.State = {
  workflow: null,
  currentStep: 0,
  score: 100,
  quality: {
    sampleIntegrity:  100,
    yield:            100,
    purity:           100,
    libraryComplexity:100,
    sequencingQ30:    100,
    alignmentRate:    100,
    duplication:        0,
    contamination:      0
  },
  multipliers: {
    sampleIntegrity: 1.0,
    yield:           1.0,
    purity:          1.0,
    libraryComplexity:1.0,
    sequencingQ30:   1.0,
    alignmentRate:   1.0,
    duplication:     1.0,
    contamination:   1.0
  },
  mistakes: [],
  stepResults: [],
  selections: {},
  timerStart: null,
  elapsed: 0
};

OmicsLab.Engine = (function() {

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* Apply a quality delta object, respecting error-propagation multipliers */
  function applyQualityDeltas(deltas) {
    const q  = OmicsLab.State.quality;
    const mx = OmicsLab.State.multipliers;
    for (const [key, raw] of Object.entries(deltas)) {
      const amplified = raw * (mx[key] || 1.0);
      if (key === 'duplication' || key === 'contamination') {
        q[key] = clamp(q[key] + amplified, 0, 100);
      } else {
        q[key] = clamp(q[key] + amplified, 0, 100);
      }
      /* If a mistake, increase the multiplier for downstream steps */
      if (raw < 0 && (key !== 'duplication' && key !== 'contamination')) {
        mx[key] = clamp(mx[key] + 0.25, 1.0, 2.5);
      }
      if (raw > 0 && (key === 'duplication' || key === 'contamination')) {
        mx[key] = clamp(mx[key] + 0.2, 1.0, 2.0);
      }
    }
  }

  /* Apply a drag/choice option */
  function applyOption(opt, stepId) {
    applyQualityDeltas(opt.quality || {});
    OmicsLab.State.score = clamp(OmicsLab.State.score + (opt.score || 0), 0, 100);
    if (opt.impact !== 'good') {
      OmicsLab.State.mistakes.push({
        step: stepId,
        choice: opt.label || opt.reagentLabel || '?',
        impact: opt.impact
      });
    }
  }

  /* Apply a slider value */
  function applySlider(step, value) {
    const qDelta = step.quality_fn(value);
    const sDelta = step.score_fn(value);
    applyQualityDeltas(qDelta || {});
    OmicsLab.State.score = clamp(OmicsLab.State.score + sDelta, 0, 100);
    const d = Math.abs(value - step.optimal);
    const range = step.max - step.min;
    let impact = 'good';
    if (d > range * 0.3) impact = 'bad';
    else if (d > range * 0.12) impact = 'warn';
    if (impact !== 'good') {
      OmicsLab.State.mistakes.push({
        step: step.id,
        choice: `${value} ${step.unit} (optimal: ~${step.optimal} ${step.unit})`,
        impact
      });
    }
    return impact;
  }

  /* Compute the displayed score from quality metrics */
  function computeScore() {
    const q = OmicsLab.State.quality;
    const good = ['sampleIntegrity','yield','purity','libraryComplexity','sequencingQ30','alignmentRate'];
    const avg = good.reduce((s, k) => s + q[k], 0) / good.length;
    const penalty = (q.duplication * 0.4 + q.contamination * 0.6) / 4;
    return Math.round(clamp(avg - penalty, 0, 100));
  }

  /* Reset state for a new workflow */
  function reset(workflowId) {
    OmicsLab.State = {
      workflow: workflowId,
      currentStep: 0,
      score: 100,
      quality: {
        sampleIntegrity:  100, yield: 100, purity: 100,
        libraryComplexity:100, sequencingQ30: 100, alignmentRate: 100,
        duplication: 0, contamination: 0
      },
      multipliers: {
        sampleIntegrity:1.0, yield:1.0, purity:1.0,
        libraryComplexity:1.0, sequencingQ30:1.0, alignmentRate:1.0,
        duplication:1.0, contamination:1.0
      },
      mistakes: [], stepResults: [], selections: {},
      timerStart: Date.now(), elapsed: 0
    };
  }

  function qualityColor(v, inverse) {
    if (inverse) {
      return v <= 10 ? '#00C4A0' : v <= 30 ? '#d29922' : '#e5534b';
    }
    return v >= 80 ? '#00C4A0' : v >= 55 ? '#d29922' : '#e5534b';
  }

  function getGrade(score) {
    if (score >= 85) return { letter:'A', cls:'grade-A', verdict:'Publication-Quality', icon:'award' };
    if (score >= 70) return { letter:'B', cls:'grade-B', verdict:'Good Experiment',      icon:'check-circle' };
    if (score >= 55) return { letter:'C', cls:'grade-C', verdict:'Significant Issues',   icon:'alert-triangle' };
    return               { letter:'D', cls:'grade-D', verdict:'Failed — Data Unreliable',icon:'x-circle' };
  }

  return { applyOption, applySlider, applyQualityDeltas, computeScore, reset, qualityColor, getGrade, clamp };
})();
