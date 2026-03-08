import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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

const fract = (n: number) => n - Math.floor(n);
const hash = (n: number) => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453123);
const noise3 = (x: number, y: number, z: number, seed: number) => {
  const a = Math.sin(x * 1.7 + y * 2.3 + z * 1.1 + seed * 13.1);
  const b = Math.sin(x * 3.1 - y * 1.4 + z * 2.7 + seed * 7.3);
  const c = Math.sin(x * 6.3 + y * 4.2 - z * 3.5 + seed * 3.9);
  return (a + b * 0.5 + c * 0.25) / 1.75;
};

const SkyDome: React.FC = () => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          topColor: { value: new THREE.Color('hsl(207 72% 69%)') },
          middleColor: { value: new THREE.Color('hsl(205 62% 79%)') },
          bottomColor: { value: new THREE.Color('hsl(36 55% 88%)') },
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
          uniform vec3 middleColor;
          uniform vec3 bottomColor;
          varying vec3 vWorldPosition;

          void main() {
            float h = normalize(vWorldPosition).y;
            float t1 = smoothstep(-0.25, 0.35, h);
            float t2 = smoothstep(0.05, 0.75, h);
            vec3 col = mix(bottomColor, middleColor, t1);
            col = mix(col, topColor, t2);
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    []
  );

  return (
    <mesh>
      <sphereGeometry args={[165, 42, 24]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

const SunAndGlow: React.FC = () => {
  return (
    <group position={[18, 23, -128]}>
      <mesh>
        <circleGeometry args={[4.6, 40]} />
        <meshBasicMaterial color="hsl(45 92% 88%)" transparent opacity={0.95} />
      </mesh>
      <mesh>
        <circleGeometry args={[9.2, 40]} />
        <meshBasicMaterial color="hsl(40 90% 82%)" transparent opacity={0.2} />
      </mesh>
      <mesh>
        <circleGeometry args={[15.8, 40]} />
        <meshBasicMaterial color="hsl(34 88% 80%)" transparent opacity={0.08} />
      </mesh>
    </group>
  );
};

const CloudField: React.FC = () => {
  const clouds = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const seed = i + 1;
        const x = -48 + hash(seed * 3) * 96;
        const y = 16 + hash(seed * 7) * 10;
        const z = -140 + hash(seed * 11) * 95;
        const scale = 2.4 + hash(seed * 13) * 3.2;
        const drift = 0.03 + hash(seed * 17) * 0.05;

        const puffs = Array.from({ length: 7 }, (_, p) => {
          const px = (hash(seed * (p + 1) * 19) - 0.5) * 5.2;
          const py = (hash(seed * (p + 1) * 23) - 0.5) * 1.4;
          const pz = (hash(seed * (p + 1) * 29) - 0.5) * 2.8;
          const ps = 0.8 + hash(seed * (p + 1) * 31) * 1.1;
          const lightness = 80 + hash(seed * (p + 1) * 37) * 10;
          const hue = 205 + hash(seed * (p + 1) * 41) * 12;
          return {
            position: [px, py, pz] as [number, number, number],
            scale: ps,
            color: `hsl(${hue} 24% ${lightness}%)`,
          };
        });

        return {
          base: [x, y, z] as [number, number, number],
          scale,
          drift,
          seed,
          puffs,
        };
      }),
    []
  );

  const cloudGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!cloudGroupRef.current) return;
    const t = clock.elapsedTime;

    cloudGroupRef.current.children.forEach((child, i) => {
      const cloud = clouds[i];
      if (!cloud || !(child instanceof THREE.Group)) return;

      child.position.x = cloud.base[0] + Math.sin(t * cloud.drift + cloud.seed * 2.1) * 2.8;
      child.position.y = cloud.base[1] + Math.cos(t * cloud.drift * 0.7 + cloud.seed) * 0.5;
      child.position.z = cloud.base[2] + Math.sin(t * cloud.drift * 0.5 + cloud.seed * 1.8) * 1.4;
    });
  });

  return (
    <group ref={cloudGroupRef}>
      {clouds.map((cloud, index) => (
        <group key={index} position={cloud.base} scale={[cloud.scale, cloud.scale * 0.55, cloud.scale * 0.8]}>
          {cloud.puffs.map((puff, puffIndex) => (
            <mesh key={puffIndex} position={puff.position} scale={[puff.scale, puff.scale, puff.scale * 1.2]}>
              <sphereGeometry args={[0.92, 12, 10]} />
              <meshStandardMaterial
                color={puff.color}
                transparent
                opacity={0.42}
                roughness={1}
                metalness={0}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

const NaturalMountain: React.FC<{
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  snowColor?: string;
  seed: number;
}> = ({ position, scale, color, snowColor, seed }) => {
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 4);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);

      const n = noise3(v.x, v.y, v.z, seed);
      const ridge = Math.abs(Math.sin(v.x * 6.8 + seed * 2.7)) * 0.09;
      const verticalBias = Math.max(0, v.y) * 0.11;
      const radial = 1 + n * 0.24 + ridge + verticalBias;

      v.multiplyScalar(radial);
      v.y = Math.max(v.y, -0.58);
      v.x += Math.sin(v.y * 7.2 + seed * 5.1) * 0.025;
      v.z += Math.cos(v.x * 6.3 + seed * 4.4) * 0.03;

      pos.setXYZ(i, v.x, v.y, v.z);
    }

    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [seed]);

  return (
    <group position={position}>
      <mesh geometry={geometry} scale={scale}>
        <meshStandardMaterial color={color} roughness={0.94} flatShading />
      </mesh>

      {snowColor && (
        <mesh
          geometry={geometry}
          scale={[scale[0] * 0.37, scale[1] * 0.27, scale[2] * 0.37]}
          position={[0, scale[1] * 0.58, 0]}
        >
          <meshStandardMaterial color={snowColor} roughness={0.35} flatShading />
        </mesh>
      )}
    </group>
  );
};

const MountainRange: React.FC = () => {
  return (
    <group position={[0, -4.2, -110]}>
      <NaturalMountain position={[0, 14, -12]} scale={[28, 24, 18]} color="hsl(214 21% 45%)" snowColor="hsl(210 28% 91%)" seed={1.1} />
      <NaturalMountain position={[-26, 11, -5]} scale={[20, 18, 14]} color="hsl(212 19% 40%)" snowColor="hsl(205 24% 86%)" seed={2.2} />
      <NaturalMountain position={[28, 10, -4]} scale={[19, 16.5, 13]} color="hsl(210 18% 41%)" snowColor="hsl(204 24% 87%)" seed={3.3} />

      <NaturalMountain position={[-12, 7, 13]} scale={[14, 11, 9]} color="hsl(188 15% 34%)" seed={4.4} />
      <NaturalMountain position={[15, 6.6, 15]} scale={[13, 10, 8.5]} color="hsl(184 14% 33%)" seed={5.5} />
      <NaturalMountain position={[-36, 5.5, 15]} scale={[11, 8.5, 7]} color="hsl(190 14% 36%)" seed={6.6} />
      <NaturalMountain position={[37, 5.2, 16]} scale={[10.5, 8.2, 6.8]} color="hsl(190 14% 37%)" seed={7.7} />

      <NaturalMountain position={[-9, 3.7, 28]} scale={[8.8, 6.2, 5.5]} color="hsl(139 24% 33%)" seed={8.8} />
      <NaturalMountain position={[11, 3.5, 29]} scale={[8.5, 6, 5.2]} color="hsl(142 24% 34%)" seed={9.9} />
    </group>
  );
};

const RiverBanks: React.FC = () => {
  return (
    <group>
      <mesh position={[-9, -3.2, -44]} rotation={[-Math.PI / 2, 0.08, 0.02]}>
        <planeGeometry args={[17, 180, 20, 40]} />
        <meshStandardMaterial color="hsl(125 34% 33%)" roughness={0.97} />
      </mesh>

      <mesh position={[9, -3.2, -44]} rotation={[-Math.PI / 2, -0.08, -0.02]}>
        <planeGeometry args={[17, 180, 20, 40]} />
        <meshStandardMaterial color="hsl(127 34% 34%)" roughness={0.97} />
      </mesh>

      <mesh position={[0, -3.35, 13]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[64, 28]} />
        <meshStandardMaterial color="hsl(123 28% 31%)" roughness={0.98} />
      </mesh>
    </group>
  );
};

const FlowingWater: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);
  const streakGroupRef = useRef<THREE.Group>(null);
  const basePositionsRef = useRef<Float32Array | null>(null);

  const streaks = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        x: -4.6 + hash(i * 3.7) * 9.2,
        zOffset: -95 + hash(i * 8.1) * 190,
        speed: 2.4 + hash(i * 5.9) * 2.1,
        length: 0.4 + hash(i * 2.2) * 0.9,
        width: 0.03 + hash(i * 9.4) * 0.06,
        alpha: 0.05 + hash(i * 4.3) * 0.11,
      })),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    if (waterRef.current) {
      const geo = waterRef.current.geometry;
      const position = geo.attributes.position;
      const arr = position.array as Float32Array;

      if (!basePositionsRef.current) {
        basePositionsRef.current = new Float32Array(arr);
      }

      const base = basePositionsRef.current;

      for (let i = 0; i < position.count; i++) {
        const x = base[i * 3];
        const z = base[i * 3 + 2];
        const wave1 = Math.sin(z * 0.18 + t * 1.8) * 0.11;
        const wave2 = Math.cos(x * 0.6 - t * 0.95) * 0.07;
        const wave3 = Math.sin((x + z) * 0.14 + t * 1.3) * 0.05;
        const flowBias = Math.sin((z + t * 8) * 0.05) * 0.03;
        arr[i * 3 + 1] = wave1 + wave2 + wave3 + flowBias;
      }

      position.needsUpdate = true;
      geo.computeVertexNormals();
    }

    if (streakGroupRef.current) {
      streakGroupRef.current.children.forEach((child, i) => {
        if (!(child instanceof THREE.Mesh)) return;
        const s = streaks[i];
        if (!s) return;

        const range = 190;
        const z = ((t * s.speed + s.zOffset + range / 2) % range) - range / 2;

        child.position.set(s.x + Math.sin(t * 0.4 + i) * 0.08, 0.03, z);

        const material = child.material as THREE.MeshStandardMaterial;
        material.opacity = s.alpha + Math.sin(t * 2.2 + i) * 0.02;
      });
    }
  });

  return (
    <group position={[0, -3.05, -44]}>
      <mesh position={[0, -0.36, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 190]} />
        <meshStandardMaterial color="hsl(208 47% 22%)" roughness={1} />
      </mesh>

      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 190, 64, 240]} />
        <meshStandardMaterial
          color="hsl(198 58% 45%)"
          emissive="hsl(196 55% 29%)"
          emissiveIntensity={0.15}
          transparent
          opacity={0.57}
          roughness={0.06}
          metalness={0.62}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 190]} />
        <meshStandardMaterial
          color="hsl(196 48% 78%)"
          transparent
          opacity={0.08}
          roughness={0}
          metalness={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={streakGroupRef}>
        {streaks.map((streak, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[streak.width, streak.length]} />
            <meshStandardMaterial
              color="hsl(196 40% 88%)"
              transparent
              opacity={streak.alpha}
              emissive="hsl(196 50% 70%)"
              emissiveIntensity={0.12}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const BlossomTree: React.FC<{ data: TreeData }> = ({ data }) => {
  const treeRef = useRef<THREE.Group>(null);

  const branches = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const angle = (i / 5) * Math.PI * 2 + hash(data.seed * (i + 1) * 13) * 0.8;
      const lift = 0.45 + hash(data.seed * (i + 1) * 17) * 0.42;
      const len = 0.8 + hash(data.seed * (i + 1) * 19) * 0.7;
      return {
        rotation: [lift, angle, hash(data.seed * (i + 1) * 29) * 0.6 - 0.3] as [number, number, number],
        length: len,
        thickness: 0.028 + hash(data.seed * (i + 1) * 23) * 0.028,
      };
    });
  }, [data.seed]);

  const blossomClusters = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const ring = i < 8 ? 0.9 : 1.35;
      const angle = (i / 14) * Math.PI * 2 + hash(data.seed * (i + 2) * 31) * 0.8;
      const x = Math.cos(angle) * ring * (0.8 + hash(data.seed * (i + 3) * 37) * 0.5);
      const y = 2 + hash(data.seed * (i + 4) * 41) * 1.25;
      const z = Math.sin(angle) * ring * (0.8 + hash(data.seed * (i + 5) * 43) * 0.5);
      const radius = 0.34 + hash(data.seed * (i + 6) * 47) * 0.26;
      const hue = 334 + hash(data.seed * (i + 7) * 53) * 18;
      const sat = 66 + hash(data.seed * (i + 8) * 59) * 18;
      const light = 75 + hash(data.seed * (i + 9) * 61) * 15;
      return { position: [x, y, z] as [number, number, number], radius, color: `hsl(${hue} ${sat}% ${light}%)` };
    });
  }, [data.seed]);

  useFrame(({ clock }) => {
    if (!treeRef.current) return;
    const sway = Math.sin(clock.elapsedTime * 0.5 + data.seed * 7.5) * 0.024;
    treeRef.current.rotation.z = sway;
    treeRef.current.rotation.x = Math.cos(clock.elapsedTime * 0.22 + data.seed * 5) * 0.008;
  });

  return (
    <group ref={treeRef} position={data.position} scale={[data.scale, data.scale, data.scale]}>
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.08, 0.17, 2.28, 9]} />
        <meshStandardMaterial color="hsl(24 39% 23%)" roughness={0.95} />
      </mesh>

      {branches.map((branch, i) => (
        <group key={i} position={[0, 1.5 + i * 0.12, 0]} rotation={branch.rotation}>
          <mesh position={[0, branch.length * 0.45, 0]}>
            <cylinderGeometry args={[branch.thickness * 0.6, branch.thickness, branch.length, 6]} />
            <meshStandardMaterial color="hsl(23 35% 25%)" roughness={0.92} />
          </mesh>
        </group>
      ))}

      {blossomClusters.map((cluster, i) => (
        <mesh key={i} position={cluster.position}>
          <icosahedronGeometry args={[cluster.radius, 1]} />
          <meshStandardMaterial
            color={cluster.color}
            roughness={0.72}
            flatShading
            transparent
            opacity={0.93}
          />
        </mesh>
      ))}
    </group>
  );
};

const TreeRows: React.FC = () => {
  const trees = useMemo<TreeData[]>(() => {
    const items: TreeData[] = [];

    for (let i = 0; i < 24; i++) {
      const z = 10 - i * 6;
      const leftX = -(6 + hash(i * 13 + 1) * 2.7);
      const rightX = 6 + hash(i * 13 + 2) * 2.7;

      items.push({
        position: [leftX, -3.2, z + (hash(i * 17 + 3) - 0.5) * 1.8],
        scale: 0.92 + hash(i * 19 + 4) * 0.48,
        seed: hash(i * 23 + 5),
      });

      items.push({
        position: [rightX, -3.2, z + (hash(i * 17 + 33) - 0.5) * 1.8],
        scale: 0.92 + hash(i * 19 + 34) * 0.48,
        seed: hash(i * 23 + 35),
      });
    }

    return items;
  }, []);

  return (
    <group>
      {trees.map((tree, index) => (
        <BlossomTree key={index} data={tree} />
      ))}
    </group>
  );
};

const WindPetals: React.FC<{ isTransitioning: boolean }> = ({ isTransitioning }) => {
  const petalGroupRef = useRef<THREE.Group>(null);
  const gustRef = useRef(0);
  const prevTransitionRef = useRef(false);

  const petals = useMemo(
    () =>
      Array.from({ length: 160 }, (_, i) => ({
        depth: -118 + hash(i * 1.7) * 150,
        yOffset: -1 + hash(i * 3.2) * 10,
        offset: hash(i * 4.9) * 36,
        speed: 0.55 + hash(i * 6.1) * 1.45,
        sway: 0.65 + hash(i * 7.3) * 2,
        size: 0.038 + hash(i * 8.7) * 0.075,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!petalGroupRef.current) return;

    if (isTransitioning && !prevTransitionRef.current) {
      gustRef.current = 1;
    }

    prevTransitionRef.current = isTransitioning;
    gustRef.current = Math.max(0, gustRef.current - 0.017);

    const wind = 1 + gustRef.current * 2.9;
    const t = clock.elapsedTime;

    petalGroupRef.current.children.forEach((child, index) => {
      if (!(child instanceof THREE.Mesh)) return;
      const petal = petals[index];
      if (!petal) return;

      const cycle = (t * petal.speed * wind + petal.offset) % 34;
      const x = -14 + ((cycle * 1.15 + Math.sin(cycle * 0.3)) % 28);
      const y = 6.4 - cycle * 0.33 + Math.sin(cycle * petal.sway) * 0.6 + petal.yOffset;
      const z = petal.depth + Math.sin(cycle * 0.45 + petal.offset) * 1.2;

      child.position.set(x, y, z);
      child.rotation.x = cycle * 0.82;
      child.rotation.y = Math.sin(cycle * 1.9) * 1.35;
      child.rotation.z = cycle * 0.7;

      const mat = child.material as THREE.MeshStandardMaterial;
      mat.opacity = y > 5.5 || y < -4 ? 0.12 : 0.78;
    });
  });

  return (
    <group ref={petalGroupRef}>
      {petals.map((petal, index) => (
        <mesh key={index} position={[0, 0, petal.depth]}>
          <planeGeometry args={[petal.size, petal.size * 1.65]} />
          <meshStandardMaterial
            color={index % 3 === 0 ? 'hsl(337 80% 78%)' : index % 3 === 1 ? 'hsl(346 70% 84%)' : 'hsl(330 76% 74%)'}
            emissive="hsl(336 56% 64%)"
            emissiveIntensity={0.2}
            transparent
            opacity={0.78}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

const AtmosphericMist: React.FC = () => {
  return (
    <group>
      <mesh position={[0, -0.5, -74]}>
        <planeGeometry args={[95, 17]} />
        <meshBasicMaterial color="hsl(207 43% 82%)" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -1.2, -52]}>
        <planeGeometry args={[74, 12]} />
        <meshBasicMaterial color="hsl(200 35% 79%)" transparent opacity={0.11} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const ReactiveCamera: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const look = useRef(new THREE.Vector3(0, -1, -20));
  const burstRef = useRef(0);
  const prevTransitionRef = useRef(false);

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    const progress = totalSections > 1 ? currentSection / (totalSections - 1) : 0;

    if (isTransitioning && !prevTransitionRef.current) {
      burstRef.current = 1;
    }

    prevTransitionRef.current = isTransitioning;
    burstRef.current = Math.max(0, burstRef.current - 0.028);

    const travelZ = 12 - progress * 58 - burstRef.current * 1.35;
    const driftX = Math.sin(t * 0.16) * 0.58 + Math.sin(progress * Math.PI * 2) * 0.28;
    const driftY = 0.95 + Math.sin(t * 0.1) * 0.16 - progress * 0.23;

    target.current.set(driftX, driftY, travelZ);
    camera.position.lerp(target.current, isTransitioning ? 0.038 : 0.012);

    look.current.set(driftX * 0.18, -1.05, travelZ - 28);
    camera.lookAt(look.current);
  });

  return null;
};

const SceneContent: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  return (
    <>
      <fog attach="fog" args={['hsl(207 48% 79%)', 20, 170]} />

      <ambientLight intensity={0.48} color="hsl(42 100% 95%)" />
      <directionalLight position={[14, 16, 2]} intensity={0.88} color="hsl(40 92% 90%)" />
      <directionalLight position={[-8, 8, 12]} intensity={0.28} color="hsl(208 66% 83%)" />
      <hemisphereLight color="hsl(206 70% 84%)" groundColor="hsl(126 30% 35%)" intensity={0.45} />

      <SkyDome />
      <SunAndGlow />
      <CloudField />
      <MountainRange />
      <RiverBanks />
      <FlowingWater />
      <TreeRows />
      <AtmosphericMist />
      <WindPetals isTransitioning={isTransitioning} />

      <ReactiveCamera currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} />
    </>
  );
};

const Scene3D: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 1, 12], fov: 54, near: 0.1, far: 220 }} gl={{ antialias: true, alpha: false }}>
        <React.Suspense fallback={null}>
          <SceneContent currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
