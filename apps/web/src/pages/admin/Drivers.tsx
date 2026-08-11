import { useQuery } from '@tanstack/react-query'
import { Layout } from '../../components/Layout'
import { apiClient } from '../../lib/api'
import type { Driver } from '@shuttle/types'
import { DriverStatus } from '@shuttle/types'

export function AdminDrivers() {
  const { data: drivers, isLoading } = useQuery<Driver[]>({
    queryKey: ['admin-drivers'],
    queryFn: () => apiClient.get('/admin/drivers')
  })

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </Layout>
    )
  }

  const getStatusColor = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.ONLINE:
        return 'bg-green-100 text-green-800'
      case DriverStatus.BUSY:
        return 'bg-blue-100 text-blue-800'
      case DriverStatus.OFFLINE:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Drivers</h1>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {drivers && drivers.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Booking
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {driver.user?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          driver.status
                        )}`}
                      >
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.vehicle?.plateNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(driver as any).bookings?.length > 0
                        ? (driver as any).bookings[0].pickupLocation?.name +
                        ' → ' +
                        (driver as any).bookings[0].destinationLocation?.name
                        : 'No active booking'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No drivers found</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
