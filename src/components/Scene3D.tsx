import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Floating lantern mesh
const Lantern: React.FC<{ position: [number, number, number]; color: string; speed?: number }> = ({ position, color, speed = 1 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed * 0.5) * 0.3;
      meshRef.current.rotation.y = clock.elapsedTime * 0.2 * speed;
    }
    if (glowRef.current) {
      glowRef.current.intensity = 1.5 + Math.sin(clock.elapsedTime * 2 * speed) * 0.5;
    }
  });

  return (
    <group>
      <Float speed={speed} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={meshRef} position={position}>
          <dodecahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.9} />
        </mesh>
      </Float>
      <pointLight ref={glowRef} position={position} color={color} intensity={1.5} distance={5} decay={2} />
    </group>
  );
};

// Floating path particles that form a winding road
const PathParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 500;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const color1 = new THREE.Color('hsl(25, 90%, 58%)');
    const color2 = new THREE.Color('hsl(340, 45%, 55%)');

    for (let i = 0; i < count; i++) {
      const t = (i / count) * 80 - 40;
      const angle = t * 0.3;
      pos[i * 3] = Math.sin(angle) * 3 + (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 1] = t;
      pos[i * 3 + 2] = Math.cos(angle) * 2 + (Math.random() - 0.5) * 1.5;

      const mixFactor = Math.random();
      const mixed = color1.clone().lerp(color2, mixFactor);
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

// Floating ember particles
const Embers: React.FC = () => {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      const posArray = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < posArray.length / 3; i++) {
        posArray[i * 3 + 1] += 0.005 + Math.sin(clock.elapsedTime + i) * 0.002;
        if (posArray[i * 3 + 1] > 40) posArray[i * 3 + 1] = -40;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="hsl(25, 90%, 58%)" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
};

// Camera controller that moves along a path based on scroll
const ScrollCamera: React.FC = () => {
  const { camera } = useThree();

  useFrame(() => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(scrollY / maxScroll, 1);

    // Camera moves downward along a spiral path
    const cameraY = -progress * 60;
    const cameraAngle = progress * Math.PI * 1.5;
    const cameraX = Math.sin(cameraAngle) * 2;
    const cameraZ = 8 + Math.cos(cameraAngle) * 2;

    camera.position.x += (cameraX - camera.position.x) * 0.05;
    camera.position.y += (cameraY - camera.position.y) * 0.05;
    camera.position.z += (cameraZ - camera.position.z) * 0.05;

    // Look slightly ahead on the path
    const lookY = cameraY - 3;
    const lookX = Math.sin(cameraAngle + 0.3) * 1;
    camera.lookAt(lookX, lookY, 0);
  });

  return null;
};

// Scene content
const SceneContent: React.FC = () => {
  const lanterns = useMemo(() => {
    const items: { position: [number, number, number]; color: string; speed: number }[] = [];
    const colors = ['#d4732a', '#c44a6e', '#d4a030', '#e88a5a', '#b84060'];
    for (let i = 0; i < 30; i++) {
      const y = -i * 4 + 5;
      items.push({
        position: [
          (Math.random() - 0.5) * 12,
          y,
          (Math.random() - 0.5) * 8,
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
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 10, 5]} intensity={0.3} color="#d4732a" />

      <Stars radius={50} depth={50} count={2000} factor={3} saturation={0.5} fade speed={0.5} />

      <PathParticles />
      <Embers />

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
        camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
};

export default Scene3D;
