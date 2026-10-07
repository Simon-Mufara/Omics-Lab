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
  sample: SampleState;
  notebook: NotebookEntry[];
  score: number;
};

export type SampleState = {
  id: string;
  type: 'whole-blood' | 'saliva' | 'tissue';
  volumeMl: number;
  temperatureC: number;
  location: RoomId;
  custody: string[];
  status: 'received' | 'collected' | 'processing' | 'sequencing' | 'complete';
};

export type NotebookEntry = {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: string;
};
