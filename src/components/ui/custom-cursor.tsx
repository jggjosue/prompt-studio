'use client';

import { useEffect, useRef, useState } from 'react';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const cursor = cursorRef.current;
    const finePointer = window.matchMedia(
      '(min-width: 768px) and (hover: hover) and (pointer: fine)'
    );

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
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
      data-visible="false"
      data-interactive="false"
      data-pressed="false"
      aria-hidden="true"
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
  );
}
