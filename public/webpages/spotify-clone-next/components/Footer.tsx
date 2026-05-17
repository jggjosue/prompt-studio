import Link from "next/link";
import { footerColumns, legalLinks } from "@/lib/content";

const socialLinks = [
  { label: "Instagram", emoji: "📷" },
  { label: "Twitter", emoji: "🐦" },
  { label: "Facebook", emoji: "📘" },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-spotify-border bg-spotify-black px-6 py-12 md:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-5">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-spotify-gray">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-spotify-gray transition-colors hover:text-white hover:underline"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex gap-3 sm:col-span-2 md:col-span-1 md:flex-col">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-spotify-border text-xl transition-colors hover:bg-spotify-green hover:text-black"
                aria-label={social.label}
              >
                <span aria-hidden="true">{social.emoji}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-spotify-border pt-8">
          <div className="flex flex-wrap gap-4 text-xs text-spotify-gray">
            {legalLinks.map((link) => (
              <Link
                key={link}
                href="#"
                className="transition-colors hover:text-white"
              >
                {link}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs text-spotify-gray">© 2026 Spotify AB</p>
        </div>
      </div>
    </footer>
  );
}
