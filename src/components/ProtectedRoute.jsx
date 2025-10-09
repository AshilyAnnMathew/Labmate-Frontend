import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAdmin, isStaff, isUser, isLocalAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Debug logging
  console.log('ProtectedRoute - User role:', user?.role, 'Required role:', requiredRole)
  console.log('ProtectedRoute - User data:', user)

  // Check role-based access
  if (requiredRole === 'admin' && !isAdmin()) {
    console.log('ProtectedRoute - Admin access denied, redirecting to user dashboard')
    return <Navigate to="/user/dashboard" replace />
  }

  if (requiredRole === 'staff' && !isStaff()) {
    console.log('ProtectedRoute - Staff access denied, redirecting to user dashboard')
    return <Navigate to="/user/dashboard" replace />
  }

  if (requiredRole === 'local_admin' && !isLocalAdmin()) {
    console.log('ProtectedRoute - Local admin access denied, user role:', user?.role)
    // If user is actually a local_admin but assignedLab is missing, redirect to user dashboard
    if (user?.role === 'local_admin' && !user?.assignedLab) {
      console.log('ProtectedRoute - Local admin has no assigned lab, redirecting to user dashboard')
      return <Navigate to="/user/dashboard" replace />
    }
    console.log('ProtectedRoute - Redirecting to user dashboard')
    return <Navigate to="/user/dashboard" replace />
  }

  if (requiredRole === 'user' && !isUser()) {
    console.log('ProtectedRoute - User access denied, redirecting to user dashboard')
    return <Navigate to="/user/dashboard" replace />
  }

  console.log('ProtectedRoute - Access granted')
  return children
}

export default ProtectedRoute
