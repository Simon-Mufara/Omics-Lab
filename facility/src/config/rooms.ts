import type { RoomDefinition } from '../domain/types';

export const ROOMS: RoomDefinition[] = [
  { id: 'reception', label: 'Reception / Sample Intake', position: [0, 0, 0], size: [12, 4, 10], neighbours: ['collection'] },
  { id: 'collection', label: 'Phlebotomy / Collection', position: [15, 0, 0], size: [10, 4, 10], neighbours: ['reception', 'processing'] },
  { id: 'processing', label: 'Sample Processing', position: [29, 0, 0], size: [12, 4, 10], neighbours: ['collection', 'biobank'] },
  { id: 'biobank', label: '-80°C Biobank', position: [43, 0, 0], size: [10, 4, 10], neighbours: ['processing', 'pre-pcr'] },
  { id: 'pre-pcr', label: 'Pre-PCR Clean Room', position: [57, 0, 0], size: [10, 4, 10], neighbours: ['biobank', 'library-prep'], requiredPpe: ['lab-coat', 'gloves', 'hairnet'] },
  { id: 'library-prep', label: 'Library Preparation', position: [71, 0, 0], size: [12, 4, 10], neighbours: ['pre-pcr', 'sequencing'], requiredPpe: ['lab-coat', 'gloves', 'hairnet'] },
  { id: 'sequencing', label: 'Sequencing Suite', position: [86, 0, 0], size: [12, 4, 10], neighbours: ['library-prep', 'bioinformatics'], requiredPpe: ['lab-coat', 'gloves'] },
  { id: 'bioinformatics', label: 'Bioinformatics Office', position: [101, 0, 0], size: [14, 4, 10], neighbours: ['sequencing'] },
];
