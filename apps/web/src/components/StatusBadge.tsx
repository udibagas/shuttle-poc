import { BookingStatus } from '@shuttle/types';
import { Tag } from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  CarOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

export function StatusBadge({ status }: { status: BookingStatus }) {
  const config = {
    [BookingStatus.PENDING]: {
      color: 'warning',
      label: 'Pending',
      icon: <ClockCircleOutlined />,
    },
    [BookingStatus.ASSIGNED]: {
      color: 'processing',
      label: 'Assigned',
      icon: <UserOutlined />,
    },
    [BookingStatus.DRIVER_ARRIVED]: {
      color: 'purple',
      label: 'Driver Arrived',
      icon: <CarOutlined />,
    },
    [BookingStatus.IN_PROGRESS]: {
      color: 'cyan',
      label: 'In Progress',
      icon: <PlayCircleOutlined />,
    },
    [BookingStatus.COMPLETED]: {
      color: 'success',
      label: 'Completed',
      icon: <CheckCircleOutlined />,
    },
    [BookingStatus.CANCELLED]: {
      color: 'error',
      label: 'Cancelled',
      icon: <CloseCircleOutlined />,
    },
  };

  const { color, label, icon } = config[status];

  return (
    <Tag color={color} icon={icon}>
      {label}
    </Tag>
  );
}
