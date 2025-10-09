import { Routes, Route, Navigate } from 'react-router-dom'
import { 
  Calendar, 
  Upload, 
  FileText, 
  Download, 
  MapPin, 
  HelpCircle 
} from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import PlaceholderPage from '../components/common/PlaceholderPage'
import NearbyLabs from '../components/NearbyLabs'
import BookTests from './BookTests'
import MyBookings from './MyBookings'

const UserDashboard = () => {
  const sidebarItems = [
    {
      path: '/user/dashboard',
      label: 'Book Tests',
      icon: Calendar
    },
    {
      path: 'upload-prescription',
      label: 'Upload Prescription',
      icon: Upload
    },
    {
      path: 'bookings',
      label: 'My Bookings',
      icon: FileText
    },
    {
      path: 'reports',
      label: 'Download Reports',
      icon: Download
    },
    {
      path: 'nearby-labs',
      label: 'Nearby Labs',
      icon: MapPin
    },
    {
      path: 'support',
      label: 'Support',
      icon: HelpCircle
    }
  ]


  const UploadPrescription = () => (
    <PlaceholderPage
      title="Upload Prescription"
      description="Upload your doctor's prescription for laboratory tests"
      icon={Upload}
      features={[
        {
          title: "Secure Upload",
          description: "Safely upload prescription images and documents"
        },
        {
          title: "Prescription Validation",
          description: "Automatic validation of prescription format and content"
        },
        {
          title: "Doctor Verification",
          description: "Verification with prescribing doctor when needed"
        },
        {
          title: "Test Authorization",
          description: "Automatic test authorization based on prescription"
        }
      ]}
    />
  )


  const DownloadReports = () => (
    <PlaceholderPage
      title="Download Reports"
      description="Access and download your laboratory test reports"
      icon={Download}
      features={[
        {
          title: "Report Library",
          description: "Access all your completed test reports in one place"
        },
        {
          title: "Secure Download",
          description: "Download reports with encryption and authentication"
        },
        {
          title: "Report Sharing",
          description: "Share reports securely with healthcare providers"
        },
        {
          title: "Digital Storage",
          description: "Long-term digital storage of all your medical reports"
        }
      ]}
    />
  )


  const Support = () => (
    <PlaceholderPage
      title="Support & Help"
      description="Get assistance with your laboratory needs"
      icon={HelpCircle}
      features={[
        {
          title: "FAQ Section",
          description: "Find answers to frequently asked questions"
        },
        {
          title: "Live Chat",
          description: "Chat with our support team for immediate assistance"
        },
        {
          title: "Help Documentation",
          description: "Comprehensive guides and tutorials for using the platform"
        },
        {
          title: "Contact Support",
          description: "Get in touch with our support team via phone or email"
        }
      ]}
    />
  )

  return (
    <DashboardLayout
      title="Patient Dashboard"
      sidebarItems={sidebarItems}
      userRole="Patient"
      userEmail="user@labmate360.com"
    >
      <Routes>
        <Route path="/" element={<BookTests />} />
        <Route path="upload-prescription" element={<UploadPrescription />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="reports" element={<DownloadReports />} />
        <Route path="nearby-labs" element={<NearbyLabs />} />
        <Route path="support" element={<Support />} />
        <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

export default UserDashboard
