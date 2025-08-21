'use client';

import React from 'react';
import { X, Palette, Layout, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const colorOptions = [
  { name: 'Blue', value: '#3b82f6', class: 'bg-blue-500' },
  { name: 'Purple', value: '#8b5cf6', class: 'bg-purple-500' },
  { name: 'Green', value: '#10b981', class: 'bg-green-500' },
  { name: 'Orange', value: '#f97316', class: 'bg-orange-500' },
  { name: 'Red', value: '#ef4444', class: 'bg-red-500' },
  { name: 'Pink', value: '#ec4899', class: 'bg-pink-500' },
];

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const { settings, setTheme, setPrimaryColor, setSidebarStyle, setLayoutStyle, resetSettings } = useTheme();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-background border-l border-border transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Dashboard Settings</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Theme Mode
                </CardTitle>
                <CardDescription className="text-xs">
                  Choose your preferred theme
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <RadioGroup
                  value={settings.theme}
                  onValueChange={(value) => setTheme(value as 'light' | 'dark')}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="text-sm">Light Mode</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="text-sm">Dark Mode</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Color Scheme */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Primary Color
                </CardTitle>
                <CardDescription className="text-xs">
                  Select your preferred accent color
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setPrimaryColor(color.value)}
                      className={`relative w-full h-12 rounded-lg ${color.class} hover:scale-105 transition-transform ${
                        settings.primaryColor === color.value
                          ? 'ring-2 ring-offset-2 ring-primary'
                          : ''
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sidebar Style */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Sidebar Style
                </CardTitle>
                <CardDescription className="text-xs">
                  Choose sidebar appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <RadioGroup
                  value={settings.sidebarStyle}
                  onValueChange={(value) => setSidebarStyle(value as 'default' | 'compact' | 'mini')}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="sidebar-default" />
                    <Label htmlFor="sidebar-default" className="text-sm">Default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="compact" id="sidebar-compact" />
                    <Label htmlFor="sidebar-compact" className="text-sm">Compact</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mini" id="sidebar-mini" />
                    <Label htmlFor="sidebar-mini" className="text-sm">Mini</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Layout Style */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Tablet className="h-4 w-4" />
                  Layout Style
                </CardTitle>
                <CardDescription className="text-xs">
                  Choose content layout
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <RadioGroup
                  value={settings.layoutStyle}
                  onValueChange={(value) => setLayoutStyle(value as 'default' | 'boxed' | 'wide')}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="layout-default" />
                    <Label htmlFor="layout-default" className="text-sm">Default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="boxed" id="layout-boxed" />
                    <Label htmlFor="layout-boxed" className="text-sm">Boxed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wide" id="layout-wide" />
                    <Label htmlFor="layout-wide" className="text-sm">Wide</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border space-y-3">
            <Button
              onClick={resetSettings}
              variant="outline"
              className="w-full"
            >
              Reset to Default
            </Button>
            <Button
              onClick={onClose}
              className="w-full"
            >
              Apply Settings
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};