'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, User, Tag, MessageSquare, Plus, X, Play, Pause, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTasks, Task as TaskType } from '@/contexts/TasksContext';
import { cn } from '@/lib/utils';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  projectId: z.string().min(1, 'Project is required'),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskType | null;
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  onOpenChange,
  task,
}) => {
  const { 
    createTask, 
    updateTask, 
    addSubtask, 
    toggleSubtask, 
    deleteSubtask,
    addComment,
    startTimer,
    stopTimer,
    currentTimer,
    projects,
    users
  } = useTasks();
  
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      projectId: '',
      assigneeId: '',
      dueDate: '',
      estimatedHours: 0,
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        projectId: task.projectId,
        assigneeId: task.assigneeId || '',
        dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
        estimatedHours: task.estimatedHours || 0,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        projectId: projects[0]?.id || '',
        assigneeId: '',
        dueDate: '',
        estimatedHours: 0,
      });
    }
  }, [task, form, projects]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      const taskData = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        estimatedHours: data.estimatedHours || 0,
      };

      if (task) {
        await updateTask(task.id, taskData);
      } else {
        await createTask(taskData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleAddSubtask = async () => {
    if (!task || !newSubtask.trim()) return;
    
    try {
      await addSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    if (!task) return;
    
    try {
      await toggleSubtask(task.id, subtaskId);
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!task) return;
    
    try {
      await deleteSubtask(task.id, subtaskId);
    } catch (error) {
      console.error('Failed to delete subtask:', error);
    }
  };

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;
    
    try {
      await addComment(task.id, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleTimerToggle = async () => {
    if (!task) return;
    
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {task ? 'Update task details and manage subtasks and comments.' : 'Create a new task with all necessary details.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="Enter task title"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project *</Label>
                  <Select value={form.watch('projectId')} onValueChange={(value) => form.setValue('projectId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Select value={form.watch('assigneeId') || "unassigned"} onValueChange={(value) => form.setValue('assigneeId', value === "unassigned" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.watch('status')} onValueChange={(value) => form.setValue('status', value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={form.watch('priority')} onValueChange={(value) => form.setValue('priority', value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    {...form.register('dueDate')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  step="0.5"
                  min="0"
                  {...form.register('estimatedHours', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="subtasks" className="space-y-4">
            {task ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add a subtask..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                  />
                  <Button onClick={handleAddSubtask} disabled={!newSubtask.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 p-2 border rounded">
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => handleToggleSubtask(subtask.id)}
                      />
                      <span className={cn("flex-1", subtask.completed && "line-through text-muted-foreground")}>
                        {subtask.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubtask(subtask.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Create a task first to add subtasks</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {task ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                  />
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 border rounded">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.userAvatar} />
                        <AvatarFallback className="text-xs">
                          {comment.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {comment.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Create a task first to add comments</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="time" className="space-y-4">
            {task ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h4 className="font-medium">Time Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      Track time spent on this task
                    </p>
                  </div>
                  <Button onClick={handleTimerToggle}>
                    {currentTimer && currentTimer.taskId === task.id ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Stop Timer
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Timer
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded">
                    <h5 className="font-medium mb-2">Estimated Time</h5>
                    <p className="text-2xl font-bold">
                      {task.estimatedHours ? formatTime(task.estimatedHours) : 'Not set'}
                    </p>
                  </div>
                  <div className="p-4 border rounded">
                    <h5 className="font-medium mb-2">Actual Time</h5>
                    <p className="text-2xl font-bold">
                      {task.actualHours ? formatTime(task.actualHours) : '0h 0m'}
                    </p>
                  </div>
                </div>

                {task.timeEntries.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium">Time Entries</h5>
                    <div className="space-y-2">
                      {task.timeEntries.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="text-sm">
                              {entry.startTime.toLocaleDateString()}
                            </div>
                            {entry.description && (
                              <div className="text-xs text-muted-foreground">
                                {entry.description}
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-medium">
                            {entry.duration ? formatTime(entry.duration / 3600) : 'In progress'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Create a task first to track time</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}; 