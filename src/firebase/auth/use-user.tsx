'use client';

import { useFirebase } from '../provider';
import { User } from 'firebase/auth';

interface UserAuthHookResult {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * React hook to get the current Firebase user from the central FirebaseProvider.
 * 
 * @returns {UserAuthHookResult} An object containing the user, loading state, and error.
 */
export function useUser(): UserAuthHookResult {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isLoading: isUserLoading, error: userError };
}

    