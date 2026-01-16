import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../integrations/api/client";
import { useAuth } from "./useAuth.jsx";

// Get all projects
export function useProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      return await apiClient.get("/projects");
    },
    enabled: !!user,
  });
}

// Get single project with members
export function useProjectWithMembers(projectId) {
  return useQuery({
    queryKey: ["project", String(projectId)],
    queryFn: async () => {
      const project = await apiClient.get(`/projects/${projectId}`);
      const members = await apiClient.get(`/projects/${projectId}/members`);
      console.log(project);
      return {
        ...project,
        members,
      };
    },
    enabled: !!projectId,
  });
}

// Create project
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      return await apiClient.post("/projects", {
        title: data.title,
        description: data.description || "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// Update project
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title, description }) => {
      return await apiClient.put(`/projects/${id}`, {
        title,
        description,
      });
    },
    onSuccess: (data) => {
      // refresh project list
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      // refresh project detail page
      queryClient.invalidateQueries({ queryKey: ["project", String(data.id)] });
    },
  });
}


// Delete project
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await apiClient.delete(`/projects/${id}`);
      return id;
    },
    onSuccess: (id) => {
      // refresh project list
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      // remove deleted project cache
      queryClient.removeQueries({ queryKey: ["project", id] });
    },
  });
}


// Add member to project
export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, userId }) => {
      await apiClient.post(`/projects/${projectId}/members`, {
        user_id: userId,
      });
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["project", String(projectId)] });
    },
  });
}

// Remove member from project
export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, userId }) => {
      await apiClient.delete(`/projects/${projectId}/members/${userId}`);
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["project", String(projectId)] });
    },
  });
}

// Get all users (for adding to projects)
export function useAllUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      return await apiClient.get("/users");
    },
  });
}
