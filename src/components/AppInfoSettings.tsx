import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AppInfoSettings() {
  const { isDemo } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["app-settings"],
    queryFn: async () => {
      if (isDemo) {
        const stored = localStorage.getItem('app_settings');
        return stored ? JSON.parse(stored) : { app_name: "نظام المجوهرات", phone: "", email: "" };
      }
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) throw error;
      return data as { app_name: string; phone: string | null; email: string | null };
    },
  });

  const [form, setForm] = useState({ app_name: "", phone: "", email: "" });

  const mutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      if (isDemo) {
        localStorage.setItem('app_settings', JSON.stringify(payload));
        return;
      }
      const { error } = await supabase
        .from("app_settings")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حفظ معلومات التطبيق");
      queryClient.invalidateQueries({ queryKey: ["app-settings"] });
    },
    onError: () => toast.error("تعذر حفظ الإعدادات")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (isLoading) return null;

  if (data && form.app_name === "") {
    setForm({ app_name: data.app_name || "", phone: data.phone || "", email: data.email || "" });
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>معلومات التطبيق</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="app_name">اسم التطبيق</Label>
            <Input id="app_name" value={form.app_name} onChange={(e) => setForm({ ...form, app_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">الهاتف</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" disabled={mutation.isLoading}>حفظ</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


