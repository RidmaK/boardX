'use client';

import React, { useState, useEffect } from 'react';
import { Clock, MessageSquare, CheckSquare, User, Calendar, Tag, MoreVertical, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task, useTasks } from '@/contexts/TasksContext';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onEditTask }) => {
  const { startTimer, stopTimer, currentTimer } = useTasks();
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer for live updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentTimer) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - currentTimer.startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentTimer]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days > 0) return `In ${days} days`;
    return `${Math.abs(days)} days ago`;
  };

  const handleTimerToggle = async (task: Task) => {
    try {
      if (currentTimer && currentTimer.taskId === task.id) {
        await stopTimer(task.id);
      } else {
        await startTimer(task.id);
      }
    } catch (error) {
      console.error('Timer error:', error);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'priority':
        aValue = a.priority;
        bValue = b.priority;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'dueDate':
        aValue = a.dueDate || new Date(9999, 0, 1);
        bValue = b.dueDate || new Date(9999, 0, 1);
        break;
      case 'assignee':
        aValue = a.assignee?.name || '';
        bValue = b.assignee?.name || '';
        break;
      default:
        aValue = a.title;
        bValue = b.title;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task List</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => (
              <TableRow key={task.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="space-y-1">
                    <div 
                      className="font-medium cursor-pointer hover:text-primary"
                      onClick={() => onEditTask(task)}
                    >
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {task.subtasks.length > 0 && (
                        <div className="flex items-center gap-1">
                          <CheckSquare className="h-3 w-3" />
                          <span>{task.subtasks.filter(sub => sub.completed).length}/{task.subtasks.length}</span>
                        </div>
                      )}
                      {task.comments.length > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{task.comments.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {task.projectId}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assignee.avatar} />
                        <AvatarFallback className="text-xs">
                          {task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(task.priority)} variant="secondary">
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(task.status)} variant="secondary">
                    {task.status.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.dueDate ? (
                    <div className="text-sm">
                      <div>{task.dueDate.toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(task.dueDate)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No due date</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {currentTimer && currentTimer.taskId === task.id ? (
                      <div className="text-sm font-mono text-green-600">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          {formatTime(elapsedTime / 3600)}
                        </div>
                      </div>
                    ) : (
                      task.actualHours && task.actualHours > 0 && (
                        <div className="text-sm">
                          {formatTime(task.actualHours)}
                        </div>
                      )
                    )}
                    {task.estimatedHours && (
                      <div className="text-xs text-muted-foreground">
                        Est: {formatTime(task.estimatedHours)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleTimerToggle(task)}
                    >
                      {currentTimer && currentTimer.taskId === task.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditTask(task)}>
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Duplicate Task
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}; 