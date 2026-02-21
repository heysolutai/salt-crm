// ==========================================
// INVENTORY STORE - Simple Stock Management
// ==========================================

import { useState, useEffect } from 'react';

export type InventoryItemType = 'produto' | 'servico';
export type InventoryItemStatus = 'ativo' | 'inativo';

export interface InventoryItem {
  id: string;
  name: string;
  type: InventoryItemType;
  quantity: number;
  unit: string;
  status: InventoryItemStatus;
  description?: string;
  referenceValue?: number;
  minStockAlert?: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'entrada' | 'saida';
  quantity: number;
  reason: string;
  saleId?: string;
  createdAt: string;
}

// Mock data for initial inventory
const mockInventoryItems: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Plano Básico Mensal',
    type: 'servico',
    quantity: 50,
    unit: 'contratos',
    status: 'ativo',
    description: 'Assinatura mensal do plano básico',
    referenceValue: 99.90,
    minStockAlert: 10,
    category: 'Assinaturas',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-2',
    name: 'Consultoria Avulsa',
    type: 'servico',
    quantity: 20,
    unit: 'horas',
    status: 'ativo',
    description: 'Hora de consultoria especializada',
    referenceValue: 250.00,
    minStockAlert: 5,
    category: 'Serviços',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-3',
    name: 'Kit Instalação',
    type: 'produto',
    quantity: 3,
    unit: 'un',
    status: 'ativo',
    description: 'Kit completo para instalação',
    referenceValue: 450.00,
    minStockAlert: 5,
    category: 'Produtos',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-4',
    name: 'Treinamento Presencial',
    type: 'servico',
    quantity: 8,
    unit: 'sessões',
    status: 'ativo',
    description: 'Sessão de treinamento presencial',
    referenceValue: 800.00,
    minStockAlert: 3,
    category: 'Treinamentos',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-5',
    name: 'Licença Software Anual',
    type: 'servico',
    quantity: 0,
    unit: 'licenças',
    status: 'ativo',
    description: 'Licença anual do software',
    referenceValue: 1200.00,
    minStockAlert: 2,
    category: 'Licenças',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockStockMovements: StockMovement[] = [
  {
    id: 'mov-1',
    itemId: 'inv-1',
    type: 'saida',
    quantity: 2,
    reason: 'Venda concluída',
    saleId: 'sale-1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mov-2',
    itemId: 'inv-3',
    type: 'saida',
    quantity: 1,
    reason: 'Venda concluída',
    saleId: 'sale-2',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

class InventoryStore {
  private items: InventoryItem[] = [...mockInventoryItems];
  private movements: StockMovement[] = [...mockStockMovements];
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // ==========================================
  // INVENTORY ITEMS
  // ==========================================
  getItems() {
    return this.items;
  }

  getActiveItems() {
    return this.items.filter(item => item.status === 'ativo');
  }

  getItemById(id: string) {
    return this.items.find(item => item.id === id);
  }

  getItemsByType(type: InventoryItemType) {
    return this.items.filter(item => item.type === type);
  }

  getLowStockItems() {
    return this.items.filter(item => {
      if (item.status !== 'ativo') return false;
      if (item.minStockAlert === undefined) return item.quantity === 0;
      return item.quantity <= item.minStockAlert;
    });
  }

  getOutOfStockItems() {
    return this.items.filter(item => item.status === 'ativo' && item.quantity === 0);
  }

  addItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.items.push(newItem);
    this.notify();
    return newItem;
  }

  updateItem(id: string, updates: Partial<Omit<InventoryItem, 'id' | 'createdAt'>>) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items[index] = {
        ...this.items[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.notify();
      return this.items[index];
    }
    return null;
  }

  deleteItem(id: string) {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.id !== id);
    this.notify();
    return this.items.length < initialLength;
  }

  // ==========================================
  // STOCK MOVEMENTS
  // ==========================================
  getMovements() {
    return this.movements;
  }

  getMovementsByItem(itemId: string) {
    return this.movements.filter(mov => mov.itemId === itemId);
  }

  // Manual stock entry (replenishment)
  addStock(itemId: string, quantity: number, reason: string = 'Entrada manual') {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return null;

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      itemId,
      type: 'entrada',
      quantity,
      reason,
      createdAt: new Date().toISOString(),
    };
    this.movements.unshift(movement);

    item.quantity += quantity;
    item.updatedAt = new Date().toISOString();

    this.notify();
    return movement;
  }

  // Debit stock (on sale completion)
  debitStock(itemId: string, quantity: number, saleId?: string): { success: boolean; hasLowStock: boolean; item: InventoryItem | null } {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return { success: false, hasLowStock: false, item: null };

    const hasEnoughStock = item.quantity >= quantity;
    const actualDebit = hasEnoughStock ? quantity : item.quantity;

    if (actualDebit > 0) {
      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        itemId,
        type: 'saida',
        quantity: actualDebit,
        reason: saleId ? 'Venda concluída' : 'Saída manual',
        saleId,
        createdAt: new Date().toISOString(),
      };
      this.movements.unshift(movement);

      item.quantity -= actualDebit;
      item.updatedAt = new Date().toISOString();
    }

    const hasLowStock = !hasEnoughStock || (item.minStockAlert !== undefined && item.quantity <= item.minStockAlert);

    this.notify();
    return { success: true, hasLowStock, item };
  }

  // ==========================================
  // STATS
  // ==========================================
  getStats() {
    const activeItems = this.getActiveItems();
    const lowStockItems = this.getLowStockItems();
    const outOfStockItems = this.getOutOfStockItems();
    
    return {
      totalItems: activeItems.length,
      products: activeItems.filter(i => i.type === 'produto').length,
      services: activeItems.filter(i => i.type === 'servico').length,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      totalValue: activeItems.reduce((acc, item) => acc + (item.referenceValue || 0) * item.quantity, 0),
    };
  }
}

export const inventoryStore = new InventoryStore();

// React Hook
export function useInventoryStore() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = inventoryStore.subscribe(() => forceUpdate({}));
    return () => { unsubscribe(); };
  }, []);

  return inventoryStore;
}
