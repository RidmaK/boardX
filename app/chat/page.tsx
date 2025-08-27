'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Mic, Smile, MoreVertical, Search, Phone, Video, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const { 
    currentChat, 
    setCurrentChat, 
    chats, 
    messages, 
    sendMessage, 
    isMobile 
  } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string, type: 'text' | 'image' | 'audio' = 'text') => {
    if (currentChat && content.trim()) {
      sendMessage(currentChat.id, content, type);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "w-full md:w-80 border-r bg-card transition-all duration-300",
        sidebarOpen ? "block" : "hidden md:block"
      )}>
        <ChatSidebar 
          chats={chats}
          currentChat={currentChat}
          onChatSelect={setCurrentChat}
          onNewChat={() => setNewChatDialogOpen(true)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header - Sticky */}
            <div className="flex items-center justify-between p-4 border-b bg-card sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentChat.avatar} />
                  <AvatarFallback>
                    {currentChat.type === 'group' 
                      ? currentChat.name.slice(0, 2).toUpperCase()
                      : currentChat.name.split(' ').map(n => n[0]).join('').toUpperCase()
                    }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{currentChat.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentChat.type === 'group' 
                      ? `${currentChat.participants?.length || 0} members`
                      : currentChat.isOnline ? 'Online' : 'Offline'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 min-h-0">
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input - Sticky */}
            <div className="p-4 border-t bg-card sticky bottom-0 z-10">
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold">Welcome to Chat</h2>
              <p className="text-muted-foreground max-w-md">
                Select a conversation from the sidebar to start chatting, or create a new one to connect with friends and colleagues.
              </p>
              <Button onClick={() => setSidebarOpen(true)}>
                Start a Conversation
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Dialog */}
      <NewChatDialog
        open={newChatDialogOpen}
        onOpenChange={setNewChatDialogOpen}
      />
    </div>
  );
} 