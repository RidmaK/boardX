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

export default function TasksLayout({
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
    <div className="min-h-screen bg-background pt-16">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main
          className={cn(
            "flex-1 lg:ml-64 transition-all duration-200 ease-in-out",
            settings.sidebarStyle === 'compact' && "lg:ml-48",
            settings.sidebarStyle === 'mini' && "lg:ml-16"
          )}
        >
          <div
            className={cn(
              "container mx-auto p-6",
              settings.layoutStyle === 'boxed' && "max-w-7xl",
              settings.layoutStyle === 'wide' && "max-w-none px-8"
            )}
          >
            {children}
          </div>
          <Footer />
        </main>
      </div>

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
} 