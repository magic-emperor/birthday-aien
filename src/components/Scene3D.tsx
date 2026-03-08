import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  currentSection: number;
  totalSections: number;
  isTransitioning: boolean;
}

const Lantern: React.FC<{ position: [number, number, number]; color: string; speed?: number }> = ({ position, color, speed = 1 }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed * 0.5) * 0.3;
      meshRef.current.rotation.y = clock.elapsedTime * 0.3 * speed;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <dodecahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={0.85} />
      </mesh>
      <pointLight position={position} color={color} intensity={1} distance={4} decay={2} />
    </Float>
  );
};

const DriftingParticles: React.FC = () => {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 400;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.02;
      ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="hsl(25, 90%, 58%)" transparent opacity={0.25} sizeAttenuation />
    </points>
  );
};

// Camera that reacts to section changes with smooth movement
const ReactiveCamera: React.FC<{ currentSection: number; totalSections: number; isTransitioning: boolean }> = ({ currentSection, totalSections, isTransitioning }) => {
  const targetPos = useRef(new THREE.Vector3(0, 0, 5));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    const progress = currentSection / (totalSections - 1);

    // Camera spirals gently based on current section
    const angle = progress * Math.PI * 2;
    targetPos.current.set(
      Math.sin(angle) * 2 + Math.sin(t * 0.2) * 0.3,
      Math.cos(angle * 0.5) * 1.5 + Math.cos(t * 0.15) * 0.2,
      5 - progress * 3
    );

    // Smooth lerp
    const speed = isTransitioning ? 0.02 : 0.01;
    camera.position.lerp(targetPos.current, speed);
    
    targetLook.current.set(
      Math.sin(t * 0.1) * 0.5,
      Math.cos(t * 0.08) * 0.3,
      0
    );
    camera.lookAt(targetLook.current);
  });

  return null;
};

const SceneContent: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  const lanterns = useMemo(() => {
    const items: { position: [number, number, number]; color: string; speed: number }[] = [];
    const colors = ['#d4732a', '#c44a6e', '#d4a030', '#e88a5a', '#b84060'];
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 6;
      items.push({
        position: [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 10,
        ],
        color: colors[i % colors.length],
        speed: 0.5 + Math.random() * 1.5,
      });
    }
    return items;
  }, []);

  return (
    <>
      <fog attach="fog" args={['hsl(30, 40%, 6%)', 5, 25]} />
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 5, 10]} intensity={0.2} color="#d4732a" />

      <Stars radius={30} depth={50} count={2000} factor={2.5} saturation={0.3} fade speed={0.3} />
      <DriftingParticles />

      {lanterns.map((lantern, i) => (
        <Lantern key={i} {...lantern} />
      ))}

      <ReactiveCamera currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} />
    </>
  );
};

const Scene3D: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 65, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SceneContent currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
