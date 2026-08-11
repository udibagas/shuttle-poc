import { useQuery } from '@tanstack/react-query'
import { Card, Table, Typography, Space } from 'antd'
import { CalendarOutlined, UserOutlined, CarOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { Layout } from '../../components/Layout'
import { StatusBadge } from '../../components/StatusBadge'
import { apiClient } from '../../lib/api'
import type { Booking } from '@shuttle/types'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export function AdminBookings() {
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['admin-bookings'],
    queryFn: () => apiClient.get('/admin/bookings')
  })

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
      width: 200,
    },
    {
      title: 'Route',
      key: 'route',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            <EnvironmentOutlined style={{ color: '#52c41a' }} />
            <Text type="secondary">{record.pickupLocation?.name}</Text>
          </Space>
          <Space size="small">
            <EnvironmentOutlined style={{ color: '#ff4d4f' }} />
            <Text type="secondary">{record.destinationLocation?.name}</Text>
          </Space>
        </Space>
      ),
      width: 250,
    },
    {
      title: 'Driver',
      key: 'driver',
      render: (_, record) => (
        <Space>
          <CarOutlined />
          <Text>{record.driver?.user?.name || '-'}</Text>
        </Space>
      ),
      width: 180,
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status) => <StatusBadge status={status} />,
      width: 150,
    },
    {
      title: 'Requested At',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: (date) => (
        <Space>
          <CalendarOutlined />
          <Text type="secondary">{new Date(date).toLocaleString()}</Text>
        </Space>
      ),
      width: 200,
    },
  ]

  return (
    <Layout>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2}>All Bookings</Title>
          <Table
            columns={columns}
            dataSource={bookings || []}
            loading={isLoading}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} bookings`,
            }}
          />
        </Space>
      </Card>
    </Layout>
  )
}
