'use client';

import { useIntersectionInView } from '@/hooks/use-intersection-in-view';
import { Eye, Sparkles } from 'lucide-react';
import type { ReactNode, RefObject } from 'react';
import { useState } from 'react';

type PreviewPalette = { primary?: string; secondary?: string; background?: string; dark?: boolean };

export function StaticComponentPreview({
  title,
  type,
  preview,
  children,
  liveByDefault = false,
}: {
  title: string;
  type: string;
  preview: PreviewPalette;
  /** Optional live component shown on hover */
  children?: ReactNode;
  /** Show the live component immediately instead of waiting for hover. */
  liveByDefault?: boolean;
}) {
  const primary = preview.primary ?? '#2563eb';
  const secondary = preview.secondary ?? '#8b5cf6';
  const bg = preview.background ?? (preview.dark ? '#09090b' : '#0f1117');
  const isDark = preview.dark !== false;
  const textColor = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(15,17,23,0.88)';
  const mutedColor = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(15,17,23,0.28)';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,17,23,0.10)';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)';

  const { ref, isNearView } = useIntersectionInView({ rootMargin: '700px 0px', once: false });
  const [isHovered, setIsHovered] = useState(false);
  const showLivePreview = Boolean(children) && (liveByDefault || type === 'form' || isHovered);

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      className="relative flex aspect-[16/9] min-h-52 overflow-hidden rounded-xl border shadow-inner"
      style={{ background: bg, color: textColor }}
      aria-label={`Captura estática de ${title}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Loading skeleton */}
      {!isNearView && (
        <div aria-hidden className="absolute inset-0 animate-pulse bg-muted/30 motion-reduce:animate-none" />
      )}

      {/* ── Static browser-style mock (fades out on hover) ── */}
      {isNearView && (
        <div
          className="absolute inset-0 flex flex-col transition-opacity duration-300"
          style={{ opacity: showLivePreview ? 0 : 1 }}
          aria-hidden={showLivePreview ? true : undefined}
        >
          {/* Ambient glow blobs */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 55% 45% at 20% 10%,${primary}28,transparent),radial-gradient(ellipse 40% 40% at 85% 80%,${secondary}22,transparent)`,
            }}
          />

          {/* ── Browser chrome bar ── */}
          <div
            className="relative flex shrink-0 items-center gap-1.5 border-b px-2.5 py-1.5"
            style={{ borderColor, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)' }}
          >
            {/* Traffic lights */}
            <span className="size-[5px] rounded-full bg-[#ff5f57]" />
            <span className="size-[5px] rounded-full bg-[#febc2e]" />
            <span className="size-[5px] rounded-full bg-[#28c840]" />
            {/* URL bar */}
            <div
              className="mx-2 flex h-[14px] flex-1 items-center rounded-sm px-1.5"
              style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', borderColor }}
            >
              <span
                className="inline-block size-[5px] shrink-0 rounded-full mr-1"
                style={{ background: primary, opacity: 0.7 }}
              />
              <span className="h-1 w-14 rounded-full" style={{ background: mutedColor }} />
            </div>
            {/* Type badge */}
            <span
              className="shrink-0 rounded px-1 py-px text-[7px] font-black uppercase tracking-widest"
              style={{ background: `${primary}28`, color: primary }}
            >
              {type}
            </span>
          </div>

          {/* ── Page content ── */}
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">

            {/* Navbar */}
            <div
              className="flex shrink-0 items-center justify-between border-b px-3 py-1.5"
              style={{ borderColor }}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="size-3 rounded-[3px]"
                  style={{ background: `linear-gradient(135deg,${primary},${secondary})` }}
                />
                <span className="h-1.5 w-10 rounded-full" style={{ background: mutedColor }} />
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1 w-6 rounded-full" style={{ background: mutedColor }} />
                <span className="h-1 w-6 rounded-full" style={{ background: mutedColor }} />
                <span className="h-1 w-6 rounded-full" style={{ background: mutedColor }} />
                <span
                  className="h-4 rounded-sm px-2 text-[7px] font-bold text-white flex items-center"
                  style={{ background: `linear-gradient(90deg,${primary},${secondary})` }}
                >
                  CTA
                </span>
              </div>
            </div>

            {/* Page content */}
            {type === 'form' ? (
              <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center p-3.5 sm:p-5">
                <div
                  className="w-full max-w-xs rounded-xl border p-3.5 shadow-lg backdrop-blur-md"
                  style={{
                    background: cardBg,
                    borderColor: `${primary}35`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span
                      className="grid size-6 place-items-center rounded-lg text-white shadow-sm"
                      style={{ background: `linear-gradient(135deg,${primary},${secondary})` }}
                    >
                      <Sparkles className="size-3" />
                    </span>
                    <div className="flex-1">
                      <div className="h-2 w-20 rounded-full" style={{ background: textColor, opacity: 0.85 }} />
                      <div className="mt-1 h-1 w-28 rounded-full" style={{ background: mutedColor }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="h-1.5 w-12 rounded-full" style={{ background: mutedColor }} />
                        <span className="text-[7px]" style={{ color: `${primary}` }}>*</span>
                      </div>
                      <div
                        className="h-6 w-full rounded-md border px-2 flex items-center"
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                          borderColor: `${primary}25`,
                        }}
                      >
                        <div className="h-1.5 w-16 rounded-full" style={{ background: mutedColor, opacity: 0.5 }} />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="h-1.5 w-14 rounded-full" style={{ background: mutedColor }} />
                        <span className="text-[7px]" style={{ color: `${primary}` }}>*</span>
                      </div>
                      <div
                        className="h-6 w-full rounded-md border px-2 flex items-center"
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                          borderColor: `${primary}25`,
                        }}
                      >
                        <div className="h-1.5 w-20 rounded-full" style={{ background: mutedColor, opacity: 0.5 }} />
                      </div>
                    </div>
                  </div>
                  <div
                    className="mt-3 flex h-6 w-full items-center justify-center rounded-md font-bold text-white shadow-sm"
                    style={{ background: `linear-gradient(90deg,${primary},${secondary})` }}
                  >
                    <div className="h-1.5 w-14 rounded-full bg-white/90" />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Hero section */}
                <div className="flex shrink-0 flex-col items-center px-4 pt-3 pb-2 text-center">
                  <div
                    className="mb-1.5 h-1.5 w-24 rounded-full"
                    style={{ background: `linear-gradient(90deg,${primary},${secondary})`, opacity: 0.85 }}
                  />
                  <div className="h-2 w-36 rounded-full mb-1" style={{ background: textColor, opacity: 0.75 }} />
                  <div className="h-1 w-28 rounded-full" style={{ background: mutedColor }} />
                  {/* CTA buttons */}
                  <div className="mt-2 flex gap-1.5">
                    <span
                      className="h-4 w-10 rounded-md"
                      style={{ background: `linear-gradient(90deg,${primary},${secondary})` }}
                    />
                    <span
                      className="h-4 w-8 rounded-md border"
                      style={{ borderColor: `${primary}55`, background: 'transparent' }}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex shrink-0 justify-center gap-2 px-3 pb-2">
                  {[primary, secondary, primary].map((color, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 rounded-md px-1.5 py-0.5"
                      style={{ background: `${color}18`, border: `1px solid ${color}28` }}
                    >
                      <span className="size-1.5 rounded-full" style={{ background: color }} />
                      <span className="h-1 w-6 rounded-full" style={{ background: mutedColor }} />
                    </div>
                  ))}
                </div>

                {/* Cards grid */}
                <div className="flex flex-1 gap-2 px-3 pb-2 overflow-hidden">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex flex-1 flex-col gap-1 rounded-lg p-2"
                      style={{ background: cardBg, border: `1px solid ${borderColor}` }}
                    >
                      <span
                        className="h-5 w-full rounded-md"
                        style={{
                          background:
                            i === 0
                              ? `linear-gradient(135deg,${primary}44,${secondary}22)`
                              : i === 1
                                ? `linear-gradient(135deg,${secondary}44,${primary}22)`
                                : `${primary}22`,
                        }}
                      />
                      <span className="h-1 w-full rounded-full" style={{ background: textColor, opacity: 0.5 }} />
                      <span className="h-1 w-3/4 rounded-full" style={{ background: mutedColor }} />
                      <span
                        className="mt-auto h-3 w-full rounded-md"
                        style={{ background: i === 1 ? `linear-gradient(90deg,${primary},${secondary})` : `${primary}28` }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Hover hint */}
          <span
            className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm transition-opacity duration-200"
            style={{ opacity: isHovered || !children ? 1 : 0.85 }}
          >
            <Eye className="size-2.5" />
            {children ? 'Hover para ver live' : 'Abrir preview'}
          </span>
        </div>
      )}

      {/* ── Live / dynamic preview — shown on hover ── */}
      {children && isNearView && (
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: showLivePreview ? 1 : 0, pointerEvents: showLivePreview ? 'auto' : 'none' }}
          aria-hidden={!showLivePreview}
        >
          {children}
          {/* Live badge */}
          <span
            className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-bold text-white shadow-lg transition-opacity duration-300"
            style={{
              background: `linear-gradient(90deg,${primary},${secondary})`,
              opacity: showLivePreview ? 1 : 0,
            }}
          >
            <Sparkles className="size-2.5" />
            Live Preview
          </span>
        </div>
      )}
    </div>
  );
}
