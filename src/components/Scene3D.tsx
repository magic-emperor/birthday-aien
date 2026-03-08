import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SceneProps {
  currentSection: number;
  totalSections: number;
  isTransitioning: boolean;
  isNight?: boolean;
}

type HslTriplet = [number, number, number];

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

const SkyDome: React.FC<{ isNight: boolean }> = ({ isNight }) => {
  const matRef = useRef<THREE.ShaderMaterial>(null);

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

  useFrame(() => {
    if (!material) return;
    const dayTop = toColor(207, 72, 67);
    const dayMid = toColor(205, 68, 77);
    const dayBot = toColor(194, 56, 88);
    const nightTop = toColor(230, 60, 8);
    const nightMid = toColor(225, 50, 15);
    const nightBot = toColor(220, 40, 22);
    const speed = 0.03;
    if (isNight) {
      material.uniforms.topColor.value.lerp(nightTop, speed);
      material.uniforms.midColor.value.lerp(nightMid, speed);
      material.uniforms.bottomColor.value.lerp(nightBot, speed);
    } else {
      material.uniforms.topColor.value.lerp(dayTop, speed);
      material.uniforms.midColor.value.lerp(dayMid, speed);
      material.uniforms.bottomColor.value.lerp(dayBot, speed);
    }
  });

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

// ===== DENSE GRASS FIELD using InstancedMesh for performance =====
const GrassField: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const BLADE_COUNT = 18000;
  const ANIMATED_COUNT = 2000;

  const { matrix, bladeData } = useMemo(() => {
    const dummy = new THREE.Object3D();
    const matrix = new Float32Array(BLADE_COUNT * 16);
    const bladeData: Array<{ lean: number; phase: number; speed: number }> = [];

    for (let i = 0; i < BLADE_COUNT; i++) {
      const side = hash(i * 2.1) > 0.5 ? 1 : -1;
      const x = side * (10 + hash(i * 3.1) * 32);
      const z = -155 + hash(i * 5.7) * 220;
      const height = 0.4 + hash(i * 7.3) * 0.9;
      const lean = (hash(i * 11.3) - 0.5) * 0.3;
      const rotY = hash(i * 23.1) * Math.PI;

      dummy.position.set(x, -2.85 + height * 0.5, z);
      dummy.rotation.set(0, rotY, lean);
      dummy.scale.set(0.12 + hash(i * 9.1) * 0.1, height, 1);
      dummy.updateMatrix();
      dummy.matrix.toArray(matrix, i * 16);
      dummy.updateMatrix();
      dummy.matrix.toArray(matrix, i * 16);

      if (i < ANIMATED_COUNT) {
        bladeData.push({
          lean,
          phase: hash(i * 19.3) * Math.PI * 2,
          speed: 1.0 + hash(i * 21.7) * 1.8,
        });
      }
    }
    return { matrix, bladeData };
  }, []);

  const initDone = useRef(false);

  useFrame(() => {
    if (!meshRef.current || initDone.current) return;
    const m = new THREE.Matrix4();
    for (let i = 0; i < BLADE_COUNT; i++) {
      m.fromArray(matrix, i * 16);
      meshRef.current.setMatrixAt(i, m);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    initDone.current = true;
  });

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    const dummy = new THREE.Object3D();
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const quat = new THREE.Quaternion();

    // Animate only first ANIMATED_COUNT blades, in batches
    const batchSize = 1000;
    const batches = Math.ceil(ANIMATED_COUNT / batchSize);
    const batchIdx = Math.floor(t * 15) % batches;
    const start = batchIdx * batchSize;
    const end = Math.min(start + batchSize, ANIMATED_COUNT);

    for (let i = start; i < end; i++) {
      const blade = bladeData[i];
      m.fromArray(matrix, i * 16);
      m.decompose(pos, quat, scale);

      const sway = Math.sin(t * blade.speed + blade.phase) * 0.16 +
                   Math.sin(t * 0.5 + blade.phase * 1.3 + pos.x * 0.08) * 0.09;

      dummy.position.copy(pos);
      dummy.scale.copy(scale);
      dummy.rotation.set(0, 0, blade.lean + sway);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Create varied green colors per instance
  const colors = useMemo(() => {
    const arr = new Float32Array(BLADE_COUNT * 3);
    const tempColor = new THREE.Color();
    for (let i = 0; i < BLADE_COUNT; i++) {
      const c = toColor(
        90 + hash(i * 13.7) * 40,
        40 + hash(i * 15.1) * 35,
        22 + hash(i * 17.9) * 22
      );
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BLADE_COUNT]} frustumCulled={false}>
      <planeGeometry args={[1, 1]}>
        <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
      </planeGeometry>
      <meshStandardMaterial
        vertexColors
        roughness={0.85}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
};

// ===== ENHANCED RIVER BANKS with pebbles =====
const RiverBanks: React.FC = () => {
  const pebbles = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (10 + hash(i * 7.1) * 5);
      const z = -140 + hash(i * 11.3) * 180;
      const s = 0.15 + hash(i * 13.7) * 0.35;
      const hue = 25 + hash(i * 17.1) * 15;
      const light = 30 + hash(i * 19.3) * 20;
      return { x, z, s, hue, light };
    }), []
  );

  return (
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
      {pebbles.map((p, i) => (
        <mesh key={i} position={[p.x, -3.05, p.z]} rotation={[0, hash(i * 23) * Math.PI, 0]}>
          <sphereGeometry args={[p.s, 6, 5]} />
          <meshStandardMaterial color={toColor(p.hue, 15, p.light)} roughness={0.95} flatShading />
        </mesh>
      ))}
    </group>
  );
};

// ===== ENHANCED FLOWING RIVER =====
const FlowingRiver: React.FC = () => {
  const riverRef = useRef<THREE.Mesh>(null);
  const shimmerRef = useRef<THREE.Mesh>(null);
  const foamRef = useRef<THREE.Group>(null);
  const baseRef = useRef<Float32Array | null>(null);
  const shimmerBaseRef = useRef<Float32Array | null>(null);

  const riverGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 220, 64, 200);
    const pos = geo.attributes.position;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < pos.count; i++) {
      const baseX = arr[i * 3];
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

  const shimmerGeometry = useMemo(() => riverGeometry.clone(), [riverGeometry]);

  const foamSpots = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => {
      const z = -120 + i * 8 + (hash(i * 5.3) - 0.5) * 6;
      const center = Math.sin(z * 0.035) * 2.2 + Math.sin(z * 0.011 + 1.5) * 1.5;
      const side = (hash(i * 7.1) - 0.5) * 8;
      return {
        x: center + side, z,
        size: 0.3 + hash(i * 9.7) * 0.5,
        speed: 0.8 + hash(i * 11.3) * 1.2,
        phase: hash(i * 13.7) * Math.PI * 2,
      };
    }), []
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    if (riverRef.current) {
      const pos = riverRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      if (!baseRef.current) baseRef.current = new Float32Array(arr);
      const base = baseRef.current;
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3];
        const z = base[i * 3 + 1];
        const waveA = Math.sin(z * 0.14 + t * 1.4) * 0.18;
        const waveB = Math.cos(x * 0.5 - t * 0.8) * 0.1;
        const waveC = Math.sin((x + z) * 0.09 + t * 1.1) * 0.07;
        const ripple = Math.sin(x * 2.0 + z * 1.5 + t * 2.8) * 0.03;
        const flow = Math.sin((z + t * 5) * 0.045) * 0.05;
        arr[i * 3 + 2] = waveA + waveB + waveC + ripple + flow;
      }
      pos.needsUpdate = true;
      riverRef.current.geometry.computeVertexNormals();
    }

    if (shimmerRef.current) {
      const pos = shimmerRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      if (!shimmerBaseRef.current) shimmerBaseRef.current = new Float32Array(arr);
      const base = shimmerBaseRef.current;
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3];
        const z = base[i * 3 + 1];
        arr[i * 3 + 2] = Math.sin(z * 0.22 + t * 2.1 + 0.5) * 0.08 + Math.cos(x * 1.1 - t * 1.4 + 1.2) * 0.05 + 0.03;
      }
      pos.needsUpdate = true;
      shimmerRef.current.geometry.computeVertexNormals();
    }

    if (foamRef.current) {
      foamRef.current.children.forEach((child, i) => {
        const spot = foamSpots[i];
        if (!spot) return;
        const pulse = 0.7 + Math.sin(t * spot.speed + spot.phase) * 0.3;
        child.scale.set(spot.size * pulse, spot.size * pulse, 1);
        (child as THREE.Mesh).position.y = 0.04 + Math.sin(t * 1.5 + spot.phase) * 0.02;
      });
    }
  });

  return (
    <group position={[0, -3.04, -54]}>
      {/* River bed */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={riverGeometry}>
        <meshStandardMaterial color={toColor(205, 45, 15)} roughness={1} />
      </mesh>

      {/* Main water surface */}
      <mesh ref={riverRef} rotation={[-Math.PI / 2, 0, 0]} geometry={riverGeometry}>
        <meshStandardMaterial
          color={toColor(200, 58, 42)}
          emissive={toColor(195, 50, 25)}
          emissiveIntensity={0.12}
          transparent opacity={0.72}
          roughness={0.05} metalness={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Shimmer/reflection layer */}
      <mesh ref={shimmerRef} rotation={[-Math.PI / 2, 0, 0]} geometry={shimmerGeometry}>
        <meshStandardMaterial
          color={toColor(195, 35, 82)}
          transparent opacity={0.12}
          roughness={0} metalness={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Sun glint highlights */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={riverGeometry}>
        <meshStandardMaterial
          color={toColor(42, 80, 95)}
          transparent opacity={0.06}
          roughness={0} metalness={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Foam spots */}
      <group ref={foamRef}>
        {foamSpots.map((spot, i) => (
          <mesh key={i} position={[spot.x, 0.04, spot.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[spot.size, 12]} />
            <meshBasicMaterial color={toColor(200, 20, 92)} transparent opacity={0.25} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ===== SVG Tree rendered as a 3D billboard =====
const TREE_SVG_WIDTH = 710;
const TREE_SVG_HEIGHT = 700;

const branchPaths: Array<{ points: [number, number][]; spread: number; density: number }> = [
  { points: [[228,345],[195,315],[155,288],[115,262],[78,248],[45,240],[18,238]], spread: 30, density: 95 },
  { points: [[268,330],[305,300],[348,272],[392,252],[432,238],[462,232],[488,235]], spread: 30, density: 95 },
  { points: [[192,205],[168,178],[142,152],[118,128],[98,108],[82,90],[68,72]], spread: 26, density: 85 },
  { points: [[308,205],[332,178],[358,152],[382,128],[402,108],[418,90],[432,72]], spread: 26, density: 85 },
  { points: [[248,210],[246,178],[243,145],[240,112],[236,80],[232,52],[228,28]], spread: 24, density: 75 },
  { points: [[225,300],[202,288],[178,278],[152,272],[128,268]], spread: 24, density: 65 },
  { points: [[272,295],[298,278],[325,265],[352,252],[378,242]], spread: 24, density: 65 },
  { points: [[245,280],[232,258],[220,238],[208,222],[195,208]], spread: 18, density: 35 },
  { points: [[255,280],[268,258],[280,238],[292,222],[305,208]], spread: 18, density: 35 },
  { points: [[155,288],[135,272],[112,268],[92,275],[75,285]], spread: 22, density: 50 },
  { points: [[78,248],[58,232],[42,210],[35,188],[30,162]], spread: 22, density: 50 },
  { points: [[78,248],[62,262],[48,278]], spread: 20, density: 32 },
  { points: [[98,108],[80,88],[62,68],[50,50],[42,32]], spread: 20, density: 42 },
  { points: [[98,108],[115,88],[132,65],[142,42],[148,22]], spread: 20, density: 42 },
  { points: [[68,72],[52,52],[38,35]], spread: 16, density: 25 },
  { points: [[68,72],[80,48],[92,28]], spread: 16, density: 25 },
  { points: [[402,108],[420,88],[442,65],[458,48],[472,32]], spread: 20, density: 42 },
  { points: [[402,108],[388,82],[372,58],[362,38],[355,18]], spread: 20, density: 42 },
  { points: [[432,72],[448,52],[462,35]], spread: 16, density: 25 },
  { points: [[432,72],[420,48],[410,25]], spread: 16, density: 25 },
  { points: [[432,238],[455,218],[475,195],[490,178],[502,158]], spread: 22, density: 50 },
  { points: [[432,238],[452,248],[468,258]], spread: 16, density: 25 },
  { points: [[378,242],[395,222],[408,200]], spread: 16, density: 25 },
  { points: [[236,80],[220,55],[205,35],[195,18],[188,-2]], spread: 16, density: 32 },
  { points: [[236,80],[252,55],[268,38],[282,22],[295,10]], spread: 16, density: 32 },
  { points: [[243,145],[225,128],[208,118]], spread: 15, density: 25 },
  { points: [[243,145],[260,122],[278,112]], spread: 15, density: 25 },
  { points: [[128,268],[112,260],[95,262]], spread: 15, density: 20 },
  { points: [[128,268],[118,285],[110,300]], spread: 15, density: 20 },
  { points: [[18,238],[2,228],[-10,215]], spread: 15, density: 20 },
  { points: [[18,238],[8,252],[0,268]], spread: 15, density: 20 },
  { points: [[30,162],[18,142],[10,122]], spread: 13, density: 18 },
  { points: [[502,158],[512,138],[520,118]], spread: 13, density: 18 },
  { points: [[18,238],[-5,248],[-25,262],[-40,278]], spread: 18, density: 35 },
  { points: [[18,238],[-10,232],[-30,225],[-45,220]], spread: 16, density: 30 },
  { points: [[488,235],[508,245],[525,258],[538,272]], spread: 18, density: 35 },
  { points: [[488,235],[510,228],[528,222],[542,218]], spread: 16, density: 30 },
  { points: [[45,240],[28,252],[15,268],[5,282]], spread: 16, density: 28 },
  { points: [[115,262],[100,248],[82,238],[68,232]], spread: 16, density: 28 },
  { points: [[155,288],[145,302],[138,318],[132,332]], spread: 14, density: 22 },
  { points: [[462,232],[478,245],[492,260],[505,278]], spread: 16, density: 28 },
  { points: [[392,252],[408,242],[422,235],[435,230]], spread: 16, density: 28 },
  { points: [[348,272],[342,288],[338,305],[335,320]], spread: 14, density: 22 },
  { points: [[142,152],[125,142],[108,138],[92,140]], spread: 16, density: 28 },
  { points: [[142,152],[148,135],[155,118],[160,102]], spread: 14, density: 22 },
  { points: [[358,152],[375,142],[392,138],[408,140]], spread: 16, density: 28 },
  { points: [[358,152],[352,135],[345,118],[340,102]], spread: 14, density: 22 },
  { points: [[248,210],[230,198],[212,190],[195,185]], spread: 18, density: 30 },
  { points: [[248,210],[268,198],[288,190],[305,185]], spread: 18, density: 30 },
  { points: [[240,112],[220,100],[200,92],[182,88]], spread: 16, density: 25 },
  { points: [[240,112],[260,100],[280,92],[298,88]], spread: 16, density: 25 },
  { points: [[42,32],[25,18],[12,5],[0,-8]], spread: 14, density: 20 },
  { points: [[148,22],[158,5],[165,-10],[170,-22]], spread: 14, density: 20 },
  { points: [[472,32],[485,18],[495,5],[502,-8]], spread: 14, density: 20 },
  { points: [[355,18],[345,5],[338,-10],[332,-22]], spread: 14, density: 20 },
  { points: [[30,162],[15,172],[2,185],[-8,198]], spread: 14, density: 22 },
  { points: [[502,158],[515,168],[528,182],[538,198]], spread: 14, density: 22 },
];

function generateBlossomLeaves(count: number, rng: (i: number) => number) {
  const pinks = [
    [340, 70, 80], [335, 60, 85], [338, 65, 82], [340, 72, 78],
    [335, 58, 88], [342, 55, 84], [337, 62, 80], [340, 68, 76],
    [345, 50, 86], [340, 75, 75], [338, 60, 90], [342, 65, 78],
  ];
  const leaves: Array<{x:number;y:number;rx:number;ry:number;angle:number;fill:number[];opacity:number}> = [];
  const totalDensity = branchPaths.reduce((s, b) => s + b.density, 0);
  for (let i = 0; i < count; i++) {
    let r = rng(i * 1.1) * totalDensity;
    let branch = branchPaths[0];
    for (const b of branchPaths) { r -= b.density; if (r <= 0) { branch = b; break; } }
    const pts = branch.points;
    const segIdx = Math.floor(rng(i * 2.2) * (pts.length - 1));
    const t = rng(i * 3.3);
    const px = pts[segIdx][0] + (pts[segIdx + 1][0] - pts[segIdx][0]) * t;
    const py = pts[segIdx][1] + (pts[segIdx + 1][1] - pts[segIdx][1]) * t;
    const dx = pts[segIdx + 1][0] - pts[segIdx][0];
    const dy = pts[segIdx + 1][1] - pts[segIdx][1];
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const offset = (rng(i * 4.4) - 0.5) * 2 * branch.spread;
    const x = px + nx * offset + (rng(i * 5.5) - 0.5) * 10;
    const y = py + ny * offset + (rng(i * 6.6) - 0.5) * 10;
    const angle = rng(i * 7.7) * 360;
    const rx = 4 + rng(i * 8.8) * 7;
    const ry = rx * (0.35 + rng(i * 9.9) * 0.2);
    leaves.push({
      x, y, rx, ry, angle,
      fill: pinks[Math.floor(rng(i * 10.1) * pinks.length)],
      opacity: 0.45 + rng(i * 11.2) * 0.45,
    });
  }
  return leaves;
}

const blossomClusters = [
  { x: 230, y: 28, r: 18 }, { x: 250, y: 12, r: 16 }, { x: 205, y: 18, r: 15 },
  { x: 275, y: 20, r: 14 }, { x: 188, y: -2, r: 14 }, { x: 298, y: 10, r: 13 },
  { x: 242, y: 68, r: 17 }, { x: 260, y: 58, r: 14 },
  { x: 98, y: 105, r: 22 }, { x: 68, y: 68, r: 19 }, { x: 142, y: 148, r: 17 },
  { x: 130, y: 58, r: 16 }, { x: 55, y: 52, r: 14 }, { x: 42, y: 30, r: 13 },
  { x: 408, y: 105, r: 22 }, { x: 435, y: 68, r: 19 }, { x: 358, y: 148, r: 17 },
  { x: 378, y: 58, r: 16 }, { x: 450, y: 55, r: 14 }, { x: 468, y: 30, r: 13 },
  { x: 72, y: 248, r: 26 }, { x: 115, y: 268, r: 20 }, { x: 42, y: 208, r: 19 },
  { x: 30, y: 162, r: 18 }, { x: 152, y: 282, r: 19 }, { x: 18, y: 238, r: 17 },
  { x: 445, y: 238, r: 26 }, { x: 482, y: 198, r: 20 }, { x: 508, y: 158, r: 18 },
  { x: 382, y: 242, r: 18 }, { x: 492, y: 235, r: 15 },
  { x: 195, y: 212, r: 19 }, { x: 312, y: 212, r: 18 }, { x: 252, y: 172, r: 17 },
  { x: 225, y: 155, r: 15 }, { x: 280, y: 145, r: 15 }, { x: 175, y: 188, r: 15 },
];

const createTreeTexture = (seed: number): THREE.CanvasTexture => {
  const scale = 1.5;
  const w = Math.round(TREE_SVG_WIDTH * scale);
  const h = Math.round(TREE_SVG_HEIGHT * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  // Offset to match viewBox "-80 -40 710 700"
  ctx.translate(80, 40);

  const rng = (n: number) => fract(Math.sin(n * 127.1 + seed * 311.7) * 43758.5453123);
  
  const hsl = (h: number, s: number, l: number) => `hsl(${h}, ${s}%, ${l}%)`;
  const bark = (l: number) => hsl(25, 28, l);

  // Root system
  ctx.strokeStyle = bark(22); ctx.lineWidth = 11; ctx.lineCap = 'round';
  const drawPath = (d: string) => {
    const p = new Path2D(d);
    ctx.stroke(p);
  };
  drawPath("M215 622 Q192 618 168 620 Q148 624 132 630");
  ctx.lineWidth = 10;
  drawPath("M285 622 Q308 618 332 620 Q352 624 368 630");
  ctx.lineWidth = 6; ctx.strokeStyle = bark(24);
  drawPath("M232 625 Q210 628 190 635");
  ctx.lineWidth = 5;
  drawPath("M268 625 Q290 628 308 632");

  // Root ellipses
  ctx.fillStyle = `hsla(25, 28%, 20%, 0.85)`;
  ctx.beginPath(); ctx.ellipse(250, 620, 68, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `hsla(100, 28%, 35%, 0.4)`;
  ctx.beginPath(); ctx.ellipse(250, 618, 48, 8, 0, 0, Math.PI * 2); ctx.fill();

  // Main trunk
  ctx.fillStyle = hsl(25, 30, 22);
  const trunk = new Path2D("M232 622 Q226 580 222 540 Q216 490 210 440 Q204 395 206 355 Q210 315 216 282 Q220 255 226 228 Q230 210 232 195 L268 195 Q270 210 274 228 Q278 255 282 282 Q286 315 288 355 Q290 395 286 440 Q280 490 274 540 Q270 580 268 622 Z");
  ctx.fill(trunk);
  ctx.fillStyle = hsl(25, 28, 26);
  const innerTrunk = new Path2D("M238 620 Q234 578 232 538 Q228 488 224 438 Q220 398 222 358 Q226 318 230 288 Q234 260 238 235 Q242 215 244 200 L256 200 Q258 215 262 235 Q266 260 268 288 Q272 318 274 358 Q276 398 272 438 Q268 488 264 538 Q260 578 258 620 Z");
  ctx.fill(innerTrunk);

  // Bark texture lines
  ctx.strokeStyle = `hsla(25, 25%, 32%, 0.35)`; ctx.lineWidth = 9;
  drawPath("M246 600 Q242 555 240 510 Q236 460 234 415 Q232 375 235 345");
  ctx.strokeStyle = `hsla(25, 20%, 17%, 0.45)`; ctx.lineWidth = 2.5;
  drawPath("M242 595 Q238 545 236 495 Q234 445 233 400");
  ctx.strokeStyle = `hsla(25, 20%, 17%, 0.4)`; ctx.lineWidth = 2;
  drawPath("M258 590 Q260 540 262 490 Q264 440 263 395");

  // Knots
  ctx.fillStyle = `hsla(25, 28%, 18%, 0.5)`;
  ctx.beginPath(); ctx.ellipse(240, 430, 9, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `hsla(25, 28%, 18%, 0.4)`;
  ctx.beginPath(); ctx.ellipse(258, 365, 7, 5, 0, 0, Math.PI * 2); ctx.fill();

  // Trunk fork
  ctx.strokeStyle = hsl(25, 30, 22); ctx.lineWidth = 20; ctx.lineCap = 'round';
  drawPath("M245 290 Q235 265 222 245 Q210 228 198 215 Q190 208 185 202");
  ctx.lineWidth = 18;
  drawPath("M255 290 Q265 265 278 245 Q290 228 302 215 Q310 208 315 202");

  // All branches
  const branches = [
    // Left main
    { d: "M228 350 Q200 325 172 305 Q142 288 112 272 Q85 258 58 250 Q35 244 18 245", w: 18, c: bark(23) },
    { d: "M225 308 Q200 295 175 285 Q152 278 132 275 Q118 272 108 272", w: 9, c: bark(27) },
    { d: "M155 295 Q138 278 118 275 Q98 278 82 288", w: 7, c: bark(28) },
    { d: "M78 252 Q62 238 48 218 Q38 198 34 178 Q32 165 30 152", w: 7, c: bark(28) },
    { d: "M78 255 Q65 268 55 282 Q48 292 44 300", w: 6, c: bark(28) },
    { d: "M128 275 Q115 265 100 265 Q88 268 78 275", w: 5, c: bark(30) },
    { d: "M18 242 Q5 232 -8 222 Q-15 215 -20 208", w: 4.5, c: bark(30) },
    { d: "M18 248 Q8 262 2 275 Q-2 285 -5 292", w: 4, c: bark(30) },
    { d: "M30 158 Q20 142 14 125 Q10 115 8 105", w: 3.5, c: bark(32) },
    // Right main
    { d: "M268 338 Q298 312 330 290 Q362 270 395 258 Q422 248 448 242 Q470 238 488 242", w: 16, c: bark(23) },
    { d: "M272 302 Q298 285 325 272 Q348 260 372 250 Q388 245 398 242", w: 9, c: bark(27) },
    { d: "M448 245 Q465 228 480 208 Q492 192 500 175 Q508 162 512 148", w: 7, c: bark(28) },
    { d: "M452 248 Q465 258 475 268 Q482 275 488 282", w: 5, c: bark(28) },
    { d: "M398 245 Q408 228 418 212 Q425 200 430 190", w: 5, c: bark(30) },
    { d: "M512 152 Q518 138 522 122 Q525 112 526 102", w: 3.5, c: bark(32) },
    // Upper left
    { d: "M192 208 Q172 185 152 165 Q135 148 118 132 Q102 118 88 102 Q78 90 70 78 Q65 70 62 62", w: 12, c: bark(26) },
    { d: "M98 108 Q82 90 68 72 Q55 55 48 42 Q42 32 38 22", w: 6, c: bark(28) },
    { d: "M98 112 Q115 92 132 72 Q142 55 150 38 Q155 25 158 15", w: 6, c: bark(28) },
    { d: "M62 68 Q50 52 40 38 Q32 25 28 15", w: 5, c: bark(30) },
    { d: "M65 72 Q75 52 88 35 Q95 25 100 18", w: 4.5, c: bark(30) },
    { d: "M243 148 Q228 132 215 122 Q205 115 195 110", w: 5, c: bark(30) },
    // Upper right
    { d: "M308 208 Q328 185 348 165 Q365 148 382 132 Q398 118 412 102 Q422 90 430 78 Q435 70 438 62", w: 11, c: bark(26) },
    { d: "M412 108 Q428 90 442 72 Q455 55 465 42 Q472 30 478 20", w: 6, c: bark(28) },
    { d: "M408 112 Q392 88 378 65 Q368 48 362 32 Q358 20 356 12", w: 6, c: bark(28) },
    { d: "M438 68 Q448 52 458 38 Q465 28 470 18", w: 5, c: bark(30) },
    { d: "M435 72 Q425 52 418 35 Q412 22 408 12", w: 4.5, c: bark(30) },
    { d: "M245 148 Q262 128 278 118 Q290 112 300 108", w: 5, c: bark(30) },
    // Center top
    { d: "M250 218 Q248 188 245 158 Q243 130 241 105 Q239 82 237 62 Q235 45 233 32 Q231 22 230 12", w: 10, c: bark(26) },
    { d: "M237 72 Q222 52 210 35 Q200 22 192 10 Q188 2 185 -8", w: 5, c: bark(30) },
    { d: "M238 78 Q255 58 272 42 Q285 28 295 18 Q302 10 308 2", w: 5, c: bark(30) },
    { d: "M248 210 Q230 198 212 190 Q202 188 195 185", w: 5, c: bark(30) },
    { d: "M248 210 Q268 198 288 190 Q298 188 305 185", w: 5, c: bark(30) },
    { d: "M240 112 Q220 100 200 92 Q190 90 182 88", w: 4, c: bark(30) },
    { d: "M240 112 Q260 100 280 92 Q290 90 298 88", w: 4, c: bark(30) },
    // Extra sub-branches
    { d: "M142 152 Q125 142 108 138 Q98 138 92 140", w: 5, c: bark(30) },
    { d: "M142 152 Q148 135 155 118 Q158 108 160 102", w: 4, c: bark(30) },
    { d: "M358 152 Q375 142 392 138 Q402 138 408 140", w: 5, c: bark(30) },
    { d: "M358 152 Q352 135 345 118 Q342 108 340 102", w: 4, c: bark(30) },
    { d: "M18 238 Q-5 248 -25 262 Q-35 272 -40 278", w: 5, c: bark(28) },
    { d: "M488 235 Q508 245 525 258 Q535 268 538 272", w: 5, c: bark(28) },
    { d: "M45 240 Q28 252 15 268 Q8 278 5 282", w: 4, c: bark(30) },
    { d: "M462 232 Q478 245 492 260 Q502 272 505 278", w: 4, c: bark(30) },
    { d: "M115 262 Q100 248 82 238 Q72 234 68 232", w: 5, c: bark(30) },
    { d: "M392 252 Q408 242 422 235 Q432 232 435 230", w: 5, c: bark(30) },
    { d: "M155 288 Q145 302 138 318 Q135 328 132 332", w: 3.5, c: bark(32) },
    { d: "M348 272 Q342 288 338 305 Q336 315 335 320", w: 3.5, c: bark(32) },
    { d: "M30 162 Q15 172 2 185 Q-5 195 -8 198", w: 3, c: bark(32) },
    { d: "M502 158 Q515 168 528 182 Q535 192 538 198", w: 3, c: bark(32) },
  ];

  for (const b of branches) {
    ctx.strokeStyle = b.c;
    ctx.lineWidth = b.w;
    ctx.lineCap = 'round';
    drawPath(b.d);
  }

  // Blossom petals
  const leaves = generateBlossomLeaves(3000, rng);
  for (const l of leaves) {
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate((l.angle * Math.PI) / 180);
    ctx.globalAlpha = l.opacity;
    ctx.fillStyle = hsl(l.fill[0], l.fill[1], l.fill[2]);
    ctx.beginPath();
    ctx.ellipse(0, 0, l.rx, l.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Blossom clusters with stamen
  ctx.globalAlpha = 1;
  for (const c of blossomClusters) {
    const h1 = 340, s1 = 70, l1 = 80;
    const h2 = 335, s2 = 60, l2 = 85;
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = hsl(h1, s1, l1);
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = hsl(h2, s2, l2);
    ctx.beginPath(); ctx.arc(c.x + c.r * 0.65, c.y - c.r * 0.45, c.r * 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = hsl(h1, s1, l1);
    ctx.beginPath(); ctx.arc(c.x - c.r * 0.55, c.y + c.r * 0.4, c.r * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = hsl(h2, s2, l2);
    ctx.beginPath(); ctx.arc(c.x + c.r * 0.25, c.y + c.r * 0.65, c.r * 0.45, 0, Math.PI * 2); ctx.fill();
    // Stamen
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = hsl(45, 80, 70);
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r * 0.14, 0, Math.PI * 2); ctx.fill();
  }

  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

// A single 3D tree billboard that faces the camera
const TreeBillboard: React.FC<{
  position: [number, number, number];
  scale: number;
  seed: number;
}> = ({ position, scale: s, seed }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => createTreeTexture(seed), [seed]);

  // Gentle sway
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    meshRef.current.rotation.z = Math.sin(t * 0.5 + seed * 7) * 0.015;
  });

  const aspect = TREE_SVG_WIDTH / TREE_SVG_HEIGHT;
  const h = 8 * s;
  const w = h * aspect;

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.05}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

const TreeRows: React.FC = () => {
  const trees = useMemo(() => {
    const items: { position: [number, number, number]; scale: number; seed: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const z = 10 - i * 7;
      const leftX = -(8 + hash(i * 13 + 1) * 4);
      const rightX = 8 + hash(i * 13 + 2) * 4;
      const yBase = 0.5;

      items.push({
        position: [leftX, yBase, z + (hash(i * 17 + 3) - 0.5) * 2],
        scale: 0.8 + hash(i * 19 + 4) * 0.4,
        seed: i * 3.7 + 1,
      });
      items.push({
        position: [rightX, yBase, z + (hash(i * 17 + 33) - 0.5) * 2],
        scale: 0.8 + hash(i * 19 + 34) * 0.4,
        seed: i * 3.7 + 100,
      });
    }
    return items;
  }, []);

  return (
    <group>
      {trees.map((tree, i) => (
        <TreeBillboard key={i} position={tree.position} scale={tree.scale} seed={tree.seed} />
      ))}
    </group>
  );
};

const WindPetals: React.FC<{ isTransitioning: boolean; petalTexture: THREE.Texture }> = ({ isTransitioning, petalTexture }) => {
  const groupRef = useRef<THREE.Group>(null);
  const gustRef = useRef(0);
  const prevRef = useRef(false);

  const petals = useMemo(
    () =>
      Array.from({ length: 350 }, (_, i) => ({
        depth: -130 + hash(i * 1.7) * 165,
        yOffset: -2 + hash(i * 3.2) * 12,
        offset: hash(i * 4.9) * 36,
        speed: 0.4 + hash(i * 6.1) * 1.8,
        sway: 0.5 + hash(i * 7.3) * 2.5,
        size: 0.06 + hash(i * 8.7) * 0.14,
        xSpread: (hash(i * 9.3) - 0.5) * 30,
        wobble: hash(i * 10.1) * Math.PI * 2,
        fallSpeed: 0.15 + hash(i * 11.3) * 0.35,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    if (isTransitioning && !prevRef.current) gustRef.current = 1;
    prevRef.current = isTransitioning;
    gustRef.current = Math.max(0, gustRef.current - 0.012);

    const wind = 1 + gustRef.current * 4;
    const t = clock.elapsedTime;
    // Base wind direction shifts over time
    const windAngle = Math.sin(t * 0.15) * 0.4;
    const windX = Math.cos(windAngle) * wind;
    const windZ = Math.sin(windAngle) * wind * 0.3;

    groupRef.current.children.forEach((child, i) => {
      if (!(child instanceof THREE.Sprite)) return;
      const p = petals[i];
      if (!p) return;

      const cycle = (t * p.speed * wind + p.offset) % 45;
      // Wind-blown horizontal drift
      const x = p.xSpread * 0.5 + Math.sin(cycle * 0.18 + p.wobble) * 4 * windX
        + Math.cos(cycle * 0.07) * 2;
      // Falling with gusts lifting petals
      const lift = gustRef.current * Math.sin(t * 3 + p.offset) * 2;
      const y = 8 - cycle * p.fallSpeed + Math.sin(cycle * p.sway) * 0.8 + p.yOffset + lift;
      const z = p.depth + Math.sin(cycle * 0.44 + p.offset) * 1.5 + windZ * Math.sin(cycle * 0.1);

      child.position.set(x, y, z);
      // Tumbling rotation
      child.rotation.set(
        cycle * 1.2 + Math.sin(t * 2 + p.offset) * 0.5,
        Math.sin(cycle * 1.8 + p.wobble) * 1.5,
        cycle * 0.9 + Math.cos(t * 1.5 + p.offset) * 0.3
      );
      child.scale.set(p.size * 1.4, p.size * 0.8, 1);

      const mat = child.material as THREE.SpriteMaterial;
      mat.opacity = y > 7 || y < -5 ? 0.1 : 0.85;
    });
  });

  return (
    <group ref={groupRef}>
      {petals.map((_, i) => {
        // More color variety — deep pinks, soft whites, warm roses
        const colors: [number, number, number][] = [
          [340, 75, 78], [335, 60, 85], [345, 50, 88],
          [338, 70, 74], [330, 55, 82], [348, 45, 90],
        ];
        const [h, s, l] = colors[i % colors.length];

        return (
          <sprite key={i}>
            <spriteMaterial
              map={petalTexture}
              color={toColor(h, s, l)}
              transparent
              opacity={0.85}
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

// ===== FIREFLIES (night only) =====
const Fireflies: React.FC<{ isNight: boolean }> = ({ isNight }) => {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 60;

  const flies = useMemo(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      x: (hash(i * 3.1) - 0.5) * 80,
      y: -1 + hash(i * 5.3) * 6,
      z: -140 + hash(i * 7.7) * 180,
      speed: 0.3 + hash(i * 9.1) * 0.6,
      phase: hash(i * 11.3) * Math.PI * 2,
      drift: 0.5 + hash(i * 13.7) * 2,
      pulseSpeed: 1.5 + hash(i * 15.1) * 2,
    })), []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const f = flies[i];
      if (!f) return;
      child.position.x = f.x + Math.sin(t * f.speed + f.phase) * f.drift;
      child.position.y = f.y + Math.sin(t * f.speed * 1.3 + f.phase * 0.7) * 0.8;
      child.position.z = f.z + Math.cos(t * f.speed * 0.8 + f.phase * 1.2) * f.drift * 0.5;
      const glow = 0.5 + Math.sin(t * f.pulseSpeed + f.phase) * 0.5;
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = isNight ? Math.max(0.2, glow) : 0;
    });
  });

  return (
    <group ref={groupRef}>
      {flies.map((f, i) => (
        <mesh key={i} position={[f.x, f.y, f.z]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshBasicMaterial color={toColor(50, 100, 75)} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
};

// ===== KOI FISH in river =====
const KoiFish: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const FISH_COUNT = 6;

  const fish = useMemo(() =>
    Array.from({ length: FISH_COUNT }, (_, i) => ({
      startZ: -100 + hash(i * 3.3) * 120,
      speed: 0.8 + hash(i * 5.1) * 1.2,
      offset: hash(i * 7.7) * Math.PI * 2,
      size: 0.25 + hash(i * 9.3) * 0.2,
      hue: hash(i * 11.1) > 0.5 ? 15 : 35, // orange or gold
      sat: 70 + hash(i * 13.3) * 25,
      light: 50 + hash(i * 15.7) * 15,
    })), []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const f = fish[i];
      if (!f) return;
      const z = f.startZ + Math.sin(t * f.speed * 0.3 + f.offset) * 15;
      const center = Math.sin(z * 0.035) * 2.2 + Math.sin(z * 0.011 + 1.5) * 1.5;
      const x = center + Math.sin(t * f.speed + f.offset) * 3;
      child.position.set(x, -3.0, z);
      child.rotation.y = Math.atan2(
        Math.cos(t * f.speed + f.offset) * 3,
        Math.cos(t * f.speed * 0.3 + f.offset) * 15 * f.speed * 0.3
      );
      // Tail wiggle
      child.rotation.z = Math.sin(t * 6 + f.offset) * 0.15;
    });
  });

  return (
    <group ref={groupRef}>
      {fish.map((f, i) => (
        <group key={i} position={[0, -3.0, f.startZ]}>
          {/* Body */}
          <mesh scale={[f.size * 1.8, f.size * 0.5, f.size]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color={toColor(f.hue, f.sat, f.light)} roughness={0.3} metalness={0.2} />
          </mesh>
          {/* Tail */}
          <mesh position={[-f.size * 1.6, 0, 0]} scale={[f.size * 0.8, f.size * 0.6, f.size * 0.3]}>
            <coneGeometry args={[1, 1.5, 4]} />
            <meshStandardMaterial color={toColor(f.hue, f.sat - 10, f.light - 5)} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ===== SHOOTING STARS (night only) =====
const ShootingStars: React.FC<{ isNight: boolean }> = ({ isNight }) => {
  const groupRef = useRef<THREE.Group>(null);
  const STAR_COUNT = 5;

  const stars = useMemo(() =>
    Array.from({ length: STAR_COUNT }, (_, i) => ({
      interval: 6 + hash(i * 3.1) * 10,
      duration: 0.6 + hash(i * 5.3) * 0.5,
      startX: -50 + hash(i * 7.7) * 40,
      startY: 40 + hash(i * 9.1) * 30,
      startZ: -160 + hash(i * 11.3) * 40,
      dx: 40 + hash(i * 13.7) * 30,
      dy: -(12 + hash(i * 15.1) * 8),
      offset: hash(i * 17.3) * 20,
    })), []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const s = stars[i];
      if (!s || !isNight) {
        child.visible = false;
        return;
      }
      const cycle = (t + s.offset) % s.interval;
      const progress = cycle / s.duration;

      if (progress >= 0 && progress <= 1) {
        child.visible = true;
        child.position.x = s.startX + s.dx * progress;
        child.position.y = s.startY + s.dy * progress;
        child.position.z = s.startZ;
        const fade = progress < 0.15 ? progress / 0.15 : progress > 0.6 ? (1 - progress) / 0.4 : 1;
        child.scale.setScalar(1 + fade * 0.8);
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = fade * 0.95;
      } else {
        child.visible = false;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {stars.map((s, i) => (
        <mesh key={i} visible={false}>
          <sphereGeometry args={[0.25, 6, 6]} />
          <meshBasicMaterial color={toColor(45, 80, 98)} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
};

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

const NightStars: React.FC<{ isNight: boolean }> = ({ isNight }) => {
  const groupRef = useRef<THREE.Group>(null);
  const stars = useMemo(() =>
    Array.from({ length: 250 }, (_, i) => ({
      x: (hash(i * 2.3) - 0.5) * 350,
      y: 25 + hash(i * 4.7) * 130,
      z: -190 + hash(i * 6.1) * 80,
      size: 0.12 + hash(i * 8.3) * 0.35,
      twinkleSpeed: 1 + hash(i * 10.7) * 3,
      phase: hash(i * 12.1) * Math.PI * 2,
    })), []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const s = stars[i];
      if (!s) return;
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      const targetOpacity = isNight ? (0.5 + Math.sin(t * s.twinkleSpeed + s.phase) * 0.5) : 0;
      mat.opacity += (targetOpacity - mat.opacity) * 0.08;
    });
  });

  return (
    <group ref={groupRef}>
      {stars.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]}>
          <sphereGeometry args={[s.size, 4, 4]} />
          <meshBasicMaterial color={toColor(45, 15, 98)} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
};

const MoonGlow: React.FC<{ isNight: boolean }> = ({ isNight }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const targetOpacity = isNight ? 1 : 0;
    groupRef.current.children.forEach(child => {
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity += (targetOpacity * (mat.userData.baseOpacity || 0.8) - mat.opacity) * 0.03;
    });
  });

  return (
    <group ref={groupRef} position={[-25, 30, -140]}>
      <mesh>
        <circleGeometry args={[4, 32]} />
        <meshBasicMaterial color={toColor(45, 10, 92)} transparent opacity={0} userData={{ baseOpacity: 0.9 }} />
      </mesh>
      <mesh>
        <circleGeometry args={[8, 32]} />
        <meshBasicMaterial color={toColor(45, 15, 85)} transparent opacity={0} userData={{ baseOpacity: 0.15 }} />
      </mesh>
      <mesh>
        <circleGeometry args={[14, 32]} />
        <meshBasicMaterial color={toColor(220, 20, 70)} transparent opacity={0} userData={{ baseOpacity: 0.06 }} />
      </mesh>
    </group>
  );
};

const SceneContent: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning, isNight = false }) => {
  const cloudTexture = useMemo(() => createSoftSpriteTexture({ centerOpacity: 0.96, midOpacity: 0.35, edgeOpacity: 0, shape: 'cloud' }), []);
  const petalTexture = useMemo(() => createSoftSpriteTexture({ centerOpacity: 1, midOpacity: 0.22, edgeOpacity: 0, shape: 'leaf' }), []);

  return (
    <>
      <fog attach="fog" args={[isNight ? toColor(225, 40, 12) : toColor(206, 44, 80), 45, 230]} />

      <ambientLight intensity={isNight ? 0.15 : 0.62} color={isNight ? toColor(220, 40, 60) : toColor(42, 100, 95)} />
      <directionalLight position={[14, 16, 2]} intensity={isNight ? 0.2 : 0.95} color={isNight ? toColor(220, 30, 70) : toColor(40, 92, 90)} />
      <directionalLight position={[-8, 8, 12]} intensity={isNight ? 0.1 : 0.34} color={toColor(208, 66, 83)} />
      <hemisphereLight color={isNight ? toColor(225, 30, 30) : toColor(206, 70, 84)} groundColor={toColor(126, 30, 35)} intensity={isNight ? 0.15 : 0.46} />

      <SkyDome isNight={isNight} />
      {!isNight && <SunAndGlow />}
      {isNight && <MoonGlow isNight={isNight} />}
      {isNight && <NightStars isNight={isNight} />}
      <CloudField cloudTexture={cloudTexture} />
      <MountainRange />
      <RiverBanks />
      <GrassField />
      <FlowingRiver />
      <TreeRows />
      <AtmosphericMist />
      <Fireflies />
      <KoiFish />
      <ShootingStars />
      <WindPetals isTransitioning={isTransitioning} petalTexture={petalTexture} />

      <ReactiveCamera currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} />
    </>
  );
};

const Scene3D: React.FC<SceneProps> = ({ currentSection, totalSections, isTransitioning, isNight = false }) => {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 1, 13], fov: 54, near: 0.1, far: 260 }} gl={{ antialias: true, alpha: true }}>
        <React.Suspense fallback={null}>
          <SceneContent currentSection={currentSection} totalSections={totalSections} isTransitioning={isTransitioning} isNight={isNight} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
