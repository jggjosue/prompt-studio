'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FreeEmailGate } from '@/components/free-email-gate';
import { useUser } from '@clerk/nextjs';
import { useLocale } from 'next-intl';

export function PromptGate({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const es = locale.startsWith('es');
  
  const { user, isLoaded } = useUser();
  const [unlocked, setUnlocked] = useState(false);
  const [hasSavedEmail, setHasSavedEmail] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('prompt_studio_free_email_saved')) {
      setHasSavedEmail(true);
    }
  }, []);

  const isUnlocked = unlocked || !!user || hasSavedEmail;

  if (isUnlocked) {
    return <>{children}</>;
  }

  if (!isLoaded) return <div className="py-8 bg-muted/30 border rounded-md animate-pulse" />;

  return (
    <div className="flex flex-col items-center justify-center py-10 bg-muted/30 border rounded-md">
      <FreeEmailGate
        title={es ? 'Ingresa tu correo' : 'Enter your email'}
        description={es ? 'Para ver los detalles de este prompt, por favor ingresa tu correo electrónico.' : 'To view the details of this prompt, please enter your email address.'}
        submitText={es ? 'Ver Prompt' : 'View Prompt'}
        onSuccess={() => setUnlocked(true)}
      >
        <Button variant="default">{es ? 'Ver Prompt' : 'View Prompt'}</Button>
      </FreeEmailGate>
    </div>
  );
}
