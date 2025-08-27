'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ChatType = 'individual' | 'group';
export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'file';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  chatId: string;
  content: string;
  type: MessageType;
  sender: User;
  timestamp: Date;
  status: MessageStatus;
  caption?: string;
  duration?: number; // for audio messages
  fileName?: string; // for file messages
  fileSize?: number; // for file messages
}

export interface Chat {
  id: string;
  name: string;
  type: ChatType;
  avatar?: string;
  participants: User[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline?: boolean; // for individual chats
  isPinned?: boolean;
  isArchived?: boolean;
}

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  currentUser: User;
  isMobile: boolean;
  setCurrentChat: (chat: Chat | null) => void;
  sendMessage: (chatId: string, content: string, type: MessageType, caption?: string) => void;
  createChat: (participants: User[], type: ChatType, name?: string) => void;
  deleteChat: (chatId: string) => void;
  markAsRead: (chatId: string) => void;
  updateUserStatus: (userId: string, isOnline: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Mock current user
const mockCurrentUser: User = {
  id: 'current-user',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  isOnline: true,
};

// Mock users for demo
const mockUsers: User[] = [
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
    lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
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
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
];

// Mock initial chats
const mockChats: Chat[] = [
  {
    id: 'chat-1',
    name: 'Alice Johnson',
    type: 'individual',
    avatar: mockUsers[0].avatar,
    participants: [mockCurrentUser, mockUsers[0]],
    lastMessage: 'Hey! How are you doing?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'chat-2',
    name: 'Bob Smith',
    type: 'individual',
    avatar: mockUsers[1].avatar,
    participants: [mockCurrentUser, mockUsers[1]],
    lastMessage: 'Thanks for the update!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'chat-3',
    name: 'Project Team',
    type: 'group',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop&crop=face',
    participants: [mockCurrentUser, mockUsers[0], mockUsers[1], mockUsers[2]],
    lastMessage: 'Meeting scheduled for tomorrow at 10 AM',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unreadCount: 1,
  },
  {
    id: 'chat-4',
    name: 'Carol Davis',
    type: 'individual',
    avatar: mockUsers[2].avatar,
    participants: [mockCurrentUser, mockUsers[2]],
    lastMessage: 'Can you send me the files?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    unreadCount: 0,
    isOnline: true,
  },
];

// Mock initial messages
const mockMessages: Message[] = [
  {
    id: 'msg-1',
    chatId: 'chat-1',
    content: 'Hey! How are you doing?',
    type: 'text',
    sender: mockUsers[0],
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: 'read',
  },
  {
    id: 'msg-2',
    chatId: 'chat-1',
    content: 'I\'m doing great! Thanks for asking 😊',
    type: 'text',
    sender: mockCurrentUser,
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    status: 'read',
  },
  {
    id: 'msg-3',
    chatId: 'chat-1',
    content: 'That\'s awesome! Want to grab coffee later?',
    type: 'text',
    sender: mockUsers[0],
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    status: 'delivered',
  },
  {
    id: 'msg-4',
    chatId: 'chat-3',
    content: 'Meeting scheduled for tomorrow at 10 AM',
    type: 'text',
    sender: mockUsers[1],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'sent',
  },
];

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser] = useState<User>(mockCurrentUser);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load messages when current chat changes
  useEffect(() => {
    if (currentChat) {
      const chatMessages = mockMessages.filter(msg => msg.chatId === currentChat.id);
      setMessages(chatMessages);
    } else {
      setMessages([]);
    }
  }, [currentChat]);

  const sendMessage = useCallback((chatId: string, content: string, type: MessageType, caption?: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId,
      content,
      type,
      sender: currentUser,
      timestamp: new Date(),
      status: 'sending',
      caption,
    };

    // Add message to local state
    setMessages(prev => [...prev, newMessage]);

    // Update chat's last message
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          lastMessage: type === 'text' ? content : `${type} message`,
          lastMessageTime: new Date(),
          unreadCount: chat.unreadCount + 1,
        };
      }
      return chat;
    }));

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    }, 1000);

    // Simulate message read (for demo purposes)
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 2000);
  }, [currentUser]);

  const createChat = useCallback((participants: User[], type: ChatType, name?: string) => {
    const chatName = name || (type === 'individual' 
      ? participants.find(p => p.id !== currentUser.id)?.name || 'New Chat'
      : 'New Group'
    );

    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      name: chatName,
      type,
      avatar: type === 'individual' 
        ? participants.find(p => p.id !== currentUser.id)?.avatar
        : undefined,
      participants,
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0,
      isOnline: type === 'individual' 
        ? participants.find(p => p.id !== currentUser.id)?.isOnline
        : undefined,
    };

    setChats(prev => [newChat, ...prev]);
    setCurrentChat(newChat);
  }, [currentUser]);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
    }
  }, [currentChat]);

  const markAsRead = useCallback((chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    ));
    
    setMessages(prev => prev.map(msg => 
      msg.chatId === chatId && msg.sender.id !== currentUser.id
        ? { ...msg, status: 'read' }
        : msg
    ));
  }, [currentUser]);

  const updateUserStatus = useCallback((userId: string, isOnline: boolean) => {
    // Update user status in chats
    setChats(prev => prev.map(chat => {
      if (chat.type === 'individual' && chat.participants.some(p => p.id === userId)) {
        return { ...chat, isOnline: isOnline };
      }
      return chat;
    }));
  }, []);

  const value: ChatContextType = {
    chats,
    currentChat,
    messages,
    currentUser,
    isMobile,
    setCurrentChat,
    sendMessage,
    createChat,
    deleteChat,
    markAsRead,
    updateUserStatus,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 