-- Update RLS policy to allow project members to view audit logs for their tasks
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;

CREATE POLICY "View audit logs for accessible tasks"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  (table_name = 'tasks' AND EXISTS (
    SELECT 1 FROM tasks t
    JOIN project_members pm ON pm.project_id = t.project_id
    WHERE t.id = audit_logs.record_id AND pm.user_id = auth.uid()
  ))
);