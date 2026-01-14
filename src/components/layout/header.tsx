import Link from 'next/link';
import {
  ChevronDown,
  Wand2,
  Folder,
  Compass,
  Star,
  Clapperboard,
  ImageIcon,
  Tag,
  Video,
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
        <Link
          href="/"
          className="mr-6 flex items-center gap-2"
        >
          <Logo />
          <span className="hidden font-bold sm:inline-block font-headline">
            Prompt Studio
          </span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium md:flex flex-1 justify-center">
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
            <DropdownMenuContent
              className="w-64"
              align="start"
            >
              <DropdownMenuItem asChild>
                <Link href="#" className="flex items-start gap-3">
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
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#" className="flex items-start gap-3">
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
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#" className="flex items-start gap-3">
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
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#" className="flex items-start gap-3">
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
                  <Video className="h-4 w-4" />
                  My Videos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/login" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  My Images
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
