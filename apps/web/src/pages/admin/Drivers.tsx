import { useQuery } from '@tanstack/react-query'
import { Card, Table, Typography, Space, Tag } from 'antd'
import { UserOutlined, CarOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { Layout } from '../../components/Layout'
import { apiClient } from '../../lib/api'
import type { Driver } from '@shuttle/types'
import { DriverStatus } from '@shuttle/types'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export function AdminDrivers() {
  const { data: drivers, isLoading } = useQuery<Driver[]>({
    queryKey: ['admin-drivers'],
    queryFn: () => apiClient.get('/admin/drivers')
  })

  const getStatusColor = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.ONLINE:
        return 'success'
      case DriverStatus.BUSY:
        return 'processing'
      case DriverStatus.OFFLINE:
        return 'default'
      default:
        return 'default'
    }
  }

  const columns: ColumnsType<Driver> = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <Text strong>{record.user?.name}</Text>
        </Space>
      ),
      width: 200,
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status: DriverStatus) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
      width: 120,
    },
    {
      title: 'Vehicle',
      key: 'vehicle',
      render: (_, record) => (
        <Space>
          <CarOutlined />
          <Text>{record.vehicle?.plateNumber || '-'}</Text>
        </Space>
      ),
      width: 180,
    },
    {
      title: 'Current Booking',
      key: 'currentBooking',
      render: (_, record) => {
        const bookings = (record as any).bookings
        if (bookings && bookings.length > 0) {
          const booking = bookings[0]
          return (
            <Space>
              <EnvironmentOutlined />
              <Text type="secondary">
                {booking.pickupLocation?.name} → {booking.destinationLocation?.name}
              </Text>
            </Space>
          )
        }
        return <Text type="secondary" italic>No active booking</Text>
      },
      width: 300,
    },
  ]

  return (
    <Layout>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2}>Drivers</Title>
          <Table
            columns={columns}
            dataSource={drivers || []}
            loading={isLoading}
            rowKey="id"
            scroll={{ x: 800 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} drivers`,
            }}
          />
        </Space>
      </Card>
    </Layout>
  )
}
