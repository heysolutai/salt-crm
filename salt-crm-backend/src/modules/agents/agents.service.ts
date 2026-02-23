import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../utils/errors.js';
import type { AuthUser } from '../../types/express.js';
import type { CreateAgentInput, UpdateAgentInput } from './agents.schema.js';

export class AgentsService {
    async findAll(authUser: AuthUser) {
        return prisma.aiAgent.findMany({
            where: { tenantId: authUser.tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(authUser: AuthUser, id: string) {
        const agent = await prisma.aiAgent.findFirst({
            where: {
                id,
                tenantId: authUser.tenantId,
            }
        });

        if (!agent) {
            throw new NotFoundError('Agente não encontrado');
        }

        return agent;
    }

    async create(authUser: AuthUser, data: CreateAgentInput) {
        return prisma.aiAgent.create({
            data: {
                tenantId: authUser.tenantId,
                name: data.name,
                isActive: data.isActive ?? true,
                webhookUrl: data.webhookUrl,
                config: data.config ? data.config : undefined,
            }
        });
    }

    async update(authUser: AuthUser, id: string, data: UpdateAgentInput) {
        const agent = await this.findById(authUser, id); // check existence/access

        return prisma.aiAgent.update({
            where: { id: agent.id },
            data: {
                name: data.name,
                isActive: data.isActive,
                webhookUrl: data.webhookUrl,
                config: data.config !== undefined ? data.config : undefined,
            },
        });
    }

    async delete(authUser: AuthUser, id: string) {
        const agent = await this.findById(authUser, id);

        await prisma.aiAgent.delete({
            where: { id: agent.id },
        });
    }
}

export const agentsService = new AgentsService();
