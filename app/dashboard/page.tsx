'use client';

import React from 'react';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RevenueChart, SalesChart } from '@/components/dashboard/Chart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's what's happening with your business.
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RevenueChart />
        <SalesChart />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-primary/10 rounded-lg text-left hover:bg-primary/20 transition-colors">
                <div className="font-medium">Add User</div>
                <div className="text-sm text-muted-foreground">Create new account</div>
              </button>
              <button className="p-4 bg-green-500/10 rounded-lg text-left hover:bg-green-500/20 transition-colors">
                <div className="font-medium">New Order</div>
                <div className="text-sm text-muted-foreground">Process order</div>
              </button>
              <button className="p-4 bg-orange-500/10 rounded-lg text-left hover:bg-orange-500/20 transition-colors">
                <div className="font-medium">View Reports</div>
                <div className="text-sm text-muted-foreground">Analytics data</div>
              </button>
              <button className="p-4 bg-purple-500/10 rounded-lg text-left hover:bg-purple-500/20 transition-colors">
                <div className="font-medium">Settings</div>
                <div className="text-sm text-muted-foreground">Manage system</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}