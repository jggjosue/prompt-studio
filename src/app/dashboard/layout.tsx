import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  getKindeServerSession,
  LogoutLink,
} from '@kinde-oss/kinde-auth-nextjs/server';
import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  Settings,
  ShoppingCart,
  Users,
  LayoutGrid,
  Image,
  Clapperboard,
  Heart,
  CreditCard
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Logo from '@/components/layout/logo';
import Header from '@/components/layout/header';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const navItems = [
    { href: '/dashboard', icon: <LayoutGrid className="h-4 w-4" />, label: 'Dashboard' },
    { href: '/prompt/edit', icon: <Clapperboard className="h-4 w-4" />, label: 'Create' },
    { href: '/dashboard/creations', icon: <Image className="h-4 w-4" />, label: 'My Creations', badge: '5' },
    { href: '/dashboard/favorites', icon: <Heart className="h-4 w-4" />, label: 'Favorites' },
  ];
  
  const settingsNavItems = [
    { href: '/dashboard/settings', icon: <Settings className="h-4 w-4" />, label: 'Settings' },
    { href: '/dashboard/billing', icon: <CreditCard className="h-4 w-4" />, label: 'Billing' },
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo />
              <span className="">Prompt Studio</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  {item.icon}
                  {item.label}
                  {item.badge && <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{item.badge}</Badge>}
                </Link>
              ))}
            </nav>
            <div className="mt-4 px-2 lg:px-4">
              <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Settings
              </h3>
              <nav className="grid items-start text-sm font-medium">
                {settingsNavItems.map(item => (
                    <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                    {item.icon}
                    {item.label}
                    </Link>
                ))}
              </nav>
            </div>
          </div>
          <div className="mt-auto p-4">
             <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support
                  team.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full" asChild>
                  <Link href="/pricing">Upgrade</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
