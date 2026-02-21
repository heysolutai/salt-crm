import { useMemo } from 'react';
import { 
  PlanType, 
  FeatureFlags, 
  TenantPlanConfig, 
  PLAN_CONFIGS, 
  getEffectiveFeatures,
  getNextPlan,
  FEATURE_LABELS
} from '@/lib/plan-features';

// Mock: Configuração do tenant atual (virá do contexto/API futuramente)
// Em produção, isso viria do Supabase baseado no tenant autenticado
const MOCK_CURRENT_TENANT_CONFIG: TenantPlanConfig = {
  tenantId: 'tenant-mock-1',
  planType: 'COMPLETO', // Para desenvolvimento, usando plano completo
  features: PLAN_CONFIGS['COMPLETO'].features,
  periodicity: 'monthly',
  userCount: 10,
  monthlyValue: 5000,
  planHistory: [
    { planType: 'COMPLETO', changedAt: '2024-01-01', changedBy: 'Sistema' },
  ],
};

interface UsePlanFeaturesReturn {
  // Configuração atual
  currentPlan: PlanType;
  planName: string;
  planDescription: string;
  features: FeatureFlags;
  
  // Verificações de features
  hasFeature: (featureKey: keyof FeatureFlags) => boolean;
  canAccessModule: (moduleKey: keyof FeatureFlags) => boolean;
  
  // Limites
  maxUsers: number | 'unlimited';
  isWithinUserLimit: (currentUsers: number) => boolean;
  
  // Upgrade helpers
  getUpgradeMessage: (featureKey: keyof FeatureFlags) => string;
  getNextAvailablePlan: () => PlanType | null;
  
  // Para exibição
  getFeatureLabel: (featureKey: keyof FeatureFlags) => string;
}

export function usePlanFeatures(): UsePlanFeaturesReturn {
  // Em produção, buscar config do tenant do contexto de autenticação
  const tenantConfig = MOCK_CURRENT_TENANT_CONFIG;
  
  const effectiveFeatures = useMemo(() => {
    return getEffectiveFeatures(tenantConfig);
  }, [tenantConfig]);
  
  const planConfig = PLAN_CONFIGS[tenantConfig.planType];
  
  const hasFeature = (featureKey: keyof FeatureFlags): boolean => {
    const value = effectiveFeatures[featureKey];
    if (typeof value === 'boolean') {
      return value;
    }
    // Para max_users, sempre retorna true (é um limite, não um boolean)
    return true;
  };
  
  const canAccessModule = (moduleKey: keyof FeatureFlags): boolean => {
    return hasFeature(moduleKey);
  };
  
  const isWithinUserLimit = (currentUsers: number): boolean => {
    const limit = effectiveFeatures.max_users;
    if (limit === 'unlimited') return true;
    return currentUsers <= limit;
  };
  
  const getUpgradeMessage = (featureKey: keyof FeatureFlags): string => {
    const nextPlan = getNextPlan(tenantConfig.planType);
    if (!nextPlan) {
      return 'Você já possui o plano mais completo.';
    }
    const featureLabel = FEATURE_LABELS[featureKey];
    const nextPlanConfig = PLAN_CONFIGS[nextPlan];
    return `${featureLabel} disponível no plano ${nextPlanConfig.name}`;
  };
  
  const getNextAvailablePlan = (): PlanType | null => {
    return getNextPlan(tenantConfig.planType);
  };
  
  const getFeatureLabel = (featureKey: keyof FeatureFlags): string => {
    return FEATURE_LABELS[featureKey];
  };
  
  return {
    currentPlan: tenantConfig.planType,
    planName: planConfig.name,
    planDescription: planConfig.description,
    features: effectiveFeatures,
    hasFeature,
    canAccessModule,
    maxUsers: effectiveFeatures.max_users,
    isWithinUserLimit,
    getUpgradeMessage,
    getNextAvailablePlan,
    getFeatureLabel,
  };
}

// Hook para Super Admin - gerenciamento de planos de tenants
interface UseTenantPlanManagementReturn {
  // Obter config de um tenant específico
  getTenantPlanConfig: (tenantId: string) => TenantPlanConfig | null;
  
  // Alterar plano de um tenant
  changeTenantPlan: (tenantId: string, newPlan: PlanType, changedBy: string) => void;
  
  // Override de features
  setFeatureOverride: (tenantId: string, featureKey: keyof FeatureFlags, value: boolean) => void;
  removeFeatureOverride: (tenantId: string, featureKey: keyof FeatureFlags) => void;
  
  // Listar todos os planos
  getAllPlans: () => typeof PLAN_CONFIGS;
}

// Mock de configs de tenants (em produção, viria do Supabase)
let mockTenantConfigs: Record<string, TenantPlanConfig> = {};

export function useTenantPlanManagement(): UseTenantPlanManagementReturn {
  const getTenantPlanConfig = (tenantId: string): TenantPlanConfig | null => {
    return mockTenantConfigs[tenantId] || null;
  };
  
  const changeTenantPlan = (tenantId: string, newPlan: PlanType, changedBy: string): void => {
    const currentConfig = mockTenantConfigs[tenantId];
    const newFeatures = PLAN_CONFIGS[newPlan].features;
    
    mockTenantConfigs[tenantId] = {
      tenantId,
      planType: newPlan,
      features: newFeatures,
      periodicity: currentConfig?.periodicity || 'monthly',
      userCount: currentConfig?.userCount || 1,
      monthlyValue: currentConfig?.monthlyValue || 0,
      customOverrides: currentConfig?.customOverrides,
      planHistory: [
        ...(currentConfig?.planHistory || []),
        { planType: newPlan, changedAt: new Date().toISOString(), changedBy },
      ],
    };
  };
  
  const setFeatureOverride = (tenantId: string, featureKey: keyof FeatureFlags, value: boolean): void => {
    const currentConfig = mockTenantConfigs[tenantId];
    if (currentConfig) {
      mockTenantConfigs[tenantId] = {
        ...currentConfig,
        customOverrides: {
          ...currentConfig.customOverrides,
          [featureKey]: value,
        },
      };
    }
  };
  
  const removeFeatureOverride = (tenantId: string, featureKey: keyof FeatureFlags): void => {
    const currentConfig = mockTenantConfigs[tenantId];
    if (currentConfig?.customOverrides) {
      const { [featureKey]: removed, ...rest } = currentConfig.customOverrides;
      mockTenantConfigs[tenantId] = {
        ...currentConfig,
        customOverrides: Object.keys(rest).length > 0 ? rest as Partial<FeatureFlags> : undefined,
      };
    }
  };
  
  const getAllPlans = () => PLAN_CONFIGS;
  
  return {
    getTenantPlanConfig,
    changeTenantPlan,
    setFeatureOverride,
    removeFeatureOverride,
    getAllPlans,
  };
}
