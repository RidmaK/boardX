'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Shield, Mail, Lock, Camera, Trash2 } from 'lucide-react';
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
import { useUsers, User as UserType, Role } from '@/contexts/UsersContext';
import { cn } from '@/lib/utils';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  roleId: z.string().min(1, 'Role is required'),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']),
  emailVerified: z.boolean(),
  twoFactorEnabled: z.boolean(),
  notes: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserType | null;
}

export const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onOpenChange,
  user,
}) => {
  const { createUser, updateUser, roles, permissions } = useUsers();
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string>('');

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      roleId: '',
      status: 'pending',
      emailVerified: false,
      twoFactorEnabled: false,
      notes: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        roleId: user.role?.id || '',
        status: user.status,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        notes: '',
      });
      setSelectedPermissions(user.permissions.map(p => p.id));
      setAvatarPreview(user.avatar || '');
    } else {
      form.reset({
        name: '',
        email: '',
        roleId: '',
        status: 'pending',
        emailVerified: false,
        twoFactorEnabled: false,
        notes: '',
      });
      setSelectedPermissions([]);
      setAvatarPreview('');
      setAvatarFile(null);
    }
  }, [user, form]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      const selectedRole = roles.find(r => r.id === data.roleId);
      const selectedPerms = permissions.filter(p => selectedPermissions.includes(p.id));

      const userData = {
        ...data,
        role: selectedRole,
        permissions: selectedPerms,
        avatar: avatarPreview,
      };

      if (user) {
        await updateUser(user.id, userData);
      } else {
        await createUser(userData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save user:', error);
    }
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

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Edit User' : 'Create New User'}
          </DialogTitle>
          <DialogDescription>
            {user ? 'Update user information and permissions.' : 'Add a new user to your system.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback>
                      {form.watch('name') ? form.watch('name').split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90">
                    <Camera className="h-3 w-3" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Enter full name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="user@example.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.watch('status')} onValueChange={(value) => form.setValue('status', value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={form.watch('roleId')} onValueChange={(value) => form.setValue('roleId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.roleId && (
                  <p className="text-sm text-red-500">{form.formState.errors.roleId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...form.register('notes')}
                  placeholder="Additional notes about this user..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailVerified"
                    checked={form.watch('emailVerified')}
                    onCheckedChange={(checked) => form.setValue('emailVerified', checked as boolean)}
                  />
                  <Label htmlFor="emailVerified" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Verified
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="twoFactorEnabled"
                    checked={form.watch('twoFactorEnabled')}
                    onCheckedChange={(checked) => form.setValue('twoFactorEnabled', checked as boolean)}
                  />
                  <Label htmlFor="twoFactorEnabled" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Two-Factor Authentication Enabled
                  </Label>
                </div>

                {user && (
                  <div className="space-y-2">
                    <Label>Account Information</Label>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p>{user.createdAt.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Login:</span>
                        <p>{user.lastLoginAt ? user.lastLoginAt.toLocaleDateString() : 'Never'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Login Attempts:</span>
                        <p>{user.loginAttempts}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Active:</span>
                        <p>{user.lastActive ? user.lastActive.toLocaleDateString() : 'Never'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Custom Permissions</Label>
                  <Badge variant="secondary">
                    {selectedPermissions.length} selected
                  </Badge>
                </div>

                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm">{category}</h4>
                      <div className="space-y-2">
                        {perms.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={selectedPermissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                            <Label htmlFor={permission.id} className="text-sm cursor-pointer">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{permission.name}</span>
                                <span className="text-muted-foreground">- {permission.description}</span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 