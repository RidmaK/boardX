'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Users, Check, X, Crown, Settings } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUsers, Role, Permission } from '@/contexts/UsersContext';
import { cn } from '@/lib/utils';

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
}

export const RoleDialog: React.FC<RoleDialogProps> = ({
  open,
  onOpenChange,
  role,
}) => {
  const { createRole, updateRole, deleteRole, roles, permissions, users } = useUsers();
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
  const [activeTab, setActiveTab] = React.useState('details');

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (role) {
      form.reset({
        name: role.name,
        description: role.description,
      });
      setSelectedPermissions(role.permissions.map(p => p.id));
    } else {
      form.reset({
        name: '',
        description: '',
      });
      setSelectedPermissions([]);
    }
  }, [role, form]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAllCategory = (category: string) => {
    const categoryPermissions = permissions.filter(p => p.category === category);
    const categoryPermissionIds = categoryPermissions.map(p => p.id);
    
    const allSelected = categoryPermissionIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      // Deselect all in category
      setSelectedPermissions(prev => prev.filter(id => !categoryPermissionIds.includes(id)));
    } else {
      // Select all in category
      setSelectedPermissions(prev => [...new Set([...prev, ...categoryPermissionIds])]);
    }
  };

  const onSubmit = async (data: RoleFormData) => {
    try {
      const selectedPerms = permissions.filter(p => selectedPermissions.includes(p.id));

      if (role) {
        await updateRole(role.id, {
          ...data,
          permissions: selectedPerms,
        });
      } else {
        await createRole({
          ...data,
          permissions: selectedPerms,
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save role:', error);
    }
  };

  const handleDeleteRole = async () => {
    if (!role) return;
    
    try {
      await deleteRole(role.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  const getUsersWithRole = (roleId: string) => {
    return users.filter(user => user.role?.id === roleId);
  };

  const getPermissionCount = (category: string) => {
    const categoryPermissions = permissions.filter(p => p.category === category);
    const selectedInCategory = categoryPermissions.filter(p => selectedPermissions.includes(p.id));
    return `${selectedInCategory.length}/${categoryPermissions.length}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {role ? (
              <>
                <Shield className="h-5 w-5" />
                Edit Role: {role.name}
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                Create New Role
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {role ? 'Update role information and permissions.' : 'Create a new role with specific permissions.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Enter role name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Describe what this role can do..."
                  rows={3}
                />
              </div>

              {role && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Role Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{role.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{role.updatedAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">System Role:</span>
                      <Badge variant={role.isSystem ? "default" : "secondary"}>
                        {role.isSystem ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Users with this role:</span>
                      <span>{getUsersWithRole(role.id).length}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <DialogFooter>
                {role && !role.isSystem && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteRole}
                  >
                    Delete Role
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Permissions</Label>
                <Badge variant="secondary">
                  {selectedPermissions.length} selected
                </Badge>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{category}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getPermissionCount(category)}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectAllCategory(category)}
                            className="h-6 px-2 text-xs"
                          >
                            {perms.every(p => selectedPermissions.includes(p.id)) ? (
                              <>
                                <X className="h-3 w-3 mr-1" />
                                Deselect All
                              </>
                            ) : (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Select All
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {perms.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <Label htmlFor={permission.id} className="text-sm cursor-pointer flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{permission.name}</span>
                              <span className="text-muted-foreground text-xs">
                                {permission.resource}:{permission.action}
                              </span>
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {permission.description}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {role ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Users with this role</Label>
                  <Badge variant="secondary">
                    {getUsersWithRole(role.id).length} users
                  </Badge>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getUsersWithRole(role.id).map((user) => (
                    <Card key={user.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a role to see users with that role</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}; 