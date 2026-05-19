import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Evita el optimizador de Next cuando el origen remoto suele fallar o hacer timeout. */
export function shouldUnoptimizeImage(url: string): boolean {
  return /meta\.ai|raw\.githubusercontent\.com|\/api\/webpages\/assets\//i.test(
    url
  );
}
