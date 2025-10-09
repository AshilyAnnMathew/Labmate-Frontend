import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Upload, 
  FileText, 
  MessageSquare 
} from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import PlaceholderPage from '../components/common/PlaceholderPage'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const StaffDashboard = () => {
  const { user } = useAuth()
  const [assignedLab, setAssignedLab] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch assigned lab information
  useEffect(() => {
    const fetchAssignedLab = async () => {
      try {
        console.log('StaffDashboard - User assignedLab:', user?.assignedLab)
        if (user?.assignedLab) {
          try {
            const response = await api.labAPI.getLab(user.assignedLab)
            console.log('StaffDashboard - Lab data:', response.data)
            setAssignedLab(response.data)
          } catch (error) {
            console.error('StaffDashboard - Failed to fetch lab:', error)
            setAssignedLab(null)
          }
        } else {
          console.log('StaffDashboard - No assigned lab found')
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
      path: '/staff/dashboard',
      label: 'Assigned Bookings',
      icon: Calendar
    },
    {
      path: '/staff/upload-reports',
      label: 'Upload Reports',
      icon: Upload
    },
    {
      path: '/staff/prescriptions',
      label: 'Prescription Handling',
      icon: FileText
    },
    {
      path: '/staff/communication',
      label: 'Patient Communication',
      icon: MessageSquare
    }
  ]

  const AssignedBookings = () => (
    <PlaceholderPage
      title="Assigned Bookings"
      description="Manage your assigned laboratory bookings and appointments"
      icon={Calendar}
      features={[
        {
          title: "Today's Schedule",
          description: "View and manage your daily appointment schedule"
        },
        {
          title: "Upcoming Appointments",
          description: "Track upcoming bookings and prepare accordingly"
        },
        {
          title: "Booking Details",
          description: "Access comprehensive patient and test information"
        },
        {
          title: "Status Updates",
          description: "Update booking status and add notes for other staff"
        }
      ]}
    />
  )

  const UploadReports = () => (
    <PlaceholderPage
      title="Upload Reports"
      description="Upload and manage laboratory test reports and results"
      icon="Upload"
      features={[
        {
          title: "Report Upload",
          description: "Securely upload test results and laboratory reports"
        },
        {
          title: "Quality Control",
          description: "Review and validate reports before patient delivery"
        },
        {
          title: "Report Templates",
          description: "Use standardized templates for consistent reporting"
        },
        {
          title: "Digital Signatures",
          description: "Add digital signatures and authentication to reports"
        }
      ]}
    />
  )

  const PrescriptionHandling = () => (
    <PlaceholderPage
      title="Prescription Handling"
      description="Process and manage patient prescriptions and test requests"
      icon="FileText"
      features={[
        {
          title: "Prescription Review",
          description: "Review and validate incoming prescriptions from doctors"
        },
        {
          title: "Test Authorization",
          description: "Authorize tests based on prescription requirements"
        },
        {
          title: "Insurance Verification",
          description: "Verify insurance coverage and authorization requirements"
        },
        {
          title: "Prior Authorization",
          description: "Handle prior authorization requests for specialized tests"
        }
      ]}
    />
  )

  const PatientCommunication = () => (
    <PlaceholderPage
      title="Patient Communication"
      description="Communicate with patients about their tests and results"
      icon="MessageSquare"
      features={[
        {
          title: "Result Notifications",
          description: "Send automated and manual notifications for test results"
        },
        {
          title: "Appointment Reminders",
          description: "Send reminders and confirmations for upcoming appointments"
        },
        {
          title: "Patient Queries",
          description: "Respond to patient questions and concerns"
        },
        {
          title: "Follow-up Care",
          description: "Coordinate follow-up appointments and additional testing"
        }
      ]}
    />
  )

  return (
    <DashboardLayout
      title={`Staff Dashboard - ${assignedLab?.name || 'Loading...'}`}
      sidebarItems={sidebarItems}
      userRole="Laboratory Staff"
      userEmail={user?.email}
    >
      <Routes>
        <Route path="/" element={<AssignedBookings />} />
        <Route path="/upload-reports" element={<UploadReports />} />
        <Route path="/prescriptions" element={<PrescriptionHandling />} />
        <Route path="/communication" element={<PatientCommunication />} />
        <Route path="*" element={<Navigate to="/staff/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

export default StaffDashboard
