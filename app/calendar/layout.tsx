'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { SettingsDrawer } from '@/components/layout/SettingsDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { settings } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user && !pathname.startsWith('/auth')) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      
      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main
          className={cn(
            "flex-1 lg:ml-64 transition-all duration-200 ease-in-out flex flex-col",
            settings.sidebarStyle === 'compact' && "lg:ml-48",
            settings.sidebarStyle === 'mini' && "lg:ml-16"
          )}
        >
          <div
            className={cn(
              "flex-1 overflow-y-auto",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            )}
          >
            <div
              className={cn(
                "container mx-auto p-6 pb-20",
                settings.layoutStyle === 'boxed' && "max-w-7xl",
                settings.layoutStyle === 'wide' && "max-w-none px-8"
              )}
            >
              {children}
            </div>
          </div>
          
          <div className={cn(
            "fixed bottom-0 right-0 left-0 bg-background border-t border-border z-40",
            "lg:left-64",
            settings.sidebarStyle === 'compact' && "lg:left-48",
            settings.sidebarStyle === 'mini' && "lg:left-16"
          )}>
            <Footer />
          </div>
        </main>
      </div>

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}