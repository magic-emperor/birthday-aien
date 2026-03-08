import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SceneProps {
  currentSection: number;
  totalSections: number;
  isTransitioning: boolean;
}

/* ─── Sky ─── */
const SkyDome: React.FC = () => {
  const skyMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color('hsl(210, 82%, 72%)') },
        bottomColor: { value: new THREE.Color('hsl(32, 60%, 90%)') },
        offset: { value: 20 },
        exponent: { value: 0.4 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
    });
  }, []);

  return (
    <mesh material={skyMat}>
      <sphereGeometry args={[140, 32, 20]} />
    </mesh>
  );
};

/* ─── Sun with glow ─── */
const Sun: React.FC = () => (
  <group position={[15, 28, -110]}>
    <mesh>
      <circleGeometry args={[5, 32]} />
      <meshBasicMaterial color="#FFF5E0" />
    </mesh>
    <mesh>
      <circleGeometry args={[12, 32]} />
      <meshBasicMaterial color="#FFF5E0" transparent opacity={0.12} />
    </mesh>
    <mesh>
      <circleGeometry args={[20, 32]} />
      <meshBasicMaterial color="#FFEEDD" transparent opacity={0.05} />
    </mesh>
  </group>
);

/* ─── Natural Mountains with vertex displacement ─── */
const NaturalMountain: React.FC<{
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  color: string;
  snowColor?: string;
  snowLine?: number;
  seed: number;
}> = ({ position, width, height, depth, color, snowColor, snowLine = 0.7, seed }) => {
  const geoRef = useRef<THREE.BufferGeometry>(null);

  useMemo(() => {
    // We'll displace after mount
  }, []);

  const displaceGeo = (geo: THREE.BufferGeometry) => {
    const pos = geo.attributes.position;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < pos.count; i++) {
      const x = arr[i * 3];
      const y = arr[i * 3 + 1];
      const z = arr[i * 3 + 2];
      // Add organic noise based on position
      const noise =
        Math.sin(x * 1.3 + seed * 10) * 0.8 +
        Math.sin(z * 1.7 + seed * 7) * 0.6 +
        Math.sin((x + z) * 2.1 + seed * 3) * 0.4;
      // Stronger displacement at mid-height, less at peak and base
      const heightFactor = Math.sin((y / height) * Math.PI) * 0.7;
      arr[i * 3] += noise * heightFactor * 1.2;
      arr[i * 3 + 2] += noise * heightFactor * 0.8;
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  };

  return (
    <group position={position}>
      {/* Main mountain body */}
      <mesh
        onUpdate={(mesh) => {
          if (mesh.geometry) displaceGeo(mesh.geometry);
        }}
      >
        <coneGeometry args={[width, height, 12, 6]} />
        <meshStandardMaterial
          color={color}
          roughness={0.92}
          flatShading
        />
      </mesh>
      {/* Snow cap */}
      {snowColor && (
        <mesh position={[0, height * 0.32, 0]}>
          <coneGeometry args={[width * 0.35, height * 0.38, 10, 3]} />
          <meshStandardMaterial
            color={snowColor}
            roughness={0.3}
            flatShading
          />
        </mesh>
      )}
    </group>
  );
};

const MountainRange: React.FC = () => (
  <group position={[0, -3, -100]}>
    {/* Back layer - distant, misty */}
    <NaturalMountain position={[0, 14, -20]} width={28} height={30} depth={20} color="hsl(220, 25%, 52%)" snowColor="hsl(210, 30%, 92%)" seed={1} />
    <NaturalMountain position={[-35, 10, -15]} width={22} height={22} depth={18} color="hsl(225, 22%, 48%)" snowColor="hsl(215, 25%, 88%)" seed={2} />
    <NaturalMountain position={[30, 9, -12]} width={20} height={20} depth={16} color="hsl(218, 20%, 50%)" snowColor="hsl(210, 28%, 90%)" seed={3} />

    {/* Mid layer */}
    <NaturalMountain position={[-18, 8, 5]} width={16} height={18} depth={14} color="hsl(200, 18%, 38%)" seed={4} />
    <NaturalMountain position={[20, 7, 8]} width={14} height={16} depth={12} color="hsl(195, 16%, 36%)" seed={5} />
    <NaturalMountain position={[-40, 6, 10]} width={12} height={13} depth={10} color="hsl(210, 15%, 40%)" seed={6} />
    <NaturalMountain position={[42, 5.5, 12]} width={11} height={12} depth={10} color="hsl(205, 14%, 42%)" seed={7} />

    {/* Front hills - greener */}
    <NaturalMountain position={[-12, 3.5, 25]} width={10} height={8} depth={8} color="hsl(140, 25%, 35%)" seed={8} />
    <NaturalMountain position={[14, 3, 28]} width={9} height={7} depth={7} color="hsl(145, 22%, 37%)" seed={9} />
  </group>
);

/* ─── Ground / Land ─── */
const Ground: React.FC = () => {
  const groundRef = useRef<THREE.Mesh>(null);

  useMemo(() => {}, []);

  return (
    <group>
      {/* Left bank */}
      <mesh position={[-12, -3.1, -20]} rotation={[-Math.PI / 2, 0.06, 0]}>
        <planeGeometry args={[24, 160, 20, 40]} />
        <meshStandardMaterial color="hsl(128, 35%, 32%)" roughness={0.95} flatShading />
      </mesh>
      {/* Right bank */}
      <mesh position={[12, -3.1, -20]} rotation={[-Math.PI / 2, -0.06, 0]}>
        <planeGeometry args={[24, 160, 20, 40]} />
        <meshStandardMaterial color="hsl(130, 33%, 34%)" roughness={0.95} flatShading />
      </mesh>
      {/* Near ground under camera */}
      <mesh position={[0, -3.2, 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 30]} />
        <meshStandardMaterial color="hsl(125, 30%, 30%)" roughness={1} />
      </mesh>
    </group>
  );
};

/* ─── Water ─── */
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
        Math.sin((z * 0.15) + t * 1.2) * 0.12 +
        Math.cos((x * 0.3) + t * 0.8) * 0.08 +
        Math.sin((x * 0.1 + z * 0.1) + t * 0.5) * 0.06;
    }

    position.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <group position={[0, -3.0, -20]}>
      {/* Deep water base */}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 160]} />
        <meshStandardMaterial color="hsl(210, 50%, 22%)" roughness={1} />
      </mesh>
      {/* Surface water with ripples */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 160, 60, 200]} />
        <meshStandardMaterial
          color="hsl(200, 55%, 45%)"
          emissive="hsl(195, 60%, 30%)"
          emissiveIntensity={0.1}
          transparent
          opacity={0.55}
          roughness={0.05}
          metalness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Surface shimmer layer */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 160]} />
        <meshStandardMaterial
          color="hsl(200, 40%, 70%)"
          transparent
          opacity={0.08}
          roughness={0}
          metalness={1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

/* ─── Natural Blossom Tree ─── */
type TreeData = {
  position: [number, number, number];
  scale: number;
  seed: number;
};

const BlossomTree: React.FC<{ data: TreeData }> = ({ data }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate organic canopy clusters
  const canopy = useMemo(() => {
    const clusters: { pos: [number, number, number]; radius: number; color: string }[] = [];
    const rng = (n: number) => Math.sin(data.seed * 1000 + n * 137.5) * 0.5 + 0.5;

    // Main canopy - multiple overlapping spheres
    const numClusters = 5 + Math.floor(rng(0) * 4);
    for (let i = 0; i < numClusters; i++) {
      const angle = (i / numClusters) * Math.PI * 2 + rng(i + 10) * 0.8;
      const r = 0.3 + rng(i + 20) * 0.5;
      const h = 2.2 + rng(i + 30) * 0.8;
      clusters.push({
        pos: [Math.cos(angle) * r, h, Math.sin(angle) * r],
        radius: 0.5 + rng(i + 40) * 0.4,
        color: `hsl(${335 + rng(i + 50) * 20}, ${65 + rng(i + 60) * 20}%, ${75 + rng(i + 70) * 15}%)`,
      });
    }
    // Top cluster
    clusters.push({
      pos: [rng(100) * 0.2 - 0.1, 2.9 + rng(101) * 0.3, rng(102) * 0.2 - 0.1],
      radius: 0.4 + rng(103) * 0.25,
      color: `hsl(${340 + rng(104) * 15}, 72%, 82%)`,
    });
    return clusters;
  }, [data.seed]);

  // Branch positions
  const branches = useMemo(() => {
    const rng = (n: number) => Math.sin(data.seed * 999 + n * 73.1) * 0.5 + 0.5;
    return Array.from({ length: 3 }, (_, i) => {
      const angle = (i / 3) * Math.PI * 2 + rng(i) * 1.5;
      const len = 0.8 + rng(i + 10) * 0.6;
      return {
        rotation: [0, angle, 0.5 + rng(i + 20) * 0.4] as [number, number, number],
        position: [0, 1.5 + rng(i + 30) * 0.5, 0] as [number, number, number],
        length: len,
      };
    });
  }, [data.seed]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const sway = Math.sin(clock.elapsedTime * 0.5 + data.seed * 10) * 0.025;
    groupRef.current.rotation.z = sway;
    groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.3 + data.seed * 5) * 0.01;
  });

  return (
    <group ref={groupRef} position={data.position} scale={[data.scale, data.scale, data.scale]}>
      {/* Trunk - tapered cylinder */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.08, 0.18, 2.2, 8]} />
        <meshStandardMaterial color="hsl(25, 40%, 22%)" roughness={0.95} />
      </mesh>

      {/* Branches */}
      {branches.map((branch, i) => (
        <group key={i} position={branch.position} rotation={branch.rotation}>
          <mesh position={[0, branch.length * 0.4, 0]}>
            <cylinderGeometry args={[0.02, 0.05, branch.length, 6]} />
            <meshStandardMaterial color="hsl(22, 35%, 25%)" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Canopy clusters - overlapping spheres for organic look */}
      {canopy.map((cluster, i) => (
        <mesh key={i} position={cluster.pos}>
          <icosahedronGeometry args={[cluster.radius, 1]} />
          <meshStandardMaterial
            color={cluster.color}
            roughness={0.7}
            flatShading
            transparent
            opacity={0.92}
          />
        </mesh>
      ))}
    </group>
  );
};

const TreeRows: React.FC = () => {
  const trees = useMemo<TreeData[]>(() => {
    const items: TreeData[] = [];
    // Use seeded pseudo-random for consistency
    const rng = (n: number) => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1;

    for (let i = 0; i < 22; i++) {
      const z = 12 - i * 5.5;
      const leftOffset = 5.5 + rng(i * 2) * 3;
      const rightOffset = 5.5 + rng(i * 2 + 1) * 3;

      items.push({
        position: [-leftOffset, -3.1, z + (rng(i * 3) - 0.5) * 2],
        scale: 0.9 + rng(i * 4) * 0.5,
        seed: rng(i * 5),
      });
      items.push({
        position: [rightOffset, -3.1, z + (rng(i * 3 + 100) - 0.5) * 2],
        scale: 0.9 + rng(i * 4 + 100) * 0.5,
        seed: rng(i * 5 + 100),
      });
    }
    return items;
  }, []);

  return (
    <group>
      {trees.map((tree, idx) => (
        <BlossomTree key={idx} data={tree} />
      ))}
    </group>
  );
};

/* ─── Wind Petals ─── */
const WindPetals: React.FC<{ isTransitioning: boolean }> = ({ isTransitioning }) => {
  const groupRef = useRef<THREE.Group>(null);
  const gustRef = useRef(0);
  const prevTransRef = useRef(false);

  const petals = useMemo(
    () =>
      Array.from({ length: 120 }, (_, i) => ({
        depth: -100 + ((i * 137.5) % 130),
        yOffset: (i * 0.618) % 6,
        offset: (i * 2.3) % 30,
        speed: 0.5 + ((i * 0.37) % 1.2),
        sway: 0.5 + ((i * 0.73) % 1.5),
        size: 0.04 + ((i * 0.13) % 0.06),
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    if (isTransitioning && !prevTransRef.current) gustRef.current = 1;
    prevTransRef.current = isTransitioning;
    gustRef.current = Math.max(0, gustRef.current - 0.015);

    const wind = 1 + gustRef.current * 3;
    const t = clock.elapsedTime;

    groupRef.current.children.forEach((child, index) => {
      if (!(child instanceof THREE.Mesh)) return;
      const p = petals[index];
      if (!p) return;

      const cycle = (t * p.speed * wind + p.offset) % 30;
      const x = -14 + ((cycle * 1.1) % 28);
      const y = 6 - cycle * 0.35 + Math.sin(cycle * p.sway) * 0.7 + p.yOffset;
      const z = p.depth + Math.sin(cycle * 0.4 + p.offset) * 1.5;

      child.position.set(x, y, z);
      child.rotation.x = cycle * 0.9;
      child.rotation.y = Math.sin(cycle * 1.6) * 1.4;
      child.rotation.z = cycle * 0.7;

      const mat = child.material as THREE.MeshStandardMaterial;
      mat.opacity = y > 5 || y < -3 ? 0.1 : 0.75;
    });
  });

  return (
    <group ref={groupRef}>
      {petals.map((p, i) => (
        <mesh key={i}>
          <planeGeometry args={[p.size, p.size * 1.6]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? 'hsl(340, 80%, 80%)' : i % 3 === 1 ? 'hsl(350, 70%, 85%)' : 'hsl(330, 75%, 75%)'}
            emissive="hsl(335, 60%, 60%)"
            emissiveIntensity={0.15}
            transparent
            opacity={0.75}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

/* ─── Mist layers for depth ─── */
const MistLayers: React.FC = () => (
  <group>
    <mesh position={[0, 0, -60]} rotation={[0, 0, 0]}>
      <planeGeometry args={[80, 12]} />
      <meshBasicMaterial color="hsl(210, 60%, 85%)" transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, -1, -40]} rotation={[0, 0, 0]}>
      <planeGeometry args={[60, 8]} />
      <meshBasicMaterial color="hsl(200, 50%, 80%)" transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

/* ─── Camera ─── */
const ReactiveCamera: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const look = useRef(new THREE.Vector3(0, -1, -10));
  const burstRef = useRef(0);
  const prevRef = useRef(false);

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    const progress = totalSections > 1 ? currentSection / (totalSections - 1) : 0;

    if (isTransitioning && !prevRef.current) burstRef.current = 1;
    prevRef.current = isTransitioning;
    burstRef.current = Math.max(0, burstRef.current - 0.025);

    const travelZ = 12 - progress * 40 - burstRef.current * 1.5;
    const driftX = Math.sin(t * 0.15) * 0.6;
    const driftY = 0.8 + Math.sin(t * 0.1) * 0.15 - progress * 0.3;

    target.current.set(driftX, driftY, travelZ);
    camera.position.lerp(target.current, isTransitioning ? 0.035 : 0.01);

    look.current.set(driftX * 0.15, -1, travelZ - 25);
    camera.lookAt(look.current);
  });

  return null;
};

/* ─── Main Scene ─── */
const SceneContent: React.FC<SceneProps> = (props) => (
  <>
    <fog attach="fog" args={['hsl(210, 60%, 82%)', 20, 130]} />

    <ambientLight intensity={0.5} color="hsl(45, 100%, 95%)" />
    <directionalLight position={[10, 15, -5]} intensity={0.9} color="hsl(40, 95%, 92%)" castShadow />
    <directionalLight position={[-5, 8, 10]} intensity={0.3} color="hsl(210, 80%, 85%)" />
    <hemisphereLight color="hsl(210, 80%, 85%)" groundColor="hsl(125, 30%, 35%)" intensity={0.4} />

    <SkyDome />
    <Sun />
    <MountainRange />
    <Ground />
    <FlowingWater />
    <TreeRows />
    <MistLayers />
    <WindPetals isTransitioning={props.isTransitioning} />
    <ReactiveCamera {...props} />
  </>
);

const Scene3D: React.FC<SceneProps> = (props) => (
  <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
    <Canvas
      camera={{ position: [0, 1, 12], fov: 55, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false }}
    >
      <React.Suspense fallback={null}>
        <SceneContent {...props} />
      </React.Suspense>
    </Canvas>
  </div>
);

export default Scene3D;
