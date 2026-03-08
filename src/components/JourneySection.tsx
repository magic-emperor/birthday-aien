import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

interface Memory {
  title: string;
  message: string;
  emoji: string;
}

const memories: Memory[] = [
  {
    title: "The Smile That Started It All",
    message: "Some people light up a room, but you, Aien—you light up a whole world. The first time I saw that smile, I knew something beautiful had just begun.",
    emoji: "🌅",
  },
  {
    title: "Laughter We'll Never Forget",
    message: "Remember those moments where we laughed until we couldn't breathe? Those are the treasures I keep closest to my heart.",
    emoji: "😂",
  },
  {
    title: "Through Every Storm",
    message: "Life wasn't always sunshine, but with you, even the rain felt warm. Your strength through hard times has always amazed me.",
    emoji: "🌧️",
  },
  {
    title: "Little Moments, Big Feelings",
    message: "It's never the grand gestures—it's the quiet cups of tea, the random voice notes, the 'I thought of you' messages that mean everything.",
    emoji: "☕",
  },
  {
    title: "A Heart of Gold",
    message: "Your kindness towards others, your patience, your faith—Mehnaz, you are a gift to everyone who knows you.",
    emoji: "💛",
  },
  {
    title: "Here's to 25",
    message: "A quarter century of being extraordinary. The best chapters of your story are yet to be written, and I can't wait to watch them unfold.",
    emoji: "🎂",
  },
];

const MemoryCard: React.FC<{ memory: Memory; index: number }> = ({ memory, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -80 : 80 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex items-center gap-8 md:gap-16 ${isEven ? 'flex-row' : 'flex-row-reverse'} max-w-4xl mx-auto`}
    >
      {/* Emoji side */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ delay: 0.3, type: 'spring', damping: 12 }}
        className="flex-shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-card/60 backdrop-blur-sm border border-primary/10 flex items-center justify-center text-4xl md:text-5xl"
      >
        {memory.emoji}
      </motion.div>

      {/* Text side */}
      <div className={`flex-1 ${isEven ? 'text-left' : 'text-right'}`}>
        <h3 className="text-xl md:text-2xl font-display text-primary mb-3">
          {memory.title}
        </h3>
        <p className="text-sm md:text-base text-foreground/70 font-body leading-relaxed">
          {memory.message}
        </p>
      </div>
    </motion.div>
  );
};

const JourneySection: React.FC = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="relative py-32 px-4">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-24"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 font-body">
          A journey through
        </p>
        <h2 className="text-3xl md:text-5xl font-display text-gradient-sunset">
          Our Cherished Memories
        </h2>
      </motion.div>

      {/* Timeline line */}
      <div className="absolute left-1/2 top-48 bottom-32 w-px bg-border/30 -translate-x-1/2 hidden md:block">
        <motion.div
          style={{ height: lineHeight }}
          className="w-full bg-gradient-to-b from-primary/60 to-accent/60 origin-top"
        />
      </div>

      {/* Memory cards */}
      <div className="space-y-24 md:space-y-32 relative z-10">
        {memories.map((memory, index) => (
          <MemoryCard key={index} memory={memory} index={index} />
        ))}
      </div>
    </section>
  );
};

export default JourneySection;
