import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '@shuttle/types'

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getUserNav = () => {
    if (!user) return []

    switch (user.role) {
      case UserRole.USER:
        return [
          { to: '/user', label: 'Dashboard' },
          { to: '/user/bookings', label: 'My Bookings' },
          { to: '/user/bookings/new', label: 'Request Shuttle' }
        ]
      case UserRole.DRIVER:
        return [
          { to: '/driver', label: 'Dashboard' },
          { to: '/driver/bookings', label: 'My Bookings' }
        ]
      case UserRole.ADMIN:
        return [
          { to: '/admin', label: 'Dashboard' },
          { to: '/admin/bookings', label: 'Bookings' },
          { to: '/admin/drivers', label: 'Drivers' },
          { to: '/admin/users', label: 'Users' },
          { to: '/admin/vehicles', label: 'Vehicles' },
          { to: '/admin/locations', label: 'Locations' }
        ]
      default:
        return []
    }
  }

  const navItems = getUserNav()

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Shuttle POC
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
