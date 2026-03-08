import React from 'react';
import { motion } from 'framer-motion';
import CountdownTimer from './CountdownTimer';

const HeroSection: React.FC = () => {
  return (
    <section className="relative flex flex-col items-center justify-center px-4 w-full max-w-4xl mx-auto">
      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center max-w-3xl"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-sm md:text-base uppercase tracking-[0.3em] text-muted-foreground mb-6 font-body"
        >
          A celebration of
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-8xl lg:text-9xl font-display font-bold text-gradient-sunset mb-4 leading-tight"
        >
          Mehnaz
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-lg md:text-2xl text-foreground/70 font-body italic mb-2"
        >
          my Aien
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex items-center justify-center gap-4 my-8"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />
          <motion.span
            animate={{ rotate: [0, 180, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="text-primary/60 text-2xl"
          >
            ✦
          </motion.span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-base md:text-lg text-muted-foreground font-body mb-12 max-w-lg mx-auto"
        >
          Turning <span className="text-primary font-semibold">25</span> — a quarter century of
          beautiful moments, and this is your story.
        </motion.p>

        <CountdownTimer />
      </motion.div>
    </section>
  );
};

export default HeroSection;
