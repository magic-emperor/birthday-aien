import React from 'react';
import { motion } from 'framer-motion';

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

const JourneySection: React.FC = () => {
  return (
    <section className="py-12 px-4 w-full max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 font-body">
          A journey through
        </p>
        <h2 className="text-3xl md:text-5xl font-display text-gradient-sunset">
          Our Cherished Memories
        </h2>
      </div>

      <div className="space-y-12">
        {memories.map((memory, index) => {
          const isEven = index % 2 === 0;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: isEven ? -40 : 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`flex items-center gap-6 md:gap-12 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <div className="flex-shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-card/60 backdrop-blur-sm border border-primary/10 flex items-center justify-center text-3xl md:text-5xl">
                {memory.emoji}
              </div>
              <div className={`flex-1 ${isEven ? 'text-left' : 'text-right'}`}>
                <h3 className="text-lg md:text-2xl font-display text-primary mb-2">
                  {memory.title}
                </h3>
                <p className="text-sm md:text-base text-foreground/70 font-body leading-relaxed">
                  {memory.message}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default JourneySection;
