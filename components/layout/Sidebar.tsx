'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Users,
  BarChart3,
  Settings,
  FileText,
  ShoppingCart,
  CreditCard,
  Mail,
  Calendar,
  Package,
  PieChart,
  TrendingUp,
  UserCheck,
  Shield,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTheme } from '@/contexts/ThemeContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ComponentType<any>;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    children: [
      { label: 'Overview', href: '/analytics/overview', icon: PieChart },
      { label: 'Reports', href: '/analytics/reports', icon: TrendingUp },
      { label: 'Insights', href: '/analytics/insights', icon: BarChart3 },
    ],
  },
  {
    label: 'Users',
    icon: Users,
    children: [
      { label: 'All Users', href: '/users', icon: Users },
      { label: 'User Roles', href: '/users/roles', icon: UserCheck },
      { label: 'Permissions', href: '/users/permissions', icon: Shield },
    ],
  },
  {
    label: 'E-commerce',
    icon: ShoppingCart,
    children: [
      { label: 'Products', href: '/products', icon: Package },
      { label: 'Orders', href: '/orders', icon: ShoppingCart },
      { label: 'Payments', href: '/payments', icon: CreditCard },
    ],
  },
  {
    label: 'Content',
    icon: FileText,
    children: [
      { label: 'Posts', href: '/posts', icon: FileText },
      { label: 'Pages', href: '/pages', icon: FileText },
      { label: 'Media', href: '/media', icon: Package },
    ],
  },
  {
    label: 'Communication',
    icon: Mail,
    children: [
      { label: 'Messages', href: '/messages', icon: Mail },
      { label: 'Notifications', href: '/notifications', icon: Mail },
    ],
  },
  {
    label: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: Users,
  },
  {
    label: 'Payments',
    href: '/payments',
    icon: CreditCard,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { settings, setSidebarStyle } = useTheme();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Analytics']);
  const isMini = settings.sidebarStyle === 'mini';

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isExpanded = expandedItems.includes(item.label);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = pathname === item.href;
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <Collapsible key={item.label} open={isExpanded} onOpenChange={() => toggleExpanded(item.label)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-left font-normal h-10",
                depth > 0 && "ml-6",
                "group hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="mr-3 h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map(child => renderMenuItem(child, depth + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Link key={item.label} href={item.href || '#'} onClick={onClose}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            depth > 0 && "ml-6",
            isActive && "bg-accent text-accent-foreground",
            "group hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Icon className="mr-3 h-4 w-4" />
          {item.label}
        </Button>
      </Link>
    );
  };

  const renderMiniMenuItem = (item: MenuItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = pathname === item.href;
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <div key={item.label} className="relative group">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-12 h-12 p-0 mx-auto flex items-center justify-center",
                    "hover:bg-accent",
                    "rounded-lg",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div
            className={cn(
              "pointer-events-none absolute left-full top-0 ml-2 hidden min-w-56 rounded-lg border border-border bg-background p-2 shadow-lg",
              "group-hover:block group-hover:pointer-events-auto"
            )}
          >
            <div className="flex flex-col gap-1">
              {item.children?.map((child) => {
                const ChildIcon = child.icon;
                const isChildActive = pathname === child.href;
                return (
                  <Link key={child.label} href={child.href || '#'} onClick={onClose}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-9",
                        isChildActive && "bg-accent text-accent-foreground",
                        "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <ChildIcon className="mr-3 h-4 w-4" />
                      <span>{child.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <TooltipProvider key={item.label}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={item.href || '#'} onClick={onClose}>
              <Button
                variant="ghost"
                className={cn(
                  "w-12 h-12 p-0 mx-auto flex items-center justify-center",
                  "hover:bg-accent",
                  "rounded-lg",
                  pathname === item.href && "bg-accent text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-background border-r border-border transform transition-transform duration-200 ease-in-out z-50 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          settings.sidebarStyle === 'compact' && "w-48",
          settings.sidebarStyle === 'mini' && "w-16"
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn("p-6", isMini && "p-4 flex items-center justify-center")}> 
            {isMini ? (
              <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center font-semibold">A</div>
            ) : (
              <h2 className="text-lg font-semibold">Admin Panel</h2>
            )}
          </div>
          
          <nav className={cn(
            "flex-1 pb-4 overflow-y-auto",
            isMini ? "px-2 space-y-2" : "px-4 space-y-1",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          )}> 
            {isMini
              ? menuItems.map(item => renderMiniMenuItem(item))
              : menuItems.map(item => renderMenuItem(item))}
          </nav>

          <div className="mt-auto border-t border-border p-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full h-10 flex items-center justify-center",
                      isMini && "w-12 h-12 p-0 mx-auto rounded-lg"
                    )}
                    onClick={() => setSidebarStyle(isMini ? 'default' : 'mini')}
                  >
                    {isMini ? (
                      <ChevronsRight className="h-4 w-4" />
                    ) : (
                      <ChevronsLeft className="h-4 w-4" />
                    )}
                    {!isMini && <span className="ml-2">Collapse</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{isMini ? 'Expand' : 'Collapse'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </aside>
    </>
  );
};