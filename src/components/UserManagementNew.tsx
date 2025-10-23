import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Users, UserPlus, Shield } from "lucide-react";
import { toast } from "sonner";
import { useRoleManagement, ROLE_PERMISSIONS } from "@/hooks/usePermissions";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

interface CustomRole {
  id: string;
  name: string;
  displayName: string;
  permissions: string[];
  color: string;
}

const defaultRoles: CustomRole[] = [
  {
    id: "admin",
    name: "admin",
    displayName: "مدير النظام",
    permissions: ["inventory:read", "inventory:write", "inventory:delete", "sales:read", "sales:write", "sales:delete", "purchases:read", "purchases:write", "purchases:delete", "expenses:read", "expenses:write", "expenses:delete", "reports:read", "reports:write", "accounting:read", "accounting:write", "customers:read", "customers:write", "customers:delete", "suppliers:read", "suppliers:write", "suppliers:delete", "settings:read", "settings:write", "users:read", "users:write", "users:delete", "roles:read", "roles:write", "roles:delete"],
    color: "bg-red-100 text-red-800 border-red-200"
  },
  {
    id: "seller",
    name: "seller", 
    displayName: "بائع",
    permissions: ["inventory:read", "sales:read", "sales:write", "customers:read", "customers:write", "reports:read"],
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  {
    id: "accountant",
    name: "accountant",
    displayName: "محاسب", 
    permissions: ["inventory:read", "sales:read", "purchases:read", "purchases:write", "expenses:read", "expenses:write", "reports:read", "reports:write", "accounting:write", "customers:read", "suppliers:read"],
    color: "bg-green-100 text-green-800 border-green-200"
  }
];

export default function UserManagement() {
  const { isDemo } = useAuth();
  const { canManageUsers } = useRoleManagement();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "seller",
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      if (isDemo) {
        const stored = localStorage.getItem('demo_users_v1');
        return stored ? JSON.parse(stored) : [];
      }
      const { data: profiles, error } = await supabase.from("profiles").select(`
        *,
        user_roles(role)
      `);
      if (error) throw error;
      return profiles.map((profile) => ({
        ...profile,
        roles: profile.user_roles.map((ur: any) => ur.role),
      }));
    },
  });

  const { data: customRoles = [] } = useQuery({
    queryKey: ["custom-roles"],
    queryFn: async () => {
      if (isDemo) {
        const stored = localStorage.getItem('custom_roles');
        return stored ? JSON.parse(stored) : defaultRoles;
      }
      return defaultRoles;
    },
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isDemo) {
        // Create user in demo mode
        const stored = localStorage.getItem('demo_users_v1');
        const users = stored ? JSON.parse(stored) : [];
        const newUser = {
          id: Date.now().toString(),
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          roles: [formData.role],
          created_at: new Date().toISOString()
        };
        localStorage.setItem('demo_users_v1', JSON.stringify([...users, newUser]));
      } else {
        // Create user via Supabase
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
      if (isDemo) {
        const stored = localStorage.getItem('demo_users_v1');
        const users = stored ? JSON.parse(stored) : [];
        const updated = users.map((u: any) => 
          u.id === userId ? { ...u, roles: [newRole] } : u
        );
        localStorage.setItem('demo_users_v1', JSON.stringify(updated));
      } else {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);
        if (error) throw error;

        const { error: insertError } = await supabase.from("user_roles").insert({
          user_id: userId,
          role: newRole,
        });
        if (insertError) throw insertError;
      }

      toast.success("تم تحديث دور المستخدم");
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("حدث خطأ أثناء تحديث دور المستخدم");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

    try {
      if (isDemo) {
        const stored = localStorage.getItem('demo_users_v1');
        const users = stored ? JSON.parse(stored) : [];
        const filtered = users.filter((u: any) => u.id !== userId);
        localStorage.setItem('demo_users_v1', JSON.stringify(filtered));
      } else {
        const { error } = await supabase.from("profiles").delete().eq("id", userId);
        if (error) throw error;
      }

      toast.success("تم حذف المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("حدث خطأ أثناء حذف المستخدم");
    }
  };

  if (!canManageUsers()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            إدارة المستخدمين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">ليس لديك صلاحية لإدارة المستخدمين</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          إدارة المستخدمين والأدوار
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            إدارة المستخدمين وتحديد الأدوار والصلاحيات
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                إضافة مستخدم جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>إضافة مستخدم جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">الاسم الكامل</Label>
                  <Input
                    id="full_name"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">الدور</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {customRoles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "جاري الإنشاء..." : "إنشاء المستخدم"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            جاري التحميل...
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الأدوار</TableHead>
                  <TableHead>الصلاحيات</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.roles?.map((role: string) => {
                          const customRole = customRoles.find(r => r.name === role);
                          return (
                            <Badge key={role} className={`text-xs ${customRole?.color || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                              {customRole?.displayName || role}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.roles?.map((role: string) => {
                          const customRole = customRoles.find(r => r.name === role);
                          return (
                            <div key={role} className="text-xs text-muted-foreground">
                              {customRole?.permissions?.slice(0, 3).join(", ")}
                              {customRole?.permissions?.length > 3 && "..."}
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={user.roles?.[0] || "seller"}
                          onValueChange={(value) => handleUpdateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {customRoles.map((role) => (
                              <SelectItem key={role.id} value={role.name}>
                                {role.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
