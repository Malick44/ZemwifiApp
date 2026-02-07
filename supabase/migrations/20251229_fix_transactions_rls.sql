-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if any (to avoid error)
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;

-- Create policy allowing users to see their own transactions
CREATE POLICY "Users can view own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Also ensure RLS on cashin_requests
ALTER TABLE public.cashin_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hosts can view own requests" ON public.cashin_requests;
CREATE POLICY "Hosts can view own requests"
ON public.cashin_requests
FOR SELECT
USING (auth.uid() = host_id);


DROP POLICY IF EXISTS "Users can view requests sent to them" ON public.cashin_requests;
CREATE POLICY "Users can view requests sent to them"
ON public.cashin_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Ensure profiles are viewable (should already be set, but good to be safe for balance checks)
-- This is usually "Users can view own profile" or "Users can view all public profiles"
-- We will assume profiles RLS is fine as basic app works, but transactions was the missing one.
