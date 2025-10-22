import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Users, Shield, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { usePermissions, useRoleManagement } from "@/hooks/usePermissions";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

const roleLabels: Record<AppRole, string> = {
  admin: "مدير النظام",
  seller: "بائع",
  accountant: "محاسب",
};

const roleDescriptions: Record<AppRole, string> = {
  admin: "صلاحيات كاملة لإدارة النظام والمستخدمين",
  seller: "إدارة المبيعات والعملاء والمخزون",
  accountant: "إدارة المحاسبة والمشتريات والمصروفات",
};

const roleColors: Record<AppRole, string> = {
  admin: "bg-red-100 text-red-800 border-red-200",
  seller: "bg-blue-100 text-blue-800 border-blue-200",
  accountant: "bg-green-100 text-green-800 border-green-200",
};

export default function RoleManagement() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const queryClient = useQueryClient();
  const { canManageUsers, canManageRoles } = useRoleManagement();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "seller" as AppRole,
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      return profiles.map((profile) => ({
        ...profile,
        roles: roles.filter((r) => r.user_id === profile.id).map((r) => r.role),
      }));
    },
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user via Supabase admin API
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Assign role
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: authData.user.id,
          role: formData.role,
        });

        if (roleError) throw roleError;
      }

      toast.success("تم إنشاء المستخدم بنجاح");
      setOpen(false);
      setFormData({
        email: "",
        password: "",
        full_name: "",
        role: "seller",
      });
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "حدث خطأ أثناء إنشاء المستخدم");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: AppRole) => {
    try {
      // Delete existing roles
      await supabase.from("user_roles").delete().eq("user_id", userId);
      
      // Insert new role
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: newRole,
      });

      if (error) throw error;

      toast.success("تم تحديث صلاحيات المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("حدث خطأ أثناء تحديث صلاحيات المستخدم");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", userId);

      if (error) throw error;

      toast.success("تم حذف المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("حدث خطأ أثناء حذف المستخدم");
    }
  };

  if (!canManageUsers()) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            إدارة الأدوار والصلاحيات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            ليس لديك صلاحية لإدارة الأدوار والصلاحيات
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          إدارة الأدوار والصلاحيات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">الأدوار المتاحة</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(roleLabels).map(([role, label]) => (
              <div key={role} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={roleColors[role as AppRole]}>
                    {label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {roleDescriptions[role as AppRole]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* User Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">إدارة المستخدمين</h3>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة مستخدم
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">الاسم الكامل</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">الدور</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: AppRole) =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleLabels).map(([role, label]) => (
                          <SelectItem key={role} value={role}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? "جاري الإنشاء..." : "إنشاء المستخدم"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Users List */}
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-center py-4">جاري التحميل...</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          className={roleColors[role]}
                        >
                          {roleLabels[role]}
                        </Badge>
                      ))}
                    </div>
                    <Select
                      value={user.roles[0] || "seller"}
                      onValueChange={(value: AppRole) =>
                        handleUpdateUserRole(user.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleLabels).map(([role, label]) => (
                          <SelectItem key={role} value={role}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
