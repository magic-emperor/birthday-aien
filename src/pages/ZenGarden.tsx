import React, { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

const fract = (n: number) => n - Math.floor(n);
const hash = (n: number) => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453123);
const toColor = (h: number, s: number, l: number) => new THREE.Color().setHSL(h / 360, s / 100, l / 100);

// Sand base with rake lines
const SandGround: React.FC<{ rakeLines: Array<{ x: number; z: number }[]> }> = ({ rakeLines }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(40, 40, 200, 200);
    const pos = geo.attributes.position;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < pos.count; i++) {
      const x = arr[i * 3];
      const z = arr[i * 3 + 1];
      // Subtle natural undulation
      arr[i * 3 + 2] = Math.sin(x * 0.5) * 0.03 + Math.cos(z * 0.3) * 0.02;
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Apply rake grooves
  useFrame(() => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < pos.count; i++) {
      const x = arr[i * 3];
      const z = arr[i * 3 + 1];
      let groove = 0;

      for (const line of rakeLines) {
        for (let j = 1; j < line.length; j++) {
          const ax = line[j - 1].x, az = line[j - 1].z;
          const bx = line[j].x, bz = line[j].z;
          const dx = bx - ax, dz = bz - az;
          const len = Math.sqrt(dx * dx + dz * dz);
          if (len < 0.01) continue;
          const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (len * len)));
          const px = ax + t * dx, pz = az + t * dz;
          const dist = Math.sqrt((x - px) ** 2 + (z - pz) ** 2);
          if (dist < 0.4) {
            groove = Math.max(groove, (1 - dist / 0.4) * 0.06);
          }
        }
      }

      arr[i * 3 + 2] = Math.sin(x * 0.5) * 0.03 + Math.cos(z * 0.3) * 0.02 - groove;
    }
    pos.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} geometry={geometry}>
      <meshStandardMaterial color={toColor(38, 25, 78)} roughness={0.95} />
    </mesh>
  );
};

// Zen stones
const ZenStones: React.FC = () => {
  const stones = useMemo(() => [
    { pos: [3, 0.4, 2] as [number, number, number], scale: [0.8, 0.5, 0.6] as [number, number, number], color: [0, 0, 35] as [number, number, number] },
    { pos: [3.8, 0.25, 2.5] as [number, number, number], scale: [0.5, 0.35, 0.45] as [number, number, number], color: [0, 0, 40] as [number, number, number] },
    { pos: [-4, 0.5, -3] as [number, number, number], scale: [1, 0.6, 0.7] as [number, number, number], color: [0, 0, 30] as [number, number, number] },
    { pos: [-3.2, 0.3, -2.5] as [number, number, number], scale: [0.4, 0.3, 0.5] as [number, number, number], color: [0, 0, 45] as [number, number, number] },
    { pos: [0, 0.6, -5] as [number, number, number], scale: [0.9, 0.7, 0.8] as [number, number, number], color: [0, 0, 33] as [number, number, number] },
  ], []);

  return (
    <group>
      {stones.map((s, i) => (
        <mesh key={i} position={s.pos} scale={s.scale} castShadow>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color={toColor(s.color[0], s.color[1], s.color[2])} roughness={0.85} flatShading />
        </mesh>
      ))}
    </group>
  );
};

// Bamboo fountain
const BambooFountain: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!waterRef.current) return;
    const t = clock.elapsedTime;
    waterRef.current.scale.y = 0.8 + Math.sin(t * 3) * 0.2;
    waterRef.current.position.y = 0.3 + Math.sin(t * 3) * 0.05;
  });

  return (
    <group position={[-6, 0, 5]}>
      {/* Bamboo pipe */}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.08, 0.08, 2, 8]} />
        <meshStandardMaterial color={toColor(80, 40, 35)} roughness={0.7} />
      </mesh>
      {/* Water stream */}
      <mesh ref={waterRef} position={[0.9, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.04, 0.5, 6]} />
        <meshStandardMaterial color={toColor(200, 50, 60)} transparent opacity={0.6} roughness={0.1} />
      </mesh>
      {/* Basin */}
      <mesh position={[0.9, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.4, 0.3, 12]} />
        <meshStandardMaterial color={toColor(0, 0, 30)} roughness={0.9} />
      </mesh>
    </group>
  );
};

// Small bonsai tree
const BonsaiTree: React.FC = () => (
  <group position={[6, 0, -4]}>
    {/* Trunk */}
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.06, 0.1, 1, 6]} />
      <meshStandardMaterial color={toColor(25, 40, 25)} roughness={0.9} />
    </mesh>
    {/* Branches */}
    <mesh position={[0.2, 0.9, 0]} rotation={[0, 0, 0.5]}>
      <cylinderGeometry args={[0.03, 0.05, 0.6, 5]} />
      <meshStandardMaterial color={toColor(25, 40, 25)} roughness={0.9} />
    </mesh>
    {/* Foliage */}
    <mesh position={[0, 1.1, 0]}>
      <sphereGeometry args={[0.4, 8, 8]} />
      <meshStandardMaterial color={toColor(120, 50, 28)} roughness={0.8} />
    </mesh>
    <mesh position={[0.4, 1.0, 0]}>
      <sphereGeometry args={[0.25, 8, 8]} />
      <meshStandardMaterial color={toColor(125, 45, 32)} roughness={0.8} />
    </mesh>
    {/* Pot */}
    <mesh position={[0, 0.05, 0]}>
      <cylinderGeometry args={[0.25, 0.2, 0.15, 8]} />
      <meshStandardMaterial color={toColor(15, 60, 30)} roughness={0.8} />
    </mesh>
  </group>
);

// Wooden border
const WoodenBorder: React.FC = () => (
  <group>
    {[
      { pos: [0, 0.1, -20] as [number, number, number], scale: [40, 0.2, 0.3] as [number, number, number] },
      { pos: [0, 0.1, 20] as [number, number, number], scale: [40, 0.2, 0.3] as [number, number, number] },
      { pos: [-20, 0.1, 0] as [number, number, number], scale: [0.3, 0.2, 40] as [number, number, number] },
      { pos: [20, 0.1, 0] as [number, number, number], scale: [0.3, 0.2, 40] as [number, number, number] },
    ].map((b, i) => (
      <mesh key={i} position={b.pos} scale={b.scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={toColor(25, 35, 28)} roughness={0.85} />
      </mesh>
    ))}
  </group>
);

// Rake tool interaction
const RakeInteraction: React.FC<{ onRake: (point: THREE.Vector3) => void }> = ({ onRake }) => {
  const { camera, raycaster } = useThree();
  const planeRef = useRef<THREE.Mesh>(null);

  const handlePointerMove = useCallback((e: any) => {
    if (e.buttons !== 1) return; // Only when mouse is held
    if (!planeRef.current) return;
    const intersects = raycaster.intersectObject(planeRef.current);
    if (intersects.length > 0) {
      onRake(intersects[0].point);
    }
  }, [onRake, raycaster]);

  return (
    <mesh
      ref={planeRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.01, 0]}
      onPointerMove={handlePointerMove}
      visible={false}
    >
      <planeGeometry args={[40, 40]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
};

const ZenGardenScene: React.FC<{ rakeLines: Array<{ x: number; z: number }[]> ; onRake: (point: THREE.Vector3) => void }> = ({ rakeLines, onRake }) => {
  return (
    <>
      <fog attach="fog" args={[toColor(38, 15, 85), 30, 80]} />
      <ambientLight intensity={0.5} color={toColor(38, 20, 90)} />
      <directionalLight position={[10, 15, 5]} intensity={0.8} color={toColor(40, 30, 95)} castShadow />
      <hemisphereLight color={toColor(200, 20, 85)} groundColor={toColor(38, 20, 50)} intensity={0.3} />

      <SandGround rakeLines={rakeLines} />
      <ZenStones />
      <BambooFountain />
      <BonsaiTree />
      <WoodenBorder />
      <RakeInteraction onRake={onRake} />
    </>
  );
};

const ZenGarden: React.FC = () => {
  const navigate = useNavigate();
  const [rakeLines, setRakeLines] = useState<Array<{ x: number; z: number }[]>>([]);
  const currentLine = useRef<{ x: number; z: number }[]>([]);
  const [isRaking, setIsRaking] = useState(false);

  const handleRake = useCallback((point: THREE.Vector3) => {
    const newPoint = { x: point.x, z: point.z };
    currentLine.current.push(newPoint);

    // Throttle updates
    if (currentLine.current.length % 3 === 0) {
      setRakeLines(prev => {
        const updated = [...prev];
        if (updated.length > 0 && isRaking) {
          updated[updated.length - 1] = [...currentLine.current];
        } else {
          updated.push([...currentLine.current]);
          setIsRaking(true);
        }
        return updated;
      });
    }
  }, [isRaking]);

  const handlePointerUp = useCallback(() => {
    if (currentLine.current.length > 0) {
      currentLine.current = [];
      setIsRaking(false);
    }
  }, []);

  const clearRakes = useCallback(() => {
    setRakeLines([]);
    currentLine.current = [];
  }, []);

  return (
    <div className="fixed inset-0 bg-background" onPointerUp={handlePointerUp}>
      <Canvas
        camera={{ position: [0, 15, 18], fov: 45 }}
        gl={{ antialias: true }}
        shadows
        style={{ cursor: 'crosshair' }}
      >
        <React.Suspense fallback={null}>
          <ZenGardenScene rakeLines={rakeLines} onRake={handleRake} />
        </React.Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="fixed top-6 left-6 z-50 flex gap-3">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-full bg-background/60 backdrop-blur-md border border-primary/20 text-sm font-body text-foreground hover:bg-background/80 transition-all shadow-lg"
        >
          ← Back
        </button>
        <button
          onClick={clearRakes}
          className="px-4 py-2 rounded-full bg-background/60 backdrop-blur-md border border-primary/20 text-sm font-body text-foreground hover:bg-background/80 transition-all shadow-lg"
        >
          Clear Rakes
        </button>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 text-center">
        <p className="text-sm text-muted-foreground/70 font-body bg-background/40 backdrop-blur-sm px-6 py-3 rounded-full border border-primary/10">
          🪨 Click and drag on the sand to rake patterns • Find your peace
        </p>
      </div>
    </div>
  );
};

export default ZenGarden;
