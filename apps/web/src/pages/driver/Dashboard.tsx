import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../../components/Layout';
import { StatusBadge } from '../../components/StatusBadge';
import { apiClient } from '../../lib/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { Booking, Driver } from '@shuttle/types';
import { BookingStatus, DriverStatus } from '@shuttle/types';
import {
  Card,
  Button,
  Space,
  Typography,
  Descriptions,
  List,
  Empty,
  Switch,
  Row,
  Col,
  Badge,
} from 'antd';
import {
  UserOutlined,
  EnvironmentOutlined,
  CheckOutlined,
  PlayCircleOutlined,
  CloseOutlined,
  CarOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export function DriverDashboard() {
  const queryClient = useQueryClient();
  const ws = useWebSocket();

  const { data: profile } = useQuery<Driver>({
    queryKey: ['driver-profile'],
    queryFn: () => apiClient.get('/driver/profile')
  })

  const { data: availableBookings, refetch: refetchAvailable } = useQuery<
    Booking[]
  >({
    queryKey: ['available-bookings'],
    queryFn: () => apiClient.get('/driver/bookings/available'),
    refetchInterval: 5000
  })

  const { data: myBookings, refetch: refetchMy } = useQuery<Booking[]>({
    queryKey: ['driver-bookings'],
    queryFn: () => apiClient.get('/bookings')
  })

  useEffect(() => {
    const unsubscribe = ws.on('booking.created', () => {
      refetchAvailable()
    })
    return unsubscribe
  }, [ws, refetchAvailable])

  const updateStatusMutation = useMutation({
    mutationFn: (status: DriverStatus) =>
      apiClient.post('/driver/status', { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-profile'] })
    }
  })

  const acceptBookingMutation = useMutation({
    mutationFn: (bookingId: string) =>
      apiClient.post(`/driver/bookings/${bookingId}/accept`),
    onSuccess: () => {
      refetchAvailable()
      refetchMy()
      queryClient.invalidateQueries({ queryKey: ['driver-profile'] })
    }
  })

  const rejectBookingMutation = useMutation({
    mutationFn: (bookingId: string) =>
      apiClient.post(`/driver/bookings/${bookingId}/reject`),
    onSuccess: () => {
      refetchAvailable()
    }
  })

  const currentBooking = myBookings?.find(
    (b) =>
      b.status === BookingStatus.ASSIGNED ||
      b.status === BookingStatus.DRIVER_ARRIVED ||
      b.status === BookingStatus.IN_PROGRESS
  )

  const handleStatusToggle = (checked: boolean) => {
    const newStatus = checked ? DriverStatus.ONLINE : DriverStatus.OFFLINE;
    updateStatusMutation.mutate(newStatus);
  };

  const arrivedMutation = useMutation({
    mutationFn: (bookingId: string) =>
      apiClient.post(`/driver/bookings/${bookingId}/arrived`),
    onSuccess: () => {
      refetchMy()
    }
  })

  const startTripMutation = useMutation({
    mutationFn: (bookingId: string) =>
      apiClient.post(`/driver/bookings/${bookingId}/start`),
    onSuccess: () => {
      refetchMy()
    }
  })

  const completeTripMutation = useMutation({
    mutationFn: (bookingId: string) =>
      apiClient.post(`/driver/bookings/${bookingId}/complete`),
    onSuccess: () => {
      refetchMy()
      queryClient.invalidateQueries({ queryKey: ['driver-profile'] })
    }
  })

  return (
    <Layout>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Driver Dashboard
            </Title>
          </Col>
          <Col>
            <Space>
              <Text>Status:</Text>
              <Switch
                checked={profile?.status === DriverStatus.ONLINE}
                onChange={handleStatusToggle}
                disabled={profile?.status === DriverStatus.BUSY}
                loading={updateStatusMutation.isPending}
                checkedChildren="ONLINE"
                unCheckedChildren="OFFLINE"
              />
              <Badge
                status={
                  profile?.status === DriverStatus.ONLINE
                    ? 'success'
                    : profile?.status === DriverStatus.BUSY
                      ? 'processing'
                      : 'default'
                }
                text={profile?.status || 'Loading...'}
              />
            </Space>
          </Col>
        </Row>

        {currentBooking && (
          <Card
            title={
              <Space>
                <CarOutlined />
                <span>Current Booking - {currentBooking.bookingNumber}</span>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: '8px' }}
          >
            <Descriptions column={{ xs: 1, sm: 2 }} bordered>
              <Descriptions.Item label="Passenger">
                <Space>
                  <UserOutlined />
                  {currentBooking.user?.name}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Passenger Count">
                {currentBooking.passengerCount}
              </Descriptions.Item>
              <Descriptions.Item label="Pickup" span={2}>
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
              {currentBooking.notes && (
                <Descriptions.Item label="Notes" span={2}>
                  {currentBooking.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Space
              direction="vertical"
              size="middle"
              style={{ width: '100%', marginTop: 16 }}
            >
              {currentBooking.status === BookingStatus.ASSIGNED && (
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => arrivedMutation.mutate(currentBooking.id)}
                  loading={arrivedMutation.isPending}
                  icon={<CheckOutlined />}
                >
                  Mark as Arrived
                </Button>
              )}
              {currentBooking.status === BookingStatus.DRIVER_ARRIVED && (
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => startTripMutation.mutate(currentBooking.id)}
                  loading={startTripMutation.isPending}
                  icon={<PlayCircleOutlined />}
                >
                  Start Trip
                </Button>
              )}
              {currentBooking.status === BookingStatus.IN_PROGRESS && (
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => completeTripMutation.mutate(currentBooking.id)}
                  loading={completeTripMutation.isPending}
                  icon={<CheckOutlined />}
                  style={{ background: '#52c41a' }}
                >
                  Complete Trip
                </Button>
              )}
            </Space>
          </Card>
        )}

        {!currentBooking &&
          profile?.status === DriverStatus.ONLINE &&
          availableBookings && (
            <Card
              title="Available Requests"
              bordered={false}
              style={{ borderRadius: '8px' }}
            >
              {availableBookings.length > 0 ? (
                <List
                  dataSource={availableBookings}
                  renderItem={(booking) => (
                    <List.Item>
                      <Card
                        size="small"
                        style={{ width: '100%' }}
                        title={
                          <Space>
                            <Text strong>{booking.bookingNumber}</Text>
                            <StatusBadge status={booking.status} />
                          </Space>
                        }
                      >
                        <Space
                          direction="vertical"
                          size="middle"
                          style={{ width: '100%' }}
                        >
                          <div>
                            <Text type="secondary">Route</Text>
                            <div>
                              <Space>
                                <EnvironmentOutlined />
                                <Text>{booking.pickupLocation?.name}</Text>
                                <Text type="secondary">→</Text>
                                <Text>{booking.destinationLocation?.name}</Text>
                              </Space>
                            </div>
                          </div>
                          <div>
                            <Text type="secondary">Passengers: </Text>
                            <Text strong>{booking.passengerCount}</Text>
                          </div>
                          <Space size="small" style={{ width: '100%' }}>
                            <Button
                              type="primary"
                              icon={<CheckOutlined />}
                              onClick={() =>
                                acceptBookingMutation.mutate(booking.id)
                              }
                              loading={acceptBookingMutation.isPending}
                              block
                              style={{ background: '#52c41a' }}
                            >
                              Accept
                            </Button>
                            <Button
                              danger
                              icon={<CloseOutlined />}
                              onClick={() =>
                                rejectBookingMutation.mutate(booking.id)
                              }
                              loading={rejectBookingMutation.isPending}
                              block
                            >
                              Reject
                            </Button>
                          </Space>
                        </Space>
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No available requests" />
              )}
            </Card>
          )}

        {!currentBooking && profile?.status !== DriverStatus.ONLINE && (
          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <Empty
              description="Set your status to ONLINE to receive booking requests"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        )}
      </Space>
    </Layout>
  );
}
