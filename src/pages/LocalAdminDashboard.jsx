import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  TestTube, 
  Calendar, 
  Settings as SettingsIcon,
  Building2
} from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import LocalAdminStaffManagement from './LocalAdminStaffManagement'
import LocalAdminTestsPackages from './LocalAdminTestsPackages'
import LocalAdminBookings from './LocalAdminBookings'
import LocalAdminSettings from './LocalAdminSettings'
import PlaceholderPage from '../components/common/PlaceholderPage'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const LocalAdminDashboard = () => {
  const { user } = useAuth()
  const [assignedLab, setAssignedLab] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch assigned lab information
  useEffect(() => {
    const fetchAssignedLab = async () => {
      try {
        console.log('LocalAdminDashboard - User assignedLab:', user?.assignedLab)
        if (user?.assignedLab) {
          try {
            const response = await api.labAPI.getLab(user.assignedLab)
            console.log('LocalAdminDashboard - Lab data:', response.data)
            setAssignedLab(response.data)
          } catch (error) {
            console.error('LocalAdminDashboard - Failed to fetch lab:', error)
            setAssignedLab(null)
          }
        } else {
          console.log('LocalAdminDashboard - No assigned lab found')
          setAssignedLab(null)
        }
      } catch (error) {
        console.error('Error fetching assigned lab:', error)
        setAssignedLab(null)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchAssignedLab()
    } else {
      setLoading(false)
    }
  }, [user])

  const sidebarItems = [
    {
      path: '/localadmin/dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard
    },
    {
      path: '/localadmin/dashboard/staff',
      label: 'Manage Staff',
      icon: Users
    },
    {
      path: '/localadmin/dashboard/tests',
      label: 'Manage Tests & Packages',
      icon: TestTube
    },
    {
      path: '/localadmin/dashboard/bookings',
      label: 'View Bookings',
      icon: Calendar
    },
    {
      path: '/localadmin/dashboard/settings',
      label: 'Lab Settings',
      icon: SettingsIcon
    }
  ]

  const DashboardOverview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      )
    }

    if (!assignedLab) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Lab Assigned</h3>
            <p className="text-gray-600">You don't have a lab assigned to your account. Please contact the administrator.</p>
          </div>
        </div>
      )
    }

    return (
      <PlaceholderPage
        title="Local Admin Dashboard"
        description={`Manage operations for ${assignedLab.name}`}
        icon={Building2}
        features={[
          {
            title: "Staff Management",
            description: "Manage staff members within your assigned lab"
          },
          {
            title: "Test & Package Management",
            description: "Create and manage tests and packages for your lab"
          },
          {
            title: "Booking Management",
            description: "View and manage bookings for your lab"
          },
          {
            title: "Lab Settings",
            description: "Configure settings specific to your lab"
          }
        ]}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!assignedLab) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Lab Assigned</h3>
          <p className="text-gray-600">You don't have a lab assigned to your account. Please contact the administrator.</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout
      title={`Local Admin Dashboard - ${assignedLab?.name || 'Loading...'}`}
      sidebarItems={sidebarItems}
      userRole="Local Administrator"
      userEmail={user?.email}
    >
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/staff" element={<LocalAdminStaffManagement assignedLab={assignedLab} />} />
        <Route path="/tests" element={<LocalAdminTestsPackages assignedLab={assignedLab} />} />
        <Route path="/bookings" element={<LocalAdminBookings assignedLab={assignedLab} />} />
        <Route path="/settings" element={<LocalAdminSettings assignedLab={assignedLab} />} />
        <Route path="*" element={<Navigate to="/localadmin/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

export default LocalAdminDashboard