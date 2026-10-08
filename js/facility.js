/* ═════════════════════════════════════════════════════════════════
   OmicsLab — 3D Facility Shell
   Milestone 1: Walkable facility with collision, player controller,
   room streaming, minimap, signage, lighting.
   SECOND ITERATION: Enhanced atmospheric details and wayfinding
   Uses vanilla Three.js for consistency with codebase.
   ═════════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Facility = (function () {
  'use strict';

  // Configuration
  const CONFIG = {
    // Room definitions: each room is a box with position and size (inner dimensions)
    rooms: [
      // Reception/Sample Intake
      { id: 'reception', position: new THREE.Vector3(0, 0, 0), size: new THREE.Vector3(12, 4, 12) },
      // Phlebotomy/Collection room
      { id: 'phlebotomy', position: new THREE.Vector3(18, 0, 0), size: new THREE.Vector3(10, 4, 10) },
      // Sample Processing (biosafety cabinet, centrifuge)
      { id: 'processing', position: new THREE.Vector3(34, 0, 0), size: new THREE.Vector3(14, 4, 12) },
      // -80°C freezer/biobank corridor (now properly oriented as a corridor)
      { id: 'freezer_corridor', position: new THREE.Vector3(52, 0, 0), size: new THREE.Vector3(6, 4, 18) },
      // Pre-PCR clean room
      { id: 'precrclean', position: new THREE.Vector3(64, 0, 0), size: new THREE.Vector3(12, 4, 12) },
      // Library Prep room
      { id: 'library_prep', position: new THREE.Vector3(82, 0, 0), size: new THREE.Vector3(12, 4, 12) },
      // Sequencing suite
      { id: 'sequencing', position: new THREE.Vector3(100, 0, 0), size: new THREE.Vector3(14, 4, 12) },
      // Bioinformatics/Analysis office
      { id: 'bioinfo', position: new THREE.Vector3(120, 0, 0), size: new THREE.Vector3(12, 4, 12) }
    ],
    // Doorway width between rooms (opening in walls)
    doorwayWidth: 4,
    doorwayHeight: 3,
    // Wall thickness
    wallThickness: 0.2,
    // Signage
    signageHeight: 2.5,
    // Player
    playerHeight: 1.8,
    playerRadius: 0.4,
    // Movement speed (units per second)
    walkSpeed: 5,
    // Gravity
    gravity: -20,
    // Minimap
    minimapSize: 200, // pixels
    minimapMargin: 20,
    // Lighting - FINE-TUNED: Better color temperature and balance
    ambientLightColor: 0x484848,
    ambientLightIntensity: 0.85,
    directionalLightColor: 0xffffff,
    directionalLightIntensity: 0.4,
    // Ground plane size (larger than facility)
    groundSize: 250
  };

  // State
  let state = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    clock: new THREE.Clock(),
    // Loaded rooms: map of roomId to { mesh: THREE.Group, loaded: boolean }
    loadedRooms: new Map(),
    // All room definitions for spatial queries
    allRooms: [],
    // Player state
    player: {
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      onGround: false,
      // input
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      // mouse look
      yaw: 0,
      pitch: 0
    },
    // Minimap render target and scene
    minimapRenderTarget: null,
    minimapScene: null,
    minimapCamera: null,
    minimapRenderer: null,
    // Signage sprites
    signageSprites: [],
    // Ground mesh (always present)
    groundMesh: null,
    // Floor meshes for different room types
    floorMeshes: new Map(),
    // Decorative elements (plants, artwork, etc.)
    decorativeElements: new Map(),
    // Input state for mobile (virtual joystick)
    touchJoystick: null,
    // Initialized flag
    initialized: false,
    // Container DOM element
    container: null
  };

  /* ─── INITIALIZATION & LIFECYCLE ─────────────────────────────────────── */

  function init(containerEl, options = {}) {
    if (state.initialized) return false;

    state.container = containerEl;

    // Check for Three.js
    if (typeof THREE === 'undefined') {
      console.error('Three.js not loaded. Please include three.js before initializing Facility.');
      return false;
    }

    // Initialize all room definitions (convert to usable format)
    state.allRooms = CONFIG.rooms.map(room => ({
      id: room.id,
      // Inner box (empty space)
      innerBox: new THREE.Box3(
        new THREE.Vector3(
          room.position.x - room.size.x / 2,
          0,
          room.position.z - room.size.z / 2
        ),
        new THREE.Vector3(
          room.position.x + room.size.x / 2,
          room.size.y,
          room.position.z + room.size.z / 2
        )
      ),
      // Outer box (including walls) for collision
      outerBox: new THREE.Box3(
        new THREE.Vector3(
          room.position.x - (room.size.x + CONFIG.wallThickness * 2) / 2,
          0,
          room.position.z - (room.size.z + CONFIG.wallThickness * 2) / 2
        ),
        new THREE.Vector3(
          room.position.x + (room.size.x + CONFIG.wallThickness * 2) / 2,
          room.size.y,
          room.position.z + (room.size.z + CONFIG.wallThickness * 2) / 2
        )
      ),
      mesh: null,
      loaded: false
    }));

    // Create Three.js basics
    _createScene();
    _createCamera();
    _createRenderer(containerEl);
    _createLighting();
    _createGround();
    _createPlayerController();
    _createMinimap();
    _loadInitialRooms(); // load rooms near start
    _createSignage();
    _createDecorativeElements();
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

    if (state.minimapRenderer) {
      state.minimapRenderer.dispose();
      state.minimapRenderer.forceContextLoss();
      state.minimapRenderer = null;
    }

    // Dispose geometries and materials
    state.scene.traverse(object => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    state.scene.clear();
    state.scene = null;

    // Dispose floor meshes
    state.floorMeshes.forEach((mesh, id) => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });

    // Dispose decorative elements
    state.decorativeElements.forEach((mesh, id) => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });

    if (state.groundMesh) {
      if (state.groundMesh.geometry) state.groundMesh.geometry.dispose();
      if (state.groundMesh.material) state.groundMesh.material.dispose();
    }

    if (state.controls) {
      state.controls = null;
    }

    // Remove event listeners
    window.removeEventListener('resize', _onWindowResize);
    window.removeEventListener('keydown', _onKeyDown);
    window.removeEventListener('keyup', _onKeyUp);
    state.container.removeEventListener('mousedown', _onMouseDown);
    state.container.removeEventListener('mouseup', _onMouseUp);
    state.container.removeEventListener('mousemove', _onMouseMove);
    state.container.removeEventListener('wheel', _onMouseWheel);
    state.container.removeEventListener('touchstart', _onTouchStart);
    state.container.removeEventListener('touchmove', _onTouchMove);
    state.container.removeEventListener('touchend', _onTouchEnd);
    state.container.removeEventListener('touchcancel', _onTouchEnd);

    state.initialized = false;
    state.container.innerHTML = '';
  }

  // Public method to get delta time for external systems
  function getDelta() {
    return state.clock.getDelta();
  }

  // Public getters for scene, camera, renderer
  function getScene() {
    return state.scene;
  }

  function getCamera() {
    return state.camera;
  }

  function getRenderer() {
    return state.renderer;
  }

  /* ─── CORE THREE.JS SETUP ────────────────────────────────────────────── */

  function _createScene() {
    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0x060a14); // Match OmicsLab dark bg
    state.scene.fog = new THREE.FogExp2(0x060a14, 0.005); // even less fog for clarity
  }

  function _createCamera() {
    const aspect = state.container.clientWidth / state.container.clientHeight;
    state.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    state.camera.position.set(0, state.playerHeight, 0);
  }

  function _createRenderer(containerEl) {
    state.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    state.renderer.setSize(containerEl.clientWidth, containerEl.clientHeight);
    state.renderer.setPixelRatio(window.devicePixelRatio);
    state.renderer.shadowMap.enabled = true;
    state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerEl.appendChild(state.renderer.domElement);
  }

  function _createGround() {
    // Large ground plane
    const groundGeometry = new THREE.PlaneGeometry(CONFIG.groundSize, CONFIG.groundSize);
    // Rotate to be horizontal
    groundGeometry.rotateX(-Math.PI / 2);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b8b83, // concrete gray
      metalness: 0.1,
      roughness: 0.9
    });
    state.groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    state.groundMesh.position.y = 0;
    state.groundMesh.receiveShadow = true;
    state.scene.add(state.groundMesh);
  }

  function _createLighting() {
    // Ambient light - slightly warmer for better feel
    const ambientLight = new THREE.AmbientLight(CONFIG.ambientLightColor, CONFIG.ambientLightIntensity);
    state.scene.add(ambientLight);

    // Main directional light (simulating light from ceiling panels)
    const directionalLight = new THREE.DirectionalLight(CONFIG.directionalLightColor, CONFIG.directionalLightIntensity);
    directionalLight.position.set(0, 40, 0); // Directly above for more uniform lighting
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;
    state.scene.add(directionalLight);

    // Fill light to reduce shadows - positioned to simulate indirect lighting
    const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.15);
    fillLight1.position.set(-15, 25, -15);
    state.scene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.15);
    fillLight2.position.set(15, 25, 15);
    state.scene.add(fillLight2);

    // Hemisphere light for ground bounce - slightlyadjusted for better ambient occlusion
    const hemiLight = new THREE.HemisphereLight(0xadd8e6, 0x060a14, 0.5); // lighter sky color
    state.scene.add(hemiLight);
  }

  function _createPlayerController() {
    state.controls = {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false
    };
  }

  function _createMinimap() {
    // Render target for minimap
    state.minimapRenderTarget = new THREE.WebGLRenderTarget(
      CONFIG.minimapSize,
      CONFIG.minimapSize,
      { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat }
    );

    // Minimap scene (top-down view)
    state.minimapScene = new THREE.Scene();
    state.minimapScene.background = new THREE.Color(0x060a14);

    // Orthographic camera for minimap
    const minimapWorldSize = 250; // world units shown (updated for larger facility)
    state.minimapCamera = new THREE.OrthographicCamera(
      -minimapWorldSize / 2, minimapWorldSize / 2,
      minimapWorldSize / 2, -minimapWorldSize / 2,
      0.1, 1000
    );
    state.minimapCamera.position.set(0, 100, 0);
    state.minimapCamera.lookAt(0, 0, 0);
    state.minimapScene.add(state.minimapCamera);

    // Minimap renderer
    state.minimapRenderer = new THREE.WebGLRenderer({ antialias: false });
    state.minimapRenderer.setSize(CONFIG.minimapSize, CONFIG.minimapSize);
    state.minimapRenderer.setClearColor(0x060a14, 1);

    // Create overlay container
    const minimapOverlay = document.createElement('div');
    minimapOverlay.id = 'facility-minimap';
    minimapOverlay.style.position = 'absolute';
    minimapOverlay.style.bottom = `${CONFIG.minimapMargin}px`;
    minimapOverlay.style.right = `${CONFIG.minimapMargin}px`;
    minimapOverlay.style.width = `${CONFIG.minimapSize}px`;
    minimapOverlay.style.height = `${CONFIG.minimapSize}px`;
    minimapOverlay.style.background = 'rgba(0,0,0,0.5)';
    minimapOverlay.style.border = '2px solid #00C4A0';
    minimapOverlay.style.borderRadius = '4px';
    minimapOverlay.style.overflow = 'hidden';
    state.container.appendChild(minimapOverlay);

    // Canvas for rendering
    const minimapCanvas = document.createElement('canvas');
    minimapCanvas.width = CONFIG.minimapSize;
    minimapCanvas.height = CONFIG.minimapSize;
    minimapOverlay.appendChild(minimapCanvas);
    state.minimapRenderer.domElement = minimapCanvas;
    minimapOverlay.appendChild(state.minimapRenderer.domElement);
  }

  function _createSignage() {
    state.signageSprites = [];

    // For each room, create a sign above the doorway facing the corridor
    state.allRooms.forEach(roomInfo => {
      const roomDef = CONFIG.rooms.find(r => r.id === roomInfo.id);
      if (!roomDef) return;

      // Determine sign position: above the midpoint of the room facing +X direction
      // For corridor rooms, we'll adjust accordingly
      let signPosX, signPosZ;

      if (roomInfo.id === 'freezer_corridor') {
        // For the corridor, place sign on the side facing the main corridor direction
        signPosX = roomDef.position.x;
        signPosZ = roomDef.position.z + roomDef.size.z / 2 + CONFIG.wallThickness + 1;
      } else {
        // For regular rooms, place sign on the wall facing +X direction (toward next room)
        signPosX = roomDef.position.x + roomDef.size.x / 2 + CONFIG.wallThickness + 1;
        signPosZ = roomDef.position.z;
      }

      const signPos = new THREE.Vector3(
        signPosX,
        roomDef.position.y + roomDef.size.y - CONFIG.signageHeight / 2,
        signPosZ
      );

      // Create canvas for text with room-specific icon
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 256;

      // Background with gradient-like effect
      const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0,0,0,0.8)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Icon background with glow effect
      context.shadowColor = '#00C4A0';
      context.shadowBlur = 20;
      context.fillStyle = '#00C4A0';
      context.beginPath();
      context.arc(128, 128, 100, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0; // reset

      // Room icon (simplified)
      context.fillStyle = 'white';
      context.font = 'bold 96px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      // Different icons for different room types
      let icon = '?';
      switch(roomInfo.id) {
        case 'reception': icon = '📋'; break;
        case 'phlebotomy': icon = '💉'; break;
        case 'processing': icon = '🔬'; break;
        case 'freezer_corridor': icon = '❄️'; break;
        case 'precrclean': icon = '🧼'; break;
        case 'library_prep': icon = '🧪'; break;
        case 'sequencing': icon = '🧬'; break;
        case 'bioinfo': icon = '💻'; break;
        default: icon = '🏢';
      }

      context.fillText(icon, 128, 128);

      // Room name with better typography
      context.fillStyle = 'white';
      context.font = 'bold 36px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'bottom';
      context.fillText(roomInfo.id.toUpperCase(), 128, 220);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(3, 3, 1); // width, height, depth
      sprite.position.copy(signPos);

      // Make sign face the player (always look toward origin for simplicity)
      // In a more advanced version, we'd make it face the corridor
      state.scene.add(sprite);
      state.signageSprites.push(sprite);
    });
  }

  function _createDecorativeElements() {
    state.decorativeElements = new Map();

    // Add some decorative elements to make the facility feel less sterile
    // Plants in reception area
    const plantGeometry = new THREE.ConeGeometry(0.3, 0.8, 8);
    const plantMaterial = new THREE.MeshStandardMaterial({
      color: 0x228b22,
      metalness: 0.0,
      roughness: 0.8
    });

    // Reception plants
    for (let i = -1; i <= 1; i++) {
      const plant = new THREE.Mesh(plantGeometry, plantMaterial);
      plant.position.set(i * 2, 0.4, 4);
      plant.castShadow = true;
      state.scene.add(plant);
    }

    // Artwork on walls (simple frames)
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      metalness: 0.1,
      roughness: 0.6
    });
    const artworkMaterial = new THREE.MeshStandardMaterial({
      color: 0xfffff0,
      metalness: 0.0,
      roughness: 0.5
    });

    // Bioinfo area artwork
    const artwork = new THREE.Group();
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1.5, 0.1),
      frameMaterial
    );
    frame.position.set(118, 2.5, 0);
    frame.castShadow = true;
    artwork.add(frame);

    const canvas = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 1.4, 0.05),
      artworkMaterial
    );
    canvas.position.set(118, 2.5, 0.06);
    canvas.castShadow = true;
    artwork.add(canvas);

    state.scene.add(artwork);
    state.decorativeElements.set('bioinfo_artwork', artwork);
  }

  function _setupEventListeners() {
    window.addEventListener('resize', _onWindowResize);
    window.addEventListener('keydown', _onKeyDown);
    window.addEventListener('keyup', _onKeyUp);
    state.container.addEventListener('mousedown', _onMouseDown);
    state.container.addEventListener('mouseup', _onMouseUp);
    state.container.addEventListener('mousemove', _onMouseMove);
    state.container.addEventListener('wheel', _onMouseWheel, { passive: false });

    // Touch controls for mobile
    state.container.addEventListener('touchstart', _onTouchStart, { passive: false });
    state.container.addEventListener('touchmove', _onTouchMove, { passive: false });
    state.container.addEventListener('touchend', _onTouchEnd, { passive: false });
    state.container.addEventListener('touchcancel', _onTouchEnd);
  }

  /* ─── ROOM LOADING & STREAMING ───────────────────────────────────────── */

  function _loadInitialRooms() {
    // Load rooms near starting position (first room)
    const startPos = state.allRooms[0].innerBox.getCenter(new THREE.Vector3());
    const loadDistance = 35; // Increased for larger facility
    state.allRooms.forEach(roomInfo => {
      const dist = roomInfo.innerBox.distanceToPoint(startPos);
      if (dist < loadDistance) {
        _loadRoom(roomInfo.id);
      }
    });
  }

  function _loadRoom(roomId) {
    const roomInfo = state.allRooms.find(r => r.id === roomId);
    if (!roomInfo || roomInfo.loaded) return;

    const group = new THREE.Group();

    // Create room with specific features
    const roomDef = CONFIG.rooms.find(r => r.id === roomId);
    if (!roomDef) return;

    const halfX = roomDef.size.x / 2;
    const halfZ = roomDef.size.z / 2;
    const halfY = roomDef.size.y / 2;
    const wallTh = CONFIG.wallThickness;
    const doorW = CONFIG.doorwayWidth;
    const doorH = CONFIG.doorwayHeight;

    // Create floor with room-specific appearance
    const floorMesh = _createRoomFloor(roomDef);
    if (floorMesh) {
      group.add(floorMesh);
      state.floorMeshes.set(roomId, floorMesh);
    }

    // Create walls with room-specific features
    const wallGroup = _createRoomWalls(roomDef);
    group.add(wallGroup);

    // Add room-specific fixtures/equipment
    const fixturesGroup = _createRoomFixtures(roomDef);
    group.add(fixturesGroup);

    // Position the room group
    group.position.set(
      roomDef.position.x,
      0, // ground at y=0
      roomDef.position.z
    );

    state.scene.add(group);
    roomInfo.mesh = group;
    roomInfo.loaded = true;
    state.loadedRooms.set(roomId, group);
  }

  function _createRoomFloor(roomDef) {
    // Create a slightly elevated floor piece for the room
    const floorGeometry = new THREE.PlaneGeometry(roomDef.size.x - 0.4, roomDef.size.z - 0.4);
    floorGeometry.rotateX(-Math.PI / 2);

    // Different floor colors/materials for different room types
    let floorColor = 0x8b8b83; // default concrete
    let floorMetallic = 0.1;
    let floorRoughness = 0.9;

    switch(roomDef.id) {
      case 'reception':
        floorColor = 0x696969; // darker gray
        break;
      case 'phlebotomy':
        floorColor = 0xffe4b5; // moccasin (easy to clean)
        break;
      case 'processing':
        floorColor = 0xb0c4de; // light steel blue
        break;
      case 'freezer_corridor':
        floorColor = 0xe0ffff; // light cyan (cold feel)
        break;
      case 'precrclean':
        floorColor = 0xf0ffff; // azzure white (clean)
        floorMetallic = 0.0;
        floorRoughness = 0.8;
        break;
      case 'library_prep':
        floorColor = 0xf5deb3; // wheat
        break;
      case 'sequencing':
        floorColor = 0xd8bfd8; // thistle
        break;
      case 'bioinfo':
        floorColor = 0xbfd255; // yellow-green (productive)
        break;
    }

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: floorColor,
      metalness: floorMetallic,
      roughness: floorRoughness
    });

    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.position.y = 0.01; // slightly above ground to avoid z-fighting
    floorMesh.receiveShadow = true;

    return floorMesh;
  }

  function _createRoomWalls(roomDef) {
    const group = new THREE.Group();

    const halfX = roomDef.size.x / 2;
    const halfZ = roomDef.size.z / 2;
    const halfY = roomDef.size.y / 2;
    const wallTh = CONFIG.wallThickness;

    // Wall material - slightly off-white for better lighting
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      metalness: 0.0,
      roughness: 0.9
    });

    // North wall ( +Z )
    const northWall = new THREE.Mesh(
      new THREE.BoxGeometry(roomDef.size.x, roomDef.size.y, wallTh),
      wallMaterial
    );
    northWall.position.set(
      roomDef.position.x,
      roomDef.position.y,
      roomDef.position.z + halfZ + wallTh / 2
    );
    northWall.receiveShadow = true;
    group.add(northWall);

    // South wall ( -Z )
    const southWall = new THREE.Mesh(
      new THREE.BoxGeometry(roomDef.size.x, roomDef.size.y, wallTh),
      wallMaterial
    );
    southWall.position.set(
      roomDef.position.x,
      roomDef.position.y,
      roomDef.position.z - halfZ - wallTh / 2
    );
    southWall.receiveShadow = true;
    group.add(southWall);

    // East wall ( +X )
    const eastWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallTh, roomDef.size.y, roomDef.size.z),
      wallMaterial
    );
    eastWall.position.set(
      roomDef.position.x + halfX + wallTh / 2,
      roomDef.position.y,
      roomDef.position.z
    );
    eastWall.receiveShadow = true;
    group.add(eastWall);

    // West wall ( -X )
    const westWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallTh, roomDef.size.y, roomDef.size.z),
      wallMaterial
    );
    westWall.position.set(
      roomDef.position.x - halfX - wallTh / 2,
      roomDef.position.y,
      roomDef.position.z
    );
    westWall.receiveShadow = true;
    group.add(westWall);

    // Ceiling
    const ceilingGeometry = new THREE.BoxGeometry(roomDef.size.x, wallTh, roomDef.size.z);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8f8f8,
      metalness: 0.0,
      roughness: 0.9
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.set(
      roomDef.position.x,
      roomDef.position.y + roomDef.size.y / 2 + wallTh / 2,
      roomDef.position.z
    );
    ceiling.receiveShadow = true;
    group.add(ceiling);

    return group;
  }

  function _createRoomFixtures(roomDef) {
    const group = new THREE.Group();
    const fixtureMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      metalness: 0.3,
      roughness: 0.4
    });

    switch(roomDef.id) {
      case 'reception':
        // Reception desk with more detail
        const deskTop = new THREE.Mesh(
          new THREE.BoxGeometry(4, 0.2, 2),
          fixtureMaterial
        );
        deskTop.position.set(0, 1.1, -3);
        deskTop.castShadow = true;
        group.add(deskTop);

        const deskLeg1 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 1, 0.2),
          fixtureMaterial
        );
        deskLeg1.position.set(-1.9, 0.5, -3.9);
        deskLeg1.castShadow = true;
        group.add(deskLeg1);

        const deskLeg2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 1, 0.2),
          fixtureMaterial
        );
        deskLeg2.position.set(1.9, 0.5, -3.9);
        deskLeg2.castShadow = true;
        group.add(deskLeg2);

        const deskLeg3 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 1, 0.2),
          fixtureMaterial
        );
        deskLeg3.position.set(-1.9, 0.5, -2.1);
        deskLeg3.castShadow = true;
        group.add(deskLeg3);

        const deskLeg4 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 1, 0.2),
          fixtureMaterial
        );
        deskLeg4.position.set(1.9, 0.5, -2.1);
        deskLeg4.castShadow = true;
        group.add(deskLeg4);
        break;

      case 'phlebotomy':
        // Chair and table for blood draw
        const chairSeat = new THREE.Mesh(
          new THREE.BoxGeometry(1, 0.2, 1),
          fixtureMaterial
        );
        chairSeat.position.set(-2, 1.1, 0);
        chairSeat.castShadow = true;
        group.add(chairSeat);

        const chairBack = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 1, 1),
          fixtureMaterial
        );
        chairBack.position.set(-2.5, 1.6, 0);
        chairBack.castShadow = true;
        group.add(chairBack);

        const tableTop = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.2, 1.5),
          fixtureMaterial
        );
        tableTop.position.set(2, 0.6, 0);
        tableTop.castShadow = true;
        group.add(tableTop);

        const tableLeg1 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.6, 0.2),
          fixtureMaterial
        );
        tableLeg1.position.set(2.9, 0.3, 0.7);
        tableLeg1.castShadow = true;
        group.add(tableLeg1);

        const tableLeg2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.6, 0.2),
          fixtureMaterial
        );
        tableLeg2.position.set(2.9, 0.3, -0.7);
        tableLeg2.castShadow = true;
        group.add(tableLeg2);

        const tableLeg3 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.6, 0.2),
          fixtureMaterial
        );
        tableLeg3.position.set(1.1, 0.3, 0.7);
        tableLeg3.castShadow = true;
        group.add(tableLeg3);

        const tableLeg4 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.6, 0.2),
          fixtureMaterial
        );
        tableLeg4.position.set(1.1, 0.3, -0.7);
        tableLeg4.castShadow = true;
        group.add(tableLeg4);
        break;

      case 'processing':
        // Biosafety cabinet with more detail
        const biosafetyMain = new THREE.Mesh(
          new THREE.BoxGeometry(3, 2, 2),
          fixtureMaterial
        );
        biosafetyMain.position.set(0, 1, 0);
        biosafetyMain.castShadow = true;
        group.add(biosafetyMain);

        const biosafetyWindow = new THREE.Mesh(
          new THREE.BoxGeometry(2.8, 1.8, 0.1),
          new THREE.MeshStandardMaterial({
            color: 0xe6e6fa,
            metalness: 0.1,
            roughness: 0.3
          })
        );
        biosafetyWindow.position.set(0, 1, 1.05);
        biosafetyWindow.castShadow = true;
        group.add(biosafetyWindow);

        // Centrifuge with more detail
        const centrifugeBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.5, 0.8, 16),
          fixtureMaterial
        );
        centrifugeBase.position.set(2, 0.4, -2);
        centrifugeBase.castShadow = true;
        group.add(centrifugeBase);

        const centrifugeTop = new THREE.Mesh(
          new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16),
          new THREE.MeshStandardMaterial({
            color: 0xc0c0c0,
            metalness: 0.5,
            roughness: 0.3
          })
        );
        centrifugeTop.position.set(2, 0.85, -2);
        centrifugeTop.castShadow = true;
        group.add(centrifugeTop);
        break;

      case 'freezer_corridor':
        // Freezer units along the corridor with more detail
        for (let i = -2; i <= 2; i++) {
          const freezerMain = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 2, 1),
            fixtureMaterial
          );
          freezerMain.position.set(0, 1, i * 2.5);
          freezerMain.castShadow = true;
          group.add(freezerMain);

          const freezerDoor = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 1.9, 0.1),
            new THREE.MeshStandardMaterial({
              color: 0xb0c4de,
              metalness: 0.2,
              roughness: 0.4
            })
          );
          freezerDoor.position.set(0, 1, i * 2.5 + 0.55);
          freezerDoor.castShadow = true;
          group.add(freezerDoor);

          const freezerHandle = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.2, 0.1),
            new THREE.MeshStandardMaterial({
              color: 0xffd700,
              metalness: 0.8,
              roughness: 0.2
            })
          );
          freezerHandle.position.set(0.8, 1, i * 2.5 + 0.55);
          freezerHandle.castShadow = true;
          group.add(freezerHandle);
        }
        break;

      case 'precrclean':
        // Air shower unit with more detail
        const airShowerFrame = new THREE.Mesh(
          new THREE.BoxGeometry(2, 2.5, 2),
          new THREE.MeshStandardMaterial({
            color: 0xc0c0c0,
            metalness: 0.5,
            roughness: 0.3
          })
        );
        airShowerFrame.position.set(0, 1.25, 0);
        airShowerFrame.castShadow = true;
        group.add(airShowerFrame);

        const airShowerInner = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 2.3, 1.8),
          new THREE.MeshStandardMaterial({
            color: 0xf0f8ff,
            metalness: 0.1,
            roughness: 0.4
          })
        );
        airShowerInner.position.set(0, 1.25, 0);
        airShowerInner.castShadow = true;
        group.add(airShowerInner);

        const airShowerNozzle1 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8),
          new THREE.MeshStandardMaterial({
            color: 0x808080,
            metalness: 0.6,
            roughness: 0.3
          })
        );
        airShowerNozzle1.position.set(-0.6, 2.2, -0.6);
        airShowerNozzle1.rotation.z = Math.PI / 4;
        airShowerNozzle1.castShadow = true;
        group.add(airShowerNozzle1);

        const airShowerNozzle2 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8),
          new THREE.MeshStandardMaterial({
            color: 0x808080,
            metalness: 0.6,
            roughness: 0.3
          })
        );
        airShowerNozzle2.position.set(0.6, 2.2, 0.6);
        airShowerNozzle2.rotation.z = -Math.PI / 4;
        airShowerNozzle2.castShadow = true;
        group.add(airShowerNozzle2);
        break;

      case 'library_prep':
        // Lab bench with more detail
        const benchTop = new THREE.Mesh(
          new THREE.BoxGeometry(4, 0.2, 2.5),
          fixtureMaterial
        );
        benchTop.position.set(0, 1.1, 0);
        benchTop.castShadow = true;
        group.add(benchTop);

        const benchLeg1 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 1, 0.2),
          fixtureMaterial
        );
        benchLeg1.position.set(-1.9, 0.5, -1.2);
        benchLeg1.castShadow = true;
        group.add(benchLeg1);

        const benchLeg2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 1, 0.2),
          fixtureMaterial
        );
        benchLeg2.position.set(1.9, 0.5, -1.2);
        benchLeg2.castShadow = true;
        group.add(benchLeg2);

        const benchLeg3 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 1, 0.2),
          fixtureMaterial
        );
        benchLeg3.position.set(-1.9, 0.5, 1.2);
        benchLeg3.castShadow = true;
        group.add(benchLeg3);

        const benchLeg4 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 1, 0.2),
          fixtureMaterial
        );
        benchLeg4.position.set(1.9, 0.5, 1.2);
        benchLeg4.castShadow = true;
        group.add(benchLeg4);

        // Shelves with more detail
        for (let i = -1; i <= 1; i++) {
          const shelf = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.2, 0.5),
            fixtureMaterial
          );
          shelf.position.set(0, 1.5 + i * 0.6, -1);
          shelf.castShadow = true;
          group.add(shelf);

          const shelfSupport1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.3, 0.5),
            fixtureMaterial
          );
          shelfSupport1.position.set(-1.45, 1.35 + i * 0.6, -1);
          shelfSupport1.castShadow = true;
          group.add(shelfSupport1);

          const shelfSupport2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.3, 0.5),
            fixtureMaterial
          );
          shelfSupport2.position.set(1.45, 1.35 + i * 0.6, -1);
          shelfSupport2.castShadow = true;
          group.add(shelfSupport2);
        }
        break;

      case 'sequencing':
        // Sequencing machine with more detail
        const sequencerMain = new THREE.Mesh(
          new THREE.BoxGeometry(3, 1.2, 2),
          new THREE.MeshStandardMaterial({
            color: 0xffd700, // gold-ish for high-value equipment
            metalness: 0.6,
            roughness: 0.3
          })
        );
        sequencerMain.position.set(0, 0.6, 0);
        sequencerMain.castShadow = true;
        group.add(sequencerMain);

        const sequencerScreen = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.8, 0.1),
          new THREE.MeshStandardMaterial({
            color: 0x000000,
            metalness: 0.1,
            roughness: 0.7
          })
        );
        sequencerScreen.position.set(0, 1.1, 1.05);
        sequencerScreen.castShadow = true;
        group.add(sequencerScreen);

        const sequencerLights = new THREE.Group();
        for (let i = 0; i < 3; i++) {
          const light = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            new THREE.MeshStandardMaterial({
              color: 0xff0000 + i * 0x00ff00, // red, yellow, green
              metalness: 0.6,
              roughness: 0.2
            })
          );
          light.position.set(-0.8 + i * 0.8, 1.2, 1.1);
          light.castShadow = true;
          sequencerLights.add(light);
        }
        group.add(sequencerLights);

        // Computer workstation with more detail
        const workstationDesk = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.2, 1),
          fixtureMaterial
        );
        workstationDesk.position.set(-2, 0.6, 2);
        workstationDesk.castShadow = true;
        group.add(workstationDesk);

        const workstationLeg1 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.6, 0.2),
          fixtureMaterial
        );
        workstationLeg1.position.set(-2.9, 0.3, 2.5);
        workstationLeg1.castShadow = true;
        group.add(workstationLeg1);

        const workstationLeg2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.6, 0.2),
          fixtureMaterial
        );
        workstationLeg2.position.set(-2.9, 0.3, 1.5);
        workstationLeg2.castShadow = true;
        group.add(workstationLeg2);

        const workstationLeg3 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.6, 0.2),
          fixtureMaterial
        );
        workstationLeg3.position.set(-1.1, 0.3, 2.5);
        workstationLeg3.castShadow = true;
        group.add(workstationLeg3);

        const workstationLeg4 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.6, 0.2),
          fixtureMaterial
        );
        workstationLeg4.position.set(-1.1, 0.3, 1.5);
        workstationLeg4.castShadow = true;
        group.add(workstationLeg4);

        const monitor = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.3, 0.2),
          new THREE.MeshStandardMaterial({
            color: 0x202020,
            metalness: 0.1,
            roughness: 0.7
          })
        );
        monitor.position.set(-2, 1, 2.1);
        monitor.castShadow = true;
        group.add(monitor);
        break;

      case 'bioinfo':
        // Desks with computers - more detailed
        for (let i = -1; i <= 1; i++) {
          const deskTop = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.2, 1.5),
            fixtureMaterial
          );
          deskTop.position.set(i * 3, 0.7, 0);
          deskTop.castShadow = true;
          group.add(deskTop);

          const deskLeg1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.7, 0.2),
            fixtureMaterial
          );
          deskLeg1.position.set(i * 3 - 0.9, 0.35, -0.75);
          deskLeg1.castShadow = true;
          group.add(deskLeg1);

          const deskLeg2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.7, 0.2),
            fixtureMaterial
          );
          deskLeg2.position.set(i * 3 + 0.9, 0.35, -0.75);
          deckLeg2.castShadow = true;
          group.add(deskLeg2);

          const deskLeg3 = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.7, 0.2),
            fixtureMaterial
          );
          deskLeg3.position.set(i * 3 - 0.9, 0.35, 0.75);
          deskLeg3.castShadow = true;
          group.add(deskLeg3);

          const deskLeg4 = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.7, 0.2),
            fixtureMaterial
          );
          deskLeg4.position.set(i * 3 + 0.9, 0.35, 0.75);
          deskLeg4.castShadow = true;
          group.add(deskLeg4);

          const monitorBase = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.2, 0.2),
            fixtureMaterial
          );
          monitorBase.position.set(i * 3, 0.9, 0.75);
          monitorBase.castShadow = true;
          group.add(monitorBase);

          const monitor = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.3, 0.2),
            new THREE.MeshStandardMaterial({
              color: 0x202020,
              metalness: 0.1,
              roughness: 0.7
            })
          );
          monitor.position.set(i * 3, 1.1, 0.85);
          monitor.castShadow = true;
          group.add(monitor);
        }

        // Whiteboard with more detail
        const whiteboardFrame = new THREE.Mesh(
          new THREE.BoxGeometry(4, 2, 0.2),
          new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            metalness: 0.1,
            roughness: 0.6
          })
        );
        whiteboardFrame.position.set(0, 1, -3.5);
        whiteboardFrame.castShadow = true;
        group.add(whiteboardFrame);

        const whiteboardSurface = new THREE.Mesh(
          new THREE.BoxGeometry(3.9, 1.9, 0.05),
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.0,
            roughness: 0.4
          })
        );
        whiteboardSurface.position.set(0, 1, -3.45);
        whiteboardSurface.castShadow = true;
        group.add(whiteboardSurface);

        const markerTray = new THREE.Mesh(
          new THREE.BoxGeometry(3.9, 0.1, 0.05),
          new THREE.MeshStandardMaterial({
            color: 0xd3d3d3,
            metalness: 0.1,
            roughness: 0.5
          })
        );
        markerTray.position.set(0, 0.05, -3.45);
        markerTray.castShadow = true;
        group.add(markerTray);
        break;
    }

    return group;
  }

  function _unloadRoom(roomId) {
    const roomInfo = state.allRooms.find(r => r.id === roomId);
    if (!roomInfo || !roomInfo.loaded) return;
    if (roomInfo.mesh) {
      state.scene.remove(roomInfo.mesh);
      roomInfo.mesh = null;
    }
    roomInfo.loaded = false;
    state.loadedRooms.delete(roomId);

    // Clean up floor mesh
    const floorMesh = state.floorMeshes.get(roomId);
    if (floorMesh) {
      state.scene.remove(floorMesh);
      state.floorMeshes.delete(roomId);
    }
  }

  function _updateRoomStreaming() {
    if (!state.initialized) return;
    const playerPos = state.player.position.clone();
    state.allRooms.forEach(roomInfo => {
      const dist = roomInfo.innerBox.distanceToPoint(playerPos);
      const loadThreshold = 30;
      const unloadThreshold = 45;
      if (roomInfo.loaded) {
        if (dist > unloadThreshold) {
          _unloadRoom(roomInfo.id);
        }
      } else {
        if (dist < loadThreshold) {
          _loadRoom(roomInfo.id);
        }
      }
    });
  }

  /* ─── PLAYER CONTROL & COLLISION ─────────────────────────────────────── */

  function _updatePlayer(delta) {
    if (!state.initialized) return;

    const velocity = state.player.velocity;
    const player = state.player;

    // Reset vertical velocity (we'll apply gravity separately)
    velocity.y = 0;

    // Get direction vectors from camera yaw
    const forward = new THREE.Vector3(
      Math.sin(state.player.yaw),
      0,
      Math.cos(state.player.yaw)
    );
    const right = new THREE.Vector3(
      Math.sin(state.player.yaw - Math.PI / 2),
      0,
      Math.cos(state.player.yaw - Math.PI / 2)
    );

    // Calculate wish direction from input
    const wishDir = new THREE.Vector3();
    if (state.controls.moveForward) wishDir.add(forward);
    if (state.controls.moveBackward) wishDir.sub(forward);
    if (state.controls.moveLeft) wishDir.add(right);
    if (state.controls.moveRight) wishDir.sub(right);
    if (wishDir.length() > 0) {
      wishDir.normalize();
      wishDir.multiplyScalar(CONFIG.walkSpeed);
    } else {
      wishDir.set(0, 0, 0);
    }

    // Apply wish direction as acceleration (simple)
    velocity.x += (wishDir.x - velocity.x) * Math.min(delta * 10, 1);
    velocity.z += (wishDir.z - velocity.z) * Math.min(delta * 10, 1);

    // Apply gravity
    velocity.y += CONFIG.gravity * delta;

    // Move player
    const oldPos = state.player.position.clone();
    state.player.position.addScaledVector(velocity, delta);

    // Simple ground check: if player goes below ground, snap back up
    if (state.player.position.y < 0) {
      state.player.position.y = 0;
      velocity.y = 0;
      state.player.onGround = true;
    } else {
      state.player.onGround = false;
    }

    // Collision detection with room outer boxes (walls)
    // We'll try to resolve collisions by sliding along walls.
    // For simplicity, we will revert to old position if we intersect any outer box.
    // This is naive but prevents walking through walls.
    let collided = false;
    state.allRooms.forEach(roomInfo => {
      if (!roomInfo.loaded) return;
      if (state.player.position.x < roomInfo.outerBox.max.x &&
          state.player.position.x > roomInfo.outerBox.min.x &&
          state.player.position.z < roomInfo.outerBox.max.z &&
          state.player.position.z > roomInfo.outerBox.min.z &&
          state.player.position.y < roomInfo.outerBox.max.y &&
          state.player.position.y > roomInfo.outerBox.min.y) {
        collided = true;
      }
    });

    if (collided) {
      // Revert to old position (simple)
      state.player.position.copy(oldPos);
      // After reverting, we might still be stuck if oldPos also collides (should not happen if we moved from free space)
    }

    // Update camera position to follow player (first-person)
    state.camera.position.set(
      state.player.position.x,
      state.player.position.y + state.playerHeight,
      state.player.position.z
    );

    // Apply yaw and pitch to camera (mouse look)
    state.camera.rotation.set(state.player.pitch, state.player.yaw, 0);
  }

  /* ─── INPUT HANDLERS ────────────────────────────────────────────────── */

  function _onKeyDown(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        state.controls.moveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        state.controls.moveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        state.controls.moveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        state.controls.moveRight = true;
        break;
      case 'Space':
        if (state.player.onGround) {
          state.player.velocity.y = 8; // jump impulse
          state.player.onGround = false;
        }
        break;
    }
  }

  function _onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        state.controls.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        state.controls.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        state.controls.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        state.controls.moveRight = false;
        break;
    }
  }

  function _onMouseDown(event) {
    if (event.button === 0) {
      // Left click could be used for interaction later
    }
  }

  function _onMouseUp(event) {
    if (event.button === 0) {
    }
  }

  function _onMouseMove(event) {
    const movementX = event.movementX || event.mozMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || 0;

    const sensitivity = 0.002;
    state.player.yaw -= movementX * sensitivity;
    state.player.pitch -= movementY * sensitivity;

    // Clamp pitch to avoid flipping
    const limit = Math.PI / 2 - 0.1;
    state.player.pitch = Math.max(-limit, Math.min(limit, state.player.pitch));
  }

  function _onMouseWheel(event) {
    event.preventDefault();
  }

  function _onTouchStart(event) {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      state.touchJoystick = {
        startX: touch.clientX,
        startY: touch.clientY,
        prevX: touch.clientX,
        prevY: touch.clientY
      };
      event.preventDefault();
    }
  }

  function _onTouchMove(event) {
    if (event.touches.length === 1 && state.touchJoystick) {
      const touch = event.touches[0];
      const dx = touch.clientX - state.touchJoystick.prevX;
      const dy = touch.clientY - state.touchJoystick.prevY;
      state.touchJoystick.prevX = touch.clientX;
      state.touchJoystick.prevY = touch.clientY;

      // Convert to joystick input
      const joyX = dx / 100; // scale
      const joyY = dy / 100;
      // Map to movement
      state.controls.moveForward = joyY > 0.1;
      state.controls.moveBackward = joyY < -0.1;
      state.controls.moveLeft = joyX < -0.1;
      state.controls.moveRight = joyX > 0.1;
      event.preventDefault();
    }
  }

  function _onTouchEnd(event) {
    state.touchJoystick = null;
    state.controls.moveForward = false;
    state.controls.moveBackward = false;
    state.controls.moveLeft = false;
    state.controls.moveRight = false;
  }

  function _onWindowResize() {
    if (!state.initialized) return;
    const width = state.container.clientWidth;
    const height = state.container.clientHeight;

    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();

    state.renderer.setSize(width, height);
    // Minimap size remains fixed in pixels
  }

  /* ─── ANIMATION LOOP ───────────────────────────────────────────────── */

  function _animate() {
    state.animationFrame = requestAnimationFrame(_animate);

    const delta = state.clock.getDelta(); // seconds

    // Update room streaming based on player position
    _updateRoomStreaming();

    // Update player movement and collision
    _updatePlayer(delta);

    // Update minimap
    _updateMinimap();

    // Render main scene
    state.renderer.render(state.scene, state.camera);

    // Render minimap to its render target
    state.minimapRenderer.render(state.minimapScene, state.minimapCamera);
  }

  function _updateMinimap() {
    if (!state.minimapScene || !state.minimapCamera) return;
    // Update minimap camera to follow player (top-down)
    state.minimapCamera.position.set(
      state.player.position.x,
      100, // fixed height
      state.player.position.z
    );
    // Keep rotation looking down
    state.minimapCamera.rotation.set(-Math.PI / 2, 0, 0);
    // Optionally rotate minimap to match player yaw for forward-up
    // state.minimapCamera.rotation.z = -state.player.yaw;
  }

  /* ─── RETURN PUBLIC API ─────────────────────────────────────────────── */

  return {
    init,
    dispose,
    getDelta,
    getScene,
    getCamera,
    getRenderer
  };
})();