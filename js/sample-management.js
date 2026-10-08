/* ═════════════════════════════════════════════════════════════════
   OmicsLab — Sample Management System (Bioinformatics Enhanced)
   Includes: sample object model, barcodes, handheld scanner, tablet UI,
   chain-of-custody logging, and room-specific procedures for intake and collection.
   ENHANCED FOR BIOINFORMATICS: Metadata tracking, data format awareness,
   and educational bioinformatics concepts.
   ══════════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.SampleManagement = (function () {
  'use strict';

  // Configuration
  const CONFIG = {
    // Sample types and their properties (for order of draw in phlebotomy)
    SAMPLE_TYPES: [
      { id: 'blood_culture', color: 0xff0000, label: 'Blood Culture', drawOrder: 1, dataType: 'microbiology' },
      { id: 'coagulation', color: 0x0000ff, label: 'Coagulation (Light Blue)', drawOrder: 2, dataType: 'chemistry' },
      { id: 'serum', color: 0xff00ff, label: 'Serum (Red/Gray)', drawOrder: 3, dataType: 'chemistry' },
      { id: 'heparin', color: 0x00ffff, label: 'Heparin (Green)', drawOrder: 4, dataType: 'plasma' },
      { id: 'eda', color: 0x00ff00, label: 'EDTA (Lavender)', drawOrder: 5, dataType: 'whole_blood' },
      { id: 'glycolytic', color: 0xffff00, label: 'Glycolytic Inhibitor (Gray)', drawOrder: 6, dataType: 'metabolomics' }
    ],
    // Common bioinformatics data types and extensions
    DATA_TYPES: {
      'genomics': { extensions: ['.fastq', '.fq', '.bam', '.sam', '.vcf'], icon: '🧬' },
      'transcriptomics': { extensions: ['.fastq', '.fq', '.bam'], icon: '🧪' },
      'proteomics': { extensions: ['.raw', '.mzML'], icon: '⚗️' },
      'microbiology': { extensions: ['.fastq', '.fq'], icon: '🦠' },
      'chemistry': { extensions: ['.csv', '.tsv'], icon: '📊' },
      'metabolomics': { extensions: ['.csv', '.tsv', '.mzML'], icon: '⚗️' }
    },
    // Barcode settings
    BARCODE: {
      width: 2, // units
      height: 0.5,
      depth: 0.1
    },
    // Sample tube dimensions
    TUBE: {
      radius: 0.3,
      height: 1.0,
      capHeight: 0.2
    },
    // Scanner and tablet (sizes will be initialized in init)
    SCANNER: { size: null },
    TABLET: { size: null }
  };

  // State
  let state = {
    scene: null,
    camera: null,
    renderer: null,
    // Sample objects in the scene
    samples: [], // array of { sample: SampleObject, mesh: THREE.Group, barcodeMesh: THREE.Mesh }
    // Current sample being handled (in phlebotomy)
    currentSample: null,
    // Chain of custody log
    chainOfCustody: [],
    // Interaction state
    isScanning: false,
    scanStartTime: 0,
    // Raycaster for mouse interaction
    raycaster: null,
    mouse: null,
    // Initialized flag
    initialized: false,
    // Container DOM element
    container: null
  };

  /* ─── INITIALIZATION & LIFECYCLE ─────────────────────────────────────── */

  function init(containerEl, options = {}) {
    if (state.initialized) return false;

    // Check for Three.js
    if (typeof THREE === 'undefined') {
      console.error('Three.js not loaded. Please include three.js before initializing SampleManagement.');
      return false;
    }

    state.container = containerEl;
    state.scene = options.scene;
    state.camera = options.camera;
    state.renderer = options.renderer;

    // Initialize scanner and tablet sizes
    CONFIG.SCANNER.size = new THREE.Vector3(0.2, 0.2, 0.5);
    CONFIG.TABLET.size = new THREE.Vector3(0.3, 0.2, 0.1);

    // Initialize raycaster and mouse for interaction
    state.raycaster = new THREE.Raycaster();
    state.mouse = new THREE.Vector2();

    // Initialize sample objects for the rooms
    _initializeReceptionSamples();
    _initializePhlebotomySamples();

    // Create scanner and tablet in phlebotomy room
    _createScannerAndTablet();

    // Setup interaction listeners for sample-specific actions
    _setupSampleInteractionListeners();

    // Initialize chain of custody log UI
    _initChainOfCustodyUI();

    state.initialized = true;

    return true;
  }

  function dispose() {
    if (!state.initialized) return;

    // Dispose sample meshes
    state.samples.forEach(sampleData => {
      if (sampleData.mesh) sampleData.mesh.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      if (sampleData.barcodeMesh) {
        if (sampleData.barcodeMesh.geometry) sampleData.barcodeMesh.geometry.dispose();
        if (sampleData.barcodeMesh.material) sampleData.barcodeMesh.material.dispose();
      }
    });

    // Remove event listeners
    state.container.removeEventListener('mousedown', _onMouseDown);
    state.container.removeEventListener('mouseup', _onMouseUp);
    state.container.removeEventListener('mousemove', _onMouseMove);
    state.container.removeEventListener('wheel', _onMouseWheel);

    state.initialized = false;
  }

  /* ─── SAMPLE OBJECT MODEL ────────────────────────────────────────────── */

  // Sample class representing a biological sample
  function Sample(id, type, barcode) {
    this.id = id; // unique sample identifier
    this.type = type; // e.g., 'blood_culture', 'serum', etc.
    this.barcode = barcode; // string barcode
    this.collectionTime = null; // timestamp when collected
    this.status = 'collected'; // can be 'collected', 'processed', 'stored', etc.
    this.chainOfCustody = []; // array of events for this sample
    // BIOINFORMATICS ENHANCEMENT: Analysis metadata
    this.metadata = {
      instrument: null,      // e.g., 'Illumina NovaSeq 6000'
      libraryPrep: null,     // e.g., 'TruSeq DNA PCR-Free'
      dataType: null,        // inferred from sample type or assigned
      fileNames: [],         // expected file names if processed
      analysisPipeline: null,// e.g., 'bwa_mem2 + gatk4'
      referenceGenome: null, // e.g., 'GRCh38.p13'
      qcMetrics: {}          // store QC metrics like yield, purity
    };
  }

  // Add an event to the sample's chain of custody
  Sample.prototype.addCustodyEvent = function(eventDescription, userId) {
    const event = {
      timestamp: new Date().toISOString(),
      description: eventDescription,
      userId: userId || 'unknown'
    };
    this.chainOfCustody.push(event);
    // Also add to global chain of custody log
    state.chainOfCustody.push({
      sampleId: this.id,
      ...event
    });
    _updateChainOfCustodyUI();
  };

  // Generate a random barcode (simplified)
  function generateBarcode() {
    // Generate a random alphanumeric string of length 10
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let barcode = '';
    for (let i = 0; i < 10; i++) {
      barcode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return barcode;
  }

  // Infer data type from sample type
  function inferDataTypeFromSampleType(sampleType) {
    const typeInfo = CONFIG.SAMPLE_TYPES.find(t => t.id === sampleType);
    return typeInfo ? typeInfo.dataType : null;
  }

  // Get data type info (extensions, icon)
  function getDataTypeInfo(dataType) {
    return CONFIG.DATA_TYPES[dataType] || { extensions: [], icon: '❓' };
  }

  /* ─── 3D MODEL CREATION ─────────────────────────────────────────────── */

  function _initializeReceptionSamples() {
    // Create a few blank sample tubes in reception for check-in
    for (let i = 0; i < 3; i++) {
      const sample = new Sample(`SAMPLE_${i}`, null, null); // no barcode yet
      const sampleGroup = _createSampleTube(sample, false); // false = no barcode initially
      sampleGroup.position.set(
        -5 + i * 2, // spread them out
        0.5, // slightly above ground
        -5 // toward the back of reception
      );
      state.scene.add(sampleGroup);
      state.samples.push({
        sample: sample,
        mesh: sampleGroup,
        barcodeMesh: null // will be created when barcode is assigned
      });
    }
  }

  function _initializePhlebotomySamples() {
    // Create sample tubes with barcodes already assigned (as if checked in)
    // In reality, these would be the same samples from reception, but for simplicity we'll create new ones
    for (let i = 0; i < 3; i++) {
      const sampleType = CONFIG.SAMPLE_TYPES[i % CONFIG.SAMPLE_TYPES.length];
      const barcode = generateBarcode();
      const sample = new Sample(`SAMPLE_PHLEBO_${i}`, sampleType.id, barcode);
      sample.addCustodyEvent('Checked in at reception', 'system');
      // Infer initial data type
      sample.metadata.dataType = inferDataTypeFromSampleType(sample.type);
      const sampleResult = _createSampleTube(sample, true); // true = with barcode
      sampleResult.group.position.set(
        -5 + i * 2,
        0.5,
        5 // toward the front of phlebotomy (near the arm)
      );
      state.scene.add(sampleResult.group);
      state.samples.push({
        sample: sample,
        mesh: sampleResult.group,
        barcodeMesh: sampleResult.barcodeMesh
      });
    }
  }

  function _createSampleTube(sample, hasBarcode) {
    const group = new THREE.Group();

    // Tube body (cylinder)
    const tubeGeometry = new THREE.CylinderGeometry(
      CONFIG.TUBE.radius,
      CONFIG.TUBE.radius,
      CONFIG.TUBE.height,
      32
    );
    const tubeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.3
    });
    const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    tubeMesh.rotation.x = 0; // upright along y-axis
    tubeMesh.position.y = CONFIG.TUBE.height / 2; // bottom at y=0
    group.add(tubeMesh);

    // Cap (different color based on sample type)
    let capColor = 0xffffff; // default white
    if (sample.type) {
      const typeInfo = CONFIG.SAMPLE_TYPES.find(t => t.id === sample.type);
      if (typeInfo) {
        capColor = typeInfo.color;
      }
    }
    const capGeometry = new THREE.CylinderGeometry(
      CONFIG.TUBE.radius * 1.1, // slightly larger than tube
      CONFIG.TUBE.radius * 1.1,
      CONFIG.TUBE.capHeight,
      32
    );
    const capMaterial = new THREE.MeshStandardMaterial({
      color: capColor,
      metalness: 0.1,
      roughness: 0.3
    });
    const capMesh = new THREE.Mesh(capGeometry, capMaterial);
    capMesh.position.y = CONFIG.TUBE.height + CONFIG.TUBE.capHeight / 2;
    group.add(capMesh);

    // Label (where barcode goes)
    const labelGeometry = new THREE.PlaneGeometry(
      CONFIG.TUBE.radius * 2, // width
      CONFIG.TUBE.height * 0.6 // height
    );
    const labelMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      metalness: 0.0,
      roughness: 0.5
    });
    const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
    labelMesh.position.set(
      0, // center of tube
      CONFIG.TUBE.height / 2, // middle height
      CONFIG.TUBE.radius + 0.01 // slightly outward to avoid z-fighting
    );
    labelMesh.rotation.y = Math.PI / 2; // face outward
    group.add(labelMesh);

    // If we have a barcode, create and attach the barcode mesh
    let barcodeMesh = null;
    if (hasBarcode && sample.barcode) {
      barcodeMesh = _createBarcodeMesh(sample.barcode);
      barcodeMesh.position.set(
        0,
        CONFIG.TUBE.height / 2,
        CONFIG.TUBE.radius + 0.02 // slightly further out than label
      );
      barcodeMesh.rotation.y = Math.PI / 2;
      group.add(barcodeMesh);
    }

    // Always return an object with consistent structure
    return { group: group, barcodeMesh: barcodeMesh };
  }

  function _createBarcodeMesh(barcodeString) {
    // We'll create a simple representation: a set of black and white bars
    // For simplicity, we'll just create a flat plane with a texture that looks like a barcode.
    // Since we cannot load textures easily, we'll create a geometry that mimics a barcode.

    // Alternatively, we can just use a text representation for now.
    // In a real implementation, we'd use a canvas texture.

    // Let's create a set of thin boxes for bars.
    const group = new THREE.Group();

    // We'll simulate a barcode by having alternating black and white bars.
    // This is a very simplified version.
    const barWidth = 0.02;
    const spaceWidth = 0.02;
    let xOffset = - (barcodeString.length * (barWidth + spaceWidth)) / 2;

    for (let i = 0; i < barcodeString.length; i++) {
      const charCode = barcodeString.charCodeAt(i);
      // Use the charCode to determine a pattern (for simplicity, we'll make odd/even)
      const isBlack = charCode % 2 === 0;
      const barColor = isBlack ? 0x000000 : 0xffffff;

      const barGeometry = new THREE.BoxGeometry(barWidth, 0.1, 0.01);
      const barMaterial = new THREE.MeshStandardMaterial({
        color: barColor,
        metalness: 0.0,
        roughness: 0.5
      });
      const barMesh = new THREE.Mesh(barGeometry, barMaterial);
      barMesh.position.set(xOffset + barWidth/2, 0, 0);
      group.add(barMesh);

      xOffset += barWidth + spaceWidth;
    }

    // We'll also add a text label for the barcode string (for debugging)
    // But note: Three.js doesn't have built-in text, so we'll skip for now.

    return group;
  }

  /* ─── INTERACTION LISTENERS ──────────────────────────────────────── */

  function _setupSampleInteractionListeners() {
    state.container.addEventListener('mousedown', _onMouseDown, { passive: false });
    state.container.addEventListener('mouseup', _onMouseUp, { passive: false });
    state.container.addEventListener('mousemove', _onMouseMove, { passive: false });
    state.container.addEventListener('wheel', _onMouseWheel, { passive: false });
  }

  function _onMouseDown(event) {
    // Check if we clicked on a sample tube or a scanner, etc.
    state.raycaster.setFromCamera(state.mouse, state.camera);
    const intersects = state.raycaster.intersectObjects(
      state.samples.map(s => s.mesh).filter(Boolean),
      true
    );

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      // Find which sample this belongs to
      const sampleData = state.samples.find(s =>
        s.mesh === intersectedObject ||
        s.mesh.traverse(obj => obj === intersectedObject).length > 0
      );

      if (sampleData) {
        _handleSampleClick(sampleData, intersectedObject);
      }
    }
  }

  function _onMouseUp(event) {
    // Not used for now, but could be for drag and drop
  }

  function _onMouseMove(event) {
    const rect = state.container.getBoundingClientRect();
    state.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    state.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function _onMouseWheel(event) {
    event.preventDefault();
  }

  function _handleSampleClick(sampleData, intersectedObject) {
    // Determine what part was clicked (tube, label, cap) and act accordingly
    // For simplicity, we'll assume clicking on the tube picks it up or scans it.

    // Check if we are in reception or phlebotomy room based on player position
    const room = _getCurrentRoom();
    if (room === 'reception') {
      _handleReceptionSampleClick(sampleData);
    } else if (room === 'phlebotomy') {
      _handlePhlebotomySampleClick(sampleData);
    } else if (room === 'processing') {
      _handleProcessingSampleClick(sampleData);
    }
  }

  function _getCurrentRoom() {
    // Simple check based on player position (we'll need to access facility state)
    // Since we don't have direct access, we'll approximate by z-position.
    // Reception: z around -5, Phlebotomy: z around 5, Processing: z around 10
    // This is a simplification. In reality, we'd use the facility's room streaming.
    const zPos = state.camera.position.z;
    if (zPos < 0) {
      return 'reception';
    } else if (zPos < 8) {
      return 'phlebotomy';
    } else {
      return 'processing';
    }
  }

  function _handleReceptionSampleClick(sampleData) {
    // In reception: clicking on a blank sample allows assigning a barcode
    if (!sampleData.sample.barcode) {
      // Assign a barcode
      const barcode = generateBarcode();
      sampleData.sample.barcode = barcode;
      sampleData.sample.addCustodyEvent('Barcode assigned in reception', 'user');

      // Create and attach the barcode mesh
      if (sampleData.barcodeMesh) {
        state.scene.remove(sampleData.barcodeMesh);
      }
      // Remove the old sample mesh
      state.scene.remove(sampleData.mesh);

      // Create a new sample group WITH barcode
      const sampleResult = _createSampleTube(sampleData.sample, true);
      sampleResult.group.position.copy(sampleData.mesh.position);
      state.scene.add(sampleResult.group);

      // Update our references
      sampleData.mesh = sampleResult.group;
      sampleData.barcodeMesh = sampleResult.barcodeMesh;

      _logToNotebook(`Assigned barcode ${barcode} to sample ${sampleData.sample.id}`);
    }
  }

  function _handlePhlebotomySampleClick(sampleData) {
    // In phlebotomy: clicking on a sample may allow scanning or drawing blood
    // We'll implement: if we have a scanner equipped, clicking scans the barcode
    // For now, we'll just log that we clicked on it.
    _logToNotebook(`Clicked on sample ${sampleData.sample.id} (type: ${sampleData.sample.type})`);
  }

  function _handleProcessingSampleClick(sampleData) {
    // In processing: clicking on a sample allows adding/editing metadata
    // This simulates what a bioinformatician would do when receiving sequencing data
    if (sampleData.sample.status === 'collected') {
      // Prompt for basic metadata (in a real system, this would be a modal)
      const metadataPrompt = `
Processing sample ${sampleData.sample.id}
Please provide basic metadata:
1. Instrument (e.g., Illumina NovaSeq): ${sampleData.sample.metadata.instrument || '[not set]'}
2. Library Prep (e.g., TruSeq DNA): ${sampleData.sample.metadata.libraryPrep || '[not set]'}
      `.trim();

      // For demo purposes, we'll auto-fill with plausible values
      // In reality, this would show a form
      const instrumentOptions = ['Illumina NovaSeq 6000', 'Illumina NextSeq 2000', 'Oxford Nanopore PromethION'];
      const libraryOptions = ['TruSeq DNA PCR-Free', 'Nextera DNA Flex', 'SMTERSeq'];

      const instrument = instrumentOptions[Math.floor(Math.random() * instrumentOptions.length)];
      const libraryPrep = libraryOptions[Math.floor(Math.random() * libraryOptions.length)];

      // Update sample metadata
      sampleData.sample.metadata.instrument = instrument;
      sampleData.sample.metadata.libraryPrep = libraryPrep;
      sampleData.sample.metadata.fileNames = [
        `${sampleData.sample.id}_R1_001.fastq.gz`,
        `${sampleData.sample.id}_R2_001.fastq.gz`
      ];

      // Add to chain of custody
      sampleData.sample.addCustodyEvent(`Metadata added: ${instrument}, ${libraryPrep}`, 'user');

      // Update status
      sampleData.sample.status = 'processed';

      _logToNotebook(`Added metadata to ${sampleData.sample.id}: ${instrument}, ${libraryPrep}`);

      // Show mock results in notebook
      _showMockResults(sampleData.sample);
    }
  }

  function _showMockResults(sample) {
    // Show mock bioinformatics results based on sample type
    const dataTypeInfo = getDataTypeInfo(sample.metadata.dataType);
    let resultMessage = `Results for ${sample.id} (${sample.type}):\n`;

    if (sample.metadata.dataType === 'genomics' || sample.metadata.dataType === 'transcriptomics') {
      resultMessage += `  📊 Data Type: ${dataTypeInfo.icon} ${sample.metadata.dataType}\n`;
      resultMessage += `  🧬 Instrument: ${sample.metadata.instrument}\n`;
      resultMessage += `  🧪 Library Prep: ${sample.metadata.libraryPrep}\n`;
      resultMessage += `  📁 Expected Files: ${sample.metadata.fileNames.join(', ')}\n`;
      resultMessage += `  🔬 Reference: GRCh38.p13\n`;
      resultMessage += `  📈 QC: Yield: 3.2Gb, %>Q30: 85%\n`;
    } else if (sample.metadata.dataType === 'microbiology') {
      resultMessage += `  🦠 Data Type: ${dataTypeInfo.icon} ${sample.metadata.dataType}\n`;
      resultMessage += `  🧬 Instrument: ${sample.metadata.instrument}\n`;
      resultMessage += `  📊 QC: Total Reads: 2.1M, Mean Length: 150bp\n`;
      resultMessage += `  🦠 Identified: Escherichia coli (98.7%)\n`;
    } else {
      resultMessage += `  📊 Data Type: ${dataTypeInfo.icon} ${sample.metadata.dataType}\n`;
      resultMessage += `  🧬 Instrument: ${sample.metadata.instrument}\n`;
      resultMessage += `  🧪 Library Prep: ${sample.metadata.libraryPrep}\n`;
    }

    _logToNotebook(resultMessage);
  }

  /* ─── HANDHELD SCANNER AND TABLET ────────────────────────────────────── */

  // We'll create a handheld scanner and tablet in the phlebotomy room
  function _createScannerAndTablet() {
    // Handheld scanner (model)
    const scannerGeometry = new THREE.BoxGeometry(
      CONFIG.SCANNER.size.x,
      CONFIG.SCANNER.size.y,
      CONFIG.SCANNER.size.z
    );
    const scannerMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      metalness: 0.5,
      roughness: 0.3
    });
    const scannerMesh = new THREE.Mesh(scannerGeometry, scannerMaterial);
    scannerMesh.position.set(-2, 1.5, -2); // example position
    state.scene.add(scannerMesh);

    // Tablet (model)
    const tabletGeometry = new THREE.BoxGeometry(
      CONFIG.TABLET.size.x,
      CONFIG.TABLET.size.y,
      CONFIG.TABLET.size.z
    );
    const tabletMaterial = new THREE.MeshStandardMaterial({
      color: 0x202020,
      metalness: 0.1,
      roughness: 0.7
    });
    const tabletMesh = new THREE.Mesh(tabletGeometry, tabletMaterial);
    tabletMesh.position.set(2, 1.5, -2); // example position
    state.scene.add(tabletMesh);

    // We'll also create a screen on the tablet for displaying info
    const screenGeometry = new THREE.PlaneGeometry(
      CONFIG.TABLET.size.x * 0.9,
      CONFIG.TABLET.size.y * 0.9
    );
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      metalness: 0.0,
      roughness: 0.5
    });
    const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    screenMesh.position.set(
      0,
      0.01, // slightly above the tablet
      CONFIG.TABLET.size.z / 2
    );
    tabletMesh.add(screenMesh);
    state.tabletScreen = screenMesh;

    // Add a label to indicate this is a bioinformatics workstation
    const labelGeometry = new THREE.PlaneGeometry(0.5, 0.2);
    const labelMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      metalness: 0.0,
      roughness: 0.5
    });
    const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
    labelMesh.position.set(0, 0.15, CONFIG.TABLET.size.z / 2 + 0.01);
    tabletMesh.add(labelMesh);
    state.tabletLabel = labelMesh;
  }

  /* ─── CHAIN OF CUSTODY LOGGING ──────────────────────────────────────── */

  function _initChainOfCustodyUI() {
    // Create a UI element for the chain of custody log
    const logContainer = document.createElement('div');
    logContainer.id = 'chain-of-custody-log';
    logContainer.style.position = 'absolute';
    logContainer.style.top = '10px';
    logContainer.style.right = '10px';
    logContainer.style.background = 'rgba(0,0,0,0.5)';
    logContainer.style.color = '#e0e0e0';
    logContainer.style.padding = '10px';
    logContainer.style.borderRadius = '4px';
    logContainer.style.maxHeight = '300px';
    logContainer.style.overflowY = 'auto';
    logContainer.style.fontFamily = 'monospace';
    logContainer.style.fontSize = '12px';
    state.container.appendChild(logContainer);
    state.logContainer = logContainer;
  }

  function _updateChainOfCustodyUI() {
    if (!state.logContainer) return;
    // Show last 20 entries
    const entries = state.chainOfCustody.slice(-20).map(entry => {
      return `[${new Date(entry.timestamp).toLocaleTimeString()}] Sample ${entry.sampleId}: ${entry.description}`;
    });
    state.logContainer.textContent = entries.join('\n');
    state.logContainer.scrollTop = state.logContainer.scrollHeight;
  }

  function _logToNotebook(entry) {
    // We'll also log to a general notebook for debugging
    console.log(entry);
  }

  /* ─── RETURN PUBLIC API ─────────────────────────────────────────────── */

  return {
    init,
    dispose
  };
})();