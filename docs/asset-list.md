# OmicsLab Facility Asset Register

This register is required for every external or commissioned asset used by the 3D facility.
No asset should be added to a production build without a completed entry.

| Asset ID | Description | Source / Creator | Licence | Modification | Redistribution cleared | Intended milestone | Notes |
|---|---|---|---|---|---|---|---|
| `proc-shell-001` | Facility walls, floors, doors, counters, signs | OmicsLab procedural geometry | Original | N/A | Yes | 1 | Built in code; no external licence |
| `proc-labware-001` | Tubes, racks, tips, trays, placeholder equipment | OmicsLab procedural geometry | Original | N/A | Yes | 1-2 | Replace selected placeholders only after review |
| `pending-staff-base` | Technician and phlebotomist characters | Pending source/commission | Pending | Pending | No | 4 | Do not download or ship until approved |
| `pending-equipment-detail` | Detailed pipette, centrifuge, freezer, sequencer models | Pending source/commission | Pending | Pending | No | 5 | Manufacturer references only until cleared |

## Review rules

- Record the source URL, creator, licence text, version/date, and redistribution permission.
- Prefer original procedural geometry, CC0, CC-BY with shipped attribution, or commercial licences with redistribution rights.
- Do not use CC-BY-NC for a commercial deployment without written approval.
- Do not scrape manufacturer models, manuals, screenshots, textures, or logos.
