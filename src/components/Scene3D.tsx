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

type HslTriplet = [number, number, number];

const toColor = (h: number, s: number, l: number) => new THREE.Color().setHSL(h / 360, s / 100, l / 100);
const fract = (n: number) => n - Math.floor(n);
const hash = (n: number) => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453123);

const noise3 = (x: number, y: number, z: number, seed: number) => {
  const a = Math.sin(x * 1.8 + y * 2.2 + z * 1.15 + seed * 13.2);
  const b = Math.sin(x * 3.2 - y * 1.3 + z * 2.8 + seed * 7.8);
  const c = Math.sin(x * 5.9 + y * 4.1 - z * 3.6 + seed * 4.3);
  return (a + b * 0.55 + c * 0.25) / 1.8;
};

const createSoftSpriteTexture = (centerOpacity: number, midOpacity: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;

  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  const g = ctx.createRadialGradient(64, 64, 10, 64, 64, 58);
  g.addColorStop(0, `rgba(255,255,255,${centerOpacity})`);
  g.addColorStop(0.55, `rgba(255,255,255,${midOpacity})`);
  g.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

const SkyDome: React.FC = () => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          topColor: { value: toColor(208, 70, 70) },
          middleColor: { value: toColor(204, 62, 80) },
          bottomColor: { value: toColor(34, 54, 88) },
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
      <sphereGeometry args={[170, 48, 28]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

const SunAndGlow: React.FC = () => (
  <group position={[18, 24, -130]}>
    <mesh>
      <circleGeometry args={[4.8, 44]} />
      <meshBasicMaterial color={toColor(45, 92, 88)} transparent opacity={0.95} />
    </mesh>
    <mesh>
      <circleGeometry args={[9.5, 44]} />
      <meshBasicMaterial color={toColor(40, 88, 82)} transparent opacity={0.24} />
    </mesh>
    <mesh>
      <circleGeometry args={[16, 44]} />
      <meshBasicMaterial color={toColor(34, 86, 78)} transparent opacity={0.1} />
    </mesh>
  </group>
);

const CloudField: React.FC<{ cloudTexture: THREE.Texture }> = ({ cloudTexture }) => {
  const cloudGroupRef = useRef<THREE.Group>(null);

  const clouds = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const seed = i + 1;
        const x = -50 + hash(seed * 3) * 100;
        const y = 16 + hash(seed * 5) * 11;
        const z = -150 + hash(seed * 7) * 105;
        const drift = 0.025 + hash(seed * 11) * 0.05;
        const puffCount = 8 + Math.floor(hash(seed * 13) * 4);

        const puffs = Array.from({ length: puffCount }, (_, p) => {
          const px = (hash(seed * (p + 1) * 17) - 0.5) * 8;
          const py = (hash(seed * (p + 1) * 19) - 0.5) * 2;
          const pz = (hash(seed * (p + 1) * 23) - 0.5) * 3.8;
          const scale = 1.4 + hash(seed * (p + 1) * 29) * 2.4;
          const hue = 206 + hash(seed * (p + 1) * 31) * 10;
          const sat = 18 + hash(seed * (p + 1) * 37) * 12;
          const light = 79 + hash(seed * (p + 1) * 41) * 12;
          return {
            position: [px, py, pz] as [number, number, number],
            scale,
            color: [hue, sat, light] as HslTriplet,
          };
        });

        return {
          base: [x, y, z] as [number, number, number],
          drift,
          seed,
          puffs,
        };
      }),
    []
  );

  useFrame(({ clock }) => {
    if (!cloudGroupRef.current) return;
    const t = clock.elapsedTime;

    cloudGroupRef.current.children.forEach((child, i) => {
      if (!(child instanceof THREE.Group)) return;
      const cloud = clouds[i];
      if (!cloud) return;

      child.position.x = cloud.base[0] + Math.sin(t * cloud.drift + cloud.seed) * 2.6;
      child.position.y = cloud.base[1] + Math.cos(t * cloud.drift * 0.8 + cloud.seed * 1.8) * 0.5;
      child.position.z = cloud.base[2] + Math.sin(t * cloud.drift * 0.6 + cloud.seed * 2.4) * 1.6;
    });
  });

  return (
    <group ref={cloudGroupRef}>
      {clouds.map((cloud, i) => (
        <group key={i} position={cloud.base}>
          {cloud.puffs.map((puff, pi) => (
            <sprite key={pi} position={puff.position} scale={[puff.scale * 3, puff.scale * 1.8, 1]}>
              <spriteMaterial
                map={cloudTexture}
                color={toColor(puff.color[0], puff.color[1], puff.color[2])}
                transparent
                opacity={0.35}
                depthWrite={false}
              />
            </sprite>
          ))}
        </group>
      ))}
    </group>
  );
};

const createMountainGeometry = (seed: number) => {
  const geo = new THREE.ConeGeometry(1, 1.2, 18, 18, true);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    const n = noise3(v.x, v.y, v.z, seed);
    const ridges = Math.abs(Math.sin(v.x * 10 + seed * 2.1)) * 0.08;
    const radial = 1 + n * 0.22 + ridges;

    v.x *= radial;
    v.z *= radial;
    v.y += Math.max(0, v.y) * (0.06 + n * 0.08);

    if (v.y < -0.5) {
      v.x *= 1.06;
      v.z *= 1.06;
    }

    pos.setXYZ(i, v.x, v.y, v.z);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
};

const NaturalMountain: React.FC<{
  position: [number, number, number];
  scale: [number, number, number];
  color: HslTriplet;
  snowColor?: HslTriplet;
  seed: number;
}> = ({ position, scale, color, snowColor, seed }) => {
  const geometry = useMemo(() => createMountainGeometry(seed), [seed]);

  return (
    <group position={position}>
      <mesh geometry={geometry} scale={scale}>
        <meshStandardMaterial color={toColor(color[0], color[1], color[2])} roughness={0.92} flatShading />
      </mesh>

      {snowColor && (
        <mesh geometry={geometry} position={[0, scale[1] * 0.44, 0]} scale={[scale[0] * 0.38, scale[1] * 0.32, scale[2] * 0.38]}>
          <meshStandardMaterial color={toColor(snowColor[0], snowColor[1], snowColor[2])} roughness={0.35} flatShading />
        </mesh>
      )}
    </group>
  );
};

const MountainRange: React.FC = () => (
  <group position={[0, -4.1, -112]}>
    <NaturalMountain position={[0, 14, -14]} scale={[26, 24, 18]} color={[214, 24, 45]} snowColor={[210, 26, 90]} seed={1.1} />
    <NaturalMountain position={[-26, 11.5, -6]} scale={[19, 18, 14]} color={[212, 22, 40]} snowColor={[208, 24, 86]} seed={2.2} />
    <NaturalMountain position={[28, 10.5, -5]} scale={[18.5, 17, 13]} color={[210, 22, 41]} snowColor={[206, 24, 87]} seed={3.3} />

    <NaturalMountain position={[-13, 7.5, 13]} scale={[14, 11.5, 9]} color={[188, 20, 34]} seed={4.4} />
    <NaturalMountain position={[16, 7.2, 15]} scale={[13.5, 10.5, 8.6]} color={[185, 18, 33]} seed={5.5} />
    <NaturalMountain position={[-36, 6, 15]} scale={[11, 8.8, 7]} color={[192, 16, 36]} seed={6.6} />
    <NaturalMountain position={[37, 5.8, 16]} scale={[10.5, 8.4, 6.8]} color={[190, 16, 37]} seed={7.7} />

    <NaturalMountain position={[-9, 3.9, 30]} scale={[8.6, 6.2, 5.4]} color={[140, 26, 34]} seed={8.8} />
    <NaturalMountain position={[11, 3.7, 31]} scale={[8.4, 6, 5.2]} color={[143, 26, 35]} seed={9.9} />
  </group>
);

const RiverBanks: React.FC = () => (
  <group>
    <mesh position={[-10, -3.2, -46]} rotation={[-Math.PI / 2, 0.08, 0.02]}>
      <planeGeometry args={[20, 200, 24, 42]} />
      <meshStandardMaterial color={toColor(125, 34, 34)} roughness={0.97} />
    </mesh>

    <mesh position={[10, -3.2, -46]} rotation={[-Math.PI / 2, -0.08, -0.02]}>
      <planeGeometry args={[20, 200, 24, 42]} />
      <meshStandardMaterial color={toColor(127, 34, 35)} roughness={0.97} />
    </mesh>

    <mesh position={[0, -3.35, 13]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[68, 30]} />
      <meshStandardMaterial color={toColor(123, 28, 32)} roughness={0.98} />
    </mesh>
  </group>
);

const FlowingWater: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);
  const basePositionsRef = useRef<Float32Array | null>(null);

  useFrame(({ clock }) => {
    if (!waterRef.current) return;

    const t = clock.elapsedTime;
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

      const largeWave = Math.sin(z * 0.16 + t * 1.5) * 0.13;
      const crossWave = Math.cos(x * 0.52 - t * 0.9) * 0.08;
      const fineWave = Math.sin((x + z) * 0.12 + t * 1.15) * 0.05;
      const flow = Math.sin((z + t * 7.4) * 0.05) * 0.025;

      arr[i * 3 + 1] = largeWave + crossWave + fineWave + flow;
    }

    position.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <group position={[0, -3.05, -46]}>
      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 200]} />
        <meshStandardMaterial color={toColor(208, 50, 22)} roughness={1} />
      </mesh>

      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 200, 88, 280]} />
        <meshStandardMaterial
          color={toColor(198, 62, 47)}
          emissive={toColor(196, 60, 31)}
          emissiveIntensity={0.16}
          transparent
          opacity={0.72}
          roughness={0.08}
          metalness={0.62}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 200]} />
        <meshStandardMaterial
          color={toColor(196, 42, 82)}
          transparent
          opacity={0.07}
          roughness={0}
          metalness={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[-6.75, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.45, 200]} />
        <meshStandardMaterial
          color={toColor(197, 24, 92)}
          transparent
          opacity={0.2}
          emissive={toColor(198, 26, 82)}
          emissiveIntensity={0.14}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[6.75, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.45, 200]} />
        <meshStandardMaterial
          color={toColor(197, 24, 92)}
          transparent
          opacity={0.2}
          emissive={toColor(198, 26, 82)}
          emissiveIntensity={0.14}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

const BlossomTree: React.FC<{ data: TreeData; blossomTexture: THREE.Texture }> = ({ data, blossomTexture }) => {
  const treeRef = useRef<THREE.Group>(null);

  const branches = useMemo(() => {
    return Array.from({ length: 9 }, (_, i) => {
      const ring = i < 5 ? 0.18 : 0.26;
      const angle = (i / 9) * Math.PI * 2 + hash(data.seed * (i + 1) * 13) * 0.9;
      const baseX = Math.cos(angle) * ring;
      const baseZ = Math.sin(angle) * ring;
      const y = 1.35 + hash(data.seed * (i + 1) * 17) * 0.95;
      const len = 0.7 + hash(data.seed * (i + 1) * 19) * 0.95;
      const pitch = 0.35 + hash(data.seed * (i + 1) * 23) * 0.55;
      const roll = hash(data.seed * (i + 1) * 29) * 0.6 - 0.3;
      return {
        base: [baseX, y, baseZ] as [number, number, number],
        rotation: [pitch, angle, roll] as [number, number, number],
        length: len,
        thickness: 0.02 + hash(data.seed * (i + 1) * 31) * 0.03,
      };
    });
  }, [data.seed]);

  const blossoms = useMemo(() => {
    return Array.from({ length: 46 }, (_, i) => {
      const ring = 0.45 + hash(data.seed * (i + 1) * 37) * 1.25;
      const angle = (i / 46) * Math.PI * 2 + hash(data.seed * (i + 1) * 41) * 0.8;
      const x = Math.cos(angle) * ring;
      const y = 1.9 + hash(data.seed * (i + 1) * 43) * 1.7;
      const z = Math.sin(angle) * ring;
      const scale = 0.25 + hash(data.seed * (i + 1) * 47) * 0.28;
      const hue = 332 + hash(data.seed * (i + 1) * 53) * 16;
      const sat = 68 + hash(data.seed * (i + 1) * 59) * 18;
      const light = 74 + hash(data.seed * (i + 1) * 61) * 17;
      return {
        position: [x, y, z] as [number, number, number],
        scale,
        color: [hue, sat, light] as HslTriplet,
      };
    });
  }, [data.seed]);

  useFrame(({ clock }) => {
    if (!treeRef.current) return;
    const sway = Math.sin(clock.elapsedTime * 0.52 + data.seed * 7.2) * 0.022;
    treeRef.current.rotation.z = sway;
    treeRef.current.rotation.x = Math.cos(clock.elapsedTime * 0.24 + data.seed * 5.1) * 0.008;
  });

  return (
    <group ref={treeRef} position={data.position} scale={[data.scale, data.scale, data.scale]}>
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.08, 0.18, 2.35, 9]} />
        <meshStandardMaterial color={toColor(24, 40, 23)} roughness={0.95} />
      </mesh>

      {branches.map((branch, i) => (
        <group key={i} position={branch.base} rotation={branch.rotation}>
          <mesh position={[0, branch.length * 0.46, 0]}>
            <cylinderGeometry args={[branch.thickness * 0.62, branch.thickness, branch.length, 6]} />
            <meshStandardMaterial color={toColor(23, 36, 26)} roughness={0.92} />
          </mesh>
        </group>
      ))}

      {blossoms.map((blossom, i) => (
        <sprite key={i} position={blossom.position} scale={[blossom.scale * 1.2, blossom.scale, 1]}>
          <spriteMaterial
            map={blossomTexture}
            color={toColor(blossom.color[0], blossom.color[1], blossom.color[2])}
            transparent
            opacity={0.92}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
};

const TreeRows: React.FC<{ blossomTexture: THREE.Texture }> = ({ blossomTexture }) => {
  const trees = useMemo<TreeData[]>(() => {
    const items: TreeData[] = [];

    for (let i = 0; i < 24; i++) {
      const z = 12 - i * 6;
      const leftX = -(6.2 + hash(i * 13 + 1) * 3.2);
      const rightX = 6.2 + hash(i * 13 + 2) * 3.2;

      items.push({
        position: [leftX, -3.2, z + (hash(i * 17 + 3) - 0.5) * 1.9],
        scale: 0.94 + hash(i * 19 + 4) * 0.5,
        seed: hash(i * 23 + 5),
      });

      items.push({
        position: [rightX, -3.2, z + (hash(i * 17 + 33) - 0.5) * 1.9],
        scale: 0.94 + hash(i * 19 + 34) * 0.5,
        seed: hash(i * 23 + 35),
      });
    }

    return items;
  }, []);

  return (
    <group>
      {trees.map((tree, i) => (
        <BlossomTree key={i} data={tree} blossomTexture={blossomTexture} />
      ))}
    </group>
  );
};

const WindPetals: React.FC<{ isTransitioning: boolean; petalTexture: THREE.Texture }> = ({ isTransitioning, petalTexture }) => {
  const petalGroupRef = useRef<THREE.Group>(null);
  const gustRef = useRef(0);
  const prevTransitionRef = useRef(false);

  const petals = useMemo(
    () =>
      Array.from({ length: 180 }, (_, i) => ({
        depth: -120 + hash(i * 1.7) * 155,
        yOffset: -1 + hash(i * 3.2) * 10.5,
        offset: hash(i * 4.9) * 36,
        speed: 0.55 + hash(i * 6.1) * 1.5,
        sway: 0.65 + hash(i * 7.3) * 2.05,
        size: 0.05 + hash(i * 8.7) * 0.095,
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

    petalGroupRef.current.children.forEach((child, i) => {
      if (!(child instanceof THREE.Sprite)) return;
      const petal = petals[i];
      if (!petal) return;

      const cycle = (t * petal.speed * wind + petal.offset) % 34;
      const x = -14 + ((cycle * 1.15 + Math.sin(cycle * 0.3)) % 28);
      const y = 6.4 - cycle * 0.33 + Math.sin(cycle * petal.sway) * 0.6 + petal.yOffset;
      const z = petal.depth + Math.sin(cycle * 0.45 + petal.offset) * 1.2;

      child.position.set(x, y, z);
      child.rotation.set(cycle * 0.82, Math.sin(cycle * 1.9) * 1.35, cycle * 0.7);
      child.scale.set(petal.size * 1.4, petal.size, 1);

      const mat = child.material as THREE.SpriteMaterial;
      mat.opacity = y > 5.5 || y < -4 ? 0.12 : 0.82;
    });
  });

  return (
    <group ref={petalGroupRef}>
      {petals.map((_, i) => {
        const h = i % 3 === 0 ? 336 : i % 3 === 1 ? 346 : 330;
        const s = i % 3 === 0 ? 80 : i % 3 === 1 ? 72 : 76;
        const l = i % 3 === 0 ? 78 : i % 3 === 1 ? 84 : 74;
        return (
          <sprite key={i}>
            <spriteMaterial
              map={petalTexture}
              color={toColor(h, s, l)}
              transparent
              opacity={0.82}
              depthWrite={false}
            />
          </sprite>
        );
      })}
    </group>
  );
};

const AtmosphericMist: React.FC = () => (
  <group>
    <mesh position={[0, -0.6, -74]}>
      <planeGeometry args={[100, 18]} />
      <meshBasicMaterial color={toColor(207, 42, 82)} transparent opacity={0.17} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, -1.25, -53]}>
      <planeGeometry args={[78, 13]} />
      <meshBasicMaterial color={toColor(200, 34, 79)} transparent opacity={0.12} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

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
  const cloudTexture = useMemo(() => createSoftSpriteTexture(0.95, 0.32), []);
  const blossomTexture = useMemo(() => createSoftSpriteTexture(1, 0.24), []);
  const petalTexture = useMemo(() => createSoftSpriteTexture(1, 0.2), []);

  return (
    <>
      <fog attach="fog" args={[toColor(207, 48, 79), 20, 170]} />

      <ambientLight intensity={0.58} color={toColor(42, 100, 95)} />
      <directionalLight position={[14, 16, 2]} intensity={0.9} color={toColor(40, 92, 90)} />
      <directionalLight position={[-8, 8, 12]} intensity={0.3} color={toColor(208, 66, 83)} />
      <hemisphereLight color={toColor(206, 70, 84)} groundColor={toColor(126, 30, 35)} intensity={0.45} />

      <SkyDome />
      <SunAndGlow />
      <CloudField cloudTexture={cloudTexture} />
      <MountainRange />
      <RiverBanks />
      <FlowingWater />
      <TreeRows blossomTexture={blossomTexture} />
      <AtmosphericMist />
      <WindPetals isTransitioning={isTransitioning} petalTexture={petalTexture} />

      <ReactiveCamera currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} />
    </>
  );
};

const Scene3D: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 1, 12], fov: 54, near: 0.1, far: 220 }} gl={{ antialias: true, alpha: true }}>
        <React.Suspense fallback={null}>
          <SceneContent currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
