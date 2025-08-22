'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addHours } from 'date-fns';
import { Calendar, Clock, MapPin, Users, Video, X } from 'lucide-react';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCalendar, CalendarEvent } from '@/contexts/CalendarContext';
import { cn } from '@/lib/utils';

const meetingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start: z.date(),
  end: z.date(),
  location: z.string().optional(),
  createMeetLink: z.boolean().default(false),
  attendees: z.array(z.object({
    email: z.string().email('Invalid email'),
    displayName: z.string().optional(),
    optional: z.boolean().default(false),
  })).default([]),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

interface MeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  selectedDate?: Date | null;
}

export const MeetingDialog: React.FC<MeetingDialogProps> = ({
  open,
  onOpenChange,
  event,
  selectedDate,
}) => {
  const { createEvent, updateEvent } = useCalendar();
  const [startDateOpen, setStartDateOpen] = React.useState(false);
  const [endDateOpen, setEndDateOpen] = React.useState(false);
  const [newAttendee, setNewAttendee] = React.useState({ email: '', displayName: '', optional: false });

  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: '',
      description: '',
      start: new Date(),
      end: addHours(new Date(), 1),
      location: '',
      createMeetLink: false,
      attendees: [],
    },
  });

  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        description: event.description || '',
        start: new Date(event.start),
        end: new Date(event.end),
        location: event.location || '',
        createMeetLink: !!event.meetLink,
        attendees: event.attendees || [],
      });
    } else {
      const startDate = selectedDate || new Date();
      const endDate = addHours(startDate, 1);
      form.reset({
        title: '',
        description: '',
        start: startDate,
        end: endDate,
        location: '',
        createMeetLink: false,
        attendees: [],
      });
    }
  }, [event, form, selectedDate]);

  const onSubmit = async (data: MeetingFormData) => {
    try {
      if (event) {
        await updateEvent(event.id, {
          ...data,
          start: data.start.toISOString(),
          end: data.end.toISOString(),
        });
      } else {
        await createEvent({
          ...data,
          start: data.start.toISOString(),
          end: data.end.toISOString(),
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save meeting:', error);
    }
  };

  const addAttendee = () => {
    if (newAttendee.email) {
      const currentAttendees = form.getValues('attendees');
      form.setValue('attendees', [...currentAttendees, newAttendee]);
      setNewAttendee({ email: '', displayName: '', optional: false });
    }
  };

  const removeAttendee = (index: number) => {
    const currentAttendees = form.getValues('attendees');
    form.setValue('attendees', currentAttendees.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Edit Meeting' : 'Create New Meeting'}
          </DialogTitle>
          <DialogDescription>
            {event ? 'Update meeting details below.' : 'Fill in the details to create a new meeting.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="Meeting title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Meeting description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date & Time</Label>
              <div className="flex gap-2">
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch('start') && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {form.watch('start') ? format(form.watch('start'), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={form.watch('start')}
                      onSelect={(date) => {
                        form.setValue('start', date || new Date());
                        setStartDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={format(form.watch('start'), 'HH:mm')}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':');
                    const date = new Date(form.watch('start'));
                    date.setHours(parseInt(hours), parseInt(minutes));
                    form.setValue('start', date);
                  }}
                  className="w-32"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>End Date & Time</Label>
              <div className="flex gap-2">
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch('end') && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {form.watch('end') ? format(form.watch('end'), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={form.watch('end')}
                      onSelect={(date) => {
                        form.setValue('end', date || new Date());
                        setEndDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={format(form.watch('end'), 'HH:mm')}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':');
                    const date = new Date(form.watch('end'));
                    date.setHours(parseInt(hours), parseInt(minutes));
                    form.setValue('end', date);
                  }}
                  className="w-36"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                {...form.register('location')}
                placeholder="Meeting location or address"
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="createMeetLink"
              checked={form.watch('createMeetLink')}
              onCheckedChange={(checked) => form.setValue('createMeetLink', checked as boolean)}
            />
            <Label htmlFor="createMeetLink" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Create Google Meet link
            </Label>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Attendees
            </Label>
            <div className="space-y-2">
              {form.watch('attendees').map((attendee, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{attendee.displayName || attendee.email}</p>
                    <p className="text-xs text-muted-foreground">{attendee.email}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttendee(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Email"
                  value={newAttendee.email}
                  onChange={(e) => setNewAttendee({ ...newAttendee, email: e.target.value })}
                />
                <Input
                  placeholder="Name (optional)"
                  value={newAttendee.displayName}
                  onChange={(e) => setNewAttendee({ ...newAttendee, displayName: e.target.value })}
                />
                <Button type="button" onClick={addAttendee}>
                  Add
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : event ? 'Update Meeting' : 'Create Meeting'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
