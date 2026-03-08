import React from 'react';
import { motion } from 'framer-motion';
import Scene3D from '@/components/Scene3D';
import HeroSection from '@/components/HeroSection';
import JourneySection from '@/components/JourneySection';
import GallerySection from '@/components/GallerySection';
import AdventureSection from '@/components/AdventureSection';
import BlockBreakerGame from '@/components/BlockBreakerGame';
import ScrollRevealSection from '@/components/ScrollRevealSection';

const SectionDivider = () => (
  <div className="flex items-center justify-center py-8 relative z-10">
    <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary/20" />
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      className="mx-4 text-primary/30 text-sm"
    >
      ✦
    </motion.span>
    <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary/20" />
  </div>
);

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* 3D Three.js background scene */}
      <Scene3D />

      {/* Content layer above the 3D scene */}
      <div className="relative z-10">
        <HeroSection />

        <SectionDivider />

        <ScrollRevealSection direction="up" depth={250}>
          <JourneySection />
        </ScrollRevealSection>

        <SectionDivider />

        <ScrollRevealSection direction="left" depth={200}>
          <GallerySection />
        </ScrollRevealSection>

        <SectionDivider />

        <ScrollRevealSection direction="right" depth={200}>
          <AdventureSection />
        </ScrollRevealSection>

        <SectionDivider />

        <ScrollRevealSection direction="center" depth={150}>
          <BlockBreakerGame />
        </ScrollRevealSection>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center py-16 px-4 relative z-10"
        >
          <p className="text-sm text-muted-foreground/50 font-body">
            Made with all my heart, for you ♥
          </p>
          <p className="text-xs text-muted-foreground/30 mt-2 font-body">
            Happy 25th Birthday, Mehnaz 🌙
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
