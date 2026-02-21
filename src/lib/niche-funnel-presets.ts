// Niche Funnel Presets - Complete funnel structure by industry niche

export type NicheId = 
  | 'imobiliaria'
  | 'saude'
  | 'estetica'
  | 'automotivo'
  | 'fitness'
  | 'educacao'
  | 'varejo'
  | 'advocacia'
  | 'engenharia'
  | 'b2b_consultoria'
  | 'financeiro';

export interface FunnelSubStatus {
  id: string;
  label: string;
  order: number;
}

export interface FunnelStatus {
  id: string;
  label: string;
  order: number;
  hasSubStatus: boolean;
  subStatuses?: FunnelSubStatus[];
  isLateral?: boolean; // Status fora do funil principal
}

export interface NicheFunnelPreset {
  id: NicheId;
  name: string;
  description: string;
  // Nomenclaturas customizadas
  vendedorLabel: string; // Nome do status "Vendedor"
  emAtendimentoLabel: string; // Nome do status "Em Atendimento"
  fechadoGanhoLabel: string; // Nome do status "Fechado – Ganho"
  // Substatus do "Vendedor" (sempre 3)
  vendedorSubStatuses: [string, string, string];
  // Substatus do "Em Atendimento" (sempre 3)
  emAtendimentoSubStatuses: [string, string, string];
  // Status laterais (sempre 4)
  lateralStatuses: [string, string, string, string];
}

// Status fixos do funil (sem substatus)
export const FIXED_FUNNEL_STATUSES = [
  { id: 'frio', label: 'Frio', order: 1 },
  { id: 'morno', label: 'Morno', order: 2 },
  { id: 'quente', label: 'Quente', order: 3 },
  { id: 'qualificado', label: 'Qualificado', order: 4 },
];

// All niche presets with complete funnel configurations
export const NICHE_FUNNEL_PRESETS: Record<NicheId, NicheFunnelPreset> = {
  imobiliaria: {
    id: 'imobiliaria',
    name: 'Imobiliária',
    description: 'Funil para imobiliárias e corretores de imóveis',
    vendedorLabel: 'Corretor',
    emAtendimentoLabel: 'Visita',
    fechadoGanhoLabel: 'Negócio Fechado',
    vendedorSubStatuses: ['Em Atendimento', 'Em Negociação', 'Carteira'],
    emAtendimentoSubStatuses: ['Visita Marcada', 'Visita Realizada', 'Proposta Enviada'],
    lateralStatuses: ['Carteira', 'Arquivado', 'Corretor Parceiro', 'Proprietário'],
  },
  saude: {
    id: 'saude',
    name: 'Saúde / Clínicas',
    description: 'Funil para clínicas, hospitais e profissionais de saúde',
    vendedorLabel: 'Comercial',
    emAtendimentoLabel: 'Consulta',
    fechadoGanhoLabel: 'Tratamento Iniciado',
    vendedorSubStatuses: ['Primeiro Contato', 'Orçamento', 'Paciente'],
    emAtendimentoSubStatuses: ['Consulta Marcada', 'Consulta Realizada', 'Plano Apresentado'],
    lateralStatuses: ['Carteira', 'Arquivado', 'Parceiro', 'Paciente'],
  },
  estetica: {
    id: 'estetica',
    name: 'Estética',
    description: 'Funil para clínicas de estética e beleza',
    vendedorLabel: 'Profissional',
    emAtendimentoLabel: 'Avaliação',
    fechadoGanhoLabel: 'Pacote Vendido',
    vendedorSubStatuses: ['Primeiro Contato', 'Orçamento', 'Cliente'],
    emAtendimentoSubStatuses: ['Avaliação Marcada', 'Avaliação Realizada', 'Pacote Apresentado'],
    lateralStatuses: ['Carteira', 'Arquivado', 'Parceiro', 'Cliente'],
  },
  automotivo: {
    id: 'automotivo',
    name: 'Automotivo',
    description: 'Funil para concessionárias e oficinas',
    vendedorLabel: 'Vendedor',
    emAtendimentoLabel: 'Serviço',
    fechadoGanhoLabel: 'Venda Concluída',
    vendedorSubStatuses: ['Primeiro Contato', 'Orçamento Enviado', 'Carteira'],
    emAtendimentoSubStatuses: ['Serviço Vendido', 'Serviço Realizado', 'Indicação'],
    lateralStatuses: ['Carteira', 'Arquivado', 'Parceiro', 'Cliente'],
  },
  fitness: {
    id: 'fitness',
    name: 'Fitness',
    description: 'Funil para academias e estúdios fitness',
    vendedorLabel: 'Comercial',
    emAtendimentoLabel: 'Aula Experimental',
    fechadoGanhoLabel: 'Aluno Ativo',
    vendedorSubStatuses: ['Primeiro Contato', 'Orçamento', 'Aluno'],
    emAtendimentoSubStatuses: ['Aula Agendada', 'Aula Realizada', 'Plano Apresentado'],
    lateralStatuses: ['Carteira', 'Arquivado', 'Parceiro', 'Aluno'],
  },
  educacao: {
    id: 'educacao',
    name: 'Educação',
    description: 'Funil para escolas, cursos e instituições de ensino',
    vendedorLabel: 'Consultor',
    emAtendimentoLabel: 'Reunião',
    fechadoGanhoLabel: 'Aluno Matriculado',
    vendedorSubStatuses: ['Primeiro Contato', 'Orçamento', 'Aluno'],
    emAtendimentoSubStatuses: ['Reunião Agendada', 'Reunião Realizada', 'Proposta Enviada'],
    lateralStatuses: ['Carteira', 'Arquivado', 'Parceiro', 'Aluno'],
  },
  varejo: {
    id: 'varejo',
    name: 'Varejo',
    description: 'Funil para lojas e comércio',
    vendedorLabel: 'Vendedor',
    emAtendimentoLabel: 'Pedido',
    fechadoGanhoLabel: 'Pedido Entregue',
    vendedorSubStatuses: ['Primeiro Contato', 'Negociação', 'Carteira'],
    emAtendimentoSubStatuses: ['Pedido em Separação', 'Pedido em Finalização', 'Pedido de Entrega'],
    lateralStatuses: ['Carteira', 'Arquivado', 'Parceiro', 'Cliente'],
  },
  advocacia: {
    id: 'advocacia',
    name: 'Advocacia',
    description: 'Funil para escritórios de advocacia',
    vendedorLabel: 'Comercial',
    emAtendimentoLabel: 'Reunião Jurídica',
    fechadoGanhoLabel: 'Contrato Fechado',
    vendedorSubStatuses: ['Análise Inicial', 'Negociação', 'Cliente'],
    emAtendimentoSubStatuses: ['Reunião Agendada', 'Reunião Realizada', 'Contrato Proposto'],
    lateralStatuses: ['Carteira', 'Arquivado', 'Parceiro', 'Cliente'],
  },
  engenharia: {
    id: 'engenharia',
    name: 'Engenharia / Construção',
    description: 'Funil para construtoras e escritórios de engenharia',
    vendedorLabel: 'Comercial',
    emAtendimentoLabel: 'Visita Técnica',
    fechadoGanhoLabel: 'Obra Contratada',
    vendedorSubStatuses: ['Análise Técnica', 'Orçamento Enviado', 'Cliente'],
    emAtendimentoSubStatuses: ['Visita Agendada', 'Visita Realizada', 'Proposta Enviada'],
    lateralStatuses: ['Carteira', 'Arquivado', 'Parceiro', 'Cliente'],
  },
  b2b_consultoria: {
    id: 'b2b_consultoria',
    name: 'Serviços B2B / Consultoria',
    description: 'Funil para consultorias e serviços empresariais',
    vendedorLabel: 'Consultor',
    emAtendimentoLabel: 'Reunião',
    fechadoGanhoLabel: 'Cliente Ativo',
    vendedorSubStatuses: ['Diagnóstico', 'Negociação', 'Cliente'],
    emAtendimentoSubStatuses: ['Reunião Agendada', 'Reunião Realizada', 'Proposta Enviada'],
    lateralStatuses: ['Carteira', 'Arquivado', 'Parceiro', 'Cliente'],
  },
  financeiro: {
    id: 'financeiro',
    name: 'Financeiro',
    description: 'Funil para instituições financeiras e fintechs',
    vendedorLabel: 'Vendedor',
    emAtendimentoLabel: 'Proposta',
    fechadoGanhoLabel: 'Proposta Paga',
    vendedorSubStatuses: ['Análise', 'Negociação', 'Carteira'],
    emAtendimentoSubStatuses: ['Proposta Enviada', 'Proposta em Análise', 'Proposta Assinada'],
    lateralStatuses: ['Carteira', 'Arquivado', 'Parceiro', 'Cliente'],
  },
};

// Helper to get niche options for select
export const getNicheOptions = () => {
  return Object.values(NICHE_FUNNEL_PRESETS).map(preset => ({
    id: preset.id,
    name: preset.name,
    description: preset.description,
  }));
};

// Generate complete funnel structure for a tenant based on niche
export interface TenantFunnelConfig {
  nicheId: NicheId;
  nicheName: string;
  mainStatuses: FunnelStatus[];
  lateralStatuses: FunnelStatus[];
  createdAt: string;
}

export function generateTenantFunnel(nicheId: NicheId): TenantFunnelConfig {
  const preset = NICHE_FUNNEL_PRESETS[nicheId];
  
  if (!preset) {
    throw new Error(`Niche "${nicheId}" not found`);
  }

  const now = new Date().toISOString();

  // Build main funnel statuses
  const mainStatuses: FunnelStatus[] = [
    // Fixed statuses (no substatus)
    { id: 'frio', label: 'Frio', order: 1, hasSubStatus: false },
    { id: 'morno', label: 'Morno', order: 2, hasSubStatus: false },
    { id: 'quente', label: 'Quente', order: 3, hasSubStatus: false },
    { id: 'qualificado', label: 'Qualificado', order: 4, hasSubStatus: false },
    // Vendedor status (customized by niche, with 3 substatus)
    {
      id: 'vendedor',
      label: preset.vendedorLabel,
      order: 5,
      hasSubStatus: true,
      subStatuses: preset.vendedorSubStatuses.map((label, index) => ({
        id: `vendedor_sub_${index + 1}`,
        label,
        order: index + 1,
      })),
    },
    // Em Atendimento status (customized by niche, with 3 substatus)
    {
      id: 'em_atendimento',
      label: preset.emAtendimentoLabel,
      order: 6,
      hasSubStatus: true,
      subStatuses: preset.emAtendimentoSubStatuses.map((label, index) => ({
        id: `atendimento_sub_${index + 1}`,
        label,
        order: index + 1,
      })),
    },
    // Fechado - Ganho (customized by niche, no substatus)
    {
      id: 'fechado_ganho',
      label: preset.fechadoGanhoLabel,
      order: 7,
      hasSubStatus: false,
    },
  ];

  // Build lateral statuses (always 4)
  const lateralStatuses: FunnelStatus[] = preset.lateralStatuses.map((label, index) => ({
    id: `lateral_${index + 1}`,
    label,
    order: index + 1,
    hasSubStatus: false,
    isLateral: true,
  }));

  return {
    nicheId,
    nicheName: preset.name,
    mainStatuses,
    lateralStatuses,
    createdAt: now,
  };
}

// Validate niche ID
export function isValidNicheId(id: string): id is NicheId {
  return id in NICHE_FUNNEL_PRESETS;
}

// Get niche by ID
export function getNicheById(id: NicheId): NicheFunnelPreset | undefined {
  return NICHE_FUNNEL_PRESETS[id];
}
