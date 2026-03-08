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

const StepCard: React.FC<{ memory: Memory; index: number }> = ({ memory, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const isEven = index % 2 === 0;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  const translateZ = useTransform(scrollYProgress, [0, 1], [-150, 0]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [isEven ? -20 : 20, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const stepOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.5, 1]);
  const translateX = useTransform(scrollYProgress, [0, 1], [isEven ? -80 : 80, 0]);
  const translateY = useTransform(scrollYProgress, [0, 1], [60, 0]);

  return (
    <div ref={ref} style={{ perspective: '1200px' }}>
      <motion.div
        style={{
          opacity: stepOpacity,
          rotateY,
          rotateX,
          translateZ,
          translateX,
          translateY,
          transformOrigin: isEven ? 'right center' : 'left center',
        }}
        className="relative"
      >
        {/* Step connector line */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={isInView ? { scaleY: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute left-1/2 -top-16 w-px h-16 bg-gradient-to-b from-transparent to-primary/30 origin-top hidden md:block"
        />

        {/* Step number indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.3, type: 'spring', damping: 12 }}
          className="absolute left-1/2 -top-4 -translate-x-1/2 w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center z-20 hidden md:flex"
        >
          <span className="text-xs text-primary font-display">{index + 1}</span>
        </motion.div>

        <div className={`flex items-center gap-8 md:gap-16 ${isEven ? 'flex-row' : 'flex-row-reverse'} max-w-4xl mx-auto mt-8`}>
          {/* Emoji side with 3D card effect */}
          <motion.div
            whileHover={{ rotateY: 15, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex-shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-card/60 backdrop-blur-sm border border-primary/10 flex items-center justify-center text-4xl md:text-5xl"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {memory.emoji}
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? -30 : 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`flex-1 ${isEven ? 'text-left' : 'text-right'}`}
          >
            <h3 className="text-xl md:text-2xl font-display text-primary mb-3">
              {memory.title}
            </h3>
            <p className="text-sm md:text-base text-foreground/70 font-body leading-relaxed">
              {memory.message}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const JourneySection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="relative py-32 px-4">
      {/* Section header */}
      <div style={{ perspective: '1000px' }}>
        <motion.div
          initial={{ opacity: 0, rotateX: 20, y: 40 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 font-body">
            A journey through
          </p>
          <h2 className="text-3xl md:text-5xl font-display text-gradient-sunset">
            Our Cherished Memories
          </h2>
        </motion.div>
      </div>

      {/* Timeline line */}
      <div className="absolute left-1/2 top-48 bottom-32 w-px bg-border/30 -translate-x-1/2 hidden md:block">
        <motion.div
          style={{ height: lineHeight }}
          className="w-full bg-gradient-to-b from-primary/60 to-accent/60 origin-top"
        />
      </div>

      {/* Memory step cards */}
      <div className="space-y-20 md:space-y-28 relative z-10">
        {memories.map((memory, index) => (
          <StepCard key={index} memory={memory} index={index} />
        ))}
      </div>
    </section>
  );
};

export default JourneySection;
