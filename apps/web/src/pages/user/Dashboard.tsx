import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { StatusBadge } from '../../components/StatusBadge';
import { apiClient } from '../../lib/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { Booking } from '@shuttle/types';
import { BookingStatus } from '@shuttle/types';
import { useEffect } from 'react';
import {
  Card,
  Button,
  List,
  Typography,
  Space,
  Empty,
  Row,
  Col,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CarOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export function UserDashboard() {
  const { data: bookings, refetch } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: () => apiClient.get('/bookings'),
  });

  const ws = useWebSocket();

  useEffect(() => {
    const events = [
      'booking.assigned',
      'booking.driver_arrived',
      'booking.started',
      'booking.completed',
    ];

    const unsubscribers = events.map((event) => ws.on(event, () => refetch()));

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [ws, refetch]);

  const currentBooking = bookings?.find(
    (b) =>
      b.status === BookingStatus.PENDING ||
      b.status === BookingStatus.ASSIGNED ||
      b.status === BookingStatus.DRIVER_ARRIVED ||
      b.status === BookingStatus.IN_PROGRESS
  );

  return (
    <Layout>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}> User Dashboard </Title>
          </Col>
          <Col>
            <Link to="/user/bookings/new">
              <Button type="primary" size="large" icon={<PlusOutlined />}>
                Request Shuttle
              </Button>
            </Link>
          </Col>
        </Row>

        {currentBooking ? (
          <Card
            title={
              <Space>
                <CarOutlined />
                <span>Current Booking</span>
              </Space>
            }
            variant="borderless"
            style={{ borderRadius: '8px' }}
          >
            <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered>
              <Descriptions.Item label="Booking Number">
                <Text strong>{currentBooking.bookingNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusBadge status={currentBooking.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Pickup Location" span={2}>
                <Space>
                  <EnvironmentOutlined />
                  {currentBooking.pickupLocation?.name}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Destination" span={2}>
                <Space>
                  <EnvironmentOutlined />
                  {currentBooking.destinationLocation?.name}
                </Space>
              </Descriptions.Item>
              {currentBooking.driver && (
                <>
                  <Descriptions.Item label="Driver">
                    <Space>
                      <UserOutlined />
                      {currentBooking.driver.user?.name}
                    </Space>
                  </Descriptions.Item>
                  {currentBooking.driver.vehicle && (
                    <Descriptions.Item label="Vehicle">
                      <Space>
                        <CarOutlined />
                        {currentBooking.driver.vehicle.plateNumber}
                      </Space>
                    </Descriptions.Item>
                  )}
                </>
              )}
            </Descriptions>
          </Card>
        ) : (
          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <Empty
              description="No active booking"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Link to="/user/bookings/new">
                <Button type="primary" icon={<PlusOutlined />}>
                  Request Shuttle Now
                </Button>
              </Link>
            </Empty>
          </Card>
        )}

        <Card
          title="Recent Bookings"
          bordered={false}
          style={{ borderRadius: '8px' }}
        >
          {bookings && bookings.length > 0 ? (
            <List
              dataSource={bookings.slice(0, 5)}
              renderItem={(booking) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{booking.bookingNumber}</Text>
                        <StatusBadge status={booking.status} />
                      </Space>
                    }
                    description={
                      <Space>
                        <EnvironmentOutlined />
                        <Text>
                          {booking.pickupLocation?.name} →{' '}
                          {booking.destinationLocation?.name}
                        </Text>
                      </Space>
                    }
                  />
                  <div>
                    <Text type="secondary">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No bookings yet" />
          )}
        </Card>
      </Space>
    </Layout>
  );
}
