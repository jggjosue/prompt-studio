'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { syncRegisteredUser } from '@/app/actions/sync-user';

export function UserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      const email = user.primaryEmailAddress?.emailAddress;
      if (email) {
        localStorage.setItem('prompt_studio_user_email', email);
        localStorage.setItem('prompt_studio_free_email_saved', 'true');
        const key = `synced_user_${email}`;
        if (!sessionStorage.getItem(key)) {
          syncRegisteredUser(email)
            .then(() => {
              sessionStorage.setItem(key, 'true');
            })
            .catch(console.error);
        }
      }
    }
  }, [isLoaded, user]);

  return null;
}
