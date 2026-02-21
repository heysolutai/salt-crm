import { UserRole } from '@prisma/client';

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string;
    teamId: string | null;
    isActive: boolean;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
            tenantId?: string;
        }
    }
}
