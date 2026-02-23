import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../utils/errors.js';
import type { AuthUser } from '../../types/express.js';
import type {
    CreateFunnelInput,
    UpdateFunnelInput,
    CreateStageInput,
    UpdateStageInput,
    ReorderStagesInput
} from './funnels.schema.js';

export class FunnelsService {
    // ============== FUNNEL CRUD ==============

    async findAll(authUser: AuthUser) {
        return prisma.funnel.findMany({
            where: {
                tenantId: authUser.tenantId,
                isActive: true,
            },
            include: {
                stages: {
                    orderBy: { orderIndex: 'asc' },
                    select: {
                        id: true,
                        name: true,
                        color: true,
                        orderIndex: true,
                        isEntry: true,
                        isExit: true,
                        exitType: true,
                        leads: {
                            orderBy: { createdAt: 'desc' },
                            include: {
                                origin: { select: { id: true, name: true, type: true, color: true } },
                                assignedTo: { select: { id: true, name: true, avatarUrl: true } }
                            }
                        }
                    },
                },
                _count: {
                    select: { leads: true },
                },
            },
            orderBy: [
                { isDefault: 'desc' },
                { name: 'asc' },
            ],
        });
    }

    async findById(authUser: AuthUser, id: string) {
        const funnel = await prisma.funnel.findFirst({
            where: {
                id,
                tenantId: authUser.tenantId,
            },
            include: {
                stages: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        leads: {
                            orderBy: { createdAt: 'desc' },
                            include: {
                                origin: { select: { id: true, name: true, type: true, color: true } },
                                assignedTo: { select: { id: true, name: true, avatarUrl: true } }
                            }
                        }
                    }
                },
                _count: {
                    select: { leads: true },
                },
            },
        });

        if (!funnel) {
            throw new NotFoundError('Funil não encontrado');
        }

        return funnel;
    }

    async create(authUser: AuthUser, data: CreateFunnelInput) {
        // Check for duplicate name
        const existing = await prisma.funnel.findFirst({
            where: {
                tenantId: authUser.tenantId,
                name: data.name,
            },
        });

        if (existing) {
            throw new ConflictError('Já existe um funil com este nome');
        }

        // If setting as default, unset others
        if (data.isDefault) {
            await prisma.funnel.updateMany({
                where: { tenantId: authUser.tenantId },
                data: { isDefault: false },
            });
        }

        return prisma.funnel.create({
            data: {
                tenantId: authUser.tenantId,
                name: data.name,
                type: data.type,
                description: data.description,
                isDefault: data.isDefault,
            },
            include: {
                stages: true,
            },
        });
    }

    async update(authUser: AuthUser, id: string, data: UpdateFunnelInput) {
        const funnel = await this.findById(authUser, id);

        // Check for duplicate name if changing
        if (data.name && data.name !== funnel.name) {
            const existing = await prisma.funnel.findFirst({
                where: {
                    tenantId: authUser.tenantId,
                    name: data.name,
                    NOT: { id },
                },
            });

            if (existing) {
                throw new ConflictError('Já existe um funil com este nome');
            }
        }

        // If setting as default, unset others
        if (data.isDefault) {
            await prisma.funnel.updateMany({
                where: { tenantId: authUser.tenantId, NOT: { id } },
                data: { isDefault: false },
            });
        }

        return prisma.funnel.update({
            where: { id },
            data,
            include: {
                stages: {
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });
    }

    async delete(authUser: AuthUser, id: string) {
        const funnel = await this.findById(authUser, id);

        // Check if funnel has leads
        if (funnel._count.leads > 0) {
            throw new BadRequestError('Não é possível excluir funil com leads ativos');
        }

        // Soft delete
        await prisma.funnel.update({
            where: { id },
            data: { isActive: false },
        });
    }

    // ============== STAGE CRUD ==============

    async createStage(authUser: AuthUser, funnelId: string, data: CreateStageInput) {
        // Verify funnel ownership
        await this.findById(authUser, funnelId);

        // Only one entry stage allowed
        if (data.isEntry) {
            const existingEntry = await prisma.funnelStage.findFirst({
                where: { funnelId, isEntry: true },
            });

            if (existingEntry) {
                throw new ConflictError('Já existe uma etapa de entrada neste funil');
            }
        }

        // Exit type required if isExit
        if (data.isExit && !data.exitType) {
            throw new BadRequestError('Etapa de saída requer tipo de saída');
        }

        return prisma.funnelStage.create({
            data: {
                tenantId: authUser.tenantId,
                funnelId,
                name: data.name,
                color: data.color,
                orderIndex: data.orderIndex,
                isEntry: data.isEntry,
                isExit: data.isExit,
                exitType: data.exitType,
                slaHours: data.slaHours,
                autoFollowupHours: data.autoFollowupHours,
                description: data.description,
            },
        });
    }

    async updateStage(authUser: AuthUser, funnelId: string, stageId: string, data: UpdateStageInput) {
        // Verify funnel ownership
        await this.findById(authUser, funnelId);

        const stage = await prisma.funnelStage.findFirst({
            where: { id: stageId, funnelId },
        });

        if (!stage) {
            throw new NotFoundError('Etapa não encontrada');
        }

        // Only one entry stage allowed
        if (data.isEntry && !stage.isEntry) {
            const existingEntry = await prisma.funnelStage.findFirst({
                where: { funnelId, isEntry: true, NOT: { id: stageId } },
            });

            if (existingEntry) {
                throw new ConflictError('Já existe uma etapa de entrada neste funil');
            }
        }

        return prisma.funnelStage.update({
            where: { id: stageId },
            data,
        });
    }

    async deleteStage(authUser: AuthUser, funnelId: string, stageId: string) {
        // Verify funnel ownership
        await this.findById(authUser, funnelId);

        const stage = await prisma.funnelStage.findFirst({
            where: { id: stageId, funnelId },
            include: {
                _count: { select: { leads: true } },
            },
        });

        if (!stage) {
            throw new NotFoundError('Etapa não encontrada');
        }

        if (stage._count.leads > 0) {
            throw new BadRequestError('Não é possível excluir etapa com leads');
        }

        await prisma.funnelStage.delete({
            where: { id: stageId },
        });
    }

    async reorderStages(authUser: AuthUser, funnelId: string, data: ReorderStagesInput) {
        // Verify funnel ownership
        await this.findById(authUser, funnelId);

        // Update all stages in transaction
        await prisma.$transaction(
            data.stages.map((stage) =>
                prisma.funnelStage.update({
                    where: { id: stage.id },
                    data: { orderIndex: stage.orderIndex },
                })
            )
        );

        // Return updated funnel
        return this.findById(authUser, funnelId);
    }
}

export const funnelsService = new FunnelsService();
