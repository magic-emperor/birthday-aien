import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import blossomBranchImg from '@/assets/blossom-branch.png';

interface SceneProps {
  currentSection: number;
  totalSections: number;
  isTransitioning: boolean;
}

type TreeData = {
  position: [number, number, number];
  scale: number;
  seed: number;
};

const SkyAtmosphere: React.FC = () => {
  return (
    <>
      <mesh position={[0, 15, -70]}>
        <sphereGeometry args={[90, 40, 24]} />
        <meshBasicMaterial color="hsl(203 90% 86%)" side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, 20, -85]}>
        <circleGeometry args={[6, 32]} />
        <meshBasicMaterial color="hsl(48 100% 92%)" transparent opacity={0.7} />
      </mesh>
    </>
  );
};

const MountainRange: React.FC = () => {
  return (
    <group position={[0, -2.1, -96]}>
      <mesh position={[0, 12, 0]}>
        <coneGeometry args={[18, 22, 7]} />
        <meshStandardMaterial color="hsl(219 28% 44%)" roughness={0.85} />
      </mesh>
      <mesh position={[0, 20, 0]}>
        <coneGeometry args={[6.5, 7.5, 6]} />
        <meshStandardMaterial color="hsl(210 40% 97%)" roughness={0.4} />
      </mesh>

      <mesh position={[-17, 8, 8]}>
        <coneGeometry args={[11, 14, 6]} />
        <meshStandardMaterial color="hsl(220 22% 37%)" roughness={0.9} />
      </mesh>
      <mesh position={[16, 7.5, 7]}>
        <coneGeometry args={[10, 13, 6]} />
        <meshStandardMaterial color="hsl(220 20% 39%)" roughness={0.9} />
      </mesh>
    </group>
  );
};

const LandBanks: React.FC = () => {
  return (
    <group>
      <mesh position={[-9, -2.95, -45]} rotation={[-Math.PI / 2, 0.09, 0.03]}>
        <planeGeometry args={[16, 120]} />
        <meshStandardMaterial color="hsl(122 32% 42%)" roughness={0.95} />
      </mesh>
      <mesh position={[9, -2.95, -45]} rotation={[-Math.PI / 2, -0.09, -0.03]}>
        <planeGeometry args={[16, 120]} />
        <meshStandardMaterial color="hsl(122 30% 44%)" roughness={0.95} />
      </mesh>
    </group>
  );
};

const FlowingWater: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);
  const basePositionsRef = useRef<Float32Array | null>(null);

  useFrame(({ clock }) => {
    if (!waterRef.current) return;

    const geo = waterRef.current.geometry;
    const position = geo.attributes.position;
    const arr = position.array as Float32Array;

    if (!basePositionsRef.current) {
      basePositionsRef.current = new Float32Array(arr);
    }

    const base = basePositionsRef.current;
    const t = clock.elapsedTime;

    for (let i = 0; i < position.count; i++) {
      const x = base[i * 3];
      const z = base[i * 3 + 2];
      arr[i * 3 + 1] =
        Math.sin((z + t * 8) * 0.18) * 0.08 +
        Math.cos((x * 1.6) + t * 1.8) * 0.06 +
        Math.sin((x + z) * 0.1 + t * 1.2) * 0.05;
    }

    position.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <group position={[0, -2.85, -45]}>
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 120, 52, 200]} />
        <meshStandardMaterial
          color="hsl(201 62% 55%)"
          emissive="hsl(199 65% 42%)"
          emissiveIntensity={0.15}
          transparent
          opacity={0.62}
          roughness={0.06}
          metalness={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 120]} />
        <meshStandardMaterial color="hsl(205 46% 33%)" transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const BlossomTree: React.FC<{ data: TreeData; texture: THREE.Texture }> = ({ data, texture }) => {
  const groupRef = useRef<THREE.Group>(null);

  const blossomSprites = useMemo(() => {
    return Array.from({ length: 9 }, (_, i) => {
      const ring = i < 5 ? 0.9 : 1.4;
      const angle = (i / 9) * Math.PI * 2 + data.seed * 3;
      return {
        x: Math.cos(angle) * ring,
        y: 1.8 + (i % 3) * 0.45,
        z: Math.sin(angle) * ring,
        scale: (1.9 + (i % 4) * 0.35) * data.scale,
      };
    });
  }, [data.scale, data.seed]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const sway = Math.sin(clock.elapsedTime * 0.65 + data.seed * 6) * 0.03;
    groupRef.current.rotation.z = sway;
    groupRef.current.rotation.y = sway * 0.45;
  });

  return (
    <group ref={groupRef} position={data.position} scale={[data.scale, data.scale, data.scale]}>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.09, 0.16, 2, 8]} />
        <meshStandardMaterial color="hsl(20 34% 28%)" roughness={0.95} />
      </mesh>

      <mesh position={[0.16, 1.8, 0.05]} rotation={[0, 0, 0.72]}>
        <cylinderGeometry args={[0.03, 0.07, 1.4, 6]} />
        <meshStandardMaterial color="hsl(20 30% 30%)" roughness={0.9} />
      </mesh>
      <mesh position={[-0.18, 1.72, -0.03]} rotation={[0, 0, -0.76]}>
        <cylinderGeometry args={[0.03, 0.07, 1.45, 6]} />
        <meshStandardMaterial color="hsl(20 30% 30%)" roughness={0.9} />
      </mesh>

      {blossomSprites.map((sprite, i) => (
        <sprite key={i} position={[sprite.x, sprite.y, sprite.z]} scale={[sprite.scale * 1.35, sprite.scale, 1]}>
          <spriteMaterial
            map={texture}
            transparent
            opacity={0.9}
            depthWrite={false}
            alphaTest={0.15}
            color="hsl(330 75% 92%)"
          />
        </sprite>
      ))}
    </group>
  );
};

const TreeRows: React.FC = () => {
  const branchTexture = useLoader(THREE.TextureLoader, blossomBranchImg);

  const trees = useMemo<TreeData[]>(() => {
    const items: TreeData[] = [];

    for (let i = 0; i < 18; i++) {
      const z = 6 - i * 6.5;

      items.push({
        position: [-(6.5 + Math.random() * 2.2), -2.9, z + (Math.random() - 0.5) * 1.2],
        scale: 1 + Math.random() * 0.25,
        seed: Math.random(),
      });

      items.push({
        position: [6.5 + Math.random() * 2.2, -2.9, z + (Math.random() - 0.5) * 1.2],
        scale: 1 + Math.random() * 0.25,
        seed: Math.random(),
      });
    }

    return items;
  }, []);

  return (
    <group>
      {trees.map((tree, idx) => (
        <BlossomTree key={idx} data={tree} texture={branchTexture} />
      ))}
    </group>
  );
};

const WindPetals: React.FC<{ isTransitioning: boolean }> = ({ isTransitioning }) => {
  const groupRef = useRef<THREE.Group>(null);
  const gustRef = useRef(0);
  const previousTransitionRef = useRef(false);

  const petals = useMemo(
    () =>
      Array.from({ length: 140 }, () => ({
        depth: -100 + Math.random() * 120,
        yOffset: Math.random() * 8,
        offset: Math.random() * 30,
        speed: 0.65 + Math.random() * 1.4,
        sway: 0.7 + Math.random() * 1.8,
        size: 0.055 + Math.random() * 0.06,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    if (isTransitioning && !previousTransitionRef.current) {
      gustRef.current = 1;
    }
    previousTransitionRef.current = isTransitioning;
    gustRef.current = Math.max(0, gustRef.current - 0.02);

    const wind = 1 + gustRef.current * 2.7;
    const t = clock.elapsedTime;

    groupRef.current.children.forEach((child, index) => {
      if (!(child instanceof THREE.Mesh)) return;
      const petal = petals[index];
      if (!petal) return;

      const cycle = (t * petal.speed * wind + petal.offset) % 28;
      const x = -12 + ((cycle * 1.25) % 24);
      const y = 5 - cycle * 0.34 + Math.sin(cycle * petal.sway) * 0.55 + petal.yOffset;
      const z = petal.depth + Math.sin(cycle * 0.45 + petal.offset) * 1.1;

      child.position.set(x, y, z);
      child.rotation.x = cycle * 0.8;
      child.rotation.y = Math.sin(cycle * 1.8) * 1.3;
      child.rotation.z = cycle * 0.65;

      const mat = child.material as THREE.MeshStandardMaterial;
      const edgeFade = y > 4.8 || y < -3.6 ? 0.15 : 0.78;
      mat.opacity = edgeFade;
    });
  });

  return (
    <group ref={groupRef}>
      {petals.map((petal, index) => (
        <mesh key={index} position={[0, 0, petal.depth]}>
          <planeGeometry args={[petal.size, petal.size * 1.5]} />
          <meshStandardMaterial
            color="hsl(332 78% 74%)"
            emissive="hsl(333 64% 66%)"
            emissiveIntensity={0.25}
            transparent
            opacity={0.78}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

const ReactiveCamera: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const look = useRef(new THREE.Vector3(0, -1, -10));
  const burstRef = useRef(0);
  const previousTransitionRef = useRef(false);

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    const progress = totalSections > 1 ? currentSection / (totalSections - 1) : 0;

    if (isTransitioning && !previousTransitionRef.current) {
      burstRef.current = 1;
    }
    previousTransitionRef.current = isTransitioning;
    burstRef.current = Math.max(0, burstRef.current - 0.03);

    const travelZ = 9 - progress * 30 - burstRef.current * 1.1;
    const driftX = Math.sin(t * 0.18) * 0.5 + Math.sin(progress * Math.PI * 2) * 0.45;
    const driftY = 0.45 + Math.sin(t * 0.12) * 0.2 - progress * 0.04;

    target.current.set(driftX, driftY, travelZ);
    const speed = isTransitioning ? 0.04 : 0.012;
    camera.position.lerp(target.current, speed);

    look.current.set(driftX * 0.2, -1.4, travelZ - 20);
    camera.lookAt(look.current);
  });

  return null;
};

const SceneContent: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  return (
    <>
      <fog attach="fog" args={['hsl(204 75% 84%)', 14, 120]} />

      <ambientLight intensity={0.66} color="hsl(45 100% 95%)" />
      <directionalLight position={[8, 11, 4]} intensity={0.85} color="hsl(40 100% 95%)" />
      <hemisphereLight color="hsl(205 90% 85%)" groundColor="hsl(118 30% 44%)" intensity={0.45} />

      <SkyAtmosphere />
      <MountainRange />
      <LandBanks />
      <FlowingWater />
      <TreeRows />
      <WindPetals isTransitioning={isTransitioning} />

      <ReactiveCamera currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} />
    </>
  );
};

const Scene3D: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0.5, 9], fov: 58, near: 0.1, far: 180 }}
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
