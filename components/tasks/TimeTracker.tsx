'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/contexts/TasksContext';
import { cn } from '@/lib/utils';

export const TimeTracker: React.FC = () => {
  const { currentTimer, stopTimer, getTaskById } = useTasks();
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentTimer) {
      // Set initial elapsed time
      const now = new Date();
      const initialElapsed = Math.floor((now.getTime() - currentTimer.startTime.getTime()) / 1000);
      setElapsedTime(initialElapsed);
      
      // Update every second
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopTimer = async () => {
    if (currentTimer) {
      try {
        await stopTimer(currentTimer.taskId);
      } catch (error) {
        console.error('Failed to stop timer:', error);
      }
    }
  };

  if (!currentTimer) {
    return (
      <Button variant="outline" disabled>
        <Clock className="mr-2 h-4 w-4" />
        No Timer
      </Button>
    );
  }

  const task = getTaskById(currentTimer.taskId);

  return (
    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <Clock className="h-4 w-4 text-green-600" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-green-800 truncate">
          {task?.title || 'Unknown Task'}
        </div>
        <div className="text-xs text-green-600">
          {task?.projectId || 'No Project'}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-lg font-mono font-bold text-green-800">
          {formatTime(elapsedTime)}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 w-8 p-0 border-green-300 hover:bg-green-100"
          onClick={handleStopTimer}
        >
          <Square className="h-4 w-4 text-green-600" />
        </Button>
      </div>
    </div>
  );
}; 