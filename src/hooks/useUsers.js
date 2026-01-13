import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../integrations/api/client';

// Get all users (backend already returns role info)
export function useUsersWithRoles() {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      return await apiClient.get('/users');
    },
  });
}

// Assign / Remove admin role
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }) => {
      if (role === 'admin') {
        // Assign admin
        return await apiClient.post(`/users/${userId}/roles/admin`);
      } else {
        // Remove admin
        return await apiClient.delete(`/users/${userId}/roles/admin`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
    },
  });
}
