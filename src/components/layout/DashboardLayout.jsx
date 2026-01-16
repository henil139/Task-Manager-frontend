import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import { useAuth } from '../../hooks/useAuth.jsx';

const { Header, Sider, Content } = Layout;

export default function DashboardLayout() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Menu items - admin sees Users
  const menuItems = [
    { key: '/dashboard', label: 'Dashboard' },
    { key: '/dashboard/projects', label: 'Projects' },
    { key: '/dashboard/tasks', label: 'Tasks' },
  ];

  if (role === 'admin') {
    menuItems.push({ key: '/dashboard/users', label: 'Users' });
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" style={{ borderRight: '1px solid #ddd' }}>
        <div style={{ padding: 16, fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>
          Task Manager
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}>
          <span>Role: {role}</span>
          <div>
            <span style={{ marginRight: 16 }}>{user?.email}</span>
            <Button onClick={handleSignOut}>Logout</Button>
          </div>
        </Header>
        <Content style={{ margin: 16, padding: 16, background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
