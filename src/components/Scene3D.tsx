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

type BranchSegment = {
  start: [number, number, number];
  rotation: [number, number, number];
  length: number;
  thickness: number;
  tip: [number, number, number];
};

const toColor = (h: number, s: number, l: number) => new THREE.Color().setHSL(h / 360, s / 100, l / 100);
const fract = (n: number) => n - Math.floor(n);
const hash = (n: number) => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453123);

const noise3 = (x: number, y: number, z: number, seed: number) => {
  const a = Math.sin(x * 1.7 + y * 2.3 + z * 1.1 + seed * 13.1);
  const b = Math.sin(x * 3.1 - y * 1.4 + z * 2.7 + seed * 7.3);
  const c = Math.sin(x * 6.3 + y * 4.2 - z * 3.5 + seed * 3.9);
  return (a + b * 0.5 + c * 0.25) / 1.75;
};

const createSoftSpriteTexture = ({
  centerOpacity,
  midOpacity,
  edgeOpacity,
  shape,
}: {
  centerOpacity: number;
  midOpacity: number;
  edgeOpacity: number;
  shape: 'cloud' | 'leaf';
}) => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;

  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  if (shape === 'leaf') {
    ctx.translate(64, 64);
    ctx.beginPath();
    ctx.moveTo(0, -44);
    ctx.bezierCurveTo(22, -30, 30, -4, 0, 42);
    ctx.bezierCurveTo(-30, -4, -22, -30, 0, -44);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, -44, 0, 42);
    grad.addColorStop(0, `rgba(255,255,255,${centerOpacity})`);
    grad.addColorStop(0.55, `rgba(255,255,255,${midOpacity})`);
    grad.addColorStop(1, `rgba(255,255,255,${edgeOpacity})`);

    ctx.fillStyle = grad;
    ctx.fill();
  } else {
    const g = ctx.createRadialGradient(64, 64, 12, 64, 64, 58);
    g.addColorStop(0, `rgba(255,255,255,${centerOpacity})`);
    g.addColorStop(0.6, `rgba(255,255,255,${midOpacity})`);
    g.addColorStop(1, `rgba(255,255,255,${edgeOpacity})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }

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
          topColor: { value: toColor(207, 72, 67) },
          midColor: { value: toColor(205, 68, 77) },
          bottomColor: { value: toColor(194, 56, 88) },
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
          uniform vec3 midColor;
          uniform vec3 bottomColor;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition).y;
            float lower = smoothstep(-0.35, 0.2, h);
            float upper = smoothstep(0.08, 0.78, h);
            vec3 col = mix(bottomColor, midColor, lower);
            col = mix(col, topColor, upper);
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    []
  );

  return (
    <mesh>
      <sphereGeometry args={[190, 48, 28]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

const SunAndGlow: React.FC = () => (
  <group position={[18, 24, -138]}>
    <mesh>
      <circleGeometry args={[5.3, 44]} />
      <meshBasicMaterial color={toColor(46, 94, 88)} transparent opacity={0.95} />
    </mesh>
    <mesh>
      <circleGeometry args={[10.4, 44]} />
      <meshBasicMaterial color={toColor(41, 92, 82)} transparent opacity={0.2} />
    </mesh>
    <mesh>
      <circleGeometry args={[17.2, 44]} />
      <meshBasicMaterial color={toColor(37, 86, 80)} transparent opacity={0.08} />
    </mesh>
  </group>
);

const CloudField: React.FC<{ cloudTexture: THREE.Texture }> = ({ cloudTexture }) => {
  const groupRef = useRef<THREE.Group>(null);

  const clouds = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const seed = i + 1;
        const x = -55 + hash(seed * 3) * 110;
        const y = 16 + hash(seed * 5) * 11;
        const z = -165 + hash(seed * 7) * 120;
        const drift = 0.02 + hash(seed * 11) * 0.03;
        const puffs = Array.from({ length: 12 }, (_, p) => {
          const px = (hash(seed * (p + 1) * 13) - 0.5) * 10;
          const py = (hash(seed * (p + 1) * 17) - 0.5) * 3;
          const pz = (hash(seed * (p + 1) * 19) - 0.5) * 4.5;
          const sx = 3.4 + hash(seed * (p + 1) * 23) * 5;
          const sy = 1.8 + hash(seed * (p + 1) * 29) * 2.8;
          return {
            position: [px, py, pz] as [number, number, number],
            scale: [sx, sy] as [number, number],
            color: [208 + hash(seed * (p + 1) * 31) * 8, 22, 86 + hash(seed * (p + 1) * 37) * 8] as HslTriplet,
          };
        });

        return { base: [x, y, z] as [number, number, number], drift, seed, puffs };
      }),
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {
      if (!(child instanceof THREE.Group)) return;
      const cloud = clouds[i];
      if (!cloud) return;

      child.position.x = cloud.base[0] + Math.sin(t * cloud.drift + cloud.seed) * 3.2;
      child.position.y = cloud.base[1] + Math.cos(t * cloud.drift * 0.8 + cloud.seed * 1.4) * 0.45;
      child.position.z = cloud.base[2] + Math.sin(t * cloud.drift * 0.5 + cloud.seed * 1.9) * 1.4;
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <group key={i} position={cloud.base}>
          {cloud.puffs.map((puff, pi) => (
            <sprite key={pi} position={puff.position} scale={[puff.scale[0], puff.scale[1], 1]}>
              <spriteMaterial
                map={cloudTexture}
                color={toColor(puff.color[0], puff.color[1], puff.color[2])}
                transparent
                opacity={0.38}
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
  const geo = new THREE.ConeGeometry(1, 1.35, 22, 26, true);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    const n = noise3(v.x, v.y, v.z, seed);
    const ridge = Math.abs(Math.sin(v.x * 10.5 + seed * 2.2)) * 0.085;
    const radial = 1 + n * 0.22 + ridge;

    v.x *= radial;
    v.z *= radial;

    if (v.y > 0.1) {
      v.y += n * 0.08 + Math.abs(Math.sin(v.x * 5.5 + seed)) * 0.04;
    }

    if (v.y < -0.58) {
      v.x *= 1.08;
      v.z *= 1.08;
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
        <mesh geometry={geometry} scale={[scale[0] * 0.38, scale[1] * 0.33, scale[2] * 0.38]} position={[0, scale[1] * 0.46, 0]}>
          <meshStandardMaterial color={toColor(snowColor[0], snowColor[1], snowColor[2])} roughness={0.34} flatShading />
        </mesh>
      )}
    </group>
  );
};

const MountainRange: React.FC = () => (
  <group position={[0, -4.1, -125]}>
    <NaturalMountain position={[0, 15, -14]} scale={[29, 27, 19]} color={[215, 24, 43]} snowColor={[208, 26, 90]} seed={1.1} />
    <NaturalMountain position={[-29, 12, -6]} scale={[22, 20, 15]} color={[213, 22, 40]} snowColor={[205, 24, 87]} seed={2.2} />
    <NaturalMountain position={[30, 11, -5]} scale={[20, 18.5, 14]} color={[210, 22, 41]} snowColor={[204, 24, 88]} seed={3.3} />

    <NaturalMountain position={[-14, 8, 14]} scale={[15, 12, 9.4]} color={[188, 20, 34]} seed={4.4} />
    <NaturalMountain position={[17, 7.5, 16]} scale={[14, 11.2, 8.8]} color={[185, 19, 33]} seed={5.5} />
    <NaturalMountain position={[-38, 6.3, 16]} scale={[11.5, 9.2, 7.2]} color={[191, 17, 36]} seed={6.6} />
    <NaturalMountain position={[39, 6, 17]} scale={[11, 8.8, 6.9]} color={[190, 17, 37]} seed={7.7} />
  </group>
);

const RiverBanks: React.FC = () => (
  <group>
    <mesh position={[-13, -3.22, -54]} rotation={[-Math.PI / 2, 0.06, 0.03]}>
      <planeGeometry args={[24, 220, 24, 40]} />
      <meshStandardMaterial color={toColor(126, 35, 34)} roughness={0.97} />
    </mesh>

    <mesh position={[13, -3.22, -54]} rotation={[-Math.PI / 2, -0.06, -0.03]}>
      <planeGeometry args={[24, 220, 24, 40]} />
      <meshStandardMaterial color={toColor(128, 35, 35)} roughness={0.97} />
    </mesh>

    <mesh position={[0, -3.34, 15]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[72, 34]} />
      <meshStandardMaterial color={toColor(123, 29, 32)} roughness={0.98} />
    </mesh>
  </group>
);

const FlowingRiver: React.FC = () => {
  const riverRef = useRef<THREE.Mesh>(null);
  const baseRef = useRef<Float32Array | null>(null);

  const riverGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 220, 96, 320);
    const pos = geo.attributes.position;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < pos.count; i++) {
      const baseX = arr[i * 3]; // -0.5..0.5
      const z = arr[i * 3 + 1];

      const center = Math.sin(z * 0.035) * 2.2 + Math.sin(z * 0.011 + 1.5) * 1.5;
      const width = 11 + Math.sin(z * 0.025 + 0.8) * 1.8;

      arr[i * 3] = center + baseX * width;
      arr[i * 3 + 2] = 0;
    }

    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!riverRef.current) return;

    const t = clock.elapsedTime;
    const geo = riverRef.current.geometry;
    const pos = geo.attributes.position;
    const arr = pos.array as Float32Array;

    if (!baseRef.current) {
      baseRef.current = new Float32Array(arr);
    }

    const base = baseRef.current;

    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3];
      const z = base[i * 3 + 1];
      const waveA = Math.sin(z * 0.17 + t * 1.6) * 0.12;
      const waveB = Math.cos(x * 0.65 - t * 0.9) * 0.08;
      const waveC = Math.sin((x + z) * 0.11 + t * 1.25) * 0.05;
      const drift = Math.sin((z + t * 8) * 0.052) * 0.03;
      arr[i * 3 + 2] = waveA + waveB + waveC + drift;
    }

    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <group position={[0, -3.04, -54]}>
      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={riverGeometry}>
        <meshStandardMaterial color={toColor(209, 50, 22)} roughness={1} />
      </mesh>

      <mesh ref={riverRef} rotation={[-Math.PI / 2, 0, 0]} geometry={riverGeometry}>
        <meshStandardMaterial
          color={toColor(199, 64, 46)}
          emissive={toColor(197, 57, 31)}
          emissiveIntensity={0.15}
          transparent
          opacity={0.74}
          roughness={0.08}
          metalness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={riverGeometry}>
        <meshStandardMaterial
          color={toColor(197, 40, 84)}
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

const buildTreeBranches = (seed: number): { primary: BranchSegment[]; secondary: BranchSegment[] } => {
  const primary: BranchSegment[] = [];
  const secondary: BranchSegment[] = [];

  const primaryCount = 7;
  for (let i = 0; i < primaryCount; i++) {
    const a = (i / primaryCount) * Math.PI * 2 + hash(seed * (i + 2) * 11) * 0.7;
    const pitch = 0.25 + hash(seed * (i + 3) * 13) * 0.45;
    const len = 0.9 + hash(seed * (i + 4) * 17) * 1.05;
    const y = 1.15 + hash(seed * (i + 5) * 19) * 1.05;

    const dirX = Math.sin(a) * Math.cos(pitch);
    const dirY = Math.sin(pitch);
    const dirZ = Math.cos(a) * Math.cos(pitch);

    const tip: [number, number, number] = [dirX * len, y + dirY * len, dirZ * len];

    primary.push({
      start: [0, y, 0],
      rotation: [Math.PI / 2 - pitch, a, 0],
      length: len,
      thickness: 0.03 + hash(seed * (i + 6) * 23) * 0.03,
      tip,
    });

    const secondaryCount = 2 + Math.floor(hash(seed * (i + 7) * 29) * 2);
    for (let j = 0; j < secondaryCount; j++) {
      const sa = a + (hash(seed * (i + 1) * (j + 1) * 31) - 0.5) * 1.25;
      const sp = pitch + 0.18 + hash(seed * (i + 1) * (j + 1) * 37) * 0.3;
      const sl = len * (0.34 + hash(seed * (i + 1) * (j + 1) * 41) * 0.35);

      const sdx = Math.sin(sa) * Math.cos(sp);
      const sdy = Math.sin(sp);
      const sdz = Math.cos(sa) * Math.cos(sp);

      const start: [number, number, number] = [
        tip[0] * 0.68,
        y + (tip[1] - y) * 0.68,
        tip[2] * 0.68,
      ];

      secondary.push({
        start,
        rotation: [Math.PI / 2 - sp, sa, 0],
        length: sl,
        thickness: 0.012 + hash(seed * (i + 1) * (j + 1) * 43) * 0.018,
        tip: [start[0] + sdx * sl, start[1] + sdy * sl, start[2] + sdz * sl],
      });
    }
  }

  return { primary, secondary };
};

const BlossomTree: React.FC<{ data: TreeData; leafTexture: THREE.Texture }> = ({ data, leafTexture }) => {
  const treeRef = useRef<THREE.Group>(null);

  const structure = useMemo(() => buildTreeBranches(data.seed), [data.seed]);

  const leaves = useMemo(() => {
    const anchors = [...structure.primary.map((b) => b.tip), ...structure.secondary.map((b) => b.tip)];

    return Array.from({ length: 88 }, (_, i) => {
      const anchor = anchors[i % anchors.length] ?? [0, 2.2, 0];
      const ox = (hash(data.seed * (i + 1) * 47) - 0.5) * 0.95;
      const oy = (hash(data.seed * (i + 1) * 53) - 0.5) * 0.7;
      const oz = (hash(data.seed * (i + 1) * 59) - 0.5) * 0.95;
      const size = 0.18 + hash(data.seed * (i + 1) * 61) * 0.22;
      const hue = 330 + hash(data.seed * (i + 1) * 67) * 18;
      const sat = 68 + hash(data.seed * (i + 1) * 71) * 18;
      const light = 72 + hash(data.seed * (i + 1) * 73) * 18;

      return {
        position: [anchor[0] + ox, anchor[1] + oy, anchor[2] + oz] as [number, number, number],
        rotation: [
          hash(data.seed * (i + 1) * 79) * Math.PI,
          hash(data.seed * (i + 1) * 83) * Math.PI,
          hash(data.seed * (i + 1) * 89) * Math.PI,
        ] as [number, number, number],
        size,
        color: [hue, sat, light] as HslTriplet,
      };
    });
  }, [data.seed, structure]);

  useFrame(({ clock }) => {
    if (!treeRef.current) return;
    const sway = Math.sin(clock.elapsedTime * 0.5 + data.seed * 7.4) * 0.02;
    treeRef.current.rotation.z = sway;
    treeRef.current.rotation.x = Math.cos(clock.elapsedTime * 0.22 + data.seed * 4.8) * 0.008;
  });

  return (
    <group ref={treeRef} position={data.position} scale={[data.scale, data.scale, data.scale]}>
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.085, 0.19, 2.5, 10]} />
        <meshStandardMaterial color={toColor(24, 40, 23)} roughness={0.95} />
      </mesh>

      <mesh position={[0, 2.24, 0]}>
        <cylinderGeometry args={[0.038, 0.085, 1.15, 8]} />
        <meshStandardMaterial color={toColor(24, 36, 24)} roughness={0.93} />
      </mesh>

      {structure.primary.map((branch, i) => (
        <group key={`p-${i}`} position={branch.start} rotation={branch.rotation}>
          <mesh position={[0, branch.length * 0.5, 0]}>
            <cylinderGeometry args={[branch.thickness * 0.62, branch.thickness, branch.length, 7]} />
            <meshStandardMaterial color={toColor(23, 35, 25)} roughness={0.92} />
          </mesh>
        </group>
      ))}

      {structure.secondary.map((branch, i) => (
        <group key={`s-${i}`} position={branch.start} rotation={branch.rotation}>
          <mesh position={[0, branch.length * 0.5, 0]}>
            <cylinderGeometry args={[branch.thickness * 0.58, branch.thickness, branch.length, 6]} />
            <meshStandardMaterial color={toColor(23, 32, 27)} roughness={0.92} />
          </mesh>
        </group>
      ))}

      {leaves.map((leaf, i) => (
        <mesh key={`l-${i}`} position={leaf.position} rotation={leaf.rotation}>
          <planeGeometry args={[leaf.size * 1.1, leaf.size * 1.55]} />
          <meshStandardMaterial
            map={leafTexture}
            color={toColor(leaf.color[0], leaf.color[1], leaf.color[2])}
            transparent
            opacity={0.95}
            alphaTest={0.14}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

// Trees removed - using SVG PlumBlossomTree overlay instead

const WindPetals: React.FC<{ isTransitioning: boolean; petalTexture: THREE.Texture }> = ({ isTransitioning, petalTexture }) => {
  const groupRef = useRef<THREE.Group>(null);
  const gustRef = useRef(0);
  const prevRef = useRef(false);

  const petals = useMemo(
    () =>
      Array.from({ length: 170 }, (_, i) => ({
        depth: -130 + hash(i * 1.7) * 165,
        yOffset: -1 + hash(i * 3.2) * 10,
        offset: hash(i * 4.9) * 36,
        speed: 0.6 + hash(i * 6.1) * 1.5,
        sway: 0.7 + hash(i * 7.3) * 2,
        size: 0.05 + hash(i * 8.7) * 0.1,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    if (isTransitioning && !prevRef.current) gustRef.current = 1;
    prevRef.current = isTransitioning;
    gustRef.current = Math.max(0, gustRef.current - 0.018);

    const wind = 1 + gustRef.current * 2.9;
    const t = clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {
      if (!(child instanceof THREE.Sprite)) return;
      const p = petals[i];
      if (!p) return;

      const cycle = (t * p.speed * wind + p.offset) % 35;
      const x = -14 + ((cycle * 1.18 + Math.sin(cycle * 0.28)) % 28);
      const y = 6.5 - cycle * 0.34 + Math.sin(cycle * p.sway) * 0.65 + p.yOffset;
      const z = p.depth + Math.sin(cycle * 0.44 + p.offset) * 1.3;

      child.position.set(x, y, z);
      child.rotation.set(cycle * 0.85, Math.sin(cycle * 1.8) * 1.3, cycle * 0.72);
      child.scale.set(p.size * 1.35, p.size, 1);

      const mat = child.material as THREE.SpriteMaterial;
      mat.opacity = y > 5.4 || y < -4 ? 0.14 : 0.84;
    });
  });

  return (
    <group ref={groupRef}>
      {petals.map((_, i) => {
        const h = i % 3 === 0 ? 335 : i % 3 === 1 ? 346 : 329;
        const s = i % 3 === 0 ? 80 : i % 3 === 1 ? 74 : 76;
        const l = i % 3 === 0 ? 78 : i % 3 === 1 ? 84 : 74;

        return (
          <sprite key={i}>
            <spriteMaterial
              map={petalTexture}
              color={toColor(h, s, l)}
              transparent
              opacity={0.84}
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
    <mesh position={[0, -0.7, -90]}>
      <planeGeometry args={[115, 20]} />
      <meshBasicMaterial color={toColor(205, 44, 82)} transparent opacity={0.13} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, -1.3, -62]}>
      <planeGeometry args={[82, 13]} />
      <meshBasicMaterial color={toColor(200, 36, 80)} transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

const ReactiveCamera: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const look = useRef(new THREE.Vector3(0, -1, -20));
  const burstRef = useRef(0);
  const prevRef = useRef(false);

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    const progress = totalSections > 1 ? currentSection / (totalSections - 1) : 0;

    if (isTransitioning && !prevRef.current) burstRef.current = 1;
    prevRef.current = isTransitioning;
    burstRef.current = Math.max(0, burstRef.current - 0.03);

    const travelZ = 13 - progress * 64 - burstRef.current * 1.4;
    const driftX = Math.sin(t * 0.16) * 0.55 + Math.sin(progress * Math.PI * 2) * 0.26;
    const driftY = 0.95 + Math.sin(t * 0.1) * 0.15 - progress * 0.24;

    target.current.set(driftX, driftY, travelZ);
    camera.position.lerp(target.current, isTransitioning ? 0.04 : 0.013);

    look.current.set(driftX * 0.16, -1.08, travelZ - 30);
    camera.lookAt(look.current);
  });

  return null;
};

const SceneContent: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  const cloudTexture = useMemo(() => createSoftSpriteTexture({ centerOpacity: 0.96, midOpacity: 0.35, edgeOpacity: 0, shape: 'cloud' }), []);
  const leafTexture = useMemo(() => createSoftSpriteTexture({ centerOpacity: 1, midOpacity: 0.3, edgeOpacity: 0, shape: 'leaf' }), []);
  const petalTexture = useMemo(() => createSoftSpriteTexture({ centerOpacity: 1, midOpacity: 0.22, edgeOpacity: 0, shape: 'leaf' }), []);

  return (
    <>
      <fog attach="fog" args={[toColor(206, 44, 80), 45, 230]} />

      <ambientLight intensity={0.62} color={toColor(42, 100, 95)} />
      <directionalLight position={[14, 16, 2]} intensity={0.95} color={toColor(40, 92, 90)} />
      <directionalLight position={[-8, 8, 12]} intensity={0.34} color={toColor(208, 66, 83)} />
      <hemisphereLight color={toColor(206, 70, 84)} groundColor={toColor(126, 30, 35)} intensity={0.46} />

      <SkyDome />
      <SunAndGlow />
      <CloudField cloudTexture={cloudTexture} />
      <MountainRange />
      <RiverBanks />
      <FlowingRiver />
      <TreeRows leafTexture={leafTexture} />
      <AtmosphericMist />
      <WindPetals isTransitioning={isTransitioning} petalTexture={petalTexture} />

      <ReactiveCamera currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} />
    </>
  );
};

const Scene3D: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning }) => {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 1, 13], fov: 54, near: 0.1, far: 260 }} gl={{ antialias: true, alpha: true }}>
        <React.Suspense fallback={null}>
          <SceneContent currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
