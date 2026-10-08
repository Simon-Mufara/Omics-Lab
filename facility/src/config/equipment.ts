import type { EquipmentDefinition } from '../domain/types';

export const EQUIPMENT: EquipmentDefinition[] = [
  { id: 'intake-terminal', roomId: 'reception', label: 'Sample intake terminal', kind: 'intake-desk', position: [-2.9, 0, -2.2], prompt: 'Scan the sample barcode at intake.' },
  { id: 'label-printer', roomId: 'reception', label: 'Barcode label printer', kind: 'workstation', position: [2.7, 0, -2.2], scale: 0.8, prompt: 'Print a chain-of-custody label.' },
  { id: 'collection-chair', roomId: 'collection', label: 'Collection chair', kind: 'chair', position: [-2.8, 0, 1.8], prompt: 'Prepare the collection station.' },
  { id: 'phlebotomy-cart', roomId: 'collection', label: 'Phlebotomy cart', kind: 'workstation', position: [2.4, 0, -2.1], prompt: 'Check sterile collection supplies.' },
  { id: 'centrifuge-a', roomId: 'processing', label: 'Refrigerated centrifuge', kind: 'centrifuge', position: [-3.1, 0, -2.1], prompt: 'Balance tubes before centrifugation.' },
  { id: 'aliquot-bench', roomId: 'processing', label: 'Aliquoting bench', kind: 'clean-bench', position: [2.7, 0, 1.9], prompt: 'Aliquot the sample into barcoded tubes.' },
  { id: 'ultra-freezer', roomId: 'biobank', label: '-80°C ultra-low freezer', kind: 'freezer', position: [-2.5, 0, -2.1], prompt: 'Retrieve the sample from the -80°C inventory.' },
  { id: 'inventory-terminal', roomId: 'biobank', label: 'Biobank inventory terminal', kind: 'workstation', position: [2.3, 0, 1.9], prompt: 'Verify freezer location and custody.' },
  { id: 'clean-bench', roomId: 'pre-pcr', label: 'PCR clean bench', kind: 'clean-bench', position: [-2.2, 0, -2.1], prompt: 'Work inside the clean bench to prevent contamination.' },
  { id: 'pre-pcr-thermocycler', roomId: 'pre-pcr', label: 'Pre-PCR thermocycler', kind: 'thermocycler', position: [2.2, 0, 1.8], prompt: 'Load the pre-amplification plate.' },
  { id: 'library-thermocycler', roomId: 'library-prep', label: 'Library thermocycler', kind: 'thermocycler', position: [-3.1, 0, -2.1], prompt: 'Run the library amplification program.' },
  { id: 'library-bench', roomId: 'library-prep', label: 'Library prep bench', kind: 'clean-bench', position: [2.7, 0, 1.9], prompt: 'Prepare indexed libraries on the bench.' },
  { id: 'sequencer', roomId: 'sequencing', label: 'Short-read sequencer', kind: 'sequencer', position: [-2.4, 0, -2.1], prompt: 'Load the flow cell and start the run.' },
  { id: 'run-monitor', roomId: 'sequencing', label: 'Run monitoring console', kind: 'workstation', position: [2.6, 0, 1.8], prompt: 'Review run quality metrics.' },
  { id: 'analysis-workstation', roomId: 'bioinformatics', label: 'Analysis workstation', kind: 'workstation', position: [-3.4, 0, -2.1], prompt: 'Open the quality-control dashboard.' },
  { id: 'genomics-server', roomId: 'bioinformatics', label: 'Genomics compute server', kind: 'workstation', position: [2.6, 0, 1.8], scale: 1.1, prompt: 'Check the queued analysis jobs.' },
];
