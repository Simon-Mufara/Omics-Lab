import type { StaffDefinition } from '../domain/types';

export const STAFF: StaffDefinition[] = [
  { id: 'maya-intake', roomId: 'reception', name: 'Maya', role: 'intake scientist', position: [1.8, 0, 0.8], patrolRange: 1.4, speed: 0.7, phase: 0, color: '#f4a261' },
  { id: 'noah-collection', roomId: 'collection', name: 'Noah', role: 'phlebotomist', position: [0, 0, 0.7], patrolRange: 1.1, speed: 0.9, phase: 1.5, color: '#e9c46a' },
  { id: 'aisha-processing', roomId: 'processing', name: 'Aisha', role: 'processing scientist', position: [0, 0, 0.8], patrolRange: 2, speed: 0.8, phase: 2.2, color: '#90be6d' },
  { id: 'leo-biobank', roomId: 'biobank', name: 'Leo', role: 'biobank manager', position: [0, 0, 0.8], patrolRange: 1.5, speed: 0.6, phase: 0.6, color: '#f9844a' },
  { id: 'priya-prep', roomId: 'pre-pcr', name: 'Priya', role: 'clean-room scientist', position: [0, 0, 0.8], patrolRange: 1.8, speed: 0.75, phase: 3, color: '#577590' },
  { id: 'sam-library', roomId: 'library-prep', name: 'Sam', role: 'library scientist', position: [0, 0, 0.8], patrolRange: 2.1, speed: 0.65, phase: 1, color: '#277da1' },
  { id: 'riley-sequencing', roomId: 'sequencing', name: 'Riley', role: 'sequencing scientist', position: [0, 0, 0.8], patrolRange: 1.8, speed: 0.55, phase: 2.7, color: '#9b5de5' },
  { id: 'chen-analysis', roomId: 'bioinformatics', name: 'Chen', role: 'bioinformatician', position: [0, 0, 0.8], patrolRange: 2.5, speed: 0.45, phase: 0.9, color: '#00b4d8' },
];
