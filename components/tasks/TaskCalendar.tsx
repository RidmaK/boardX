'use client';

import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/contexts/TasksContext';
import { cn } from '@/lib/utils';

interface TaskCalendarProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({ tasks, onEditTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
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

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 bg-gray-50" />);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayTasks = getTasksForDate(date);
      
      days.push(
        <div
          key={day}
          className={cn(
            "h-24 border border-gray-200 p-1 relative",
            isToday(date) && "bg-blue-50 border-blue-300",
            !isCurrentMonth(date) && "bg-gray-50"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={cn(
              "text-sm font-medium",
              isToday(date) && "text-blue-600 font-bold"
            )}>
              {day}
            </span>
            {dayTasks.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {dayTasks.length}
              </Badge>
            )}
          </div>
          
          <div className="space-y-1 max-h-16 overflow-y-auto">
            {dayTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className={cn(
                  "p-1 rounded text-xs cursor-pointer hover:bg-white transition-colors border-l-2",
                  getPriorityColor(task.priority)
                )}
                onClick={() => onEditTask(task)}
              >
                <div className="font-medium truncate">{task.title}</div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Badge className={getStatusColor(task.status)} variant="secondary">
                    {task.status.replace('-', ' ')}
                  </Badge>
                  {task.assignee && (
                    <div className="flex items-center gap-1">
                      <User className="h-2 w-2" />
                      <span className="truncate">{task.assignee.name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {dayTasks.length > 3 && (
              <div className="text-xs text-muted-foreground text-center">
                +{dayTasks.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Task Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map((day) => (
            <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {renderCalendar()}
        </div>
      </CardContent>
    </Card>
  );
}; 