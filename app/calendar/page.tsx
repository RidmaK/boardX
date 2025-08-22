'use client';

import React, { useState, useMemo } from 'react';
import { Clock, MapPin, Users, Plus, ExternalLink, Video, Edit, Trash2, ChevronLeft, ChevronRight, Grid3X3, CalendarDays, Calendar as CalendarIcon } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday, parseISO, startOfDay, endOfDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { CalendarEvent } from '@/contexts/CalendarContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { MeetingDialog } from '@/components/calendar/MeetingDialog';
import { DeleteMeetingDialog } from '@/components/calendar/DeleteMeetingDialog';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const { events, isConnected, connectGoogle, disconnect, isLoading } = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<CalendarEvent | null>(null);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);

  const today = new Date();
  const todayEvents = useMemo(() => 
    events.filter(event => {
      const eventDate = parseISO(event.start);
      return isToday(eventDate);
    }), [events]);

  const upcomingEvents = useMemo(() => 
    events.filter(event => {
      const eventDate = parseISO(event.start);
      return eventDate > today;
    }).sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()), [events]);

  const pastEvents = useMemo(() => 
    events.filter(event => {
      const eventDate = parseISO(event.start);
      return eventDate < startOfDay(today);
    }).sort((a, b) => parseISO(b.start).getTime() - parseISO(a.start).getTime()), [events]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter(event => {
      const eventDate = parseISO(event.start);
      return eventDate >= startOfDay(selectedDate) && eventDate <= endOfDay(selectedDate);
    });
  }, [events, selectedDate]);

  const handleCreateMeeting = (date?: Date) => {
    setEditingEvent(null);
    setClickedDate(date || null);
    setMeetingDialogOpen(true);
  };

  const handleEditMeeting = (event: CalendarEvent) => {
    setEditingEvent(event);
    setClickedDate(null);
    setMeetingDialogOpen(true);
  };

  const handleDeleteMeeting = (event: CalendarEvent) => {
    setDeletingEvent(event);
    setDeleteDialogOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    handleCreateMeeting(date);
  };

  const handlePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === 'day') {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getEventTimeRange = (event: CalendarEvent) => {
    const start = format(parseISO(event.start), 'h:mm a');
    const end = format(parseISO(event.end), 'h:mm a');
    return `${start} - ${end}`;
  };

  const getRelativeDate = (date: string) => {
    const eventDate = parseISO(date);
    if (isToday(eventDate)) return 'Today';
    if (isTomorrow(eventDate)) return 'Tomorrow';
    if (isYesterday(eventDate)) return 'Yesterday';
    return format(eventDate, 'MMM d, yyyy');
  };

  // Get events for a specific day
  const getDayEvents = (day: Date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.start);
      return eventDate >= startOfDay(day) && eventDate <= endOfDay(day);
    });
  };

  // Render month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-3 text-center font-semibold text-sm bg-muted/50">
            {day}
          </div>
        ))}
        
        {/* Days */}
        {days.map((day) => {
          const dayEvents = getDayEvents(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] p-2 border cursor-pointer hover:bg-accent/50 transition-colors ${
                !isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : ''
              } ${isTodayDate ? 'bg-primary/10 border-primary' : ''} ${
                isSelected ? 'bg-primary/20 border-primary' : ''
              }`}
              onClick={() => handleDateClick(day)}
            >
              <div className={`text-sm font-medium mb-1 ${isTodayDate ? 'text-primary' : ''}`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs p-1 bg-primary/10 text-primary rounded cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditMeeting(event);
                    }}
                    title={`${event.title} - ${getEventTimeRange(event)}`}
                  >
                    <div className="truncate font-medium">{event.title}</div>
                    <div className="text-xs opacity-75">{format(parseISO(event.start), 'h:mm a')}</div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="grid grid-cols-8 gap-1">
        {/* Time column */}
        <div className="p-3 text-center font-semibold text-sm bg-muted/50">
          Time
        </div>
        
        {/* Day headers */}
        {days.map((day) => (
          <div key={day.toISOString()} className="p-3 text-center font-semibold text-sm bg-muted/50">
            <div>{format(day, 'EEE')}</div>
            <div className={`text-lg ${isToday(day) ? 'text-primary font-bold' : ''}`}>
              {day.getDate()}
            </div>
          </div>
        ))}

        {/* Time slots */}
        {Array.from({ length: 24 }, (_, hour) => (
          <React.Fragment key={hour}>
            <div className="p-2 text-xs text-muted-foreground border-r border-b">
              {format(new Date().setHours(hour), 'h a')}
            </div>
            {days.map((day) => {
              const dayEvents = getDayEvents(day).filter(event => {
                const eventHour = parseISO(event.start).getHours();
                return eventHour === hour;
              });

              return (
                <div key={`${day.toISOString()}-${hour}`} className="p-1 border-r border-b min-h-[60px]">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 bg-primary/10 text-primary rounded cursor-pointer hover:bg-primary/20 transition-colors mb-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditMeeting(event);
                      }}
                      title={`${event.title} - ${getEventTimeRange(event)}`}
                    >
                      <div className="truncate font-medium">{event.title}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayEvents = getDayEvents(currentDate);

    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
        </div>
        
        <div className="space-y-2">
          {Array.from({ length: 24 }, (_, hour) => {
            const hourEvents = dayEvents.filter(event => {
              const eventHour = parseISO(event.start).getHours();
              return eventHour === hour;
            });

            return (
              <div key={hour} className="flex border-b">
                <div className="w-20 p-2 text-sm text-muted-foreground border-r">
                  {format(new Date().setHours(hour), 'h a')}
                </div>
                <div className="flex-1 p-2 min-h-[60px]">
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-2 bg-primary/10 text-primary rounded cursor-pointer hover:bg-primary/20 transition-colors mb-2"
                      onClick={() => handleEditMeeting(event)}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm opacity-75">{getEventTimeRange(event)}</div>
                      {event.location && (
                        <div className="text-sm opacity-75 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your meetings and events
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isConnected ? (
            <Button onClick={connectGoogle} disabled={isLoading}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Connect Google Calendar
            </Button>
          ) : (
            <Button variant="outline" onClick={disconnect}>
              Disconnect Google Calendar
            </Button>
          )}
          <Button onClick={() => handleCreateMeeting()}>
            <Plus className="mr-2 h-4 w-4" />
            New Meeting
          </Button>
        </div>
      </div>

      {/* Today's Meetings */}
      {todayEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">{getEventTimeRange(event)}</p>
                    {event.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {event.meetLink && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={event.meetLink} target="_blank" rel="noopener noreferrer">
                          <Video className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleEditMeeting(event)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteMeeting(event)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar and Table Views */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Calendar</CardTitle>
                      <CardDescription>
                        Click on any day to schedule a meeting. Click on events to edit them.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToday}
                      >
                        Today
                      </Button>
                    </div>
                  </div>
                  
                  {/* View Mode Tabs */}
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant={viewMode === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('month')}
                    >
                      <Grid3X3 className="h-4 w-4 mr-2" />
                      Month
                    </Button>
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('week')}
                    >
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Week
                    </Button>
                    <Button
                      variant={viewMode === 'day' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('day')}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Day
                    </Button>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    <div className="text-lg font-semibold">
                      {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
                      {viewMode === 'week' && `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`}
                      {viewMode === 'day' && format(currentDate, 'MMMM d, yyyy')}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {viewMode === 'month' && renderMonthView()}
                    {viewMode === 'week' && renderWeekView()}
                    {viewMode === 'day' && renderDayView()}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                                  <CardHeader>
                    <CardTitle>Selected Date</CardTitle>
                    <CardDescription>
                      {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'No date selected'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedDateEvents.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No events on this date</p>
                        <Button onClick={() => handleCreateMeeting(selectedDate)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Schedule Meeting
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedDateEvents.map((event) => (
                          <div key={event.id} className="p-3 border rounded-lg">
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{getEventTimeRange(event)}</p>
                            {event.location && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {event.meetLink && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={event.meetLink} target="_blank" rel="noopener noreferrer">
                                    <Video className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              <Button size="sm" variant="outline" onClick={() => handleEditMeeting(event)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteMeeting(event)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button 
                          onClick={() => handleCreateMeeting(selectedDate)} 
                          variant="outline" 
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Another Meeting
                        </Button>
                      </div>
                    )}
                  </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{getRelativeDate(event.start)}</TableCell>
                      <TableCell>{getEventTimeRange(event)}</TableCell>
                      <TableCell>{event.location || '-'}</TableCell>
                      <TableCell>
                        {event.attendees ? (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{event.attendees.length}</span>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {event.meetLink && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={event.meetLink} target="_blank" rel="noopener noreferrer">
                                <Video className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleEditMeeting(event)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteMeeting(event)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Meeting Dialog */}
      <MeetingDialog
        open={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
        event={editingEvent}
        selectedDate={clickedDate}
      />

      {/* Delete Dialog */}
      <DeleteMeetingDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        event={deletingEvent}
      />
    </div>
  );
}
