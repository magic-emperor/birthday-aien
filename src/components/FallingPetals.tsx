import React, { useMemo } from 'react';

const FallingPetals: React.FC = () => {
  const petals = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 6 + Math.random() * 10,
      size: 8 + Math.random() * 16,
      drift: (Math.random() - 0.5) * 60,
      hue: 330 + Math.random() * 20,
      sat: 55 + Math.random() * 25,
      light: 75 + Math.random() * 15,
      opacity: 0.5 + Math.random() * 0.4,
      rotate: Math.random() * 720 - 360,
    })),
    []
  );

  return (
    <div className="fixed inset-0 z-[8] pointer-events-none overflow-hidden">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: '-3%',
            animation: `petalDrift ${p.duration}s ${p.delay}s ease-in-out infinite`,
            '--drift': `${p.drift}px`,
            '--rotate': `${p.rotate}deg`,
          } as React.CSSProperties}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 24 24">
            <ellipse
              cx="12" cy="12"
              rx="10" ry="6"
              fill={`hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${p.opacity})`}
              transform="rotate(25, 12, 12)"
            />
            <ellipse
              cx="14" cy="10"
              rx="7" ry="4"
              fill={`hsla(${p.hue + 5}, ${p.sat - 10}%, ${p.light + 5}%, ${p.opacity * 0.6})`}
              transform="rotate(40, 14, 10)"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default FallingPetals;
