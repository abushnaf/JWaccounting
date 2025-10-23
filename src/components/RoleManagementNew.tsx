import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit2, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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

const availablePermissions = [
  { category: "المخزون", permissions: ["inventory:read", "inventory:write", "inventory:delete"] },
  { category: "المبيعات", permissions: ["sales:read", "sales:write", "sales:delete"] },
  { category: "المشتريات", permissions: ["purchases:read", "purchases:write", "purchases:delete"] },
  { category: "المصروفات", permissions: ["expenses:read", "expenses:write", "expenses:delete"] },
  { category: "التقارير", permissions: ["reports:read", "reports:write"] },
  { category: "المحاسبة", permissions: ["accounting:read", "accounting:write"] },
  { category: "العملاء", permissions: ["customers:read", "customers:write", "customers:delete"] },
  { category: "الموردين", permissions: ["suppliers:read", "suppliers:write", "suppliers:delete"] },
  { category: "الإعدادات", permissions: ["settings:read", "settings:write"] },
  { category: "المستخدمين", permissions: ["users:read", "users:write", "users:delete"] },
  { category: "الأدوار", permissions: ["roles:read", "roles:write", "roles:delete"] }
];

const roleColors = [
  "bg-red-100 text-red-800 border-red-200",
  "bg-blue-100 text-blue-800 border-blue-200", 
  "bg-green-100 text-green-800 border-green-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-orange-100 text-orange-800 border-orange-200",
  "bg-pink-100 text-pink-800 border-pink-200",
  "bg-indigo-100 text-indigo-800 border-indigo-200",
  "bg-cyan-100 text-cyan-800 border-cyan-200"
];

export default function RoleManagement() {
  const { isDemo } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    permissions: [] as string[],
    color: roleColors[0]
  });
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["custom-roles"],
    queryFn: async () => {
      if (isDemo) {
        const stored = localStorage.getItem('custom_roles');
        return stored ? JSON.parse(stored) : defaultRoles;
      }
      // In production, you would fetch from Supabase
      return defaultRoles;
    },
  });

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.displayName.trim()) {
      toast.error("الاسم واسم العرض مطلوبان");
      return;
    }

    if (roles.some(r => r.name === formData.name)) {
      toast.error("اسم الدور موجود مسبقاً");
      return;
    }

    try {
      const newRole: CustomRole = {
        id: Date.now().toString(),
        name: formData.name,
        displayName: formData.displayName,
        permissions: formData.permissions,
        color: formData.color
      };

      if (isDemo) {
        const updatedRoles = [...roles, newRole];
        localStorage.setItem('custom_roles', JSON.stringify(updatedRoles));
      }

      toast.success("تم إنشاء الدور بنجاح");
      setOpen(false);
      setFormData({ name: "", displayName: "", permissions: [], color: roleColors[0] });
      queryClient.invalidateQueries({ queryKey: ["custom-roles"] });
    } catch (error) {
      toast.error("حدث خطأ أثناء إنشاء الدور");
    }
  };

  const handleEditRole = (role: CustomRole) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      permissions: role.permissions,
      color: role.color
    });
    setOpen(true);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingRole) return;

    try {
      const updatedRole: CustomRole = {
        ...editingRole,
        name: formData.name,
        displayName: formData.displayName,
        permissions: formData.permissions,
        color: formData.color
      };

      if (isDemo) {
        const updatedRoles = roles.map(r => r.id === editingRole.id ? updatedRole : r);
        localStorage.setItem('custom_roles', JSON.stringify(updatedRoles));
      }

      toast.success("تم تحديث الدور بنجاح");
      setOpen(false);
      setEditingRole(null);
      setFormData({ name: "", displayName: "", permissions: [], color: roleColors[0] });
      queryClient.invalidateQueries({ queryKey: ["custom-roles"] });
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الدور");
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الدور؟")) return;

    try {
      if (isDemo) {
        const filteredRoles = roles.filter(r => r.id !== roleId);
        localStorage.setItem('custom_roles', JSON.stringify(filteredRoles));
      }

      toast.success("تم حذف الدور بنجاح");
      queryClient.invalidateQueries({ queryKey: ["custom-roles"] });
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف الدور");
    }
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const selectAllPermissions = (categoryPermissions: string[]) => {
    setFormData(prev => ({
      ...prev,
      permissions: [...new Set([...prev.permissions, ...categoryPermissions])]
    }));
  };

  const deselectAllPermissions = (categoryPermissions: string[]) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.filter(p => !categoryPermissions.includes(p))
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          إدارة الأدوار والصلاحيات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            إنشاء وتعديل الأدوار وتحديد الصلاحيات
          </p>
          <Dialog open={open} onOpenChange={(open) => {
            setOpen(open);
            if (!open) {
              setEditingRole(null);
              setFormData({ name: "", displayName: "", permissions: [], color: roleColors[0] });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة دور جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? "تعديل الدور" : "إضافة دور جديد"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={editingRole ? handleUpdateRole : handleCreateRole} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم الدور (إنجليزي)</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">اسم العرض (عربي)</Label>
                    <Input
                      id="displayName"
                      required
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="مثال: مدير"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>لون الدور</Label>
                  <div className="flex gap-2 flex-wrap">
                    {roleColors.map((color, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${color} ${
                          formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                        }`}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>الصلاحيات</Label>
                  {availablePermissions.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{category.category}</h4>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => selectAllPermissions(category.permissions)}
                          >
                            تحديد الكل
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => deselectAllPermissions(category.permissions)}
                          >
                            إلغاء الكل
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {category.permissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission}
                              checked={formData.permissions.includes(permission)}
                              onCheckedChange={() => togglePermission(permission)}
                            />
                            <Label htmlFor={permission} className="text-sm">
                              {permission}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingRole ? "تحديث الدور" : "إنشاء الدور"}
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
                  <TableHead>اسم الدور</TableHead>
                  <TableHead>اسم العرض</TableHead>
                  <TableHead>الصلاحيات</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${role.color}`}>
                        {role.displayName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {role.permissions.length} صلاحية
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {!["admin", "seller", "accountant"].includes(role.name) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
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
