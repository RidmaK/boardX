'use client';

import React from 'react';
import { CheckSquare, Clock, AlertTriangle, TrendingUp, Calendar, Users, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskStats as TaskStatsType } from '@/contexts/TasksContext';
import { cn } from '@/lib/utils';

interface TaskStatsProps {
  stats: TaskStatsType;
}

export const TaskStats: React.FC<TaskStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      description: 'All tasks in the system',
      icon: CheckSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      description: 'Tasks currently being worked on',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Completed',
      value: stats.done,
      description: 'Tasks marked as done',
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      description: 'Tasks past due date',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Due Today',
      value: stats.dueToday,
      description: 'Tasks due today',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Time',
      value: `${Math.floor(stats.totalTime)}h`,
      description: 'Total time tracked',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const getCompletionRate = () => {
    return stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  };

  const getProgressRate = () => {
    return stats.total > 0 ? Math.round(((stats.inProgress + stats.done) / stats.total) * 100) : 0;
  };

  return (
    <div className="space-y-4">
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Completion Rate</CardTitle>
            <CardDescription>
              Percentage of tasks completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{getCompletionRate()}%</span>
                <Badge variant="secondary">
                  {stats.done}/{stats.total}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getCompletionRate()}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Progress Overview</CardTitle>
            <CardDescription>
              Tasks in progress or completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{getProgressRate()}%</span>
                <Badge variant="secondary">
                  {stats.inProgress + stats.done}/{stats.total}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressRate()}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Status Breakdown</CardTitle>
          <CardDescription>
            Distribution of tasks by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
              <div className="text-sm text-muted-foreground">To Do</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.review}</div>
              <div className="text-sm text-muted-foreground">Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.done}</div>
              <div className="text-sm text-muted-foreground">Done</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 