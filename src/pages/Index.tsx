import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Scene3D from '@/components/Scene3D';
import HeroSection from '@/components/HeroSection';
import JourneySection from '@/components/JourneySection';
import GallerySection from '@/components/GallerySection';
import AdventureSection from '@/components/AdventureSection';
import BlockBreakerGame from '@/components/BlockBreakerGame';

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  // Smooth spring-based scroll progress
  const smoothProgress = useSpring(scrollYProgress, { 
    stiffness: 50, 
    damping: 20, 
    mass: 0.5 
  });

  // The entire world moves FORWARD in Z as you scroll
  const worldZ = useTransform(smoothProgress, [0, 1], [0, 8000]);
  // Slight rotation as you travel
  const worldRotateY = useTransform(smoothProgress, [0, 0.3, 0.5, 0.7, 1], [0, -2, 0, 2, 0]);
  const worldRotateX = useTransform(smoothProgress, [0, 1], [0, -1]);

  return (
    <>
      {/* 3D Background */}
      <Scene3D />

      {/* Scroll spacer — this creates the scrollable height */}
      <div ref={containerRef} className="relative" style={{ height: '800vh' }}>

        {/* Fixed 3D viewport */}
        <div 
          className="fixed inset-0 z-10 overflow-hidden"
          style={{ 
            perspective: '1200px',
            perspectiveOrigin: '50% 50%',
          }}
        >
          <motion.div
            style={{
              translateZ: worldZ,
              rotateY: worldRotateY,
              rotateX: worldRotateX,
              transformStyle: 'preserve-3d',
              transformOrigin: 'center center',
            }}
            className="w-full h-full relative"
          >
            {/* === SECTION 1: Hero — at Z=0 (starting point) === */}
            <div
              className="absolute inset-0 w-full h-screen flex items-center justify-center"
              style={{
                transform: 'translateZ(0px)',
                transformStyle: 'preserve-3d',
              }}
            >
              <HeroSection />
            </div>

            {/* === SECTION 2: Journey — placed deeper at Z=-2000 === */}
            <div
              className="absolute left-0 right-0 flex items-center justify-center"
              style={{
                transform: 'translateZ(-1800px) translateY(-50%)',
                top: '50%',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="w-screen max-w-full px-4">
                <JourneySection />
              </div>
            </div>

            {/* === SECTION 3: Gallery — even deeper at Z=-3500 === */}
            <div
              className="absolute left-0 right-0 flex items-center justify-center"
              style={{
                transform: 'translateZ(-3500px) translateX(100px) translateY(-50%)',
                top: '50%',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="w-screen max-w-full px-4">
                <GallerySection />
              </div>
            </div>

            {/* === SECTION 4: Adventure — at Z=-5500 === */}
            <div
              className="absolute left-0 right-0 flex items-center justify-center"
              style={{
                transform: 'translateZ(-5500px) translateX(-100px) translateY(-50%)',
                top: '50%',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="w-screen max-w-full px-4">
                <AdventureSection />
              </div>
            </div>

            {/* === SECTION 5: Game — at Z=-7200 === */}
            <div
              className="absolute left-0 right-0 flex items-center justify-center"
              style={{
                transform: 'translateZ(-7200px) translateY(-50%)',
                top: '50%',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="w-screen max-w-full px-4">
                <BlockBreakerGame />
              </div>
            </div>

            {/* === Footer — at Z=-8000 === */}
            <div
              className="absolute left-0 right-0 flex items-center justify-center"
              style={{
                transform: 'translateZ(-7800px) translateY(-50%)',
                top: '50%',
              }}
            >
              <div className="text-center py-16 px-4">
                <p className="text-sm text-muted-foreground/50 font-body">
                  Made with all my heart, for you ♥
                </p>
                <p className="text-xs text-muted-foreground/30 mt-2 font-body">
                  Happy 25th Birthday, Mehnaz 🌙
                </p>
              </div>
            </div>

            {/* Floating 3D decorative elements along the path */}
            {Array.from({ length: 25 }).map((_, i) => {
              const z = -i * 350;
              const x = Math.sin(i * 0.8) * 400;
              const y = Math.cos(i * 0.6) * 150;
              return (
                <div
                  key={i}
                  className="absolute text-primary/10"
                  style={{
                    transform: `translateZ(${z}px) translateX(${x}px) translateY(${y}px)`,
                    top: '50%',
                    left: '50%',
                    fontSize: `${20 + Math.random() * 30}px`,
                  }}
                >
                  ✦
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Scroll progress indicator */}
        <motion.div
          className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-2"
          style={{ opacity: useTransform(smoothProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]) }}
        >
          <div className="w-1 h-24 bg-border/30 rounded-full overflow-hidden">
            <motion.div
              className="w-full bg-gradient-to-b from-primary to-accent rounded-full origin-top"
              style={{ scaleY: smoothProgress }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground/50 font-body uppercase tracking-widest writing-vertical">
            scroll
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default Index;
