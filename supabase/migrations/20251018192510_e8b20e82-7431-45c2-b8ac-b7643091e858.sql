-- Add category column to inventory table
ALTER TABLE public.inventory 
ADD COLUMN category text NOT NULL DEFAULT 'ذهب';

-- Add category column to sales_items table
ALTER TABLE public.sales_items 
ADD COLUMN category text;

-- Add category column to purchase_items table
ALTER TABLE public.purchase_items 
ADD COLUMN category text;