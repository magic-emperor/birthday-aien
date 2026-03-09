import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Confetti {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  size: number;
  type: 'confetti' | 'streamer' | 'star';
}

const colors = [
  '#FF6B9D', '#FFB347', '#87CEEB', '#98D8C8', '#F7DC6F', 
  '#BB8FCE', '#FF69B4', '#00CED1', '#FFD700', '#FF6347'
];

const PartyBlasters: React.FC<{ show: boolean }> = ({ show }) => {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    if (show) {
      // Generate confetti pieces
      const pieces: Confetti[] = [];
      for (let i = 0; i < 150; i++) {
        pieces.push({
          id: i,
          x: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.5,
          rotation: Math.random() * 720 - 360,
          size: Math.random() * 10 + 5,
          type: ['confetti', 'streamer', 'star'][Math.floor(Math.random() * 3)] as any,
        });
      }
      setConfetti(pieces);
      setShowEmoji(true);

      // Clear confetti after animation
      const timer = setTimeout(() => {
        setConfetti([]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  const renderShape = (piece: Confetti) => {
    if (piece.type === 'star') {
      return '⭐';
    } else if (piece.type === 'streamer') {
      return (
        <div 
          className="w-2 rounded-full"
          style={{ 
            backgroundColor: piece.color,
            height: piece.size * 2,
          }}
        />
      );
    }
    return (
      <div 
        className="rounded-sm"
        style={{ 
          backgroundColor: piece.color,
          width: piece.size,
          height: piece.size * 0.6,
        }}
      />
    );
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {/* Confetti pieces */}
          {confetti.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{ 
                y: -20,
                x: `${piece.x}vw`,
                opacity: 1,
                rotate: 0,
                scale: 0,
              }}
              animate={{ 
                y: '110vh',
                rotate: piece.rotation,
                scale: 1,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: piece.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="absolute text-lg"
              style={{ left: `${piece.x}%` }}
            >
              {renderShape(piece)}
            </motion.div>
          ))}

          {/* Center celebration */}
          {showEmoji && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: 'spring',
                damping: 10,
                stiffness: 100,
                delay: 0.3,
              }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0],
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: 3,
                }}
                className="text-6xl md:text-8xl mb-4"
              >
                🎉🎂🎊
              </motion.div>
            </motion.div>
          )}

          {/* Party blaster bursts from corners */}
          <motion.div
            initial={{ scale: 0, x: -50, y: -50 }}
            animate={{ scale: [0, 1.5, 1], x: 0, y: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-0 left-0 text-6xl"
          >
            🎊
          </motion.div>
          <motion.div
            initial={{ scale: 0, x: 50, y: -50 }}
            animate={{ scale: [0, 1.5, 1], x: 0, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="absolute top-0 right-0 text-6xl"
          >
            🎉
          </motion.div>
          <motion.div
            initial={{ scale: 0, x: -50, y: 50 }}
            animate={{ scale: [0, 1.5, 1], x: 0, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute bottom-20 left-0 text-6xl"
          >
            🎈
          </motion.div>
          <motion.div
            initial={{ scale: 0, x: 50, y: 50 }}
            animate={{ scale: [0, 1.5, 1], x: 0, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute bottom-20 right-0 text-6xl"
          >
            🥳
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PartyBlasters;
