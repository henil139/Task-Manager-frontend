import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../integrations/api/client';

// Get comments for a task
export function useComments(taskId) {
  return useQuery({
    queryKey: ['comments', taskId],
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.task_id] });
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
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
  });
}
