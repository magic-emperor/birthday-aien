import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BlockBreakerGame from './BlockBreakerGame';
import BubbleShooterGame from './BubbleShooterGame';

type GameType = 'brick' | 'bubble';

const games = [
  { id: 'brick' as GameType, name: 'Brick Breaker', emoji: '🧱', description: 'Break bricks & earn rewards!' },
  { id: 'bubble' as GameType, name: 'Bubble Shooter', emoji: '🫧', description: 'Pop matching bubbles!' },
];

const GameSection: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  return (
    <section className="py-32 px-4 relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[400px] h-[400px] rounded-full bg-pink-500/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12 relative z-10"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 font-body">
          Time to play
        </p>
        <h2 className="text-3xl md:text-5xl font-display text-gradient-sunset">
          Birthday Games 🎮
        </h2>
        <p className="text-muted-foreground mt-4 font-body text-sm max-w-md mx-auto">
          Pick a game and have fun! Rewards and surprises await ✨
        </p>
      </motion.div>

      <div className="max-w-2xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {!selectedGame ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {games.map((game, index) => (
                <motion.button
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedGame(game.id)}
                  className="bg-card/60 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 hover:border-primary/40 transition-all group"
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    {game.emoji}
                  </div>
                  <h3 className="text-xl font-display text-primary mb-2">{game.name}</h3>
                  <p className="text-sm text-muted-foreground font-body">{game.description}</p>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {/* Back button */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelectedGame(null)}
                className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body text-sm"
              >
                <span>←</span> Back to games
              </motion.button>

              {/* Game container */}
              {selectedGame === 'brick' && <BlockBreakerGame />}
              {selectedGame === 'bubble' && <BubbleShooterGame />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default GameSection;
