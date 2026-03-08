import React from 'react';

const FloatingParticles: React.FC = () => {
  const petals = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 10 + Math.random() * 15,
    size: 8 + Math.random() * 14,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute animate-petal-fall"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        >
          <svg
            width={p.size}
            height={p.size * 1.3}
            viewBox="0 0 20 26"
            className="text-primary/25"
            fill="currentColor"
          >
            <ellipse cx="10" cy="13" rx="8" ry="12" />
            <ellipse cx="10" cy="10" rx="5" ry="8" fill="currentColor" opacity="0.5" />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default FloatingParticles;
