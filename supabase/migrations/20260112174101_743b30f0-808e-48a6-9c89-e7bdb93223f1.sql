-- Drop the permissive audit log insert policy and replace with a proper one
DROP POLICY "System can insert audit logs" ON public.audit_logs;

-- Create a more restrictive policy - only authenticated users can insert audit logs
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);