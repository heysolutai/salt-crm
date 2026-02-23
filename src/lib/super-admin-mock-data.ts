// Super Admin Data - will be fetched from API

export type SuperAdminRole = 'SUPER_ADMIN_MASTER' | 'SUPER_ADMIN_OPERACIONAL';
export type ClientLifecycleStatus = 'onboarding' | 'active' | 'risk' | 'overdue' | 'suspended' | 'cancelled';
export type SupportPriority = 'baixa' | 'media' | 'alta' | 'critica';
export type SupportStatus = 'aberto' | 'em_andamento' | 'resolvido';
export type SupportType = 'whatsapp' | 'ia' | 'billing' | 'tecnico' | 'outro';
export type ActivityType = 'login' | 'lead_created' | 'sale_closed' | 'message_sent';
export type PlanId = 'start' | 'pro' | 'enterprise';

export interface SuperAdminUser {
  id: string;
  name: string;
  email: string;
  role: SuperAdminRole;
  status: 'ativo' | 'inativo';
  lastLogin: string;
  avatar?: string;
}

export interface TenantUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'gerente' | 'vendedor';
  status: 'ativo' | 'inativo';
  lastLogin: string;
}

export interface TenantModule {
  id: string;
  name: string;
  enabled: boolean;
}

export interface WhatsAppConnection {
  id: string;
  number: string;
  type: 'Business' | 'API';
  status: 'conectado' | 'desconectado' | 'pendente';
  lastActivity: string;
}

export interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  status: 'pago' | 'pendente' | 'atrasado';
  method: string;
  invoiceUrl?: string;
}

export interface CriticalAlert {
  id: string;
  tenantId: string;
  tenantName: string;
  flowName: string;
  errorMessage: string;
  occurredAt: string;
  status: 'pendente' | 'resolvido';
  resolvedBy?: string;
  resolvedAt?: string;
  type: 'error' | 'warning' | 'connection';
}

export interface SupportTicket {
  id: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  userName: string;
  type: SupportType;
  subject: string;
  description: string;
  priority: SupportPriority;
  status: SupportStatus;
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface OnboardingChecklist {
  adminCreated: boolean;
  additionalUsersCreated: boolean;
  whatsappConnected: boolean;
  funnelConfigured: boolean;
  iaConfigured: boolean;
  firstLeadReceived: boolean;
  firstServiceDone: boolean;
}

export interface LastActivity {
  type: ActivityType;
  occurredAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  segment: string;
  plan: string;
  status: 'ativa' | 'suspensa' | 'cancelada';
  lifecycleStatus: ClientLifecycleStatus;
  paymentStatus: 'em_dia' | 'atraso';
  monthlyValue: number;
  usersActive: number;
  usersLimit: number;
  whatsappConnections: WhatsAppConnection[];
  users: TenantUser[];
  modules: TenantModule[];
  payments: PaymentHistory[];
  onboarding: OnboardingChecklist;
  createdAt: string;
  lastActivity: LastActivity;
  email: string;
  phone: string;
  document: string;
  salesOrigin: string;
  internalNotes: string;
  healthScore: number;
  leadsConverted: number;
  leadsTotal: number;
  avgResponseTime: string;
  avgFrequency: string;
  churnRisk: 'baixo' | 'medio' | 'alto';
  n8nFlows: {
    id: string;
    name: string;
    status: 'ativo' | 'inativo';
    lastRun: string;
  }[];
}

export interface FinancialKPIs {
  mrr: number;
  lastMonthRevenue: number;
  currentMonthRevenue: number;
  forecastedRevenue: number;
  overdueAmount: number;
  avgTicket: number;
}

export interface DashboardKPIs {
  totalTenants: number;
  activeTenants: number;
  overdueTenants: number;
  suspendedTenants: number;
  totalActiveUsers: number;
  disconnectedWhatsapps: number;
  criticalAlerts: number;
}

// Labels Mappings (Estrututais, mantidos)
export const activityTypeLabels: Record<ActivityType, string> = {
  login: 'Login',
  lead_created: 'Lead Criado',
  sale_closed: 'Venda Fechada',
  message_sent: 'Mensagem Enviada'
};

export const lifecycleStatusLabels: Record<ClientLifecycleStatus, string> = {
  onboarding: 'Onboarding',
  active: 'Ativo',
  risk: 'Em Risco',
  overdue: 'Inadimplente',
  suspended: 'Suspenso',
  cancelled: 'Cancelado'
};

export const supportTypeLabels: Record<SupportType, string> = {
  whatsapp: 'WhatsApp',
  ia: 'Inteligência Artificial',
  billing: 'Financeiro',
  tecnico: 'Técnico',
  outro: 'Outro'
};

export const supportPriorityLabels: Record<SupportPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica'
};

// Legacy mappings placeholders
export const nichePresets: any[] = [];
export const availablePlans: any[] = [];
export const legacyPlanMapping: any = {};

// Mock Data (Vazios para limpar tela)

export const mockCurrentSuperAdmin: SuperAdminUser = {
  id: '',
  name: '',
  email: '',
  role: 'SUPER_ADMIN_MASTER',
  status: 'ativo',
  lastLogin: ''
};

export const mockSuperAdminUsers: SuperAdminUser[] = [];

export const mockFinancialKPIs: FinancialKPIs = {
  mrr: 0,
  lastMonthRevenue: 0,
  currentMonthRevenue: 0,
  forecastedRevenue: 0,
  overdueAmount: 0,
  avgTicket: 0,
};

export const mockDashboardKPIs: DashboardKPIs = {
  totalTenants: 0,
  activeTenants: 0,
  overdueTenants: 0,
  suspendedTenants: 0,
  totalActiveUsers: 0,
  disconnectedWhatsapps: 0,
  criticalAlerts: 0,
};

export const mockSupportTickets: SupportTicket[] = [];
export const mockCriticalAlerts: CriticalAlert[] = [];
export const mockTenants: Tenant[] = [];

export interface RevenueDataPoint {
  month: string;
  value: number;
}

export const mockRevenueData: RevenueDataPoint[] = [];

export interface ChurnDataPoint {
  month: string;
  rate: number;
  churned: number;
}

export const mockChurnData: ChurnDataPoint[] = [];

export interface ActivityLogItem {
  id: string;
  user: string;
  action: string;
  tenant?: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export const mockActivityLog: ActivityLogItem[] = [];
