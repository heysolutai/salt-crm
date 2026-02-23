import { prisma } from '../../config/database.js';

export class SuperAdminService {

    /**
     * List all tenants with aggregated data for the SuperAdmin dashboard
     */
    async listTenants() {
        const tenants = await prisma.tenant.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                plan: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                    }
                },
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        isActive: true,
                        lastLoginAt: true,
                    }
                },
                whatsappConnections: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true,
                        status: true,
                        type: true,
                        createdAt: true,
                    }
                },
                onboarding: true,
                _count: {
                    select: {
                        leads: true,
                        sales: true,
                        supportTickets: true,
                        criticalAlerts: true,
                    }
                }
            }
        });

        // Transform to match frontend Tenant interface
        return tenants.map(t => ({
            id: t.id,
            name: t.name,
            segment: t.segment || 'Geral',
            plan: t.plan?.displayName || t.plan?.name || 'Sem plano',
            status: t.status === 'active' ? 'ativa' : t.status === 'suspended' ? 'suspensa' : 'cancelada',
            lifecycleStatus: this.mapLifecycleStatus(t.lifecycleStatus),
            paymentStatus: t.paymentStatus === 'on_time' ? 'em_dia' : 'atraso',
            monthlyValue: Number(t.monthlyValue) || 0,
            usersActive: t.users.filter(u => u.isActive).length,
            usersLimit: t.usersLimit,
            whatsapps: t.whatsappConnections.map(wa => ({
                id: wa.id,
                number: wa.phoneNumber || '',
                type: wa.type === 'business' ? 'Business' : 'API',
                status: wa.status === 'connected' ? 'conectado' : wa.status === 'pending' ? 'pendente' : 'desconectado',
                lastActivity: wa.createdAt.toISOString(),
            })),
            users: t.users.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone || undefined,
                role: u.role as string,
                status: u.isActive ? 'ativo' : 'inativo',
                lastLogin: u.lastLoginAt?.toISOString() || '',
            })),
            modules: [],
            payments: [],
            onboarding: {
                adminCreated: t.onboarding?.adminCreated ?? false,
                additionalUsersCreated: t.onboarding?.usersCreated ?? false,
                whatsappConnected: t.onboarding?.whatsappConnected ?? false,
                funnelConfigured: t.onboarding?.funnelConfigured ?? false,
                iaConfigured: t.onboarding?.aiConfigured ?? false,
                firstLeadReceived: t.onboarding?.firstLeadReceived ?? false,
                firstServiceDone: t.onboarding?.firstSaleDone ?? false,
            },
            createdAt: t.createdAt.toISOString(),
            lastActivity: {
                type: 'login' as const,
                occurredAt: t.updatedAt.toISOString(),
            },
            email: t.email,
            phone: t.phone || '',
            document: t.document || '',
            salesOrigin: t.salesOrigin || '',
            internalNotes: t.internalNotes || '',
            healthScore: 100,
            leadsConverted: 0,
            leadsTotal: t._count.leads || 0,
            avgResponseTime: '-',
            avgFrequency: '-',
            churnRisk: 'baixo' as const,
            n8nFlows: [],
        }));
    }

    /**
     * Dashboard KPIs - real counts from the database
     */
    async getDashboardKPIs() {
        const [
            totalTenants,
            activeTenants,
            overdueTenants,
            suspendedTenants,
            totalActiveUsers,
            disconnectedWhatsapps,
            criticalAlerts,
        ] = await Promise.all([
            prisma.tenant.count(),
            prisma.tenant.count({ where: { status: 'active' } }),
            prisma.tenant.count({ where: { paymentStatus: 'overdue' } }),
            prisma.tenant.count({ where: { status: 'suspended' } }),
            prisma.user.count({ where: { isActive: true } }),
            prisma.whatsappConnection.count({ where: { status: 'disconnected' } }),
            prisma.criticalAlert.count({ where: { status: 'pending' } }),
        ]);

        return {
            totalTenants,
            activeTenants,
            overdueTenants,
            suspendedTenants,
            totalActiveUsers,
            disconnectedWhatsapps,
            criticalAlerts,
        };
    }

    /**
     * Financial KPIs
     */
    async getFinancialKPIs() {
        const tenants = await prisma.tenant.findMany({
            where: { status: 'active' },
            select: { monthlyValue: true },
        });

        const mrr = tenants.reduce((sum, t) => sum + Number(t.monthlyValue), 0);

        return {
            mrr,
            lastMonthRevenue: mrr,
            currentMonthRevenue: mrr,
            forecastedRevenue: mrr,
            overdueAmount: 0,
            avgTicket: tenants.length > 0 ? mrr / tenants.length : 0,
        };
    }

    private mapLifecycleStatus(status: string): string {
        const map: Record<string, string> = {
            onboarding: 'onboarding',
            active: 'ativo',
            risk: 'risco',
            overdue: 'inadimplente',
            suspended: 'suspenso',
            cancelled: 'cancelado',
        };
        return map[status] || 'onboarding';
    }
}

export const superAdminService = new SuperAdminService();
