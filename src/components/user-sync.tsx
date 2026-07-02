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
