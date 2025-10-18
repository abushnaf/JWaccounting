import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, AlertCircle, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InventoryForm from "@/components/forms/InventoryForm";

const karatTypes = ["24K", "21K", "18K", "14K", "فضة"];

export default function Inventory() {
  const [karatFilter, setKaratFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredItems = items.filter((item) => {
    const matchesKarat = karatFilter === "all" || item.karat === karatFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesKarat && matchesSearch;
  });

  const totalItems = items.length;
  const totalWeight = items.reduce((sum, item) => sum + Number(item.weight), 0);
  const totalValue = items.reduce(
    (sum, item) => sum + Number(item.weight) * Number(item.price_per_gram),
    0
  );
  const lowStockCount = items.filter((item) => item.stock <= 3).length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي القطع
            </CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">قطعة مختلفة</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              وزن الذهب الكلي
            </CardTitle>
            <Package className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {totalWeight.toFixed(1)} جم
            </div>
            <p className="text-xs text-muted-foreground mt-1">من جميع الأعيرة</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              قيمة المخزون
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} د.ل
            </div>
            <p className="text-xs text-muted-foreground mt-1">السعر الإجمالي</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              منخفض المخزون
            </CardTitle>
            <AlertCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">يحتاج إلى إعادة الطلب</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Management */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-xl">إدارة المخزون</CardTitle>
            <InventoryForm />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="البحث في المخزون..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={karatFilter} onValueChange={setKaratFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="العيار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأعيرة</SelectItem>
                {karatTypes.map(karat => (
                  <SelectItem key={karat} value={karat}>{karat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items Table */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              جاري التحميل...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
              <div className="text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || karatFilter !== "all"
                    ? "لا توجد قطع مطابقة للبحث"
                    : "لا توجد قطع في المخزون. انقر على 'إضافة قطعة جديدة' للبدء"}
                </p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-right p-3 text-sm font-medium">اسم القطعة</th>
                      <th className="text-right p-3 text-sm font-medium">العيار</th>
                      <th className="text-right p-3 text-sm font-medium">الوزن (جم)</th>
                      <th className="text-right p-3 text-sm font-medium">سعر الجرام</th>
                      <th className="text-right p-3 text-sm font-medium">المخزون</th>
                      <th className="text-right p-3 text-sm font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">{item.name}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="font-semibold">
                            {item.karat}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {Number(item.weight).toFixed(2)}
                        </td>
                        <td className="p-3 font-semibold text-secondary">
                          {Number(item.price_per_gram).toLocaleString()} د.ل
                        </td>
                        <td className="p-3">{item.stock}</td>
                        <td className="p-3">
                          <Badge 
                            variant={item.status === "متوفر" ? "default" : "destructive"}
                            className={item.status === "متوفر" ? "bg-success" : ""}
                          >
                            {item.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
