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

export type EquipmentKind = 'intake-desk' | 'centrifuge' | 'freezer' | 'clean-bench' | 'thermocycler' | 'sequencer' | 'workstation' | 'chair';

export type EquipmentDefinition = {
  id: string;
  roomId: RoomId;
  label: string;
  kind: EquipmentKind;
  position: [number, number, number];
  scale?: number;
  color?: string;
  prompt: string;
};

export type StaffDefinition = {
  id: string;
  roomId: RoomId;
  name: string;
  role: string;
  position: [number, number, number];
  patrolRange: number;
  speed: number;
  phase: number;
  color: string;
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
