'use client';

import React, { type ReactNode } from 'react';
import { Menu, PanelLeftClose } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardShell({
  sidebar,
  compactSidebar,
  children,
}: {
  sidebar: ReactNode;
  compactSidebar: ReactNode;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const sidebarWidth = sidebarOpen ? 'md:w-[220px] lg:w-[280px]' : 'md:w-[72px] lg:w-[72px]';

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <aside
        className={cn(
          'hidden shrink-0 overflow-hidden border-r bg-muted/40 md:block',
          sidebarWidth
        )}
      >
        <div className="flex h-screen min-h-0 flex-col transition-[width] duration-300 ease-out">
          <div
            className={cn(
              'flex h-[72px] shrink-0 items-center border-b px-4',
              sidebarOpen ? 'justify-end lg:px-6' : 'justify-center'
            )}
          >
            <button
              type="button"
              onClick={() => setSidebarOpen(open => !open)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background/70 text-muted-foreground transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={sidebarOpen ? 'Cerrar panel lateral' : 'Abrir panel lateral'}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          <div
            className={cn(
              'min-h-0 flex-1 overflow-hidden transition-all duration-200',
              sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
            aria-hidden={!sidebarOpen}
          >
            {sidebar}
          </div>
          {!sidebarOpen ? (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{compactSidebar}</div>
          ) : null}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
