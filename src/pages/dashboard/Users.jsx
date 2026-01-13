import { useState } from "react";
import { Card, Table, Tag, Button, message, Spin } from "antd";
import { useUsersWithRoles, useUpdateUserRole } from "../../hooks/useUsers.js";
import { useAuth } from "../../hooks/useAuth.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import dayjs from "dayjs";

export default function Users() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useUsersWithRoles();
  const updateRole = useUpdateUserRole();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState(null);

  // Open confirmation dialog for role change
  const handleRoleClick = (userId, userName, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    setPendingChange({ userId, userName, newRole });
    setConfirmOpen(true);
  };

  // Confirm role change
  const handleConfirmRoleChange = async () => {
    if (!pendingChange) return;
    try {
      await updateRole.mutateAsync({
        userId: pendingChange.userId,
        role: pendingChange.newRole,
      });
      message.success(`Role changed to ${pendingChange.newRole}`);
      setConfirmOpen(false);
      setPendingChange(null);
    } catch (error) {
      message.error(error.message);
    }
  };

  // Table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "username",
      key: "username",
      render: (n) => n || "-",
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role, record) => {
        const isCurrentUser = record.id === currentUser?.id;
        return (
          <>
            <Tag color={role === "admin" ? "green" : "blue"}>{role}</Tag>
            {!isCurrentUser && (
              <Button
                size="small"
                onClick={() =>
                  handleRoleClick(
                    record.id,
                    record.username || record.email,
                    role
                  )
                }
              >
                {role === "admin" ? "Make User" : "Make Admin"}
              </Button>
            )}
          </>
        );
      },
    },
    {
      title: "Joined",
      dataIndex: "created_at",
      key: "created_at",
      render: (d) => dayjs(d).format("YYYY-MM-DD"),
    },
  ];

  if (isLoading) return <Spin />;

  return (
    <div>
      <h2>Users</h2>
      <Card>
        <Table dataSource={users} columns={columns} rowKey="id" size="small" />
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleConfirmRoleChange}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingChange(null);
        }}
        title={
          pendingChange?.newRole === "admin"
            ? "Promote to Admin"
            : "Demote to User"
        }
        description={`Are you sure you want to change ${
          pendingChange?.userName
        }'s role to ${pendingChange?.newRole}? ${
          pendingChange?.newRole === "admin"
            ? "They will have full access to all projects and settings."
            : "They will lose admin privileges."
        }`}
        confirmText="Confirm Change"
        danger={pendingChange?.newRole !== "admin"}
        loading={updateRole.isPending}
      />
    </div>
  );
}
