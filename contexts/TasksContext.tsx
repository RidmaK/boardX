'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  assigneeId?: string;
  assignee?: User;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  subtasks: Subtask[];
  comments: Comment[];
  timeEntries: TimeEntry[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  overdue: number;
  dueToday: number;
  totalTime: number;
}

interface TasksContextType {
  tasks: Task[];
  projects: Project[];
  users: User[];
  taskStats: TaskStats;
  currentTimer: TimeEntry | null;
  isLoading: boolean;
  
  // Task management
  createTask: (taskData: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: Task['status']) => Promise<void>;
  
  // Project management
  createProject: (projectData: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, projectData: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  
  // Subtask management
  addSubtask: (taskId: string, title: string) => Promise<Subtask>;
  updateSubtask: (taskId: string, subtaskId: string, data: Partial<Subtask>) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  
  // Comment management
  addComment: (taskId: string, content: string) => Promise<Comment>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  
  // Time tracking
  startTimer: (taskId: string) => Promise<TimeEntry>;
  stopTimer: (taskId: string) => Promise<TimeEntry>;
  pauseTimer: (taskId: string) => Promise<void>;
  resumeTimer: (taskId: string) => Promise<void>;
  addTimeEntry: (taskId: string, duration: number, description?: string) => Promise<TimeEntry>;
  
  // Utilities
  getTaskById: (id: string) => Task | undefined;
  getProjectById: (id: string) => Project | undefined;
  getUserById: (id: string) => User | undefined;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByAssignee: (assigneeId: string) => Task[];
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

// Mock users
const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 'user-2',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 'user-3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
];

// Mock projects
const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Website Redesign',
    description: 'Complete redesign of company website',
    color: '#3B82F6',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'project-2',
    name: 'Mobile App',
    description: 'Development of mobile application',
    color: '#10B981',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'project-3',
    name: 'Marketing Campaign',
    description: 'Q1 marketing campaign planning',
    color: '#F59E0B',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

// Mock tasks
const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design Homepage Layout',
    description: 'Create wireframes and mockups for the new homepage design',
    status: 'in-progress',
    priority: 'high',
    projectId: 'project-1',
    assigneeId: 'user-1',
    assignee: mockUsers[0],
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
    estimatedHours: 8,
    actualHours: 4,
    subtasks: [
      { id: 'sub-1', title: 'Create wireframes', completed: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'sub-2', title: 'Design mockups', completed: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 'sub-3', title: 'Get client approval', completed: false, createdAt: new Date(), updatedAt: new Date() },
    ],
    comments: [
      {
        id: 'comment-1',
        taskId: 'task-1',
        userId: 'user-1',
        userName: 'John Doe',
        userAvatar: mockUsers[0].avatar,
        content: 'Started working on the wireframes. Will have them ready by tomorrow.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    ],
    timeEntries: [
      {
        id: 'time-1',
        taskId: 'task-1',
        userId: 'user-1',
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 4),
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
        duration: 7200, // 2 hours
        description: 'Working on wireframes',
      },
    ],
    tags: ['design', 'frontend'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'task-2',
    title: 'Implement User Authentication',
    description: 'Set up user authentication system with JWT tokens',
    status: 'todo',
    priority: 'high',
    projectId: 'project-2',
    assigneeId: 'user-2',
    assignee: mockUsers[1],
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week from now
    estimatedHours: 12,
    subtasks: [
      { id: 'sub-4', title: 'Set up JWT authentication', completed: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 'sub-5', title: 'Create login/register forms', completed: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 'sub-6', title: 'Add password reset functionality', completed: false, createdAt: new Date(), updatedAt: new Date() },
    ],
    comments: [],
    timeEntries: [],
    tags: ['backend', 'security'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'task-3',
    title: 'Create Social Media Content',
    description: 'Design and create content for social media platforms',
    status: 'review',
    priority: 'medium',
    projectId: 'project-3',
    assigneeId: 'user-3',
    assignee: mockUsers[2],
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
    estimatedHours: 6,
    actualHours: 5,
    subtasks: [
      { id: 'sub-7', title: 'Design graphics', completed: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'sub-8', title: 'Write captions', completed: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'sub-9', title: 'Schedule posts', completed: false, createdAt: new Date(), updatedAt: new Date() },
    ],
    comments: [
      {
        id: 'comment-2',
        taskId: 'task-3',
        userId: 'user-2',
        userName: 'Sarah Smith',
        userAvatar: mockUsers[1].avatar,
        content: 'Great work on the graphics! The captions look good too.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60),
      },
    ],
    timeEntries: [
      {
        id: 'time-2',
        taskId: 'task-3',
        userId: 'user-3',
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 6),
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 1),
        duration: 18000, // 5 hours
        description: 'Creating social media content',
      },
    ],
    tags: ['marketing', 'social-media'],
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
];

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [users] = useState<User[]>(mockUsers);
  const [currentTimer, setCurrentTimer] = useState<TimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate task stats
  const taskStats = useMemo((): TaskStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      done: tasks.filter(t => t.status === 'done').length,
      overdue: tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'done').length,
      dueToday: tasks.filter(t => t.dueDate && t.dueDate.toDateString() === today.toDateString()).length,
      totalTime: tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0),
    };
  }, [tasks]);

  const createTask = useCallback(async (taskData: Partial<Task>): Promise<Task> => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || '',
      description: taskData.description,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      projectId: taskData.projectId || projects[0]?.id || '',
      assigneeId: taskData.assigneeId,
      assignee: taskData.assigneeId ? users.find(u => u.id === taskData.assigneeId) : undefined,
      dueDate: taskData.dueDate,
      estimatedHours: taskData.estimatedHours,
      actualHours: taskData.actualHours,
      subtasks: taskData.subtasks || [],
      comments: taskData.comments || [],
      timeEntries: taskData.timeEntries || [],
      tags: taskData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, [projects, users]);

  const updateTask = useCallback(async (id: string, taskData: Partial<Task>): Promise<Task> => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { 
            ...task, 
            ...taskData, 
            assignee: taskData.assigneeId ? users.find(u => u.id === taskData.assigneeId) : task.assignee,
            updatedAt: new Date() 
          }
        : task
    ));
    
    const updatedTask = tasks.find(t => t.id === id);
    if (!updatedTask) throw new Error('Task not found');
    
    return { ...updatedTask, ...taskData, updatedAt: new Date() };
  }, [tasks, users]);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const moveTask = useCallback(async (taskId: string, newStatus: Task['status']): Promise<void> => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date() }
        : task
    ));
  }, []);

  const createProject = useCallback(async (projectData: Partial<Project>): Promise<Project> => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: projectData.name || '',
      description: projectData.description || '',
      color: projectData.color || '#3B82F6',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProjects(prev => [...prev, newProject]);
    return newProject;
  }, []);

  const updateProject = useCallback(async (id: string, projectData: Partial<Project>): Promise<Project> => {
    setProjects(prev => prev.map(project => 
      project.id === id 
        ? { ...project, ...projectData, updatedAt: new Date() }
        : project
    ));
    
    const updatedProject = projects.find(p => p.id === id);
    if (!updatedProject) throw new Error('Project not found');
    
    return { ...updatedProject, ...projectData, updatedAt: new Date() };
  }, [projects]);

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    setProjects(prev => prev.filter(project => project.id !== id));
    // Also delete all tasks in this project
    setTasks(prev => prev.filter(task => task.projectId !== id));
  }, []);

  const addSubtask = useCallback(async (taskId: string, title: string): Promise<Subtask> => {
    const newSubtask: Subtask = {
      id: `sub-${Date.now()}`,
      title,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, subtasks: [...task.subtasks, newSubtask], updatedAt: new Date() }
        : task
    ));

    return newSubtask;
  }, []);

  const updateSubtask = useCallback(async (taskId: string, subtaskId: string, data: Partial<Subtask>): Promise<void> => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            subtasks: task.subtasks.map(sub => 
              sub.id === subtaskId 
                ? { ...sub, ...data, updatedAt: new Date() }
                : sub
            ),
            updatedAt: new Date()
          }
        : task
    ));
  }, []);

  const deleteSubtask = useCallback(async (taskId: string, subtaskId: string): Promise<void> => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            subtasks: task.subtasks.filter(sub => sub.id !== subtaskId),
            updatedAt: new Date()
          }
        : task
    ));
  }, []);

  const toggleSubtask = useCallback(async (taskId: string, subtaskId: string): Promise<void> => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            subtasks: task.subtasks.map(sub => 
              sub.id === subtaskId 
                ? { ...sub, completed: !sub.completed, updatedAt: new Date() }
                : sub
            ),
            updatedAt: new Date()
          }
        : task
    ));
  }, []);

  const addComment = useCallback(async (taskId: string, content: string): Promise<Comment> => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      taskId,
      userId: 'user-1', // In real app, this would be the current user
      userName: 'John Doe', // In real app, this would be the current user's name
      userAvatar: mockUsers[0].avatar,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, comments: [...task.comments, newComment], updatedAt: new Date() }
        : task
    ));

    return newComment;
  }, []);

  const updateComment = useCallback(async (commentId: string, content: string): Promise<void> => {
    setTasks(prev => prev.map(task => 
      task.id === task.comments.find(c => c.id === commentId)?.taskId
        ? { 
            ...task, 
            comments: task.comments.map(comment => 
              comment.id === commentId 
                ? { ...comment, content, updatedAt: new Date() }
                : comment
            ),
            updatedAt: new Date()
          }
        : task
    ));
  }, []);

  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    setTasks(prev => prev.map(task => 
      task.id === task.comments.find(c => c.id === commentId)?.taskId
        ? { 
            ...task, 
            comments: task.comments.filter(comment => comment.id !== commentId),
            updatedAt: new Date()
          }
        : task
    ));
  }, []);

  const startTimer = useCallback(async (taskId: string): Promise<TimeEntry> => {
    // Stop any existing timer
    if (currentTimer) {
      // Stop the current timer manually instead of calling stopTimer
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentTimer.startTime.getTime()) / 1000);

      const completedTimer: TimeEntry = {
        ...currentTimer,
        endTime,
        duration,
      };

      // Add to task's time entries
      setTasks(prev => prev.map(task => 
        task.id === currentTimer.taskId 
          ? { 
              ...task, 
              timeEntries: [...task.timeEntries, completedTimer],
              actualHours: (task.actualHours || 0) + (duration / 3600),
              updatedAt: new Date()
            }
          : task
      ));

      setCurrentTimer(null);
    }

    const newTimer: TimeEntry = {
      id: `timer-${Date.now()}`,
      taskId,
      userId: 'user-1', // In real app, this would be the current user
      startTime: new Date(),
    };

    setCurrentTimer(newTimer);
    return newTimer;
  }, [currentTimer]);

  const stopTimer = useCallback(async (taskId: string): Promise<TimeEntry> => {
    if (!currentTimer || currentTimer.taskId !== taskId) {
      throw new Error('No active timer for this task');
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - currentTimer.startTime.getTime()) / 1000);

    const completedTimer: TimeEntry = {
      ...currentTimer,
      endTime,
      duration,
    };

    // Add to task's time entries
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            timeEntries: [...task.timeEntries, completedTimer],
            actualHours: (task.actualHours || 0) + (duration / 3600),
            updatedAt: new Date()
          }
        : task
    ));

    setCurrentTimer(null);
    return completedTimer;
  }, [currentTimer]);

  const pauseTimer = useCallback(async (taskId: string): Promise<void> => {
    if (!currentTimer || currentTimer.taskId !== taskId) {
      throw new Error('No active timer for this task');
    }

    // For now, we'll just stop the timer
    // In a real implementation, you might want to pause/resume functionality
    await stopTimer(taskId);
  }, [currentTimer, stopTimer]);

  const resumeTimer = useCallback(async (taskId: string): Promise<void> => {
    await startTimer(taskId);
  }, [startTimer]);

  const addTimeEntry = useCallback(async (taskId: string, duration: number, description?: string): Promise<TimeEntry> => {
    const timeEntry: TimeEntry = {
      id: `time-${Date.now()}`,
      taskId,
      userId: 'user-1', // In real app, this would be the current user
      startTime: new Date(Date.now() - duration * 1000),
      endTime: new Date(),
      duration,
      description,
    };

    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            timeEntries: [...task.timeEntries, timeEntry],
            actualHours: (task.actualHours || 0) + (duration / 3600),
            updatedAt: new Date()
          }
        : task
    ));

    return timeEntry;
  }, []);

  const getTaskById = useCallback((id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  const getProjectById = useCallback((id: string): Project | undefined => {
    return projects.find(project => project.id === id);
  }, [projects]);

  const getUserById = useCallback((id: string): User | undefined => {
    return users.find(user => user.id === id);
  }, [users]);

  const getTasksByProject = useCallback((projectId: string): Task[] => {
    return tasks.filter(task => task.projectId === projectId);
  }, [tasks]);

  const getTasksByAssignee = useCallback((assigneeId: string): Task[] => {
    return tasks.filter(task => task.assigneeId === assigneeId);
  }, [tasks]);

  const value: TasksContextType = {
    tasks,
    projects,
    users,
    taskStats,
    currentTimer,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    createProject,
    updateProject,
    deleteProject,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
    addComment,
    updateComment,
    deleteComment,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    addTimeEntry,
    getTaskById,
    getProjectById,
    getUserById,
    getTasksByProject,
    getTasksByAssignee,
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}; 