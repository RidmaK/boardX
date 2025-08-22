'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCalendar, CalendarEvent } from '@/contexts/CalendarContext';

interface DeleteMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
}

export const DeleteMeetingDialog: React.FC<DeleteMeetingDialogProps> = ({
  open,
  onOpenChange,
  event,
}) => {
  const { deleteEvent } = useCalendar();

  const handleDelete = async () => {
    if (event) {
      try {
        await deleteEvent(event.id);
        onOpenChange(false);
      } catch (error) {
        console.error('Failed to delete meeting:', error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Delete Meeting
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{event?.title}&rdquo;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
