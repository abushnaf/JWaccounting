-- Add condition column to inventory, purchase_items, and sales_items tables
ALTER TABLE public.inventory
ADD COLUMN condition text NOT NULL DEFAULT 'جديد';

ALTER TABLE public.purchase_items
ADD COLUMN condition text NOT NULL DEFAULT 'جديد';

ALTER TABLE public.sales_items
ADD COLUMN condition text NOT NULL DEFAULT 'جديد';