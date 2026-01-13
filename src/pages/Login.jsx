import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Alert } from 'antd';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    const { error } = await signIn(values.email, values.password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <Card style={{ width: 320 }}>
        <h2 style={{ textAlign: 'center' }}>Login</h2>

        {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>Login</Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Link to="/signup">Don't have an account? Sign up</Link>
        </div>
      </Card>
    </div>
  );
}
