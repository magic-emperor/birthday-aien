import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  currentSection: number;
  totalSections: number;
  isTransitioning: boolean;
}

// ─── Plum Blossom Tree ─────────────────────────────────────────
const BlossomTree: React.FC<{ currentSection: number; totalSections: number }> = ({ currentSection, totalSections }) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(0);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    // Rotate tree based on section
    targetRotation.current = (currentSection / (totalSections - 1)) * Math.PI * 2;
    groupRef.current.rotation.y += (targetRotation.current - groupRef.current.rotation.y) * 0.015;
    // Gentle sway
    groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.03;
  });

  return (
    <group ref={groupRef} position={[0, -3.5, -4]} scale={[1.1, 1.1, 1.1]}>
      {/* Trunk */}
      <mesh position={[0, 1.2, 0]} rotation={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.08, 0.18, 3, 8]} />
        <meshStandardMaterial color="#5a3a28" roughness={0.9} />
      </mesh>

      {/* Main branches */}
      {[
        { pos: [0.3, 2.6, 0] as [number,number,number], rot: [0, 0, 0.6] as [number,number,number], len: 1.8 },
        { pos: [-0.2, 2.8, 0.2] as [number,number,number], rot: [0.3, 0.5, -0.5] as [number,number,number], len: 1.5 },
        { pos: [0.1, 2.4, -0.2] as [number,number,number], rot: [-0.2, -0.3, 0.7] as [number,number,number], len: 1.6 },
        { pos: [-0.3, 2.2, 0] as [number,number,number], rot: [0, 0.2, -0.8] as [number,number,number], len: 1.3 },
        { pos: [0.15, 3.0, 0.1] as [number,number,number], rot: [0.1, -0.4, 0.4] as [number,number,number], len: 1.2 },
      ].map((branch, i) => (
        <group key={i} position={branch.pos} rotation={branch.rot}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.05, branch.len, 6]} />
            <meshStandardMaterial color="#6b4430" roughness={0.85} />
          </mesh>
          {/* Sub-branches */}
          {[0.3, 0.6, 0.85].map((t, j) => (
            <group key={j} position={[0, branch.len * (t - 0.5), 0]} rotation={[Math.random() * 0.4, 0, (j % 2 === 0 ? 1 : -1) * 0.8]}>
              <mesh>
                <cylinderGeometry args={[0.01, 0.025, 0.5, 4]} />
                <meshStandardMaterial color="#7a5540" roughness={0.85} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Blossom clusters on branches */}
      <BlossomClusters />

      {/* Roots at base */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2 + 0.3;
        return (
          <mesh key={`root-${i}`} position={[Math.cos(angle) * 0.2, -0.2, Math.sin(angle) * 0.2]} rotation={[0, angle, Math.PI / 2 - 0.3]}>
            <cylinderGeometry args={[0.02, 0.06, 0.6, 4]} />
            <meshStandardMaterial color="#4a2a18" roughness={0.95} />
          </mesh>
        );
      })}
    </group>
  );
};

const BlossomClusters: React.FC = () => {
  const blossoms = useMemo(() => {
    const items: { pos: [number, number, number]; scale: number; color: string }[] = [];
    const colors = ['#f0a0c0', '#e890b0', '#f5b8d0', '#e080a0', '#f0c0d8', '#d870a0'];
    // Scatter blossoms around branch tips
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.8 + Math.random() * 1.8;
      const height = 2.2 + Math.random() * 1.8;
      items.push({
        pos: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
        scale: 0.04 + Math.random() * 0.06,
        color: colors[i % colors.length],
      });
    }
    return items;
  }, []);

  return (
    <>
      {blossoms.map((b, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={0.2} floatIntensity={0.15}>
          <mesh position={b.pos}>
            <sphereGeometry args={[b.scale, 6, 6]} />
            <meshStandardMaterial
              color={b.color}
              emissive={b.color}
              emissiveIntensity={0.4}
              transparent
              opacity={0.85}
            />
          </mesh>
        </Float>
      ))}
      {/* Glow lights in the canopy */}
      <pointLight position={[0, 3.5, 0]} color="#f0a0c0" intensity={1.5} distance={5} decay={2} />
      <pointLight position={[1, 2.8, 0.5]} color="#f5b8d0" intensity={0.8} distance={3} decay={2} />
      <pointLight position={[-0.8, 3, -0.5]} color="#e890b0" intensity={0.8} distance={3} decay={2} />
    </>
  );
};

// ─── Flowing Water / Stream ─────────────────────────────────────
const WaterStream: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current || !matRef.current) return;
    const t = clock.elapsedTime;
    // Gentle undulation
    const pos = meshRef.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < pos.count; i++) {
      const x = arr[i * 3];
      const z = arr[i * 3 + 2];
      arr[i * 3 + 1] = Math.sin(x * 2 + t * 1.5) * 0.04 + Math.cos(z * 3 + t * 1.2) * 0.03;
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} position={[0, -3.6, -3]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[8, 4, 32, 16]} />
      <meshStandardMaterial
        ref={matRef}
        color="#88c8e8"
        emissive="#60a0c8"
        emissiveIntensity={0.15}
        transparent
        opacity={0.45}
        roughness={0.1}
        metalness={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Small ripple sparkles on water
const WaterSparkles: React.FC = () => {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 80;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 1] = -3.5 + Math.random() * 0.1;
      pos[i * 3 + 2] = -3 + (Math.random() - 0.5) * 3;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.3 + Math.sin(clock.elapsedTime * 2) * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#c0e8ff" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
};

// ─── Wind Burst Petals (triggered on transition) ────────────────
const WindBurstPetals: React.FC<{ active: boolean }> = ({ active }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [burst, setBurst] = useState(false);
  const petalsRef = useRef<THREE.Mesh[]>([]);

  const petalData = useMemo(() => {
    return Array.from({ length: 30 }, () => ({
      startPos: new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.3) * 4 + 1,
        (Math.random() - 0.5) * 4
      ),
      velocity: new THREE.Vector3(
        2 + Math.random() * 3,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ),
      rotSpeed: 2 + Math.random() * 4,
      color: ['#e88aaf', '#f0a0c0', '#d480a0', '#f5b8d0', '#c87098'][Math.floor(Math.random() * 5)],
    }));
  }, []);

  useEffect(() => {
    if (active) {
      setBurst(true);
      const timer = setTimeout(() => setBurst(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [active]);

  useFrame(({ clock }) => {
    if (!burst || !groupRef.current) return;
    petalsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const data = petalData[i];
      const t = clock.elapsedTime % 3;
      mesh.position.copy(data.startPos).addScaledVector(data.velocity, t * 0.8);
      mesh.position.y -= t * t * 0.3; // Gravity
      mesh.rotation.x = t * data.rotSpeed;
      mesh.rotation.z = t * data.rotSpeed * 0.7;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(0, 0.8 - t * 0.35);
    });
  });

  if (!burst) return null;

  return (
    <group ref={groupRef}>
      {petalData.map((data, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) petalsRef.current[i] = el; }}
          position={data.startPos.toArray() as [number, number, number]}
        >
          <planeGeometry args={[0.12, 0.18]} />
          <meshStandardMaterial
            color={data.color}
            emissive={data.color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

// ─── Ambient Falling Petals ─────────────────────────────────────
const FallingPetal: React.FC<{
  position: [number, number, number];
  color: string;
  speed: number;
  swayAmount: number;
  rotSpeed: number;
  delay: number;
}> = ({ position, color, speed, swayAmount, rotSpeed, delay }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const startY = position[1];
  const startX = position[0];

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = (clock.elapsedTime * speed + delay) % 14;
    meshRef.current.position.y = startY - t * 1.1;
    meshRef.current.position.x = startX + Math.sin(t * 1.3) * swayAmount;
    meshRef.current.position.z = position[2] + Math.cos(t * 0.7) * 0.4;
    meshRef.current.rotation.x = t * rotSpeed * 0.4;
    meshRef.current.rotation.y = t * rotSpeed * 0.25;
    meshRef.current.rotation.z = Math.sin(t * 1.8) * 0.6;

    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (t < 1.5) mat.opacity = (t / 1.5) * 0.7;
    else if (t > 12) mat.opacity = ((14 - t) / 2) * 0.7;
    else mat.opacity = 0.7;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[0.1, 0.14]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.25}
        transparent
        opacity={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// ─── Soft background particles ──────────────────────────────────
const SoftParticles: React.FC = () => {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.008;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#f0d0e0" transparent opacity={0.25} sizeAttenuation />
    </points>
  );
};

// ─── Camera ─────────────────────────────────────────────────────
const ReactiveCamera: React.FC<{ currentSection: number; totalSections: number; isTransitioning: boolean }> = ({ currentSection, totalSections, isTransitioning }) => {
  const targetPos = useRef(new THREE.Vector3(0, 0, 5));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    const progress = currentSection / (totalSections - 1);
    const angle = progress * Math.PI * 1.5;

    targetPos.current.set(
      Math.sin(angle) * 2.5 + Math.sin(t * 0.15) * 0.2,
      0.5 + Math.cos(angle * 0.5) * 1 + Math.cos(t * 0.12) * 0.15,
      6 - progress * 2
    );

    const speed = isTransitioning ? 0.025 : 0.012;
    camera.position.lerp(targetPos.current, speed);

    targetLook.current.set(
      Math.sin(t * 0.08) * 0.3,
      -0.5 + Math.cos(t * 0.06) * 0.2,
      -2
    );
    camera.lookAt(targetLook.current);
  });

  return null;
};

// ─── Main Scene ─────────────────────────────────────────────────
const SceneContent: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  const petals = useMemo(() => {
    const items: { position: [number, number, number]; color: string; speed: number; swayAmount: number; rotSpeed: number; delay: number }[] = [];
    const colors = ['#e88aaf', '#f0a0c0', '#d480a0', '#f5b8d0', '#c87098', '#eea0b8'];
    for (let i = 0; i < 35; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 14,
          6 + Math.random() * 6,
          (Math.random() - 0.5) * 8,
        ],
        color: colors[i % colors.length],
        speed: 0.25 + Math.random() * 0.4,
        swayAmount: 0.4 + Math.random() * 1.2,
        rotSpeed: 0.5 + Math.random() * 1.5,
        delay: Math.random() * 14,
      });
    }
    return items;
  }, []);

  return (
    <>
      {/* Soft atmospheric fog */}
      <fog attach="fog" args={['#f0e5f0', 10, 35]} />

      {/* Lighting — warm and bright */}
      <ambientLight intensity={0.7} color="#fff8fa" />
      <directionalLight position={[5, 8, 8]} intensity={0.9} color="#ffe8f0" />
      <directionalLight position={[-4, 6, -3]} intensity={0.4} color="#e0d0f0" />
      <hemisphereLight color="#ffe0f0" groundColor="#c0d8f0" intensity={0.3} />

      {/* The plum blossom tree */}
      <BlossomTree currentSection={currentSection} totalSections={totalSections} />

      {/* Water stream at tree base */}
      <WaterStream />
      <WaterSparkles />

      {/* Wind burst petals on transition */}
      <WindBurstPetals active={isTransitioning} />

      {/* Ambient falling petals */}
      {petals.map((petal, i) => (
        <FallingPetal key={i} {...petal} />
      ))}

      {/* Soft background particles */}
      <SoftParticles />

      <ReactiveCamera currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} />
    </>
  );
};

const Scene3D: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SceneContent currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
