"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

interface Scroll3DProps {
  children: React.ReactNode;
  className?: string;
  direction?: "left" | "right";
  intensity?: "soft" | "strong";
}

export function Scroll3D({
  children,
  className,
  direction = "left",
  intensity = "strong",
}: Scroll3DProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 105,
    damping: 24,
    mass: 0.35,
  });
  const side = direction === "left" ? -1 : 1;
  const distance = intensity === "strong" ? 72 : 34;
  const tilt = intensity === "strong" ? 8 : 4;

  const rotateX = useTransform(
    progress,
    [0, 0.28, 0.72, 1],
    reduceMotion ? [0, 0, 0, 0] : [10, 0, 0, -10]
  );
  const rotateY = useTransform(
    progress,
    [0, 0.28, 0.72, 1],
    reduceMotion ? [0, 0, 0, 0] : [side * tilt, 0, 0, side * -tilt]
  );
  const scale = useTransform(
    progress,
    [0, 0.28, 0.72, 1],
    reduceMotion ? [1, 1, 1, 1] : [0.95, 1, 1, 0.95]
  );
  const opacity = useTransform(
    progress,
    [0, 0.2, 0.8, 1],
    reduceMotion ? [1, 1, 1, 1] : [0.55, 1, 1, 0.55]
  );
  const x = useTransform(
    progress,
    [0, 0.28, 0.72, 1],
    reduceMotion ? [0, 0, 0, 0] : [side * distance, 0, 0, side * -distance]
  );
  const y = useTransform(
    progress,
    [0, 0.28, 0.72, 1],
    reduceMotion ? [0, 0, 0, 0] : [48, 0, 0, -48]
  );

  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: "1400px" }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          opacity,
          x,
          y,
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
        }}
        className="w-full origin-center"
      >
        {children}
      </motion.div>
    </div>
  );
}
