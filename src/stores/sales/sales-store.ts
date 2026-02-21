// ==========================================
// SISTEMA DE VENDAS COM VALIDAÇÃO HIERÁRQUICA
// ==========================================

export type SaleStatus = 'pending_manager' | 'pending_admin' | 'validated' | 'rejected';

export type PaymentMethodType = 'pix' | 'cartao_vista' | 'cartao_parcelado' | 'boleto' | 'transferencia' | 'dinheiro';
export type PaymentConditionType = 'avista' | 'parcelado';

// Dados do cliente na venda
export interface SaleClientData {
  name: string;
  document: string; // CPF ou CNPJ
  documentType: 'cpf' | 'cnpj';
  phone: string;
  email: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface Sale {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;

  // Dados completos do cliente
  client: SaleClientData;

  // Dados da venda
  productSold: string;
  productCode?: string;
  productDescription?: string;
  saleValue: number;
  saleDate: string;
  paymentMethod: PaymentMethodType;
  paymentCondition: PaymentConditionType;
  installments?: number;
  observations?: string;

  // Hierarquia
  agentId: string;
  agentName: string;
  managerId: string;
  managerName: string;

  // Status de validação
  status: SaleStatus;

  // Timestamps
  createdAt: string;
  managerValidatedAt?: string;
  managerRejectedAt?: string;
  managerComment?: string;
  adminViewedAt?: string;

  // Metadados
  tenantId: string;
}

export interface SaleNotification {
  id: string;
  saleId: string;
  type: 'sale_pending_validation' | 'sale_validated' | 'sale_rejected';
  title: string;
  message: string;
  targetRole: 'manager' | 'admin';
  targetUserId?: string;
  read: boolean;
  createdAt: string;
}

// Função para gerar timestamps dinâmicos
const getRecentTimestamp = (hoursAgo: number): string => {
  const now = new Date();
  now.setHours(now.getHours() - hoursAgo);
  return now.toISOString();
};

// Mock de vendas
export const mockSales: Sale[] = [];

// Mock de notificações de vendas
export const mockSaleNotifications: SaleNotification[] = [];

// Store simples com funções de gerenciamento
class SalesStore {
  private sales: Sale[] = [...mockSales];
  private notifications: SaleNotification[] = [...mockSaleNotifications];
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  getSales() {
    return this.sales;
  }

  getSaleById(id: string) {
    return this.sales.find(s => s.id === id);
  }

  // Vendas pendentes para gerente validar
  getPendingSalesForManager(managerId: string) {
    return this.sales.filter(
      s => s.managerId === managerId && s.status === 'pending_manager'
    );
  }

  // Vendas validadas (para Admin ver)
  getValidatedSales() {
    return this.sales.filter(s => s.status === 'validated');
  }

  // Vendas pendentes de validação do gerente (para Admin acompanhar)
  getPendingManagerValidation() {
    return this.sales.filter(s => s.status === 'pending_manager');
  }

  // Gerente valida a venda
  validateSale(saleId: string, comment?: string) {
    const saleIndex = this.sales.findIndex(s => s.id === saleId);
    if (saleIndex === -1) return false;

    this.sales[saleIndex] = {
      ...this.sales[saleIndex],
      status: 'validated',
      managerValidatedAt: new Date().toISOString(),
      managerComment: comment,
    };

    // Cria notificação para Admin
    const sale = this.sales[saleIndex];
    this.notifications.push({
      id: `sale-notif-${Date.now()}`,
      saleId,
      type: 'sale_validated',
      title: 'Venda validada pelo gerente',
      message: `${sale.managerName} validou venda de R$ ${sale.saleValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - ${sale.leadName}`,
      targetRole: 'admin',
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.notify();
    return true;
  }

  // Gerente rejeita a venda
  rejectSale(saleId: string, reason: string) {
    const saleIndex = this.sales.findIndex(s => s.id === saleId);
    if (saleIndex === -1) return false;

    this.sales[saleIndex] = {
      ...this.sales[saleIndex],
      status: 'rejected',
      managerRejectedAt: new Date().toISOString(),
      managerComment: reason,
    };

    this.notify();
    return true;
  }

  // Gerente edita a venda antes de validar
  updateSale(saleId: string, updates: Partial<Omit<Sale, 'id' | 'status' | 'createdAt' | 'agentId' | 'agentName'>>) {
    const saleIndex = this.sales.findIndex(s => s.id === saleId);
    if (saleIndex === -1) return false;

    this.sales[saleIndex] = {
      ...this.sales[saleIndex],
      ...updates,
    };

    this.notify();
    return true;
  }

  // Registra nova venda (chamado quando vendedor fecha como ganho)
  registerSale(saleData: Omit<Sale, 'id' | 'status' | 'createdAt'>) {
    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      status: 'pending_manager',
      createdAt: new Date().toISOString(),
    };

    this.sales.unshift(newSale);

    // Cria notificação para gerente
    this.notifications.push({
      id: `sale-notif-${Date.now()}`,
      saleId: newSale.id,
      type: 'sale_pending_validation',
      title: 'Nova venda para validar',
      message: `${newSale.agentName} registrou venda de R$ ${newSale.saleValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - ${newSale.leadName}`,
      targetRole: 'manager',
      targetUserId: newSale.managerId,
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.notify();
    return newSale;
  }

  // Notificações
  getNotificationsForManager(managerId: string) {
    return this.notifications.filter(
      n => n.targetRole === 'manager' && n.targetUserId === managerId
    );
  }

  getNotificationsForAdmin() {
    return this.notifications.filter(n => n.targetRole === 'admin');
  }

  getUnreadSaleNotificationsCount(role: 'manager' | 'admin', userId?: string) {
    if (role === 'manager') {
      return this.notifications.filter(
        n => n.targetRole === 'manager' && n.targetUserId === userId && !n.read
      ).length;
    }
    return this.notifications.filter(
      n => n.targetRole === 'admin' && !n.read
    ).length;
  }

  markNotificationAsRead(notifId: string) {
    const index = this.notifications.findIndex(n => n.id === notifId);
    if (index !== -1) {
      this.notifications[index].read = true;
      this.notify();
    }
  }

  // Admin marca venda como visualizada
  markSaleAsViewedByAdmin(saleId: string) {
    const index = this.sales.findIndex(s => s.id === saleId);
    if (index !== -1) {
      this.sales[index].adminViewedAt = new Date().toISOString();
      this.notify();
    }
  }

  // KPIs para Admin
  getSalesKPIs() {
    const validated = this.sales.filter(s => s.status === 'validated');
    const pending = this.sales.filter(s => s.status === 'pending_manager');

    const totalRevenue = validated.reduce((acc, s) => acc + s.saleValue, 0);
    const pendingRevenue = pending.reduce((acc, s) => acc + s.saleValue, 0);

    return {
      totalValidatedSales: validated.length,
      totalRevenue,
      pendingValidation: pending.length,
      pendingRevenue,
      averageTicket: validated.length > 0 ? totalRevenue / validated.length : 0,
    };
  }
}

export const salesStore = new SalesStore();

// Hook para usar o store com React
import { useState, useEffect } from 'react';

export function useSalesStore() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = salesStore.subscribe(() => forceUpdate({}));
    return () => { unsubscribe(); };
  }, []);

  return salesStore;
}
