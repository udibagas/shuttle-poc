import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { apiClient } from '../../lib/api'
import type { Location, CreateBookingRequest } from '@shuttle/types'

export function NewBooking() {
  const [pickupLocationId, setPickupLocationId] = useState('')
  const [destinationLocationId, setDestinationLocationId] = useState('')
  const [passengerCount, setPassengerCount] = useState(1)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: locations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: () => apiClient.get('/locations')
  })

  const createBookingMutation = useMutation({
    mutationFn: (data: CreateBookingRequest) =>
      apiClient.post('/bookings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      navigate('/user')
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create booking')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (pickupLocationId === destinationLocationId) {
      setError('Pickup and destination locations must be different')
      return
    }

    createBookingMutation.mutate({
      pickupLocationId,
      destinationLocationId,
      passengerCount,
      notes: notes || undefined
    })
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Request Shuttle
        </h1>

        <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="pickup"
                className="block text-sm font-medium text-gray-700"
              >
                Pickup Location
              </label>
              <select
                id="pickup"
                value={pickupLocationId}
                onChange={(e) => setPickupLocationId(e.target.value)}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select pickup location</option>
                {locations?.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="destination"
                className="block text-sm font-medium text-gray-700"
              >
                Destination
              </label>
              <select
                id="destination"
                value={destinationLocationId}
                onChange={(e) => setDestinationLocationId(e.target.value)}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select destination</option>
                {locations?.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="passengers"
                className="block text-sm font-medium text-gray-700"
              >
                Passenger Count
              </label>
              <input
                type="number"
                id="passengers"
                min="1"
                value={passengerCount}
                onChange={(e) => setPassengerCount(parseInt(e.target.value))}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Any special requirements..."
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={createBookingMutation.isPending}
                className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {createBookingMutation.isPending
                  ? 'Creating...'
                  : 'Request Shuttle'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/user')}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
