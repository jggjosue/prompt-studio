'use client';

import Link from 'next/link';
import {
  ChevronDown,
  Wand2,
  Folder,
  Clapperboard,
  ImageIcon,
  Tag,
  Video,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Logo from './logo';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function HeaderClient() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const closeSheet = () => setIsSheetOpen(false);

  const navLinks = (
    <>
      <Link
        href="/"
        className="flex items-center gap-2 hover:text-foreground/80 transition-colors py-2 md:py-0"
        onClick={closeSheet}
      >
        Home
      </Link>
      <Accordion type="single" collapsible className="w-full md:w-auto">
        <AccordionItem value="explore" className="border-b-0">
          <AccordionTrigger className="hover:no-underline hover:text-foreground/80 transition-colors py-2 md:py-0 md:[&[data-state=open]>svg]:-rotate-180">
            <span className="flex items-center gap-1">Explore</span>
          </AccordionTrigger>
          <AccordionContent className="md:absolute md:w-64 md:mt-2 md:bg-popover md:border md:rounded-md md:shadow-lg md:p-1 md:z-10">
            <div className="grid grid-cols-1 gap-2 p-2 md:p-0">
              <Link
                href="/video-prompts"
                className="flex items-start gap-3 p-2 rounded-md hover:bg-accent"
                onClick={closeSheet}
              >
                <div className="bg-primary/10 text-primary p-2 rounded-md">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Video Prompts</p>
                  <p className="text-xs text-muted-foreground">
                    Browse AI video prompts
                  </p>
                </div>
              </Link>
              <Link
                href="#"
                className="flex items-start gap-3 p-2 rounded-md hover:bg-accent"
                onClick={closeSheet}
              >
                <div className="bg-primary/10 text-primary p-2 rounded-md">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Video Tags</p>
                  <p className="text-xs text-muted-foreground">
                    Browse AI video tags
                  </p>
                </div>
              </Link>
              <Link
                href="/image-prompts"
                className="flex items-start gap-3 p-2 rounded-md hover:bg-accent"
                onClick={closeSheet}
              >
                <div className="bg-primary/10 text-primary p-2 rounded-md">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Image Prompts</p>
                  <p className="text-xs text-muted-foreground">
                    Browse AI image prompts
                  </p>
                </div>
              </Link>
              <Link
                href="#"
                className="flex items-start gap-3 p-2 rounded-md hover:bg-accent"
                onClick={closeSheet}
              >
                <div className="bg-primary/10 text-primary p-2 rounded-md">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Image Tags</p>
                  <p className="text-xs text-muted-foreground">
                    Browse AI image tags
                  </p>
                </div>
              </Link>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Link
        href="/pricing"
        className="flex items-center gap-2 hover:text-foreground/80 transition-colors py-2 md:py-0"
        onClick={closeSheet}
      >
        Pricing
      </Link>
      <Accordion type="single" collapsible className="w-full md:w-auto">
        <AccordionItem value="generate" className="border-b-0">
          <AccordionTrigger className="hover:no-underline hover:text-foreground/80 transition-colors py-2 md:py-0 md:[&[data-state=open]>svg]:-rotate-180">
            <span className="flex items-center gap-1">
              <Wand2 className="h-4 w-4" /> Generate
            </span>
          </AccordionTrigger>
          <AccordionContent className="md:absolute md:w-auto md:mt-2 md:bg-popover md:border md:rounded-md md:shadow-lg md:p-1 md:z-10">
            <div className="grid grid-cols-1 gap-1 p-2 md:p-0">
              <Link
                href="/prompt/edit"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                onClick={closeSheet}
              >
                <ImageIcon className="h-4 w-4" />
                AI Image
              </Link>
              <Link
                href="/prompt/edit"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                onClick={closeSheet}
              >
                <Clapperboard className="h-4 w-4" />
                AI Video
              </Link>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Accordion type="single" collapsible className="w-full md:w-auto">
        <AccordionItem value="library" className="border-b-0">
          <AccordionTrigger className="hover:no-underline hover:text-foreground/80 transition-colors py-2 md:py-0 md:[&[data-state=open]>svg]:-rotate-180">
            <span className="flex items-center gap-1">
              <Folder className="h-4 w-4" /> My Library
            </span>
          </AccordionTrigger>
          <AccordionContent className="md:absolute md:w-auto md:mt-2 md:bg-popover md:border md:rounded-md md:shadow-lg md:p-1 md:z-10">
            <div className="grid grid-cols-1 gap-1 p-2 md:p-0">
              <Link
                href="/login"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                onClick={closeSheet}
              >
                <Video className="h-4 w-4" />
                My Videos
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                onClick={closeSheet}
              >
                <ImageIcon className="h-4 w-4" />
                My Images
              </Link>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <Logo />
          <span className="hidden font-bold sm:inline-block font-headline">
            Prompt Studio
          </span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium md:flex flex-1">
          {navLinks}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm">
              <div className="p-6">
                <Link href="/" className="flex items-center gap-2 mb-8">
                  <Logo />
                  <span className="font-bold font-headline text-lg">
                    Prompt Studio
                  </span>
                </Link>
                <nav className="flex flex-col gap-4 text-lg font-medium">
                  {navLinks}
                </nav>
                <div className="mt-8 flex flex-col gap-4">
                  <Button variant="ghost" asChild size="lg">
                    <Link href="/login" onClick={closeSheet}>Login</Link>
                  </Button>
                  <Button asChild size="lg">
                    <Link href="/register" onClick={closeSheet}>Sign Up</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
