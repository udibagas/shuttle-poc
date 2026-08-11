import { useQuery } from '@tanstack/react-query'
import { Layout } from '../../components/Layout'
import { StatusBadge } from '../../components/StatusBadge'
import { apiClient } from '../../lib/api'
import { useWebSocket } from '../../hooks/useWebSocket'
import type { DashboardStats, Booking } from '@shuttle/types'
import { useEffect } from 'react'

export function AdminDashboard() {
  const { data: stats, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiClient.get('/admin/dashboard')
  })

  const { data: bookings, refetch: refetchBookings } = useQuery<Booking[]>({
    queryKey: ['admin-bookings'],
    queryFn: () => apiClient.get('/admin/bookings')
  })

  const ws = useWebSocket()

  useEffect(() => {
    const events = [
      'booking.created',
      'booking.assigned',
      'booking.driver_arrived',
      'booking.started',
      'booking.completed',
      'booking.cancelled'
    ]

    const unsubscribers = events.map((event) =>
      ws.on(event, () => {
        refetchStats()
        refetchBookings()
      })
    )

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [ws, refetchStats, refetchBookings])

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Active Drivers
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats?.activeDrivers || 0}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Pending Requests
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-yellow-600">
                {stats?.pendingRequests || 0}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Active Trips
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">
                {stats?.activeTrips || 0}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Completed Today
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                {stats?.completedToday || 0}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Cancelled Today
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-red-600">
                {stats?.cancelledToday || 0}
              </dd>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Bookings
            </h2>
          </div>
          <div className="border-t border-gray-200">
            {bookings && bookings.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Passenger
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.slice(0, 20).map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.bookingNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.user?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.pickupLocation?.name} →{' '}
                        {booking.destinationLocation?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.driver?.user?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.requestedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No bookings found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
