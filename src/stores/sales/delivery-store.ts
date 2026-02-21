// ==========================================
// SISTEMA DE ENTREGAS/SERVIÇOS PENDENTES
// ==========================================

import { useState, useEffect } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { SaleStatus } from './sales-store';

export type SaleType = 'produto' | 'servico';
export type DeliveryStatus = 'immediate' | 'scheduled' | 'completed';

export interface PendingDelivery {
  id: string;
  saleId: string;

  // Tipo de venda
  saleType: SaleType;

  // Dados do cliente
  clientName: string;
  clientPhone: string;
  clientEmail?: string;

  // Dados do item vendido
  productName: string;
  productCode?: string;
  saleValue: number;

  // Status da venda (validação gerencial)
  saleStatus: SaleStatus;

  // Status da entrega/serviço
  deliveryStatus: DeliveryStatus;

  // Dados de agendamento (quando scheduled)
  scheduledDate?: Date;
  scheduledShift?: 'manha' | 'tarde' | 'noite' | 'personalizado';
  scheduledTime?: string;
  deliveryContact?: string;

  // Endereço de entrega (para produtos)
  deliveryAddress?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };

  // Hierarquia
  sellerId: string;
  sellerName: string;
  managerId?: string;
  managerName?: string;

  // Timestamps
  saleDate: Date;
  createdAt: Date;
  completedAt?: Date;

  // Observações
  observations?: string;

  tenantId: string;
}

// Função para gerar timestamps dinâmicos
const getRecentDate = (daysAgo: number): Date => {
  const now = new Date();
  now.setDate(now.getDate() - daysAgo);
  return now;
};

const getFutureDate = (daysFromNow: number): Date => {
  const now = new Date();
  now.setDate(now.getDate() + daysFromNow);
  return now;
};

// Mock de entregas pendentes
const mockPendingDeliveries: PendingDelivery[] = [];

// Store de entregas pendentes
class DeliveryStore {
  private deliveries: PendingDelivery[] = [...mockPendingDeliveries];
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  getDeliveries() {
    return this.deliveries;
  }

  // Entregas pendentes para um vendedor específico (somente vendas validadas)
  getPendingForSeller(sellerName: string): PendingDelivery[] {
    return this.deliveries
      .filter(d =>
        d.sellerName === sellerName &&
        d.deliveryStatus === 'scheduled' &&
        d.saleStatus === 'validated'
      )
      .sort((a, b) => {
        if (!a.scheduledDate || !b.scheduledDate) return 0;
        return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      });
  }

  // Todas as entregas pendentes (para gestão - somente vendas validadas)
  getAllPending(): PendingDelivery[] {
    return this.deliveries
      .filter(d => d.deliveryStatus === 'scheduled' && d.saleStatus === 'validated')
      .sort((a, b) => {
        if (!a.scheduledDate || !b.scheduledDate) return 0;
        return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      });
  }

  // Criar nova entrega pendente
  createDelivery(data: Omit<PendingDelivery, 'id' | 'createdAt'>): PendingDelivery {
    const newDelivery: PendingDelivery = {
      ...data,
      id: `del-${Date.now()}`,
      createdAt: new Date(),
    };

    this.deliveries.unshift(newDelivery);
    this.notify();
    return newDelivery;
  }

  // Marcar entrega como concluída
  completeDelivery(deliveryId: string): boolean {
    const index = this.deliveries.findIndex(d => d.id === deliveryId);
    if (index === -1) return false;

    this.deliveries[index] = {
      ...this.deliveries[index],
      deliveryStatus: 'completed',
      completedAt: new Date(),
    };

    this.notify();
    return true;
  }

  // Atualizar entrega
  updateDelivery(deliveryId: string, data: Partial<Omit<PendingDelivery, 'id' | 'createdAt'>>): boolean {
    const index = this.deliveries.findIndex(d => d.id === deliveryId);
    if (index === -1) return false;

    this.deliveries[index] = {
      ...this.deliveries[index],
      ...data,
    };

    this.notify();
    return true;
  }

  // Excluir entrega
  deleteDelivery(deliveryId: string): boolean {
    const index = this.deliveries.findIndex(d => d.id === deliveryId);
    if (index === -1) return false;

    this.deliveries.splice(index, 1);
    this.notify();
    return true;
  }

  // KPIs (somente vendas validadas são contabilizadas)
  getDeliveryKPIs() {
    const pending = this.deliveries.filter(d => d.deliveryStatus === 'scheduled' && d.saleStatus === 'validated');
    const completed = this.deliveries.filter(d => d.deliveryStatus === 'completed');
    const products = pending.filter(d => d.saleType === 'produto');
    const services = pending.filter(d => d.saleType === 'servico');

    // Entregas para hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDeliveries = pending.filter(d => {
      if (!d.scheduledDate) return false;
      const scheduled = new Date(d.scheduledDate);
      scheduled.setHours(0, 0, 0, 0);
      return scheduled.getTime() === today.getTime();
    });

    return {
      totalPending: pending.length,
      totalCompleted: completed.length,
      pendingProducts: products.length,
      pendingServices: services.length,
      todayCount: todayDeliveries.length,
      pendingValue: pending.reduce((acc, d) => acc + d.saleValue, 0),
    };
  }
}

export const deliveryStore = new DeliveryStore();

// Hook React para usar o store
export function usePendingDeliveries() {
  const [, forceUpdate] = useState({});
  const { role, userName } = useUserRole();

  useEffect(() => {
    const unsubscribe = deliveryStore.subscribe(() => forceUpdate({}));
    return () => { unsubscribe(); };
  }, []);

  // Filtra por role
  const isManager = role === 'TENANT_ADMIN' || role === 'TENANT_GERENTE';

  const deliveries = isManager
    ? deliveryStore.getAllPending()
    : deliveryStore.getPendingForSeller(userName || 'João Carlos'); // fallback para mock

  const kpis = deliveryStore.getDeliveryKPIs();

  return {
    deliveries,
    kpis,
    completeDelivery: deliveryStore.completeDelivery.bind(deliveryStore),
    updateDelivery: deliveryStore.updateDelivery.bind(deliveryStore),
    deleteDelivery: deliveryStore.deleteDelivery.bind(deliveryStore),
    createDelivery: deliveryStore.createDelivery.bind(deliveryStore),
  };
}

// Formatador de turno
export function formatShift(shift: PendingDelivery['scheduledShift']): string {
  const shifts: Record<string, string> = {
    manha: 'Manhã',
    tarde: 'Tarde',
    noite: 'Noite',
    personalizado: 'Personalizado',
  };
  return shift ? shifts[shift] || shift : '';
}

// Formatador de tipo de venda
export function formatSaleType(type: SaleType): string {
  return type === 'produto' ? 'Produto' : 'Serviço';
}
