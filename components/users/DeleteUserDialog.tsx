'use client';

import React from 'react';
import { Trash2, AlertTriangle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUsers, User as UserType } from '@/contexts/UsersContext';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserType | null;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onOpenChange,
  user,
}) => {
  const { deleteUser } = useUsers();

  const handleDelete = async () => {
    if (!user) return;
    
    try {
      await deleteUser(user.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user account and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Deleting this user will remove all their data, including messages, calendar events, and other content.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                  {user.status}
                </Badge>
                {user.role && (
                  <Badge variant="outline">
                    {user.role.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <div>• Account created: {user.createdAt.toLocaleDateString()}</div>
            <div>• Last active: {user.lastActive ? user.lastActive.toLocaleDateString() : 'Never'}</div>
            <div>• Email verified: {user.emailVerified ? 'Yes' : 'No'}</div>
            <div>• Two-factor enabled: {user.twoFactorEnabled ? 'Yes' : 'No'}</div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 