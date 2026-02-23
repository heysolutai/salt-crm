import { Request, Response, NextFunction } from 'express';
import { superAdminService } from './superadmin.service.js';

class SuperAdminController {
    /**
     * GET /api/v1/superadmin/tenants
     * List all tenants with aggregated data
     */
    async listTenants(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenants = await superAdminService.listTenants();
            res.status(200).json(tenants);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/superadmin/kpis
     * Dashboard KPIs
     */
    async getKPIs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const [dashboard, financial] = await Promise.all([
                superAdminService.getDashboardKPIs(),
                superAdminService.getFinancialKPIs(),
            ]);
            res.status(200).json({ dashboard, financial });
        } catch (error) {
            next(error);
        }
    }
}

export const superAdminController = new SuperAdminController();
