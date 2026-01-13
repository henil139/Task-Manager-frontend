import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../integrations/api/client';

// Get audit logs (admin only)
export function useAuditLogs(limit = 100) {
  return useQuery({
    queryKey: ['audit-logs', limit],
    queryFn: async () => {
      return await apiClient.get(`/audit-logs?limit=${limit}`);
    },
  });
}

// Get audit logs for a specific task (status, assignment, due date changes only)
export function useTaskAuditLogs(taskId) {
  return useQuery({
    queryKey: ['task-audit-logs', taskId],
    queryFn: async () => {
      return await apiClient.get(`/audit-logs?task_id=${taskId}`);
    },
    enabled: !!taskId,
  });
}
