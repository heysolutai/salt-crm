import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import { paginate } from '../../utils/helpers.js';
import type { AuthUser } from '../../types/express.js';
import type { CreateUserInput, UpdateUserInput, ListUsersQuery } from './users.schema.js';

export class UsersService {
    async findAll(authUser: AuthUser, query: ListUsersQuery) {
        const { page, limit, search, role, teamId, isActive } = query;

        const where: Prisma.UserWhereInput = {
            tenantId: authUser.tenantId,
        };

        // Filter by search term
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
        }

        // Filter by role
        if (role) {
            where.role = role;
        }

        // Filter by team
        if (teamId) {
            where.teamId = teamId;
        }

        // Filter by active status
        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        // If manager, only show team members
        if (authUser.role === 'manager') {
            where.OR = [
                { id: authUser.id },
                { managerId: authUser.id },
                { teamId: authUser.teamId },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phone: true,
                    avatarUrl: true,
                    role: true,
                    teamId: true,
                    managerId: true,
                    weight: true,
                    receivesLeads: true,
                    maxLeadsPerDay: true,
                    isActive: true,
                    lastLoginAt: true,
                    createdAt: true,
                    team: {
                        select: { id: true, name: true },
                    },
                    manager: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: { name: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        return paginate(users, page, limit, total);
    }

    async findById(authUser: AuthUser, id: string) {
        const user = await prisma.user.findFirst({
            where: {
                id,
                tenantId: authUser.tenantId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatarUrl: true,
                role: true,
                teamId: true,
                managerId: true,
                weight: true,
                receivesLeads: true,
                maxLeadsPerDay: true,
                workingHoursStart: true,
                workingHoursEnd: true,
                workingDays: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
                team: {
                    select: { id: true, name: true },
                },
                manager: {
                    select: { id: true, name: true },
                },
            },
        });

        if (!user) {
            throw new NotFoundError('Usuário não encontrado');
        }

        return user;
    }

    async create(authUser: AuthUser, data: CreateUserInput) {
        // Check if email already exists in tenant
        const existingUser = await prisma.user.findFirst({
            where: {
                tenantId: authUser.tenantId,
                email: data.email,
            },
        });

        if (existingUser) {
            throw new ConflictError('Email já está em uso');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 12);

        const user = await prisma.user.create({
            data: {
                tenantId: authUser.tenantId,
                email: data.email,
                password: hashedPassword,
                name: data.name,
                phone: data.phone,
                role: data.role,
                teamId: data.teamId,
                managerId: data.managerId,
                weight: data.weight,
                receivesLeads: data.receivesLeads,
                maxLeadsPerDay: data.maxLeadsPerDay,
                workingHoursStart: data.workingHoursStart,
                workingHoursEnd: data.workingHoursEnd,
                workingDays: data.workingDays,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        return user;
    }

    async update(authUser: AuthUser, id: string, data: UpdateUserInput) {
        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                id,
                tenantId: authUser.tenantId,
            },
        });

        if (!existingUser) {
            throw new NotFoundError('Usuário não encontrado');
        }

        // Check if email is being changed and if it's already in use
        if (data.email && data.email !== existingUser.email) {
            const emailInUse = await prisma.user.findFirst({
                where: {
                    tenantId: authUser.tenantId,
                    email: data.email,
                    NOT: { id },
                },
            });

            if (emailInUse) {
                throw new ConflictError('Email já está em uso');
            }
        }

        const user = await prisma.user.update({
            where: { id },
            data: {
                email: data.email,
                name: data.name,
                phone: data.phone,
                role: data.role,
                teamId: data.teamId,
                managerId: data.managerId,
                weight: data.weight,
                receivesLeads: data.receivesLeads,
                maxLeadsPerDay: data.maxLeadsPerDay,
                workingHoursStart: data.workingHoursStart,
                workingHoursEnd: data.workingHoursEnd,
                workingDays: data.workingDays,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                updatedAt: true,
            },
        });

        return user;
    }

    async delete(authUser: AuthUser, id: string) {
        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                id,
                tenantId: authUser.tenantId,
            },
        });

        if (!existingUser) {
            throw new NotFoundError('Usuário não encontrado');
        }

        // Soft delete - just deactivate
        await prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }
}

export const usersService = new UsersService();
