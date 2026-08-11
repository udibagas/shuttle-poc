import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Layout } from '../../components/Layout'
import { StatusBadge } from '../../components/StatusBadge'
import { apiClient } from '../../lib/api'
import { useWebSocket } from '../../hooks/useWebSocket'
import type { Booking, Driver } from '@shuttle/types'
import { BookingStatus, DriverStatus } from '@shuttle/types'

export function DriverDashboard() {
  const queryClient = useQueryClient()
  const ws = useWebSocket()

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

  const handleStatusToggle = () => {
    if (!profile) return
    const newStatus =
      profile.status === DriverStatus.ONLINE
        ? DriverStatus.OFFLINE
        : DriverStatus.ONLINE
    updateStatusMutation.mutate(newStatus)
  }

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
      <div className="px-4 sm:px-0 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Driver Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Status:</span>
            <button
              onClick={handleStatusToggle}
              disabled={profile?.status === DriverStatus.BUSY}
              className={`px-4 py-2 rounded-md text-sm font-medium ${profile?.status === DriverStatus.ONLINE
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
                } disabled:opacity-50`}
            >
              {profile?.status || 'Loading...'}
            </button>
          </div>
        </div>

        {currentBooking && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              Current Booking - {currentBooking.bookingNumber}
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Passenger</p>
                <p className="font-medium">{currentBooking.user?.name}</p>
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
              <div>
                <p className="text-sm text-gray-500">Passengers</p>
                <p className="font-medium">{currentBooking.passengerCount}</p>
              </div>
              {currentBooking.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-sm">{currentBooking.notes}</p>
                </div>
              )}
              <div className="pt-4 space-y-2">
                {currentBooking.status === BookingStatus.ASSIGNED && (
                  <button
                    onClick={() => arrivedMutation.mutate(currentBooking.id)}
                    disabled={arrivedMutation.isPending}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Mark as Arrived
                  </button>
                )}
                {currentBooking.status === BookingStatus.DRIVER_ARRIVED && (
                  <button
                    onClick={() => startTripMutation.mutate(currentBooking.id)}
                    disabled={startTripMutation.isPending}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Start Trip
                  </button>
                )}
                {currentBooking.status === BookingStatus.IN_PROGRESS && (
                  <button
                    onClick={() =>
                      completeTripMutation.mutate(currentBooking.id)
                    }
                    disabled={completeTripMutation.isPending}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Complete Trip
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!currentBooking &&
          profile?.status === DriverStatus.ONLINE &&
          availableBookings && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Available Requests</h2>
              {availableBookings.length > 0 ? (
                <div className="space-y-4">
                  {availableBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">
                          {booking.bookingNumber}
                        </h3>
                        <StatusBadge status={booking.status} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Route</p>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {booking.pickupLocation?.name}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium">
                            {booking.destinationLocation?.name}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Passengers</p>
                        <p className="font-medium">{booking.passengerCount}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            acceptBookingMutation.mutate(booking.id)
                          }
                          disabled={acceptBookingMutation.isPending}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            rejectBookingMutation.mutate(booking.id)
                          }
                          disabled={rejectBookingMutation.isPending}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">
                  No available requests
                </p>
              )}
            </div>
          )}

        {!currentBooking && profile?.status !== DriverStatus.ONLINE && (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500">
              Set your status to ONLINE to receive booking requests
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}
