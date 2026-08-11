import { useQuery } from '@tanstack/react-query';
import { Layout } from '../../components/Layout';
import { StatusBadge } from '../../components/StatusBadge';
import { apiClient } from '../../lib/api';
import type { Booking } from '@shuttle/types';
import { Card, Table, Typography, Space } from 'antd';
import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export function UserBookings() {
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: () => apiClient.get('/bookings'),
  });

  const columns: ColumnsType<Booking> = [
    {
      title: 'Booking #',
      dataIndex: 'bookingNumber',
      key: 'bookingNumber',
      render: (text) => <Text strong>{text}</Text>,
      fixed: 'left',
      width: 150,
    },
    {
      title: 'Route',
      key: 'route',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            <EnvironmentOutlined />
            <Text>{record.pickupLocation?.name}</Text>
          </Space>
          <Space size="small">
            <EnvironmentOutlined />
            <Text>{record.destinationLocation?.name}</Text>
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
          <Space>
            <UserOutlined />
            <Text>{record.driver.user.name}</Text>
          </Space>
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
      filters: [
        { text: 'Pending', value: 'PENDING' },
        { text: 'Assigned', value: 'ASSIGNED' },
        { text: 'In Progress', value: 'IN_PROGRESS' },
        { text: 'Completed', value: 'COMPLETED' },
        { text: 'Cancelled', value: 'CANCELLED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Requested At',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) =>
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
      defaultSortOrder: 'descend',
      width: 180,
    },
  ];

  return (
    <Layout>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>My Bookings</Title>

        <Card bordered={false} style={{ borderRadius: '8px' }}>
          <Table
            columns={columns}
            dataSource={bookings}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} bookings`,
            }}
            scroll={{ x: 800 }}
          />
        </Card>
      </Space>
    </Layout>
  );
}
