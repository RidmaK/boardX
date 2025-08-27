'use client';

import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Play, Pause, Download } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Message, MessageType, User, useChat } from '@/contexts/ChatContext';

interface ChatMessageProps {
  message: Message;
  isOwnMessage?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isOwnMessage = false 
}) => {
  const { currentUser } = useChat();
  const actualIsOwnMessage = message.sender.id === currentUser.id;
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleAudioPlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        progressIntervalRef.current = setInterval(() => {
          if (audioRef.current) {
            const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setAudioProgress(progress);
          }
        }, 100);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const formatTime = (timestamp: Date) => {
    return format(timestamp, 'HH:mm');
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <div className="text-sm">
            {message.content}
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <img
              src={message.content}
              alt="Shared image"
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.content, '_blank')}
            />
            {message.caption && (
              <div className="text-sm text-muted-foreground">
                {message.caption}
              </div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAudioPlay}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex-1">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-100"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            </div>
            
            <span className="text-xs text-muted-foreground">
              {message.duration ? `${Math.floor(message.duration / 60)}:${(message.duration % 60).toString().padStart(2, '0')}` : '0:00'}
            </span>
            
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Download className="h-3 w-3" />
            </Button>
            
            <audio
              ref={audioRef}
              src={message.content}
              onEnded={handleAudioEnded}
              onTimeUpdate={() => {
                if (audioRef.current) {
                  const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
                  setAudioProgress(progress);
                }
              }}
            />
          </div>
        );

      default:
        return <div className="text-sm">{message.content}</div>;
    }
  };

  return (
    <div className={cn(
      "flex gap-3",
      actualIsOwnMessage && "flex-row-reverse"
    )}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.sender.avatar} />
        <AvatarFallback>
          {message.sender.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex flex-col max-w-[70%]",
        actualIsOwnMessage && "items-end"
      )}>
        {!actualIsOwnMessage && (
          <span className="text-xs text-muted-foreground mb-1">
            {message.sender.name}
          </span>
        )}
        
        <div className={cn(
          "rounded-lg px-3 py-2",
          actualIsOwnMessage 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}>
          {renderMessageContent()}
        </div>
        
        <div className={cn(
          "flex items-center gap-1 mt-1 text-xs text-muted-foreground",
          actualIsOwnMessage && "flex-row-reverse"
        )}>
          <span>{formatTime(message.timestamp)}</span>
          {actualIsOwnMessage && (
            <div className="flex items-center">
              {message.status === 'sent' && <Check className="h-3 w-3" />}
              {message.status === 'delivered' && <CheckCheck className="h-3 w-3" />}
              {message.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-500" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 