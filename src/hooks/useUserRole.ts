import { useMemo } from 'react';

export type UserRole = 
  | 'SUPER_ADMIN_MASTER' 
  | 'SUPER_ADMIN_OPERACIONAL' 
  | 'TENANT_ADMIN' 
  | 'TENANT_GERENTE' 
  | 'TENANT_VENDEDOR';

interface UserSession {
  email: string;
  loggedIn: boolean;
  role: UserRole;
  name: string;
}

interface RolePermissions {
  canAccessHome: boolean;
  canAccessDashboard: boolean;
  canAccessFunil: boolean;
  canAccessRoleta: boolean;
  canAccessOutros: boolean;
  canAccessSuperAdmin: boolean;
  canManageUsers: boolean;
  canManageTeams: boolean;
  canManageSettings: boolean;
  roleName: string;
}

const rolePermissionsMap: Record<UserRole, RolePermissions> = {
  SUPER_ADMIN_MASTER: {
    canAccessHome: false,
    canAccessDashboard: false,
    canAccessFunil: false,
    canAccessRoleta: false,
    canAccessOutros: false,
    canAccessSuperAdmin: true,
    canManageUsers: true,
    canManageTeams: true,
    canManageSettings: true,
    roleName: 'Super Admin Master',
  },
  SUPER_ADMIN_OPERACIONAL: {
    canAccessHome: false,
    canAccessDashboard: false,
    canAccessFunil: false,
    canAccessRoleta: false,
    canAccessOutros: false,
    canAccessSuperAdmin: true,
    canManageUsers: false,
    canManageTeams: false,
    canManageSettings: false,
    roleName: 'Super Admin Operacional',
  },
  TENANT_ADMIN: {
    canAccessHome: true,
    canAccessDashboard: true,
    canAccessFunil: true,
    canAccessRoleta: true,
    canAccessOutros: true,
    canAccessSuperAdmin: false,
    canManageUsers: true,
    canManageTeams: true,
    canManageSettings: true,
    roleName: 'Administrador',
  },
  TENANT_GERENTE: {
    canAccessHome: false,
    canAccessDashboard: true,
    canAccessFunil: true,
    canAccessRoleta: false,
    canAccessOutros: false,
    canAccessSuperAdmin: false,
    canManageUsers: false,
    canManageTeams: false,
    canManageSettings: false,
    roleName: 'Gerente',
  },
  TENANT_VENDEDOR: {
    canAccessHome: false,
    canAccessDashboard: false,
    canAccessFunil: true,
    canAccessRoleta: false,
    canAccessOutros: false,
    canAccessSuperAdmin: false,
    canManageUsers: false,
    canManageTeams: false,
    canManageSettings: false,
    roleName: 'Vendedor',
  },
};

export function useUserRole() {
  // Read session directly without useMemo to ensure fresh data on each render
  const getSession = (): UserSession | null => {
    try {
      const stored = localStorage.getItem('salt_session');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Invalid session
    }
    return null;
  };
  
  const session = getSession();

  const role = session?.role || 'TENANT_ADMIN';
  const permissions = rolePermissionsMap[role] || rolePermissionsMap.TENANT_ADMIN;

  return {
    session,
    role,
    permissions,
    isLoggedIn: session?.loggedIn || false,
    userName: session?.name || 'Usuário',
    userEmail: session?.email || '',
    isSuperAdmin: role === 'SUPER_ADMIN_MASTER' || role === 'SUPER_ADMIN_OPERACIONAL',
    isTenantUser: role.startsWith('TENANT_'),
  };
}

export function getUserRole(): UserRole {
  try {
    const stored = localStorage.getItem('salt_session');
    if (stored) {
      const session = JSON.parse(stored);
      return session.role || 'TENANT_ADMIN';
    }
  } catch {
    // Invalid session
  }
  return 'TENANT_ADMIN';
}

export function getRolePermissions(role: UserRole): RolePermissions {
  return rolePermissionsMap[role] || rolePermissionsMap.TENANT_ADMIN;
}
