// Lead Demands Store - Manages demands/tasks created by managers for sellers on pinned leads

export interface LeadDemand {
  id: string;
  leadId: string;
  createdBy: string; // Manager/Admin who created the demand
  assignedTo: string; // Seller who needs to resolve it
  message: string;
  createdAt: Date;
  resolvedAt?: Date;
  resolved: boolean;
}

// Mock demands store
let demands: LeadDemand[] = [];
let subscribers: (() => void)[] = [];

const notifySubscribers = () => {
  subscribers.forEach(fn => fn());
};

export const leadDemandsStore = {
  // Get all demands
  getDemands: (): LeadDemand[] => [...demands],
  
  // Get pending (unresolved) demand for a lead
  getPendingDemandForLead: (leadId: string): LeadDemand | undefined => {
    return demands.find(d => d.leadId === leadId && !d.resolved);
  },
  
  // Check if a lead has a pending demand
  hasUnresolvedDemand: (leadId: string): boolean => {
    return demands.some(d => d.leadId === leadId && !d.resolved);
  },
  
  // Create a new demand (when manager/admin pins a lead for a seller)
  createDemand: (leadId: string, createdBy: string, assignedTo: string, message: string): LeadDemand => {
    const demand: LeadDemand = {
      id: `demand_${Date.now()}`,
      leadId,
      createdBy,
      assignedTo,
      message,
      createdAt: new Date(),
      resolved: false,
    };
    demands.push(demand);
    notifySubscribers();
    return demand;
  },
  
  // Resolve a demand (seller marks it as done)
  resolveDemand: (demandId: string): boolean => {
    const demand = demands.find(d => d.id === demandId);
    if (demand && !demand.resolved) {
      demand.resolved = true;
      demand.resolvedAt = new Date();
      notifySubscribers();
      return true;
    }
    return false;
  },
  
  // Resolve demand by lead ID (alternative method)
  resolveDemandForLead: (leadId: string): boolean => {
    const demand = demands.find(d => d.leadId === leadId && !d.resolved);
    if (demand) {
      demand.resolved = true;
      demand.resolvedAt = new Date();
      notifySubscribers();
      return true;
    }
    return false;
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
import { useState, useEffect, useCallback } from 'react';
import { useUserRole } from '@/hooks/useUserRole';

export function useLeadDemands() {
  const [, forceUpdate] = useState({});
  const { role, userName } = useUserRole();
  
  useEffect(() => {
    const unsubscribe = leadDemandsStore.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);
  
  // Check if current user can pin leads (only Gerente and Admin)
  const canPinLeads = role === 'TENANT_ADMIN' || role === 'TENANT_GERENTE';
  
  // Check if current user is a seller
  const isSeller = role === 'TENANT_VENDEDOR';
  
  // Check if a seller can unpin a specific lead (only if demand is resolved)
  const canSellerUnpin = useCallback((leadId: string): boolean => {
    if (!isSeller) return true; // Non-sellers can always unpin
    return !leadDemandsStore.hasUnresolvedDemand(leadId);
  }, [isSeller]);
  
  // Get pending demand for a lead
  const getPendingDemand = useCallback((leadId: string) => {
    return leadDemandsStore.getPendingDemandForLead(leadId);
  }, []);
  
  // Create a demand when pinning
  const createDemandForPin = useCallback((leadId: string, assignedTo: string, message: string) => {
    return leadDemandsStore.createDemand(leadId, userName, assignedTo, message);
  }, [userName]);
  
  // Resolve a demand
  const resolveDemand = useCallback((leadId: string) => {
    return leadDemandsStore.resolveDemandForLead(leadId);
  }, []);
  
  return {
    canPinLeads,
    isSeller,
    canSellerUnpin,
    getPendingDemand,
    createDemandForPin,
    resolveDemand,
    hasUnresolvedDemand: leadDemandsStore.hasUnresolvedDemand,
  };
}

// Get unique products from leads for filter dropdown
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getUniqueProducts(leads: any[]): string[] {
  const products = leads
    .map(l => l.produto)
    .filter((p): p is string => !!p && typeof p === 'string' && p.trim() !== '');
  return [...new Set(products)].sort();
}
