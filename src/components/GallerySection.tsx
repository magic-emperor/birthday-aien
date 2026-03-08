import React from 'react';
import { motion } from 'framer-motion';

const placeholderImages = [
  { id: 1, alt: "Memory 1" },
  { id: 2, alt: "Memory 2" },
  { id: 3, alt: "Memory 3" },
  { id: 4, alt: "Memory 4" },
  { id: 5, alt: "Memory 5" },
  { id: 6, alt: "Memory 6" },
];

const GallerySection: React.FC = () => {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
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

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 relative z-10">
        {placeholderImages.map((img, i) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, y: 40, rotate: -2 + Math.random() * 4 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
            className="relative aspect-[4/5] rounded-xl overflow-hidden bg-card/40 border border-primary/10 backdrop-blur-sm group cursor-pointer"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2 opacity-30">📷</div>
                <p className="text-xs text-muted-foreground/50">Photo {img.id}</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default GallerySection;
