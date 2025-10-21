-- Update RLS policies to use role-based permissions

-- Drop existing policies for inventory
DROP POLICY IF EXISTS "Anyone can view inventory" ON public.inventory;
DROP POLICY IF EXISTS "Anyone can insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Anyone can update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Anyone can delete inventory" ON public.inventory;

-- Create role-based policies for inventory
CREATE POLICY "Users with inventory:read can view inventory" ON public.inventory
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'seller') OR 
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Users with inventory:write can insert inventory" ON public.inventory
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'seller')
  );

CREATE POLICY "Users with inventory:write can update inventory" ON public.inventory
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'seller')
  );

CREATE POLICY "Users with inventory:delete can delete inventory" ON public.inventory
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin')
  );

-- Drop existing policies for sales
DROP POLICY IF EXISTS "Anyone can view sales" ON public.sales;
DROP POLICY IF EXISTS "Anyone can insert sales" ON public.sales;
DROP POLICY IF EXISTS "Anyone can update sales" ON public.sales;
DROP POLICY IF EXISTS "Anyone can delete sales" ON public.sales;

-- Create role-based policies for sales
CREATE POLICY "Users with sales:read can view sales" ON public.sales
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'seller') OR 
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Users with sales:write can insert sales" ON public.sales
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'seller')
  );

CREATE POLICY "Users with sales:write can update sales" ON public.sales
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'seller')
  );

CREATE POLICY "Users with sales:delete can delete sales" ON public.sales
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin')
  );

-- Drop existing policies for purchases
DROP POLICY IF EXISTS "Anyone can view purchases" ON public.purchases;
DROP POLICY IF EXISTS "Anyone can insert purchases" ON public.purchases;
DROP POLICY IF EXISTS "Anyone can update purchases" ON public.purchases;
DROP POLICY IF EXISTS "Anyone can delete purchases" ON public.purchases;

-- Create role-based policies for purchases
CREATE POLICY "Users with purchases:read can view purchases" ON public.purchases
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Users with purchases:write can insert purchases" ON public.purchases
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Users with purchases:write can update purchases" ON public.purchases
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Users with purchases:delete can delete purchases" ON public.purchases
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin')
  );

-- Drop existing policies for expenses
DROP POLICY IF EXISTS "Anyone can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can delete expenses" ON public.expenses;

-- Create role-based policies for expenses
CREATE POLICY "Users with expenses:read can view expenses" ON public.expenses
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Users with expenses:write can insert expenses" ON public.expenses
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Users with expenses:write can update expenses" ON public.expenses
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Users with expenses:delete can delete expenses" ON public.expenses
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin')
  );

-- Drop existing policies for sales_items
DROP POLICY IF EXISTS "Anyone can view sales_items" ON public.sales_items;
DROP POLICY IF EXISTS "Anyone can insert sales_items" ON public.sales_items;
DROP POLICY IF EXISTS "Anyone can update sales_items" ON public.sales_items;
DROP POLICY IF EXISTS "Anyone can delete sales_items" ON public.sales_items;

-- Create role-based policies for sales_items
CREATE POLICY "Users with sales:read can view sales_items" ON public.sales_items
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'seller') OR 
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Users with sales:write can insert sales_items" ON public.sales_items
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'seller')
  );

CREATE POLICY "Users with sales:write can update sales_items" ON public.sales_items
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'seller')
  );

CREATE POLICY "Users with sales:delete can delete sales_items" ON public.sales_items
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin')
  );

-- Drop existing policies for purchase_items
DROP POLICY IF EXISTS "Anyone can view purchase_items" ON public.purchase_items;
DROP POLICY IF EXISTS "Anyone can insert purchase_items" ON public.purchase_items;
DROP POLICY IF EXISTS "Anyone can update purchase_items" ON public.purchase_items;
DROP POLICY IF EXISTS "Anyone can delete purchase_items" ON public.purchase_items;

-- Create role-based policies for purchase_items
CREATE POLICY "Users with purchases:read can view purchase_items" ON public.purchase_items
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Users with purchases:write can insert purchase_items" ON public.purchase_items
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Users with purchases:write can update purchase_items" ON public.purchase_items
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Users with purchases:delete can delete purchase_items" ON public.purchase_items
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin')
  );

-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS for customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create role-based policies for customers
CREATE POLICY "Users with customers:read can view customers" ON public.customers
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'seller') OR 
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Users with customers:write can insert customers" ON public.customers
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'seller')
  );

CREATE POLICY "Users with customers:write can update customers" ON public.customers
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'seller')
  );

CREATE POLICY "Users with customers:delete can delete customers" ON public.customers
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin')
  );

-- Create suppliers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS for suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create role-based policies for suppliers
CREATE POLICY "Users with suppliers:read can view suppliers" ON public.suppliers
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Users with suppliers:write can insert suppliers" ON public.suppliers
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Users with suppliers:write can update suppliers" ON public.suppliers
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Users with suppliers:delete can delete suppliers" ON public.suppliers
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin')
  );
