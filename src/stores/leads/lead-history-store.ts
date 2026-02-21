// Lead History Store - Mockado para integração futura com Supabase

export type HistoryEventType =
  | 'observation'
  | 'schedule_created'
  | 'schedule_completed'
  | 'schedule_cancelled'
  | 'status_change'
  | 'temperature_change'
  | 'transfer'
  | 'sale_registered'
  | 'contact_attempt'
  | 'message_sent';

export interface LeadHistoryEvent {
  id: string;
  leadId: string;
  type: HistoryEventType;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
}

export interface LeadProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  document?: string; // CPF/CNPJ
  origin: string;
  reference?: string;
  address?: {
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  createdAt: Date;
  convertedToClientAt?: Date;
  isClient: boolean;
}

// Mock data
const mockHistoryEvents: LeadHistoryEvent[] = [];

const mockLeadProfiles: LeadProfile[] = [];

let historyEvents = [...mockHistoryEvents];
let leadProfiles = [...mockLeadProfiles];
let listeners: (() => void)[] = [];

const notifyListeners = () => {
  listeners.forEach(fn => fn());
};

export const leadHistoryStore = {
  // Get all history events for a lead
  getHistoryForLead(leadId: string): LeadHistoryEvent[] {
    return historyEvents
      .filter(event => event.leadId === leadId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  // Get lead profile
  getLeadProfile(leadId: string): LeadProfile | undefined {
    return leadProfiles.find(p => p.id === leadId);
  },

  // Add observation
  addObservation(leadId: string, description: string, createdBy: string): LeadHistoryEvent {
    const event: LeadHistoryEvent = {
      id: `hist-${Date.now()}`,
      leadId,
      type: 'observation',
      title: 'Observação adicionada',
      description,
      createdBy,
      createdAt: new Date(),
    };
    historyEvents.push(event);
    notifyListeners();
    return event;
  },

  // Add schedule event
  addScheduleEvent(
    leadId: string,
    type: 'schedule_created' | 'schedule_completed' | 'schedule_cancelled',
    description: string,
    metadata: Record<string, any>,
    createdBy: string
  ): LeadHistoryEvent {
    const titles = {
      schedule_created: 'Agendamento criado',
      schedule_completed: 'Agendamento concluído',
      schedule_cancelled: 'Agendamento cancelado',
    };

    const event: LeadHistoryEvent = {
      id: `hist-${Date.now()}`,
      leadId,
      type,
      title: titles[type],
      description,
      metadata,
      createdBy,
      createdAt: new Date(),
    };
    historyEvents.push(event);
    notifyListeners();
    return event;
  },

  // Add status change
  addStatusChange(leadId: string, fromStatus: string, toStatus: string, createdBy: string): LeadHistoryEvent {
    const event: LeadHistoryEvent = {
      id: `hist-${Date.now()}`,
      leadId,
      type: 'status_change',
      title: 'Status alterado',
      description: `Status alterado de "${fromStatus}" para "${toStatus}"`,
      metadata: { from: fromStatus, to: toStatus },
      createdBy,
      createdAt: new Date(),
    };
    historyEvents.push(event);
    notifyListeners();
    return event;
  },

  // Add temperature change
  addTemperatureChange(leadId: string, fromTemp: string, toTemp: string, createdBy: string): LeadHistoryEvent {
    const event: LeadHistoryEvent = {
      id: `hist-${Date.now()}`,
      leadId,
      type: 'temperature_change',
      title: 'Temperatura alterada',
      description: `Lead aquecido de "${fromTemp}" para "${toTemp}"`,
      metadata: { from: fromTemp, to: toTemp },
      createdBy,
      createdAt: new Date(),
    };
    historyEvents.push(event);
    notifyListeners();
    return event;
  },

  // Add contact attempt
  addContactAttempt(leadId: string, description: string, createdBy: string): LeadHistoryEvent {
    const event: LeadHistoryEvent = {
      id: `hist-${Date.now()}`,
      leadId,
      type: 'contact_attempt',
      title: 'Tentativa de contato',
      description,
      createdBy,
      createdAt: new Date(),
    };
    historyEvents.push(event);
    notifyListeners();
    return event;
  },

  // Add message sent
  addMessageSent(leadId: string, description: string, createdBy: string): LeadHistoryEvent {
    const event: LeadHistoryEvent = {
      id: `hist-${Date.now()}`,
      leadId,
      type: 'message_sent',
      title: 'Mensagem enviada',
      description,
      createdBy,
      createdAt: new Date(),
    };
    historyEvents.push(event);
    notifyListeners();
    return event;
  },

  // Add transfer event
  addTransfer(leadId: string, fromSeller: string, toSeller: string, createdBy: string): LeadHistoryEvent {
    const event: LeadHistoryEvent = {
      id: `hist-${Date.now()}`,
      leadId,
      type: 'transfer',
      title: 'Lead transferido',
      description: `Transferido de ${fromSeller} para ${toSeller}`,
      metadata: { from: fromSeller, to: toSeller },
      createdBy,
      createdAt: new Date(),
    };
    historyEvents.push(event);
    notifyListeners();
    return event;
  },

  // Register sale
  addSaleRegistered(leadId: string, saleData: Record<string, any>, createdBy: string): LeadHistoryEvent {
    const event: LeadHistoryEvent = {
      id: `hist-${Date.now()}`,
      leadId,
      type: 'sale_registered',
      title: 'Venda registrada',
      description: `Venda no valor de ${saleData.value || 'N/A'} registrada`,
      metadata: saleData,
      createdBy,
      createdAt: new Date(),
    };
    historyEvents.push(event);

    // Mark lead as client
    const profile = leadProfiles.find(p => p.id === leadId);
    if (profile) {
      profile.isClient = true;
      profile.convertedToClientAt = new Date();
    }

    notifyListeners();
    return event;
  },

  // Update lead profile
  updateLeadProfile(leadId: string, data: Partial<LeadProfile>): LeadProfile | undefined {
    const index = leadProfiles.findIndex(p => p.id === leadId);
    if (index >= 0) {
      leadProfiles[index] = { ...leadProfiles[index], ...data };
      notifyListeners();
      return leadProfiles[index];
    }

    // Create new profile if doesn't exist
    const newProfile: LeadProfile = {
      id: leadId,
      name: data.name || 'Lead',
      phone: data.phone || '',
      origin: data.origin || 'Desconhecido',
      createdAt: new Date(),
      isClient: false,
      ...data,
    };
    leadProfiles.push(newProfile);
    notifyListeners();
    return newProfile;
  },

  // Get history count for a lead
  getHistoryCount(leadId: string): number {
    return historyEvents.filter(e => e.leadId === leadId).length;
  },

  // Subscribe to changes
  subscribe(fn: () => void): () => void {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  },
};

// React hook
import { useState, useEffect } from 'react';

export function useLeadHistory(leadId?: string) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = leadHistoryStore.subscribe(() => setTick(t => t + 1));
    return unsub;
  }, []);

  return {
    history: leadId ? leadHistoryStore.getHistoryForLead(leadId) : [],
    profile: leadId ? leadHistoryStore.getLeadProfile(leadId) : undefined,
    historyCount: leadId ? leadHistoryStore.getHistoryCount(leadId) : 0,
    addObservation: (description: string, createdBy: string) =>
      leadId ? leadHistoryStore.addObservation(leadId, description, createdBy) : undefined,
    addScheduleEvent: leadHistoryStore.addScheduleEvent,
    addStatusChange: (from: string, to: string, createdBy: string) =>
      leadId ? leadHistoryStore.addStatusChange(leadId, from, to, createdBy) : undefined,
    addTemperatureChange: (from: string, to: string, createdBy: string) =>
      leadId ? leadHistoryStore.addTemperatureChange(leadId, from, to, createdBy) : undefined,
    addContactAttempt: (description: string, createdBy: string) =>
      leadId ? leadHistoryStore.addContactAttempt(leadId, description, createdBy) : undefined,
    addMessageSent: (description: string, createdBy: string) =>
      leadId ? leadHistoryStore.addMessageSent(leadId, description, createdBy) : undefined,
    addTransfer: (from: string, to: string, createdBy: string) =>
      leadId ? leadHistoryStore.addTransfer(leadId, from, to, createdBy) : undefined,
    addSaleRegistered: (saleData: Record<string, any>, createdBy: string) =>
      leadId ? leadHistoryStore.addSaleRegistered(leadId, saleData, createdBy) : undefined,
    updateProfile: (data: Partial<LeadProfile>) =>
      leadId ? leadHistoryStore.updateLeadProfile(leadId, data) : undefined,
  };
}

// Format event type for display
export function formatHistoryEventType(type: HistoryEventType): string {
  const labels: Record<HistoryEventType, string> = {
    observation: 'Observação',
    schedule_created: 'Agendamento',
    schedule_completed: 'Agendamento Concluído',
    schedule_cancelled: 'Agendamento Cancelado',
    status_change: 'Mudança de Status',
    temperature_change: 'Temperatura',
    transfer: 'Transferência',
    sale_registered: 'Venda',
    contact_attempt: 'Contato',
    message_sent: 'Mensagem',
  };
  return labels[type] || type;
}

// Get icon color for event type
export function getHistoryEventColor(type: HistoryEventType): string {
  const colors: Record<HistoryEventType, string> = {
    observation: 'text-blue-500',
    schedule_created: 'text-success',
    schedule_completed: 'text-emerald-600',
    schedule_cancelled: 'text-destructive',
    status_change: 'text-amber-500',
    temperature_change: 'text-orange-500',
    transfer: 'text-purple-500',
    sale_registered: 'text-success',
    contact_attempt: 'text-sky-500',
    message_sent: 'text-teal-500',
  };
  return colors[type] || 'text-muted-foreground';
}
