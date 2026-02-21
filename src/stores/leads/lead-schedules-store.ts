// Lead Schedules Store - Manages scheduled appointments for leads
// Structure compatible with Google Calendar API for future integration

export type ScheduleType = 'agenda_marcada' | 'visita' | 'reuniao' | 'retorno' | 'outro';
export type ScheduleStatus = 'confirmed' | 'tentative' | 'cancelled';
export type ReminderMethod = 'email' | 'popup' | 'sms';

// Google Calendar compatible reminder structure
export interface ScheduleReminder {
  method: ReminderMethod;
  minutes: number; // Minutes before the event
}

// Google Calendar compatible attendee structure
export interface ScheduleAttendee {
  email?: string;
  displayName: string;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  organizer?: boolean;
  self?: boolean;
}

// Google Calendar compatible recurrence rule
export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number; // e.g., every 2 weeks
  until?: Date;
  count?: number; // Number of occurrences
  byDay?: string[]; // e.g., ['MO', 'WE', 'FR']
}

// Main schedule interface - Google Calendar API compatible
export interface LeadSchedule {
  // Internal identifiers
  id: string;
  leadId: string;
  leadName: string;
  leadOrigin?: string;
  sellerId: string;
  sellerName: string;

  // Google Calendar compatible fields
  summary: string; // Event title (mapped from description)
  description: string; // Detailed description

  // DateTime fields (Google Calendar uses ISO 8601)
  scheduledAt: Date; // Start time
  endAt?: Date; // End time (Google Calendar requires this)
  timeZone?: string; // IANA timezone (e.g., 'America/Sao_Paulo')

  // Location (Google Calendar supports address or virtual meeting)
  location?: string;
  conferenceLink?: string; // Google Meet, Zoom, etc.

  // Status and visibility
  status: ScheduleStatus;
  visibility?: 'default' | 'public' | 'private' | 'confidential';

  // Attendees (for sync with Google Calendar)
  attendees?: ScheduleAttendee[];

  // Reminders
  reminders?: ScheduleReminder[];
  useDefaultReminders?: boolean;

  // Recurrence (for recurring events)
  recurrence?: RecurrenceRule;
  recurringEventId?: string; // Parent event ID for recurring instances

  // Custom SALT fields
  scheduleType: ScheduleType;
  createdAt: Date;
  updatedAt?: Date;
  completed: boolean;
  completedAt?: Date;

  // Google Calendar sync metadata
  googleCalendarEventId?: string; // ID from Google Calendar API
  googleCalendarLink?: string; // Link to view in Google Calendar
  lastSyncedAt?: Date;
  syncStatus?: 'pending' | 'synced' | 'error';
  syncError?: string;

  // Webhook/Integration metadata
  externalId?: string; // ID from external system (n8n, etc.)
  webhookPayload?: Record<string, unknown>; // Last webhook data
}

// Helper to create Google Calendar API event payload
export function toGoogleCalendarEvent(schedule: LeadSchedule): Record<string, unknown> {
  const event: Record<string, unknown> = {
    summary: schedule.summary || `Agenda: ${schedule.leadName}`,
    description: [
      schedule.description,
      `Lead: ${schedule.leadName}`,
      schedule.leadOrigin ? `Origem: ${schedule.leadOrigin}` : null,
      `Vendedor: ${schedule.sellerName}`,
      `Tipo: ${formatScheduleType(schedule.scheduleType)}`,
    ].filter(Boolean).join('\n'),
    start: {
      dateTime: schedule.scheduledAt.toISOString(),
      timeZone: schedule.timeZone || 'America/Sao_Paulo',
    },
    end: {
      dateTime: (schedule.endAt || new Date(schedule.scheduledAt.getTime() + 60 * 60 * 1000)).toISOString(),
      timeZone: schedule.timeZone || 'America/Sao_Paulo',
    },
    status: schedule.status,
  };

  if (schedule.location) {
    event.location = schedule.location;
  }

  if (schedule.conferenceLink) {
    event.conferenceData = {
      entryPoints: [{ entryPointType: 'video', uri: schedule.conferenceLink }],
    };
  }

  if (schedule.attendees?.length) {
    event.attendees = schedule.attendees.map(a => ({
      email: a.email,
      displayName: a.displayName,
      responseStatus: a.responseStatus || 'needsAction',
    }));
  }

  if (schedule.reminders?.length) {
    event.reminders = {
      useDefault: false,
      overrides: schedule.reminders.map(r => ({
        method: r.method,
        minutes: r.minutes,
      })),
    };
  } else if (schedule.useDefaultReminders !== false) {
    event.reminders = { useDefault: true };
  }

  if (schedule.recurrence) {
    const rule = schedule.recurrence;
    let rrule = `RRULE:FREQ=${rule.frequency.toUpperCase()}`;
    if (rule.interval) rrule += `;INTERVAL=${rule.interval}`;
    if (rule.count) rrule += `;COUNT=${rule.count}`;
    if (rule.until) rrule += `;UNTIL=${rule.until.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
    if (rule.byDay?.length) rrule += `;BYDAY=${rule.byDay.join(',')}`;
    event.recurrence = [rrule];
  }

  return event;
}

// Helper to parse Google Calendar API event to LeadSchedule
export function fromGoogleCalendarEvent(
  event: Record<string, unknown>,
  leadId: string,
  leadName: string,
  sellerId: string,
  sellerName: string
): Partial<LeadSchedule> {
  const start = event.start as Record<string, string> | undefined;
  const end = event.end as Record<string, string> | undefined;

  return {
    googleCalendarEventId: event.id as string,
    googleCalendarLink: event.htmlLink as string,
    summary: event.summary as string || '',
    description: event.description as string || '',
    scheduledAt: new Date(start?.dateTime || start?.date || ''),
    endAt: end ? new Date(end.dateTime || end.date || '') : undefined,
    timeZone: start?.timeZone,
    location: event.location as string,
    status: (event.status as ScheduleStatus) || 'confirmed',
    attendees: (event.attendees as ScheduleAttendee[]) || [],
    lastSyncedAt: new Date(),
    syncStatus: 'synced',
    leadId,
    leadName,
    sellerId,
    sellerName,
  };
}

// Webhook payload structure for n8n integration
export interface ScheduleWebhookPayload {
  event: 'schedule.created' | 'schedule.updated' | 'schedule.deleted' | 'schedule.completed';
  timestamp: string;
  schedule: LeadSchedule;
  googleCalendarEvent?: Record<string, unknown>;
  metadata?: {
    triggeredBy: string;
    tenantId?: string;
    source: 'salt' | 'google_calendar' | 'n8n';
  };
}

// Mock schedules store with enhanced data
let schedules: LeadSchedule[] = [];

let subscribers: (() => void)[] = [];

const notifySubscribers = () => {
  subscribers.forEach(fn => fn());
};

export const leadSchedulesStore = {
  // Get all schedules
  getSchedules: (): LeadSchedule[] => [...schedules],

  // Get future schedules for a seller
  getFutureSchedulesForSeller: (sellerName: string): LeadSchedule[] => {
    const now = new Date();
    return schedules
      .filter(s => s.sellerName === sellerName && !s.completed && s.status !== 'cancelled' && new Date(s.scheduledAt) > now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  },

  // Get all future schedules (for admin/manager view)
  getAllFutureSchedules: (): LeadSchedule[] => {
    const now = new Date();
    return schedules
      .filter(s => !s.completed && s.status !== 'cancelled' && new Date(s.scheduledAt) > now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  },

  // Get schedule for a specific lead
  getScheduleForLead: (leadId: string): LeadSchedule | undefined => {
    const now = new Date();
    return schedules.find(s => s.leadId === leadId && !s.completed && s.status !== 'cancelled' && new Date(s.scheduledAt) > now);
  },

  // Check if a lead has an active schedule
  hasActiveSchedule: (leadId: string): boolean => {
    const now = new Date();
    return schedules.some(s => s.leadId === leadId && !s.completed && s.status !== 'cancelled' && new Date(s.scheduledAt) > now);
  },

  // Create a new schedule
  createSchedule: (data: Omit<LeadSchedule, 'id' | 'createdAt' | 'completed' | 'status'>): LeadSchedule => {
    const schedule: LeadSchedule = {
      ...data,
      id: `sched_${Date.now()}`,
      summary: data.summary || `Agenda: ${data.leadName}`,
      endAt: data.endAt || new Date(new Date(data.scheduledAt).getTime() + 60 * 60 * 1000),
      timeZone: data.timeZone || 'America/Sao_Paulo',
      status: 'confirmed',
      createdAt: new Date(),
      completed: false,
      syncStatus: 'pending',
    };
    schedules.push(schedule);
    notifySubscribers();
    return schedule;
  },

  // Update an existing schedule
  updateSchedule: (scheduleId: string, data: Partial<Omit<LeadSchedule, 'id' | 'createdAt'>>): boolean => {
    const index = schedules.findIndex(s => s.id === scheduleId);
    if (index !== -1) {
      schedules[index] = {
        ...schedules[index],
        ...data,
        updatedAt: new Date(),
        syncStatus: 'pending',
      };
      notifySubscribers();
      return true;
    }
    return false;
  },

  // Update or create schedule for a lead
  upsertScheduleForLead: (leadId: string, data: Omit<LeadSchedule, 'id' | 'createdAt' | 'completed' | 'status'>): LeadSchedule => {
    const existing = schedules.find(s => s.leadId === leadId && !s.completed && s.status !== 'cancelled');
    if (existing) {
      Object.assign(existing, data, { updatedAt: new Date(), syncStatus: 'pending' });
      notifySubscribers();
      return existing;
    }
    return leadSchedulesStore.createSchedule(data);
  },

  // Mark schedule as completed
  completeSchedule: (scheduleId: string): boolean => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule && !schedule.completed) {
      schedule.completed = true;
      schedule.completedAt = new Date();
      schedule.updatedAt = new Date();
      schedule.syncStatus = 'pending';
      notifySubscribers();
      return true;
    }
    return false;
  },

  // Cancel schedule (Google Calendar compatible)
  cancelSchedule: (scheduleId: string): boolean => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule && schedule.status !== 'cancelled') {
      schedule.status = 'cancelled';
      schedule.updatedAt = new Date();
      schedule.syncStatus = 'pending';
      notifySubscribers();
      return true;
    }
    return false;
  },

  // Delete a schedule
  deleteSchedule: (scheduleId: string): boolean => {
    const index = schedules.findIndex(s => s.id === scheduleId);
    if (index !== -1) {
      schedules.splice(index, 1);
      notifySubscribers();
      return true;
    }
    return false;
  },

  // Update sync status (for Google Calendar integration)
  updateSyncStatus: (scheduleId: string, googleEventId: string, googleLink?: string): boolean => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      schedule.googleCalendarEventId = googleEventId;
      schedule.googleCalendarLink = googleLink;
      schedule.lastSyncedAt = new Date();
      schedule.syncStatus = 'synced';
      schedule.syncError = undefined;
      notifySubscribers();
      return true;
    }
    return false;
  },

  // Mark sync error
  markSyncError: (scheduleId: string, error: string): boolean => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      schedule.syncStatus = 'error';
      schedule.syncError = error;
      notifySubscribers();
      return true;
    }
    return false;
  },

  // Get pending sync schedules
  getPendingSyncSchedules: (): LeadSchedule[] => {
    return schedules.filter(s => s.syncStatus === 'pending');
  },

  // Subscribe to changes
  subscribe: (fn: () => void) => {
    subscribers.push(fn);
    return () => {
      subscribers = subscribers.filter(s => s !== fn);
    };
  },
};

// Hook for React components
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserRole } from '@/hooks/useUserRole';

export function useLeadSchedules() {
  const [, forceUpdate] = useState({});
  const { userName, role } = useUserRole();

  useEffect(() => {
    const unsubscribe = leadSchedulesStore.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  // Get schedules based on role
  const schedules = useMemo(() => {
    if (role === 'TENANT_ADMIN' || role === 'TENANT_GERENTE') {
      return leadSchedulesStore.getAllFutureSchedules();
    }
    return leadSchedulesStore.getFutureSchedulesForSeller(userName);
  }, [role, userName]);

  // Get schedule count for badge
  const scheduleCount = schedules.length;

  // Get schedule for a specific lead
  const getScheduleForLead = useCallback((leadId: string) => {
    return leadSchedulesStore.getScheduleForLead(leadId);
  }, []);

  // Create a schedule
  const createSchedule = useCallback((data: Omit<LeadSchedule, 'id' | 'createdAt' | 'completed' | 'status'>) => {
    return leadSchedulesStore.createSchedule(data);
  }, []);

  // Upsert schedule for a lead
  const upsertScheduleForLead = useCallback((leadId: string, data: Omit<LeadSchedule, 'id' | 'createdAt' | 'completed' | 'status'>) => {
    return leadSchedulesStore.upsertScheduleForLead(leadId, data);
  }, []);

  // Complete a schedule
  const completeSchedule = useCallback((scheduleId: string) => {
    return leadSchedulesStore.completeSchedule(scheduleId);
  }, []);

  // Cancel a schedule
  const cancelSchedule = useCallback((scheduleId: string) => {
    return leadSchedulesStore.cancelSchedule(scheduleId);
  }, []);

  // Delete a schedule
  const deleteSchedule = useCallback((scheduleId: string) => {
    return leadSchedulesStore.deleteSchedule(scheduleId);
  }, []);

  // Check if lead has active schedule
  const hasActiveSchedule = useCallback((leadId: string) => {
    return leadSchedulesStore.hasActiveSchedule(leadId);
  }, []);

  // Check for schedule conflicts (same seller, overlapping time)
  const hasScheduleConflict = useCallback((scheduledAt: Date, excludeScheduleId?: string) => {
    const targetTime = new Date(scheduledAt).getTime();
    // Consider a 30-minute window for conflicts
    const windowMs = 30 * 60 * 1000;

    return schedules.some(schedule => {
      if (excludeScheduleId && schedule.id === excludeScheduleId) return false;
      const scheduleTime = new Date(schedule.scheduledAt).getTime();
      return Math.abs(scheduleTime - targetTime) < windowMs;
    });
  }, [schedules]);

  // Get Google Calendar event payload
  const getGoogleCalendarPayload = useCallback((scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    return schedule ? toGoogleCalendarEvent(schedule) : null;
  }, [schedules]);

  // Get pending sync schedules
  const pendingSyncSchedules = useMemo(() => {
    return leadSchedulesStore.getPendingSyncSchedules();
  }, [schedules]);

  return {
    schedules,
    scheduleCount,
    getScheduleForLead,
    createSchedule,
    upsertScheduleForLead,
    completeSchedule,
    cancelSchedule,
    deleteSchedule,
    hasActiveSchedule,
    hasScheduleConflict,
    getGoogleCalendarPayload,
    pendingSyncSchedules,
  };
}

// Format schedule type for display
export function formatScheduleType(type: ScheduleType): string {
  const labels: Record<ScheduleType, string> = {
    agenda_marcada: 'Agenda Marcada',
    visita: 'Visita',
    reuniao: 'Reunião',
    retorno: 'Retorno',
    outro: 'Outro',
  };
  return labels[type] || type;
}
