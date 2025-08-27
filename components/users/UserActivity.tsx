'use client';

import React from 'react';
import { Activity, User, Clock, MapPin, Monitor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserActivity as UserActivityType } from '@/contexts/UsersContext';
import { formatDistanceToNow } from 'date-fns';

interface UserActivityProps {
  activity: UserActivityType[];
}

export const UserActivity: React.FC<UserActivityProps> = ({ activity }) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'user.login':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'user.create':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'user.update':
        return <User className="h-4 w-4 text-yellow-500" />;
      case 'user.delete':
        return <User className="h-4 w-4 text-red-500" />;
      case 'role.create':
        return <Monitor className="h-4 w-4 text-purple-500" />;
      case 'role.update':
        return <Monitor className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'user.login':
        return 'bg-green-100 text-green-800';
      case 'user.create':
        return 'bg-blue-100 text-blue-800';
      case 'user.update':
        return 'bg-yellow-100 text-yellow-800';
      case 'user.delete':
        return 'bg-red-100 text-red-800';
      case 'role.create':
        return 'bg-purple-100 text-purple-800';
      case 'role.update':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionDescription = (action: string, description: string) => {
    const actionMap: Record<string, string> = {
      'user.login': 'User logged in',
      'user.create': 'User account created',
      'user.update': 'User profile updated',
      'user.delete': 'User account deleted',
      'role.create': 'Role created',
      'role.update': 'Role updated',
      'role.delete': 'Role deleted',
      'permission.assign': 'Permissions assigned',
      'permission.revoke': 'Permissions revoked',
    };

    return actionMap[action] || description;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Track user actions and system events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {item.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getActionIcon(item.action)}
                    <span className="font-medium text-sm">{item.userName}</span>
                    <Badge className={getActionColor(item.action)} variant="secondary">
                      {getActionDescription(item.action, item.description)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </div>
                    {item.ipAddress && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.ipAddress}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 