import { useMemo } from 'react';

// Lista de módulos habilitados (virá de API/Supabase futuramente)
export const ENABLED_MODULES = [
  "dashboard",
  "funil",
  "funil_leads_funil",
  "funil_leads_carteira",
  "funil_leads_prospeccao",
  "roleta",
  "ia_sdr",
  "ia_followup",
  "pos_venda",
  "equipes",
  "usuarios"
] as const;

export type ModuleId = typeof ENABLED_MODULES[number];

export interface ModuleConfig {
  id: ModuleId;
  name: string;
  description: string;
  path?: string;
  icon?: string;
  parent?: ModuleId;
}

export const MODULE_CONFIGS: Record<ModuleId, ModuleConfig> = {
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard Comercial',
    description: 'Visão geral da performance comercial',
    path: '/home',
  },
  funil: {
    id: 'funil',
    name: 'Funil Comercial',
    description: 'Gestão e operação dos leads',
    path: '/funil',
  },
  funil_leads_funil: {
    id: 'funil_leads_funil',
    name: 'Leads Funil',
    description: 'Leads ativos no pipeline',
    parent: 'funil',
  },
  funil_leads_carteira: {
    id: 'funil_leads_carteira',
    name: 'Leads Carteira',
    description: 'Leads já trabalhados / relacionamento',
    parent: 'funil',
  },
  funil_leads_prospeccao: {
    id: 'funil_leads_prospeccao',
    name: 'Leads Prospecção',
    description: 'Leads outbound / listas / campanhas',
    parent: 'funil',
  },
  roleta: {
    id: 'roleta',
    name: 'Distribuição de Leads',
    description: 'Controle da distribuição automática de leads',
    path: '/roleta',
  },
  ia_sdr: {
    id: 'ia_sdr',
    name: 'IA SDR',
    description: 'Prompts e configurações do SDR automático',
  },
  ia_followup: {
    id: 'ia_followup',
    name: 'IA Follow-up',
    description: 'Mensagens automáticas por estágio',
  },
  pos_venda: {
    id: 'pos_venda',
    name: 'Pós-venda / NPS',
    description: 'Gestão de satisfação e pós-venda',
  },
  equipes: {
    id: 'equipes',
    name: 'Equipes & Hierarquias',
    description: 'Gerentes, times e agentes',
  },
  usuarios: {
    id: 'usuarios',
    name: 'Usuários',
    description: 'Gestão de usuários e papéis',
  },
};

export function useModules() {
  const enabledModules = useMemo(() => {
    return ENABLED_MODULES;
  }, []);

  const isModuleEnabled = (moduleId: ModuleId): boolean => {
    return enabledModules.includes(moduleId);
  };

  const getEnabledModules = (): ModuleConfig[] => {
    return enabledModules
      .filter((id) => MODULE_CONFIGS[id] && !MODULE_CONFIGS[id].parent)
      .map((id) => MODULE_CONFIGS[id]);
  };

  const getModuleConfig = (moduleId: ModuleId): ModuleConfig | undefined => {
    return MODULE_CONFIGS[moduleId];
  };

  const isSubModuleEnabled = (parentId: ModuleId, subModuleId: ModuleId): boolean => {
    return isModuleEnabled(parentId) && isModuleEnabled(subModuleId);
  };

  return {
    enabledModules,
    isModuleEnabled,
    getEnabledModules,
    getModuleConfig,
    isSubModuleEnabled,
  };
}
