-- Drop the broken policy
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;

-- Create corrected policy - admins can see all, members can see their projects
CREATE POLICY "Users can view projects" 
ON public.projects 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = auth.uid()
  )
);