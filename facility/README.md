# OmicsLab Facility

The facility is an isolated React Three Fiber application for the connected
genomics learning environment. It is intentionally separate from the legacy
vanilla Lab while the new experience is developed milestone by milestone.

## Development

```powershell
Set-Location facility
npm install
npm run dev
```

Run `npm run typecheck` for TypeScript validation and `npm run build` for the
production bundle.

## Embedding

The public integration boundary is `createFacilityBridge()` from
`src/bridge.ts`. The bridge exposes `mount`, `pause`, `resume`, `dispose`, and
`saveProgress`; application code should not import the facility store directly.
