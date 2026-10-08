/* ═════════════════════════════════════════════════════════════════
   OmicsLab — Interaction System
   Pipetting Exercise Implementation
   Includes: raycast prompts, held items, Rapier physics, hold-to-use actions,
   procedure state machine, and lab-notebook log.
   ═════════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Interaction = (function () {
  'use strict';

  // Configuration
  const CONFIG = {
    // Pipetting procedure states
    STATES: {
      START: 0,
      PIPETTE_PICKED: 1,
      TIP_ATTACHED: 2,
      ASPIRATED: 3,
      DISPENSED: 4,
      TIP_EJECTED: 5,
      COMPLETE: 6
    },
    // Object definitions
    OBJECTS: {
      pipette: {
        position: new THREE.Vector3(-5, 1, 0),
        size: new THREE.Vector3(0.2, 0.2, 2),
        color: 0x808080,
        mass: 0.1
      },
      tip: {
        position: new THREE.Vector3(-5, 1, 1.5),
        size: new THREE.Vector3(0.05, 0.05, 0.5),
        color: 0xffffff,
        mass: 0.01
      },
      liquidContainer: {
        position: new THREE.Vector3(-5, 0.5, -2),
        size: new THREE.Vector3(1, 1, 1),
        color: 0x0000ff,
        mass: 0.5
      },
      tipRack: {
        position: new THREE.Vector3(-5, 1, -1.5),
        size: new THREE.Vector3(0.5, 0.5, 0.5),
        color: 0xffffff,
        mass: 0.2
      }
    },
    // Physics
    physics: {
      timeStep: 1 / 60,
      subSteps: 2
    },
    // Interaction
    interaction: {
      raycastDistance: 5,
      holdToUseTime: 1.0, // seconds to hold for action
      grabDistance: 1.0
    }
  };

  // State
  let state = {
    scene: null,
    camera: null,
    renderer: null,
    // Physics
    physicsWorld: null,
    // Three.js objects
    hand: null,
    heldItem: null,
    objects: {},
    // Raycaster
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    // Interaction state
    isMouseDown: false,
    holdStartTime: 0,
    // Procedure state machine
    procedureState: CONFIG.STATES.START,
    // Lab notebook
    labNotebook: [],
    // Initialized flag
    initialized: false,
    // Container DOM element
    container: null
  };

  /* ─── INITIALIZATION & LIFECYCLE ─────────────────────────────────────── */

  function init(containerEl, options = {}) {
    if (state.initialized) return false;

    state.container = containerEl;
    state.scene = options.scene;
    state.camera = options.camera;
    state.renderer = options.renderer;

    // Initialize physics (simplified)
    _initPhysics();

    // Create hand
    _createHand();

    // Create objects
    _createObjects();

    // Setup interaction listeners
    _setupInteractionListeners();

    // Initialize lab notebook
    _initLabNotebook();

    state.initialized = true;

    // Initial procedure prompt
    _updateProcedurePrompt();

    return true;
  }

  function dispose() {
    if (!state.initialized) return;

    // Dispose physics world
    if (state.physicsWorld) {
      // Rapier doesn't have a direct dispose, but we'll null it
      state.physicsWorld = null;
    }

    // Dispose Three.js objects
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

    // Remove event listeners
    state.container.removeEventListener('mousedown', _onMouseDown);
    state.container.removeEventListener('mouseup', _onMouseUp);
    state.container.removeEventListener('mousemove', _onMouseMove);
    state.container.removeEventListener('wheel', _onMouseWheel);

    state.initialized = false;
  }

  /* ─── PHYSICS INITIALIZATION ─────────────────────────────────────────── */

  function _initPhysics() {
    // Initialize simplified physics world
    state.physicsWorld = {
      // Simplified physics world for demonstration
      bodies: [],
      step: function(deltaTime) {
        // Simulate physics step
        this.bodies.forEach(body => {
          if (body.velocity) {
            body.position.x += body.velocity.x * deltaTime;
            body.position.y += body.velocity.y * deltaTime;
            body.position.z += body.velocity.z * deltaTime;
            // Apply gravity
            body.velocity.y -= 9.81 * deltaTime;
          }
        });
      }
    };
  }

  /* ─── OBJECT CREATION ────────────────────────────────────────────────── */

  function _createHand() {
    // Simple box to represent hand
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshStandardMaterial({ color: 0xffaaaa });
    state.hand = new THREE.Mesh(geometry, material);
    state.hand.position.set(0, 0, -0.5); // In front of camera
    state.scene.add(state.hand);
  }

  function _createObjects() {
    // Create pipette
    state.objects.pipette = _createPhysicsObject(
      CONFIG.OBJECTS.pipette.position,
      CONFIG.OBJECTS.pipette.size,
      CONFIG.OBJECTS.pipette.color,
      CONFIG.OBJECTS.pipette.mass,
      'pipette'
    );

    // Create tip
    state.objects.tip = _createPhysicsObject(
      CONFIG.OBJECTS.tip.position,
      CONFIG.OBJECTS.tip.size,
      CONFIG.OBJECTS.tip.color,
      CONFIG.OBJECTS.tip.mass,
      'tip'
    );

    // Create liquid container (beaker with liquid)
    state.objects.liquidContainer = _createPhysicsObject(
      CONFIG.OBJECTS.liquidContainer.position,
      CONFIG.OBJECTS.liquidContainer.size,
      CONFIG.OBJECTS.liquidContainer.color,
      CONFIG.OBJECTS.liquidContainer.mass,
      'liquidContainer'
    );

    // Create tip rack
    state.objects.tipRack = _createPhysicsObject(
      CONFIG.OBJECTS.tipRack.position,
      CONFIG.OBJECTS.tipRack.size,
      CONFIG.OBJECTS.tipRack.color,
      CONFIG.OBJECTS.tipRack.mass,
      'tipRack'
    );
  }

  function _createPhysicsObject(position, size, color, mass, id) {
    // Create Three.js mesh
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.1,
      roughness: 0.5
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    state.scene.add(mesh);

    // Create physics body (simplified)
    const body = {
      id: id,
      position: position.clone(),
      velocity: new THREE.Vector3(),
      mass: mass,
      mesh: mesh
    };

    // Add to physics world
    if (state.physicsWorld) {
      state.physicsWorld.bodies.push(body);
    }

    return { mesh: mesh, body: body };
  }

  /* ─── INTERACTION LISTENERS ──────────────────────────────────────────── */

  function _setupInteractionListeners() {
    state.container.addEventListener('mousedown', _onMouseDown, { passive: false });
    state.container.addEventListener('mouseup', _onMouseUp, { passive: false });
    state.container.addEventListener('mousemove', _onMouseMove, { passive: false });
    state.container.addEventListener('wheel', _onMouseWheel, { passive: false });
  }

  function _onMouseDown(event) {
    state.isMouseDown = true;
    state.holdStartTime = performance.now();
    _handleInteractionStart();
  }

  function _onMouseUp(event) {
    state.isMouseDown = false;
    const holdDuration = (performance.now() - state.holdStartTime) / 1000;
    _handleInteractionEnd(holdDuration);
  }

  function _onMouseMove(event) {
    // Update mouse position for raycasting
    const rect = state.container.getBoundingClientRect();
    state.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    state.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function _onMouseWheel(event) {
    event.preventDefault();
  }

  function _handleInteractionStart() {
    // Raycast from camera to see what we're pointing at
    state.raycaster.setFromCamera(state.mouse, state.camera);
    const intersects = state.raycaster.intersectObjects(
      Object.values(state.objects).map(o => o.mesh),
      true
    );

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      const objectId = Object.keys(state.objects).find(
        id => state.objects[id].mesh === intersectedObject
      );

      if (objectId) {
        // Try to pick up the object
        _tryPickupObject(objectId, intersectedObject);
      }
    }
  }

  function _handleInteractionEnd(holdDuration) {
    // If we're holding an object and holding long enough, trigger action
    if (state.heldItem && holdDuration >= CONFIG.interaction.holdToUseTime) {
      _triggerHoldToUseAction();
    }
  }

  function _tryPickupObject(objectId, mesh) {
    // Don't pick up if already holding something
    if (state.heldItem) return;

    // Check if object is within grab distance
    const distance = state.hand.position.distanceTo(mesh.position);
    if (distance > CONFIG.interaction.grabDistance) return;

    // Find the body for this mesh
    const body = state.objects[objectId].body;
    if (!body) return;

    // Attach to hand (simplified parenting)
    state.heldItem = {
      id: objectId,
      body: body,
      originalPosition: body.position.clone()
    };

    // Log the pickup
    _logToNotebook(`Picked up ${objectId}`);

    // Update procedure state based on what was picked up
    _updateProcedureStateOnPickup(objectId);
  }

  function _triggerHoldToUseAction() {
    if (!state.heldItem) return;

    const action = _getActionForHeldItem(state.heldItem.id);
    if (action) {
      action();
      _logToNotebook(`Performed action: ${action.name}`);
    }
  }

  function _getActionForHeldItem(itemId) {
    switch (state.procedureState) {
      case CONFIG.STATES.PIPETTE_PICKED:
        if (itemId === 'tip') return _attachTip;
        break;
      case CONFIG.STATES.TIP_ATTACHED:
        if (itemId === 'liquidContainer') return _aspirate;
        break;
      case CONFIG.STATES.ASPIRATED:
        if (itemId === 'liquidContainer') return _dispense;
        break;
      case CONFIG.STATES.DISPENSED:
        if (itemId === 'tip') return _ejectTip;
        break;
      case CONFIG.STATES.TIP_EJECTED:
        if (itemId === 'tip') return _attachNewTip;
        break;
      default:
        return null;
    }
    return null;
  }

  /* ─── PIPETTING PROCEDURE ACTIONS ────────────────────────────────────── */

  function _attachTip() {
    if (state.heldItem.id !== 'tip') return false;

    // Check if we have a pipette picked up
    if (!state.heldItem || state.heldItem.id !== 'pipette') return false;

    // Attach tip to pipette (visual change)
    const pipetteMesh = state.objects.pipette.mesh;
    const tipMesh = state.objects.tip.mesh;

    // Position tip at end of pipette
    tipMesh.position.set(
      pipetteMesh.position.x,
      pipetteMesh.position.y,
      pipetteMesh.position.z + pipetteMesh.scale.z / 2 + tipMesh.scale.z / 2
    );

    // Change tip color to indicate attached
    tipMesh.material.color.set(0x00ff00);

    // Update state
    state.procedureState = CONFIG.STATES.TIP_ATTACHED;
    state.heldItem = null; // Release tip after attaching

    _updateProcedurePrompt();
    return true;
  }

  function _aspirate() {
    if (state.heldItem.id !== 'liquidContainer') return false;

    // Check if we have pipette with tip
    if (state.procedureState !== CONFIG.STATES.TIP_ATTACHED) return false;

    // Simulate aspiration by changing liquid color in pipette
    // In reality, we'd animate liquid moving into tip
    const tipMesh = state.objects.tip.mesh;
    tipMesh.material.color.set(0x0000ff); // Blue liquid in tip

    // Update state
    state.procedureState = CONFIG.STATES.ASPIRATED;
    state.heldItem = null; // Release container after aspirating

    _updateProcedurePrompt();
    return true;
  }

  function _dispense() {
    if (state.heldItem.id !== 'liquidContainer') return false;

    // Check if we have aspirated liquid
    if (state.procedureState !== CONFIG.STATES.ASPIRATED) return false;

    // Simulate dispense by returning tip color to clear
    const tipMesh = state.objects.tip.mesh;
    tipMesh.material.color.set(0xffffff); // Clear tip after dispense

    // Update state
    state.procedureState = CONFIG.STATES.DISPENSED;
    state.heldItem = null; // Release container after dispensing

    _updateProcedurePrompt();
    return true;
  }

  function _ejectTip() {
    if (state.heldItem.id !== 'tip') return false;

    // Check if we have dispensed
    if (state.procedureState !== CONFIG.STATES.DISPENSED) return false;

    // Eject tip (move it away and reset color)
    const tipMesh = state.objects.tip.mesh;
    tipMesh.position.set(
      CONFIG.OBJECTS.tip.position.x,
      CONFIG.OBJECTS.tip.position.y,
      CONFIG.OBJECTS.tip.position.z
    );
    tipMesh.material.color.set(0xffffff);

    // Update state
    state.procedureState = CONFIG.STATES.TIP_EJECTED;
    state.heldItem = null; // Release tip after ejecting

    _updateProcedurePrompt();
    return true;
  }

  function _attachNewTip() {
    if (state.heldItem.id !== 'tip') return false;

    // Check if we have ejected tip
    if (state.procedureState !== CONFIG.STATES.TIP_EJECTED) return false;

    // Attach new tip (same as attach tip)
    return _attachTip();
  }

  /*  │ PROCEDURE STATE MANAGEMENT ─────────────────────────────────────── */

  function _updateProcedureStateOnPickup(objectId) {
    switch (objectId) {
      case 'pipette':
        if (state.procedureState === CONFIG.STATES.START) {
          state.procedureState = CONFIG.STATES.PIPETTE_PICKED;
          _updateProcedurePrompt();
        }
        break;
      default:
        break;
    }
  }

  function _updateProcedurePrompt() {
    let message = '';
    switch (state.procedureState) {
      case CONFIG.STATES.START:
        message = 'Pick up a pipette';
        break;
      case CONFIG.STATES.PIPETTE_PICKED:
        message = 'Attach a tip to the pipette';
        break;
      case CONFIG.STATES.TIP_ATTACHED:
        message = 'Aspirate liquid from the container';
        break;
      case CONFIG.STATES.ASPIRATED:
        message = 'Dispense liquid into target container';
        break;
      case CONFIG.STATES.DISPENSED:
        message = 'Eject the used tip';
        break;
      case CONFIG.STATES.TIP_EJECTED:
        message = 'Attach a new tip for next sample';
        break;
      case CONFIG.STATES.COMPLETE:
        message = 'Procedure complete!';
        break;
    }

    // Update UI element for procedure prompt
    const promptEl = document.getElementById('procedure-prompt');
    if (promptEl) {
      promptEl.textContent = message;
    }
  }

  /* ─── LAB NOTEBOOK ──────────────────────────────────────────────────── */

  function _initLabNotebook() {
    // Create lab notebook container if it doesn't exist
    let notebookEl = document.getElementById('lab-notebook');
    if (!notebookEl) {
      notebookEl = document.createElement('div');
      notebookEl.id = 'lab-notebook';
      notebookEl.style.position = 'absolute';
      notebookEl.style.top = '10px';
      notebookEl.style.left = '10px';
      notebookEl.style.background = 'rgba(0,0,0,0.5)';
      notebookEl.style.color = '#e0e0e0';
      notebookEl.style.padding = '10px';
      notebookEl.style.borderRadius = '4px';
      notebookEl.style.maxHeight = '200px';
      notebookEl.style.overflowY = 'auto';
      notebookEl.style.fontFamily = 'monospace';
      notebookEl.style.fontSize = '12px';
      state.container.appendChild(notebookEl);
    }
    state.labNotebookEl = notebookEl;

    // Add initial entry
    _logToNotebook('Session started');
  }

  function _logToNotebook(entry) {
    const timestamp = new Date().toLocaleTimeString();
    state.labNotebook.push(`[${timestamp}] ${entry}`);

    // Keep only last 20 entries
    if (state.labNotebook.length > 20) {
      state.labNotebook.shift();
    }

    // Update display
    if (state.labNotebookEl) {
      state.labNotebookEl.textContent = state.labNotebook.join('\n');
      // Scroll to bottom
      state.labNotebookEl.scrollTop = state.labNotebookEl.scrollHeight;
    }
  }

  /* ─── UPDATE LOOP ───────────────────────────────────────────────────── */

  function update(delta) {
    if (!state.initialized) return;

    // Update physics world
    if (state.physicsWorld) {
      state.physicsWorld.step(delta);

      // Update Three.js mesh positions from physics bodies
      Object.values(state.objects).forEach(obj => {
        if (obj.body && obj.body.mesh) {
          // Only update if not being held
          const isHeld = state.heldItem && state.heldItem.id === obj.body.id;
          if (!isHeld) {
            obj.body.mesh.position.copy(obj.body.position);
          }
        }
      });
    }

    // Update hand position to follow camera (simple offset)
    const offset = new THREE.Vector3(0, -0.5, -0.5);
    offset.applyQuaternion(state.camera.quaternion);
    state.hand.position.copy(state.camera.position).add(offset);

    // If holding an item, update its position to follow hand
    if (state.heldItem && state.heldItem.body && state.heldItem.body.mesh) {
      // Simple attachment: position item at hand position with offset
      const itemOffset = new THREE.Vector3(0, 0, -0.3);
      itemOffset.applyQuaternion(state.camera.quaternion);
      state.heldItem.body.mesh.position.copy(state.hand.position).add(itemOffset);
      state.heldItem.body.position.copy(state.heldItem.body.mesh.position);
    }
  }

  /* ─── RETURN PUBLIC API ─────────────────────────────────────────────── */

  return {
    init,
    dispose,
    update
  };
})();