-- Add quantity column to sales_items table
ALTER TABLE public.sales_items 
ADD COLUMN quantity integer NOT NULL DEFAULT 1;

-- Add quantity column to purchase_items table
ALTER TABLE public.purchase_items 
ADD COLUMN quantity integer NOT NULL DEFAULT 1;