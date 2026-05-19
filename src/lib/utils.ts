import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Solo orígenes que no deben pasar por `/_next/image` (timeouts o CDN restrictivo).
 * `/api/webpages/assets/` sí se optimiza (AVIF/WebP en la API + next/image).
 */
export function shouldUnoptimizeImage(url: string): boolean {
  return /meta\.ai|raw\.githubusercontent\.com/i.test(url);
}
