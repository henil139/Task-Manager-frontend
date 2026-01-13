export type TaskStatus = 'to_do' | 'in_progress' | 'under_review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type OperationType = 'insert' | 'update' | 'delete';
export type AppRole = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  due_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  operation: OperationType;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  user_id: string | null;
  created_at: string;
}

// Extended types with relations
export interface TaskWithDetails extends Task {
  project?: Project;
  assigned_user?: Profile;
  created_user?: Profile;
  comments?: CommentWithUser[];
}

export interface CommentWithUser extends Comment {
  user?: Profile;
}

export interface ProjectWithMembers extends Project {
  members?: (ProjectMember & { profile?: Profile })[];
  task_count?: number;
}

export interface AuditLogWithUser extends AuditLog {
  user?: Profile;
}

// Workflow validation
export const VALID_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  to_do: ['in_progress'],
  in_progress: ['under_review', 'to_do'],
  under_review: ['completed', 'in_progress'],
  completed: ['under_review'],
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  to_do: 'To Do',
  in_progress: 'In Progress',
  under_review: 'Under Review',
  completed: 'Completed',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function canTransitionTo(currentStatus: TaskStatus, newStatus: TaskStatus): boolean {
  return VALID_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}
