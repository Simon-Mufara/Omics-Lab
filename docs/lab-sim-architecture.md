# OmicsLab 3D Genomics Facility

## Architecture and phased build plan

**Status:** Proposal — awaiting approval  
**Scope:** Replace the current drag-and-drop lab presentation with a connected, explorable 3D training facility.  
**Implementation rule:** Do not begin implementation until this plan is approved and the open decisions in [What is needed before build](#what-is-needed-before-build) are answered.

---

## 1. Executive summary

OmicsLab should become a persistent, explorable genomics facility rather than a collection of isolated visual exercises. A learner enters at reception, receives or collects a sample, transports it through processing and molecular rooms, loads a sequencer, and interprets the resulting data in the bioinformatics office. The sample, its custody history, temperature history, quality, and mistakes are persistent state that drives the facility, staff, procedures, scoring, and final result.

The simulation will use a **separate React Three Fiber application embedded in the existing OmicsLab shell**, rather than converting the entire current application to React. The existing static application remains responsible for navigation, authentication, research/learning pages, dashboard integration, and the accessible non-3D fallback. The 3D facility owns the real-time render loop and simulation state behind a narrow integration API.

The design prioritises:

- scientific correctness over visual spectacle;
- learner agency over automatic simulation;
- one connected facility over separate room scenes;
- data-driven procedures and equipment over hard-coded interactions;
- graceful degradation on mobile and unsupported devices;
- measurable performance and accessibility budgets;
- resumable progress and inspectable error explanations.

The first release should use placeholder geometry and a small number of fully convincing interactions. High-fidelity assets and additional procedures should be added only after the facility shell, state model, and performance budgets are proven.

---

## 2. Current repository fit and proposed boundary

### Existing relevant surfaces

The repository currently contains:

- a Vite-served static OmicsLab application with hash/path routing;
- existing lab, workflow, analysis, dataset, notebook, research, and dashboard modules;
- an existing `DNAHelix`/DNA visualisation surface that can be reused for the molecule view;
- existing authentication and database abstractions;
- a separate React Hub application under `hub/`;
- no current React Three Fiber, drei, Rapier, Zustand, or 3D asset pipeline dependency in the root application;
- some existing facility and interaction experiments that must be audited before reuse.

### Proposed application boundary

Create a new package under `facility/` (or a dedicated workspace if the team prefers), built with:

- React;
- `@react-three/fiber`;
- `@react-three/drei`;
- `@react-three/rapier`;
- Zustand;
- a tested navmesh/pathfinding library;
- TypeScript for simulation contracts and configuration.

The static shell loads the facility lazily only when the learner opens the 3D lab. It passes a signed-in user/session reference and receives progress events through a versioned bridge:

```ts
type FacilityBridge = {
  mount(container: HTMLElement, options: FacilityLaunchOptions): Promise<void>;
  pause(): void;
  resume(): void;
  dispose(): void;
  saveProgress(): Promise<void>;
  getAccessibleFallback(): HTMLElement;
};
```

The bridge must not expose internal React state to the legacy application. The facility emits domain events such as `sample.updated`, `procedure.completed`, `mistake.logged`, `mission.completed`, and `quality.changed`.

### Non-goals for the first implementation

- Building a fully photorealistic hospital-grade facility before validating the learning loop.
- Replacing all existing 2D lab tools.
- Simulating clinical diagnosis or giving medical advice.
- Treating visual fidelity as proof of scientific accuracy.
- Copying proprietary equipment models, user interfaces, textures, manuals, or trademarks without permission.
- Making venipuncture training a substitute for supervised clinical training.

---

## 3. Facility world and navigation

### Connected layout

The first facility layout is a continuous loop with a clear sample flow and a service route:

1. Reception and Sample Intake
2. Phlebotomy and Collection
3. Sample Processing
4. -80°C Freezer and Biobank Corridor
5. Pre-PCR Clean Room
6. Library Preparation
7. Sequencing Suite
8. Bioinformatics and Analysis Office

Each room has:

- a primary learner entrance and exit;
- an equipment/service access route where appropriate;
- signage visible from the corridor;
- room metadata (`id`, `name`, `purpose`, `requiredPpe`, `allowedSampleStates`);
- a loading boundary and neighbouring-room references;
- an accessible 2D representation;
- a safe spawn point and recovery point.

### Doors, corridors, and gowning

- Doors are authored as reusable animated components with open, closing, locked, and blocked states.
- Automatic opening is allowed for ordinary doors; clean-room doors require an explicit interaction.
- Airlocks are two-door state machines that prevent both doors being open simultaneously.
- Gowning stations check lab coat, gloves, and hairnet before granting clean-room access.
- PPE state is visible on the player avatar/hands and recorded in the procedure log.
- Missing PPE produces an explanation and a recoverable warning, not a punitive dead end.

### Player modes

Desktop:

- first-person default;
- optional third-person toggle;
- WASD movement, mouse look, sprint/slow-walk, interact, crouch where needed;
- keyboard-only navigation mode with focusable interaction targets.

Mobile:

- virtual joystick;
- touch look area;
- context action button;
- simplified interaction targeting;
- adaptive quality profile.

Accessibility and fallback:

- reduced-motion mode disables head bob, door easing exaggeration, and non-essential camera effects;
- subtitles are available for all spoken dialogue;
- colour is never the only state indicator;
- unsupported devices receive a non-3D procedure workspace with the same sample/procedure state machine and scoring;
- learners can pause the simulation without losing state.

### Minimap and orientation

The minimap displays:

- current room and room labels;
- player position and facing direction;
- sample/objective markers;
- accessible route and blocked/locked doors;
- NPCs only when the learner enables staff visibility;
- a toggle for simplified high-contrast mode.

---

## 4. Scene graph and room streaming

### Scene graph

```text
FacilityRoot
├── FacilityEnvironment
│   ├── StaticShell
│   ├── RoomPortals
│   ├── Signage
│   └── LightingZones
├── StreamedRooms
│   ├── ReceptionIntake
│   ├── Collection
│   ├── Processing
│   ├── Biobank
│   ├── PrePCR
│   ├── LibraryPrep
│   ├── Sequencing
│   └── Bioinformatics
├── SimulationEntities
│   ├── Player
│   ├── Samples
│   ├── Equipment
│   ├── Items
│   └── NPCs
├── InteractionLayer
├── MissionLayer
├── AudioLayer
├── AccessibilityLayer
└── DebugOverlay
```

### Streaming policy

- The shell, current room, and adjacent portal geometry load first.
- Distant rooms load on demand through `RoomStreamManager`.
- A room has explicit lifecycle states: `unloaded`, `loading`, `ready`, `active`, `unloading`, `failed`.
- Simulation entities are not destroyed when their room unloads; they are represented by lightweight logical state and rehydrated when visible.
- A sample carried by an NPC can travel through unloaded rooms without requiring those rooms to remain rendered.
- Loading uses a non-blocking transition overlay with room name and objective context.
- A failed room load exposes a retry and accessible fallback option instead of freezing the application.

### Room configuration

Rooms are configuration-first:

```ts
type RoomDefinition = {
  id: string;
  label: string;
  asset: string;
  neighbours: string[];
  spawnPoints: SpawnPoint[];
  portals: PortalDefinition[];
  requiredPpe?: PpeRequirement;
  equipment: EquipmentPlacement[];
  allowedSampleStates: SampleState[];
  audioProfile: string;
};
```

Adding a new room must not require changes to the core renderer or procedure engine.

---

## 5. Interaction and procedure state machine

### Interaction model

Interactions use raycasts and semantic interaction descriptors:

- `lookAt`: show contextual prompt;
- `tap/click`: select or pick up;
- `hold`: continuous action with progress and cancellation;
- `place`: validate a target socket or surface;
- `use`: execute equipment action;
- `scan`: open scanner flow;
- `inspect`: show explanatory information;
- `talk`: open NPC guidance.

Every interaction defines:

- required item/tool;
- allowed distance and angle;
- target type;
- PPE requirement;
- time/hold duration;
- success conditions;
- recoverable mistakes;
- resulting sample and notebook events;
- audio, animation, and haptic feedback.

### Held items and physics

- Rapier handles dynamic tubes, racks, pipettes, tips, and other small objects.
- Held items use a constrained hand anchor, not teleporting snap-to-cursor behaviour.
- Logical placement sockets are used only when the learner places an item into a valid rack, machine, or tray.
- Dropped or knocked-over objects remain in the world and can create consequences.
- Hands and held-item orientation are visible in first person; the third-person avatar mirrors the action.
- Physics detail is tiered: full simulation for active items, simplified colliders for background equipment.

### Procedure state machine

Procedures are explicit finite state machines with transitions guarded by context:

```text
Procedure
├── prerequisites
├── states
│   ├── entry actions
│   ├── permitted interactions
│   ├── timing/technique guards
│   ├── mistake transitions
│   └── exit actions
├── scoring rules
├── sample mutations
├── notebook events
└── recovery paths
```

Example pipetting procedure:

```text
select pipette
→ set volume
→ attach sterile tip
→ aspirate to first stop
→ enter source zone
→ aspirate correct volume
→ move to destination
→ dispense to second stop
→ blow out
→ eject tip
→ dispose/reuse according to procedure
```

Incorrect actions produce specific consequences:

- no tip or reused tip: contamination risk;
- wrong plunger stop: volume accuracy penalty;
- crossing sample zones: cross-contamination event;
- missing tip change: affected sample quality;
- timing outside tolerance: reduced yield or failed QC.

The learner can recover where scientifically reasonable. The notebook explains what happened, why it matters, and what corrective action is appropriate.

### Lab-notebook event model

```ts
type LabEvent = {
  id: string;
  timestamp: number;
  actor: 'player' | 'npc' | 'system';
  roomId: string;
  sampleId?: string;
  procedureId?: string;
  action: string;
  outcome: 'success' | 'warning' | 'mistake' | 'recovery';
  explanation: string;
  evidence?: Record<string, unknown>;
};
```

---

## 6. Samples, LIMS, and chain of custody

Samples are first-class entities and are never represented only by a mesh:

```ts
type Sample = {
  id: string;
  barcode: string;
  type: 'whole-blood' | 'saliva' | 'sputum' | 'tissue' | 'dna' | 'library';
  volumeUl: number;
  temperatureC: number;
  temperatureHistory: TemperatureReading[];
  containerId: string;
  state: SampleState;
  quality: QualityState;
  location: LocationRef;
  handlerId?: string;
  custody: CustodyEvent[];
  labels: LabelState;
};
```

### Scanner and tablet

- Scanner raycasts a barcode and confirms sample identity with audio, visual, and haptic feedback.
- Tablet shows queue, current owner, location, next valid procedure, temperature, and warnings.
- Scanning the wrong sample is a logged mistake, not an invisible failure.
- The chain-of-custody view is accessible outside the 3D scene.
- Sample IDs are deterministic for resumed sessions and safe to export for training reports.

### State-driven world

Sample state controls:

- which procedures are available;
- which equipment accepts the sample;
- NPC schedule eligibility;
- storage requirements;
- sequencing quality;
- final score and report.

The simulation must prevent impossible state changes through the domain layer, not only through UI affordances.

---

## 7. NPC staff and scheduling

### NPC architecture

NPCs are lightweight agents with:

- identity, role, PPE, appearance seed;
- current schedule task;
- navigation target;
- held sample/item;
- animation state;
- dialogue context;
- collision/avoidance priority.

Roles in the first release:

- reception technician;
- phlebotomist;
- processing technician;
- molecular technician;
- sequencing technician;
- bioinformatics analyst.

### Navigation

- Bake a navmesh per room and connect navmesh islands through portal links.
- Use a pathfinding adapter so the engine can switch between `three-pathfinding` and another tested implementation without changing NPC logic.
- Dynamic obstacle reservations prevent staff from blocking narrow doors or equipment.
- NPCs open ordinary doors, wait for airlocks, and respect clean-room PPE.
- Player and sample-carrying NPCs receive higher path priority than ambient traffic.

### Schedule system

Schedules are event-driven rather than scripted solely by frame time:

```ts
type StaffTask = {
  id: string;
  role: string;
  trigger: QueueTrigger;
  source: LocationRef;
  destination: LocationRef;
  requiredSampleState?: SampleState;
  action: string;
  durationMs: number;
  priority: number;
};
```

The scheduler:

1. reads the sample queue and facility events;
2. assigns eligible staff;
3. reserves samples/equipment;
4. creates a route and action sequence;
5. emits observable progress;
6. retries or escalates blocked tasks.

Ambient NPC density scales by quality tier:

- low: essential staff only;
- medium: essential staff plus a few ambient agents;
- high: full background movement with capped animation and physics cost.

“Ask a colleague” opens contextual help based on room, objective, sample state, and the learner’s recent errors. Hints are optional and affect assessment scoring only when enabled by the selected mode.

---

## 8. Equipment and asset strategy

### Modular equipment contract

Each equipment asset has:

- visual model and material variants;
- collision/interaction proxies;
- named sockets;
- animation clips;
- audio profile;
- procedure adapters;
- accessible description;
- configuration schema.

```ts
type EquipmentDefinition = {
  id: string;
  category: string;
  model: string;
  sockets: SocketDefinition[];
  interactions: InteractionDefinition[];
  procedures: string[];
  qualityMetrics?: string[];
};
```

### Required equipment groups

The implementation will cover the requested equipment in staged slices:

- collection: chair, tourniquet, swab, butterfly/holder representation, vacutainers, sharps bin, label printer;
- processing: biosafety cabinet, centrifuge, vortexer, heat block, pipettes, tips, racks;
- molecular: thermocycler, Qubit/NanoDrop representation, magnetic-bead rack, Bioanalyzer/TapeStation representation;
- sequencing: Illumina-class visual approximation, flow cell, reagent cartridge, touchscreen, waste container;
- storage: -80°C freezer, racks/boxes, alarms, LN2 dewar.

The first build must label visual approximations clearly and must not imply certification or manufacturer endorsement.

### Source versus procedural construction

Procedural geometry:

- walls, floors, ceilings, doors, counters, cabinets, racks, simple benches, signage, collision volumes;
- basic tubes, tips, boxes, trays, and placeholder equipment;
- debug and accessible representations.

Source or artist-built assets:

- character base meshes and animations;
- high-quality pipettes, centrifuge, sequencer, freezer, biosafety cabinet, and patient chair;
- material libraries and detailed decals;
- audio recordings and ambience.

### Asset licences and provenance

Every external asset must have a recorded entry in a future `docs/asset-list.md` containing:

- source URL and creator;
- licence and attribution text;
- modification status;
- version/download date;
- intended use;
- whether redistribution in the deployed build is permitted.

Preferred sources:

- original OmicsLab procedural assets;
- CC0 assets;
- CC-BY assets with attribution shipped in an about/licences panel;
- commercially licensed assets with redistribution rights.

Do not use CC-BY-NC for a potentially commercial deployment without explicit legal approval. Do not scrape manufacturer websites or reuse proprietary UI screenshots. Real equipment should be used as functional reference only unless a licence permits the model and branding.

### Rendering quality

- PBR materials with consistent real-world scale;
- baked lighting for static shell geometry;
- limited dynamic lights for active equipment and alarms;
- reflection probes for steel/glass zones;
- restrained bloom and volumetric light;
- liquid shader used only where it improves interpretation;
- nucleotide accent colours follow the existing design system but remain colourblind-safe through icons, labels, and patterns.

---

## 9. Learning layer and mission design

### Mission

First mission:

> Process this patient sample to a sequencing run and produce a defensible QC record.

Objectives are explicit and independently completable:

- check in and identify the sample;
- collect or receive the correct tubes;
- label and scan;
- process and balance;
- maintain cold chain;
- enter clean room with PPE;
- prepare library;
- load sequencer;
- review quality readout;
- document decisions.

### Modes

Guided:

- coach panel;
- optional highlighted targets;
- contextual hints;
- forgiving timing;
- full explanations.

Practice:

- fewer prompts;
- recoverable mistakes;
- unlimited attempts;
- detailed post-step feedback.

Assessment:

- timed;
- no automatic target highlighting;
- limited hints;
- scored technique, order, contamination avoidance, documentation, and final QC.

### Scoring

Scores are decomposed, not opaque:

- technique;
- sequence/order;
- sample integrity;
- contamination avoidance;
- cold-chain control;
- PPE and safety;
- documentation;
- final sequencing quality.

Results integrate with the existing progress/badge/dashboard surfaces through an adapter, not direct mutation from the renderer.

### Tube-to-molecule transition

The microscope/molecule action:

1. freezes the current procedure state;
2. transitions from the selected tube/sample to a microscope-style view;
3. reuses the existing DNA helix visualisation where compatible;
4. displays the relevant molecule/state explanation;
5. returns to the exact physical location and camera state.

The molecule view is explanatory, not a claim that the simulation is resolving individual molecules in real time.

---

## 10. Persistence, integration, and security

### Save/resume

Persist:

- mission progress;
- current room and safe recovery point;
- player mode and accessibility settings;
- sample states and custody logs;
- procedure state machines;
- lab notebook events;
- scores and completion badges;
- asset/config version.

Use local-first persistence for immediate recovery and authenticated cloud sync for cross-device progress. Cloud records must be versioned and conflict-aware. Never store secrets in the client or in sample content.

### Integration events

The facility emits:

- `facility.started`;
- `room.entered`;
- `sample.scanned`;
- `procedure.started`;
- `procedure.completed`;
- `mistake.logged`;
- `sample.updated`;
- `mission.completed`;
- `score.updated`;
- `facility.fallback.opened`.

The shell may subscribe to these events for dashboard, notebook, analytics, and badge integration.

### Privacy and safety

- Training samples are synthetic by default.
- No real patient-identifying information is required.
- Any imported dataset is treated as training data and must pass existing data-policy checks.
- Clinical-looking procedures include a clear educational-use disclaimer.
- Assessment data is user-scoped and deletable.

---

## 11. Performance architecture and budgets

Targets:

- desktop: 60 fps on the supported baseline;
- mobile: 30 fps on the supported baseline;
- first paint: no 3D bundle required on unrelated routes;
- facility initial shell: progressive loading with visible readiness feedback;
- input-to-prompt response: under 100 ms on baseline hardware;
- room transition: no main-thread stall longer than 100 ms;
- memory: room streaming must release distant room render resources.

Techniques:

- lazy-load the facility bundle;
- KTX2 textures;
- Draco or meshopt geometry compression;
- instancing for repeated racks, tubes, lights, and signage;
- LOD tiers per asset;
- occlusion culling by room/portal;
- capped shadow casters;
- object pooling for particles and repeated effects;
- fixed-step or capped physics updates;
- simplified NPC animation at distance;
- adaptive quality based on frame-time sampling;
- no first-paint dependency on remote assets.

Performance telemetry must record anonymised frame-time buckets, quality tier, device class, and room—not raw user content.

---

## 12. Testing and self-review

### Automated tests

- configuration schema validation;
- procedure transition tests for correct and incorrect sequences;
- sample state and chain-of-custody invariants;
- persistence migration and resume tests;
- scoring determinism tests;
- accessible fallback parity tests;
- bridge integration tests;
- lint, type-check, build, and route validation.

### Browser and device tests

- Playwright smoke test for facility launch, room transition, interaction prompt, save/resume, and fallback;
- keyboard-only test;
- reduced-motion test;
- mobile viewport test;
- low/medium/high quality profile test;
- offline/resume test.

### Visual review loop

At the end of every phase:

1. capture screenshots from every implemented room;
2. list the five least realistic or least usable aspects;
3. fix them;
4. capture the same views again;
5. record what changed and any remaining compromise.

Screenshots are review artifacts, not a substitute for interaction tests.

### Scientific review

Before releasing collection, processing, or sequencing procedures, have a lab-trained reviewer check:

- order of draw;
- PPE and biosafety assumptions;
- centrifuge balancing;
- contamination controls;
- cold-chain constraints;
- library preparation logic;
- sequencing setup and QC terminology.

---

## 13. Phased milestones and acceptance criteria

### Milestone 0 — Decision, audit, and foundation

Deliverables:

- approved architecture;
- current facility/interaction audit;
- package/workspace decision;
- initial `docs/asset-list.md`;
- dependency and bundle budget;
- scientific review contact.

Acceptance:

- no implementation begins without approval;
- all reused code/assets have an owner and licence status;
- baseline route/build checks pass;
- a written decision exists on whether the facility lives in the root app or a dedicated package.

### Milestone 1 — Facility shell

Deliverables:

- connected placeholder facility;
- collision;
- first/third-person controller;
- desktop and mobile input;
- doors, corridors, signage, minimap;
- room streaming;
- lighting pass;
- accessible fallback shell.

Acceptance:

- learner can walk from Intake to Bioinformatics and back;
- doors and airlocks behave correctly;
- clean-room entry is blocked until PPE is equipped;
- no room transition freezes the UI;
- screenshots from all rooms are reviewed and iterated twice;
- desktop and mobile meet their frame-rate targets on the agreed baseline devices.

### Milestone 2 — Interaction and physics core

Deliverables:

- raycast prompts;
- held items and visible hands;
- Rapier object physics;
- hold-to-use actions;
- procedure state machine;
- error consequences and notebook log;
- pipetting exercise.

Acceptance:

- learner can attach a tip, aspirate, dispense, eject, and change tips;
- wrong sequence creates an explainable event;
- dropped objects remain recoverable;
- procedure state survives pause/resume;
- the pipetting exercise passes automated transition tests and a manual realism review.

### Milestone 3 — Samples and tracking

Deliverables:

- sample model;
- barcodes;
- scanner and tablet;
- custody/temperature logs;
- fully interactive Intake and Collection rooms;
- venipuncture training representation.

Acceptance:

- every sample has a stable ID and visible custody history;
- wrong scan and wrong tube order are recorded;
- collection requires labelling and sharps disposal;
- order-of-draw rules are configurable and scientifically reviewed;
- accessible fallback provides the same sample workflow.

### Milestone 4 — Staff NPCs

Deliverables:

- animated staff roles;
- navmesh/pathfinding;
- sample-queue scheduler;
- door/PPE behaviour;
- crowd-density quality tiers;
- contextual colleague help.

Acceptance:

- a technician collects, carries, and delivers a sample between at least three rooms;
- NPCs avoid collisions and blocked portals;
- schedule changes in response to sample queue events;
- low-quality mode caps NPC count and preserves interaction performance;
- staff movement is never required for the learner to complete a mission.

### Milestone 5 — Processing through sequencing

Deliverables:

- Processing, Pre-PCR, Library Prep, and Sequencing rooms;
- equipment interaction adapters;
- freezer and cold-chain behaviour;
- sequencing touchscreen;
- flow cell/cartridge loading;
- run progress and quality readout.

Acceptance:

- learner can complete one sample-to-sequencer mission;
- earlier technique affects final QC within documented bounds;
- sequencing UI validates required loading and setup;
- quality readout is deterministic for a saved run;
- equipment is visually labelled as an educational approximation where applicable.

### Milestone 6 — Learning layer and polish

Deliverables:

- Guided, Practice, Assessment modes;
- coach and hint system;
- decomposed scoring;
- dashboard/badge integration;
- molecule transition;
- performance and accessibility pass;
- final asset/licence report.

Acceptance:

- all three modes have distinct prompt/scoring behaviour;
- results resume correctly across sessions;
- molecule view returns to the same physical task;
- accessibility fallback covers the complete mission;
- before/after performance metrics are documented;
- scientific reviewer signs off on the released procedures.

---

## 14. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Scope becomes an unfinishable AAA-style simulation | High | Build one complete vertical slice before expanding rooms/assets |
| Current app has no R3F/Rapier foundation | High | Isolate a lazy-loaded facility package and prove bundle cost early |
| Mobile performance is poor | High | Device tiers, room streaming, instancing, reduced NPC/physics mode |
| Scientific procedure is visually plausible but wrong | Critical | Configuration-driven rules plus lab-trained review before release |
| Proprietary equipment assets or branding create legal exposure | High | Procedural/commissioned assets, provenance ledger, no scraped models |
| Physics makes learning frustrating | Medium | Constrain only when placing valid targets; provide recoverable reset points |
| NPCs distract or block learners | Medium | Priority navigation, collision reservations, optional crowd visibility |
| Cloud sync conflicts lose progress | High | Versioned event log, local-first writes, conflict resolution and migrations |
| 3D excludes keyboard, low-end, or assistive users | Critical | Accessible fallback shares the same domain state and scoring |
| Existing legacy simulator behaviour regresses | High | Feature flag, route isolation, targeted regression tests |
| Browser/WebGL support varies | Medium | Capability detection, WebGL2 fallback, non-3D accessible path |
| Scope of clinical collection training is unsafe | Critical | Educational disclaimer, no claim of clinical qualification, expert review |

---

## 15. What is needed before build

Please approve or answer these decisions:

1. **Architecture:** approve a new lazy-loaded React Three Fiber facility package rather than rewriting the existing static app.
2. **Target devices:** provide the minimum desktop GPU/browser and the minimum mobile devices that must meet the performance target.
3. **Deployment:** confirm whether the facility must run on the current static/Vercel deployment or may use a separate facility build/CDN.
4. **Authentication:** confirm that existing Clerk/Supabase identity should own save/resume progress.
5. **Scientific reviewer:** identify a lab-trained reviewer for collection, molecular, and sequencing procedures.
6. **Asset policy:** confirm whether paid asset licences or commissioned models are available; otherwise use procedural geometry and permissive licences only.
7. **Branding:** confirm whether manufacturer names/logos should be omitted in favour of “Illumina-class” and generic educational equipment.
8. **Initial vertical slice:** choose whether Milestone 1 should end at the shell only or include one small interactive sample/pipette proof immediately after the shell.
9. **Existing tools:** identify which current facility/interaction experiments are authoritative and which should be retired.
10. **Release strategy:** approve a feature flag/beta route so the existing lab remains available during development.

---

## 16. Approval gate

No code, dependency installation, asset download, or scene construction should start until the owner explicitly approves this architecture and resolves the decisions above.

After approval, begin with Milestone 0, then implement only Milestone 1. At the end of each milestone, provide:

- changed files and package changes;
- screenshots and the two-pass self-review;
- test and performance results;
- known compromises;
- a request for approval before expanding scope.
