'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, MoreVertical, Mail, Copy, ExternalLink, Shield, UserCheck, UserX, Crown, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUsers } from '@/contexts/UsersContext';
import { UserDialog } from '@/components/users/UserDialog';
import { InviteDialog } from '@/components/users/InviteDialog';
import { RoleDialog } from '@/components/users/RoleDialog';
import { DeleteUserDialog } from '@/components/users/DeleteUserDialog';
import { UserStats } from '@/components/users/UserStats';
import { UserActivity } from '@/components/users/UserActivity';
import { cn } from '@/lib/utils';

export default function UsersPage() {
  const { 
    users, 
    roles, 
    permissions, 
    userStats, 
    recentActivity,
    isLoading 
  } = useUsers();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingRole, setEditingRole] = useState<any>(null);

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user.role?.id === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'role':
          aValue = a.role?.name || '';
          bValue = b.role?.name || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'lastActive':
          aValue = new Date(a.lastActive || 0);
          bValue = new Date(b.lastActive || 0);
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchQuery, statusFilter, roleFilter, sortBy, sortOrder]);

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setRoleDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'suspended': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      case 'guest': return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage your team members, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setRoleDialogOpen(true)}>
            <Shield className="mr-2 h-4 w-4" />
            Manage Roles
          </Button>
          <Button variant="outline" onClick={() => setInviteDialogOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Invite Users
          </Button>
          <Button onClick={() => setUserDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <UserStats stats={userStats} />

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles ({roles.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="lastActive">Last Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role?.name)}>
                          {user.role?.name || 'No Role'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", getStatusColor(user.status))} />
                          <span className="capitalize">{user.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              Manage Permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Roles & Permissions</CardTitle>
                  <CardDescription>
                    Manage user roles and their associated permissions
                  </CardDescription>
                </div>
                <Button onClick={() => setRoleDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <Card key={role.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {role.name === 'Admin' && <Crown className="h-4 w-4 text-yellow-500" />}
                          <CardTitle className="text-lg">{role.name}</CardTitle>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditRole(role)}>
                              <Settings className="mr-2 h-4 w-4" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <UserX className="mr-2 h-4 w-4" />
                              Delete Role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDescription>
                        {role.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Permissions:</div>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions?.slice(0, 3).map((permission: any) => (
                            <Badge key={permission.id} variant="secondary" className="text-xs">
                              {permission.name}
                            </Badge>
                          ))}
                          {role.permissions?.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{role.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {users.filter(u => u.role?.id === role.id).length} users
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <UserActivity activity={recentActivity} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <UserDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        user={selectedUser}
      />

      <InviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      <RoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        role={editingRole}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={selectedUser}
      />
    </div>
  );
} 