import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Text } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ROOMS } from '../config/rooms';
import type { RoomId } from '../domain/types';
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

function FacilityScene({ paused, onBlocked }: { paused: boolean; onBlocked: (message: string) => void }) {
  return (
    <Canvas camera={{ position: [0, 1.7, 0], fov: 70 }} shadows frameloop={paused ? 'never' : 'always'}>
      <color attach="background" args={['#07101d']} />
      <ambientLight intensity={1.3} />
      <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
      <Physics gravity={[0, -9.81, 0]}>
        {ROOMS.map((room) => <RoomShell key={room.id} room={room} />)}
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
  const [notice, setNotice] = useState('Click the facility, then use WASD or arrow keys to walk.');
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
  const recordAction = (action: string, nextStatus: typeof sample.status, points: number) => {
    updateSample({ status: nextStatus });
    addNotebookEntry({ message: `${action} · ${sample.id}`, severity: 'info' });
    addScore(points);
    setNotice(`${action} recorded. +${points} points.`);
  };

  return (
    <div className="facility-app">
      <div className="facility-hud">
        <strong>OmicsLab Facility Preview</strong>
        <span>{currentRoom.label}</span>
        <span>{locked ? 'Pointer locked · WASD / arrows to move · Shift to run' : notice}</span>
        {notice && <small role="status">{notice}</small>}
        <span>Score: {score} · Sample: {sample.id} · {sample.status}</span>
      </div>
      <div className="facility-ppe">
        {(['lab-coat', 'gloves', 'hairnet'] as const).map((item) => (
          <button type="button" key={item} className={ppe.includes(item) ? 'active' : ''} onClick={() => togglePpe(item)} aria-pressed={ppe.includes(item)}>
            {item.replace('-', ' ')}
          </button>
        ))}
      </div>
      <div className="facility-minimap" aria-label="Facility minimap">
        <strong>Map</strong>
        <div className="facility-map-rooms">
          {ROOMS.map((room) => (
            <button type="button" key={room.id} className={room.id === roomId ? 'current' : ''} disabled={!canEnter(room)} onClick={() => selectRoom(room.id)} title={room.requiredPpe?.length ? `Requires ${room.requiredPpe.join(', ')}` : 'Open'}>
              <span>{room.label}</span>
            </button>
          ))}
        </div>
      </div>
      <FacilityScene paused={paused} onBlocked={setNotice} />
      <section className="facility-procedure" aria-label="Sample procedure">
        <strong>Sample workflow</strong>
        <span>{sample.type.replace('-', ' ')} · {sample.volumeMl} mL · {sample.temperatureC}°C</span>
        <div>
          <button type="button" onClick={() => recordAction('Sample checked in', 'collected', 10)}>Check in</button>
          <button type="button" onClick={() => recordAction('Sample prepared', 'processing', 20)}>Prepare</button>
          <button type="button" onClick={() => recordAction('Sequencing started', 'sequencing', 30)}>Sequence</button>
        </div>
        <small>{notebook.at(-1)?.message ?? 'Actions are recorded in the lab notebook.'}</small>
      </section>
      <aside className="facility-fallback">
        <strong>Accessible facility view</strong>
        <p>Use the map or these buttons when 3D controls are unavailable. Locked rooms explain their PPE requirement.</p>
        <ol>{ROOMS.map((room) => <li key={room.id}><button type="button" disabled={!canEnter(room)} onClick={() => selectRoom(room.id)}>{room.label}{room.requiredPpe?.length ? ` · PPE: ${room.requiredPpe.join(', ')}` : ''}</button></li>)}</ol>
      </aside>
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
