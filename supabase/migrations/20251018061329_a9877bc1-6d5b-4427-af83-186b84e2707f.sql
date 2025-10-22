-- Create sales table
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- RLS policies for sales
CREATE POLICY "Anyone can view sales" ON public.sales
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert sales" ON public.sales
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update sales" ON public.sales
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete sales" ON public.sales
  FOR DELETE USING (true);

-- Create purchases table
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for purchases
CREATE POLICY "Anyone can view purchases" ON public.purchases
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert purchases" ON public.purchases
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update purchases" ON public.purchases
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete purchases" ON public.purchases
  FOR DELETE USING (true);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies for expenses
CREATE POLICY "Anyone can view expenses" ON public.expenses
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert expenses" ON public.expenses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update expenses" ON public.expenses
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete expenses" ON public.expenses
  FOR DELETE USING (true);