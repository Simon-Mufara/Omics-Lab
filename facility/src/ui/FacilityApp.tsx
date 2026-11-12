import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Text } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Group } from 'three';
import { ROOMS } from '../config/rooms';
import { EQUIPMENT } from '../config/equipment';
import { STAFF } from '../config/staff';
import type { EquipmentDefinition, RoomId, StaffDefinition } from '../domain/types';
import { useFacilityStore } from '../state/facilityStore';

function RoomShell({ room }: { room: (typeof ROOMS)[number] }) {
  const [width, height, depth] = room.size;
  const wall = 0.2;
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <group position={room.position}>
        <mesh position={[0, -0.1, 0]} receiveShadow>
          <boxGeometry args={[width, 0.2, depth]} />
          <meshStandardMaterial color="#273449" />
        </mesh>
        <mesh position={[0, height, -depth / 2]}>
          <boxGeometry args={[width, height, wall]} />
          <meshStandardMaterial color="#182235" />
        </mesh>
        <mesh position={[0, height, depth / 2]}>
          <boxGeometry args={[width, height, wall]} />
          <meshStandardMaterial color="#182235" />
        </mesh>
        <mesh position={[-width / 2, height, -depth / 3]}>
          <boxGeometry args={[wall, height, depth / 3]} />
          <meshStandardMaterial color="#182235" />
        </mesh>
        <mesh position={[-width / 2, height, depth / 3]}>
          <boxGeometry args={[wall, height, depth / 3]} />
          <meshStandardMaterial color="#182235" />
        </mesh>
        <mesh position={[width / 2, height, -depth / 3]}>
          <boxGeometry args={[wall, height, depth / 3]} />
          <meshStandardMaterial color="#182235" />
        </mesh>
        <mesh position={[width / 2, height, depth / 3]}>
          <boxGeometry args={[wall, height, depth / 3]} />
          <meshStandardMaterial color="#182235" />
        </mesh>
        <Text position={[0, 2.7, -depth / 2 + 0.2]} fontSize={0.48} color="#00c4a0" anchorX="center">
          {room.label}
        </Text>
      </group>
    </RigidBody>
  );
}

function EquipmentProp({ equipment, onInteract }: { equipment: EquipmentDefinition; onInteract: (equipment: EquipmentDefinition) => void }) {
  const scale = equipment.scale ?? 1;
  const color = equipment.color ?? '#4c6a86';
  const sharedProps = {
    onClick: (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      onInteract(equipment);
    },
    onPointerOver: () => { document.body.style.cursor = 'pointer'; },
    onPointerOut: () => { document.body.style.cursor = ''; },
  };
  return (
    <group position={equipment.position} scale={scale} {...sharedProps}>
      {equipment.kind === 'intake-desk' && <><mesh position={[0, 0.65, 0]} castShadow><boxGeometry args={[2.8, 1.3, 1]} /><meshStandardMaterial color="#314b63" /></mesh><mesh position={[0, 1.4, 0.25]}><boxGeometry args={[1.3, 0.7, 0.08]} /><meshStandardMaterial color="#1e293b" emissive="#00c4a0" emissiveIntensity={0.35} /></mesh></>}
      {equipment.kind === 'centrifuge' && <><mesh position={[0, 0.65, 0]} castShadow><cylinderGeometry args={[0.75, 0.75, 1.1, 24]} /><meshStandardMaterial color={color} /></mesh><mesh position={[0, 1.25, 0]}><cylinderGeometry args={[0.52, 0.52, 0.08, 24]} /><meshStandardMaterial color="#d8f3dc" /></mesh></>}
      {equipment.kind === 'freezer' && <><mesh position={[0, 1.2, 0]} castShadow><boxGeometry args={[1.8, 2.4, 1.3]} /><meshStandardMaterial color="#8aa3b8" /></mesh><mesh position={[0, 1.2, 0.68]}><boxGeometry args={[1.2, 1.8, 0.04]} /><meshStandardMaterial color="#bde0fe" transparent opacity={0.55} /></mesh></>}
      {equipment.kind === 'clean-bench' && <><mesh position={[0, 0.55, 0]} castShadow><boxGeometry args={[2.5, 1.1, 1]} /><meshStandardMaterial color="#78909c" /></mesh><mesh position={[0, 1.35, 0]}><boxGeometry args={[2.5, 1.3, 0.08]} /><meshStandardMaterial color="#d8f3dc" transparent opacity={0.5} /></mesh></>}
      {equipment.kind === 'thermocycler' && <><mesh position={[0, 0.55, 0]} castShadow><boxGeometry args={[1.5, 1.1, 1.3]} /><meshStandardMaterial color="#566573" /></mesh><mesh position={[0, 0.95, 0.68]}><boxGeometry args={[0.85, 0.2, 0.03]} /><meshStandardMaterial color="#00c4a0" emissive="#00c4a0" emissiveIntensity={0.5} /></mesh></>}
      {equipment.kind === 'sequencer' && <><mesh position={[0, 0.8, 0]} castShadow><boxGeometry args={[2.2, 1.6, 1.7]} /><meshStandardMaterial color="#334e68" /></mesh><mesh position={[0, 1.55, 0.87]}><boxGeometry args={[1.3, 0.45, 0.04]} /><meshStandardMaterial color="#00c4a0" emissive="#00c4a0" emissiveIntensity={0.4} /></mesh></>}
      {(equipment.kind === 'workstation' || equipment.kind === 'chair') && <><mesh position={[0, 0.55, 0]} castShadow><boxGeometry args={[equipment.kind === 'chair' ? 1.1 : 1.8, 0.15, equipment.kind === 'chair' ? 1.1 : 0.8]} /><meshStandardMaterial color={color} /></mesh><mesh position={[0, 0.25, 0]}><boxGeometry args={[0.12, 0.6, 0.12]} /><meshStandardMaterial color="#263238" /></mesh><mesh position={[0, 1.15, 0.2]}><boxGeometry args={[1.1, 0.65, 0.06]} /><meshStandardMaterial color="#1e293b" emissive="#00c4a0" emissiveIntensity={0.25} /></mesh></>}
      <Text position={[0, 2.15, 0]} fontSize={0.22} color="#f1faee" anchorX="center" maxWidth={3}>{equipment.label}</Text>
    </group>
  );
}

function StaffNpc({ staff, onInteract }: { staff: StaffDefinition; onInteract: (staff: StaffDefinition) => void }) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const phase = clock.elapsedTime * staff.speed + staff.phase;
    group.current.position.x = staff.position[0] + Math.sin(phase) * staff.patrolRange;
    group.current.position.y = staff.position[1] + Math.abs(Math.sin(phase * 2)) * 0.035;
    group.current.rotation.y = Math.cos(phase) * 0.18;
  });
  return (
    <group
      ref={group}
      position={staff.position}
      onClick={(event) => {
        event.stopPropagation();
        onInteract(staff);
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = ''; }}
    >
      <mesh position={[0, 1.05, 0]} castShadow><capsuleGeometry args={[0.35, 0.85, 6, 12]} /><meshStandardMaterial color={staff.color} /></mesh>
      <mesh position={[0, 1.85, 0]} castShadow><sphereGeometry args={[0.28, 16, 12]} /><meshStandardMaterial color="#d8a47f" /></mesh>
      <mesh position={[0, 1.08, 0.36]}><boxGeometry args={[0.18, 0.2, 0.03]} /><meshStandardMaterial color="#fefae0" /></mesh>
      <mesh position={[-0.22, 0.66, 0]}><boxGeometry args={[0.12, 0.55, 0.12]} /><meshStandardMaterial color="#263238" /></mesh>
      <mesh position={[0.22, 0.66, 0]}><boxGeometry args={[0.12, 0.55, 0.12]} /><meshStandardMaterial color="#263238" /></mesh>
      <Text position={[0, 2.25, 0]} fontSize={0.2} color="#ffd166" anchorX="center">{staff.name}</Text>
    </group>
  );
}

function RoomContents({
  roomId,
  onInteract,
  onStaffInteract,
}: {
  roomId: RoomId;
  onInteract: (equipment: EquipmentDefinition) => void;
  onStaffInteract: (staff: StaffDefinition) => void;
}) {
  const room = ROOMS.find((candidate) => candidate.id === roomId);
  if (!room) return null;
  return <group position={room.position}>
    {EQUIPMENT.filter((equipment) => equipment.roomId === roomId).map((equipment) => <EquipmentProp key={equipment.id} equipment={equipment} onInteract={onInteract} />)}
    {STAFF.filter((staff) => staff.roomId === roomId).map((staff) => <StaffNpc key={staff.id} staff={staff} onInteract={onStaffInteract} />)}
  </group>;
}

function useKeyboard() {
  const keys = useRef(new Set<string>());
  useEffect(() => {
    const down = (event: KeyboardEvent) => keys.current.add(event.code);
    const up = (event: KeyboardEvent) => keys.current.delete(event.code);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);
  return keys;
}

function FirstPersonNavigator({ onBlocked }: { onBlocked: (message: string) => void }) {
  const { camera } = useThree();
  const keys = useKeyboard();
  const roomId = useFacilityStore((state) => state.roomId);
  const ppe = useFacilityStore((state) => state.ppe);
  const setRoom = useFacilityStore((state) => state.setRoom);
  const updateSample = useFacilityStore((state) => state.updateSample);
  const blockedAt = useRef(0);
  const roomsById = useMemo(() => new Map(ROOMS.map((room) => [room.id, room])), []);

  useEffect(() => {
    const room = roomsById.get(roomId) ?? ROOMS[0];
    camera.position.set(room.position[0], 1.7, room.position[2]);
  }, [camera, roomId, roomsById]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const direction = Number(keys.current.has('KeyD') || keys.current.has('ArrowRight'))
      - Number(keys.current.has('KeyA') || keys.current.has('ArrowLeft'));
    const depthDirection = Number(keys.current.has('KeyS') || keys.current.has('ArrowDown'))
      - Number(keys.current.has('KeyW') || keys.current.has('ArrowUp'));
    const speed = keys.current.has('ShiftLeft') ? 5.5 : 3.2;
    const nextX = camera.position.x + direction * speed * delta;
    const nextZ = camera.position.z + depthDirection * speed * delta;
    const current = roomsById.get(roomId) ?? ROOMS[0];
    const clampedZ = Math.max(-current.size[2] / 2 + 0.65, Math.min(current.size[2] / 2 - 0.65, nextZ));
    let permittedX = nextX;
    const roomIndex = ROOMS.findIndex((room) => room.id === roomId);
    const neighbour = direction > 0 ? ROOMS[roomIndex + 1] : direction < 0 ? ROOMS[roomIndex - 1] : undefined;
    if (neighbour) {
      const boundary = direction > 0
        ? current.position[0] + current.size[0] / 2 + (neighbour.position[0] - neighbour.size[0] / 2 - (current.position[0] + current.size[0] / 2)) / 2
        : current.position[0] - current.size[0] / 2 - (current.position[0] - current.size[0] / 2 - (neighbour.position[0] + neighbour.size[0] / 2)) / 2;
      const inDoorway = Math.abs(nextZ) < 1.65;
      const crossing = direction > 0 ? nextX > boundary : nextX < boundary;
      if (crossing) {
        const missing = (neighbour.requiredPpe ?? []).filter((item) => !ppe.includes(item));
        if (!inDoorway) {
          permittedX = direction > 0 ? current.position[0] + current.size[0] / 2 - 0.12 : current.position[0] - current.size[0] / 2 + 0.12;
        } else if (missing.length > 0) {
          permittedX = boundary + (direction > 0 ? -0.12 : 0.12);
          if (Date.now() - blockedAt.current > 1200) {
            onBlocked(`Door locked: ${neighbour.label} requires ${missing.join(', ')}.`);
            blockedAt.current = Date.now();
          }
        } else {
          setRoom(neighbour.id);
          updateSample({ location: neighbour.id });
        }
      }
    } else {
      permittedX = Math.max(current.position[0] - current.size[0] / 2 + 0.7, Math.min(current.position[0] + current.size[0] / 2 - 0.7, nextX));
    }
    camera.position.x = permittedX;
    camera.position.z = clampedZ;
  });
  return null;
}

function DoorIndicators() {
  const ppe = useFacilityStore((state) => state.ppe);
  return <>{ROOMS.slice(0, -1).map((room, index) => {
    const next = ROOMS[index + 1];
    const x = room.position[0] + room.size[0] / 2 + (next.position[0] - next.size[0] / 2 - (room.position[0] + room.size[0] / 2)) / 2;
    const locked = (next.requiredPpe ?? []).some((item) => !ppe.includes(item));
    return <mesh key={next.id} position={[x, 1.35, 0]}>
      <boxGeometry args={[0.08, 2.7, 2.8]} />
      <meshStandardMaterial color={locked ? '#c75c5c' : '#00c4a0'} transparent opacity={0.28} />
    </mesh>;
  })}</>;
}

function FacilityScene({
  paused,
  roomId,
  onBlocked,
  onInteract,
  onStaffInteract,
}: {
  paused: boolean;
  roomId: RoomId;
  onBlocked: (message: string) => void;
  onInteract: (equipment: EquipmentDefinition) => void;
  onStaffInteract: (staff: StaffDefinition) => void;
}) {
  return (
    <Canvas camera={{ position: [0, 1.7, 0], fov: 70 }} dpr={[1, 1.5]} frameloop={paused ? 'never' : 'always'}>
      <color attach="background" args={['#07101d']} />
      <ambientLight intensity={1.3} />
      <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
      <Physics gravity={[0, -9.81, 0]}>
        {ROOMS.map((room) => <RoomShell key={room.id} room={room} />)}
        {ROOMS.filter((room) => room.id === roomId || room.neighbours.includes(roomId)).map((room) => (
          <RoomContents key={`contents-${room.id}`} roomId={room.id} onInteract={onInteract} onStaffInteract={onStaffInteract} />
        ))}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[50, -0.3, 0]} receiveShadow>
            <boxGeometry args={[120, 0.2, 14]} />
            <meshStandardMaterial color="#101827" />
          </mesh>
        </RigidBody>
      </Physics>
      <DoorIndicators />
      <FirstPersonNavigator onBlocked={onBlocked} />
      <PointerLockControls />
    </Canvas>
  );
}

export function FacilityApp({ paused = false }: { paused?: boolean }) {
  const roomId = useFacilityStore((state) => state.roomId);
  const ppe = useFacilityStore((state) => state.ppe);
  const togglePpe = useFacilityStore((state) => state.togglePpe);
  const sample = useFacilityStore((state) => state.sample);
  const notebook = useFacilityStore((state) => state.notebook);
  const score = useFacilityStore((state) => state.score);
  const updateSample = useFacilityStore((state) => state.updateSample);
  const addNotebookEntry = useFacilityStore((state) => state.addNotebookEntry);
  const addScore = useFacilityStore((state) => state.addScore);
  const currentRoom = ROOMS.find((room) => room.id === roomId) ?? ROOMS[0];
  const workflowSteps = [
    { label: 'Intake', status: 'collected' as const },
    { label: 'Process', status: 'processing' as const },
    { label: 'Sequence', status: 'sequencing' as const },
    { label: 'Report', status: 'complete' as const },
  ];
  const statusIndex = workflowSteps.findIndex((step) => step.status === sample.status);
  const completedSteps = sample.status === 'received' ? 0 : Math.max(0, statusIndex + 1);
  const nextStep = workflowSteps[completedSteps]?.label ?? 'Run complete';
  const rank = score >= 100 ? 'Lead scientist' : score >= 50 ? 'Senior analyst' : score >= 20 ? 'Lab scientist' : 'Trainee';
  const [notice, setNotice] = useState('Click the facility, then use WASD or arrow keys to walk.');
  const [interaction, setInteraction] = useState<{ title: string; prompt: string } | null>(null);
  const [locked, setLocked] = useState(false);
  const canEnter = (room: (typeof ROOMS)[number]) => (room.requiredPpe ?? []).every((item) => ppe.includes(item));
  const selectRoom = (roomIdToSelect: RoomId) => {
    const room = ROOMS.find((candidate) => candidate.id === roomIdToSelect);
    if (!room) return;
    if (!canEnter(room)) {
      setNotice(`Access denied. ${room.label} requires ${(room.requiredPpe ?? []).join(', ')}.`);
      return;
    }
    useFacilityStore.getState().setRoom(room.id);
    setNotice(`Accessible fallback selected ${room.label}.`);
  };
  const recordAction = (action: string, nextStatus: typeof sample.status, points: number, requiredStatus: typeof sample.status) => {
    if (sample.status !== requiredStatus) {
      setNotice(`Complete “${workflowSteps[completedSteps - 1]?.label ?? 'Intake'}” before starting this step.`);
      return;
    }
    updateSample({ status: nextStatus });
    addNotebookEntry({ message: `${action} · ${sample.id}`, severity: 'info' });
    addScore(points);
    setNotice(`${action} recorded. +${points} points.`);
  };

  return (
    <div className="facility-app">
      <header className="facility-header">
        <div>
          <span className="facility-kicker">OMICS LAB / GENOMICS FACILITY</span>
          <h1>Sequencing operations floor</h1>
          <p>Run a sample from intake to report with controlled access, chain of custody, and auditable actions.</p>
        </div>
        <div className="facility-header-status">
          <span className="status-dot" /> LIVE SIMULATION
          <strong>{currentRoom.label}</strong>
        </div>
      </header>
      <main className="facility-command-center">
        <aside className="facility-sidebar">
          <section className="facility-card facility-score-card">
            <div className="card-label">RUN SCORE</div>
            <strong className="facility-score">{score}<span> pts</span></strong>
            <div className="score-meta"><span>{rank}</span><span>{completedSteps}/4 stages</span></div>
            <div className="score-track"><i style={{ width: `${Math.min(100, (score / 100) * 100)}%` }} /></div>
          </section>
          <section className="facility-card">
            <div className="card-heading"><span>ACTIVE SAMPLE</span><b className={`sample-status status-${sample.status}`}>{sample.status}</b></div>
            <strong className="sample-id">{sample.id}</strong>
            <div className="sample-details"><span>{sample.type.replace('-', ' ')}</span><span>{sample.volumeMl} mL</span><span>{sample.temperatureC}°C</span></div>
          </section>
          <section className="facility-card facility-ppe-card">
            <div className="card-heading"><span>ACCESS KIT</span><span>{ppe.length}/3 ready</span></div>
            <p>Required for controlled rooms.</p>
            <div className="ppe-list">
              {(['lab-coat', 'gloves', 'hairnet'] as const).map((item) => (
                <button type="button" key={item} className={ppe.includes(item) ? 'active' : ''} onClick={() => togglePpe(item)} aria-pressed={ppe.includes(item)}>
                  <span>{ppe.includes(item) ? '✓' : '○'}</span>{item.replace('-', ' ')}
                </button>
              ))}
            </div>
          </section>
          <section className="facility-card facility-help">
            <div className="card-label">OPERATOR NOTE</div>
            <p role="status">{notice}</p>
            <small>{locked ? 'WASD / arrows move · Shift runs' : 'Click the scene to enter first-person mode.'}</small>
          </section>
        </aside>
        <section className="facility-workspace">
          <nav className="facility-room-rail" aria-label="Facility rooms">
            {ROOMS.map((room, index) => {
              const accessible = canEnter(room);
              return <button type="button" key={room.id} className={`${room.id === roomId ? 'current' : ''} ${accessible ? '' : 'locked'}`} disabled={!accessible} onClick={() => selectRoom(room.id)} title={accessible ? room.label : `Requires ${(room.requiredPpe ?? []).join(', ')}`}>
                <span className="room-number">{String(index + 1).padStart(2, '0')}</span><span>{room.label}</span>{!accessible && <b>LOCKED</b>}
              </button>;
            })}
          </nav>
          <div className="facility-scene-frame">
            <FacilityScene
              paused={paused}
              roomId={roomId}
              onBlocked={setNotice}
              onInteract={(equipment) => {
                setInteraction({ title: equipment.label, prompt: equipment.prompt });
                setNotice(`${equipment.label}: ${equipment.prompt}`);
                addNotebookEntry({ message: `Inspected ${equipment.label}`, severity: 'info' });
                addScore(2);
              }}
              onStaffInteract={(staff) => {
                setInteraction({ title: `${staff.name} · ${staff.role}`, prompt: 'Ask a colleague for a hint about the current sample step.' });
                setNotice(`${staff.name} is available to help in ${currentRoom.label}.`);
                addNotebookEntry({ message: `Asked ${staff.name} for a workflow hint`, severity: 'info' });
              }}
            />
            <div className="scene-overlay"><span>ROOM {String(ROOMS.findIndex((room) => room.id === roomId) + 1).padStart(2, '0')}</span><strong>{currentRoom.label}</strong><small>Interactive 3D view</small></div>
          </div>
        </section>
        <aside className="facility-right-rail">
          <section className="facility-card workflow-card">
            <div className="card-heading"><span>RUN PROTOCOL</span><span>Next: {nextStep}</span></div>
            <ol className="workflow-list">
              {workflowSteps.map((step, index) => <li key={step.status} className={index < completedSteps ? 'done' : index === completedSteps ? 'active' : ''}><span>{index < completedSteps ? '✓' : index + 1}</span><div><strong>{step.label}</strong><small>{index < completedSteps ? 'Verified' : index === completedSteps ? 'Ready for action' : 'Awaiting previous stage'}</small></div></li>)}
            </ol>
          </section>
          <section className="facility-card procedure-card">
            <div className="card-heading"><span>CONTROL ACTIONS</span><span>Audit logged</span></div>
            <div className="procedure-actions">
              <button type="button" disabled={sample.status !== 'received'} onClick={() => recordAction('Sample checked in', 'collected', 10, 'received')}>Check in sample <b>+10</b></button>
              <button type="button" disabled={sample.status !== 'collected'} onClick={() => recordAction('Sample prepared', 'processing', 20, 'collected')}>Prepare sample <b>+20</b></button>
              <button type="button" disabled={sample.status !== 'processing'} onClick={() => recordAction('Sequencing started', 'sequencing', 30, 'processing')}>Start sequencing <b>+30</b></button>
              <button type="button" disabled={sample.status !== 'sequencing'} onClick={() => recordAction('Run reported', 'complete', 40, 'sequencing')}>Release report <b>+40</b></button>
            </div>
            <small>{notebook.at(-1)?.message ?? 'Each action is recorded in the lab notebook.'}</small>
          </section>
        </aside>
      </main>
      {interaction && (
        <section className="facility-interaction" role="status" aria-label="Equipment interaction">
          <strong>{interaction.title}</strong>
          <span>{interaction.prompt}</span>
          <button type="button" onClick={() => setInteraction(null)}>Dismiss</button>
        </section>
      )}
      <button type="button" className="facility-lock-prompt" onClick={() => document.querySelector('canvas')?.requestPointerLock()} onFocus={() => setNotice('Press Enter or click to capture the mouse. Press Escape to release it.')}>
        {locked ? 'Pointer locked' : 'Enter first-person mode'}
      </button>
      <PointerLockState onChange={setLocked} />
    </div>
  );
}

function PointerLockState({ onChange }: { onChange: (locked: boolean) => void }) {
  useEffect(() => {
    const update = () => onChange(document.pointerLockElement !== null);
    document.addEventListener('pointerlockchange', update);
    return () => document.removeEventListener('pointerlockchange', update);
  }, [onChange]);
  return null;
}
