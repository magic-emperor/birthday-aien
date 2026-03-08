import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  currentSection: number;
  totalSections: number;
  isTransitioning: boolean;
}

// Plum blossom petal shape
const PetalGeometry: React.FC = () => {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.06, 0.1, 0.12, 0.15, 0.08, 0.25);
    shape.bezierCurveTo(0.04, 0.3, -0.04, 0.3, -0.08, 0.25);
    shape.bezierCurveTo(-0.12, 0.15, -0.06, 0.1, 0, 0);
    const geo = new THREE.ShapeGeometry(shape);
    return geo;
  }, []);

  return <primitive object={geometry} attach="geometry" />;
};

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
    const t = (clock.elapsedTime * speed + delay) % 12;
    
    // Fall down slowly
    meshRef.current.position.y = startY - t * 1.2;
    // Sway side to side
    meshRef.current.position.x = startX + Math.sin(t * 1.5) * swayAmount;
    meshRef.current.position.z = position[2] + Math.cos(t * 0.8) * 0.3;
    
    // Tumble gently
    meshRef.current.rotation.x = t * rotSpeed * 0.5;
    meshRef.current.rotation.y = t * rotSpeed * 0.3;
    meshRef.current.rotation.z = Math.sin(t * 2) * 0.5;

    // Fade at edges
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (t < 1) mat.opacity = t * 0.8;
    else if (t > 10) mat.opacity = (12 - t) * 0.4;
    else mat.opacity = 0.75;
  });

  return (
    <mesh ref={meshRef} position={position} scale={[1.2, 1.2, 1]}>
      <PetalGeometry />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        transparent
        opacity={0.75}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const BlossomBranch: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={groupRef} position={position}>
        {/* Small glowing blossom cluster */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i / 5) * Math.PI * 2;
          const r = 0.15;
          return (
            <mesh key={i} position={[Math.cos(angle) * r, Math.sin(angle) * r, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial
                color="#f0a0c0"
                emissive="#e080a0"
                emissiveIntensity={0.6}
                transparent
                opacity={0.8}
              />
            </mesh>
          );
        })}
        {/* Center */}
        <mesh>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ffe0a0" emissive="#ffd080" emissiveIntensity={1} />
        </mesh>
        <pointLight color="#f0a0c0" intensity={0.5} distance={3} decay={2} />
      </group>
    </Float>
  );
};

const DriftingParticles: React.FC = () => {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 300;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#f5c0d8" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
};

const ReactiveCamera: React.FC<{ currentSection: number; totalSections: number; isTransitioning: boolean }> = ({ currentSection, totalSections, isTransitioning }) => {
  const targetPos = useRef(new THREE.Vector3(0, 0, 5));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    const progress = currentSection / (totalSections - 1);

    const angle = progress * Math.PI * 2;
    targetPos.current.set(
      Math.sin(angle) * 2 + Math.sin(t * 0.2) * 0.3,
      Math.cos(angle * 0.5) * 1.5 + Math.cos(t * 0.15) * 0.2,
      5 - progress * 3
    );

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
  const petals = useMemo(() => {
    const items: { position: [number, number, number]; color: string; speed: number; swayAmount: number; rotSpeed: number; delay: number }[] = [];
    const colors = ['#e88aaf', '#f0a0c0', '#d480a0', '#f5b8d0', '#c87098', '#eea0b8'];
    for (let i = 0; i < 40; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 16,
          5 + Math.random() * 8,
          (Math.random() - 0.5) * 10,
        ],
        color: colors[i % colors.length],
        speed: 0.3 + Math.random() * 0.5,
        swayAmount: 0.5 + Math.random() * 1.5,
        rotSpeed: 0.5 + Math.random() * 1.5,
        delay: Math.random() * 12,
      });
    }
    return items;
  }, []);

  const blossoms = useMemo(() => {
    const items: [number, number, number][] = [];
    for (let i = 0; i < 8; i++) {
      items.push([
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 6,
        -2 + (Math.random() - 0.5) * 6,
      ]);
    }
    return items;
  }, []);

  return (
    <>
      <fog attach="fog" args={['#e8dff0', 8, 30]} />
      <ambientLight intensity={0.6} color="#fff5f8" />
      <directionalLight position={[5, 8, 10]} intensity={0.8} color="#ffe8f0" />
      <directionalLight position={[-3, 5, -5]} intensity={0.3} color="#d8c0f0" />

      {/* Soft sky particles */}
      <DriftingParticles />

      {/* Falling plum petals */}
      {petals.map((petal, i) => (
        <FallingPetal key={i} {...petal} />
      ))}

      {/* Blossom clusters floating */}
      {blossoms.map((pos, i) => (
        <BlossomBranch key={i} position={pos} />
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
