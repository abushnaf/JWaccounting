import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Shield, UserPlus } from 'lucide-react';

export default function AdminSetup() {
  const { isDemo } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('مدير النظام');
  const [loading, setLoading] = useState(false);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: undefined
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        if (isDemo) {
          // In demo mode, roles are stored client-side; nothing else to do
        } else {
          // Assign admin via secure RPC (bypasses RLS only for bootstrap or admins)
          const { error: rpcError } = await supabase.rpc('assign_user_role', {
            _user_id: authData.user.id,
            _role: 'admin'
          });

          if (rpcError) throw rpcError;
        }

        toast.success('تم إنشاء حساب المدير بنجاح! يمكنك تسجيل الدخول الآن');
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error(error.message || 'حدث خطأ أثناء إنشاء حساب المدير');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">إعداد المدير الأول</CardTitle>
          <p className="text-muted-foreground">أنشئ حساب المدير للبدء</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">الاسم الكامل</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="أدخل اسم المدير"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="أدخل بريد المدير"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="أدخل كلمة المرور"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {loading ? 'جاري إنشاء المدير...' : 'إنشاء حساب المدير'}
            </Button>
          </form>
          <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
            <p className="font-semibold mb-1">ملاحظة:</p>
            <p>هذا الحساب سيكون له صلاحيات كاملة لإدارة النظام والمستخدمين.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
