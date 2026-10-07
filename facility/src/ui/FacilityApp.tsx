import { Canvas } from '@react-three/fiber';
import { PointerLockControls, Text } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { ROOMS } from '../config/rooms';
import { useFacilityStore } from '../state/facilityStore';

function RoomShell({ room }: { room: (typeof ROOMS)[number] }) {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <group position={room.position}>
        <mesh position={[0, -0.1, 0]} receiveShadow>
          <boxGeometry args={[room.size[0], 0.2, room.size[2]]} />
          <meshStandardMaterial color="#273449" />
        </mesh>
        <mesh position={[0, room.size[1], -room.size[2] / 2]}>
          <boxGeometry args={[room.size[0], room.size[1], 0.2]} />
          <meshStandardMaterial color="#182235" />
        </mesh>
        <Text position={[0, 2.7, -room.size[2] / 2 + 0.2]} fontSize={0.48} color="#00c4a0" anchorX="center">
          {room.label}
        </Text>
      </group>
    </RigidBody>
  );
}

function FacilityScene({ paused }: { paused: boolean }) {
  return (
    <Canvas camera={{ position: [0, 1.7, 4], fov: 70 }} shadows frameloop={paused ? 'never' : 'always'}>
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
      <PointerLockControls />
    </Canvas>
  );
}

export function FacilityApp({ paused = false }: { paused?: boolean }) {
  const roomId = useFacilityStore((state) => state.roomId);
  const ppe = useFacilityStore((state) => state.ppe);
  const togglePpe = useFacilityStore((state) => state.togglePpe);
  const currentRoom = ROOMS.find((room) => room.id === roomId) ?? ROOMS[0];

  return (
    <div className="facility-app">
      <div className="facility-hud">
        <strong>OmicsLab Facility Preview</strong>
        <span>{currentRoom.label}</span>
        <span>Room shell · {ROOMS.length} rooms configured</span>
      </div>
      <div className="facility-ppe">
        {(['lab-coat', 'gloves', 'hairnet'] as const).map((item) => (
          <button key={item} className={ppe.includes(item) ? 'active' : ''} onClick={() => togglePpe(item)}>
            {item.replace('-', ' ')}
          </button>
        ))}
      </div>
      <FacilityScene paused={paused} />
      <aside className="facility-fallback">
        <strong>Accessible facility view</strong>
        <p>Use this room list when 3D controls are unavailable.</p>
        <ol>{ROOMS.map((room) => <li key={room.id}>{room.label}</li>)}</ol>
      </aside>
    </div>
  );
}
