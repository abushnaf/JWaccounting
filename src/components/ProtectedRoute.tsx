import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredRole,
  fallbackPath = "/" 
}: ProtectedRouteProps) {
  // Temporarily disable authentication checks to allow access
  return <>{children}</>;

  // Original authentication code (commented out for now):
  /*
  const { user, loading } = useAuth();
  const { hasPermission, hasRole } = usePermissions();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole as any)) {
    return (
      <div className="container py-6 md:py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="w-5 h-5" />
              غير مصرح بالوصول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ليس لديك الصلاحية المطلوبة للوصول إلى هذه الصفحة.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              الدور المطلوب: {requiredRole}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="container py-6 md:py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              غير مصرح بالوصول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ليس لديك الصلاحية المطلوبة للوصول إلى هذه الصفحة.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              الصلاحية المطلوبة: {requiredPermission}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
  */
}

// Higher-order component for protecting routes
export function withPermission<T extends object>(
  Component: React.ComponentType<T>,
  requiredPermission?: string,
  requiredRole?: string
) {
  return function ProtectedComponent(props: T) {
    return (
      <ProtectedRoute 
        requiredPermission={requiredPermission}
        requiredRole={requiredRole}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
