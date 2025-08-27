'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Clock, MessageSquare, CheckSquare, User, Calendar, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Task, useTasks } from '@/contexts/TasksContext';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-yellow-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onEditTask }) => {
  const { moveTask, currentTimer } = useTasks();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
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

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      await moveTask(draggedTask.id, status as Task['status']);
    }
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="space-y-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <Card className={cn("border-2", column.color)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {getTasksByStatus(column.id).length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {getTasksByStatus(column.id).map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "p-3 bg-white rounded-lg border cursor-pointer hover:shadow-md transition-all",
                    draggedTask?.id === task.id && "opacity-50"
                  )}
                  onClick={() => onEditTask(task)}
                >
                  <div className="space-y-2">
                    {/* Priority Badge */}
                    <div className="flex items-center justify-between">
                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {task.priority}
                      </Badge>
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {task.dueDate.toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Task Title */}
                    <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>

                    {/* Task Description */}
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Tags */}
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{task.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Subtasks Progress */}
                    {task.subtasks.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckSquare className="h-3 w-3" />
                        <span>
                          {task.subtasks.filter(sub => sub.completed).length}/{task.subtasks.length}
                        </span>
                      </div>
                    )}

                    {/* Time Tracking */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {currentTimer && currentTimer.taskId === task.id ? (
                        <div className="flex items-center gap-1 text-green-600 font-mono">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(elapsedTime / 3600)}</span>
                        </div>
                      ) : (
                        task.actualHours && task.actualHours > 0 && (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(task.actualHours)}</span>
                            {task.estimatedHours && (
                              <span>/ {formatTime(task.estimatedHours)}</span>
                            )}
                          </>
                        )
                      )}
                    </div>

                    {/* Comments */}
                    {task.comments.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        <span>{task.comments.length}</span>
                      </div>
                    )}

                    {/* Assignee */}
                    <div className="flex items-center justify-between">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar} />
                            <AvatarFallback className="text-xs">
                              {task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {task.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>Unassigned</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Task Button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  // This would open the task creation dialog
                  console.log('Add task to', column.id);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}; 