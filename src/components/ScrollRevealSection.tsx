import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollRevealSectionProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'center' | 'up';
  depth?: number;
}

/**
 * Wraps a section with 3D perspective scroll-driven reveal.
 * Elements appear to emerge from depth as you scroll into view.
 */
const ScrollRevealSection: React.FC<ScrollRevealSectionProps> = ({
  children,
  className = '',
  direction = 'center',
  depth = 200,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  const translateZ = useTransform(scrollYProgress, [0, 1], [-depth, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.3, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [direction === 'up' ? 15 : 8, 0]);
  const translateX = useTransform(
    scrollYProgress,
    [0, 1],
    [direction === 'left' ? -120 : direction === 'right' ? 120 : 0, 0]
  );
  const translateY = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);

  return (
    <div ref={ref} className={`relative ${className}`} style={{ perspective: '1200px' }}>
      <motion.div
        style={{
          opacity,
          rotateX,
          translateX,
          translateY,
          translateZ,
          scale,
          transformOrigin: 'center bottom',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ScrollRevealSection;
