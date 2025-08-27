'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Filter, Search, Grid3X3, List, Calendar, Clock, Users, MoreVertical, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTasks } from '@/contexts/TasksContext';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskCalendar } from '@/components/tasks/TaskCalendar';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { TaskStats } from '@/components/tasks/TaskStats';
import { TimeTracker } from '@/components/tasks/TimeTracker';
import { cn } from '@/lib/utils';

export default function TasksPage() {
  const { 
    tasks, 
    projects, 
    taskStats, 
    currentTimer,
    isLoading 
  } = useTasks();
  
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProject = projectFilter === 'all' || task.projectId === projectFilter;
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || task.assigneeId === assigneeFilter;
      
      return matchesSearch && matchesProject && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchQuery, projectFilter, statusFilter, priorityFilter, assigneeFilter]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your projects and track progress with agile workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TimeTracker />
          <Button onClick={handleCreateTask}>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Stats */}
      <TaskStats stats={taskStats} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="me">Assigned to Me</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
          <TabsList>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredTasks.length} tasks</span>
          {currentTimer && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Timer running</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {viewMode === 'kanban' && (
          <KanbanBoard 
            tasks={filteredTasks} 
            onEditTask={handleEditTask}
          />
        )}
        
        {viewMode === 'list' && (
          <TaskList 
            tasks={filteredTasks} 
            onEditTask={handleEditTask}
          />
        )}
        
        {viewMode === 'calendar' && (
          <TaskCalendar 
            tasks={filteredTasks} 
            onEditTask={handleEditTask}
          />
        )}
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={selectedTask}
      />
    </div>
  );
} 