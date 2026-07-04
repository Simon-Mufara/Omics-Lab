/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Statistics for Genomics
   window.OmicsLab.StatsGenomics
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.StatsGenomics = (function () {

  /* ─── Seeded RNG ─── */
  function _rng(seed) { let s=seed; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; }

  /* ─── Normal distribution helpers ─── */
  function _normPDF(x, mu=0, sd=1) { return Math.exp(-0.5*((x-mu)/sd)**2)/(sd*Math.sqrt(2*Math.PI)); }
  function _normCDF(z) { /* Abramowitz & Stegun approximation */
    const t=1/(1+0.2316419*Math.abs(z));
    const d=0.3989423*Math.exp(-z*z/2);
    const p=d*t*(0.3193815+t*(-0.3565638+t*(1.7814779+t*(-1.8212560+t*1.3302744))));
    return z>0?1-p:p;
  }
  function _normINV(p) { /* rational approximation */
    if(p<=0)return -Infinity; if(p>=1)return Infinity;
    const a=[-3.969683028665376e1,2.209460984245205e2,-2.759285104469687e2,1.383577518672690e2,-3.066479806614716e1,2.506628277459239];
    const b=[-5.447609879822406e1,1.615858368580409e2,-1.556989798598866e2,6.680131188771972e1,-1.328068155288572e1];
    const c=[-7.784894002430293e-3,-3.223964580411365e-1,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783];
    const d=[7.784695709041462e-3,3.224671290700398e-1,2.445134137142996,3.754408661907416];
    const pLow=0.02425, pHigh=1-pLow;
    if(p<pLow){const q=Math.sqrt(-2*Math.log(p));return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
    if(p<=pHigh){const q=p-0.5,r=q*q;return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);}
    const q=Math.sqrt(-2*Math.log(1-p));return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
  function _chiPval(chi2, df=1) { /* chi² CDF approximation via regularized gamma */
    if(chi2<=0) return 1;
    const x=chi2/2, k=df/2;
    /* series for lower incomplete gamma / gamma(k) */
    let s=1/k, t=1/k;
    for(let i=1;i<200;i++){ t*=x/(k+i); s+=t; if(t<1e-10*s)break; }
    const gRatio=s*Math.exp(-x+k*Math.log(x)-_lgamma(k));
    return 1-Math.max(0,Math.min(1,gRatio));
  }
  function _lgamma(z) { /* Stirling approximation */
    const c=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5];
    let y=z, x=z, tmp=x+5.5; tmp-=(x+0.5)*Math.log(tmp);
    let ser=1.000000000190015;
    for(const ci of c){y++;ser+=ci/y;}
    return -tmp+Math.log(2.506628274631*ser/x);
  }

  let _tab = 'multiple-testing';

  /* ════════ INIT ════════ */
  function init() {
    const container = document.getElementById('stats-genomics-content');
    if (!container || container.querySelector('.sg-page')) return;
    try { _render(container); } catch(e) { console.error('StatsGenomics init error:', e); throw e; }
  }

  function _render(container) {
    container.innerHTML = `
    <div class="sg-page">
      <div class="sg-header">
        <h1 class="sg-title">Statistics for Genomics</h1>
        <p class="sg-sub">The quantitative foundations every bioinformatician needs — multiple testing, power, effect sizes, and Bayesian thinking — illustrated with African omics data.</p>
      </div>
      <div class="sg-tabs" role="tablist">
        ${[
          ['multiple-testing','Multiple Testing'],
          ['power','Power Analysis'],
          ['effect-sizes','Effect Sizes'],
          ['bayesian','Bayesian Inference'],
          ['pitfalls','Common Pitfalls'],
        ].map(([id,label])=>`
          <button class="sg-tab${_tab===id?' active':''}" role="tab" data-tab="${id}" onclick="OmicsLab.StatsGenomics.setTab('${id}')">${label}</button>
        `).join('')}
      </div>
      <div id="sg-tab-body"></div>
    </div>`;
    _renderTab();
  }

  function setTab(id) {
    _tab = id;
    document.querySelectorAll('.sg-tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===id));
    _renderTab();
  }

  function _renderTab() {
    const body = document.getElementById('sg-tab-body');
    if (!body) return;
    if (_tab==='multiple-testing') { body.innerHTML = _tabMT();     _drawMT(); }
    if (_tab==='power')            { body.innerHTML = _tabPower();  _initPower(); }
    if (_tab==='effect-sizes')     { body.innerHTML = _tabEffect(); }
    if (_tab==='bayesian')         { body.innerHTML = _tabBayes();  _initBayes(); }
    if (_tab==='pitfalls')         { body.innerHTML = _tabPitfalls(); }
  }

  /* ════════ TAB: Multiple Testing ════════ */
  function _tabMT() {
    return `
    <div class="sg-mt-section">
      <div class="sg-concept-box">
        <div class="sg-concept-title">The Multiple Testing Problem</div>
        <p class="sg-concept-body">A GWAS tests ~8 million SNPs simultaneously. If each test uses α = 0.05, you expect <strong>400,000 false positives</strong> by chance. The genome-wide significance threshold (p &lt; 5×10⁻⁸) was derived to limit this to ~1 expected false positive per study.</p>
      </div>
      <div class="sg-mt-layout">
        <div>
          <div class="sg-sb-title">GWAS Manhattan Plot — Before & After Correction</div>
          <div class="sg-chart-card">
            <svg id="sg-manhattan-svg" width="640" height="220" viewBox="0 0 640 220" style="max-width:100%"></svg>
            <div class="sg-legend-row">
              <span class="sg-leg-dot" style="background:#f85149"></span><span class="sg-leg-label">Fails all corrections</span>
              <span class="sg-leg-dot" style="background:#e3b341"></span><span class="sg-leg-label">Survives Bonferroni only</span>
              <span class="sg-leg-dot" style="background:#00C4A0"></span><span class="sg-leg-label">Survives both (FDR 5%)</span>
              <span class="sg-leg-dot" style="background:#6E6860"></span><span class="sg-leg-label">Not significant</span>
            </div>
          </div>
        </div>
        <div class="sg-correction-cards">
          ${[
            { name: 'Bonferroni', formula: 'α / m', color: '#e3b341',
              when: 'Independent tests; stringent false-positive control required',
              pro: 'Strict family-wise error rate (FWER) control; widely accepted',
              con: 'Overly conservative with correlated tests (LD in GWAS)',
              gwas: 'p < 5×10⁻⁸ for ~1M independent tests (α=0.05/1,000,000)' },
            { name: 'Benjamini-Hochberg FDR', formula: 'Q-value method', color: '#00C4A0',
              when: 'Exploratory analyses; RNA-seq DEG; correlated tests acceptable',
              pro: 'Controls expected proportion of false discoveries; more power',
              con: 'Some false positives allowed by design; interpretation requires care',
              gwas: 'DESeq2 uses BH FDR: padj < 0.05 means ≤5% of significant genes are false' },
            { name: 'Permutation', formula: 'Empirical null', color: '#58a6ff',
              when: 'Non-parametric data; unusual test statistics; small samples',
              pro: 'Exact control; no distributional assumptions',
              con: 'Computationally expensive; infeasible for millions of SNPs',
              gwas: 'Used for pathway enrichment tests and population structure PCs' },
          ].map(c=>`
            <div class="sg-corr-card" style="border-left:3px solid ${c.color}">
              <div class="sg-corr-name" style="color:${c.color}">${c.name}</div>
              <div class="sg-corr-formula">${c.formula}</div>
              <div class="sg-corr-row"><span class="sg-corr-label">Use when</span>${c.when}</div>
              <div class="sg-corr-row"><span class="sg-corr-label" style="color:#00C4A0">Advantage</span>${c.pro}</div>
              <div class="sg-corr-row"><span class="sg-corr-label" style="color:#f85149">Limitation</span>${c.con}</div>
              <div class="sg-corr-example">${c.gwas}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  function _drawMT() {
    const svg = document.getElementById('sg-manhattan-svg');
    if (!svg) return;
    const rng = _rng(77);
    const W=640, H=220, padL=40, padR=10, padT=10, padB=30;
    const chroms = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,22];
    const pts = [];
    chroms.forEach((chr,ci)=>{
      const n = 18 + Math.floor(rng()*10);
      for(let i=0;i<n;i++){
        const x = padL + ((ci*20+rng()*18)/(chroms.length*20))*(W-padL-padR);
        const base = rng()*0.97;
        const p = base < 0.93 ? rng()*0.05+0.01 : rng()*1e-5;
        const logp = -Math.log10(p);
        const y = padT + (H-padT-padB) - Math.min(logp/12,1)*(H-padT-padB);
        let col = '#6E6860';
        if(logp>7.3) col='#00C4A0';
        else if(logp>5) col='#e3b341';
        else if(logp>3) col='#f85149';
        pts.push({x,y,col,logp,chr});
      }
    });
    const bonf = padT+(H-padT-padB)-(7.3/12)*(H-padT-padB);
    const fdr  = padT+(H-padT-padB)-(5.0/12)*(H-padT-padB);
    let html = '';
    /* grid */
    [0,2,4,6,8,10,12].forEach(v=>{
      const y=padT+(H-padT-padB)-(v/12)*(H-padT-padB);
      html+=`<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="#182236" stroke-width="0.5"/>`;
      html+=`<text x="${padL-4}" y="${y+4}" text-anchor="end" fill="#6E6860" font-size="9">${v}</text>`;
    });
    /* threshold lines */
    html+=`<line x1="${padL}" y1="${bonf}" x2="${W-padR}" y2="${bonf}" stroke="#e3b341" stroke-width="1" stroke-dasharray="4,3"/>`;
    html+=`<text x="${W-padR-2}" y="${bonf-3}" text-anchor="end" fill="#e3b341" font-size="8">Bonferroni (5×10⁻⁸)</text>`;
    html+=`<line x1="${padL}" y1="${fdr}" x2="${W-padR}" y2="${fdr}" stroke="#00C4A0" stroke-width="1" stroke-dasharray="4,3"/>`;
    html+=`<text x="${W-padR-2}" y="${fdr-3}" text-anchor="end" fill="#00C4A0" font-size="8">FDR 5% (p≈10⁻⁵)</text>`;
    /* points */
    pts.forEach(p=>{ html+=`<circle cx="${p.x}" cy="${p.y}" r="2.5" fill="${p.col}" opacity="0.85"/>`; });
    /* axis */
    html+=`<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${H-padB}" stroke="#243048" stroke-width="1"/>`;
    html+=`<text x="12" y="${H/2+20}" fill="#6E6860" font-size="10" transform="rotate(-90,12,${H/2})" text-anchor="middle">−log₁₀(p)</text>`;
    html+=`<text x="${W/2}" y="${H-4}" text-anchor="middle" fill="#6E6860" font-size="10">Chromosomal position</text>`;
    svg.innerHTML = html;
  }

  /* ════════ TAB: Power Analysis ════════ */
  function _tabPower() {
    return `
    <div class="sg-power-section">
      <div class="sg-concept-box" style="border-color:#58a6ff">
        <div class="sg-concept-title" style="color:#58a6ff">What is Statistical Power?</div>
        <p class="sg-concept-body">Power (1−β) is the probability of detecting a true effect. Low-powered GWAS miss real associations — a chronic problem in African genomics where sample sizes have historically been smaller. Rule of thumb: target 80% power, preferably 90%.</p>
      </div>
      <div class="sg-power-layout">
        <div class="sg-power-calc">
          <div class="sg-sb-title">Interactive Power Calculator</div>
          <div class="sg-power-card">
            <div class="sg-calc-row">
              <label class="sg-calc-label">Effect size (OR or Cohen's d) <span id="sg-es-val">1.30</span></label>
              <input type="range" min="1.05" max="3" step="0.05" value="1.30" class="sg-slider" id="sg-es" oninput="OmicsLab.StatsGenomics.calcPower()">
            </div>
            <div class="sg-calc-row">
              <label class="sg-calc-label">Sample size (cases) <span id="sg-n-val">500</span></label>
              <input type="range" min="50" max="5000" step="50" value="500" class="sg-slider" id="sg-n" oninput="OmicsLab.StatsGenomics.calcPower()">
            </div>
            <div class="sg-calc-row">
              <label class="sg-calc-label">Minor allele frequency <span id="sg-maf-val">0.20</span></label>
              <input type="range" min="0.01" max="0.50" step="0.01" value="0.20" class="sg-slider" id="sg-maf" oninput="OmicsLab.StatsGenomics.calcPower()">
            </div>
            <div class="sg-calc-row">
              <label class="sg-calc-label">Significance threshold (−log₁₀p) <span id="sg-alpha-val">7.3</span></label>
              <input type="range" min="3" max="10" step="0.1" value="7.3" class="sg-slider" id="sg-alpha" oninput="OmicsLab.StatsGenomics.calcPower()">
            </div>
            <div class="sg-power-result" id="sg-power-result"></div>
          </div>
        </div>
        <div class="sg-power-right">
          <div class="sg-sb-title">Power Curves</div>
          <svg id="sg-power-svg" width="340" height="220" viewBox="0 0 340 220" style="max-width:100%"></svg>
          <div class="sg-power-note">African GWAS context: AWI-Gen (n=11,000) achieves &gt;80% power for OR&gt;1.25 at MAF&gt;0.10. Earlier African cohorts (n&lt;2,000) could only detect OR&gt;2.0 reliably — explaining why many African disease variants remain undiscovered.</div>
        </div>
      </div>
    </div>`;
  }

  function _initPower() { calcPower(); }

  function calcPower() {
    const es  = parseFloat(document.getElementById('sg-es')?.value  || 1.3);
    const n   = parseInt(document.getElementById('sg-n')?.value     || 500);
    const maf = parseFloat(document.getElementById('sg-maf')?.value || 0.2);
    const al  = parseFloat(document.getElementById('sg-alpha')?.value|| 7.3);
    const elES=document.getElementById('sg-es-val'), elN=document.getElementById('sg-n-val'),
          elMAF=document.getElementById('sg-maf-val'), elAL=document.getElementById('sg-alpha-val');
    if(elES) elES.textContent=es.toFixed(2);
    if(elN)  elN.textContent=n;
    if(elMAF)elMAF.textContent=maf.toFixed(2);
    if(elAL) elAL.textContent=al.toFixed(1);

    /* Approximate power for case-control GWAS using NCP */
    const alpha=Math.pow(10,-al);
    const zAlpha=_normINV(1-alpha/2);
    const p=maf, q=1-p;
    const logOR=Math.log(es);
    const ncp=Math.sqrt(n)*Math.abs(logOR)*Math.sqrt(p*q);
    const power=1-_normCDF(zAlpha-ncp)+_normCDF(-zAlpha-ncp);
    const powerPct=Math.max(0,Math.min(100,power*100));

    const res=document.getElementById('sg-power-result');
    if(res){
      const col=powerPct>=80?'#00C4A0':powerPct>=50?'#e3b341':'#f85149';
      res.innerHTML=`
        <div class="sg-power-num" style="color:${col}">${powerPct.toFixed(1)}%</div>
        <div class="sg-power-label">Statistical Power</div>
        <div class="sg-power-interp">${powerPct>=80?'Adequate power — likely to detect the true association':'Underpowered — consider increasing sample size or recruiting admixed cohorts'}</div>
        <div class="sg-power-req">To achieve 80% power at this effect size: <strong>N ≈ ${_nFor80(es,maf,alpha).toLocaleString()} cases</strong></div>`;
    }
    _drawPowerCurves(maf, al);
  }

  function _nFor80(es,maf,alpha){
    const p=maf,q=1-p,logOR=Math.log(es),zAlpha=_normINV(1-alpha/2),zBeta=_normINV(0.80);
    const n=Math.pow((zAlpha+zBeta)/(Math.abs(logOR)*Math.sqrt(p*q)),2);
    return Math.ceil(n);
  }

  function _drawPowerCurves(maf, alphaPow) {
    const svg=document.getElementById('sg-power-svg'); if(!svg)return;
    const W=340,H=220,pL=40,pB=30,pT=10,pR=10;
    const alpha=Math.pow(10,-alphaPow);
    const zAlpha=_normINV(1-alpha/2);
    let html='';
    /* grid */
    [0,20,40,60,80,100].forEach(v=>{
      const y=pT+(H-pT-pB)*(1-v/100);
      html+=`<line x1="${pL}" y1="${y}" x2="${W-pR}" y2="${y}" stroke="#182236" stroke-width="0.5"/>`;
      html+=`<text x="${pL-4}" y="${y+4}" text-anchor="end" fill="#6E6860" font-size="9">${v}%</text>`;
    });
    /* 80% power line */
    const y80=pT+(H-pT-pB)*0.2;
    html+=`<line x1="${pL}" y1="${y80}" x2="${W-pR}" y2="${y80}" stroke="#00C4A0" stroke-width="0.8" stroke-dasharray="3,3"/>`;
    html+=`<text x="${pL+3}" y="${y80-3}" fill="#00C4A0" font-size="8">80% target</text>`;
    /* curves: different sample sizes */
    const curves=[
      {n:500,  col:'#f85149', label:'n=500'},
      {n:2000, col:'#e3b341', label:'n=2,000'},
      {n:5000, col:'#58a6ff', label:'n=5,000'},
      {n:11000,col:'#00C4A0', label:'n=11,000 (AWI-Gen)'},
    ];
    const nVals=40;
    curves.forEach(({n,col,label})=>{
      let path=''; const p=maf,q=1-p;
      for(let i=0;i<=nVals;i++){
        const or=1+i*2.5/nVals;
        const logOR=Math.log(or);
        const ncp=Math.sqrt(n)*Math.abs(logOR)*Math.sqrt(p*q);
        const pw=Math.max(0,Math.min(1,1-_normCDF(zAlpha-ncp)+_normCDF(-zAlpha-ncp)));
        const x=pL+i*(W-pL-pR)/nVals;
        const y=pT+(H-pT-pB)*(1-pw);
        path+=(i===0?`M${x},${y}`:`L${x},${y}`);
      }
      html+=`<path d="${path}" fill="none" stroke="${col}" stroke-width="1.8"/>`;
      const labelX=W-pR-3, labelOR=3.5, logOR=Math.log(labelOR);
      const ncp=Math.sqrt(n)*logOR*Math.sqrt(maf*(1-maf));
      const pw=Math.max(0,Math.min(1,1-_normCDF(zAlpha-ncp)+_normCDF(-zAlpha-ncp)));
      html+=`<text x="${W-pR+2}" y="${pT+(H-pT-pB)*(1-pw)+4}" fill="${col}" font-size="8" font-weight="700">${label}</text>`;
    });
    html+=`<line x1="${pL}" y1="${pT}" x2="${pL}" y2="${H-pB}" stroke="#243048" stroke-width="1"/>`;
    html+=`<text x="${W/2}" y="${H-4}" text-anchor="middle" fill="#6E6860" font-size="9">Odds Ratio</text>`;
    html+=`<text x="10" y="${H/2}" fill="#6E6860" font-size="9" transform="rotate(-90,10,${H/2})" text-anchor="middle">Power</text>`;
    /* x axis labels */
    [1,1.5,2,2.5,3,3.5].forEach(or=>{
      const x=pL+(or-1)*2.5/2.5*(W-pL-pR)/2.5*(2.5/(3.5-1));
      /* recompute x: OR ranges 1–3.5 */
      const xx=pL+(or-1)/(3.5-1)*(W-pL-pR);
      html+=`<text x="${xx}" y="${H-pB+10}" text-anchor="middle" fill="#6E6860" font-size="8">${or}</text>`;
    });
    svg.innerHTML=html;
  }

  /* ════════ TAB: Effect Sizes ════════ */
  function _tabEffect() {
    return `
    <div class="sg-effect-section">
      <div class="sg-concept-box" style="border-color:#bc8cff">
        <div class="sg-concept-title" style="color:#bc8cff">Why p-values alone are insufficient</div>
        <p class="sg-concept-body">A GWAS with 100,000 samples can produce p = 10⁻³⁰ for a SNP that explains 0.001% of trait variance — statistically significant but clinically meaningless. Effect size tells you <em>how big</em> the association is, independent of sample size.</p>
      </div>
      <div class="sg-effect-grid">
        ${[
          { name: 'Odds Ratio (OR)', color: '#00C4A0', formula: 'OR = (cases with allele / controls with allele)',
            range: 'OR=1 no effect; OR>1 risk; OR<1 protective', interp: 'OR=1.5: allele carriers are 50% more likely to develop disease (on the odds scale).',
            gwas: 'Most GWAS report OR. HBB rs334 (sickle cell) OR≈50 in homozygotes. Most common variants OR 1.05–1.30.',
            pitfall: 'OR overestimates relative risk when disease is common (>10%). Use RR or RD for common diseases.' },
          { name: 'Beta (β) Coefficient', color: '#58a6ff', formula: 'β = change in trait per effect allele',
            range: 'Continuous traits; measured in trait units', interp: 'For height: β=0.5 means each copy of the A allele adds 0.5 cm on average.',
            gwas: 'GWAS of quantitative traits (BMI, blood pressure) report β ± SE. AWI-Gen BMI GWAS: TMEM18 β=+0.7 kg/m² per allele.',
            pitfall: 'β depends on trait scale — standardise to SD units for cross-trait comparison (reported as β_std).' },
          { name: "Cohen's d", color: '#e3b341', formula: 'd = (μ₁ − μ₂) / pooled SD',
            range: 'Small d=0.2 | Medium d=0.5 | Large d=0.8', interp: 'd=0.5 means the means of the two groups are 0.5 SDs apart — a medium, biologically meaningful difference.',
            gwas: 'Used in differential expression: DESeq2 log₂FC is analogous. A gene with log₂FC=2 (d≈1.4) is strongly upregulated.',
            pitfall: 'Assumes equal variances. Use Glass\'s Δ if group SDs differ substantially.' },
          { name: 'R² / Heritability (h²)', color: '#bc8cff', formula: 'R² = variance explained by SNP',
            range: 'Ranges 0–1; most GWAS hits explain <1% of variance', interp: 'A SNP with R²=0.005 explains 0.5% of trait variance. Adding 1000 such SNPs together can explain 50%.',
            gwas: 'AWI-Gen GWAS SNPs each explain ~0.01–0.1% T2D variance. Total h²_SNP ≈ 25%. "Missing heritability" is the rest.',
            pitfall: 'R² underestimates heritability. LDSC (LD Score Regression) better estimates h²_SNP from GWAS summary stats.' },
          { name: 'Number Needed to Treat (NNT)', color: '#f97316', formula: 'NNT = 1 / Absolute Risk Reduction',
            range: 'Lower NNT = more effective intervention', interp: 'NNT=20 means treat 20 patients to prevent 1 adverse event. Relevant for pharmacogenomics decisions.',
            gwas: 'G6PD deficiency testing before primaquine: NNT≈8 in African populations to prevent one haemolytic episode.',
            pitfall: 'NNT changes with baseline risk — always specify the time horizon and population.' },
          { name: 'FST (Fixation Index)', color: '#ff6b6b', formula: 'FST = (HT − HS) / HT',
            range: '0 = identical frequencies; 1 = completely fixed', interp: 'FST=0.15 between West African and European populations means 15% of genetic variance is between rather than within populations.',
            gwas: 'Used to detect selection: high-FST SNPs may be under local adaptation (HBB, LCT, DARC). African populations show lower FST than non-African, consistent with Out-of-Africa bottleneck.',
            pitfall: 'FST sensitive to ascertainment bias and SNP density — use standardized metrics (PBS, XP-EHH) for selection scans.' },
        ].map(e=>`
          <div class="sg-effect-card" style="border-top:3px solid ${e.color}">
            <div class="sg-effect-name" style="color:${e.color}">${e.name}</div>
            <div class="sg-effect-formula">${e.formula}</div>
            <div class="sg-effect-range">${e.range}</div>
            <p class="sg-effect-interp">${e.interp}</p>
            <div class="sg-effect-example"><span class="sg-eg-label">African genomics</span>${e.gwas}</div>
            <div class="sg-effect-pitfall"><span class="sg-pit-label">Pitfall</span>${e.pitfall}</div>
          </div>`).join('')}
      </div>
    </div>`;
  }

  /* ════════ TAB: Bayesian ════════ */
  function _tabBayes() {
    return `
    <div class="sg-bayes-section">
      <div class="sg-concept-box" style="border-color:#f97316">
        <div class="sg-concept-title" style="color:#f97316">Bayes' Theorem in Genomics</div>
        <p class="sg-concept-body">P(hypothesis | data) ∝ P(data | hypothesis) × P(hypothesis). The posterior probability updates your prior belief with the observed likelihood. Critical for variant classification, polygenic risk scores, and phylogenetics.</p>
      </div>
      <div class="sg-bayes-layout">
        <div class="sg-bayes-demo">
          <div class="sg-sb-title">Interactive Prior → Posterior</div>
          <p style="font-size:0.78rem;color:#A8A098;margin-bottom:1rem">Scenario: What is the probability that a new variant is pathogenic, given it's observed in a patient with a rare disease? Adjust the prior and likelihood to see the posterior update.</p>
          <div class="sg-bayes-card">
            <div class="sg-calc-row">
              <label class="sg-calc-label">Prior probability of pathogenicity <span id="sg-prior-val">5%</span></label>
              <input type="range" min="1" max="50" step="1" value="5" class="sg-slider" id="sg-prior" oninput="OmicsLab.StatsGenomics.updateBayes()">
            </div>
            <div class="sg-calc-row">
              <label class="sg-calc-label">Likelihood ratio (variant seen more in cases) <span id="sg-lr-val">10×</span></label>
              <input type="range" min="1" max="100" step="1" value="10" class="sg-slider" id="sg-lr" oninput="OmicsLab.StatsGenomics.updateBayes()">
            </div>
            <div class="sg-bayes-result" id="sg-bayes-result"></div>
            <svg id="sg-bayes-svg" width="440" height="130" viewBox="0 0 440 130" style="max-width:100%;margin-top:0.75rem"></svg>
          </div>
        </div>
        <div class="sg-bayes-apps">
          <div class="sg-sb-title">Bayesian Methods in Genomics</div>
          ${[
            { name: 'ACMG Variant Classification', color: '#00C4A0',
              body: 'The ACMG/AMP 2015 framework is implicitly Bayesian: PVS1+PS1 evidence "updates" the prior probability that a variant is pathogenic. Tavtigian et al. 2020 made this explicit with a quantitative Bayesian framework (0.10 prior pathogenic probability).' },
            { name: 'Polygenic Risk Scores (Bayesian shrinkage)', color: '#58a6ff',
              body: 'LDpred2 and PRSice use Bayesian ridge regression to shrink SNP effect estimates toward zero based on LD and expected number of causal variants — critical for African populations where LD patterns differ from European training data.' },
            { name: 'BEAST Phylogenetics', color: '#bc8cff',
              body: 'BEAST2 uses MCMC sampling from the posterior distribution over phylogenetic trees. Used for SARS-CoV-2 phylogeography in Africa — reconstructed the introduction time and origin of Beta (B.1.351) and Omicron variants.' },
            { name: 'scRNA-seq Doublet Detection', color: '#e3b341',
              body: 'scrublet and DoubletFinder use Bayesian mixture models to estimate the probability that each cell is a doublet — two cells captured in one droplet — which is particularly important in African PBMC atlases with variable cell concentrations.' },
          ].map(a=>`
            <div class="sg-bayes-app" style="border-left:2px solid ${a.color}">
              <div class="sg-bayes-app-name" style="color:${a.color}">${a.name}</div>
              <p class="sg-bayes-app-body">${a.body}</p>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  function updateBayes() {
    const prior=parseInt(document.getElementById('sg-prior')?.value||5)/100;
    const lr=parseInt(document.getElementById('sg-lr')?.value||10);
    document.getElementById('sg-prior-val').textContent=`${(prior*100).toFixed(0)}%`;
    document.getElementById('sg-lr-val').textContent=`${lr}×`;
    /* posterior via odds */
    const priorOdds=prior/(1-prior);
    const postOdds=priorOdds*lr;
    const post=postOdds/(1+postOdds);
    const res=document.getElementById('sg-bayes-result');
    if(res){
      const col=post>0.9?'#00C4A0':post>0.5?'#e3b341':'#f85149';
      res.innerHTML=`<div class="sg-bayes-nums">
        <div class="sg-bayes-num-box"><div class="sg-bayes-n" style="color:#6E6860">${(prior*100).toFixed(1)}%</div><div class="sg-bayes-nl">Prior</div></div>
        <div class="sg-bayes-arrow">×LR ${lr}</div>
        <div class="sg-bayes-num-box"><div class="sg-bayes-n" style="color:${col}">${(post*100).toFixed(1)}%</div><div class="sg-bayes-nl">Posterior</div></div>
      </div>
      <div class="sg-bayes-acmg">ACMG classification threshold: posterior ≥ 90% → Likely Pathogenic, ≥ 99% → Pathogenic</div>`;
    }
    _drawBayesBar(prior, post);
  }

  function _drawBayesBar(prior, post) {
    const svg=document.getElementById('sg-bayes-svg'); if(!svg)return;
    const W=440,H=130;
    const col=post>0.9?'#00C4A0':post>0.5?'#e3b341':'#f85149';
    let html='';
    /* Prior bar */
    html+=`<text x="10" y="25" fill="#6E6860" font-size="11" font-weight="700">Prior</text>`;
    html+=`<rect x="80" y="10" width="${(W-90)*prior}" height="24" rx="4" fill="#6E6860" opacity="0.6"/>`;
    html+=`<rect x="80" y="10" width="${W-90}" height="24" rx="4" fill="none" stroke="#182236"/>`;
    html+=`<text x="${80+(W-90)*prior+6}" y="27" fill="#6E6860" font-size="11">${(prior*100).toFixed(1)}%</text>`;
    /* Posterior bar */
    html+=`<text x="10" y="75" fill="${col}" font-size="11" font-weight="700">Posterior</text>`;
    html+=`<rect x="80" y="60" width="${(W-90)*post}" height="24" rx="4" fill="${col}" opacity="0.8"/>`;
    html+=`<rect x="80" y="60" width="${W-90}" height="24" rx="4" fill="none" stroke="#182236"/>`;
    html+=`<text x="${80+(W-90)*post+6}" y="77" fill="${col}" font-size="11" font-weight="700">${(post*100).toFixed(1)}%</text>`;
    /* thresholds */
    const x90=80+(W-90)*0.9, x99=80+(W-90)*0.99;
    html+=`<line x1="${x90}" y1="55" x2="${x90}" y2="90" stroke="#00C4A0" stroke-width="1" stroke-dasharray="2,2"/>`;
    html+=`<text x="${x90}" y="100" text-anchor="middle" fill="#00C4A0" font-size="8">90% (Likely Path.)</text>`;
    html+=`<line x1="${x99}" y1="55" x2="${x99}" y2="90" stroke="#bc8cff" stroke-width="1" stroke-dasharray="2,2"/>`;
    html+=`<text x="${x99}" y="115" text-anchor="middle" fill="#bc8cff" font-size="8">99% (Pathogenic)</text>`;
    svg.innerHTML=html;
  }

  function _initBayes() { updateBayes(); }

  /* ════════ TAB: Pitfalls ════════ */
  function _tabPitfalls() {
    return `
    <div class="sg-pitfalls-section">
      <div class="sg-sb-title" style="margin-bottom:1rem">Critical Statistical Pitfalls in Genomics — and how to avoid them</div>
      <div class="sg-pitfalls-grid">
        ${[
          { name: "P-hacking / HARKing", severity: 'Critical', color: '#f85149',
            what: "Running multiple analyses until p < 0.05, then reporting only the significant result. HARKing (Hypothesising After Results are Known) presents post-hoc hypotheses as a priori.",
            consequence: "Non-reproducible findings. Many early candidate gene studies (pre-GWAS era) suffered from this — variants in APOE, ACE, TNF reported in dozens of conflicting studies.",
            fix: "Pre-register your analysis plan. Use GWAS-level thresholds. Replicate in an independent cohort (essential for African studies given historical under-powering)." },
          { name: "Population Stratification", severity: 'Critical', color: '#f85149',
            what: "Confounding by ancestry: if cases are more West African and controls more East African, any frequency difference between subpopulations will look like a disease association.",
            consequence: "Classic example: chopstick gene — an allele associated with Asian ancestry confounded early BMI GWAS before ancestry PCs were corrected for.",
            fix: "Include top 10–20 genotype PCs as covariates. For African GWAS, use AFRICA-specific PCA (not European PCs). Confirm with structured association tests (STRUCTURE, ADMIXTURE)." },
          { name: "Winner's Curse", severity: 'High', color: '#e3b341',
            what: "The estimated effect size of the lead SNP at discovery is inflated because we selected it precisely because it had the most extreme estimate in a noisy sample.",
            consequence: "GWAS hits with OR=1.5 at discovery often replicate at OR=1.15 — the true effect. Building PRS from uncorrected effect estimates produces overly optimistic risk predictions.",
            fix: "Use FUMA or PRS shrinkage (LDpred2) to correct for winner's curse. Always meta-analyze with replication cohorts before reporting final effect estimates." },
          { name: "Cryptic Relatedness", severity: 'High', color: '#e3b341',
            what: "Including related individuals (even 3rd cousins) inflates test statistics because their genotypes are correlated. Particularly relevant in founder populations and extended family studies.",
            consequence: "SNP associations can appear genome-wide significant just due to shared ancestry in a case cluster, not true disease association.",
            fix: "Compute pairwise IBD (PLINK --genome) and remove one member of each pair with PI_HAT > 0.125 (3rd degree). Use SAIGE or BOLT-LMM which model relatedness." },
          { name: "Batch Effects in RNA-seq", severity: 'High', color: '#e3b341',
            what: "Samples processed in different labs, on different dates, or on different lanes show systematic expression differences unrelated to biology. Can completely dominate a DEG analysis.",
            consequence: "Hundreds of 'differentially expressed' genes driven purely by when the RNA was extracted — completely masked by the biological signal of interest.",
            fix: "Use DESeq2's design formula to include batch as a covariate: ~batch + condition. For unknown batches, use SVA (surrogate variable analysis) or RUVseq." },
          { name: "Confounding in Observational Studies", severity: 'Moderate', color: '#58a6ff',
            what: "A third variable (confounder) causes both the exposure and outcome, creating a spurious association. Classic example: serum urate appears to cause cardiovascular disease, but is itself caused by renal function.",
            consequence: "Drug targets identified from observational genomics may fail in trials because the association was confounded. Particularly problematic in African cohorts with multiple overlapping disease burdens.",
            fix: "Use Mendelian Randomization (MR-Egger, IVW) to estimate causal effects — instrument on genetic variants as unconfounded proxies. TwoSampleMR R package." },
        ].map(p=>`
          <div class="sg-pitfall-card" style="border-left:3px solid ${p.color}">
            <div class="sg-pitfall-header">
              <span class="sg-pitfall-name">${p.name}</span>
              <span class="sg-pitfall-sev" style="color:${p.color}">${p.severity}</span>
            </div>
            <p class="sg-pitfall-what">${p.what}</p>
            <div class="sg-pitfall-consequence"><span class="sg-pc-label">Consequence</span>${p.consequence}</div>
            <div class="sg-pitfall-fix"><span class="sg-pf-label">Fix</span>${p.fix}</div>
          </div>`).join('')}
      </div>
    </div>`;
  }

  return { init, setTab, calcPower, updateBayes };
})();
