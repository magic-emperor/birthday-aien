import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Scene3D from '@/components/Scene3D';
import HeroSection from '@/components/HeroSection';
import JourneySection from '@/components/JourneySection';
import GallerySection from '@/components/GallerySection';
import AdventureSection from '@/components/AdventureSection';
import BlockBreakerGame from '@/components/BlockBreakerGame';

const SECTIONS = [
  { id: 'hero', Component: HeroSection, label: 'Welcome' },
  { id: 'journey', Component: JourneySection, label: 'Memories' },
  { id: 'gallery', Component: GallerySection, label: 'Gallery' },
  { id: 'adventure', Component: AdventureSection, label: 'Adventure' },
  { id: 'game', Component: BlockBreakerGame, label: 'Game' },
];

const Index = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const sectionContentRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0);

  const goToSection = useCallback((direction: 'forward' | 'backward') => {
    if (isTransitioning) return;

    const next = direction === 'forward' ? currentSection + 1 : currentSection - 1;
    if (next < 0 || next >= SECTIONS.length) return;

    // Check if we should scroll content first
    const container = sectionContentRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
      const atTop = scrollTop <= 10;

      if (direction === 'forward' && !atBottom) return;
      if (direction === 'backward' && !atTop) return;
    }

    setTransitionDirection(direction);
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentSection(next);
      // Reset scroll of new section
      if (sectionContentRef.current) {
        sectionContentRef.current.scrollTop = 0;
      }
    }, 600);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 1800);
  }, [currentSection, isTransitioning]);

  // Wheel handler — navigate sections when content is at boundary
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < 100) return;

      const container = sectionContentRef.current;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
      const atTop = scrollTop <= 10;

      if (e.deltaY > 30 && atBottom) {
        lastScrollTime.current = now;
        goToSection('forward');
      } else if (e.deltaY < -30 && atTop) {
        lastScrollTime.current = now;
        goToSection('backward');
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [goToSection]);

  // Touch handler for mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      const container = sectionContentRef.current;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
      const atTop = scrollTop <= 10;

      if (deltaY > 60 && atBottom) {
        goToSection('forward');
      } else if (deltaY < -60 && atTop) {
        goToSection('backward');
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goToSection]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') goToSection('forward');
      if (e.key === 'ArrowUp' || e.key === 'PageUp') goToSection('backward');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goToSection]);

  const CurrentComponent = SECTIONS[currentSection].Component;

  // 3D transition variants
  const flyVariants = {
    enterForward: {
      opacity: 0,
      scale: 0.4,
      z: -600,
      filter: 'blur(16px)',
    },
    enterBackward: {
      opacity: 0,
      scale: 1.8,
      z: 300,
      filter: 'blur(16px)',
    },
    center: {
      opacity: 1,
      scale: 1,
      z: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 1.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exitForward: {
      opacity: 0,
      scale: 2,
      z: 400,
      filter: 'blur(10px)',
      transition: {
        duration: 1,
        ease: [0.55, 0, 1, 0.45],
      },
    },
    exitBackward: {
      opacity: 0,
      scale: 0.3,
      z: -800,
      filter: 'blur(10px)',
      transition: {
        duration: 1,
        ease: [0.55, 0, 1, 0.45],
      },
    },
  };

  return (
    <>
      {/* 3D Background — always visible */}
      <Scene3D currentSection={currentSection} totalSections={SECTIONS.length} isTransitioning={isTransitioning} />

      {/* Main content layer */}
      <div className="fixed inset-0 z-10" style={{ perspective: '1200px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            variants={flyVariants}
            initial={transitionDirection === 'forward' ? 'enterForward' : 'enterBackward'}
            animate="center"
            exit={transitionDirection === 'forward' ? 'exitForward' : 'exitBackward'}
            className="absolute inset-0 flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Solid opaque background per section */}
            <div className="absolute inset-0 bg-background/90 backdrop-blur-lg" />

            {/* Scrollable content container */}
            <div
              ref={sectionContentRef}
              className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="min-h-full flex items-center justify-center py-8">
                <CurrentComponent />
              </div>

              {/* Footer only on last section */}
              {currentSection === SECTIONS.length - 1 && (
                <div className="text-center py-16 px-4">
                  <p className="text-sm text-muted-foreground/50 font-body">
                    Made with all my heart, for you ♥
                  </p>
                  <p className="text-xs text-muted-foreground/30 mt-2 font-body">
                    Happy 25th Birthday, Mehnaz 🌙
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Section indicator dots */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
        {SECTIONS.map((section, i) => (
          <button
            key={section.id}
            onClick={() => {
              if (i === currentSection || isTransitioning) return;
              setTransitionDirection(i > currentSection ? 'forward' : 'backward');
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentSection(i);
                if (sectionContentRef.current) sectionContentRef.current.scrollTop = 0;
              }, 400);
              setTimeout(() => setIsTransitioning(false), 1200);
            }}
            className="group relative flex items-center"
            aria-label={section.label}
          >
            <span className={`
              block rounded-full transition-all duration-500
              ${i === currentSection
                ? 'w-3 h-3 bg-primary shadow-[0_0_12px_hsl(25_90%_58%/0.6)]'
                : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'}
            `} />
            <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground whitespace-nowrap font-body">
              {section.label}
            </span>
          </button>
        ))}
      </div>

      {/* Scroll hint */}
      {currentSection === 0 && !isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center"
        >
          <p className="text-xs text-muted-foreground/50 uppercase tracking-widest mb-2 font-body">Scroll to begin</p>
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary/60"
            />
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Index;
