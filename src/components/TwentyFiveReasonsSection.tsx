import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const reasons = [
  { reason: "Your laugh that lights up every room", emoji: "😂" },
  { reason: "The way you scrunch your nose when you're thinking", emoji: "🤔" },
  { reason: "How you make even ordinary moments feel magical", emoji: "✨" },
  { reason: "Your kindness that knows no bounds", emoji: "💝" },
  { reason: "The sparkle in your eyes when you're excited", emoji: "🌟" },
  { reason: "How you always know exactly what to say", emoji: "💬" },
  { reason: "Your incredible strength and resilience", emoji: "💪" },
  { reason: "The way you care so deeply about everyone", emoji: "🥰" },
  { reason: "Your beautiful smile that makes my heart skip", emoji: "😊" },
  { reason: "How you turn my worst days into the best ones", emoji: "🌈" },
  { reason: "Your passion for the things you love", emoji: "🔥" },
  { reason: "The way you dance when your favorite song plays", emoji: "💃" },
  { reason: "Your patience with all my silly moments", emoji: "😅" },
  { reason: "How you remember the little things", emoji: "🧠" },
  { reason: "Your voice — especially when you say my name", emoji: "🎵" },
  { reason: "The way you hold my hand", emoji: "🤝" },
  { reason: "Your dreams and how fiercely you chase them", emoji: "🚀" },
  { reason: "How safe I feel when I'm with you", emoji: "🏠" },
  { reason: "Your curiosity about everything in life", emoji: "🔍" },
  { reason: "The way you look at the northern lights", emoji: "🌌" },
  { reason: "Your creativity that amazes me every day", emoji: "🎨" },
  { reason: "How you make me want to be a better person", emoji: "⬆️" },
  { reason: "Your hugs that feel like coming home", emoji: "🤗" },
  { reason: "The way you believe in us, always", emoji: "💑" },
  { reason: "Simply because you are YOU — my Aien", emoji: "👑" },
];

const TwentyFiveReasonsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(1);

  const goNext = () => {
    if (currentIndex < reasons.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (nextIndex >= revealedCount) {
        setRevealedCount(nextIndex + 1);
      }
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentReason = reasons[currentIndex];

  return (
    <section className="relative flex flex-col items-center justify-center px-4 w-full max-w-4xl mx-auto py-12">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]"
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          <h2 className="text-3xl md:text-5xl font-display text-gradient-sunset">
            25 Reasons I Love You
          </h2>
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        </div>
        <p className="text-muted-foreground font-body">
          One for each beautiful year of your life
        </p>
      </motion.div>

      {/* Progress indicator */}
      <div className="flex gap-1.5 mb-8 flex-wrap justify-center max-w-md">
        {reasons.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => i < revealedCount && setCurrentIndex(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'bg-primary scale-125 shadow-[0_0_10px_hsl(var(--primary)/0.5)]'
                : i < revealedCount
                ? 'bg-primary/40 hover:bg-primary/60 cursor-pointer'
                : 'bg-muted-foreground/20 cursor-not-allowed'
            }`}
            whileHover={i < revealedCount ? { scale: 1.2 } : {}}
            disabled={i >= revealedCount}
          />
        ))}
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-lg h-80 mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-card/80 backdrop-blur-xl rounded-3xl border border-primary/20 shadow-2xl flex flex-col items-center justify-center p-8 text-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Number badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg shadow-lg">
              {currentIndex + 1}
            </div>

            {/* Emoji */}
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 10 }}
              className="text-6xl mb-6"
            >
              {currentReason.emoji}
            </motion.span>

            {/* Reason text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl font-body text-foreground/90 leading-relaxed"
            >
              {currentReason.reason}
            </motion.p>

            {/* Heart decoration */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute bottom-4 right-4"
            >
              <Heart className="w-5 h-5 text-primary/40 fill-primary/20" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 relative z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="rounded-full w-12 h-12 border-primary/30 hover:bg-primary/10"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <span className="text-muted-foreground font-body text-sm min-w-[80px] text-center">
          {currentIndex + 1} of {reasons.length}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={goNext}
          disabled={currentIndex === reasons.length - 1}
          className="rounded-full w-12 h-12 border-primary/30 hover:bg-primary/10"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Completion message */}
      {revealedCount === reasons.length && currentIndex === reasons.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-primary font-display text-xl">
            ✨ You've seen all 25 reasons! ✨
          </p>
          <p className="text-muted-foreground font-body text-sm mt-2">
            But the real list is infinite, Aien 💕
          </p>
        </motion.div>
      )}
    </section>
  );
};

export default TwentyFiveReasonsSection;
