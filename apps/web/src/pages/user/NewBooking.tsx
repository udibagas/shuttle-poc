import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { apiClient } from '../../lib/api';
import type { Location, CreateBookingRequest } from '@shuttle/types';
import {
  Card,
  Form,
  Select,
  InputNumber,
  Input,
  Button,
  Space,
  Alert,
  Typography,
} from 'antd';
import {
  EnvironmentOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Title } = Typography;

export function NewBooking() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: locations, isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: () => apiClient.get('/locations'),
  });

  const createBookingMutation = useMutation({
    mutationFn: (data: CreateBookingRequest) =>
      apiClient.post('/bookings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      navigate('/user');
    },
  });

  const handleSubmit = (values: any) => {
    createBookingMutation.mutate({
      pickupLocationId: values.pickupLocationId,
      destinationLocationId: values.destinationLocationId,
      passengerCount: values.passengerCount,
      notes: values.notes || undefined,
    });
  };

  return (
    <Layout>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>Request Shuttle</Title>

        <Card bordered={false} style={{ maxWidth: 800, borderRadius: '8px' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ passengerCount: 1 }}
            size="large"
          >
            <Form.Item
              name="pickupLocationId"
              label="Pickup Location"
              rules={[
                { required: true, message: 'Please select pickup location' },
                {
                  validator: (_, value) => {
                    const destinationId = form.getFieldValue('destinationLocationId');
                    if (value && destinationId && value === destinationId) {
                      return Promise.reject(
                        'Pickup and destination must be different'
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                placeholder="Select pickup location"
                loading={locationsLoading}
                showSearch
                optionFilterProp="children"
                suffixIcon={<EnvironmentOutlined />}
              >
                {locations?.map((location) => (
                  <Select.Option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="destinationLocationId"
              label="Destination"
              rules={[
                { required: true, message: 'Please select destination' },
                {
                  validator: (_, value) => {
                    const pickupId = form.getFieldValue('pickupLocationId');
                    if (value && pickupId && value === pickupId) {
                      return Promise.reject(
                        'Pickup and destination must be different'
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                placeholder="Select destination"
                loading={locationsLoading}
                showSearch
                optionFilterProp="children"
                suffixIcon={<EnvironmentOutlined />}
              >
                {locations?.map((location) => (
                  <Select.Option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="passengerCount"
              label="Passenger Count"
              rules={[
                { required: true, message: 'Please enter passenger count' },
              ]}
            >
              <InputNumber
                min={1}
                max={20}
                style={{ width: '100%' }}
                prefix={<UserOutlined />}
              />
            </Form.Item>

            <Form.Item name="notes" label="Notes (Optional)">
              <TextArea
                rows={4}
                placeholder="Any special requirements..."
              />
            </Form.Item>

            {createBookingMutation.error && (
              <Form.Item>
                <Alert
                  message="Error"
                  description={
                    (createBookingMutation.error as any).message ||
                    'Failed to create booking'
                  }
                  type="error"
                  showIcon
                  closable
                />
              </Form.Item>
            )}

            <Form.Item>
              <Space size="middle" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createBookingMutation.isPending}
                  size="large"
                  block
                >
                  Request Shuttle
                </Button>
                <Button
                  onClick={() => navigate('/user')}
                  size="large"
                  block
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </Layout>
  );
}
