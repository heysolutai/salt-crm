import { Router } from 'express';
import { superAdminController } from './superadmin.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

// All superadmin routes require authentication
// Additional role check: only master/operational SuperAdmins
router.use(authMiddleware);

// Tenants
router.get('/tenants', superAdminController.listTenants);

// KPIs (dashboard + financial in one call)
router.get('/kpis', superAdminController.getKPIs);

export { router as superAdminRoutes };
