import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import DashboardHome from "./pages/dashboard/DashboardHome.jsx";
import Projects from "./pages/dashboard/Projects.jsx";
import ProjectDetail from "./pages/dashboard/ProjectDetail.jsx";
import Tasks from "./pages/dashboard/Tasks.jsx";
import TaskDetail from "./pages/dashboard/TaskDetail.jsx";
import Users from "./pages/dashboard/Users.jsx";
import ActivityLogs from "./pages/dashboard/ActivityLogs.jsx";
import NotFound from "./pages/NotFound.jsx";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardHome />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="projects/:projectId/tasks/:taskId" element={<TaskDetail />} />
              <Route path="users" element={<ProtectedRoute requiredRole="admin"><Users /></ProtectedRoute>} />
              <Route path="activity" element={<ProtectedRoute requiredRole="admin"><ActivityLogs /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
