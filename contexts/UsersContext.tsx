'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  role?: Role;
  permissions: Permission[];
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  loginAttempts: number;
  lastLoginAt?: Date;
  invitedBy?: string;
  inviteCode?: string;
}

export interface InviteLink {
  id: string;
  code: string;
  email?: string;
  roleId: string;
  createdBy: string;
  expiresAt: Date;
  usedAt?: Date;
  usedBy?: string;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  pending: number;
  newThisMonth: number;
  activeToday: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

interface UsersContextType {
  users: User[];
  roles: Role[];
  permissions: Permission[];
  inviteLinks: InviteLink[];
  userStats: UserStats;
  recentActivity: UserActivity[];
  isLoading: boolean;
  
  // User management
  createUser: (userData: Partial<User>) => Promise<User>;
  updateUser: (id: string, userData: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  suspendUser: (id: string) => Promise<void>;
  activateUser: (id: string) => Promise<void>;
  
  // Role management
  createRole: (roleData: Partial<Role>) => Promise<Role>;
  updateRole: (id: string, roleData: Partial<Role>) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
  
  // Permission management
  assignPermissions: (userId: string, permissionIds: string[]) => Promise<void>;
  revokePermissions: (userId: string, permissionIds: string[]) => Promise<void>;
  
  // Invite management
  createInviteLink: (inviteData: Partial<InviteLink>) => Promise<InviteLink>;
  validateInviteCode: (code: string) => Promise<InviteLink | null>;
  useInviteCode: (code: string, userData: Partial<User>) => Promise<User>;
  revokeInviteLink: (id: string) => Promise<void>;
  
  // Utilities
  getUserById: (id: string) => User | undefined;
  getRoleById: (id: string) => Role | undefined;
  hasPermission: (userId: string, permission: string) => boolean;
  canPerformAction: (userId: string, resource: string, action: string) => boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

// Mock permissions
const mockPermissions: Permission[] = [
  { id: 'user:read', name: 'View Users', description: 'Can view user profiles', category: 'Users', resource: 'user', action: 'read' },
  { id: 'user:create', name: 'Create Users', description: 'Can create new users', category: 'Users', resource: 'user', action: 'create' },
  { id: 'user:update', name: 'Edit Users', description: 'Can edit user information', category: 'Users', resource: 'user', action: 'update' },
  { id: 'user:delete', name: 'Delete Users', description: 'Can delete users', category: 'Users', resource: 'user', action: 'delete' },
  { id: 'role:read', name: 'View Roles', description: 'Can view roles and permissions', category: 'Roles', resource: 'role', action: 'read' },
  { id: 'role:create', name: 'Create Roles', description: 'Can create new roles', category: 'Roles', resource: 'role', action: 'create' },
  { id: 'role:update', name: 'Edit Roles', description: 'Can edit roles and permissions', category: 'Roles', resource: 'role', action: 'update' },
  { id: 'role:delete', name: 'Delete Roles', description: 'Can delete roles', category: 'Roles', resource: 'role', action: 'delete' },
  { id: 'chat:read', name: 'View Chats', description: 'Can view chat conversations', category: 'Chat', resource: 'chat', action: 'read' },
  { id: 'chat:create', name: 'Create Chats', description: 'Can create new chat conversations', category: 'Chat', resource: 'chat', action: 'create' },
  { id: 'chat:delete', name: 'Delete Chats', description: 'Can delete chat conversations', category: 'Chat', resource: 'chat', action: 'delete' },
  { id: 'calendar:read', name: 'View Calendar', description: 'Can view calendar events', category: 'Calendar', resource: 'calendar', action: 'read' },
  { id: 'calendar:create', name: 'Create Events', description: 'Can create calendar events', category: 'Calendar', resource: 'calendar', action: 'create' },
  { id: 'calendar:update', name: 'Edit Events', description: 'Can edit calendar events', category: 'Calendar', resource: 'calendar', action: 'update' },
  { id: 'calendar:delete', name: 'Delete Events', description: 'Can delete calendar events', category: 'Calendar', resource: 'calendar', action: 'delete' },
];

// Mock roles
const mockRoles: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system access with all permissions',
    permissions: mockPermissions,
    isSystem: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'moderator',
    name: 'Moderator',
    description: 'Can manage users and moderate content',
    permissions: mockPermissions.filter(p => 
      p.category === 'Users' || p.category === 'Chat'
    ),
    isSystem: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user',
    name: 'User',
    description: 'Standard user with basic permissions',
    permissions: mockPermissions.filter(p => 
      p.category === 'Chat' || p.category === 'Calendar'
    ),
    isSystem: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'guest',
    name: 'Guest',
    description: 'Limited access user',
    permissions: mockPermissions.filter(p => 
      p.category === 'Chat' && p.action === 'read'
    ),
    isSystem: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock users
const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Admin',
    email: 'admin@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    status: 'active',
    role: mockRoles[0],
    permissions: mockPermissions,
    lastActive: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    emailVerified: true,
    twoFactorEnabled: true,
    loginAttempts: 0,
    lastLoginAt: new Date(),
  },
  {
    id: 'user-2',
    name: 'Sarah Moderator',
    email: 'moderator@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    status: 'active',
    role: mockRoles[1],
    permissions: mockRoles[1].permissions,
    lastActive: new Date(Date.now() - 1000 * 60 * 30),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    emailVerified: true,
    twoFactorEnabled: false,
    loginAttempts: 0,
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'user-3',
    name: 'Mike User',
    email: 'user@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    status: 'active',
    role: mockRoles[2],
    permissions: mockRoles[2].permissions,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    emailVerified: true,
    twoFactorEnabled: false,
    loginAttempts: 0,
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'user-4',
    name: 'Alice Guest',
    email: 'guest@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    status: 'pending',
    role: mockRoles[3],
    permissions: mockRoles[3].permissions,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
    emailVerified: false,
    twoFactorEnabled: false,
    loginAttempts: 0,
    invitedBy: 'user-1',
    inviteCode: 'INVITE123',
  },
];

// Mock invite links
const mockInviteLinks: InviteLink[] = [
  {
    id: 'invite-1',
    code: 'ADMIN2024',
    roleId: 'admin',
    createdBy: 'user-1',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    maxUses: 5,
    currentUses: 1,
    isActive: true,
  },
  {
    id: 'invite-2',
    code: 'USER2024',
    email: 'newuser@example.com',
    roleId: 'user',
    createdBy: 'user-1',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days
    maxUses: 1,
    currentUses: 0,
    isActive: true,
  },
];

// Mock user stats
const mockUserStats: UserStats = {
  total: mockUsers.length,
  active: mockUsers.filter(u => u.status === 'active').length,
  inactive: mockUsers.filter(u => u.status === 'inactive').length,
  suspended: mockUsers.filter(u => u.status === 'suspended').length,
  pending: mockUsers.filter(u => u.status === 'pending').length,
  newThisMonth: mockUsers.filter(u => u.createdAt > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)).length,
  activeToday: mockUsers.filter(u => u.lastActive && u.lastActive > new Date(Date.now() - 1000 * 60 * 60 * 24)).length,
};

// Mock activity
const mockActivity: UserActivity[] = [
  {
    id: 'activity-1',
    userId: 'user-1',
    userName: 'John Admin',
    action: 'user.login',
    description: 'User logged in successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
  },
  {
    id: 'activity-2',
    userId: 'user-2',
    userName: 'Sarah Moderator',
    action: 'user.update',
    description: 'Updated user profile',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    ipAddress: '192.168.1.2',
    userAgent: 'Mozilla/5.0...',
  },
  {
    id: 'activity-3',
    userId: 'user-1',
    userName: 'John Admin',
    action: 'user.create',
    description: 'Created new user: Alice Guest',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
  },
];

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [permissions] = useState<Permission[]>(mockPermissions);
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>(mockInviteLinks);
  const [userStats, setUserStats] = useState<UserStats>(mockUserStats);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>(mockActivity);
  const [isLoading, setIsLoading] = useState(false);

  // Update stats when users change
  useEffect(() => {
    setUserStats({
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      pending: users.filter(u => u.status === 'pending').length,
      newThisMonth: users.filter(u => u.createdAt > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)).length,
      activeToday: users.filter(u => u.lastActive && u.lastActive > new Date(Date.now() - 1000 * 60 * 60 * 24)).length,
    });
  }, [users]);

  const createUser = useCallback(async (userData: Partial<User>): Promise<User> => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || '',
      email: userData.email || '',
      avatar: userData.avatar,
      status: userData.status || 'pending',
      role: userData.role,
      permissions: userData.permissions || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: false,
      twoFactorEnabled: false,
      loginAttempts: 0,
      ...userData,
    };

    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, []);

  const updateUser = useCallback(async (id: string, userData: Partial<User>): Promise<User> => {
    setUsers(prev => prev.map(user => 
      user.id === id 
        ? { ...user, ...userData, updatedAt: new Date() }
        : user
    ));
    
    const updatedUser = users.find(u => u.id === id);
    if (!updatedUser) throw new Error('User not found');
    
    return { ...updatedUser, ...userData, updatedAt: new Date() };
  }, [users]);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    setUsers(prev => prev.filter(user => user.id !== id));
  }, []);

  const suspendUser = useCallback(async (id: string): Promise<void> => {
    setUsers(prev => prev.map(user => 
      user.id === id 
        ? { ...user, status: 'suspended', updatedAt: new Date() }
        : user
    ));
  }, []);

  const activateUser = useCallback(async (id: string): Promise<void> => {
    setUsers(prev => prev.map(user => 
      user.id === id 
        ? { ...user, status: 'active', updatedAt: new Date() }
        : user
    ));
  }, []);

  const createRole = useCallback(async (roleData: Partial<Role>): Promise<Role> => {
    const newRole: Role = {
      id: `role-${Date.now()}`,
      name: roleData.name || '',
      description: roleData.description || '',
      permissions: roleData.permissions || [],
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setRoles(prev => [...prev, newRole]);
    return newRole;
  }, []);

  const updateRole = useCallback(async (id: string, roleData: Partial<Role>): Promise<Role> => {
    setRoles(prev => prev.map(role => 
      role.id === id 
        ? { ...role, ...roleData, updatedAt: new Date() }
        : role
    ));
    
    const updatedRole = roles.find(r => r.id === id);
    if (!updatedRole) throw new Error('Role not found');
    
    return { ...updatedRole, ...roleData, updatedAt: new Date() };
  }, [roles]);

  const deleteRole = useCallback(async (id: string): Promise<void> => {
    const role = roles.find(r => r.id === id);
    if (role?.isSystem) {
      throw new Error('Cannot delete system roles');
    }
    
    setRoles(prev => prev.filter(role => role.id !== id));
  }, [roles]);

  const assignPermissions = useCallback(async (userId: string, permissionIds: string[]): Promise<void> => {
    const permissionsToAssign = permissions.filter(p => permissionIds.includes(p.id));
    
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, permissions: [...user.permissions, ...permissionsToAssign], updatedAt: new Date() }
        : user
    ));
  }, [permissions]);

  const revokePermissions = useCallback(async (userId: string, permissionIds: string[]): Promise<void> => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, permissions: user.permissions.filter(p => !permissionIds.includes(p.id)), updatedAt: new Date() }
        : user
    ));
  }, []);

  const createInviteLink = useCallback(async (inviteData: Partial<InviteLink>): Promise<InviteLink> => {
    const newInvite: InviteLink = {
      id: `invite-${Date.now()}`,
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      roleId: inviteData.roleId || 'user',
      createdBy: inviteData.createdBy || 'user-1',
      expiresAt: inviteData.expiresAt || new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      maxUses: inviteData.maxUses || 1,
      currentUses: 0,
      isActive: true,
      ...inviteData,
    };

    setInviteLinks(prev => [...prev, newInvite]);
    return newInvite;
  }, []);

  const validateInviteCode = useCallback(async (code: string): Promise<InviteLink | null> => {
    const invite = inviteLinks.find(i => i.code === code && i.isActive);
    
    if (!invite) return null;
    
    if (invite.expiresAt < new Date()) return null;
    if (invite.maxUses && invite.currentUses >= invite.maxUses) return null;
    
    return invite;
  }, [inviteLinks]);

  const useInviteCode = useCallback(async (code: string, userData: Partial<User>): Promise<User> => {
    const invite = await validateInviteCode(code);
    if (!invite) throw new Error('Invalid or expired invite code');
    
    const role = roles.find(r => r.id === invite.roleId);
    if (!role) throw new Error('Invalid role');
    
    const newUser = await createUser({
      ...userData,
      role,
      permissions: role.permissions,
      invitedBy: invite.createdBy,
      inviteCode: code,
    });
    
    // Update invite usage
    setInviteLinks(prev => prev.map(i => 
      i.id === invite.id 
        ? { ...i, currentUses: i.currentUses + 1, usedAt: new Date(), usedBy: newUser.id }
        : i
    ));
    
    return newUser;
  }, [createUser, roles, validateInviteCode]);

  const revokeInviteLink = useCallback(async (id: string): Promise<void> => {
    setInviteLinks(prev => prev.map(invite => 
      invite.id === id 
        ? { ...invite, isActive: false }
        : invite
    ));
  }, []);

  const getUserById = useCallback((id: string): User | undefined => {
    return users.find(user => user.id === id);
  }, [users]);

  const getRoleById = useCallback((id: string): Role | undefined => {
    return roles.find(role => role.id === id);
  }, [roles]);

  const hasPermission = useCallback((userId: string, permission: string): boolean => {
    const user = getUserById(userId);
    if (!user) return false;
    
    return user.permissions.some(p => p.id === permission);
  }, [getUserById]);

  const canPerformAction = useCallback((userId: string, resource: string, action: string): boolean => {
    const user = getUserById(userId);
    if (!user) return false;
    
    return user.permissions.some(p => p.resource === resource && p.action === action);
  }, [getUserById]);

  const value: UsersContextType = {
    users,
    roles,
    permissions,
    inviteLinks,
    userStats,
    recentActivity,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    suspendUser,
    activateUser,
    createRole,
    updateRole,
    deleteRole,
    assignPermissions,
    revokePermissions,
    createInviteLink,
    validateInviteCode,
    useInviteCode,
    revokeInviteLink,
    getUserById,
    getRoleById,
    hasPermission,
    canPerformAction,
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
}; 