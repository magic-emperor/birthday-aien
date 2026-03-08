import React from 'react';
import { motion } from 'framer-motion';
import FloatingParticles from '@/components/FloatingParticles';
import HeroSection from '@/components/HeroSection';
import JourneySection from '@/components/JourneySection';
import GallerySection from '@/components/GallerySection';
import AdventureSection from '@/components/AdventureSection';
import BlockBreakerGame from '@/components/BlockBreakerGame';

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <FloatingParticles />

      <HeroSection />

      {/* Divider */}
      <div className="flex items-center justify-center py-8">
        <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary/20" />
        <span className="mx-4 text-primary/30 text-sm">✦</span>
        <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary/20" />
      </div>

      <JourneySection />

      <div className="flex items-center justify-center py-8">
        <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary/20" />
        <span className="mx-4 text-primary/30 text-sm">✦</span>
        <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary/20" />
      </div>

      <GallerySection />

      <div className="flex items-center justify-center py-8">
        <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary/20" />
        <span className="mx-4 text-primary/30 text-sm">✦</span>
        <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary/20" />
      </div>

      <AdventureSection />

      <div className="flex items-center justify-center py-8">
        <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary/20" />
        <span className="mx-4 text-primary/30 text-sm">✦</span>
        <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary/20" />
      </div>

      <BlockBreakerGame />

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center py-16 px-4"
      >
        <p className="text-sm text-muted-foreground/50 font-body">
          Made with all my heart, for you ♥
        </p>
        <p className="text-xs text-muted-foreground/30 mt-2 font-body">
          Happy 25th Birthday, Mehnaz 🌙
        </p>
      </motion.footer>
    </div>
  );
};

export default Index;
