'use client';

import React from 'react';
import { Users, UserCheck, UserX, Clock, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserStats as UserStatsType } from '@/contexts/UsersContext';
import { cn } from '@/lib/utils';

interface UserStatsProps {
  stats: UserStatsType;
}

export const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.total,
      description: 'All registered users',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Users',
      value: stats.active,
      description: 'Currently active users',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Inactive Users',
      value: stats.inactive,
      description: 'Inactive accounts',
      icon: UserX,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      title: 'New This Month',
      value: stats.newThisMonth,
      description: 'Users joined this month',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Active Today',
      value: stats.activeToday,
      description: 'Users active today',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Pending',
      value: stats.pending,
      description: 'Pending invitations',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  const getStatusPercentage = (value: number) => {
    return stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={cn("p-2 rounded-lg", stat.bgColor)}>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
            {stat.title !== 'Total Users' && (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {getStatusPercentage(stat.value)}%
                </Badge>
                <div className="flex-1 bg-gray-200 rounded-full h-1">
                  <div
                    className={cn("h-1 rounded-full transition-all duration-300", stat.bgColor.replace('bg-', 'bg-').replace('-50', '-500'))}
                    style={{ width: `${getStatusPercentage(stat.value)}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 