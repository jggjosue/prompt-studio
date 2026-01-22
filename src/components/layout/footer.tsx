'use client';

import Link from 'next/link';
import Logo from './logo';
import { Mail, Twitter, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  const links = [
    { href: '#', label: 'AI Video Generator' },
    { href: '#', label: 'AI Image Generator' },
    { href: '#', label: 'Video Prompts' },
    { href: '#', label: 'Video Tags' },
    { href: '#', label: 'Image Prompts' },
    { href: '#', label: 'Image Tags' },
    { href: '#', label: 'Nano Banana Pro' },
  ];

  const legalLinks = [
    { href: '#', label: 'Terms of use' },
    { href: '#',label: 'Privacy policy' },
    { href: '#', label: 'Refund policy' },
  ];

  return (
    <footer className="bg-muted/40 text-muted-foreground py-12 md:py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-foreground font-bold text-lg font-headline"
            >
              <Logo />
              <span>Prompt Studio</span>
            </Link>
            <p className="text-sm">
              Your ultimate collection of AI video prompts. Gather inspiration,
              explore examples, and create stunning videos with AI.
            </p>
            <p className="text-xs pt-4">
              © {new Date().getFullYear()} Prompt Studio. All rights reserved.
            </p>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4 font-headline">
                Links
              </h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 font-headline">
                Legal
              </h4>
              <ul className="space-y-3">
                {legalLinks.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 font-headline">
                Contact
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:hi@prompstudio.com"
                    className="flex items-center gap-2 text-sm hover:text-foreground transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    hi@prompstudio.com
                  </a>
                </li>
              </ul>
              <div className="flex gap-4 mt-4">
                <Link href="#" className="hover:text-foreground">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="hover:text-foreground">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="hover:text-foreground">
                  <Instagram className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
