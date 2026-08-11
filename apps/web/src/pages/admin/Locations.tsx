import { useQuery } from '@tanstack/react-query'
import { Card, Table, Typography, Space, Tag } from 'antd'
import { EnvironmentOutlined, BarcodeOutlined, TagOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { Layout } from '../../components/Layout'
import { apiClient } from '../../lib/api'
import type { Location } from '@shuttle/types'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export function AdminLocations() {
  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: () => apiClient.get('/locations')
  })

  const columns: ColumnsType<Location> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (text) => (
        <Space>
          <BarcodeOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <EnvironmentOutlined />
          <Text>{text}</Text>
        </Space>
      ),
      width: 250,
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
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={isActive ? 'success' : 'error'}
        >
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      width: 130,
    },
  ]

  return (
    <Layout>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2}>Locations</Title>
          <Table
            columns={columns}
            dataSource={locations || []}
            loading={isLoading}
            rowKey="id"
            scroll={{ x: 680 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} locations`,
            }}
          />
        </Space>
      </Card>
    </Layout>
  )
}
