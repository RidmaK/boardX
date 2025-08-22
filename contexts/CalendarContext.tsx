'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type CalendarConnection = 'google' | null;

export interface CalendarEventAttendee {
  email: string;
  displayName?: string;
  optional?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO datetime
  end: string;   // ISO datetime
  location?: string;
  meetLink?: string;
  attendees?: CalendarEventAttendee[];
}

interface CalendarContextType {
  isConnected: boolean;
  provider: CalendarConnection;
  isLoading: boolean;
  events: CalendarEvent[];
  connectGoogle: () => Promise<void>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
  createEvent: (data: Omit<CalendarEvent, 'id'> & { createMeetLink?: boolean }) => Promise<CalendarEvent>;
  updateEvent: (id: string, data: Partial<Omit<CalendarEvent, 'id'>>) => Promise<CalendarEvent>;
  deleteEvent: (id: string) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const LOCAL_KEY = 'local-calendar-events';

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }: any) => {
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<CalendarConnection>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const loadLocal = useCallback(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setEvents(JSON.parse(raw));
    } catch {}
  }, []);

  const saveLocal = useCallback((data: CalendarEvent[]) => {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch {}
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetch('/api/google/events', { cache: 'no-store' });
      if (data.status === 401 || data.status === 403) {
        setIsConnected(false);
        setProvider(null);
        loadLocal();
        return;
      }
      if (data.status >= 500) {
        loadLocal();
        return;
      }
      const json = await data.json();
      setEvents(json.events || []);
      setIsConnected(true);
      setProvider('google');
    } catch {
      loadLocal();
    } finally {
      setIsLoading(false);
    }
  }, [loadLocal]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isConnected) {
      saveLocal(events);
    }
  }, [events, isConnected, saveLocal]);

  const connectGoogle = useCallback(async () => {
    const res = await fetchJson('/api/google/oauth/url');
    if (res?.url) {
      window.location.href = res.url;
    }
  }, []);

  const disconnect = useCallback(async () => {
    await fetch('/api/google/disconnect', { method: 'POST' });
    setIsConnected(false);
    setProvider(null);
    loadLocal();
  }, [loadLocal]);

  const createEvent = useCallback<CalendarContextType['createEvent']>(async (data) => {
    if (isConnected && provider === 'google') {
      const created = await fetchJson('/api/google/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      await refresh();
      return created.event;
    }
    const newEvent: CalendarEvent = { id: generateId(), ...data };
    setEvents(prev => {
      const next = [...prev, newEvent];
      return next;
    });
    return newEvent;
  }, [isConnected, provider, refresh]);

  const updateEvent = useCallback<CalendarContextType['updateEvent']>(async (id, data) => {
    if (isConnected && provider === 'google') {
      const updated = await fetchJson(`/api/google/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      await refresh();
      return updated.event;
    }
    let updatedEvent: CalendarEvent | undefined;
    setEvents(prev => {
      const next = prev.map(e => e.id === id ? (updatedEvent = { ...e, ...data })! : e);
      return next;
    });
    if (!updatedEvent) throw new Error('Event not found');
    return updatedEvent;
  }, [isConnected, provider, refresh]);

  const deleteEvent = useCallback<CalendarContextType['deleteEvent']>(async (id) => {
    if (isConnected && provider === 'google') {
      await fetchJson(`/api/google/events/${id}`, { method: 'DELETE' });
      await refresh();
      return;
    }
    setEvents(prev => prev.filter(e => e.id !== id));
  }, [isConnected, provider, refresh]);

  const value = useMemo<CalendarContextType>(() => ({
    isConnected,
    provider,
    isLoading,
    events,
    connectGoogle,
    disconnect,
    refresh,
    createEvent,
    updateEvent,
    deleteEvent,
  }), [isConnected, provider, isLoading, events, connectGoogle, disconnect, refresh, createEvent, updateEvent, deleteEvent]);

  return (
    <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error('useCalendar must be used within CalendarProvider');
  return ctx;
};


