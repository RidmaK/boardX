'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Mic, Smile, StopCircle, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface ChatInputProps {
  onSendMessage: (content: string, type: 'text' | 'image' | 'audio') => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        onSendMessage(url, 'audio');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, [onSendMessage]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  }, [isRecording]);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessage(prev => prev + emoji.native);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (file.type.startsWith('image/')) {
          onSendMessage(result, 'image');
        } else {
          // For other file types, you might want to handle differently
          console.log('File uploaded:', file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-end gap-2">
      {/* File Upload Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,audio/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Emoji Picker */}
      <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            <Smile className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="light"
            set="native"
          />
        </PopoverContent>
      </Popover>

      {/* Attachment Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-10 w-10 p-0"
        onClick={() => fileInputRef.current?.click()}
      >
        <Paperclip className="h-5 w-5" />
      </Button>

      {/* Message Input */}
      <div className="flex-1 relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="min-h-[40px] max-h-32 resize-none pr-12"
          rows={1}
        />
      </div>

      {/* Recording or Send Button */}
      {isRecording ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-red-500 animate-pulse">
            {formatRecordingTime(recordingTime)}
          </span>
          <Button
            variant="destructive"
            size="sm"
            className="h-10 w-10 p-0"
            onClick={stopRecording}
          >
            <StopCircle className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0"
            onClick={startRecording}
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Button
            size="sm"
            className="h-10 w-10 p-0"
            onClick={handleSendMessage}
            disabled={!message.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}; 