import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import {
  PROMPT_EDIT_ENABLED,
  PROMPT_EDIT_PATH,
} from '@/lib/prompt-edit';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!PROMPT_EDIT_ENABLED && req.nextUrl.pathname === PROMPT_EDIT_PATH) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
