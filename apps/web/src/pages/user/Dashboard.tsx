import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { StatusBadge } from '../../components/StatusBadge'
import { apiClient } from '../../lib/api'
import { useWebSocket } from '../../hooks/useWebSocket'
import type { Booking } from '@shuttle/types'
import { BookingStatus } from '@shuttle/types'
import { useEffect } from 'react'

export function UserDashboard() {
  const { data: bookings, refetch } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: () => apiClient.get('/bookings')
  })

  const ws = useWebSocket()

  useEffect(() => {
    const unsubscribe = ws.on('booking.assigned', () => {
      refetch()
    })
    return unsubscribe
  }, [ws, refetch])

  useEffect(() => {
    const unsubscribe = ws.on('booking.driver_arrived', () => {
      refetch()
    })
    return unsubscribe
  }, [ws, refetch])

  useEffect(() => {
    const unsubscribe = ws.on('booking.started', () => {
      refetch()
    })
    return unsubscribe
  }, [ws, refetch])

  useEffect(() => {
    const unsubscribe = ws.on('booking.completed', () => {
      refetch()
    })
    return unsubscribe
  }, [ws, refetch])

  const currentBooking = bookings?.find(
    (b) =>
      b.status === BookingStatus.PENDING ||
      b.status === BookingStatus.ASSIGNED ||
      b.status === BookingStatus.DRIVER_ARRIVED ||
      b.status === BookingStatus.IN_PROGRESS
  )

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          User Dashboard
        </h1>

        <Link
          to="/user/bookings/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-6"
        >
          Request Shuttle
        </Link>

        {currentBooking && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Current Booking</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Booking Number</p>
                <p className="font-semibold">{currentBooking.bookingNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Route</p>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {currentBooking.pickupLocation?.name}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium">
                    {currentBooking.destinationLocation?.name}
                  </span>
                </div>
              </div>
              {currentBooking.driver && (
                <div>
                  <p className="text-sm text-gray-500">Driver</p>
                  <p className="font-medium">{currentBooking.driver.user?.name}</p>
                  {currentBooking.driver.vehicle && (
                    <p className="text-sm text-gray-500">
                      {currentBooking.driver.vehicle.plateNumber}
                    </p>
                  )}
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <StatusBadge status={currentBooking.status} />
              </div>
            </div>
          </div>
        )}

        {!currentBooking && (
          <div className="bg-gray-50 rounded-lg p-6 text-center mb-6">
            <p className="text-gray-500">No active booking</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
          {bookings && bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <p className="font-medium">{booking.bookingNumber}</p>
                    <p className="text-sm text-gray-500">
                      {booking.pickupLocation?.name} →{' '}
                      {booking.destinationLocation?.name}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No bookings yet</p>
          )}
        </div>
      </div>
    </Layout>
  )
}
