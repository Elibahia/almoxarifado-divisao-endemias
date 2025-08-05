
-- Add missing columns to order_requests table for tracking received status
ALTER TABLE public.order_requests 
ADD COLUMN received_at timestamp with time zone,
ADD COLUMN received_by uuid;
