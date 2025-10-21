# Role-Based Permission System

This document describes the role-based permission system implemented in the jewelry management application.

## Overview

The application implements a comprehensive role-based access control (RBAC) system with three main roles:

- **Admin** (مدير النظام): Full system access
- **Seller** (بائع): Sales and customer management
- **Accountant** (محاسب): Accounting, purchases, and expenses

## Architecture

### Database Layer

#### Tables
- `user_roles`: Maps users to their roles
- `profiles`: User profile information
- `has_role()`: Database function to check user roles

#### Row Level Security (RLS)
All tables implement RLS policies that check user roles before allowing access:
- **Read permissions**: Based on role requirements
- **Write permissions**: Based on role requirements  
- **Delete permissions**: Typically admin-only

### Frontend Layer

#### Authentication Context (`AuthContext`)
- Manages user authentication state
- Fetches user profile and roles
- Provides authentication methods

#### Permission Hooks (`usePermissions`)
- `hasPermission(permission)`: Check specific permission
- `hasRole(role)`: Check specific role
- `hasAnyRole(roles)`: Check multiple roles
- `canAccessRoute(route)`: Check route access

#### Route Protection (`ProtectedRoute`)
- Wraps components requiring authentication
- Checks permissions before rendering
- Shows access denied message if unauthorized

## Permission Matrix

| Feature | Admin | Seller | Accountant |
|---------|-------|--------|------------|
| **Inventory** | Read/Write/Delete | Read | Read |
| **Sales** | Read/Write/Delete | Read/Write | Read |
| **Purchases** | Read/Write/Delete | - | Read/Write |
| **Expenses** | Read/Write/Delete | - | Read/Write |
| **Reports** | Read/Write | Read | Read/Write |
| **Accounting** | Read/Write | - | Read/Write |
| **Customers** | Read/Write/Delete | Read/Write | Read |
| **Suppliers** | Read/Write/Delete | - | Read/Write |
| **Settings** | Read/Write | - | - |
| **User Management** | Full Access | - | - |

## Implementation Details

### Permission Strings
Permissions follow the pattern `resource:action`:
- `inventory:read`, `inventory:write`, `inventory:delete`
- `sales:read`, `sales:write`, `sales:delete`
- `purchases:read`, `purchases:write`, `purchases:delete`
- `expenses:read`, `expenses:write`, `expenses:delete`
- `reports:read`, `reports:write`
- `accounting:read`, `accounting:write`
- `customers:read`, `customers:write`, `customers:delete`
- `suppliers:read`, `suppliers:write`, `suppliers:delete`
- `settings:read`, `settings:write`
- `users:read`, `users:write`, `users:delete`
- `roles:read`, `roles:write`, `roles:delete`

### UI Components
- Navigation tabs filter based on permissions
- Action buttons show/hide based on permissions
- Settings sections require appropriate permissions
- User management restricted to admins

### Database Policies
Each table has specific RLS policies:
```sql
-- Example: Inventory policies
CREATE POLICY "Users with inventory:read can view inventory" ON public.inventory
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'seller') OR 
    public.has_role(auth.uid(), 'accountant')
  );
```

## Usage Examples

### Protecting a Component
```tsx
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission('sales:write')) {
    return <div>Access denied</div>;
  }
  
  return <div>Sales form</div>;
}
```

### Protecting a Route
```tsx
<Route 
  path="/sales" 
  element={
    <ProtectedRoute requiredPermission="sales:read">
      <Sales />
    </ProtectedRoute>
  } 
/>
```

### Conditional UI Elements
```tsx
const { hasPermission } = usePermissions();

return (
  <div>
    {hasPermission('users:write') && (
      <Button>Add User</Button>
    )}
  </div>
);
```

## Testing

### Test Users
The system includes test users for each role:
- **Admin**: admin@example.com / password123
- **Seller**: seller@example.com / password123  
- **Accountant**: accountant@example.com / password123

### Testing Scenarios
1. **Login**: Test authentication with different roles
2. **Navigation**: Verify menu items show/hide based on permissions
3. **Data Access**: Test CRUD operations with different roles
4. **Settings**: Verify role management access
5. **Route Protection**: Test unauthorized access attempts

## Security Considerations

1. **Database Level**: All data access controlled by RLS policies
2. **Frontend Level**: UI elements hidden for unauthorized users
3. **Route Level**: Routes protected by permission checks
4. **API Level**: Supabase handles authentication and authorization

## Future Enhancements

1. **Dynamic Permissions**: Allow admins to customize permissions
2. **Role Hierarchies**: Implement role inheritance
3. **Time-based Access**: Add time-based permission restrictions
4. **Audit Logging**: Track permission usage and changes
5. **Multi-tenant**: Support for multiple organizations
