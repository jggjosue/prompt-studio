'use client';

import { useEffect, useRef } from 'react';

const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  'input',
  'textarea',
  'select',
  'summary',
  '[role="button"]',
  '[role="link"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    if (!cursor || !finePointer.matches) return;

    document.documentElement.classList.add('custom-cursor-active');

    let frame = 0;
    let x = -100;
    let y = -100;

    const render = () => {
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = 0;
    };

    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      cursor.dataset.visible = 'true';

      const target = event.target;
      cursor.dataset.interactive =
        target instanceof Element && target.closest(INTERACTIVE_SELECTOR)
          ? 'true'
          : 'false';

      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const press = () => {
      cursor.dataset.pressed = 'true';
    };

    const release = () => {
      cursor.dataset.pressed = 'false';
    };

    const hide = () => {
      cursor.dataset.visible = 'false';
      cursor.dataset.pressed = 'false';
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', press, { passive: true });
    window.addEventListener('pointerup', release, { passive: true });
    window.addEventListener('pointercancel', release, { passive: true });
    document.addEventListener('mouseleave', hide);
    window.addEventListener('blur', hide);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      document.removeEventListener('mouseleave', hide);
      window.removeEventListener('blur', hide);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="custom-cursor"
        data-visible="false"
        data-interactive="false"
        data-pressed="false"
        aria-hidden="true"
        style={{ pointerEvents: 'none' }}
      >
        <svg viewBox="0 0 32 32" fill="none">
          <path
            d="M6.6 3.8 25.2 12c1.7.8 1.6 3.3-.2 3.8l-7.2 2.1-3.6 7c-.9 1.7-3.4 1.3-3.7-.6L4 6c-.5-1.7 1-3 2.6-2.2Z"
            fill="#050914"
            stroke="white"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
        </svg>
        <span className="custom-cursor-click-ring" />
      </div>
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .custom-cursor-active,
          .custom-cursor-active body,
          .custom-cursor-active a,
          .custom-cursor-active button,
          .custom-cursor-active input,
          .custom-cursor-active textarea,
          .custom-cursor-active select,
          .custom-cursor-active summary,
          .custom-cursor-active [role='button'],
          .custom-cursor-active [role='link'] {
            cursor: none !important;
          }

          .custom-cursor {
            position: fixed;
            top: -5px;
            left: -5px;
            z-index: 2147483647;
            width: 30px;
            height: 30px;
            opacity: 0;
            transform: translate3d(-100px, -100px, 0);
            transform-origin: 7px 7px;
            filter: drop-shadow(0 2px 4px rgb(0 0 0 / 0.65));
            transition: opacity 120ms ease, filter 140ms ease;
            will-change: transform;
          }

          .custom-cursor[data-visible='true'] {
            opacity: 1;
          }

          .custom-cursor svg {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;
            transform-origin: 7px 7px;
            transition: transform 100ms ease, filter 140ms ease;
          }

          .custom-cursor[data-interactive='true'] svg {
            filter: drop-shadow(0 0 7px hsl(var(--primary) / 0.95));
            transform: scale(1.12);
          }

          .custom-cursor[data-pressed='true'] svg {
            transform: scale(0.82);
          }

          .custom-cursor-click-ring {
            position: absolute;
            top: 6px;
            left: 6px;
            width: 18px;
            height: 18px;
            border: 2px solid hsl(var(--primary) / 0.9);
            border-radius: 999px;
            opacity: 0;
            transform: scale(0.4);
          }

          .custom-cursor[data-pressed='true'] .custom-cursor-click-ring {
            animation: custom-cursor-click 380ms ease-out;
          }
        }

        @keyframes custom-cursor-click {
          0% {
            opacity: 0.95;
            transform: scale(0.4);
          }
          100% {
            opacity: 0;
            transform: scale(2.2);
          }
        }
      `}</style>
    </>
  );
}
