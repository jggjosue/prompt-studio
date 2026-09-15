'use client';

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: React.ReactNode;
    description: React.ReactNode;
    link: string;
    icon?: React.ReactNode;
    exploreText?: string;
  }[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8",
        className
      )}
    >
      {items.map((item, idx) => (
        <Link
          href={item?.link}
          key={item?.link}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 block h-full w-full rounded-3xl border border-primary/20 bg-primary/10 shadow-[0_20px_70px_rgba(37,99,235,0.18)] backdrop-blur-sm"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            <div className="flex items-center justify-between gap-2 mb-4">
              {item.icon && (
                <div className="rounded-md bg-primary/10 p-2 text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  {item.icon}
                </div>
              )}
            </div>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
            {item.exploreText && (
              <p className="text-xs text-muted-foreground mt-4 font-bold group-hover:text-primary transition-colors flex items-center gap-1">
                {item.exploreText} &rarr;
              </p>
            )}
          </Card>
        </Link>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "relative z-20 h-full w-full overflow-hidden rounded-2xl border border-blue-950/10 bg-white/65 p-6 text-slate-950 shadow-lg shadow-blue-950/10 backdrop-blur-md transition-all duration-300 supports-[backdrop-filter]:bg-white/55 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:bg-white/75 group-hover:shadow-xl dark:border-white/10 dark:bg-black/35 dark:text-white dark:shadow-black/20 dark:supports-[backdrop-filter]:bg-black/25 dark:group-hover:bg-black/45",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-0">{children}</div>
      </div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={cn("mt-2 font-headline text-base font-bold tracking-wide text-slate-950 dark:text-white", className)}>
      {children}
    </h4>
  );
};

export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "mt-2 text-xs font-medium leading-relaxed text-slate-600 dark:text-white/65",
        className
      )}
    >
      {children}
    </p>
  );
};
