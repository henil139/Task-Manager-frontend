import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../integrations/api/client';

// Get comments for a task
export function useComments(taskId) {
  return useQuery({
    queryKey: ['comments', String(taskId)],
    queryFn: async () => {
      return await apiClient.get(`/tasks/${taskId}/comments`);
    },
    enabled: !!taskId,
  });
}

// Create comment
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, content }) => {
      return await apiClient.post(`/tasks/${taskId}/comments`, { content });
    },
    onSuccess: (data, variables) => {
      // Use taskId from variables, convert to string to match query key
      queryClient.invalidateQueries({ queryKey: ['comments', String(variables.taskId)] });
    },
  });
}

// Delete comment
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, taskId }) => {
      await apiClient.delete(`/comments/${id}`);
      return taskId;
    },
    onSuccess: (taskId) => {
      queryClient.invalidateQueries({ queryKey: ['comments', String(taskId)] });
    },
  });
}
