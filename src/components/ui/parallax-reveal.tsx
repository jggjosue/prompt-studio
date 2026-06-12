'use client';

import { cn } from '@/lib/utils';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { type ReactNode, useRef } from 'react';

type ParallaxRevealProps = {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
};

/**
 * Revelado ligado al progreso del scroll. Al regresar hacia arriba, la
 * animacion se reproduce en sentido contrario sin observers adicionales.
 */
export function ParallaxReveal({
  children,
  className,
  reverse = false,
}: ParallaxRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.98', 'start 0.45'],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.35,
  });
  const opacity = useTransform(progress, [0, 0.45, 1], [0.18, 0.8, 1]);
  const y = useTransform(progress, [0, 1], [48, 0]);
  const x = useTransform(progress, [0, 1], [reverse ? 28 : -28, 0]);
  const scale = useTransform(progress, [0, 1], [0.975, 1]);
  const clipPath = useTransform(
    progress,
    [0, 1],
    reverse
      ? ['inset(0 0 0 14%)', 'inset(0 0 0 0%)']
      : ['inset(0 14% 0 0)', 'inset(0 0% 0 0)']
  );

  return (
    <motion.div
      ref={ref}
      data-scroll-reveal
      style={
        reduceMotion
          ? undefined
          : { opacity, x, y, scale, clipPath }
      }
      className={cn(
        'h-full motion-reduce:transform-none',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
