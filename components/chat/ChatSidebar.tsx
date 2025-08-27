'use client';

import React, { useState } from 'react';
import { Search, Plus, MoreVertical, Edit, Archive, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Chat, ChatType } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  chats: Chat[];
  currentChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  onNewChat: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  currentChat,
  onChatSelect,
  onNewChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatLastMessage = (message: string) => {
    return message.length > 30 ? message.substring(0, 30) + '...' : message;
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return timestamp.toLocaleDateString([], { weekday: 'short' });
    } else {
      return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chats</h2>
          <Button variant="ghost" size="sm" onClick={onNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                currentChat?.id === chat.id && "bg-muted"
              )}
              onClick={() => onChatSelect(chat)}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={chat.avatar} />
                  <AvatarFallback>
                    {chat.type === 'group' 
                      ? chat.name.slice(0, 2).toUpperCase()
                      : chat.name.split(' ').map(n => n[0]).join('').toUpperCase()
                    }
                  </AvatarFallback>
                </Avatar>
                {chat.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">{chat.name}</h4>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(chat.lastMessageTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">
                    {formatLastMessage(chat.lastMessage)}
                  </p>
                  {chat.unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Delete className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}; 