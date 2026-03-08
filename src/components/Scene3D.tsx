import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import plumTreeImg from '@/assets/plum-tree.png';

interface SceneProps {
  currentSection: number;
  totalSections: number;
  isTransitioning: boolean;
}

// ─── Plum Tree Billboard ────────────────────────────────────────
const PlumTreeBillboard: React.FC<{ currentSection: number; totalSections: number }> = ({ currentSection, totalSections }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, plumTreeImg);
  const targetRotation = useRef(0);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    targetRotation.current = (currentSection / (totalSections - 1)) * Math.PI * 0.6;
    meshRef.current.rotation.y += (targetRotation.current - meshRef.current.rotation.y) * 0.01;
    // Gentle sway
    meshRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.3) * 0.015;
    meshRef.current.position.x = Math.sin(clock.elapsedTime * 0.15) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, -2]} scale={[10, 10, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

// ─── Flowing Water ──────────────────────────────────────────────
const FlowingWater: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const originalPositions = useRef<Float32Array | null>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position;
    const arr = pos.array as Float32Array;

    if (!originalPositions.current) {
      originalPositions.current = new Float32Array(arr);
    }

    const t = clock.elapsedTime;
    const orig = originalPositions.current;

    for (let i = 0; i < pos.count; i++) {
      const ox = orig[i * 3];
      const oz = orig[i * 3 + 2];
      arr[i * 3 + 1] =
        Math.sin(ox * 1.2 + t * 1.8) * 0.06 +
        Math.cos(oz * 1.8 + t * 1.3) * 0.04 +
        Math.sin((ox + oz) * 0.6 + t * 0.7) * 0.03 +
        Math.sin(ox * 3.5 + t * 2.5) * 0.02;
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <group position={[0, -4.2, -1]}>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 8, 48, 24]} />
        <meshStandardMaterial
          color="#78b8d8"
          emissive="#4890b0"
          emissiveIntensity={0.12}
          transparent
          opacity={0.5}
          roughness={0.05}
          metalness={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Depth */}
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial color="#406080" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>

      <WaterSparkles />
    </group>
  );
};

const WaterSparkles: React.FC = () => {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const count = 100;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = 0.08;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      spd[i] = 0.2 + Math.random() * 0.5;
    }
    return { positions: pos, speeds: spd };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < speeds.length; i++) {
      arr[i * 3] += speeds[i] * 0.002;
      arr[i * 3 + 1] = 0.08 + Math.sin(t * 2.5 + i * 0.5) * 0.04;
      if (arr[i * 3] > 7) arr[i * 3] = -7;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.3 + Math.sin(t * 2) * 0.12;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#c0e8ff" transparent opacity={0.35} sizeAttenuation />
    </points>
  );
};

// ─── Wind Burst Petals ──────────────────────────────────────────
const WindBurstPetals: React.FC<{ active: boolean }> = ({ active }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [burst, setBurst] = useState(false);
  const startTime = useRef(0);

  const petalData = useMemo(() => {
    return Array.from({ length: 50 }, () => ({
      startPos: new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random()) * 5 - 1,
        (Math.random() - 0.5) * 4
      ),
      velocity: new THREE.Vector3(
        1.5 + Math.random() * 3,
        (Math.random() - 0.4) * 2,
        (Math.random() - 0.5) * 2
      ),
      rotSpeed: 2 + Math.random() * 5,
      size: 0.06 + Math.random() * 0.1,
      color: ['#e87aaa', '#f090b8', '#d06890', '#f5a8c8', '#c05880', '#f8b0d0'][Math.floor(Math.random() * 6)],
    }));
  }, []);

  useEffect(() => {
    if (active && !burst) {
      setBurst(true);
      startTime.current = 0;
      const timer = setTimeout(() => setBurst(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  useFrame(({ clock }) => {
    if (!burst || !groupRef.current) return;
    if (startTime.current === 0) startTime.current = clock.elapsedTime;
    const elapsed = clock.elapsedTime - startTime.current;

    groupRef.current.children.forEach((child, i) => {
      if (!(child instanceof THREE.Mesh)) return;
      const data = petalData[i];
      if (!data) return;
      child.position.set(
        data.startPos.x + data.velocity.x * elapsed * 0.8,
        data.startPos.y + data.velocity.y * elapsed - elapsed * elapsed * 0.2,
        data.startPos.z + data.velocity.z * elapsed * 0.5
      );
      child.rotation.x = elapsed * data.rotSpeed;
      child.rotation.z = elapsed * data.rotSpeed * 0.6;
      child.rotation.y = Math.sin(elapsed * 3) * 1;
      const mat = child.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(0, 0.85 - elapsed * 0.28);
    });
  });

  if (!burst) return null;

  return (
    <group ref={groupRef}>
      {petalData.map((data, i) => (
        <mesh key={i} position={data.startPos.toArray() as [number, number, number]}>
          <planeGeometry args={[data.size, data.size * 1.4]} />
          <meshStandardMaterial
            color={data.color}
            emissive={data.color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

// ─── Ambient Falling Petals ─────────────────────────────────────
const FallingPetals: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  const petals = useMemo(() => {
    return Array.from({ length: 50 }, () => ({
      startX: (Math.random() - 0.5) * 16,
      startY: 5 + Math.random() * 6,
      startZ: (Math.random() - 0.5) * 8,
      speed: 0.2 + Math.random() * 0.3,
      swayAmount: 0.5 + Math.random() * 1.5,
      swaySpeed: 0.7 + Math.random() * 1,
      rotSpeed: 0.4 + Math.random() * 1,
      delay: Math.random() * 16,
      size: 0.06 + Math.random() * 0.07,
      color: ['#e87aaa', '#f090b8', '#d06890', '#f5a8c8', '#c05880', '#e068a0', '#f0c0d8'][Math.floor(Math.random() * 7)],
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      if (!(child instanceof THREE.Mesh)) return;
      const p = petals[i];
      if (!p) return;
      const elapsed = (t * p.speed + p.delay) % 16;

      child.position.y = p.startY - elapsed * 0.9;
      child.position.x = p.startX + Math.sin(elapsed * p.swaySpeed) * p.swayAmount;
      child.position.z = p.startZ + Math.cos(elapsed * p.swaySpeed * 0.6) * 0.5;
      child.rotation.x = elapsed * p.rotSpeed * 0.4;
      child.rotation.y = elapsed * p.rotSpeed * 0.2;
      child.rotation.z = Math.sin(elapsed * 1.5) * 0.8;

      const mat = child.material as THREE.MeshStandardMaterial;
      if (elapsed < 1.5) mat.opacity = (elapsed / 1.5) * 0.7;
      else if (elapsed > 14) mat.opacity = ((16 - elapsed) / 2) * 0.7;
      else mat.opacity = 0.7;
    });
  });

  return (
    <group ref={groupRef}>
      {petals.map((p, i) => (
        <mesh key={i} position={[p.startX, p.startY, p.startZ]}>
          <planeGeometry args={[p.size, p.size * 1.5]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={0.2}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

// ─── Soft Particles ─────────────────────────────────────────────
const SoftParticles: React.FC = () => {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 120;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.005;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#f0d0e0" transparent opacity={0.2} sizeAttenuation />
    </points>
  );
};

// ─── Camera ─────────────────────────────────────────────────────
const ReactiveCamera: React.FC<{ currentSection: number; totalSections: number; isTransitioning: boolean }> = ({ currentSection, totalSections, isTransitioning }) => {
  const targetPos = useRef(new THREE.Vector3(0, 0, 6));

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    const progress = currentSection / (totalSections - 1);
    const angle = progress * Math.PI * 1.2;

    targetPos.current.set(
      Math.sin(angle) * 2.5 + Math.sin(t * 0.12) * 0.15,
      0.5 + Math.cos(angle * 0.4) * 0.6 + Math.cos(t * 0.1) * 0.1,
      7 - progress * 1.5
    );

    const speed = isTransitioning ? 0.025 : 0.01;
    camera.position.lerp(targetPos.current, speed);
    camera.lookAt(0, -0.5, -2);
  });

  return null;
};

// ─── Main Scene ─────────────────────────────────────────────────
const SceneContent: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  return (
    <>
      <fog attach="fog" args={['#f0e5f0', 12, 40]} />

      <ambientLight intensity={0.7} color="#fff8fa" />
      <directionalLight position={[3, 8, 5]} intensity={0.8} color="#ffe8f0" />
      <directionalLight position={[-3, 5, -3]} intensity={0.3} color="#e0d0f0" />
      <hemisphereLight color="#ffe0f0" groundColor="#c0d8f0" intensity={0.25} />
      <pointLight position={[0, 5, 0]} color="#fff0e0" intensity={1} distance={12} decay={2} />

      {/* The tree billboard */}
      <PlumTreeBillboard currentSection={currentSection} totalSections={totalSections} />

      {/* Flowing water */}
      <FlowingWater />

      {/* Wind burst on transition */}
      <WindBurstPetals active={isTransitioning} />

      {/* Ambient falling petals */}
      <FallingPetals />

      {/* Soft particles */}
      <SoftParticles />

      <ReactiveCamera currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} />
    </>
  );
};

const Scene3D: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0.5, 7], fov: 55, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <React.Suspense fallback={null}>
          <SceneContent currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
