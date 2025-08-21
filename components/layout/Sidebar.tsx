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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { settings } = useTheme();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Analytics']);

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
          "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-background border-r border-border transform transition-transform duration-200 ease-in-out z-50 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          settings.sidebarStyle === 'compact' && "w-48",
          settings.sidebarStyle === 'mini' && "w-16"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
          </div>
          
          <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>
        </div>
      </aside>
    </>
  );
};