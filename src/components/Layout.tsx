import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  Package, 
  ShoppingCart, 
  ShoppingBag, 
  Receipt, 
  BarChart3,
  User,
  Settings,
  Users,
  UserCircle,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { usePermissions } from "@/hooks/usePermissions";

const mainTabs = [
  { id: "inventory", label: "المخزون", icon: Package, path: "/", permission: "inventory:read" },
  { id: "sales", label: "المبيعات", icon: ShoppingCart, path: "/sales", permission: "sales:read" },
  { id: "purchases", label: "المشتريات", icon: ShoppingBag, path: "/purchases", permission: "purchases:read" },
  { id: "expenses", label: "المصروفات", icon: Receipt, path: "/expenses", permission: "expenses:read" },
  { id: "reports", label: "التقارير", icon: BarChart3, path: "/reports", permission: "reports:read" },
];

const profileMenuItems = [
  { id: "accounting", label: "المحاسبة", icon: Receipt, path: "/accounting", permission: "accounting:read" },
  { id: "settings", label: "الإعدادات", icon: Settings, path: "/settings", permission: "settings:read" },
];

const roleLabels = {
  admin: "مدير النظام",
  seller: "بائع",
  accountant: "محاسب",
};

const roleColors = {
  admin: "bg-red-100 text-red-800 border-red-200",
  seller: "bg-blue-100 text-blue-800 border-blue-200",
  accountant: "bg-green-100 text-green-800 border-green-200",
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { settings } = useStore();
  const { hasPermission } = usePermissions();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    return profile?.full_name || 'مستخدم';
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-gold">
                <span className="text-xl font-bold text-primary-foreground">💎</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-primary">{settings.app_name}</h1>
                <p className="text-xs text-muted-foreground">إدارة متكاملة</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="flex flex-col items-start">
                  <span className="font-medium">{getUserDisplayName()}</span>
                  <div className="flex gap-1 mt-1">
                    {profile?.roles?.map((role) => (
                      <Badge key={role} className={`text-xs ${roleColors[role]}`}>
                        {roleLabels[role]}
                      </Badge>
                    ))}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {profileMenuItems
                  .filter(item => hasPermission(item.permission))
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className="cursor-pointer"
                      >
                        <Icon className="ml-2 w-4 h-4" />
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="ml-2 w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t bg-card/50 backdrop-blur-sm">
          <nav className="flex overflow-x-auto px-2 md:px-6 scrollbar-hide">
            <div className="flex gap-1 min-w-max">
              {mainTabs
                .filter(tab => hasPermission(tab.permission))
                .map((tab) => {
                  const Icon = tab.icon;
                  const active = isActive(tab.path);
                  return (
                    <Button
                      key={tab.id}
                      variant={active ? "default" : "ghost"}
                      size="sm"
                      onClick={() => navigate(tab.path)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 min-w-fit",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
                    </Button>
                  );
                })}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
