import Link from 'next/link';
import {
  ChevronDown,
  Wand2,
  Folder,
  Home as HomeIcon,
  Compass,
  Star,
  Clapperboard,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Logo from './logo';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-auto flex items-center gap-2">
          <Logo />
          <span className="hidden font-bold sm:inline-block font-headline">
            Prompt Studio
          </span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
          <Link
            href="/"
            className="flex items-center gap-2 hover:text-foreground/80 transition-colors"
          >
            Home
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground/80 transition-colors">
              Explore
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/#gallery" className="flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  Community Gallery
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/#video-examples" className="flex items-center gap-2">
                  <Clapperboard className="h-4 w-4" />
                  Video Examples
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/#image-examples" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Image Examples
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            href="#"
            className="flex items-center gap-2 hover:text-foreground/80 transition-colors"
          >
            Pricing
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground/80 transition-colors">
              <Wand2 className="h-4 w-4" />
              Generate
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
               <DropdownMenuItem asChild>
                <Link href="/prompt/edit" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  AI Image
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/prompt/edit" className="flex items-center gap-2">
                  <Clapperboard className="h-4 w-4" />
                  AI Video
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground/80 transition-colors">
              <Folder className="h-4 w-4" />
              My Library
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
             <DropdownMenuContent>
              <DropdownMenuItem asChild>
                 <Link href="/login" className="flex items-center gap-2">
                  My Creations
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                 <Link href="/login" className="flex items-center gap-2">
                  My Collections
                </Link>
              </DropdownMenuItem>
               <DropdownMenuItem asChild>
                 <Link href="/login" className="flex items-center gap-2">
                  Favorites
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
