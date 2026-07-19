'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { saveCookieConsent } from '@/app/actions/cookie-consent';
import { useTranslations } from 'next-intl';

export function CookieBanner() {
  const t = useTranslations('cookieBanner');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check local storage after component mounts to avoid hydration errors
    const consent = localStorage.getItem('prompt_studio_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const handleAccept = async () => {
    setIsVisible(false);
    localStorage.setItem('prompt_studio_cookie_consent', 'accepted');
    await saveCookieConsent('v2026-07-10', 'v2026-07-10');
  };

  const handleReject = () => {
    setIsVisible(false);
    localStorage.setItem('prompt_studio_cookie_consent', 'rejected');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 flex flex-col md:flex-row gap-6 items-start md:items-stretch dark:bg-zinc-950 dark:ring-white/10">
      
      {/* Left Content Area */}
      <div className="flex-1 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t('title')}
        </h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {t('description')}
        </p>
        <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {t('disclaimer')}
        </p>
        
        <div className="flex gap-4 pt-2 text-sm font-medium text-blue-600 dark:text-blue-500">
          <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-blue-600/30">
            {t('privacyPolicy')}
          </Link>
          <Link href="/terms" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-blue-600/30">
            {t('termsOfService')}
          </Link>
        </div>
      </div>

      {/* Right Buttons Area */}
      <div className="flex flex-col gap-3 w-full md:w-48 shrink-0 justify-center">
        <button
          onClick={handleAccept}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
        >
          {t('accept')}
        </button>
        <button
          onClick={handleReject}
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-zinc-900 dark:text-gray-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
        >
          {t('reject')}
        </button>
      </div>

    </div>
  );
}
