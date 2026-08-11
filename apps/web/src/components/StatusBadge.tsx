import { BookingStatus } from '@shuttle/types'

export function StatusBadge({ status }: { status: BookingStatus }) {
  const styles = {
    [BookingStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [BookingStatus.ASSIGNED]: 'bg-blue-100 text-blue-800',
    [BookingStatus.DRIVER_ARRIVED]: 'bg-purple-100 text-purple-800',
    [BookingStatus.IN_PROGRESS]: 'bg-indigo-100 text-indigo-800',
    [BookingStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [BookingStatus.CANCELLED]: 'bg-red-100 text-red-800'
  }

  const labels = {
    [BookingStatus.PENDING]: 'Pending',
    [BookingStatus.ASSIGNED]: 'Assigned',
    [BookingStatus.DRIVER_ARRIVED]: 'Driver Arrived',
    [BookingStatus.IN_PROGRESS]: 'In Progress',
    [BookingStatus.COMPLETED]: 'Completed',
    [BookingStatus.CANCELLED]: 'Cancelled'
  }

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
