// ==========================================
// SISTEMA DE PÓS-VENDA COM IA (365 dias)
// ==========================================

import { useState, useEffect } from 'react';

export type MessageChannel = 'whatsapp' | 'email' | 'sms';
export type TemplateStatus = 'active' | 'inactive';

export interface PostSaleTemplate {
  id: string;
  name: string;
  dayOffset: number; // Dias após a venda (D+X)
  channel: MessageChannel;
  content: string;
  useAI: boolean;
  aiPrompt?: string;
  status: TemplateStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PostSaleMessage {
  id: string;
  templateId: string;
  journeyId: string;
  clientId: string;
  clientName: string;
  channel: MessageChannel;
  content: string;
  wasAIGenerated: boolean;
  scheduledFor: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  response?: string;
  respondedAt?: string;
}

export interface PostSaleJourney {
  id: string;
  saleId: string;
  clientId: string;
  clientName: string;
  productSold: string;
  saleDate: string;
  startedAt: string;
  completedAt?: string;
  status: 'active' | 'completed' | 'cancelled';
  messagesTotal: number;
  messagesSent: number;
}

// Mock templates padrão
const defaultTemplates: PostSaleTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Boas-vindas (D+1)',
    dayOffset: 1,
    channel: 'whatsapp',
    content: 'Olá {nome}! 👋 Obrigado por escolher a {empresa}. Esperamos que esteja aproveitando seu {produto}. Qualquer dúvida, estamos à disposição!',
    useAI: false,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-2',
    name: 'Check-in inicial (D+7)',
    dayOffset: 7,
    channel: 'whatsapp',
    content: 'Oi {nome}! Tudo bem? 🙂 Já faz uma semana que você está com seu {produto}. Como está sendo a experiência? Posso ajudar em algo?',
    useAI: true,
    aiPrompt: 'Gere uma mensagem personalizada de check-in para o cliente, considerando o produto adquirido e demonstrando interesse genuíno pela experiência.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-3',
    name: 'Primeira avaliação (D+15)',
    dayOffset: 15,
    channel: 'whatsapp',
    content: 'Olá {nome}! 📊 Gostaríamos de saber como está sua experiência com o {produto}. Pode nos dar uma nota de 0 a 10?',
    useAI: false,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-4',
    name: 'Primeira mensalidade (D+30)',
    dayOffset: 30,
    channel: 'email',
    content: 'Prezado(a) {nome}, completamos um mês juntos! 🎉 Esperamos que esteja satisfeito(a) com nossos serviços.',
    useAI: true,
    aiPrompt: 'Crie uma mensagem comemorativa de 1 mês, reforçando o valor entregue e abrindo espaço para feedback.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-5',
    name: 'Segundo mês (D+60)',
    dayOffset: 60,
    channel: 'whatsapp',
    content: 'Oi {nome}! Dois meses utilizando nosso {produto}. Como está a experiência? Precisa de algum suporte?',
    useAI: false,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-6',
    name: 'Trimestre (D+90)',
    dayOffset: 90,
    channel: 'email',
    content: 'Prezado(a) {nome}, três meses de parceria! Gostaríamos de compartilhar alguns insights sobre seu uso do {produto}.',
    useAI: true,
    aiPrompt: 'Gere um resumo personalizado de 3 meses, com insights de uso e sugestões de otimização.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-7',
    name: 'Semestre (D+180)',
    dayOffset: 180,
    channel: 'whatsapp',
    content: 'Olá {nome}! 🎯 Já são 6 meses juntos. Que tal uma conversa rápida para alinharmos próximos passos?',
    useAI: false,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl-8',
    name: 'Aniversário (D+365)',
    dayOffset: 365,
    channel: 'whatsapp',
    content: '🎂 Parabéns, {nome}! Completamos 1 ano de parceria! Obrigado por confiar na {empresa}. Preparamos algo especial para você!',
    useAI: true,
    aiPrompt: 'Crie uma mensagem especial de aniversário de 1 ano, celebrando a jornada do cliente e oferecendo um benefício exclusivo.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock de mensagens já enviadas/agendadas
const mockMessages: PostSaleMessage[] = [
  {
    id: 'msg-1',
    templateId: 'tpl-1',
    journeyId: 'journey-1',
    clientId: 'client-1',
    clientName: 'Lucia Ferreira',
    channel: 'whatsapp',
    content: 'Olá Lucia! 👋 Obrigado por escolher a SALT. Esperamos que esteja aproveitando seu Plano Enterprise. Qualquer dúvida, estamos à disposição!',
    wasAIGenerated: false,
    scheduledFor: new Date(Date.now() - 86400000 * 6).toISOString(),
    sentAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    status: 'sent',
    response: 'Obrigada! Estou adorando!',
    respondedAt: new Date(Date.now() - 86400000 * 5.5).toISOString(),
  },
  {
    id: 'msg-2',
    templateId: 'tpl-2',
    journeyId: 'journey-1',
    clientId: 'client-1',
    clientName: 'Lucia Ferreira',
    channel: 'whatsapp',
    content: 'Oi Lucia! Tudo bem? 🙂 Já faz uma semana que você está com seu Plano Enterprise. A IA identificou que você utilizou principalmente o módulo de dashboards. Como está sendo a experiência? Precisa de ajuda com algum outro recurso?',
    wasAIGenerated: true,
    scheduledFor: new Date().toISOString(),
    status: 'pending',
  },
  {
    id: 'msg-3',
    templateId: 'tpl-1',
    journeyId: 'journey-2',
    clientId: 'client-2',
    clientName: 'Fernanda Lima',
    channel: 'whatsapp',
    content: 'Olá Fernanda! 👋 Obrigado por escolher a SALT. Esperamos que esteja aproveitando seu Plano Básico. Qualquer dúvida, estamos à disposição!',
    wasAIGenerated: false,
    scheduledFor: new Date(Date.now() - 86400000 * 47).toISOString(),
    sentAt: new Date(Date.now() - 86400000 * 47).toISOString(),
    status: 'sent',
  },
];

// Mock de jornadas ativas
const mockJourneys: PostSaleJourney[] = [
  {
    id: 'journey-1',
    saleId: 'sale-1',
    clientId: 'client-1',
    clientName: 'Lucia Ferreira',
    productSold: 'Plano Enterprise',
    saleDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    startedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    status: 'active',
    messagesTotal: 8,
    messagesSent: 1,
  },
  {
    id: 'journey-2',
    saleId: 'sale-3',
    clientId: 'client-2',
    clientName: 'Fernanda Lima',
    productSold: 'Plano Básico',
    saleDate: new Date(Date.now() - 86400000 * 48).toISOString(),
    startedAt: new Date(Date.now() - 86400000 * 47).toISOString(),
    status: 'active',
    messagesTotal: 8,
    messagesSent: 2,
  },
];

// Store class
class PostSaleStore {
  private templates: PostSaleTemplate[] = [...defaultTemplates];
  private messages: PostSaleMessage[] = [...mockMessages];
  private journeys: PostSaleJourney[] = [...mockJourneys];
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // Templates
  getTemplates() {
    return this.templates.sort((a, b) => a.dayOffset - b.dayOffset);
  }

  getActiveTemplates() {
    return this.templates.filter(t => t.status === 'active').sort((a, b) => a.dayOffset - b.dayOffset);
  }

  updateTemplate(templateId: string, updates: Partial<PostSaleTemplate>) {
    const index = this.templates.findIndex(t => t.id === templateId);
    if (index !== -1) {
      this.templates[index] = {
        ...this.templates[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.notify();
      return this.templates[index];
    }
    return null;
  }

  toggleTemplateStatus(templateId: string) {
    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      template.status = template.status === 'active' ? 'inactive' : 'active';
      template.updatedAt = new Date().toISOString();
      this.notify();
      return template;
    }
    return null;
  }

  addTemplate(template: Omit<PostSaleTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTemplate: PostSaleTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.templates.push(newTemplate);
    this.notify();
    return newTemplate;
  }

  // Messages
  getMessages() {
    return this.messages;
  }

  getPendingMessages() {
    return this.messages.filter(m => m.status === 'pending');
  }

  getSentMessages() {
    return this.messages.filter(m => m.status === 'sent');
  }

  getMessagesForJourney(journeyId: string) {
    return this.messages.filter(m => m.journeyId === journeyId);
  }

  // Journeys
  getJourneys() {
    return this.journeys;
  }

  getActiveJourneys() {
    return this.journeys.filter(j => j.status === 'active');
  }

  getJourneyById(journeyId: string) {
    return this.journeys.find(j => j.id === journeyId);
  }

  // Stats
  getStats() {
    const activeJourneys = this.journeys.filter(j => j.status === 'active').length;
    const pendingMessages = this.messages.filter(m => m.status === 'pending').length;
    const sentMessages = this.messages.filter(m => m.status === 'sent').length;
    const aiMessages = this.messages.filter(m => m.wasAIGenerated).length;
    const responseRate = sentMessages > 0 
      ? this.messages.filter(m => m.response).length / sentMessages * 100 
      : 0;

    return {
      activeJourneys,
      pendingMessages,
      sentMessages,
      aiMessages,
      responseRate: Math.round(responseRate),
    };
  }
}

export const postSaleStore = new PostSaleStore();

// React Hook
export function usePostSaleStore() {
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    const unsubscribe = postSaleStore.subscribe(() => forceUpdate({}));
    return () => { unsubscribe(); };
  }, []);

  return postSaleStore;
}
