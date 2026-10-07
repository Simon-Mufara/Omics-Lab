export type RoomId =
  | 'reception'
  | 'collection'
  | 'processing'
  | 'biobank'
  | 'pre-pcr'
  | 'library-prep'
  | 'sequencing'
  | 'bioinformatics';

export type PpeItem = 'lab-coat' | 'gloves' | 'hairnet';

export type RoomDefinition = {
  id: RoomId;
  label: string;
  position: [number, number, number];
  size: [number, number, number];
  neighbours: RoomId[];
  requiredPpe?: PpeItem[];
};

export type FacilityProgress = {
  roomId: RoomId;
  ppe: PpeItem[];
  completedObjectives: string[];
};
