import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import landscapeImg from '@/assets/blossom-landscape.jpg';

interface SceneProps {
  currentSection: number;
  totalSections: number;
  isTransitioning: boolean;
}

// ─── Panoramic Background ───────────────────────────────────────
const PanoramicBackground: React.FC<{ currentSection: number; totalSections: number }> = ({ currentSection, totalSections }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, landscapeImg);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    // Subtle parallax sway
    const t = clock.elapsedTime;
    meshRef.current.position.x = Math.sin(t * 0.08) * 0.3;
    meshRef.current.position.y = Math.cos(t * 0.06) * 0.1;
    // Slight zoom shift per section
    const progress = currentSection / (totalSections - 1);
    const targetScale = 16 + progress * 2;
    meshRef.current.scale.x += (targetScale * 1.78 - meshRef.current.scale.x) * 0.01;
    meshRef.current.scale.y += (targetScale - meshRef.current.scale.y) * 0.01;
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, -10]} scale={[28, 16, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

// ─── Water Reflection Overlay ───────────────────────────────────
const WaterSurface: React.FC = () => {
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
        Math.sin(ox * 0.8 + t * 1.5) * 0.08 +
        Math.cos(oz * 1.2 + t * 1.0) * 0.05 +
        Math.sin((ox + oz) * 0.5 + t * 0.6) * 0.04 +
        Math.sin(ox * 2.5 + t * 2.2) * 0.025;
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <group position={[0, -3.2, -4]}>
      <mesh ref={meshRef} rotation={[-Math.PI / 2.3, 0, 0]}>
        <planeGeometry args={[24, 10, 50, 25]} />
        <meshStandardMaterial
          color="#5aa8d0"
          emissive="#3878a0"
          emissiveIntensity={0.1}
          transparent
          opacity={0.35}
          roughness={0.02}
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Water shimmer particles */}
      <WaterShimmer />
    </group>
  );
};

const WaterShimmer: React.FC = () => {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const count = 150;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = 0.1 + Math.random() * 0.15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      spd[i] = 0.15 + Math.random() * 0.4;
    }
    return { positions: pos, speeds: spd };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < speeds.length; i++) {
      arr[i * 3] += speeds[i] * 0.003;
      arr[i * 3 + 1] = 0.1 + Math.sin(t * 2 + i * 0.4) * 0.06;
      if (arr[i * 3] > 10) arr[i * 3] = -10;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.3 + Math.sin(t * 1.8) * 0.12;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#d0eaff" transparent opacity={0.35} sizeAttenuation />
    </points>
  );
};

// ─── Wind-blown Petals (always active, stronger on transition) ──
const WindPetals: React.FC<{ isTransitioning: boolean }> = ({ isTransitioning }) => {
  const groupRef = useRef<THREE.Group>(null);
  const windStrength = useRef(1);

  const petals = useMemo(() => {
    return Array.from({ length: 60 }, () => ({
      x: (Math.random() - 0.5) * 20,
      y: -2 + Math.random() * 10,
      z: (Math.random() - 0.5) * 10,
      speedX: 0.5 + Math.random() * 1.5,
      speedY: 0.1 + Math.random() * 0.3,
      swayAmp: 0.3 + Math.random() * 1.0,
      swayFreq: 0.5 + Math.random() * 1.5,
      rotSpeed: 1 + Math.random() * 3,
      delay: Math.random() * 20,
      size: 0.05 + Math.random() * 0.08,
      color: ['#e87aaa', '#f090b8', '#d06890', '#f5a8c8', '#c05880', '#f8b0d0', '#ffffff'][Math.floor(Math.random() * 7)],
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Ramp wind strength
    const targetWind = isTransitioning ? 4 : 1;
    windStrength.current += (targetWind - windStrength.current) * 0.03;

    const t = clock.elapsedTime;
    const w = windStrength.current;

    groupRef.current.children.forEach((child, i) => {
      if (!(child instanceof THREE.Mesh)) return;
      const p = petals[i];
      if (!p) return;

      const elapsed = (t + p.delay) % 20;
      const progress = elapsed / 20;

      // Petals blow from left to right, falling slightly
      child.position.x = p.x + elapsed * p.speedX * w * 0.3 - 10;
      child.position.y = p.y - elapsed * p.speedY + Math.sin(elapsed * p.swayFreq) * p.swayAmp;
      child.position.z = p.z + Math.cos(elapsed * p.swayFreq * 0.7) * 0.5;

      // Wrap around
      if (child.position.x > 12) child.position.x -= 24;

      // Tumble
      child.rotation.x = elapsed * p.rotSpeed * w * 0.3;
      child.rotation.y = Math.sin(elapsed * 2) * 1.2;
      child.rotation.z = elapsed * p.rotSpeed * 0.4;

      const mat = child.material as THREE.MeshStandardMaterial;
      // Fade near edges
      if (progress < 0.05) mat.opacity = progress * 14;
      else if (progress > 0.95) mat.opacity = (1 - progress) * 14;
      else mat.opacity = 0.7;
    });
  });

  return (
    <group ref={groupRef}>
      {petals.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <planeGeometry args={[p.size, p.size * 1.4]} />
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

// ─── Soft floating particles (pollen/light) ─────────────────────
const FloatingMotes: React.FC = () => {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 80;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.004;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.2 + Math.sin(clock.elapsedTime * 0.5) * 0.08;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ffe8f0" transparent opacity={0.25} sizeAttenuation />
    </points>
  );
};

// ─── Camera ─────────────────────────────────────────────────────
const ReactiveCamera: React.FC<{ currentSection: number; totalSections: number; isTransitioning: boolean }> = ({ currentSection, totalSections, isTransitioning }) => {
  const targetPos = useRef(new THREE.Vector3(0, 0, 6));

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    const progress = currentSection / (totalSections - 1);

    // Camera moves slightly between sections - like gliding over water
    targetPos.current.set(
      Math.sin(progress * Math.PI) * 1.5 + Math.sin(t * 0.1) * 0.2,
      0.3 + Math.sin(t * 0.08) * 0.15,
      7 - progress * 1.5
    );

    const speed = isTransitioning ? 0.03 : 0.008;
    camera.position.lerp(targetPos.current, speed);
    camera.lookAt(0, -0.5, -5);
  });

  return null;
};

// ─── Main Scene ─────────────────────────────────────────────────
const SceneContent: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.8} color="#fff8fa" />
      <directionalLight position={[3, 8, 5]} intensity={0.6} color="#ffe8f0" />
      <hemisphereLight color="#88ccff" groundColor="#f0c8e0" intensity={0.4} />

      {/* Full landscape background */}
      <PanoramicBackground currentSection={currentSection} totalSections={totalSections} />

      {/* Water surface overlay in front */}
      <WaterSurface />

      {/* Wind-blown petals — always active, stronger on transition */}
      <WindPetals isTransitioning={isTransitioning} />

      {/* Floating light motes */}
      <FloatingMotes />

      <ReactiveCamera currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} />
    </>
  );
};

const Scene3D: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0.3, 7], fov: 55, near: 0.1, far: 80 }}
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
