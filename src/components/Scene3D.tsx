import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

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

// Tunnel-like particles that streak past as camera moves forward
const TunnelParticles: React.FC = () => {
  const ref = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const count = 600;
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Spread in a cylinder around the Z-axis (the travel path)
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 8;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100; // spread along Z
      sz[i] = 0.02 + Math.random() * 0.04;
    }
    return { positions: pos, sizes: sz };
  }, []);

  useFrame(() => {
    if (ref.current) {
      // Move with scroll to create parallax — camera moves forward, particles stay
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollY / maxScroll;
      ref.current.position.z = progress * 50;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="hsl(25, 90%, 58%)" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
};

// Camera that moves FORWARD (along Z) with scroll
const ScrollCamera: React.FC = () => {
  const { camera } = useThree();
  const targetZ = useRef(0);

  useFrame(() => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(scrollY / maxScroll, 1);

    // Camera flies forward along Z
    targetZ.current = progress * 60;
    camera.position.z += (targetZ.current - camera.position.z) * 0.03;

    // Subtle sway
    camera.position.x = Math.sin(progress * Math.PI * 2) * 0.5;
    camera.position.y = Math.cos(progress * Math.PI * 3) * 0.3;

    camera.lookAt(camera.position.x * 0.5, 0, camera.position.z + 10);
  });

  return null;
};

const SceneContent: React.FC = () => {
  const lanterns = useMemo(() => {
    const items: { position: [number, number, number]; color: string; speed: number }[] = [];
    const colors = ['#d4732a', '#c44a6e', '#d4a030', '#e88a5a', '#b84060'];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 6;
      items.push({
        position: [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 5,
          i * 1.8, // spread along Z (the travel path)
        ],
        color: colors[i % colors.length],
        speed: 0.5 + Math.random() * 1.5,
      });
    }
    return items;
  }, []);

  return (
    <>
      <fog attach="fog" args={['hsl(30, 40%, 6%)', 3, 30]} />
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 5, 10]} intensity={0.2} color="#d4732a" />

      <Stars radius={40} depth={60} count={3000} factor={2.5} saturation={0.3} fade speed={0.3} />
      <TunnelParticles />

      {lanterns.map((lantern, i) => (
        <Lantern key={i} {...lantern} />
      ))}

      <ScrollCamera />
    </>
  );
};

const Scene3D: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 0], fov: 65, near: 0.1, far: 120 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
};

export default Scene3D;
