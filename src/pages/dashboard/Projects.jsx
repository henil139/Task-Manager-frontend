import { useState } from "react";
import { Card, Table, Button, Modal, Form, Input, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "../../hooks/useProjects.js";
import { useAuth } from "../../hooks/useAuth.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import dayjs from "dayjs";

export default function Projects() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form] = Form.useForm();

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const isAdmin = role === "admin";

  // Open modal for create or edit
  const handleOpenModal = (project) => {
    setEditingProject(project || null);
    if (project) {
      form.setFieldsValue({
        title: project.title,
        description: project.description,
      });
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = async (values) => {
    try {
      if (editingProject) {
        await updateProject.mutateAsync({ id: editingProject.id, ...values });
        message.success("Project updated");
      } else {
        await createProject.mutateAsync(values);
        message.success("Project created");
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error(error.message);
    }
  };

  // Open delete confirmation
  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject.mutateAsync(projectToDelete.id);
      message.success("Project deleted");
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      message.error(error.message);
    }
  };

  // Table columns
  const columns = [
    {
      title: "title",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <a onClick={() => navigate(`/dashboard/projects/${record.id}`)}>
          {title}
        </a>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (d) => d || "-",
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (d) => dayjs(d).format("YYYY-MM-DD"),
    },
  ];

  // Add actions column for admin
  if (isAdmin) {
    columns.push({
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            size="small"
            onClick={() => handleOpenModal(record)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button size="small" danger onClick={() => handleDeleteClick(record)}>
            Delete
          </Button>
        </>
      ),
    });
  }

  if (isLoading) return <Spin />;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2>Projects</h2>
        {isAdmin && (
          <Button type="primary" onClick={() => handleOpenModal()}>
            New Project
          </Button>
        )}
      </div>

      <Card>
        <Table
          dataSource={projects}
          columns={columns}
          rowKey="id"
          size="small"
        />
      </Card>

      <Modal
        title={editingProject ? "Edit Project" : "New Project"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Title is required" },
              { min: 5, message: "Title must be at least 5 characters" },
            ]}
          >
            <Input maxLength={100} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Description is required" },
              {
                min: 20,
                message: "Description must be at least 20 characters",
              },
            ]}
          >
            <Input.TextArea rows={3} maxLength={500} showCount />
          </Form.Item>

          <Form.Item>
            <Button
              onClick={() => setIsModalOpen(false)}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createProject.isPending || updateProject.isPending}
            >
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setProjectToDelete(null);
        }}
        title="Delete Project"
        description={`Are you sure you want to delete "${projectToDelete?.title}"? This will also delete all tasks and comments in this project. This action cannot be undone.`}
        confirmText="Delete Project"
        danger
        loading={deleteProject.isPending}
      />
    </div>
  );
}
