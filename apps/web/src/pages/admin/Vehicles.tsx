import { useQuery } from '@tanstack/react-query'
import { Card, Table, Typography, Space, Tag } from 'antd'
import { CarOutlined, UserOutlined, TeamOutlined, TagOutlined } from '@ant-design/icons'
import { Layout } from '../../components/Layout'
import { apiClient } from '../../lib/api'
import type { Vehicle } from '@shuttle/types'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export function AdminVehicles() {
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ['admin-vehicles'],
    queryFn: () => apiClient.get('/admin/vehicles')
  })

  const columns: ColumnsType<Vehicle> = [
    {
      title: 'Plate Number',
      dataIndex: 'plateNumber',
      key: 'plateNumber',
      render: (text) => (
        <Space>
          <CarOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
      width: 180,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => (
        <Space>
          <TagOutlined />
          <Tag color="blue">{text}</Tag>
        </Space>
      ),
      width: 150,
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity) => (
        <Space>
          <TeamOutlined />
          <Text>{capacity} passengers</Text>
        </Space>
      ),
      width: 180,
    },
    {
      title: 'Assigned Driver',
      key: 'driver',
      render: (_, record) => {
        const drivers = (record as any).drivers
        if (drivers && drivers.length > 0) {
          return (
            <Space>
              <UserOutlined />
              <Text>{drivers[0].user?.name}</Text>
            </Space>
          )
        }
        return <Text type="secondary" italic>Not assigned</Text>
      },
      width: 200,
    },
  ]

  return (
    <Layout>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2}>Vehicles</Title>
          <Table
            columns={columns}
            dataSource={vehicles || []}
            loading={isLoading}
            rowKey="id"
            scroll={{ x: 710 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} vehicles`,
            }}
          />
        </Space>
      </Card>
    </Layout>
  )
}
