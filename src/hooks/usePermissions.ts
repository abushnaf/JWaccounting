import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

export type AppRole = Database['public']['Enums']['app_role'];

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<AppRole, string[]> = {
  admin: [
    'inventory:read',
    'inventory:write',
    'inventory:delete',
    'sales:read',
    'sales:write',
    'sales:delete',
    'purchases:read',
    'purchases:write',
    'purchases:delete',
    'expenses:read',
    'expenses:write',
    'expenses:delete',
    'reports:read',
    'reports:write',
    'accounting:read',
    'accounting:write',
    'customers:read',
    'customers:write',
    'customers:delete',
    'suppliers:read',
    'suppliers:write',
    'suppliers:delete',
    'settings:read',
    'settings:write',
    'users:read',
    'users:write',
    'users:delete',
    'roles:read',
    'roles:write',
    'roles:delete',
  ],
  seller: [
    'inventory:read',
    'sales:read',
    'sales:write',
    'customers:read',
    'customers:write',
    'reports:read',
  ],
  accountant: [
    'inventory:read',
    'sales:read',
    'purchases:read',
    'purchases:write',
    'expenses:read',
    'expenses:write',
    'reports:read',
    'reports:write',
    'accounting:read',
    'accounting:write',
    'customers:read',
    'suppliers:read',
  ],
};

export function usePermissions() {
  const { profile } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    
    // Admin has all permissions
    if (profile.roles.includes('admin')) return true;
    
    // Check if any of the user's roles have the permission
    return profile.roles.some(role => 
      ROLE_PERMISSIONS[role]?.includes(permission)
    );
  };

  const hasRole = (role: AppRole): boolean => {
    return profile?.roles.includes(role) ?? false;
  };

  const hasAnyRole = (roles: AppRole[]): boolean => {
    return profile?.roles.some(role => roles.includes(role)) ?? false;
  };

  const canAccessRoute = (route: string): boolean => {
    const routePermissions: Record<string, string[]> = {
      '/': ['inventory:read'],
      '/sales': ['sales:read'],
      '/purchases': ['purchases:read'],
      '/expenses': ['expenses:read'],
      '/reports': ['reports:read'],
      '/accounting': ['accounting:read'],
      '/customers': ['customers:read'],
      '/suppliers': ['suppliers:read'],
      '/settings': ['settings:read'],
    };

    const requiredPermissions = routePermissions[route] || [];
    return requiredPermissions.every(permission => hasPermission(permission));
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccessRoute,
    userRoles: profile?.roles || [],
    isAdmin: hasRole('admin'),
    isSeller: hasRole('seller'),
    isAccountant: hasRole('accountant'),
  };
}

export function useRoleManagement() {
  const { profile, refreshProfile } = useAuth();

  const canManageUsers = (): boolean => {
    return profile?.roles.includes('admin') ?? false;
  };

  const canManageRoles = (): boolean => {
    return profile?.roles.includes('admin') ?? false;
  };

  return {
    canManageUsers,
    canManageRoles,
    refreshProfile,
  };
}
