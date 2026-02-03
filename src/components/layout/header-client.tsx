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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ThemeToggle } from '../theme-toggle';

export default function HeaderClient() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const closeSheet = () => setIsSheetOpen(false);

  const mobileNavLinks = (
    <>
      <Link
        href="/"
        className="flex items-center gap-2 hover:text-foreground/80 transition-colors py-2 md:py-0"
        onClick={closeSheet}
      >
        Home
      </Link>
      <Accordion type="single" collapsible className="w-full md:w-auto">
        <AccordionItem value="video" className="border-b-0">
          <AccordionTrigger className="hover:no-underline hover:text-foreground/80 transition-colors py-2 md:py-0 md:[&[data-state=open]>svg]:-rotate-180">
            <span className="flex items-center gap-1">Video</span>
          </AccordionTrigger>
          <AccordionContent className="pl-4">
            <div className="grid grid-cols-1 gap-2 py-2">
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
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Accordion type="single" collapsible className="w-full md:w-auto">
        <AccordionItem value="image" className="border-b-0">
          <AccordionTrigger className="hover:no-underline hover:text-foreground/80 transition-colors py-2 md:py-0 md:[&[data-state=open]>svg]:-rotate-180">
            <span className="flex items-center gap-1">Image</span>
          </AccordionTrigger>
          <AccordionContent className="pl-4">
            <div className="grid grid-cols-1 gap-2 py-2">
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
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Accordion type="single" collapsible className="w-full md:w-auto">
        <AccordionItem value="tag" className="border-b-0">
          <AccordionTrigger className="hover:no-underline hover:text-foreground/80 transition-colors py-2 md:py-0 md:[&[data-state=open]>svg]:-rotate-180">
            <span className="flex items-center gap-1">Tag</span>
          </AccordionTrigger>
          <AccordionContent className="pl-4">
            <div className="grid grid-cols-1 gap-2 py-2">
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
    </>
  );

  const desktopNavLinks = (
    <>
      <Link
        href="/"
        className="flex items-center gap-2 hover:text-foreground/80 transition-colors py-2 md:py-0"
      >
        Home
      </Link>
      <div className="group relative">
        <span className="flex items-center gap-1 hover:text-foreground/80 transition-colors py-2 md:py-0 cursor-pointer">
          Video{' '}
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:rotate-180" />
        </span>
        <div className="hidden group-hover:block absolute w-64 mt-2 bg-popover border rounded-md shadow-lg p-1 z-10">
          <div className="grid grid-cols-1 gap-2 p-1">
            <Link
              href="/video-prompts"
              className="flex items-start gap-3 p-2 rounded-md hover:bg-accent"
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
          </div>
        </div>
      </div>
      <div className="group relative">
        <span className="flex items-center gap-1 hover:text-foreground/80 transition-colors py-2 md:py-0 cursor-pointer">
          Image{' '}
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:rotate-180" />
        </span>
        <div className="hidden group-hover:block absolute w-64 mt-2 bg-popover border rounded-md shadow-lg p-1 z-10">
          <div className="grid grid-cols-1 gap-2 p-1">
            <Link
              href="/image-prompts"
              className="flex items-start gap-3 p-2 rounded-md hover:bg-accent"
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
          </div>
        </div>
      </div>
      <div className="group relative">
        <span className="flex items-center gap-1 hover:text-foreground/80 transition-colors py-2 md:py-0 cursor-pointer">
          Tag{' '}
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:rotate-180" />
        </span>
        <div className="hidden group-hover:block absolute w-64 mt-2 bg-popover border rounded-md shadow-lg p-1 z-10">
          <div className="grid grid-cols-1 gap-2 p-1">
            <Link
              href="#"
              className="flex items-start gap-3 p-2 rounded-md hover:bg-accent"
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
              href="#"
              className="flex items-start gap-3 p-2 rounded-md hover:bg-accent"
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
        </div>
      </div>
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
        <nav className="hidden items-center justify-center gap-4 text-sm font-medium md:flex flex-1">
          {desktopNavLinks}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm p-0">
              <SheetHeader className="p-6 pb-0">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <Link
                href="/"
                className="flex items-center gap-2 mb-8 px-6 pt-6"
                onClick={closeSheet}
              >
                <Logo />
                <span className="font-bold font-headline text-lg">
                  Prompt Studio
                </span>
              </Link>
              <nav className="flex flex-col gap-4 text-lg font-medium px-6">
                {mobileNavLinks}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
