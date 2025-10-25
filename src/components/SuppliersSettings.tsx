import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

type Supplier = { id: string; name: string; phone: string | null; email: string | null; address: string | null };

export default function SuppliersSettings() {
  const { isDemo } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      if (isDemo) {
        const stored = localStorage.getItem('suppliers');
        return stored ? JSON.parse(stored) : [];
      }
      const { data, error } = await supabase.from("suppliers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Supplier[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("الاسم مطلوب");
      if (isDemo) {
        const stored = localStorage.getItem('suppliers');
        const suppliers = stored ? JSON.parse(stored) : [];
        const newSupplier = { id: Date.now().toString(), ...form };
        if (editing) {
          const updated = suppliers.map((s: Supplier) => s.id === editing.id ? { ...s, ...form } : s);
          localStorage.setItem('suppliers', JSON.stringify(updated));
        } else {
          localStorage.setItem('suppliers', JSON.stringify([...suppliers, newSupplier]));
        }
        return;
      }
      if (editing) {
        const { error } = await supabase.from("suppliers").update(form).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("suppliers").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("تم الحفظ");
      setOpen(false);
      setEditing(null);
      setForm({ name: "", phone: "", email: "", address: "" });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: () => toast.error("تعذر الحفظ")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isDemo) {
        const stored = localStorage.getItem('suppliers');
        const suppliers = stored ? JSON.parse(stored) : [];
        const filtered = suppliers.filter((s: Supplier) => s.id !== id);
        localStorage.setItem('suppliers', JSON.stringify(filtered));
        return;
      }
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم الحذف");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: () => toast.error("تعذر الحذف")
  });

  const startEdit = (s: Supplier) => {
    setEditing(s);
    setForm({ name: s.name || "", phone: s.phone || "", email: s.email || "", address: s.address || "" });
    setOpen(true);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>الموردون</CardTitle>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ name: "", phone: "", email: "", address: "" }); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> مورد جديد</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px] w-[95vw]">
            <DialogHeader>
              <DialogTitle>{editing ? "تعديل مورد" : "إضافة مورد"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">الهاتف</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">العنوان</Label>
                <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex flex-col md:flex-row md:justify-end gap-2">
                <Button className="w-full md:w-auto" variant="outline" onClick={() => { setOpen(false); }}>{"إلغاء"}</Button>
                <Button className="w-full md:w-auto" onClick={() => upsertMutation.mutate()} disabled={upsertMutation.isLoading}>{editing ? "حفظ التعديلات" : "حفظ"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? null : (
          <div className="overflow-x-auto -mx-2 md:mx-0 px-2 md:px-0">
            <Table className="min-w-[640px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">البريد</TableHead>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.address}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(s)}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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


