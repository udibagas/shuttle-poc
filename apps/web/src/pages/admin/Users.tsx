import { useQuery } from '@tanstack/react-query'
import { Card, Table, Typography, Space } from 'antd'
import { UserOutlined, CalendarOutlined, IdcardOutlined } from '@ant-design/icons'
import { Layout } from '../../components/Layout'
import { apiClient } from '../../lib/api'
import type { User } from '@shuttle/types'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export function AdminUsers() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.get('/admin/users')
  })

  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <UserOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
      width: 250,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text) => (
        <Space>
          <IdcardOutlined />
          <Text>{text}</Text>
        </Space>
      ),
      width: 200,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Space>
          <CalendarOutlined />
          <Text type="secondary">{new Date(date).toLocaleDateString()}</Text>
        </Space>
      ),
      width: 180,
    },
  ]

  return (
    <Layout>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2}>Users</Title>
          <Table
            columns={columns}
            dataSource={users || []}
            loading={isLoading}
            rowKey="id"
            scroll={{ x: 630 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
            }}
          />
        </Space>
      </Card>
    </Layout>
  )
}
