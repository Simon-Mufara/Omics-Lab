/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Collaborative Whiteboard (Prompt 18)
   ─ HTML5 canvas, pen/shapes/text/eraser tools
   ─ BroadcastChannel real-time sync (same-device tabs)
   ─ PNG export, 4 preloaded templates
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Whiteboard = (function () {

  const CHANNEL_NAME = 'omicslab_whiteboard';
  const STORE_KEY    = 'omicslab_whiteboard_v1';

  /* ─── State ─── */
  let _canvas    = null;
  let _ctx       = null;
  let _tool      = 'pen';
  let _color     = '#00C4A0';
  let _width     = 3;
  let _drawing   = false;
  let _startX    = 0;
  let _startY    = 0;
  let _snapshot  = null;   /* for shape preview */
  let _bc        = null;   /* BroadcastChannel */
  let _commands  = [];     /* all drawing commands */

  const TOOLS   = ['pen', 'line', 'rect', 'circle', 'arrow', 'text', 'eraser'];
  const COLORS  = ['#00C4A0','#58a6ff','#bc8cff','#f97316','#ff6b6b','#e3b341','#ffffff','#A8A098','#000000'];
  const WIDTHS  = [1, 3, 6, 12];

  const TEMPLATES = {
    blank:      { label: 'Blank',                 fn: null },
    grid:       { label: 'Experimental Design',   fn: _drawGridTemplate },
    tree:       { label: 'Phylogenetic Tree',      fn: _drawTreeTemplate },
    dna:        { label: 'DNA Double Helix',       fn: _drawDNATemplate },
  };

  /* ─── Render whiteboard panel into container ─── */
  function render(container) {
    _injectStyles();
    container.innerHTML = `
      <div class="wb-wrap">
        <!-- Toolbar -->
        <div class="wb-toolbar" role="toolbar" aria-label="Whiteboard tools">
          <div class="wb-tool-group">
            ${TOOLS.map(t => `
              <button class="wb-tool-btn${t===_tool?' active':''}" data-tool="${t}" title="${t}" type="button"
                onclick="OmicsLab.Whiteboard._setTool('${t}')">
                ${_toolIcon(t)}
              </button>`).join('')}
          </div>
          <div class="wb-tool-group">
            ${COLORS.map(c => `
              <button class="wb-color-btn${c===_color?' active':''}" data-color="${c}"
                style="background:${c};border-color:${c===_color?'var(--text-primary,#E4DDD2)':'transparent'}"
                title="${c}" type="button" onclick="OmicsLab.Whiteboard._setColor('${c}')"></button>`).join('')}
          </div>
          <div class="wb-tool-group">
            ${WIDTHS.map(w => `
              <button class="wb-width-btn${w===_width?' active':''}" data-width="${w}"
                title="Stroke ${w}px" type="button" onclick="OmicsLab.Whiteboard._setWidth(${w})">
                <span style="display:inline-block;width:${Math.min(w*2+8,24)}px;height:${w}px;background:currentColor;border-radius:1px"></span>
              </button>`).join('')}
          </div>
          <div class="wb-tool-group wb-template-group">
            <select class="select wb-template-select" onchange="OmicsLab.Whiteboard._applyTemplate(this.value)" aria-label="Load template">
              ${Object.entries(TEMPLATES).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('')}
            </select>
          </div>
          <div class="wb-tool-group wb-actions">
            <button class="btn btn-ghost btn-sm" type="button" onclick="OmicsLab.Whiteboard._undo()" title="Undo" aria-label="Undo">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7v6h6"/><path d="M3 13A9 9 0 1 0 5.7 4.7L3 7"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm" type="button" onclick="OmicsLab.Whiteboard._clearCanvas()" title="Clear" aria-label="Clear canvas">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
            <button class="btn btn-primary btn-sm" type="button" onclick="OmicsLab.Whiteboard._exportPNG()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              PNG
            </button>
          </div>
        </div>
        <!-- Canvas -->
        <div class="wb-canvas-wrap">
          <canvas id="wb-canvas" class="wb-canvas"></canvas>
          <div class="wb-bc-badge" id="wb-bc-badge" style="display:none">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 6s4-2 11-2 11 2 11 2"/><path d="M1 12s4-2 11-2 11 2 11 2"/><path d="M1 18s4-2 11-2 11 2 11 2"/></svg>
            Syncing
          </div>
        </div>
      </div>`;

    _canvas = container.querySelector('#wb-canvas');
    _ctx    = _canvas.getContext('2d');
    _resize();
    _bindEvents();
    _loadSaved();
    _initBC();

    window.addEventListener('resize', _resize);
  }

  /* ─── Canvas resize ─── */
  function _resize() {
    if (!_canvas) return;
    const wrap = _canvas.parentElement;
    const dpr  = window.devicePixelRatio || 1;
    const w    = wrap.clientWidth;
    const h    = Math.max(480, wrap.clientHeight - 4);
    _canvas.width  = w * dpr;
    _canvas.height = h * dpr;
    _canvas.style.width  = w + 'px';
    _canvas.style.height = h + 'px';
    _ctx.scale(dpr, dpr);
    _ctx.lineCap  = 'round';
    _ctx.lineJoin = 'round';
    _redraw();
  }

  /* ─── Mouse / touch events ─── */
  function _bindEvents() {
    if (!_canvas) return;
    const getPos = e => {
      const r = _canvas.getBoundingClientRect();
      const src = e.touches ? e.touches[0] : e;
      return { x: src.clientX - r.left, y: src.clientY - r.top };
    };

    const onDown = e => {
      e.preventDefault();
      _drawing = true;
      const { x, y } = getPos(e);
      _startX = x; _startY = y;

      if (_tool === 'text') {
        _addText(x, y);
        _drawing = false;
        return;
      }
      if (_tool === 'pen' || _tool === 'eraser') {
        _ctx.beginPath();
        _ctx.moveTo(x, y);
      }
      _snapshot = _ctx.getImageData(0, 0, _canvas.width, _canvas.height);
    };

    const onMove = e => {
      if (!_drawing) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      if (_tool === 'pen' || _tool === 'eraser') {
        _ctx.lineWidth  = _tool === 'eraser' ? _width * 4 : _width;
        _ctx.strokeStyle = _tool === 'eraser' ? '#0D1524' : _color;
        _ctx.lineTo(x, y);
        _ctx.stroke();
      } else {
        /* Restore snapshot then draw preview shape */
        if (_snapshot) _ctx.putImageData(_snapshot, 0, 0);
        _drawShape(_tool, _startX, _startY, x, y, false);
      }
    };

    const onUp = e => {
      if (!_drawing) return;
      _drawing = false;
      const { x, y } = e.changedTouches ? { x: e.changedTouches[0].clientX - _canvas.getBoundingClientRect().left, y: e.changedTouches[0].clientY - _canvas.getBoundingClientRect().top } : getPos(e);
      if (_tool !== 'pen' && _tool !== 'eraser') {
        if (_snapshot) _ctx.putImageData(_snapshot, 0, 0);
        _drawShape(_tool, _startX, _startY, x, y, true);
      }
      const cmd = { tool:_tool, color:_color, width:_width, x0:_startX, y0:_startY, x1:x, y1:y };
      _commands.push(cmd);
      _saveCmds();
      _broadcastCmd(cmd);
      _snapshot = null;
    };

    _canvas.addEventListener('mousedown', onDown);
    _canvas.addEventListener('mousemove', onMove);
    _canvas.addEventListener('mouseup',   onUp);
    _canvas.addEventListener('touchstart', onDown, { passive: false });
    _canvas.addEventListener('touchmove',  onMove, { passive: false });
    _canvas.addEventListener('touchend',   onUp);
    _canvas.addEventListener('mouseleave', () => { if (_drawing) onUp({ clientX: 0, clientY: 0 }); });
  }

  function _drawShape(tool, x0, y0, x1, y1, commit) {
    _ctx.beginPath();
    _ctx.strokeStyle = _color;
    _ctx.lineWidth   = _width;
    if (tool === 'line') {
      _ctx.moveTo(x0, y0); _ctx.lineTo(x1, y1);
      _ctx.stroke();
    } else if (tool === 'rect') {
      _ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    } else if (tool === 'circle') {
      const rx = Math.abs(x1 - x0) / 2;
      const ry = Math.abs(y1 - y0) / 2;
      _ctx.ellipse(x0 + (x1 - x0) / 2, y0 + (y1 - y0) / 2, rx, ry, 0, 0, Math.PI * 2);
      _ctx.stroke();
    } else if (tool === 'arrow') {
      _ctx.moveTo(x0, y0); _ctx.lineTo(x1, y1); _ctx.stroke();
      const angle = Math.atan2(y1 - y0, x1 - x0);
      const head  = 12;
      _ctx.beginPath();
      _ctx.moveTo(x1, y1);
      _ctx.lineTo(x1 - head * Math.cos(angle - 0.45), y1 - head * Math.sin(angle - 0.45));
      _ctx.lineTo(x1 - head * Math.cos(angle + 0.45), y1 - head * Math.sin(angle + 0.45));
      _ctx.closePath(); _ctx.fillStyle = _color; _ctx.fill();
    }
  }

  function _addText(x, y) {
    const text = prompt('Enter text:');
    if (!text) return;
    _ctx.font = `${14 + _width * 2}px Inter,sans-serif`;
    _ctx.fillStyle = _color;
    _ctx.fillText(text, x, y);
    const cmd = { tool:'text', color:_color, width:_width, x0:x, y0:y, text };
    _commands.push(cmd);
    _saveCmds(); _broadcastCmd(cmd);
  }

  /* ─── Redraw from commands ─── */
  function _redraw() {
    if (!_ctx || !_canvas) return;
    const dpr = window.devicePixelRatio || 1;
    _ctx.clearRect(0, 0, _canvas.width / dpr, _canvas.height / dpr);
    _ctx.lineCap = 'round'; _ctx.lineJoin = 'round';
    _commands.forEach(cmd => {
      _ctx.strokeStyle = cmd.color; _ctx.lineWidth = cmd.width; _ctx.fillStyle = cmd.color;
      if (cmd.tool === 'pen' || cmd.tool === 'eraser') {
        /* Pen commands stored as points arrays */
        if (cmd.pts?.length) {
          _ctx.beginPath();
          _ctx.strokeStyle = cmd.tool === 'eraser' ? '#0D1524' : cmd.color;
          _ctx.lineWidth   = cmd.tool === 'eraser' ? cmd.width * 4 : cmd.width;
          _ctx.moveTo(cmd.pts[0].x, cmd.pts[0].y);
          cmd.pts.forEach(p => _ctx.lineTo(p.x, p.y));
          _ctx.stroke();
        }
      } else if (cmd.tool === 'text') {
        _ctx.font = `${14 + cmd.width * 2}px Inter,sans-serif`;
        _ctx.fillText(cmd.text, cmd.x0, cmd.y0);
      } else {
        _drawShape(cmd.tool, cmd.x0, cmd.y0, cmd.x1, cmd.y1, true);
      }
    });
  }

  /* ─── Tool / color / width setters ─── */
  function _setTool(t)  { _tool  = t; _updateToolbar(); }
  function _setColor(c) { _color = c; _updateToolbar(); }
  function _setWidth(w) { _width = w; _updateToolbar(); }

  function _updateToolbar() {
    document.querySelectorAll('.wb-tool-btn').forEach(b => b.classList.toggle('active', b.dataset.tool === _tool));
    document.querySelectorAll('.wb-color-btn').forEach(b => {
      const active = b.dataset.color === _color;
      b.classList.toggle('active', active);
      b.style.borderColor = active ? 'var(--text-primary,#E4DDD2)' : 'transparent';
    });
    document.querySelectorAll('.wb-width-btn').forEach(b => b.classList.toggle('active', +b.dataset.width === _width));
  }

  /* ─── Undo ─── */
  function _undo() {
    if (_commands.length) { _commands.pop(); _saveCmds(); _redraw(); }
  }

  /* ─── Clear ─── */
  function _clearCanvas() {
    if (!confirm('Clear the whiteboard?')) return;
    _commands = [];
    _saveCmds();
    const dpr = window.devicePixelRatio || 1;
    if (_ctx && _canvas) _ctx.clearRect(0, 0, _canvas.width / dpr, _canvas.height / dpr);
    _broadcastCmd({ tool: 'clear' });
  }

  /* ─── PNG export ─── */
  function _exportPNG() {
    if (!_canvas) return;
    const a = document.createElement('a');
    a.download = 'omicslab-whiteboard.png';
    a.href = _canvas.toDataURL('image/png');
    a.click();
    OmicsLab.Notify?.success('Whiteboard exported as PNG');
  }

  /* ─── Templates ─── */
  function _applyTemplate(key) {
    const tmpl = TEMPLATES[key];
    if (!tmpl || !tmpl.fn) return;
    _commands = [];
    const dpr = window.devicePixelRatio || 1;
    if (_ctx && _canvas) _ctx.clearRect(0, 0, _canvas.width / dpr, _canvas.height / dpr);
    tmpl.fn();
  }

  function _drawGridTemplate() {
    if (!_ctx || !_canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = _canvas.width / dpr; const h = _canvas.height / dpr;
    _ctx.strokeStyle = '#243048'; _ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 40) { _ctx.beginPath(); _ctx.moveTo(x,0); _ctx.lineTo(x,h); _ctx.stroke(); }
    for (let y = 40; y < h; y += 40) { _ctx.beginPath(); _ctx.moveTo(0,y); _ctx.lineTo(w,y); _ctx.stroke(); }
    _ctx.font = '13px Inter,sans-serif'; _ctx.fillStyle = '#354060';
    ['Condition A','Condition B','Replicate 1','Replicate 2','Replicate 3'].forEach((l,i) => {
      _ctx.fillText(l, 8, 40 + i * 40 + 14);
    });
  }

  function _drawTreeTemplate() {
    if (!_ctx) return;
    _ctx.strokeStyle = '#00C4A0'; _ctx.lineWidth = 2;
    const pts = [[200,280],[200,160],[200,160],[120,100],[120,100],[80,60],[120,100],[160,60],
                 [200,160],[280,100],[280,100],[240,60],[280,100],[320,60]];
    for (let i = 0; i < pts.length; i += 2) {
      _ctx.beginPath(); _ctx.moveTo(pts[i][0], pts[i][1]); _ctx.lineTo(pts[i+1][0], pts[i+1][1]); _ctx.stroke();
    }
    _ctx.font = '11px JetBrains Mono,monospace'; _ctx.fillStyle = '#58a6ff';
    [['Plasmodium falciparum',80,52],['P. vivax',160,52],['P. malariae',240,52],['P. ovale',320,52]].forEach(([l,x,y]) => {
      _ctx.save(); _ctx.translate(x,y); _ctx.rotate(-0.4); _ctx.fillText(l, 0, 0); _ctx.restore();
    });
  }

  function _drawDNATemplate() {
    if (!_ctx || !_canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = _canvas.width / dpr;
    const cx = w / 2; const amp = 60; const freq = 0.03;
    _ctx.strokeStyle = '#58a6ff'; _ctx.lineWidth = 2;
    _ctx.beginPath();
    for (let y = 20; y < 460; y += 2) { _ctx.lineTo(cx + amp * Math.sin(freq * y), y); }
    _ctx.stroke();
    _ctx.strokeStyle = '#00C4A0'; _ctx.beginPath();
    for (let y = 20; y < 460; y += 2) { _ctx.lineTo(cx - amp * Math.sin(freq * y), y); }
    _ctx.stroke();
    /* Base pair rungs */
    _ctx.strokeStyle = '#354060'; _ctx.lineWidth = 1;
    for (let y = 20; y < 460; y += 18) {
      const x1 = cx + amp * Math.sin(freq * y);
      const x2 = cx - amp * Math.sin(freq * y);
      _ctx.beginPath(); _ctx.moveTo(x1, y); _ctx.lineTo(x2, y); _ctx.stroke();
    }
  }

  /* ─── BroadcastChannel sync ─── */
  function _initBC() {
    if (!window.BroadcastChannel) return;
    try {
      _bc = new BroadcastChannel(CHANNEL_NAME);
      _bc.onmessage = e => {
        const cmd = e.data;
        if (!cmd) return;
        if (cmd.tool === 'clear') { _commands = []; _redraw(); return; }
        _commands.push(cmd);
        _redraw();
        /* Flash sync badge */
        const badge = document.getElementById('wb-bc-badge');
        if (badge) { badge.style.display = 'flex'; clearTimeout(badge._t); badge._t = setTimeout(() => { badge.style.display = 'none'; }, 1000); }
      };
    } catch {}
  }

  function _broadcastCmd(cmd) {
    try { _bc?.postMessage(cmd); } catch {}
  }

  /* ─── Persistence ─── */
  function _saveCmds() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(_commands.slice(-200))); } catch {}
  }

  function _loadSaved() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      _commands = saved;
      _redraw();
    } catch {}
  }

  function _injectStyles() {
    if (document.getElementById('wb-styles')) return;
    const s = document.createElement('style');
    s.id = 'wb-styles';
    s.textContent = `
      .wb-wrap{display:flex;flex-direction:column;height:100%;background:var(--bg-canvas,#0D1524)}
      .wb-toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:.35rem;padding:.5rem .65rem;border-bottom:1px solid var(--border-default,#182236);background:var(--bg-surface,#111B2E)}
      .wb-tool-group{display:flex;align-items:center;gap:.25rem}
      .wb-tool-group+.wb-tool-group::before{content:'';width:1px;height:20px;background:var(--border-default,#182236);margin:0 .2rem}
      .wb-tool-btn{display:flex;align-items:center;justify-content:center;width:30px;height:30px;background:none;border:1px solid transparent;border-radius:5px;cursor:pointer;color:var(--text-muted,#A8A098);transition:background .1s,color .1s,border-color .1s}
      .wb-tool-btn:hover,.wb-tool-btn.active{background:var(--bg-overlay,#182236);border-color:var(--border-muted,#243048);color:var(--text-primary,#E4DDD2)}
      .wb-tool-btn.active{border-color:var(--green,#00C4A0);color:var(--green,#00C4A0)}
      .wb-color-btn{width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:border-color .1s,transform .1s}
      .wb-color-btn:hover{transform:scale(1.15)}
      .wb-width-btn{display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:none;border:1px solid transparent;border-radius:4px;cursor:pointer;color:var(--text-muted,#A8A098)}
      .wb-width-btn:hover,.wb-width-btn.active{background:var(--bg-overlay,#182236);border-color:var(--border-muted,#243048);color:var(--text-primary,#E4DDD2)}
      .wb-template-select{font-size:.72rem;padding:.2rem .4rem;max-width:160px}
      .wb-actions{margin-left:auto}
      .wb-canvas-wrap{flex:1;position:relative;overflow:hidden}
      .wb-canvas{display:block;cursor:crosshair;touch-action:none;background:#0D1524}
      .wb-bc-badge{position:absolute;top:.5rem;right:.5rem;display:flex;align-items:center;gap:.3rem;background:rgba(0,196,160,.15);border:1px solid rgba(0,196,160,.3);border-radius:99px;padding:.15rem .5rem;font-size:.65rem;font-weight:700;color:var(--green,#00C4A0)}
    `;
    document.head.appendChild(s);
  }

  /* ─── Init — inject panel into Teams section ─── */
  function init() {
    const section = document.getElementById('teams-section');
    if (!section) return;

    /* Add whiteboard toggle button to Teams UI once it renders */
    setTimeout(() => {
      const teamsContent = section.querySelector('[class*="teams-"]') || section;
      if (!document.getElementById('wb-panel-wrap')) {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'btn btn-ghost btn-sm wb-toggle';
        toggle.id = 'wb-toggle-btn';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'wb-panel-wrap');
        toggle.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01"/></svg> Whiteboard`;
        toggle.onclick = () => {
          const panel = document.getElementById('wb-panel-wrap');
          if (!panel) {
            const wrap = document.createElement('div');
            wrap.id = 'wb-panel-wrap';
            wrap.style.cssText = 'height:540px;border-top:1px solid var(--border-default,#182236);margin-top:.5rem';
            section.appendChild(wrap);
            render(wrap);
            toggle.setAttribute('aria-expanded', 'true');
          } else {
            const visible = panel.style.display !== 'none';
            panel.style.display = visible ? 'none' : '';
            toggle.setAttribute('aria-expanded', (!visible).toString());
          }
        };

        /* Try to find a good insertion point */
        const controls = section.querySelector('[class*="controls"], [class*="toolbar"], [class*="header"]');
        if (controls) controls.appendChild(toggle);
        else section.prepend(toggle);
      }
    }, 400);
  }

  return { init, render, _setTool, _setColor, _setWidth, _undo, _clearCanvas, _exportPNG, _applyTemplate };
})();
