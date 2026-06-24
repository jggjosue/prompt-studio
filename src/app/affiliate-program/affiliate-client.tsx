'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, Layers, Link as LinkIcon, PieChart, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

// 3D Tilt Card Component
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative w-full ${className || ''}`}
    >
      {/* Background glow that follows mouse */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              350px circle at ${useTransform(x, [-0.5, 0.5], ['0%', '100%'])} ${useTransform(y, [-0.5, 0.5], ['0%', '100%'])},
              rgba(59, 130, 246, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div
        className="h-full w-full rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl overflow-hidden relative"
        style={{ transform: 'translateZ(30px)' }}
      >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full" />
        {children}
      </div>
    </motion.div>
  );
}

export default function AffiliateClient() {
  const t = useTranslations('affiliate');
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const features = [
    {
      icon: <PieChart className="h-6 w-6 text-blue-400" />,
      title: t('features.commissions.title'),
      desc: t('features.commissions.desc'),
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-indigo-400" />,
      title: t('features.recurring.title'),
      desc: t('features.recurring.desc'),
    },
    {
      icon: <Layers className="h-6 w-6 text-purple-400" />,
      title: t('features.assets.title'),
      desc: t('features.assets.desc'),
    },
    {
      icon: <Sparkles className="h-6 w-6 text-cyan-400" />,
      title: t('features.tracking.title'),
      desc: t('features.tracking.desc'),
    },
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen bg-black overflow-hidden pt-8 pb-8">
      {/* Background Gradients & Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          style={{ y: y1 }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[150px]"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute top-[30%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-600/20 blur-[150px]"
        />
        {/* Animated Digital Network Nodes (CSS simulated) */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-7xl">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 mb-8 pt-8">
          <motion.div
            style={{ opacity }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex-1 space-y-8"
          >
            <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300 backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              {t('hero.badge')}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white font-headline leading-tight">
              {t('hero.title')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                {t('hero.highlight')}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="h-14 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_40px_rgba(37,99,235,0.3)]">
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/20 hover:bg-white/5">
                {t('hero.secondaryCta')}
              </Button>
            </div>
            
            <div className="pt-8 border-t border-white/10 flex items-center gap-8">
              <div>
                <p className="text-3xl font-bold text-white">30%</p>
                <p className="text-sm text-muted-foreground">{t('stats.recurring')}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">20%</p>
                <p className="text-sm text-muted-foreground">{t('stats.products')}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">60 {t('stats.days')}</p>
                <p className="text-sm text-muted-foreground">{t('stats.cookie')}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className="flex-1 w-full max-w-lg perspective-1000"
          >
            <TiltCard className="group">
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white font-headline">{t('dashboard.title')}</h3>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm text-green-400 font-medium">Live</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-black/40 p-4 border border-white/5">
                    <p className="text-sm text-muted-foreground mb-1">{t('dashboard.earnings')}</p>
                    <p className="text-2xl font-bold text-white">$4,250.00</p>
                    <div className="flex items-center text-xs text-green-400 mt-2">
                      <TrendingUp className="h-3 w-3 mr-1" /> +15.3%
                    </div>
                  </div>
                  <div className="rounded-lg bg-black/40 p-4 border border-white/5">
                    <p className="text-sm text-muted-foreground mb-1">{t('dashboard.clicks')}</p>
                    <p className="text-2xl font-bold text-white">1,240</p>
                    <div className="flex items-center text-xs text-green-400 mt-2">
                      <TrendingUp className="h-3 w-3 mr-1" /> +8.2%
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <p className="text-sm font-medium text-white">{t('dashboard.recent')}</p>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Startup Subscription</p>
                        <p className="text-xs text-muted-foreground">Referred User</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-green-400">+$6.00</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Premium Annual</p>
                        <p className="text-xs text-muted-foreground">Referred User</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-green-400">+$30.00</p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Premium Subscription</p>
                        <p className="text-xs text-muted-foreground">Referred User</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-green-400">+$3.00</p>
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="pt-8 pb-0 border-t border-white/10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white font-headline mb-4">{t('features.headline')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t('features.subhead')}</p>
          </div>
          
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="h-12 w-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden mt-8 mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-20" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
          <div className="relative py-8 px-4 md:px-8 text-center space-y-8 backdrop-blur-md border border-white/20 rounded-3xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white font-headline">{t('cta.title')}</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">{t('cta.subtitle')}</p>
            <Button size="lg" className="h-14 px-10 text-lg bg-white text-blue-900 hover:bg-blue-50 font-bold shadow-xl">
              <LinkIcon className="mr-2 h-5 w-5" />
              {t('cta.button')}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
