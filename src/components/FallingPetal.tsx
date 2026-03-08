import React from 'react';

interface FallingPetalProps {
  left: number;
  delay: number;
  duration: number;
  size: number;
  shade: number;
}

const petalColors = [
  'hsl(340, 70%, 80%)',
  'hsl(335, 60%, 85%)',
  'hsl(338, 65%, 82%)',
];

const FallingPetal: React.FC<FallingPetalProps> = ({ left, delay, duration, size, shade }) => {
  return (
    <div
      className="absolute pointer-events-none animate-petal-fall"
      style={{
        left: `${left}%`,
        top: '-5%',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        width: size,
        height: size,
      }}
    >
      <svg viewBox="0 0 20 20" width={size} height={size}>
        <ellipse
          cx="10"
          cy="10"
          rx="8"
          ry="5"
          fill={petalColors[shade % petalColors.length]}
          opacity={0.75}
          transform="rotate(30, 10, 10)"
        />
      </svg>
    </div>
  );
};

export default FallingPetal;
