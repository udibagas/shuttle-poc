import { useQuery } from '@tanstack/react-query';
import { Layout } from '../../components/Layout';
import { StatusBadge } from '../../components/StatusBadge';
import { apiClient } from '../../lib/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { DashboardStats, Booking } from '@shuttle/types';
import { useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Space } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export function AdminDashboard() {
  const { data: stats, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiClient.get('/admin/dashboard'),
  });

  const { data: bookings, refetch: refetchBookings } = useQuery<Booking[]>({
    queryKey: ['admin-bookings'],
    queryFn: () => apiClient.get('/admin/bookings'),
  });

  const ws = useWebSocket();

  useEffect(() => {
    const events = [
      'booking.created',
      'booking.assigned',
      'booking.driver_arrived',
      'booking.started',
      'booking.completed',
      'booking.cancelled',
    ];

    const unsubscribers = events.map((event) =>
      ws.on(event, () => {
        refetchStats();
        refetchBookings();
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [ws, refetchStats, refetchBookings]);

  const columns: ColumnsType<Booking> = [
    {
      title: 'Booking #',
      dataIndex: 'bookingNumber',
      key: 'bookingNumber',
      render: (text) => <Text strong>{text}</Text>,
      width: 150,
    },
    {
      title: 'Passenger',
      key: 'passenger',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <Text>{record.user?.name}</Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: 'Route',
      key: 'route',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            <EnvironmentOutlined />
            <Text type="secondary">{record.pickupLocation?.name}</Text>
          </Space>
          <Space size="small">
            <EnvironmentOutlined />
            <Text type="secondary">{record.destinationLocation?.name}</Text>
          </Space>
        </Space>
      ),
      width: 250,
    },
    {
      title: 'Driver',
      key: 'driver',
      render: (_, record) =>
        record.driver?.user?.name ? (
          <Text>{record.driver.user.name}</Text>
        ) : (
          <Text type="secondary">-</Text>
        ),
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
      width: 150,
    },
    {
      title: 'Requested At',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: (date) => new Date(date).toLocaleString(),
      width: 180,
    },
  ];

  return (
    <Layout>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>Admin Dashboard</Title>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={4.8}>
            <Card bordered={false}>
              <Statistic
                title="Active Drivers"
                value={stats?.activeDrivers || 0}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4.8}>
            <Card bordered={false}>
              <Statistic
                title="Pending Requests"
                value={stats?.pendingRequests || 0}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4.8}>
            <Card bordered={false}>
              <Statistic
                title="Active Trips"
                value={stats?.activeTrips || 0}
                valueStyle={{ color: '#1890ff' }}
                prefix={<CarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4.8}>
            <Card bordered={false}>
              <Statistic
                title="Completed Today"
                value={stats?.completedToday || 0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4.8}>
            <Card bordered={false}>
              <Statistic
                title="Cancelled Today"
                value={stats?.cancelledToday || 0}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card
          title="Recent Bookings"
          bordered={false}
          style={{ borderRadius: '8px' }}
        >
          <Table
            columns={columns}
            dataSource={bookings?.slice(0, 20)}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} bookings`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </Space>
    </Layout>
  );
}
