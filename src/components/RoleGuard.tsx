import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole, UserRole } from '@/hooks/useUserRole';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: 
    | 'canAccessHome'
    | 'canAccessDashboard'
    | 'canAccessFunil'
    | 'canAccessRoleta'
    | 'canAccessOutros'
    | 'canAccessSuperAdmin';
  fallbackPath?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  fallbackPath,
}) => {
  const { role, permissions, isLoggedIn, isSuperAdmin } = useUserRole();

  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Determine fallback based on role permissions
  const getDefaultFallback = () => {
    if (isSuperAdmin) return '/super-admin';
    if (permissions.canAccessHome) return '/home';
    if (permissions.canAccessDashboard) return '/home';
    return '/home';
  };

  // Check by specific roles
  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirect = fallbackPath || getDefaultFallback();
    return <Navigate to={redirect} replace />;
  }

  // Check by permission
  if (requiredPermission && !permissions[requiredPermission]) {
    const redirect = fallbackPath || getDefaultFallback();
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
