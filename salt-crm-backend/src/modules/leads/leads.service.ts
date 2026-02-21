import { prisma } from '../../config/database.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors.js';
import { paginate } from '../../utils/helpers.js';
import type { AuthUser } from '../../types/express.js';
import type {
    CreateLeadInput,
    UpdateLeadInput,
    MoveLeadInput,
    AssignLeadInput,
    ListLeadsQuery
} from './leads.schema.js';

type LeadWhereInput = Parameters<typeof prisma.lead.findMany>[0] extends { where?: infer W } ? W : never;

export class LeadsService {
    // Common select for lead queries
    private readonly leadSelect = {
        id: true,
        name: true,
        phone: true,
        email: true,
        document: true,
        city: true,
        state: true,
        temperature: true,
        qualifiedByAi: true,
        aiQualificationScore: true,
        firstResponseAt: true,
        responseTimeSeconds: true,
        lastInteractionAt: true,
        interactionCount: true,
        createdAt: true,
        updatedAt: true,
        stage: {
            select: { id: true, name: true, color: true, orderIndex: true },
        },
        funnel: {
            select: { id: true, name: true, type: true },
        },
        origin: {
            select: { id: true, name: true, type: true, color: true },
        },
        assignedTo: {
            select: { id: true, name: true, avatarUrl: true },
        },
        team: {
            select: { id: true, name: true },
        },
        _count: {
            select: { conversations: true, sales: true, schedules: true },
        },
    };

    // Build where clause based on user role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private buildWhereClause(authUser: AuthUser, query: ListLeadsQuery): Record<string, any> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = {
            tenantId: authUser.tenantId,
        };

        // Apply role-based filtering
        if (authUser.role === 'agent') {
            // Agents only see their own leads
            where.assignedToId = authUser.id;
        } else if (authUser.role === 'manager') {
            // Managers see their team's leads and their own
            where.OR = [
                { assignedToId: authUser.id },
                { teamId: authUser.teamId },
                { assignedTo: { managerId: authUser.id } },
            ];
        }
        // Admin sees all leads (no additional filter)

        // Search
        if (query.search) {
            where.AND = [
                {
                    OR: [
                        { name: { contains: query.search, mode: 'insensitive' } },
                        { phone: { contains: query.search } },
                        { email: { contains: query.search, mode: 'insensitive' } },
                    ],
                },
            ];
        }

        // Filters
        if (query.funnelId) where.funnelId = query.funnelId;
        if (query.stageId) where.stageId = query.stageId;
        if (query.temperature) where.temperature = query.temperature;
        if (query.originId) where.originId = query.originId;
        if (query.qualifiedByAi !== undefined) where.qualifiedByAi = query.qualifiedByAi;

        // Team/Assignment filters (only for admin/manager)
        if (authUser.role !== 'agent') {
            if (query.assignedToId) where.assignedToId = query.assignedToId;
            if (query.teamId) where.teamId = query.teamId;
        }

        // Date range
        if (query.startDate || query.endDate) {
            where.createdAt = {};
            if (query.startDate) where.createdAt.gte = new Date(query.startDate);
            if (query.endDate) where.createdAt.lte = new Date(query.endDate);
        }

        return where;
    }

    async findAll(authUser: AuthUser, query: ListLeadsQuery) {
        const { page, limit } = query;
        const where = this.buildWhereClause(authUser, query);

        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                select: this.leadSelect,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.lead.count({ where }),
        ]);

        return paginate(leads, page, limit, total);
    }

    async findById(authUser: AuthUser, id: string) {
        const lead = await prisma.lead.findFirst({
            where: {
                id,
                tenantId: authUser.tenantId,
            },
            include: {
                stage: true,
                funnel: true,
                origin: true,
                assignedTo: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                },
                team: true,
                lossReason: true,
                tags: { include: { tag: true } },
                _count: {
                    select: { conversations: true, sales: true, schedules: true, history: true },
                },
            },
        });

        if (!lead) {
            throw new NotFoundError('Lead não encontrado');
        }

        // Check access based on role
        if (authUser.role === 'agent' && lead.assignedToId !== authUser.id) {
            throw new ForbiddenError('Acesso negado a este lead');
        }

        return lead;
    }

    async create(authUser: AuthUser, data: CreateLeadInput) {
        // Verify funnel and stage exist
        const stage = await prisma.funnelStage.findFirst({
            where: {
                id: data.stageId,
                funnelId: data.funnelId,
                funnel: { tenantId: authUser.tenantId },
            },
        });

        if (!stage) {
            throw new BadRequestError('Funil ou etapa inválidos');
        }

        // Create lead
        const lead = await prisma.lead.create({
            data: {
                tenantId: authUser.tenantId,
                name: data.name,
                phone: data.phone,
                email: data.email,
                document: data.document,
                documentType: data.documentType,
                city: data.city,
                state: data.state,
                country: data.country,
                addressStreet: data.addressStreet,
                addressNumber: data.addressNumber,
                addressComplement: data.addressComplement,
                addressNeighborhood: data.addressNeighborhood,
                addressZipcode: data.addressZipcode,
                originId: data.originId,
                reference: data.reference,
                utmSource: data.utmSource,
                utmMedium: data.utmMedium,
                utmCampaign: data.utmCampaign,
                utmContent: data.utmContent,
                utmTerm: data.utmTerm,
                funnelId: data.funnelId,
                stageId: data.stageId,
                temperature: data.temperature,
                assignedToId: data.assignedToId,
                teamId: data.teamId,
                customFields: data.customFields,
            },
            include: {
                stage: true,
                funnel: true,
                origin: true,
                assignedTo: {
                    select: { id: true, name: true },
                },
            },
        });

        // Create initial stage history
        await prisma.leadStageHistory.create({
            data: {
                tenantId: authUser.tenantId,
                leadId: lead.id,
                toStageId: data.stageId,
                changedById: authUser.id,
                notes: 'Lead criado',
            },
        });

        // Create lead history
        await prisma.leadHistory.create({
            data: {
                tenantId: authUser.tenantId,
                leadId: lead.id,
                eventType: 'observation',
                title: 'Lead criado',
                description: `Lead ${data.name} foi criado`,
                createdById: authUser.id,
            },
        });

        return lead;
    }

    async update(authUser: AuthUser, id: string, data: UpdateLeadInput) {
        const lead = await this.findById(authUser, id);

        // If agent, can only update own leads
        if (authUser.role === 'agent' && lead.assignedToId !== authUser.id) {
            throw new ForbiddenError('Você não pode editar este lead');
        }

        return prisma.lead.update({
            where: { id },
            data,
            select: this.leadSelect,
        });
    }

    async moveStage(authUser: AuthUser, id: string, data: MoveLeadInput) {
        const lead = await this.findById(authUser, id);

        // Verify new stage belongs to same funnel
        const newStage = await prisma.funnelStage.findFirst({
            where: {
                id: data.stageId,
                funnelId: lead.funnelId,
            },
        });

        if (!newStage) {
            throw new BadRequestError('Etapa inválida para este funil');
        }

        // Calculate time in previous stage
        const lastStageChange = await prisma.leadStageHistory.findFirst({
            where: { leadId: id },
            orderBy: { createdAt: 'desc' },
        });

        const timeInPreviousStage = lastStageChange
            ? Math.floor((Date.now() - lastStageChange.createdAt.getTime()) / 1000)
            : null;

        // Update lead
        const updatedLead = await prisma.lead.update({
            where: { id },
            data: { stageId: data.stageId },
            select: this.leadSelect,
        });

        // Create stage history
        await prisma.leadStageHistory.create({
            data: {
                tenantId: authUser.tenantId,
                leadId: id,
                fromStageId: lead.stageId,
                toStageId: data.stageId,
                changedById: authUser.id,
                timeInPreviousStageSeconds: timeInPreviousStage,
                notes: data.notes,
            },
        });

        // Create lead history
        await prisma.leadHistory.create({
            data: {
                tenantId: authUser.tenantId,
                leadId: id,
                eventType: 'status_change',
                title: `Movido para ${newStage.name}`,
                description: data.notes || `Lead movido de ${lead.stage.name} para ${newStage.name}`,
                createdById: authUser.id,
                metadata: {
                    fromStage: lead.stage.name,
                    toStage: newStage.name,
                },
            },
        });

        return updatedLead;
    }

    async assign(authUser: AuthUser, id: string, data: AssignLeadInput) {
        // Only admin/manager can assign leads
        if (authUser.role === 'agent') {
            throw new ForbiddenError('Apenas gerentes e administradores podem atribuir leads');
        }

        const lead = await this.findById(authUser, id);

        const updatedLead = await prisma.lead.update({
            where: { id },
            data: {
                assignedToId: data.assignedToId,
                teamId: data.teamId,
            },
            select: this.leadSelect,
        });

        // Create history
        const assignedUser = data.assignedToId
            ? await prisma.user.findUnique({ where: { id: data.assignedToId }, select: { name: true } })
            : null;

        await prisma.leadHistory.create({
            data: {
                tenantId: authUser.tenantId,
                leadId: id,
                eventType: 'assignment',
                title: data.assignedToId ? `Atribuído a ${assignedUser?.name}` : 'Removido atribuição',
                createdById: authUser.id,
            },
        });

        return updatedLead;
    }

    async getHistory(authUser: AuthUser, id: string) {
        await this.findById(authUser, id); // Verify access

        return prisma.leadHistory.findMany({
            where: { leadId: id },
            orderBy: { createdAt: 'desc' },
            include: {
                createdBy: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
            take: 50,
        });
    }

    async getStageHistory(authUser: AuthUser, id: string) {
        await this.findById(authUser, id); // Verify access

        return prisma.leadStageHistory.findMany({
            where: { leadId: id },
            orderBy: { createdAt: 'desc' },
            include: {
                fromStage: { select: { id: true, name: true, color: true } },
                toStage: { select: { id: true, name: true, color: true } },
                changedBy: { select: { id: true, name: true } },
            },
        });
    }
}

export const leadsService = new LeadsService();
