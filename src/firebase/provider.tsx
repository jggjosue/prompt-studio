'use client';

import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { FirebaseApp } from 'firebase/app';
import { Auth, AuthError, User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import React, { DependencyList, ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { // Renamed from UserAuthHookResult for consistency if desired, or keep as UserAuthHookResult
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!auth) {
      const error = new Error("Auth service not provided. FirebaseProvider not initialized correctly.");
      console.error('FirebaseProvider:', error.message);
      setUserAuthState({ user: null, isUserLoading: false, userError: error });
      return;
    }

    let retryCount = 0;
    const maxRetries = 3;
    let unsubscribe: (() => void) | null = null;

    /**
     * Determines if an auth error is transient (can be retried) or permanent.
     */
    const isTransientError = (error: AuthError): boolean => {
      const transientCodes = [
        'auth/network-request-failed',
        'auth/too-many-requests',
        'auth/argument-error',
      ];
      return transientCodes.includes(error.code);
    };

    /**
     * Determines if anonymous sign-in is not available (should skip, not retry).
     */
    const isAnonymousAuthDisabled = (error: AuthError): boolean => {
      const disabledCodes = [
        'auth/admin-restricted-operation',
        'auth/operation-not-allowed',
      ];
      return disabledCodes.includes(error.code);
    };

    /**
     * Handles anonymous sign-in with retry logic for transient failures.
     */
    const initializeAnonymousUser = async (attempt = 1) => {
      try {
        console.log(`[Auth] Attempting anonymous sign-in (attempt ${attempt}/${maxRetries})`);
        await signInAnonymously(auth);
        console.log('[Auth] Anonymous sign-in successful');
        retryCount = 0;
      } catch (error: any) {
        const authError = error as AuthError;
        console.warn(`[Auth] Anonymous sign-in failed: ${authError.code} - ${authError.message}`);

        // Check if anonymous auth is disabled in Firebase Console
        if (isAnonymousAuthDisabled(authError)) {
          console.warn(
            '[Auth] Anonymous authentication is disabled. Enable it in Firebase Console → Authentication → Sign-in method.'
          );
          // Allow app to run without authentication
          setUserAuthState({ user: null, isUserLoading: false, userError: null });
          return;
        }

        if (isTransientError(authError) && attempt < maxRetries) {
          // Transient error: retry with exponential backoff
          const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[Auth] Retrying anonymous sign-in in ${delayMs}ms...`);
          setTimeout(() => initializeAnonymousUser(attempt + 1), delayMs);
        } else {
          // Permanent error or max retries reached
          const finalError =
            attempt >= maxRetries
              ? new Error(`Anonymous sign-in failed after ${maxRetries} attempts: ${authError.message}`)
              : authError;
          console.error('[Auth] Anonymous sign-in permanently failed:', finalError);
          setUserAuthState({ user: null, isUserLoading: false, userError: finalError });
        }
      }
    };

    try {
      /**
       * Subscribe to auth state changes.
       * - On success: user is set or anonymous sign-in is initiated
       * - On error: error is logged and state is updated
       */
      unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser: User | null) => {
          if (firebaseUser) {
            console.log(`[Auth] User authenticated: ${firebaseUser.uid} (${firebaseUser.email || 'anonymous'})`);
            setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
            retryCount = 0;
          } else {
            console.log('[Auth] No user signed in. Initiating anonymous sign-in...');
            // No authenticated user; attempt anonymous sign-in
            initializeAnonymousUser();
          }
        },
        (error: any) => {
          const authError = error as AuthError;
          const errorMsg = `[Auth] onAuthStateChanged error: ${authError.code} - ${authError.message}`;
          console.error(errorMsg);

          if (isTransientError(authError)) {
            console.warn('[Auth] Transient error detected. Will retry on next auth state change.');
            // Don't set error state for transient errors; just log and wait for next event
          } else {
            // Permanent error: update state and stop retrying
            setUserAuthState({ user: null, isUserLoading: false, userError: authError });
          }
        }
      );
    } catch (error: any) {
      const errorMsg = `[Auth] Failed to set up auth listener: ${error.message}`;
      console.error(errorMsg);
      setUserAuthState({ user: null, isUserLoading: false, userError: error });
    }

    // Cleanup: unsubscribe from auth state listener
    return () => {
      if (unsubscribe) {
        unsubscribe();
        console.log('[Auth] Auth listener unsubscribed');
      }
    };
  }, [auth]); // Re-run only if auth instance changes

  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services and user authentication state.
 * 
 * ✅ Usage:
 * const { user, auth, firestore, isUserLoading, userError } = useFirebase();
 * if (isUserLoading) return <Spinner />;
 * if (userError) return <ErrorUI error={userError} />;
 * if (!user) return <LoginPage />;
 * 
 * ⚠️ Important:
 * - Must be used within a FirebaseProvider (typically in layout.tsx)
 * - If `userError` exists, check if it's transient (network) or permanent (auth denied)
 * - Anonymous auth is automatically initialized if no user is logged in
 * 
 * @throws {Error} If used outside FirebaseProvider or services not initialized
 * @returns {FirebaseServicesAndUser} Services (app, auth, firestore) + user state
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * Lightweight alternative to useFirebase() when you only need user info.
 * 
 * ✅ Usage:
 * const { user, isUserLoading, userError } = useUser();
 * 
 * @returns {UserHookResult} Object with user, isUserLoading, userError
 * @throws {Error} If used outside FirebaseProvider
 */
export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
