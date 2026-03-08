import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SceneProps {
  currentSection: number;
  totalSections: number;
  isTransitioning: boolean;
}

// ─── Weeping Branch: a curved line of segments with blossoms ────
const WeepingBranch: React.FC<{
  origin: [number, number, number];
  direction: [number, number, number];
  length: number;
  droop: number;
  thickness: number;
  blossomDensity: number;
  time: number;
  windStrength: number;
}> = ({ origin, direction, length, droop, thickness, blossomDensity, time, windStrength }) => {
  const segments = 12;
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = origin[0] + direction[0] * t * length;
      const y = origin[1] + direction[1] * t * length - t * t * droop;
      const z = origin[2] + direction[2] * t * length;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, [origin, direction, length, droop]);

  // Animate points for wind sway
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    // Sway the tip more than the base
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
        const t = i / groupRef.current!.children.length;
        const sway = Math.sin(time * 0.8 + t * 3) * windStrength * t * t;
        const swayZ = Math.cos(time * 0.6 + t * 2) * windStrength * 0.5 * t * t;
        child.position.x = (child.userData.baseX || 0) + sway;
        child.position.z = (child.userData.baseZ || 0) + swayZ;
      }
    });
  });

  const blossomPositions = useMemo(() => {
    const bps: { pos: THREE.Vector3; size: number; color: string }[] = [];
    const colors = ['#e87aaa', '#f090b8', '#d06890', '#f5a8c8', '#c05880', '#f0c0d8', '#e068a0', '#f8b0d0'];
    for (let i = 2; i <= segments; i++) {
      const count = Math.floor(blossomDensity * (0.5 + Math.random()));
      for (let j = 0; j < count; j++) {
        const base = points[i];
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 0.25,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.25
        );
        bps.push({
          pos: base.clone().add(offset),
          size: 0.02 + Math.random() * 0.04,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }
    return bps;
  }, [points, blossomDensity]);

  return (
    <group ref={groupRef}>
      {/* Branch segments */}
      {points.slice(0, -1).map((pt, i) => {
        const next = points[i + 1];
        const mid = pt.clone().add(next).multiplyScalar(0.5);
        const dir = next.clone().sub(pt);
        const len = dir.length();
        const axis = new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion().setFromUnitVectors(axis, dir.normalize());
        const t = i / segments;
        const rad = thickness * (1 - t * 0.7);

        return (
          <mesh
            key={`seg-${i}`}
            position={[mid.x, mid.y, mid.z]}
            quaternion={quat}
            userData={{ baseX: mid.x, baseZ: mid.z }}
          >
            <cylinderGeometry args={[rad * 0.6, rad, len, 5]} />
            <meshStandardMaterial color="#5a3525" roughness={0.9} />
          </mesh>
        );
      })}

      {/* Blossoms along branch */}
      {blossomPositions.map((b, i) => (
        <group key={`bl-${i}`} position={[b.pos.x, b.pos.y, b.pos.z]} userData={{ baseX: b.pos.x, baseZ: b.pos.z }}>
          {/* 5 petals arranged in a flower */}
          {[0, 1, 2, 3, 4].map((p) => {
            const angle = (p / 5) * Math.PI * 2;
            const px = Math.cos(angle) * b.size * 1.2;
            const py = Math.sin(angle) * b.size * 1.2;
            return (
              <mesh key={p} position={[px, py, 0]} rotation={[0, 0, angle]}>
                <sphereGeometry args={[b.size, 4, 4]} />
                <meshStandardMaterial
                  color={b.color}
                  emissive={b.color}
                  emissiveIntensity={0.35}
                  transparent
                  opacity={0.85}
                />
              </mesh>
            );
          })}
          {/* Flower center */}
          <mesh>
            <sphereGeometry args={[b.size * 0.5, 4, 4]} />
            <meshStandardMaterial color="#ffe8a0" emissive="#ffd860" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ─── Full Plum Blossom Tree ─────────────────────────────────────
const PlumBlossomTree: React.FC<{ currentSection: number; totalSections: number }> = ({ currentSection, totalSections }) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(0);
  const timeRef = useRef(0);
  const [windStrength, setWindStrength] = useState(0.15);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    timeRef.current = clock.elapsedTime;
    targetRotation.current = (currentSection / (totalSections - 1)) * Math.PI * 1.8;
    groupRef.current.rotation.y += (targetRotation.current - groupRef.current.rotation.y) * 0.012;
    groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.3) * 0.02;
  });

  // Weeping branches radiating outward and drooping down
  const branches = useMemo(() => {
    const items: {
      origin: [number, number, number];
      direction: [number, number, number];
      length: number;
      droop: number;
      thickness: number;
      blossomDensity: number;
    }[] = [];

    // Main upward branches that then have sub-weeping branches
    const mainCount = 7;
    for (let i = 0; i < mainCount; i++) {
      const angle = (i / mainCount) * Math.PI * 2 + Math.random() * 0.3;
      const tilt = 0.3 + Math.random() * 0.4;
      const upness = 0.6 + Math.random() * 0.3;

      // Main structural branch
      items.push({
        origin: [0, 1.8 + Math.random() * 0.8, 0],
        direction: [Math.cos(angle) * tilt, upness, Math.sin(angle) * tilt],
        length: 1.5 + Math.random() * 0.8,
        droop: 0.3 + Math.random() * 0.3,
        thickness: 0.04 + Math.random() * 0.02,
        blossomDensity: 3 + Math.floor(Math.random() * 3),
      });

      // Weeping sub-branches (the cascading ones from the image)
      const subCount = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < subCount; j++) {
        const subAngle = angle + (Math.random() - 0.5) * 0.8;
        const branchT = 0.4 + Math.random() * 0.5;
        const mainLen = 1.5 + Math.random() * 0.8;
        const originY = 1.8 + Math.random() * 0.8 + upness * branchT * mainLen - branchT * branchT * (0.3 + Math.random() * 0.3);
        const originX = Math.cos(angle) * tilt * branchT * mainLen;
        const originZ = Math.sin(angle) * tilt * branchT * mainLen;

        items.push({
          origin: [originX, originY, originZ],
          direction: [
            Math.cos(subAngle) * (0.2 + Math.random() * 0.3),
            -0.1 - Math.random() * 0.2,  // Drooping direction
            Math.sin(subAngle) * (0.2 + Math.random() * 0.3),
          ],
          length: 1.0 + Math.random() * 1.2,
          droop: 1.5 + Math.random() * 2.0,  // Heavy droop = weeping effect
          thickness: 0.015 + Math.random() * 0.015,
          blossomDensity: 4 + Math.floor(Math.random() * 4),
        });
      }
    }

    return items;
  }, []);

  return (
    <group ref={groupRef} position={[0, -3, -3]} scale={[1.3, 1.3, 1.3]}>
      {/* Trunk */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.06, 0.14, 2.2, 8]} />
        <meshStandardMaterial color="#4a2a18" roughness={0.95} />
      </mesh>
      {/* Trunk texture lines */}
      {[0, 1, 2].map((i) => (
        <mesh key={`bark-${i}`} position={[Math.sin(i * 2.1) * 0.08, 0.5 + i * 0.5, Math.cos(i * 2.1) * 0.08]}>
          <cylinderGeometry args={[0.07, 0.1, 0.4, 6]} />
          <meshStandardMaterial color="#3a1a10" roughness={1} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* All weeping branches */}
      {branches.map((b, i) => (
        <WeepingBranch
          key={i}
          {...b}
          time={timeRef.current}
          windStrength={windStrength}
        />
      ))}

      {/* Canopy glow lights */}
      <pointLight position={[0, 3, 0]} color="#f090b8" intensity={2} distance={6} decay={2} />
      <pointLight position={[1.5, 2.5, 1]} color="#f5a8c8" intensity={1} distance={4} decay={2} />
      <pointLight position={[-1, 2.8, -0.5]} color="#e878a8" intensity={1} distance={4} decay={2} />
    </group>
  );
};

// ─── Flowing Water Surface ──────────────────────────────────────
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
      // Multiple wave layers for realistic water
      arr[i * 3 + 1] =
        Math.sin(ox * 1.5 + t * 2.0) * 0.06 +
        Math.cos(oz * 2.0 + t * 1.5) * 0.04 +
        Math.sin((ox + oz) * 0.8 + t * 0.8) * 0.03 +
        Math.sin(ox * 4 + t * 3) * 0.015;  // Small ripples
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <group position={[0, -3.8, -3]}>
      {/* Main water surface */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 6, 48, 24]} />
        <meshStandardMaterial
          color="#78b8d8"
          emissive="#4890b0"
          emissiveIntensity={0.15}
          transparent
          opacity={0.55}
          roughness={0.05}
          metalness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Water depth layer */}
      <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 6, 1, 1]} />
        <meshStandardMaterial
          color="#507090"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Flowing light reflections */}
      <WaterReflections />
    </group>
  );
};

const WaterReflections: React.FC = () => {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const count = 120;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = 0.05 + Math.random() * 0.1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      spd[i] = 0.3 + Math.random() * 0.7;
    }
    return { positions: pos, speeds: spd };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < speeds.length; i++) {
      // Drift slowly
      arr[i * 3] += speeds[i] * 0.003;
      arr[i * 3 + 1] = 0.05 + Math.sin(t * 2 + i) * 0.05;
      // Reset if drifted too far
      if (arr[i * 3] > 5) arr[i * 3] = -5;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    // Twinkle
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.35 + Math.sin(t * 3) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#d0e8ff" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
};

// ─── Wind Burst Petals ──────────────────────────────────────────
const WindBurstPetals: React.FC<{ active: boolean }> = ({ active }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [burst, setBurst] = useState(false);
  const startTime = useRef(0);

  const petalData = useMemo(() => {
    return Array.from({ length: 40 }, () => ({
      startPos: new THREE.Vector3(
        -3 + Math.random() * 2,
        (Math.random()) * 4,
        (Math.random() - 0.5) * 3
      ),
      velocity: new THREE.Vector3(
        2.5 + Math.random() * 4,
        (Math.random() - 0.3) * 2.5,
        (Math.random() - 0.5) * 2
      ),
      rotSpeed: 2 + Math.random() * 5,
      size: 0.06 + Math.random() * 0.08,
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
      const t = elapsed;
      child.position.set(
        data.startPos.x + data.velocity.x * t * 0.7,
        data.startPos.y + data.velocity.y * t - t * t * 0.25,
        data.startPos.z + data.velocity.z * t * 0.5
      );
      child.rotation.x = t * data.rotSpeed;
      child.rotation.z = t * data.rotSpeed * 0.6;
      child.rotation.y = Math.sin(t * 3) * 1;
      const mat = child.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(0, 0.85 - elapsed * 0.3);
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
    return Array.from({ length: 45 }, () => ({
      startX: (Math.random() - 0.5) * 14,
      startY: 5 + Math.random() * 8,
      startZ: (Math.random() - 0.5) * 8,
      speed: 0.2 + Math.random() * 0.35,
      swayAmount: 0.5 + Math.random() * 1.5,
      swaySpeed: 0.8 + Math.random() * 1.2,
      rotSpeed: 0.3 + Math.random() * 1.2,
      delay: Math.random() * 16,
      size: 0.05 + Math.random() * 0.06,
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

      child.position.y = p.startY - elapsed * 1.0;
      child.position.x = p.startX + Math.sin(elapsed * p.swaySpeed) * p.swayAmount;
      child.position.z = p.startZ + Math.cos(elapsed * p.swaySpeed * 0.7) * 0.4;
      child.rotation.x = elapsed * p.rotSpeed * 0.4;
      child.rotation.y = elapsed * p.rotSpeed * 0.25;
      child.rotation.z = Math.sin(elapsed * 1.5) * 0.7;

      const mat = child.material as THREE.MeshStandardMaterial;
      if (elapsed < 1.5) mat.opacity = (elapsed / 1.5) * 0.65;
      else if (elapsed > 14) mat.opacity = ((16 - elapsed) / 2) * 0.65;
      else mat.opacity = 0.65;
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
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

// ─── Soft background particles ──────────────────────────────────
const SoftParticles: React.FC = () => {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 150;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.006;
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
  const targetLook = useRef(new THREE.Vector3(0, -1, -2));

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    const progress = currentSection / (totalSections - 1);
    const angle = progress * Math.PI * 1.5;

    targetPos.current.set(
      Math.sin(angle) * 3 + Math.sin(t * 0.12) * 0.2,
      0.8 + Math.cos(angle * 0.5) * 0.8 + Math.cos(t * 0.1) * 0.1,
      6.5 - progress * 2
    );

    const speed = isTransitioning ? 0.025 : 0.01;
    camera.position.lerp(targetPos.current, speed);

    targetLook.current.set(
      Math.sin(t * 0.07) * 0.3,
      -0.8 + Math.cos(t * 0.05) * 0.2,
      -2
    );
    camera.lookAt(targetLook.current);
  });

  return null;
};

// ─── Main Scene ─────────────────────────────────────────────────
const SceneContent: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  return (
    <>
      <fog attach="fog" args={['#f0e5f0', 10, 35]} />

      {/* Warm bright lighting */}
      <ambientLight intensity={0.65} color="#fff8fa" />
      <directionalLight position={[4, 8, 6]} intensity={0.9} color="#ffe8f0" />
      <directionalLight position={[-3, 5, -4]} intensity={0.35} color="#e0d0f0" />
      <hemisphereLight color="#ffe0f0" groundColor="#c0d8f0" intensity={0.3} />

      {/* Sun glow */}
      <pointLight position={[2, 6, -2]} color="#fff0e0" intensity={1.5} distance={15} decay={2} />

      {/* The plum blossom tree */}
      <PlumBlossomTree currentSection={currentSection} totalSections={totalSections} />

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
        camera={{ position: [0, 0.5, 6.5], fov: 55, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SceneContent currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
