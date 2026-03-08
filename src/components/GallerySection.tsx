import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const placeholderImages = [
  { id: 1, alt: "Memory 1" },
  { id: 2, alt: "Memory 2" },
  { id: 3, alt: "Memory 3" },
  { id: 4, alt: "Memory 4" },
  { id: 5, alt: "Memory 5" },
  { id: 6, alt: "Memory 6" },
];

const GalleryCard: React.FC<{ img: { id: number; alt: string }; index: number }> = ({ img, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  const rotateY = useTransform(scrollYProgress, [0, 1], [index % 2 === 0 ? -25 : 25, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0]);
  const translateZ = useTransform(scrollYProgress, [0, 1], [-100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.5, 1]);

  return (
    <div ref={ref} style={{ perspective: '1000px' }}>
      <motion.div
        style={{ rotateY, rotateX, translateZ, opacity }}
        whileHover={{
          scale: 1.08,
          rotateY: 5,
          rotateX: -5,
          translateZ: 30,
          transition: { type: 'spring', stiffness: 300 },
        }}
        className="relative aspect-[4/5] rounded-xl overflow-hidden bg-card/40 border border-primary/10 backdrop-blur-sm group cursor-pointer"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
              className="text-4xl mb-2 opacity-30"
            >
              📷
            </motion.div>
            <p className="text-xs text-muted-foreground/50">Photo {img.id}</p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>
    </div>
  );
};

const GallerySection: React.FC = () => {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div style={{ perspective: '1000px' }}>
        <motion.div
          initial={{ opacity: 0, rotateX: 15, y: 40 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 relative z-10"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 font-body">
            Captured in time
          </p>
          <h2 className="text-3xl md:text-5xl font-display text-gradient-sunset">
            Moments Gallery
          </h2>
          <p className="text-muted-foreground mt-4 font-body text-sm">
            Upload your photos to fill this gallery ✦
          </p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 relative z-10">
        {placeholderImages.map((img, i) => (
          <GalleryCard key={img.id} img={img} index={i} />
        ))}
      </div>
    </section>
  );
};

export default GallerySection;
