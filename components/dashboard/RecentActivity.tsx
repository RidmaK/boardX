'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
    email: string;
  };
  action: string;
  time: string;
  status: 'completed' | 'pending' | 'failed';
}

const activities: Activity[] = [
  {
    id: '1',
    user: {
      name: 'John Doe',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      email: 'john@example.com',
    },
    action: 'Created a new user account',
    time: '2 minutes ago',
    status: 'completed',
  },
  {
    id: '2',
    user: {
      name: 'Jane Smith',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      email: 'jane@example.com',
    },
    action: 'Updated product pricing',
    time: '5 minutes ago',
    status: 'completed',
  },
  {
    id: '3',
    user: {
      name: 'Mike Johnson',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      email: 'mike@example.com',
    },
    action: 'Processing payment',
    time: '10 minutes ago',
    status: 'pending',
  },
  {
    id: '4',
    user: {
      name: 'Sarah Wilson',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      email: 'sarah@example.com',
    },
    action: 'Failed to send notification',
    time: '15 minutes ago',
    status: 'failed',
  },
];

export const RecentActivity: React.FC = () => {
  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest actions and updates from your team
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
              <AvatarFallback>{activity.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">
                  {activity.user.name}
                </p>
                <Badge
                  className={`${getStatusColor(activity.status)} text-white text-xs`}
                >
                  {activity.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {activity.action}
              </p>
              <p className="text-xs text-muted-foreground">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};