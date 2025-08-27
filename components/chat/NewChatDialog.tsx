'use client';

import React, { useState } from 'react';
import { Users, User, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat, User as ChatUser } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock users for demo (in real app, this would come from your user management system)
const availableUsers: ChatUser[] = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
  },
  {
    id: 'user-2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isOnline: false,
  },
  {
    id: 'user-3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
  },
  {
    id: 'user-4',
    name: 'David Wilson',
    email: 'david@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    isOnline: false,
  },
  {
    id: 'user-5',
    name: 'Emma Brown',
    email: 'emma@example.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
  },
  {
    id: 'user-6',
    name: 'Frank Miller',
    email: 'frank@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isOnline: false,
  },
];

export const NewChatDialog: React.FC<NewChatDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { createChat, currentUser } = useChat();
  const [selectedUsers, setSelectedUsers] = useState<ChatUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [activeTab, setActiveTab] = useState('individual');

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserToggle = (user: ChatUser) => {
    if (activeTab === 'individual') {
      setSelectedUsers([user]);
    } else {
      setSelectedUsers(prev => 
        prev.find(u => u.id === user.id)
          ? prev.filter(u => u.id !== user.id)
          : [...prev, user]
      );
    }
  };

  const handleCreateChat = () => {
    if (selectedUsers.length === 0) return;

    const participants = [currentUser, ...selectedUsers];
    const type = activeTab === 'individual' ? 'individual' : 'group';
    const name = activeTab === 'group' ? groupName : undefined;

    createChat(participants, type, name);
    handleClose();
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchQuery('');
    setGroupName('');
    setActiveTab('individual');
    onOpenChange(false);
  };

  const isUserSelected = (userId: string) => {
    return selectedUsers.some(user => user.id === userId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Start a new conversation with your contacts.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="group">Group</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-4">
            <div className="space-y-2">
              <Label>Search contacts</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                      isUserSelected(user.id) && "bg-muted"
                    )}
                    onClick={() => handleUserToggle(user)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                      {isUserSelected(user.id) && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="group" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Select members</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Members ({selectedUsers.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-muted px-2 py-1 rounded-full"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => handleUserToggle(user)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ScrollArea className="h-48">
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleUserToggle(user)}
                  >
                    <Checkbox
                      checked={isUserSelected(user.id)}
                      onChange={() => handleUserToggle(user)}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    {user.isOnline && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateChat}
            disabled={
              selectedUsers.length === 0 || 
              (activeTab === 'group' && !groupName.trim())
            }
          >
            Create {activeTab === 'individual' ? 'Chat' : 'Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 