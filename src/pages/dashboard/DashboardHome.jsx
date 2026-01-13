import { Card, Row, Col, Table, Tag, Spin } from 'antd';
import { useProjects } from '../../hooks/useProjects.js';
import { useTasks } from '../../hooks/useTasks.js';
import dayjs from 'dayjs';

export default function DashboardHome() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: tasks, isLoading: tasksLoading } = useTasks();

  if (projectsLoading || tasksLoading) return <Spin />;

  // Calculate stats
  const totalProjects = projects?.length || 0;
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
  
  // Check overdue tasks
  const today = dayjs().startOf('day');
  const overdueTasks = tasks?.filter(t => {
    if (!t.due_date || t.status === 'completed') return false;
    return dayjs(t.due_date).isBefore(today);
  }).length || 0;

  const recentTasks = tasks?.slice(0, 5) || [];

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag>{status}</Tag>,
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
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
  ];

  return (
    <div>
      <h2>Dashboard</h2>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card title="Projects">{totalProjects}</Card></Col>
        <Col span={6}><Card title="Tasks">{totalTasks}</Card></Col>
        <Col span={6}><Card title="Completed">{completedTasks}</Card></Col>
        <Col span={6}><Card title="Overdue" style={{ color: overdueTasks > 0 ? 'red' : undefined }}>{overdueTasks}</Card></Col>
      </Row>
      <Card title="Recent Tasks">
        <Table dataSource={recentTasks} columns={columns} rowKey="id" pagination={false} size="small" />
      </Card>
    </div>
  );
}
