import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Search,
  Settings,
  User,
  Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const categories = [
  { name: 'Video Prompts', count: 97, href: '/video-prompts' },
  { name: 'Image Prompts', count: 199, href: '/image-prompts' },
  { name: 'Web Templates', count: 271, href: '/web-tags' },
  { name: 'Text Prompts', count: 47, href: '/prompt' },
];

export function Sidebar({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-full w-64 flex-col border-r bg-background', className)}>
      {/* Header/Logo */}
      <div className="flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Box className="h-6 w-6" />
          <span>Prompt Studio</span>
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search" className="pl-8 bg-muted/50" />
          <kbd className="pointer-events-none absolute right-2 top-2.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {/* Main navigation removed as per request */}

        <div className="mt-8">
          <h4 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categories
          </h4>
          <nav className="space-y-1">
            {categories.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium cursor-pointer hover:bg-muted text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <span>{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.count}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer / User Area */}
      <div className="border-t p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
          <div className="flex-1" />
          <Link href="/sign-in" className="text-sm font-medium cursor-pointer text-muted-foreground hover:text-primary transition-colors duration-200">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
