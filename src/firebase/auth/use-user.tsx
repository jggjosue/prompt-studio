'use client';
    
import { useState, useEffect } from 'react';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';

interface UserAuthHookResult {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * React hook to get the current Firebase user.
 * 
 * @returns {UserAuthHookResult} An object containing the user, loading state, and error.
 */
export function useUser(): UserAuthHookResult {
  const auth: Auth = useAuth(); // Assuming useAuth() hook provides the initialized Auth instance
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If there's already a user from the initial auth object, set it and stop loading
    if (auth.currentUser) {
        setUser(auth.currentUser);
        setIsLoading(false);
    }
    
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: User | null) => {
        setUser(firebaseUser);
        setIsLoading(false);
      },
      (error: Error) => {
        console.error("useUser hook: onAuthStateChanged error:", error);
        setError(error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return { user, isLoading, error };
}

    