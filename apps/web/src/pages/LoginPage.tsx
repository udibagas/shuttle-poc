import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Form, Input, Button, Alert, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values: { username: string; password: string }) => {
    setError('');
    setIsLoading(true);

    try {
      await login(values);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '16px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 450,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          borderRadius: '12px',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              🚐 Shuttle POC
            </Title>
            <Text type="secondary">Port Transportation Management System</Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please enter your username' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Username"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                autoComplete="current-password"
              />
            </Form.Item>

            {error && (
              <Form.Item>
                <Alert message={error} type="error" showIcon closable />
              </Form.Item>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                icon={<LoginOutlined />}
                block
                size="large"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider>Demo Credentials</Divider>

          <Card size="small" style={{ background: '#fafafa' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <Text strong>Admin:</Text> <Text code>admin / password</Text>
              </div>
              <div>
                <Text strong>User:</Text> <Text code>user01 / password</Text>
              </div>
              <div>
                <Text strong>Driver:</Text> <Text code>driver01 / password</Text>
              </div>
            </Space>
          </Card>
        </Space>
      </Card>
    </div>
  );
}