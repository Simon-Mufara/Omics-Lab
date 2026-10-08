/* ═════════════════════════════════════════════════════════════════
   OmicsLab — DNA Helix Visualization
   Vanilla Three.js implementation of B-DNA structure
   With transcription and translation animations
   ═════════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.DNAHelix = (function () {
  'use strict';

  // Configuration constants
  const CONFIG = {
    // DNA structural parameters (in Angstroms)
    BASE_PAIRS_PER_TURN: 10.5,
    RISE_PER_BP: 3.4, // Angstroms
    DIAMETER: 20, // Angstroms
    HELIX_RADIUS: 10, // Angstroms

    // Visual parameters
    BACKBONE_RADIUS: 0.8,
    BASE_RADIUS: 1.2,
    H_BOND_LENGTH: 0.3,

    // Transcription/Translation specific
    POLYMERASE_SIZE: 2.0,
    RIBOSOME_SIZE: 3.0,
    CODON_LENGTH: 3, // bases per codon
    AMINO_ACID_SPACING: 1.5,

    // Color palette (using the nucleotide colors from design system)
    COLORS: {
      A: 0x0072B2, // Blue
      T: 0xD55E00, // Vermilion
      G: 0x009E73, // Bluish green
      C: 0xCC79A7  // Reddish purple
    },

    // RNA colors (slightly different from DNA)
    RNA_COLORS: {
      A: 0x4A90E2, // Lighter blue
      U: 0xE67E22, // Orange (instead of T's vermilion)
      G: 0x7ED321, // Greenish
      C: 0xD74190  // Pinkish
    },

    // Amino acid colors (simplified - using distinctive colors)
    AMINO_ACID_COLORS: [
      0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xFFBE0B, 0xFB5607,
      0x8338EC, 0x3A86FF, 0x06D6A0, 0x118AB2, 0x073B4C,
      0xEF476F, 0xFF9F1C, 0x2EC4B6, 0xE71D36, 0x00B4D8,
      0x0077B6, 0x8AC926, 0xFF006E, 0x8338EC, 0xF72585
    ],

    // Element colors for alternative view
    ELEMENT_COLORS: {
      C: 0x6B8E23, // Carbon - olive/dark green
      O: 0xFF4500, // Orange - orange red
      N: 0x1E90FF, // Nitrogen - dodger blue
      P: 0xFF8C00  // Phosphorus - dark orange
    },

    // Quality settings
    QUALITY: {
      low: {
        backboneSegments: 8,
        baseSegments: 6,
        hbondSegments: 4,
        shadowQuality: 0.25
      },
      medium: {
        backboneSegments: 12,
        baseSegments: 8,
        hbondSegments: 6,
        shadowQuality: 0.5
      },
      high: {
        backboneSegments: 16,
        baseSegments: 12,
        hbondSegments: 8,
        shadowQuality: 1.0
      }
    }
  };

  // State
  let state = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    helixGroup: null,
    sequence: '',
    length: 0,
    quality: 'medium',
    autoRotate: true,
    showHBonds: true,
    colorMode: 'nucleotide', // or 'element'
    zoomToBaseIndex: null,
    tooltip: null,
    raycaster: null,
    mouse: new THREE.Vector2(),
    initialized: false,
    container: null,

    // Transcription/Translation state
    mode: 'off', // 'off', 'transcription', 'translation', 'both'
    animationState: 'paused', // 'paused', 'playing', 'stepping'
    currentStep: 0,
    animationProgress: 0, // 0-1 for current step
    polymerasePosition: 0, // base pair position (0-indexed)
    ribosomePosition: 0, // codon position (0-indexed)
    mRNAString: '', // being built during transcription
    aminoAcidChain: [], // being built during translation
    unwindProgress: 0, // 0-1, how much helix is unwound
    speed: 1, // animation speed multiplier
    showTranscription: true,
    showTranslation: true,

    // Timing
    lastAnimationTime: 0,
    stepDelay: 1000, // ms between steps in step mode
    basePairDelay: 200, // ms per base pair during transcription
    codonDelay: 500, // ms per codon during translation
  };

  // Three.js objects for instanced rendering
  let objects = {
    backboneMaterial: null,
    baseMaterial: null,
    hbondMaterial: null,
    backboneInstances: null,
    baseInstances: null,
    hbondInstances: null,

    // Transcription/Translation specific objects
    polymerase: null,
    mRNAstrand: null,
    ribosome: null,
    aminoAcidGroup: null,
    unwindHelper: null
  };

  /* ─── INITIALIZATION & LIFECYCLE ─────────────────────────────────────── */

  function init(containerEl, options = {}) {
    if (state.initialized) return;

    state.container = containerEl;
    state.sequence = options.sequence || '';
    state.length = state.sequence.length;
    state.quality = options.quality || 'medium';
    state.autoRotate = options.autoRotate !== undefined ? options.autoRotate : true;
    state.showHBonds = options.showHBonds !== undefined ? options.showHBonds : true;
    state.colorMode = options.colorMode || 'nucleotide';
    state.zoomToBaseIndex = options.zoomToBaseIndex || null;
    state.mode = options.mode || 'off';
    state.showTranscription = options.showTranscription !== undefined ? options.showTranscription : true;
    state.showTranslation = options.showTranslation !== undefined ? options.showTranslation : true;

    // Validate sequence
    if (!/^[ACGT]*$/i.test(state.sequence)) {
      console.error('Invalid DNA sequence. Only A, C, G, T allowed.');
      return false;
    }

    // Create Three.js scene
    _createScene();
    _createCamera();
    _createRenderer();
    _createLights();
    _createControls();
    _createHelix();
    _createTranscriptionTranslationElements();
    _createTooltip();
    _setupEventListeners();

    state.initialized = true;
    _animate();

    return true;
  }

  function dispose() {
    if (!state.initialized) return;

    cancelAnimationFrame(state.animationFrame);

    if (state.renderer) {
      state.renderer.dispose();
      state.renderer.forceContextLoss();
      state.renderer = null;
    }

    if (state.scene) {
      // Dispose geometries and materials
      state.scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      state.scene.clear();
      state.scene = null;
    }

    if (state.controls) {
      state.controls.dispose();
      state.controls = null;
    }

    // Remove event listeners
    window.removeEventListener('resize', _onWindowResize);
    state.container.removeEventListener('mousemove', _onMouseMove);
    state.container.removeEventListener('mouseleave', _onMouseLeave);
    state.container.removeEventListener('click', _onMouseClick);

    state.initialized = false;
    state.container.innerHTML = '';
  }

  /* ─── CORE THREE.JS SETUP ────────────────────────────────────────────── */

  function _createScene() {
    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0x060a14); // Match OmicsLab dark bg
    state.scene.fog = new THREE.FogExp2(0x060a14, 0.02); // Depth fog
  }

  function _createCamera() {
    const aspect = state.container.clientWidth / state.container.clientHeight;
    state.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    state.camera.position.set(0, 15, 40);
  }

  function _createRenderer() {
    state.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    state.renderer.setSize(state.container.clientWidth, state.container.clientHeight);
    state.renderer.setPixelRatio(window.devicePixelRatio);
    state.renderer.shadowMap.enabled = true;
    state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Post-processing would go here (but keeping it simple for now)
    state.container.appendChild(state.renderer.domElement);
  }

  function _createLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    state.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 40, 30);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    state.scene.add(directionalLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-10, 20, -10);
    state.scene.add(fillLight);
  }

  function _createControls() {
    state.controls = new THREE.OrbitControls(state.camera, state.renderer.domElement);
    state.controls.enableDamping = true;
    state.controls.dampingFactor = 0.05;
    state.controls.enableZoom = true;
    state.controls.enablePan = true;
    state.controls.minDistance = 10;
    state.controls.maxDistance = 100;
    state.controls.rotateSpeed = 0.5;
    state.controls.zoomSpeed = 0.8;
    state.controls.panSpeed = 0.4;
  }

  /* ─── DNA HELIX CREATION ────────────────────────────────────────────── */

  function _createHelix() {
    state.helixGroup = new THREE.Group();
    state.scene.add(state.helixGroup);

    _createMaterials();
    _createInstancedObjects();
    _buildHelixGeometry();
  }

  function _createMaterials() {
    // Backbone material (sugar-phosphate)
    objects.backboneMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B8B83, // Dark gray for backbone
      metalness: 0.1,
      roughness: 0.8,
      flatShading: false
    });

    // Base material
    objects.baseMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.0,
      roughness: 0.9,
      flatShading: false
    });

    // Hydrogen bond material (dashed appearance)
    objects.hbondMaterial = new THREE.LineDashedMaterial({
      color: 0xffffff,
      dashSize: 0.15,
      gapSize: 0.1,
      linewidth: 1
    });
  }

  function _createInstancedObjects() {
    const quality = CONFIG.QUALITY[state.quality];

    // Backbone cylinders (using InstancedMesh for performance)
    const backboneGeometry = new THREE.CylinderGeometry(
      CONFIG.BACKBONE_RADIUS,
      CONFIG.BACKBONE_RADIUS,
      CONFIG.RISE_PER_BP,
      quality.backboneSegments
    );
    objects.backboneInstances = new THREE.InstancedMesh(
      backboneGeometry,
      objects.backboneMaterial,
      state.length * 2 // Two backbones
    );
    objects.backboneInstances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    state.helixGroup.add(objects.backboneInstances);

    // Base pairs (boxes or custom shapes)
    const baseGeometry = new THREE.BoxGeometry(
      CONFIG.BASE_RADIUS * 2,
      CONFIG.BASE_RADIUS * 0.3,
      CONFIG.BASE_RADIUS * 1.5,
      quality.baseSegments,
      2,
      quality.baseSegments
    );
    objects.baseInstances = new THREE.InstancedMesh(
      baseGeometry,
      objects.baseMaterial,
      state.length
    );
    objects.baseInstances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    state.helixGroup.add(objects.baseInstances);

    // Hydrogen bonds (lines)
    if (state.showHBonds) {
      // We'll create these as separate Line objects for now (can optimize later)
      objects.hbondInstances = [];
    }
  }

  function _buildHelixGeometry() {
    if (state.length === 0) return;

    const quality = CONFIG.QUALITY[state.quality];
    const twistPerBP = (2 * Math.PI) / CONFIG.BASE_PAIRS_PER_TURN;
    const risePerBP = CONFIG.RISE_PER_BP;
    const radius = CONFIG.HELIX_RADIUS;

    // Temporary arrays for instance matrices
    const backboneMatrices = [];
    const baseMatrices = [];
    const hbondPositions = []; // For Line objects

    // Build each base pair
    for (let i = 0; i < state.length; i++) {
      const base = state.sequence[i].toUpperCase();
      const y = i * risePerBP;
      const angle = i * twistPerBP;

      // Calculate positions for the two strands
      const strand1Angle = angle;
      const strand2Angle = angle + Math.PI; // Opposite side

      const x1 = radius * Math.cos(strand1Angle);
      const z1 = radius * Math.sin(strand1Angle);
      const x2 = radius * Math.cos(strand2Angle);
      const z2 = radius * Math.sin(strand2Angle);

      // === BACKBONES (sugar-phosphate) ===
      // Strand 1 backbone
      const backbone1Matrix = new THREE.Matrix4();
      backbone1Matrix.makeTranslation(x1, y + risePerBP/2, z1);
      backbone1Matrix.rotateY(strand1Angle);
      backboneMatrices.push(backbone1Matrix);

      // Strand 2 backbone
      const backbone2Matrix = new THREE.Matrix4();
      backbone2Matrix.makeTranslation(x2, y + risePerBP/2, z2);
      backbone2Matrix.rotateY(strand2Angle);
      backboneMatrices.push(backbone2Matrix);

      // === BASES ===
      // Calculate base pair center and orientation
      const baseCenterX = (x1 + x2) / 2;
      const baseCenterY = y;
      const baseCenterZ = (z1 + z2) / 2;

      // The base pair should be perpendicular to the helix axis
      // and roughly facing outward/inward
      const baseMatrix = new THREE.Matrix4();
      baseMatrix.makeTranslation(baseCenterX, baseCenterY, baseCenterZ);
      baseMatrix.rotateY(angle);
      // Tilt bases slightly to match real DNA geometry
      baseMatrix.rotateX(-0.2); // Small tilt
      baseMatrices.push(baseMatrix);

      // === HYDROGEN BONDS ===
      if (state.showHBonds) {
        // Dashed line between bases
        const hbondGeometry = new THREE.BufferGeometry();
        const hbondVertices = new Float32Array([
          x1, y, z1,  // Base 1 position
          x2, y, z2   // Base 2 position
        ]);
        hbondGeometry.setAttribute('position', new THREE.BufferAttribute(hbondVertices, 3));
        hbondGeometry.computeBoundingSphere();

        const hbondLine = new THREE.Line(hbondGeometry, objects.hbondMaterial);
        hbondLine.computeLineDistances(); // Required for LineDashedMaterial
        state.helixGroup.add(hbondLine);
        objects.hbondInstances.push(hbondLine);
      }
    }

    // Apply instance matrices
    if (objects.backboneInstances) {
      backboneMatrices.forEach((matrix, index) => {
        objects.backboneInstances.setMatrixAt(index, matrix);
      });
      objects.backboneInstances.instanceMatrix.needsUpdate = true;
    }

    if (objects.baseInstances) {
      baseMatrices.forEach((matrix, index) => {
        objects.baseInstances.setMatrixAt(index, matrix);
      });
      objects.baseInstances.instanceMatrix.needsUpdate = true;
    }

    // Position helix group at origin
    state.helixGroup.position.y = -(state.length * risePerBP) / 2;
  }

  /* ─── TRANSCRIPTION/TRANSLATION ELEMENTS ─────────────────────────────── */

  function _createTranscriptionTranslationElements() {
    // Create RNA polymerase
    const polymeraseGeometry = new THREE.SphereGeometry(CONFIG.POLYMERASE_SIZE, 8, 8);
    const polymeraseMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFD700, // Gold
      metalness: 0.8,
      roughness: 0.2
    });
    objects.polymerase = new THREE.Mesh(polymeraseGeometry, polymeraseMaterial);
    objects.polymerase.visible = false;
    state.helixGroup.add(objects.polymerase);

    // Create mRNA strand (will be built dynamically)
    objects.mRNAStrand = new THREE.Group();
    objects.mRNAStrand.visible = false;
    state.helixGroup.add(objects.mRNAStrand);

    // Create ribosome
    const ribosomeGeometry = new THREE.BoxGeometry(
      CONFIG.RIBOSOME_SIZE,
      CONFIG.RIBOSOME_SIZE,
      CONFIG.RIBOSOME_SIZE
    );
    const ribosomeMaterial = new THREE.MeshStandardMaterial({
      color: 0xFF69B4, // Hot pink
      metalness: 0.5,
      roughness: 0.6
    });
    objects.ribosome = new THREE.Mesh(ribosomeGeometry, ribosomeMaterial);
    objects.ribosome.visible = false;
    state.helixGroup.add(objects.ribosome);

    // Create amino acid group
    objects.aminoAcidGroup = new THREE.Group();
    objects.aminoAcidGroup.visible = false;
    state.helixGroup.add(objects.aminoAcidGroup);

    // Create unwind helper (visualizes unwound region)
    const unwindGeometry = new THREE.CylinderGeometry(
      CONFIG.BACKBONE_RADIUS * 1.5,
      CONFIG.BACKBONE_RADIUS * 1.5,
      0.1, // Will be scaled based on unwind progress
      8
    );
    const unwindMaterial = new THREE.MeshStandardMaterial({
      color: 0x00FF00, // Green for unwound region
      transparent: true,
      opacity: 0.3
    });
    objects.unwindHelper = new THREE.Mesh(unwindGeometry, unwindMaterial);
    objects.unwindHelper.visible = false;
    state.helixGroup.add(objects.unwindHelper);
  }

  /* ─── TOOLTIP & INTERACTION ─────────────────────────────────────────── */

  function _createTooltip() {
    state.tooltip = document.createElement('div');
    state.tooltip.className = 'dna-tooltip';
    state.tooltip.style.position = 'absolute';
    state.tooltip.style.padding = '4px 8px';
    state.tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
    state.tooltip.style.color = '#fff';
    state.tooltip.style.borderRadius = '4px';
    state.tooltip.style.fontSize = '12px';
    state.tooltip.style.pointerEvents = 'none';
    state.tooltip.style.zIndex = '1000';
    state.tooltip.style.display = 'none';
    state.tooltip.style.fontFamily = '"JetBrains Mono", monospace';
    document.body.appendChild(state.tooltip);
  }

  function _updateTooltipPosition(event) {
    state.tooltip.style.left = `${event.pageX + 10}px`;
    state.tooltip.style.top = `${event.pageY + 10}px`;
  }

  function _showTooltip(content) {
    state.tooltip.innerHTML = content;
    state.tooltip.style.display = 'block';
  }

  function _hideTooltip() {
    state.tooltip.style.display = 'none';
  }

  /* ─── EVENT LISTENERS ───────────────────────────────────────────────── */

  function _setupEventListeners() {
    window.addEventListener('resize', _onWindowResize);
    state.container.addEventListener('mousemove', _onMouseMove);
    state.container.addEventListener('mouseleave', _onMouseLeave);
    state.container.addEventListener('click', _onMouseClick);

    // Initialize raycasters for interaction
    state.raycaster = new THREE.Raycaster();
    state.mouse = new THREE.Vector2();
  }

  function _onWindowResize() {
    const width = state.container.clientWidth;
    const height = state.container.clientHeight;

    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();

    state.renderer.setSize(width, height);
  }

  function _onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    const rect = state.container.getBoundingClientRect();
    state.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    state.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update tooltip position
    _updateTooltipPosition(event);

    // Raycast for base picking
    state.raycaster.setFromCamera(state.mouse, state.camera);

    // Check intersection with base instances
    if (objects.baseInstances) {
      const intersects = state.raycaster.intersectObject(objects.baseInstances, true);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        const instanceId = intersect.instanceId;

        if (instanceId !== undefined && instanceId < state.length) {
          const baseIndex = instanceId;
          const base = state.sequence[baseIndex].toUpperCase();
          const complement = getComplementBase(base);

          const tooltipContent = `
            <div><strong>Base:</strong> ${base}</div>
            <div><strong>Position:</strong> ${baseIndex + 1}</div>
            <div><strong>Pairs with:</strong> ${complement}</div>
            <div><strong>Bond type:</strong> ${base === 'A' || base === 'T' ? '2 H-bonds' : '3 H-bonds'}</div>
          `;

          _showTooltip(tooltipContent);
          return;
        }
      }
    }

    _hideTooltip();
  }

  function _onMouseLeave() {
    _hideTooltip();
  }

  function _onMouseClick(event) {
    // Calculate mouse position
    const rect = state.container.getBoundingClientRect();
    state.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    state.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast for clicking on a base
    state.raycaster.setFromCamera(state.mouse, state.camera);

    if (objects.baseInstances) {
      const intersects = state.raycaster.intersectObject(objects.baseInstances, true);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        const instanceId = intersect.instanceId;

        if (instanceId !== undefined && instanceId < state.length) {
          // Zoom to this base
          zoomToBase(instanceId);
        }
      }
    }
  }

  /* ─── TRANSCRIPTION/TRANSLATION LOGIC ────────────────────────────────── */

  function _updateTranscriptionTranslation(deltaTime) {
    if (state.mode === 'off' || state.animationState === 'paused') {
      return;
    }

    // Update animation timing
    state.lastAnimationTime += deltaTime * state.speed;

    if (state.animationState === 'stepping') {
      // In step mode, we only advance when manually triggered
      return;
    }

    // Handle transcription
    if (state.mode === 'transcription' || state.mode === 'both') {
      _updateTranscription(deltaTime);
    }

    // Handle translation
    if (state.mode === 'translation' || state.mode === 'both') {
      _updateTranslation(deltaTime);
    }
  }

  function _updateTranscription(deltaTime) {
    const basesPerSecond = 1000 / CONFIG.basePairDelay; // bases per second at speed 1
    const basesToAdvance = (deltaTime / 1000) * basesPerSecond * state.speed;

    // Update polymerase position
    const newPosition = state.polymerasePosition + basesToAdvance;

    // Check if we've reached the end
    if (newPosition >= state.length) {
      state.polymerasePosition = state.length;
      state.mRNAString = state.sequence.replace(/T/g, 'U'); // Complete mRNA
      _completeTranscription();
      return;
    }

    state.polymerasePosition = newPosition;

    // Update mRNA string (up to current position)
    const positionsToTranscribe = Math.floor(newPosition);
    if (positionsToTranscribe > state.mRNAString.length) {
      const newBase = state.sequence[positionsToTranscribe - 1];
      const rnaBase = newBase === 'T' ? 'U' : newBase;
      state.mRNAString += rnaBase;
    }

    // Update unwind progress (shows how much DNA is unwound)
    state.unwindProgress = Math.min(state.polymerasePosition / state.length, 1);

    // Update visual elements
    _updateTranscriptionVisuals();
  }

  function _updateTranslation(deltaTime) {
    // Translation only starts after transcription has produced enough mRNA for a codon
    const codonsAvailable = Math.floor(state.mRNAString.length / 3);

    if (codonsAvailable <= state.aminoAcidChain.length) {
      // Waiting for more mRNA to be transcribed
      return;
    }

    const codonsPerSecond = 1000 / CONFIG.codonDelay; // codons per second at speed 1
    const codonsToAdvance = (deltaTime / 1000) * codonsPerSecond * state.speed;

    // Update ribosome position (in codons)
    const newPosition = state.ribosomePosition + codonsToAdvance;

    // Check if we've processed all available codons
    if (newPosition >= codonsAvailable) {
      state.ribosomePosition = codonsAvailable;
      // Process remaining codon if we have a complete one
      const completeCodons = Math.floor(state.mRNAString.length / 3);
      if (state.aminoAcidChain.length < completeCodons) {
        _processNextCodon();
      }
      _completeTranslation();
      return;
    }

    state.ribosomePosition = newPosition;

    // Process complete codons as we go
    const completeCodons = Math.floor(state.mRNAString.length / 3);
    while (state.aminoAcidChain.length < completeCodons &&
           state.aminoAcidChain.length < state.ribosomePosition) {
      _processNextCodon();
    }

    // Update visual elements
    _updateTranslationVisuals();
  }

  function _processNextCodon() {
    const start = state.aminoAcidChain.length * 3;
    const codon = state.mRNAString.substring(start, start + 3);

    if (codon.length < 3) {
      return; // Incomplete codon
    }

    const aminoAcidIndex = _codonToAminoAcid(codon);
    state.aminoAcidChain.push(aminoAcidIndex);
  }

  function _codonToAminoAcid(codon) {
    // Simplified genetic code mapping (just for visualization)
    // In reality, this maps to specific amino acids, but we'll use indices for colors
    const codonMap = {
      'UUU': 0, 'UUC': 0, // Phenylalanine
      'UUA': 1, 'UUG': 1, 'CUU': 1, 'CUC': 1, 'CUA': 1, 'CUG': 1, // Leucine
      'UCU': 2, 'UCC': 2, 'UCA': 2, 'UCG': 2, // Serine
      'UAU': 3, 'UAC': 3, // Tyrosine
      'UGU': 4, 'UGC': 4, // Cysteine
      'UGG': 5, // Tryptophan
      'CCU': 6, 'CCC': 6, 'CCA': 6, 'CCG': 6, // Proline
      'CAU': 7, 'CAC': 7, // Histidine
      'CAA': 8, 'CAG': 8, // Glutamine
      'CGU': 9, 'CGC': 9, 'CGA': 9, 'CGG': 9, 'AGA': 9, 'AGG': 9, // Arginine
      'AUU': 10, 'AUC': 10, 'AUA': 10, // Isoleucine
      'AUG': 11, // Methionine (Start)
      'ACU': 12, 'ACC': 12, 'ACA': 12, 'ACG': 12, // Threonine
      'AAU': 13, 'AAC': 13, // Asparagine
      'AAA': 14, 'AAG': 14, // Lysine
      'GUU': 15, 'GUC': 15, 'GUA': 15, 'GUG': 15, // Valine
      'GCU': 16, 'GGC': 16, 'GCA': 16, 'GCG': 16, // Alanine
      'GAU': 17, 'GAC': 17, // Aspartic Acid
      'GAA': 18, 'GAG': 18, // Glutamic Acid
      'GGU': 19, 'GGC': 19, 'GGA': 19, 'GGG': 19, // Glycine
      'UAA': 20, 'UAG': 20, 'UGA': 20 // Stop codons
    };

    return codonMap[codon] || 0; // Default to first amino acid if unknown
  }

  function _updateTranscriptionVisuals() {
    if (!objects.polymerase) return;

    // Position polymerase based on current position
    if (state.polymerasePosition < state.length) {
      const risePerBP = CONFIG.RISE_PER_BP;
      const twistPerBP = (2 * Math.PI) / CONFIG.BASE_PAIRS_PER_TURN;
      const y = state.polymerasePosition * risePerBP - (state.length * risePerBP) / 2;
      const angle = state.polymerasePosition * twistPerBP;
      const radius = CONFIG.HELIX_RADIUS;

      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      objects.polymerase.position.set(x, y + risePerBP, z); // Slightly above the backbone
      objects.polymerase.rotation.y = angle;
      objects.polymerase.visible = state.showTranscription;
    } else {
      objects.polymerase.visible = false;
    }

    // Update mRNA strand visualization
    _updatemRNAVisuals();

    // Update unwind helper
    if (objects.unwindHelper) {
      const scaleY = Math.max(state.unwindProgress * state.length * CONFIG.RISE_PER_BP, 0.1);
      objects.unwindHelper.scale.set(1, scaleY, 1);
      objects.unwindHelper.position.y = - (state.length * CONFIG.RISE_PER_BP) / 2 + (scaleY / 2);
      objects.unwindHelper.visible = state.showTranscription && state.unwindProgress > 0;
    }
  }

  function _updatemRNAVisuals() {
    if (!objects.mRNAStrand) return;

    // Clear existing mRNA visualization
    while (objects.mRNAStrand.children.length > 0) {
      const child = objects.mRNAStrand.children[0];
      objects.mRNAStrand.remove(child);
    }

    if (state.mRNAString.length === 0) {
      objects.mRNAStrand.visible = false;
      return;
    }

    objects.mRNAStrand.visible = state.showTranscription;

    // Create a simple visualization of the mRNA strand
    // In a real implementation, this would be more detailed
    const baseGeometry = new THREE.SphereGeometry(0.5, 6, 6);

    for (let i = 0; i < state.mRNAString.length; i++) {
      const base = state.mRNAString[i];
      const color = CONFIG.RNA_COLORS[base] || 0xFFFFFF;

      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.1,
        roughness: 0.8
      });

      const sphere = new THREE.Mesh(baseGeometry, material);

      // mRNA strand positioning
      // Position mRNA slightly offset from DNA template strand
      const risePerBP = CONFIG.RISE_PER_BP;
      const twistPerBP = (2 * Math.PI) / CONFIG.BASE_PAIRS_PER_TURN;
      const y = i * risePerBP - (state.length * risePerBP) / 2;
      const angle = i * twistPerBP;
      const radius = CONFIG.HELIX_RADIUS + 1.5; // Offset from DNA

      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      sphere.position.set(x, y, z);
      objects.mRNAStrand.add(sphere);
    }
  }

  function _updateTranslationVisuals() {
    if (!objects.ribosome) return;

    // Position ribosome based on mRNA position
    if (state.ribosomePosition * 3 < state.mRNAString.length) {
      const codonIndex = state.ribosomePosition;
      const baseIndex = codonIndex * 3;

      if (baseIndex < state.mRNAString.length) {
        const risePerBP = CONFIG.RISE_PER_BP;
        const twistPerBP = (2 * Math.PI) / CONFIG.BASE_PAIRS_PER_TURN;
        const y = baseIndex * risePerBP - (state.length * risePerBP) / 2;
        const angle = baseIndex * twistPerBP;
        const radius = CONFIG.HELIX_RADIUS + 1.5; // Same offset as mRNA

        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);

        objects.ribosome.position.set(x, y + 2, z); // Above mRNA
        objects.ribosome.visible = state.showTranslation;
      } else {
        objects.ribosome.visible = false;
      }
    } else {
      objects.ribosome.visible = false;
    }

    // Update amino acid chain visualization
    _updateAminoAcidVisuals();
  }

  function _updateAminoAcidVisuals() {
    if (!objects.aminoAcidGroup) return;

    // Clear existing amino acid visualization
    while (objects.aminoAcidGroup.children.length > 0) {
      const child = objects.aminoAcidGroup.children[0];
      objects.aminoAcidGroup.remove(child);
    }

    if (state.aminoAcidChain.length === 0) {
      objects.aminoAcidGroup.visible = false;
      return;
    }

    objects.aminoAcidGroup.visible = state.showTranslation;

    // Create amino acid spheres
    const sphereGeometry = new THREE.SphereGeometry(0.7, 6, 6);

    for (let i = 0; i < state.aminoAcidChain.length; i++) {
      const aminoAcidIndex = state.aminoAcidChain[i];
      const colorIndex = aminoAcidIndex % CONFIG.AMINO_ACID_COLORS.length;
      const color = CONFIG.AMINO_ACID_COLORS[colorIndex];

      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.2,
        roughness: 0.7
      });

      const sphere = new THREE.Mesh(sphereGeometry, material);

      // Position amino acids in a chain
      const x = i * CONFIG.AMINO_ACID_SPACING;
      const y = 15; // Fixed height for visualization
      const z = 0;

      sphere.position.set(x, y, z);
      objects.aminoAcidGroup.add(sphere);
    }
  }

  function _completeTranscription() {
    state.animationState = 'completed';
    // Trigger completion event if needed
    console.log('Transcription complete:', state.mRNAString);
  }

  function _completeTranslation() {
    state.animationState = 'completed';
    // Trigger completion event if needed
    console.log('Translation complete:', state.aminoAcidChain.map(i => i).join('-'));
  }

  /* ─── PUBLIC API FOR TRANSCRIPTION/TRANSLATION ───────────────────────── */

  function play() {
    if (state.mode === 'off') return false;

    state.animationState = 'playing';
    state.lastAnimationTime = Date.now();
    return true;
  }

  function pause() {
    state.animationState = 'paused';
    return true;
  }

  function step() {
    if (state.mode === 'off') return false;

    state.animationState = 'stepping';
    // Process one step (one base pair for transcription, one codon for translation)
    const deltaTime = state.mode === 'translation' || state.mode === 'both'
      ? CONFIG.codonDelay
      : CONFIG.basePairDelay;
    _updateTranscriptionTranslation(deltaTime);
    state.animationState = 'paused';
    return true;
  }

  function reset() {
    // Reset all transcription/translation state
    state.mode = 'off';
    state.animationState = 'paused';
    state.currentStep = 0;
    state.animationProgress = 0;
    state.polymerasePosition = 0;
    state.ribosomePosition = 0;
    state.mRNAString = '';
    state.aminoAcidChain = [];
    state.unwindProgress = 0;
    state.lastAnimationTime = 0;

    // Hide visualization elements
    if (objects.polymerase) objects.polymerase.visible = false;
    if (objects.mRNAStrand) objects.mRNAStrand.visible = false;
    if (objects.ribosome) objects.ribosome.visible = false;
    if (objects.aminoAcidGroup) objects.aminoAcidGroup.visible = false;
    if (objects.unwindHelper) objects.unwindHelper.visible = false;

    return true;
  }

  function setMode(mode) {
    const validModes = ['off', 'transcription', 'translation', 'both'];
    if (!validModes.includes(mode)) {
      console.warn('Invalid mode. Must be: off, transcription, translation, or both');
      return false;
    }

    // If changing mode, reset first
    const wasPlaying = state.animationState === 'playing';
    reset();

    state.mode = mode;
    if (wasPlaying) {
      state.animationState = 'playing';
      state.lastAnimationTime = Date.now();
    }

    return true;
  }

  function setShowTranscription(show) {
    state.showTranscription = show;
    // Update visibility of transcription elements
    if (objects.polymerase) objects.polymerase.visible = show && state.mode !== 'off';
    if (objects.mRNAStrand) objects.mRNAStrand.visible = show && state.mode !== 'off';
    if (objects.unwindHelper) objects.unwindHelper.visible = show && state.mode !== 'off' && state.unwindProgress > 0;
    return true;
  }

  function setShowTranslation(show) {
    state.showTranslation = show;
    // Update visibility of translation elements
    if (objects.ribosome) objects.ribosome.visible = show && state.mode !== 'off';
    if (objects.aminoAcidGroup) objects.aminoAcidGroup.visible = show && state.mode !== 'off';
    return true;
  }

  function setSpeed(speed) {
    state.speed = Math.max(0.1, Math.min(5, speed)); // Clamp between 0.1x and 5x
    return true;
  }

  function getState() {
    return {
      mode: state.mode,
      animationState: state.animationState,
      progress: {
        transcription: state.polymerasePosition / Math.max(state.length, 1),
        translation: state.aminoAcidChain.length / Math.max(state.mRNAString.length / 3, 1)
      },
      sequences: {
        dna: state.sequence,
        mRNA: state.mRNAString,
        aminoAcids: state.aminoAcidChain.map(i => i).join('-')
      },
      speed: state.speed
    };
  }

  /* ─── EVENT LISTENERS (continued) ──────────────────────────────────── */

  function _setupEventListeners() {
    window.addEventListener('resize', _onWindowResize);
    state.container.addEventListener('mousemove', _onMouseMove);
    state.container.addEventListener('mouseleave', _onMouseLeave);
    state.container.addEventListener('click', _onMouseClick);

    // Initialize raycasters for interaction
    state.raycaster = new THREE.Raycaster();
    state.mouse = new THREE.Vector2();
  }

  /* ─── ANIMATION LOOP ───────────────────────────────────────────────── */

  function _animate() {
    state.animationFrame = requestAnimationFrame(_animate);

    // Calculate delta time
    const now = Date.now();
    const deltaTime = state.lastAnimationTime > 0 ? (now - state.lastAnimationTime) : 0;
    state.lastAnimationTime = now;

    // Update controls
    state.controls.update();

    // Auto-rotate
    if (state.autoRotate && !state.controls.enabled) {
      state.helixGroup.rotation.y += 0.001;
    }

    // Update TWEEN animations
    TWEEN.update();

    // Update transcription/translation logic
    _updateTranscriptionTranslation(deltaTime);

    // Update hydrogen bond dash offset
    if (objects.hbondInstances) {
      const time = Date.now() * 0.001;
      objects.hbondInstances.forEach(line => {
        line.material.dashOffset = -time;
      });
    }

    // Render
    state.renderer.render(state.scene, state.camera);
  }

  /* ─── RETURN PUBLIC API ─────────────────────────────────────────────── */

  return {
    init,
    dispose,
    setSequence,
    setQuality,
    toggleAutoRotate,
    toggleHBonds,
    setColorMode,
    zoomToBase,
    resetView,
    // Transcription/Translation API
    play,
    pause,
    step,
    reset,
    setMode,
    setShowTranscription,
    setShowTranslation,
    setSpeed,
    getState
  };
})();