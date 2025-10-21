import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useMemo } from 'react'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAdmin, isStaff, isUser, isLocalAdmin } = useAuth()

  // Memoize the access check to prevent unnecessary re-renders
  const accessResult = useMemo(() => {
    if (loading) {
      return { type: 'loading' }
    }

    if (!user) {
      return { type: 'redirect', to: '/login' }
    }

    // Check role-based access
    if (requiredRole === 'admin' && !isAdmin()) {
      return { type: 'redirect', to: '/user/dashboard' }
    }

    if (requiredRole === 'staff' && !isStaff()) {
      return { type: 'redirect', to: '/user/dashboard' }
    }

    if (requiredRole === 'local_admin' && !isLocalAdmin()) {
      // If user is actually a local_admin but assignedLab is missing, redirect to user dashboard
      if (user?.role === 'local_admin' && !user?.assignedLab) {
        return { type: 'redirect', to: '/user/dashboard' }
      }
      return { type: 'redirect', to: '/user/dashboard' }
    }

    if (requiredRole === 'user' && !isUser()) {
      return { type: 'redirect', to: '/user/dashboard' }
    }

    return { type: 'granted' }
  }, [user, loading, requiredRole, isAdmin, isStaff, isUser, isLocalAdmin])

  // Debug logging (only when values change)
  if (process.env.NODE_ENV === 'development' && accessResult.type === 'granted') {
    console.log('ProtectedRoute - Access granted for role:', requiredRole)
  }

  if (accessResult.type === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (accessResult.type === 'redirect') {
    return <Navigate to={accessResult.to} replace />
  }

  return children
}

export default ProtectedRoute
