// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'agent';
  tenantId: string;
}

export interface Tenant {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  createdAt: string;
}

// Lead Types
export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  origin: string;
  reference?: string;
  status: LeadStatus;
  pipelineId: string;
  stageId: string;
  agentId?: string;
  managerId?: string;
  qualifiedByAI: boolean;
  createdAt: string;
  updatedAt: string;
  responseTime?: number;
  notes?: string[];
}

export type LeadStatus = 
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

// Pipeline & Funnel Types
export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
  count?: number;
}

// Distribution (Roleta) Types
export interface DistributionRule {
  id: string;
  name: string;
  type: 'round-robin' | 'weighted' | 'priority';
  active: boolean;
  criteria: DistributionCriteria;
}

export interface DistributionCriteria {
  origins?: string[];
  pipelines?: string[];
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  weight: number;
  active: boolean;
  managerId?: string;
  leadsCount?: number;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  teamId?: string;
  agentsCount?: number;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  agents: string[];
}

// AI Prompts
export interface AIPrompt {
  id: string;
  type: 'sdr' | 'followup' | 'nps';
  prompt: string;
  variables: string[];
  active: boolean;
}

export interface FollowUpMessage {
  id: string;
  stageId: string;
  message: string;
  delayHours: number;
  active: boolean;
}

// Notifications
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// KPI & Dashboard Types
export interface KPI {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// Filters
export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  origin?: string;
  managerId?: string;
  agentId?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
