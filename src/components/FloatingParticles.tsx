import React from 'react';
import { motion } from 'framer-motion';

const FloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 8 + Math.random() * 12,
    size: 2 + Math.random() * 4,
    type: Math.random() > 0.5 ? 'circle' : 'star',
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-float"
          style={{
            left: `${p.left}%`,
            bottom: '-20px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.type === 'circle' ? (
            <div
              className="rounded-full bg-primary/20"
              style={{ width: p.size, height: p.size }}
            />
          ) : (
            <div className="text-primary/20" style={{ fontSize: p.size * 3 }}>✦</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FloatingParticles;
