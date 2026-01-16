import { useState } from 'react';
import { Card, Table, Button, Tag, Spin, message, Space } from 'antd';
import { EditOutlined, ArrowRightOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../integrations/api/client.js';
import { useMyTasks, useUpdateTask, useDeleteTask } from '../../hooks/useTasks.js';
import TaskModal from '../../components/tasks/TaskModal.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import dayjs from 'dayjs';

// Status flow: to_do -> in_progress -> under_review -> completed
const STATUS_FLOW = ['to_do', 'in_progress', 'under_review', 'completed'];
const STATUS_LABELS = {
  to_do: 'Start Progress',
  in_progress: 'Submit for Review',
  under_review: 'Mark Complete',
};

function getNextStatus(currentStatus) {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex >= STATUS_FLOW.length - 1) {
    return null;
  }
  return STATUS_FLOW[currentIndex + 1];
}

function getNextStatusLabel(currentStatus) {
  return STATUS_LABELS[currentStatus] || null;
}

export default function Tasks() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: tasks, isLoading } = useMyTasks();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Advance status confirmation
  const [advanceConfirmOpen, setAdvanceConfirmOpen] = useState(false);
  const [taskToAdvance, setTaskToAdvance] = useState(null);

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Get project ID from task for mutations
  const getProjectIdForTask = (task) => task?.project_id;

  const handleEditClick = (task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleTaskModalClose = () => {
    setTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleAdvanceClick = (task) => {
    setTaskToAdvance(task);
    setAdvanceConfirmOpen(true);
  };

  const handleConfirmAdvance = async () => {
    if (!taskToAdvance) return;
    const newStatus = getNextStatus(taskToAdvance.status);
    if (!newStatus) return;

    try {
      await apiClient.put(
        `/projects/${taskToAdvance.project_id}/tasks/${taskToAdvance.id}`,
        { status: newStatus }
      );
      message.success(`Task moved to ${newStatus.replace('_', ' ')}`);
      setAdvanceConfirmOpen(false);
      setTaskToAdvance(null);
      // Refetch tasks
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await apiClient.delete(
        `/projects/${taskToDelete.project_id}/tasks/${taskToDelete.id}`
      );
      message.success('Task deleted');
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
      // Refetch tasks
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
    } catch (error) {
      message.error(error.message);
    }
  };

  // Check if a date is overdue
  const isOverdue = (date) => {
    if (!date) return false;
    return dayjs(date).isBefore(dayjs(), 'day');
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <a onClick={() => navigate(`/dashboard/projects/${record.project_id}/tasks/${record.id}`)}>
          {title}
        </a>
      ),
    },
    {
      title: 'Project',
      dataIndex: 'project_id',
      key: 'project',
      render: (projectId) => `Project ${projectId}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag>{status?.replace('_', ' ')}</Tag>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'green'}>
          {priority}
        </Tag>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date, record) => {
        if (!date) return '-';
        const overdue = isOverdue(date) && record.status !== 'completed';
        return (
          <span style={{ color: overdue ? '#cf1322' : 'inherit', fontWeight: overdue ? 500 : 'normal' }}>
            {dayjs(date).format('YYYY-MM-DD')}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const nextLabel = getNextStatusLabel(record.status);
        return (
          <Space size="small">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditClick(record)}
            >
              Edit
            </Button>
            {nextLabel && (
              <Button
                type="primary"
                size="small"
                icon={<ArrowRightOutlined />}
                onClick={() => handleAdvanceClick(record)}
              >
                {nextLabel}
              </Button>
            )}
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteClick(record)}
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  if (isLoading) return <Spin />;

  return (
    <div>
      <h2>My Tasks</h2>
      <Card>
        {tasks?.length === 0 ? (
          <p>No tasks assigned to you yet.</p>
        ) : (
          <Table dataSource={tasks} columns={columns} rowKey="id" pagination={false} />
        )}
      </Card>

      {/* Task Modal (Edit) */}
      <TaskModal
        open={taskModalOpen}
        onClose={handleTaskModalClose}
        task={editingTask}
      />

      {/* Advance Status Confirmation */}
      <ConfirmDialog
        open={advanceConfirmOpen}
        onConfirm={handleConfirmAdvance}
        onCancel={() => {
          setAdvanceConfirmOpen(false);
          setTaskToAdvance(null);
        }}
        title="Advance Task Status"
        description={`Move "${taskToAdvance?.title}" from "${taskToAdvance?.status?.replace('_', ' ')}" to "${getNextStatus(taskToAdvance?.status)?.replace('_', ' ')}"?`}
        confirmText={getNextStatusLabel(taskToAdvance?.status) || 'Confirm'}
      />

      {/* Delete Task Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTaskToDelete(null);
        }}
        title="Delete Task"
        description={`Delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        danger
      />
    </div>
  );
}
