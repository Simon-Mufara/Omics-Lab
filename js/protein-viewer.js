/* ═════════════════════════════════════════════════════════════════
   OmicsLab — Protein Structure Viewer
   Mol* integration for loading and visualizing PDB structures
   ═════════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.ProteinViewer = (function () {
  'use strict';

  // Configuration constants
  const CONFIG = {
    // Mol* specific
    MOL_STAR_URL: 'https://unpkg.com/molstar@latest/build/molstar.js',
    MOL_STAR_CSS_URL: 'https://unpkg.com/molstar@latest/build/molstar.css',

    // Default representations
    DEFAULT_REPRESENTATIONS: [
      { type: 'cartoon', params: { color: 'chainid' } },
      { type: 'surface', params: { color: 'chainid', opacity: 0.8 } }
    ],

    // Available representations for switcher
    REPRESENTATIONS: {
      cartoon: { label: 'Cartoon', type: 'cartoon' },
      surface: { label: 'Surface', type: 'surface' },
      'ball-and-stick': { label: 'Ball & Stick', type: 'ball+stick' },
      licorice: { label: 'Licorice', type: 'licorice' },
      'spacefill': { label: 'Spacefill', type: 'spacefill' }
    },

    // Color schemes
    COLOR_SCHEMES: {
      chainid: 'chainid',
      amino: 'amino',
      sstruc: 'sstruc',
      hetatm: 'hetatm',
      uniform: 'uniform'
    },

    // Quality settings for mobile/performance
    QUALITY: {
      low: { viewportWidth: 300, viewportHeight: 200, antialias: false },
      medium: { viewportWidth: 500, viewportHeight: 400, antialias: true },
      high: { viewportWidth: 800, viewportHeight: 600, antialias: true }
    }
  };

  // State
  let state = {
    container: null,
    viewer: null,
    molstarPlugin: null,
    structureData: null,
    pdbId: '',
    isInitialized: false,
    isLoading: false,
    quality: 'medium',
    currentRepresentation: 'cartoon',
    colorScheme: 'chainid',
    highlightedResidues: [],
    showLoading: true,
    supportsWebGL: false
  };

  /* ─── INITIALIZATION & LIFECYCLE ─────────────────────────────────────── */

  function init(containerEl, options = {}) {
    if (state.isInitialized) return false;

    state.container = containerEl;
    state.pdbId = options.pdbId || '';
    state.quality = options.quality || 'medium';
    state.currentRepresentation = options.representation || 'cartoon';
    state.colorScheme = options.colorScheme || 'chainid';
    state.highlightedResidues = options.highlightedResidues || [];

    // Check WebGL support
    state.supportsWebGL = _checkWebGLSupport();
    if (!state.supportsWebGL) {
      console.warn('WebGL not supported, falling back to 2D placeholder');
      _createFallbackUI();
      return true; // Still "initialized" but with fallback
    }

    // Create container structure
    _createContainerUI();

    // Load Mol* if needed
    if (state.pdbId) {
      _loadMolStarAndStructure();
    } else {
      _showLoadingState(true);
    }

    state.isInitialized = true;
    return true;
  }

  function dispose() {
    if (!state.isInitialized) return;

    // Clean up Mol* viewer
    if (state.viewer) {
      try {
        state.viewer.dispose();
      } catch (e) {
        console.error('Error disposing Mol* viewer:', e);
      }
      state.viewer = null;
    }

    if (state.molstarPlugin) {
      state.molstarPlugin = null;
    }

    // Remove event listeners and clean DOM
    state.container.innerHTML = '';
    state.isInitialized = false;
  }

  /* ─── CORE SETUP ────────────────────────────────────────────────────── */

  function _checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!window.WebGLRenderingContext &&
             (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  function _createContainerUI() {
    // Clear container
    state.container.innerHTML = '';

    // Create main viewer container
    const viewerContainer = document.createElement('div');
    viewerContainer.id = 'protein-viewer-container';
    viewerContainer.style.width = '100%';
    viewerContainer.style.height = '100%';
    viewerContainer.style.position = 'relative';
    state.container.appendChild(viewerContainer);

    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'protein-viewer-loading';
    loadingOverlay.style.position = 'absolute';
    loadingOverlay.style.top = '0';
    loadingOverlay.style.left = '0';
    loadingOverlay.style.width = '100%';
    loadingOverlay.style.height = '100%';
    loadingOverlay.style.backgroundColor = 'rgba(6, 10, 20, 0.8)';
    loadingOverlay.style.color = '#00C4A0';
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.flexDirection = 'column';
    loadingOverlay.style.alignItems = 'center';
    loadingOverlay.style.justifyContent = 'center';
    loadingOverlay.style.zIndex = '1000';
    loadingOverlay.innerHTML = `
      <div class="mol-spinner"></div>
      <div style="margin-top: 1rem; font-size: 1.1rem;">Loading structure...</div>
    `;
    viewerContainer.appendChild(loadingOverlay);
    state.loadingOverlay = loadingOverlay;

    // Create error overlay
    const errorOverlay = document.createElement('div');
    errorOverlay.id = 'protein-viewer-error';
    errorOverlay.style.position = 'absolute';
    errorOverlay.style.top = '0';
    errorOverlay.style.left = '0';
    errorOverlay.style.width = '100%';
    errorOverlay.style.height = '100%';
    errorOverlay.style.backgroundColor = 'rgba(6, 10, 20, 0.8)';
    errorOverlay.style.color = '#ff6b6b';
    errorOverlay.style.display = 'none';
    errorOverlay.style.flexDirection = 'column';
    errorOverlay.style.alignItems = 'center';
    errorOverlay.style.justifyContent = 'center';
    errorOverlay.style.zIndex = '1000';
    errorOverlay.innerHTML = `
      <div style="margin-bottom: 1rem;">⚠️</div>
      <div style="margin-bottom: 0.5rem; font-size: 1.2rem;">Error loading structure</div>
      <div id="protein-error-message" style="text-align: center; max-width: 80%;"></div>
      <button id="protein-retry-btn" style="margin-top: 1rem; padding: 0.5rem 1rem; background: rgba(0, 196, 160, 0.2); border: 1px solid rgba(0, 196, 160, 0.4); color: #e0e0e0; border-radius: 4px; cursor: pointer;">Retry</button>
    `;
    viewerContainer.appendChild(errorOverlay);
    state.errorOverlay = errorOverlay;
    state.errorMessageDiv = errorOverlay.querySelector('#protein-error-message');
    state.retryBtn = errorOverlay.querySelector('#protein-retry-btn');

    // Create controls container (will be populated later)
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'protein-viewer-controls';
    controlsContainer.style.position = 'absolute';
    controlsContainer.style.top = '1rem';
    controlsContainer.style.left = '1rem';
    controlsContainer.style.zIndex = '1000';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.gap = '0.5rem';
    controlsContainer.style.flexWrap = 'wrap';
    viewerContainer.appendChild(controlsContainer);
    state.controlsContainer = controlsContainer;

    // Create info container
    const infoContainer = document.createElement('div');
    infoContainer.id = 'protein-viewer-info';
    infoContainer.style.position = 'absolute';
    infoContainer.style.bottom = '1rem';
    infoContainer.style.left = '1rem';
    infoContainer.style.zIndex = '1000';
    infoContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    infoContainer.style.color = '#e0e0e0';
    infoContainer.style.padding = '0.5rem 1rem';
    infoContainer.style.borderRadius = '4px';
    infoContainer.style.fontSize = '0.875rem';
    viewerContainer.appendChild(infoContainer);
    state.infoContainer = infoContainer;
  }

  function _showLoadingState(show) {
    if (state.loadingOverlay) {
      state.loadingOverlay.style.display = show ? 'flex' : 'none';
    }
    if (state.errorOverlay) {
      state.errorOverlay.style.display = 'none';
    }
    state.isLoading = show;
  }

  function _showErrorState(message) {
    _showLoadingState(false);
    if (state.errorOverlay) {
      state.errorOverlay.style.display = 'flex';
    }
    if (state.errorMessageDiv) {
      state.errorMessageDiv.textContent = message;
    }
  }

  function _createFallbackUI() {
    state.container.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #888;">
        <h3>Protein Structure Viewer</h3>
        <p>WebGL is not supported in this browser.</p>
        <p>For full 3D visualization, please use a browser with WebGL support:</p>
        <ul style="text-align: left; display: inline-block;">
          <li>Chrome 29+</li>
          <li>Firefox 27+</li>
          <li>Safari 8+</li>
          <li>Edge 12+</li>
        </ul>
        <p style="margin-top: 1.5rem;">Enter a PDB ID above to see structure details.</p>
      </div>
    `;
  }

  /* ─── MOL* LOADING ──────────────────────────────────────────────────── */

  function _loadMolStarAndStructure() {
    _showLoadingState(true);

    // Load Mol* CSS first
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = CONFIG.MOL_STAR_CSS_URL;
    cssLink.onload = () => {
      // Then load Mol* JS
      const script = document.createElement('script');
      script.src = CONFIG.MOL_STAR_URL;
      script.onload = () => {
        // Initialize Mol* after script loads
        _initializeMolStar();
      };
      script.onerror = () => _showErrorState('Failed to load Mol* library');
      document.head.appendChild(script);
    };
    cssLink.onerror = () => _showErrorState('Failed to load Mol* stylesheet');
    document.head.appendChild(cssLink);
  }

  function _initializeMolStar() {
    try {
      // Create Mol* plugin
      state.molstarPlugin = new window.MolScriptPlugin.StatePlugin(
        state.container.querySelector('#protein-viewer-container'),
        {
          layout: {
            isExpanded: true,
            showHeader: false,
            showFooter: false,
            showLog: false
          }
        }
      );

      // Get the viewer
      state.viewer = state.molstarPlugin.viewer;

      // Load structure if PDB ID provided
      if (state.pdbId) {
        _loadStructure(state.pdbId);
      } else {
        _showLoadingState(false);
        _showInfoMessage('Enter a PDB ID to load a structure');
      }

    } catch (e) {
      console.error('Failed to initialize Mol*:', e);
      _showErrorState('Failed to initialize 3D viewer');
    }
  }

  function _loadStructure(pdbId) {
    if (!state.viewer) {
      _showErrorState('Viewer not initialized');
      return;
    }

    state.pdbId = pdbId.toUpperCase().trim();
    _showLoadingState(true);
    _showInfoMessage(`Loading ${state.pdbId}...`);

    try {
      // Load from RCSB PDB
      state.molstarPlugin.loadRemoteData(
        `https://files.rcsb.org/download/${state.pdbId}.pdb`,
        'pdb'
      ).then(() => {
        _applyInitialRepresentations();
        _setupEventListeners();
        _showLoadingState(false);
        _showStructureInfo();
      }).catch(error => {
        console.error('Failed to load structure:', error);
        _showErrorState(`Failed to load ${state.pdbId}. Please check the PDB ID and try again.`);
      });
    } catch (error) {
      console.error('Error loading structure:', error);
      _showErrorState(`Failed to load ${state.pdbId}`);
    }
  }

  function _applyInitialRepresentations() {
    if (!state.viewer) return;

    try {
      // Clear existing representations
      state.viewer.tools.representationManager.clear();

      // Apply default representations based on selection
      const rep = CONFIG.REPRESENTATIONS[state.currentRepresentation];
      if (rep) {
        state.viewer.tools.representationManager.addRepresentation(
          rep.type,
          {
            ...(rep.params || {}),
            color: state.colorScheme === 'uniform' ? '#00C4A0' : state.colorScheme
          }
        );
      }

      // Apply highlights if any
      if (state.highlightedResidues.length > 0) {
        _applyHighlightResidues(state.highlightedResidues);
      }

      // Zoom to fit
      state.viewer.camera.zoomTo(state.viewer.scene, true);

    } catch (e) {
      console.error('Error applying representations:', e);
    }
  }

  function _applyHighlightResidues(residueSpecs) {
    if (!state.viewer) return;

    try {
      // Clear previous highlights
      _clearHighlightResidues();

      // Parse residue specs (format: "CHAIN:RESNUM" or just "RESNUM" for all chains)
      const selections = residueSpecs.map(spec => {
        const [chain, resnum] = spec.split(':');
        if (chain && resnum) {
          return `:${chain} and ${resnum}`;
        } else if (resnum) {
          return `${resnum}`; // Will match any chain
        }
        return spec;
      }).filter(Boolean);

      if (selections.length > 0) {
        const selection = selections.join(' or ');
        state.viewer.tools.representationManager.addRepresentation(
          'ball+stick',
          {
            selection,
            color: '#ffd700', // Gold for highlights
            radius: 0.8
          }
        );

        state.highlightedResidues = residueSpecs;
      }
    } catch (e) {
      console.error('Error applying highlights:', e);
    }
  }

  function _clearHighlightResidues() {
    if (!state.viewer) return;

    try {
      // This is tricky with Mol* as we need to track what we added
      // For simplicity, we'll rebuild representations when clearing
      // In a production version, we'd track the representation IDs
      if (state.highlightedResidues.length > 0) {
        state.highlightedResidues = [];
        // Reapply current representation without highlights
        _applyInitialRepresentations();
      }
    } catch (e) {
      console.error('Error clearing highlights:', e);
    }
  }

  /* ─── UI & EVENTS ──────────────────────────────────────────────────── */

  function _setupEventListeners() {
    // Retry button
    if (state.retryBtn) {
      state.retryBtn.addEventListener('click', () => {
        if (state.pdbId) {
          _loadStructure(state.pdbId);
        }
      });
    }

    // Window resize
    window.addEventListener('resize', _onWindowResize);
  }

  function _onWindowResize() {
    if (state.viewer) {
      state.viewer.resize();
    }
  }

  function _showInfoMessage(message) {
    if (state.infoContainer) {
      state.infoContainer.textContent = message;
    }
  }

  function _showStructureInfo() {
    if (!state.infoContainer || !state.viewer) return;

    try {
      const data = state.viewer.structureData;
      if (data) {
        const info = [
          `PDB: ${state.pdbId}`,
          `Chains: ${data.models[0]?.chains?.length || 0}`,
          `Residues: ${data.models[0]?.polymerResidueCount || 0}`,
          `Atoms: ${data.atomCount || 0}`
        ].filter(Boolean).join(' • ');

        state.infoContainer.innerHTML = `<div>${info}</div>`;
      }
    } catch (e) {
      console.error('Error showing structure info:', e);
      state.infoContainer.textContent = `PDB: ${state.pdbId}`;
    }
  }

  /* ─── PUBLIC API ───────────────────────────────────────────────────── */

  function setPdbId(pdbId) {
    if (!/^[a-zA-Z0-9]{4}$/.test(pdbId)) {
      console.warn('Invalid PDB ID format. Should be 4 alphanumeric characters.');
      return false;
    }

    if (state.isInitialized && state.pdbId !== pdbId.toUpperCase()) {
      state.pdbId = pdbId.toUpperCase();
      if (state.viewer && state.supportsWebGL) {
        _loadStructure(pdbId);
      } else if (!state.supportsWebGL) {
        // In fallback mode, just update the ID displayed
        _showInfoMessage(`PDB ID: ${state.pdbId} (WebGL not available)`);
      }
    }
    return true;
  }

  function setRepresentation(type) {
    if (!CONFIG.REPRESENTATIONS[type]) {
      console.warn(`Unknown representation type: ${type}`);
      return false;
    }

    state.currentRepresentation = type;
    if (state.viewer && state.supportsWebGL) {
      _applyInitialRepresentations();
    }
    return true;
  }

  function setColorScheme(scheme) {
    if (!Object.values(CONFIG.COLOR_SCHEMES).includes(scheme) && scheme !== 'uniform') {
      console.warn(`Unknown color scheme: ${scheme}`);
      return false;
    }

    state.colorScheme = scheme;
    if (state.viewer && state.supportsWebGL) {
      _applyInitialRepresentations();
    }
    return true;
  }

  function setHighlightedResidues(residues) {
    if (!Array.isArray(residues)) {
      console.warn('Highlighted residues must be an array');
      return false;
    }

    state.highlightedResidues = residues;
    if (state.viewer && state.supportsWebGL) {
      _applyHighlightResidues(residues);
    }
    return true;
  }

  function setQuality(level) {
    if (!['low', 'medium', 'high'].includes(level)) {
      console.warn('Quality must be low, medium, or high');
      return false;
    }

    state.quality = level;
    // Quality affects initial sizing, but for simplicity we'll note it
    // In a full implementation, we'd recreate the viewer with new dimensions
    return true;
  }

  function resetView() {
    if (state.viewer && state.supportsWebGL) {
      state.viewer.camera.zoomTo(state.viewer.scene, true);
    }
    return true;
  }

  function getState() {
    return {
      pdbId: state.pdbId,
      isInitialized: state.isInitialized,
      isLoading: state.isLoading,
      supportsWebGL: state.supportsWebGL,
      representation: state.currentRepresentation,
      colorScheme: state.colorScheme,
      highlightedResidues: [...state.highlightedResidues],
      quality: state.quality
    };
  }

  /* ─── RETURN PUBLIC API ─────────────────────────────────────────────── */

  return {
    init,
    dispose,
    setPdbId,
    setRepresentation,
    setColorScheme,
    setHighlightedResidues,
    setQuality,
    resetView,
    getState
  };
})();