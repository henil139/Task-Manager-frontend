import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../integrations/api/client';
import { useAuth } from './useAuth.jsx';

// Get all tasks for a project
export function useTasks(projectId) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tasks', String(projectId)],
    queryFn: () =>
      apiClient.get(`/projects/${projectId}/tasks`),
    enabled: !!user && !!projectId,
  });
}

// Get all tasks assigned to current user
export function useMyTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['myTasks'],
    queryFn: () => apiClient.get('/users/me/tasks'),
    enabled: !!user,
  });
}


// Get single task
export function useTask(projectId, taskId) {
  return useQuery({
    queryKey: ['task', String(taskId)],
    queryFn: () =>
      apiClient.get(`/projects/${projectId}/tasks/${taskId}`),
    enabled: !!projectId && !!taskId,
  });
}

// Create task
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      return apiClient.post(`/projects/${data?.project_id}/tasks`, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate project tasks list
      queryClient.invalidateQueries({ queryKey: ['tasks', String(variables.project_id)] });
      // Also invalidate myTasks in case user is assigned
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
    },
  });
}

// Update task
export function useUpdateTask(projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) =>
      apiClient.put(`/projects/${projectId}/tasks/${id}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', String(projectId)] });
      queryClient.invalidateQueries({ queryKey: ['task', String(data.id)] });
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
    },
  });
}

// Advance task status to next stage
export function useAdvanceTaskStatus(projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, newStatus }) =>
      apiClient.put(`/projects/${projectId}/tasks/${taskId}`, { status: newStatus }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', String(projectId)] });
      queryClient.invalidateQueries({ queryKey: ['task', String(data.id)] });
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
    },
  });
}

// Delete task
export function useDeleteTask(projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId) =>
      apiClient.delete(`/projects/${projectId}/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', String(projectId)] });
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
    },
  });
}
