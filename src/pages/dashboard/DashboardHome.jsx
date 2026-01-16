import { Card, Row, Col, Spin } from 'antd';
import { useProjects } from '../../hooks/useProjects.js';

export default function DashboardHome() {
  const { data: projects, isLoading: projectsLoading } = useProjects();

  if (projectsLoading) return <Spin />;

  // Calculate stats
  const totalProjects = projects?.length || 0;

  return (
    <div>
      <h2>Dashboard</h2>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}><Card title="My Projects">{totalProjects}</Card></Col>
      </Row>
      {totalProjects === 0 && (
        <Card>
          <p>You don't have any projects yet. Contact an admin to be added to a project.</p>
        </Card>
      )}
    </div>
  );
}
