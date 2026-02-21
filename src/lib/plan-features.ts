// Feature Flags System - Plan-based governance
// O plano pertence ao TENANT, nunca ao usuário

export type PlanType = 'ESSENCIAL' | 'PROFISSIONAL' | 'AVANCADO' | 'COMPLETO';

// Todas as feature flags disponíveis no sistema
export interface FeatureFlags {
  // Módulos principais
  module_dashboard_comercial: boolean;
  module_funil_comercial: boolean;
  module_roleta_leads: boolean;
  module_relatorios: boolean;
  module_relatorios_completos: boolean;
  
  // WhatsApp
  module_whatsapp_qr: boolean;
  module_whatsapp_api: boolean;
  module_campanhas_whatsapp: boolean;
  
  // Inteligência Artificial
  module_ia_sdr: boolean;
  module_ia_followup: boolean;
  module_ia_ligacao: boolean;
  module_ia_insights: boolean;
  module_ia_pos_venda: boolean;
  module_ia_nps: boolean;
  
  // Outros
  module_integracoes_customizadas: boolean;
  module_prioridade_suporte: boolean;
  module_app_acompanhamento: boolean;
  
  // Limites
  max_users: number | 'unlimited';
}

// Preços por usuário por plano
export interface PlanPricing {
  monthly: number;
  annual: number;
}

export const PLAN_USER_PRICING: Record<PlanType, PlanPricing> = {
  ESSENCIAL: { monthly: 199, annual: 150 },
  PROFISSIONAL: { monthly: 250, annual: 199 },
  AVANCADO: { monthly: 350, annual: 300 },
  COMPLETO: { monthly: 500, annual: 450 },
};

// Configuração dos planos com suas flags
export const PLAN_CONFIGS: Record<PlanType, { name: string; description: string; features: FeatureFlags; baseUsers: number }> = {
  ESSENCIAL: {
    name: 'Essencial',
    description: 'Organização comercial básica para pequenas equipes',
    baseUsers: 3,
    features: {
      module_dashboard_comercial: true,
      module_funil_comercial: true,
      module_roleta_leads: false,
      module_relatorios: true,
      module_relatorios_completos: false,
      module_whatsapp_qr: true,
      module_whatsapp_api: true, // Opcional
      module_campanhas_whatsapp: false,
      module_ia_sdr: false,
      module_ia_followup: false,
      module_ia_ligacao: false,
      module_ia_insights: false,
      module_ia_pos_venda: false,
      module_ia_nps: false,
      module_integracoes_customizadas: false,
      module_prioridade_suporte: false,
      module_app_acompanhamento: true,
      max_users: 3,
    },
  },
  PROFISSIONAL: {
    name: 'Profissional',
    description: 'Gestão de equipe com distribuição inteligente',
    baseUsers: 7,
    features: {
      module_dashboard_comercial: true,
      module_funil_comercial: true,
      module_roleta_leads: true,
      module_relatorios: true,
      module_relatorios_completos: false,
      module_whatsapp_qr: true,
      module_whatsapp_api: true,
      module_campanhas_whatsapp: false,
      module_ia_sdr: false,
      module_ia_followup: false,
      module_ia_ligacao: false,
      module_ia_insights: false,
      module_ia_pos_venda: false,
      module_ia_nps: false,
      module_integracoes_customizadas: false,
      module_prioridade_suporte: false,
      module_app_acompanhamento: true,
      max_users: 7,
    },
  },
  AVANCADO: {
    name: 'Avançado',
    description: 'Inteligência Artificial operacional completa',
    baseUsers: 15,
    features: {
      module_dashboard_comercial: true,
      module_funil_comercial: true,
      module_roleta_leads: true,
      module_relatorios: true,
      module_relatorios_completos: true,
      module_whatsapp_qr: true,
      module_whatsapp_api: true,
      module_campanhas_whatsapp: false,
      module_ia_sdr: true,
      module_ia_followup: true,
      module_ia_ligacao: false, // Bloqueada
      module_ia_insights: true,
      module_ia_pos_venda: false,
      module_ia_nps: false,
      module_integracoes_customizadas: false,
      module_prioridade_suporte: false,
      module_app_acompanhamento: true,
      max_users: 15,
    },
  },
  COMPLETO: {
    name: 'Completo',
    description: 'Todas as funcionalidades com IA avançada',
    baseUsers: 999,
    features: {
      module_dashboard_comercial: true,
      module_funil_comercial: true,
      module_roleta_leads: true,
      module_relatorios: true,
      module_relatorios_completos: true,
      module_whatsapp_qr: true,
      module_whatsapp_api: true,
      module_campanhas_whatsapp: true,
      module_ia_sdr: true,
      module_ia_followup: true,
      module_ia_ligacao: true,
      module_ia_insights: true,
      module_ia_pos_venda: true,
      module_ia_nps: true,
      module_integracoes_customizadas: true,
      module_prioridade_suporte: true,
      module_app_acompanhamento: true,
      max_users: 'unlimited',
    },
  },
};

// Configuração de feature flag por tenant (mock - virá do backend)
export interface TenantPlanConfig {
  tenantId: string;
  planType: PlanType;
  features: FeatureFlags;
  periodicity: 'monthly' | 'annual';
  userCount: number;
  monthlyValue: number;
  // Override manual de flags (Super Admin pode habilitar features individualmente)
  customOverrides?: Partial<FeatureFlags>;
  planHistory: {
    planType: PlanType;
    changedAt: string;
    changedBy: string;
  }[];
}

// Labels amigáveis para as features
export const FEATURE_LABELS: Record<keyof FeatureFlags, string> = {
  module_dashboard_comercial: 'Dashboard Comercial',
  module_funil_comercial: 'Funil Comercial',
  module_roleta_leads: 'Roleta de Leads',
  module_relatorios: 'Relatórios Básicos',
  module_relatorios_completos: 'Relatórios Completos',
  module_whatsapp_qr: 'WhatsApp QR',
  module_whatsapp_api: 'WhatsApp API',
  module_campanhas_whatsapp: 'Campanhas WhatsApp',
  module_ia_sdr: 'IA SDR',
  module_ia_followup: 'IA Follow-up',
  module_ia_ligacao: 'IA de Ligação',
  module_ia_insights: 'IA Insights',
  module_ia_pos_venda: 'IA Pós-venda',
  module_ia_nps: 'IA NPS',
  module_integracoes_customizadas: 'Integrações Customizadas',
  module_prioridade_suporte: 'Suporte Prioritário',
  module_app_acompanhamento: 'APP de Acompanhamento',
  max_users: 'Limite de Usuários',
};

// Categorias para organizar as features na UI
export const FEATURE_CATEGORIES = {
  modulos_principais: {
    label: 'Módulos Principais',
    features: ['module_dashboard_comercial', 'module_funil_comercial', 'module_roleta_leads', 'module_relatorios', 'module_relatorios_completos', 'module_app_acompanhamento'] as (keyof FeatureFlags)[],
  },
  whatsapp: {
    label: 'WhatsApp',
    features: ['module_whatsapp_qr', 'module_whatsapp_api', 'module_campanhas_whatsapp'] as (keyof FeatureFlags)[],
  },
  inteligencia_artificial: {
    label: 'Inteligência Artificial',
    features: ['module_ia_sdr', 'module_ia_followup', 'module_ia_ligacao', 'module_ia_insights', 'module_ia_pos_venda', 'module_ia_nps'] as (keyof FeatureFlags)[],
  },
  outros: {
    label: 'Outros',
    features: ['module_integracoes_customizadas', 'module_prioridade_suporte'] as (keyof FeatureFlags)[],
  },
};

// Helper para obter as features efetivas de um tenant (plano + overrides)
export function getEffectiveFeatures(config: TenantPlanConfig): FeatureFlags {
  const planFeatures = PLAN_CONFIGS[config.planType].features;
  
  if (!config.customOverrides) {
    return planFeatures;
  }
  
  return {
    ...planFeatures,
    ...config.customOverrides,
  };
}

// Helper para calcular o valor mensal baseado no plano, periodicidade e número de usuários
export function calculateMonthlyValue(
  planType: PlanType, 
  periodicity: 'monthly' | 'annual', 
  userCount: number
): number {
  const pricing = PLAN_USER_PRICING[planType];
  const pricePerUser = periodicity === 'annual' ? pricing.annual : pricing.monthly;
  return pricePerUser * userCount;
}

// Helper para verificar se pode fazer upgrade
export function canUpgradeTo(currentPlan: PlanType, targetPlan: PlanType): boolean {
  const planOrder: PlanType[] = ['ESSENCIAL', 'PROFISSIONAL', 'AVANCADO', 'COMPLETO'];
  return planOrder.indexOf(targetPlan) > planOrder.indexOf(currentPlan);
}

// Helper para verificar se pode fazer downgrade
export function canDowngradeTo(currentPlan: PlanType, targetPlan: PlanType): boolean {
  const planOrder: PlanType[] = ['ESSENCIAL', 'PROFISSIONAL', 'AVANCADO', 'COMPLETO'];
  return planOrder.indexOf(targetPlan) < planOrder.indexOf(currentPlan);
}

// Helper para obter o próximo plano
export function getNextPlan(currentPlan: PlanType): PlanType | null {
  const planOrder: PlanType[] = ['ESSENCIAL', 'PROFISSIONAL', 'AVANCADO', 'COMPLETO'];
  const currentIndex = planOrder.indexOf(currentPlan);
  if (currentIndex < planOrder.length - 1) {
    return planOrder[currentIndex + 1];
  }
  return null;
}

// Helper para obter limite máximo de usuários por plano
export function getMaxUsersForPlan(planType: PlanType): number | 'unlimited' {
  return PLAN_CONFIGS[planType].features.max_users;
}
