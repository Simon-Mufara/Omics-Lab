# Technology Stack Clarification

Based on my audit of the OmicsLab project, this is a **vanilla JavaScript implementation**, not a React project. Here's the evidence:

## Current Tech Stack (Verified)
- **Framework**: Pure vanilla JavaScript with IIFE (Immediately Invoked Function Expression) modules
- **Module Pattern**: All JS files in `js/` follow the pattern: `window.OmicsLab = window.OmicsLab || {}; OmicsLab.ModuleName = (function () { ... })();`
- **No React Dependencies**: package.json shows no react, react-dom, or related packages
- **No JSX**: No .jsx, .tsx files, or JSX syntax anywhere in the codebase
- **Build System**: Vite is used for dev server and production builds, but configured for vanilla JS, not React
- **Entry Point**: index.html directly loads JS files via `<script>` tags

## CLAUDE.md Guidance (From My Earlier Documentation)
In the CLAUDE.md I created, I specifically noted:
> "- 3D uses Three.js via React Three Fiber + drei (or vanilla Three.js if the project isn't React), lazy-loaded so it never blocks first paint"

This guidance was based on detecting that OmicsLab is **not** a React project, so the recommendation was to use **vanilla Three.js**.

## Regarding the Request for React Three Fiber
The request to "Build a reusable `<DNAHelix />` 3D component with React Three Fiber" would require:
1. Adding React and React DOM as dependencies
2. Adding @react-three/fiber and three.js
3. Converting the relevant parts of the codebase to use React
4. Setting up JSX/TSX transpilation in Vite
5. Managing state and effects with React hooks

This would represent a significant architectural change to the project that would:
- Affect the offline-first nature (React hydrates client-side)
- Increase bundle size substantially
- Require retraining/maintaining the codebase in a new paradigm
- Potentially break the current IIFE module pattern used throughout

## Recommended Path Forward
For consistency with the existing codebase and architecture, I recommend creating a **vanilla Three.js DNA helix component** that:
- Follows the existing IIFE module pattern (`window.OmicsLab.DNAHelix = (function () { ... })();`)
- Is lazy-loaded when needed (consistent with other 3D-like visualizations in the project)
- Uses InstancedMesh for performance with long sequences
- Implements the requested features (tooltips, controls, quality tiers, etc.)
- Provides a WebGL fallback for unsupported browsers
- Can be dropped into existing pages like the hero section or as a standalone tool

This approach maintains project consistency while delivering the requested 3D visualization capability.

If there's a specific reason you'd like to migrate to React (team expertise, future plans, etc.), we should discuss that separately as it would be a larger architectural decision.