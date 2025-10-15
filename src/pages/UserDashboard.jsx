import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Upload, 
  FileText, 
  Download, 
  MapPin, 
  HelpCircle,
  MessageCircle
} from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import PlaceholderPage from '../components/common/PlaceholderPage'
import DownloadReports from './DownloadReports'
import NearbyLabs from '../components/NearbyLabs'
import BookTests from './BookTests'
import MyBookings from './MyBookings'
import ProfileCompletionModal from '../components/ProfileCompletionModal'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../services/api'

const UserDashboard = () => {
  const { user, updateUser, loading } = useAuth()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isProfileComplete, setIsProfileComplete] = useState(true)

  // Check if profile is complete
  useEffect(() => {
    // Don't check profile completeness while still loading user data
    if (loading) {
      return
    }
    
    if (user) {
      // Refresh user data from backend to ensure we have latest profile data
      const refreshUserData = async () => {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data.user) {
              updateUser(data.data.user)
              return data.data.user
            }
          }
        } catch (error) {
          console.error('Error refreshing user data:', error)
        }
        return user
      }
      
      // Use refreshed data if available, otherwise use current user data
      refreshUserData().then(currentUser => {
        // Check if all required profile fields are present and valid
        // Handle MongoDB number format and various data types
        const userAge = currentUser.age
        const userGender = currentUser.gender
        const userDateOfBirth = currentUser.dateOfBirth
      
      console.log('Raw user data:', {
        age: userAge,
        gender: userGender,
        dateOfBirth: userDateOfBirth,
        ageType: typeof userAge,
        genderType: typeof userGender,
        dateOfBirthType: typeof userDateOfBirth
      })
      
      // Convert age to number if it's in MongoDB format or string
      const ageValue = typeof userAge === 'object' && userAge.$numberInt 
        ? parseInt(userAge.$numberInt) 
        : typeof userAge === 'string' 
        ? parseInt(userAge) 
        : userAge
      
        const hasAge = ageValue !== null && ageValue !== undefined && !isNaN(ageValue) && ageValue > 0
        const hasGender = userGender && userGender.trim() !== ''
        const hasAddress = currentUser.address && currentUser.address.trim() !== ''
        
        // Match backend isProfileComplete logic: age OR dateOfBirth, gender, and address
        const hasAgeOrDateOfBirth = hasAge || (userDateOfBirth && new Date(userDateOfBirth).getTime() > 0)
        const profileComplete = hasAgeOrDateOfBirth && hasGender && hasAddress
        setIsProfileComplete(profileComplete)
        
        console.log('Profile completeness check:', {
          currentUser,
          ageValue,
          hasAge,
          hasGender,
          hasAddress,
          hasAgeOrDateOfBirth,
          profileComplete
        })
        
        // Show modal only if profile is incomplete
        if (!profileComplete) {
          setShowProfileModal(true)
        } else {
          setShowProfileModal(false)
        }
      })
    } else {
      // No user data yet, don't show modal
      setIsProfileComplete(true)
      setShowProfileModal(false)
    }
  }, [user, loading])

  const handleProfileComplete = (updatedUser) => {
    // Update the user context with the new data
    updateUser(updatedUser)
    setShowProfileModal(false)
    setIsProfileComplete(true)
  }

  const handleProfileModalClose = () => {
    // Don't allow closing if profile is incomplete
    if (!isProfileComplete) {
      return
    }
    setShowProfileModal(false)
  }

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
      path: 'healthbot',
      label: 'HealthBot',
      icon: MessageCircle
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


  // Replaced with real page in ./DownloadReports.jsx


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

  // HealthBot Component
  const HealthBot = () => {
    const [messages, setMessages] = useState([
      {
        id: 1,
        text: "Hi! I'm HealthBot, your AI health assistant. I can help you with general health questions, explain test results, provide health tips, and answer questions about your lab reports. How can I assist you today?",
        isBot: true,
        timestamp: new Date()
      }
    ])
    const [inputMessage, setInputMessage] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const sendMessage = async () => {
      if (!inputMessage.trim() || isLoading) return

      const userMessage = {
        id: Date.now(),
        text: inputMessage,
        isBot: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, userMessage])
      setInputMessage('')
      setIsTyping(true)
      setIsLoading(true)

      try {
        // Call Google Gemini API
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': process.env.REACT_APP_GOOGLE_AI_API_KEY || 'AIzaSyAywhccPmyHxbbK_D5hhM6n7tC8PnX_El0'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are HealthBot, a friendly and knowledgeable AI health assistant for a laboratory management system. 

User context:
- Patient: ${user?.firstName} ${user?.lastName}
- Age: ${user?.age || 'Not specified'}
- Gender: ${user?.gender || 'Not specified'}

Guidelines for responses:
1. Be friendly, empathetic, and professional
2. Provide helpful health information and general guidance
3. Always remind users to consult healthcare professionals for medical advice
4. You can help explain lab test results if they provide them
5. Keep responses concise but informative (2-4 sentences)
6. Use simple, easy-to-understand language
7. Do not provide specific medical diagnoses or treatment recommendations
8. Always end with asking if they need help with anything else

User's question: ${inputMessage}`
                  }
                ]
              }
            ]
          })
        })

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`)
        }

        const data = await response.json()
        const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I'm having trouble processing your request right now. Please try again or consult with a healthcare professional."

        const botMessage = {
          id: Date.now() + 1,
          text: botResponse,
          isBot: true,
          timestamp: new Date()
        }

        setTimeout(() => {
          setMessages(prev => [...prev, botMessage])
          setIsTyping(false)
          setIsLoading(false)
        }, 1000)

      } catch (error) {
        console.error('HealthBot error:', error)
        const errorMessage = {
          id: Date.now() + 1,
          text: "I'm sorry, I'm experiencing technical difficulties right now. Please try again later or consult with a healthcare professional for immediate assistance.",
          isBot: true,
          timestamp: new Date()
        }
        
        setTimeout(() => {
          setMessages(prev => [...prev, errorMessage])
          setIsTyping(false)
          setIsLoading(false)
        }, 1000)
      }
    }

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    }

    const formatTime = (date) => {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    }

    return (
      <div className="h-full flex flex-col bg-gray-50 rounded-lg shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">HealthBot</h2>
              <p className="text-blue-100 text-sm">Your AI Health Assistant</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isBot
                    ? 'bg-white border border-gray-200 shadow-sm'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.isBot ? 'text-gray-500' : 'text-blue-100'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your health, lab results, or general wellness..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <MessageCircle className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Quick Suggestions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "What should I know about my lab results?",
              "How to prepare for blood tests?",
              "General health tips",
              "When to see a doctor?"
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(suggestion)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="px-4 pb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="text-yellow-600">⚠️</div>
              <p className="text-xs text-yellow-800">
                <strong>Disclaimer:</strong> HealthBot provides general health information and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical concerns.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Profile Component
  const Profile = () => {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [formData, setFormData] = useState({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      age: user?.age || '',
      gender: user?.gender || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      address: user?.address || '',
      emergencyContact: user?.emergencyContact || ''
    })

    const handleInputChange = (e) => {
      const { name, value } = e.target
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
      
      // Auto-calculate age from date of birth
      if (name === 'dateOfBirth' && value) {
        const today = new Date()
        const birthDate = new Date(value)
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        
        setFormData(prev => ({
          ...prev,
          age: age
        }))
      }
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      setError('')
      setSuccess('')

      try {
        const response = await authAPI.updateProfile(formData)
        
        if (response.success) {
          setSuccess('Profile updated successfully!')
          updateUser(response.data)
          setIsEditing(false)
        } else {
          setError(response.message || 'Failed to update profile')
        }
      } catch (error) {
        console.error('Profile update error:', error)
        setError(error.message || 'Failed to update profile')
      } finally {
        setLoading(false)
      }
    }

    const handleCancel = () => {
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        age: user?.age || '',
        gender: user?.gender || '',
        dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        address: user?.address || '',
        emergencyContact: user?.emergencyContact || ''
      })
      setIsEditing(false)
      setError('')
      setSuccess('')
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">View and update your personal information</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    required
                  />
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Profile Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    min="0"
                    max="150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Enter your address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Emergency contact number"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    )
  }

  // Show loading state while user data is being loaded
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DashboardLayout
        title="Patient Dashboard"
        sidebarItems={sidebarItems}
        userRole="Patient"
        userEmail={user?.email || "user@labmate360.com"}
      >
        <Routes>
          <Route path="/" element={<BookTests />} />
          <Route path="upload-prescription" element={<UploadPrescription />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="reports" element={<DownloadReports />} />
          <Route path="profile" element={<Profile />} />
          <Route path="nearby-labs" element={<NearbyLabs />} />
          <Route path="healthbot" element={<HealthBot />} />
          <Route path="support" element={<Support />} />
          <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
        </Routes>
      </DashboardLayout>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={handleProfileModalClose}
        onComplete={handleProfileComplete}
        user={user}
      />
    </>
  )
}

export default UserDashboard
