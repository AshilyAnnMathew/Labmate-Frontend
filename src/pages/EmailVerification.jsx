import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Beaker, Mail, ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react'
import { authAPI } from '../services/api'

const EmailVerification = () => {
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [userEmail, setUserEmail] = useState('')

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Get email from location state or localStorage
    const emailFromState = location.state?.email
    const emailFromStorage = localStorage.getItem('pendingEmail')
    
    if (emailFromState) {
      setEmail(emailFromState)
      setUserEmail(emailFromState)
    } else if (emailFromStorage) {
      setEmail(emailFromStorage)
      setUserEmail(emailFromStorage)
    } else {
      // If no email found, redirect to signup
      navigate('/signup')
    }
  }, [location.state, navigate])

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    
    // Clear error when user starts typing
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!otp) {
      setErrors({ otp: 'OTP is required' })
      return
    }
    
    if (otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('http://localhost:5000/api/verification/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // Clear pending email from localStorage
        localStorage.removeItem('pendingEmail')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setErrors({ general: data.message || 'Invalid OTP' })
      }
    } catch (error) {
      console.error('Verification error:', error)
      setErrors({ general: 'Failed to verify OTP. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsResending(true)
    setErrors({})

    try {
      const response = await fetch('http://localhost:5000/api/verification/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setCountdown(60) // 1 minute cooldown
        setErrors({ success: 'OTP resent successfully!' })
      } else {
        setErrors({ general: data.message || 'Failed to resend OTP' })
      }
    } catch (error) {
      console.error('Resend error:', error)
      setErrors({ general: 'Failed to resend OTP. Please try again.' })
    } finally {
      setIsResending(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-md w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CheckCircle className="h-16 w-16 text-green-500" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Email Verified!</h2>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You can now log in to your LabMate360 account.
            </p>
            
            <motion.div
              className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="text-green-700 text-sm">
                Redirecting to login page in a few seconds...
              </p>
            </motion.div>

            <Link
              to="/login"
              className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Back to Sign Up Link */}
        <div className="mb-6">
          <Link 
            to="/signup" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign Up
          </Link>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div 
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Beaker className="h-12 w-12 text-primary-600" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
            <p className="text-gray-600 mt-2">Enter the 6-digit code sent to your email</p>
          </div>

          {/* Email Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <Mail className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Code sent to:</span>
              <span className="text-sm font-medium text-gray-900 ml-1">{userEmail}</span>
            </div>
          </div>

          {/* Success/Error Messages */}
          {errors.success && (
            <motion.div
              className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-green-600 text-sm">{errors.success}</p>
            </motion.div>
          )}

          {errors.general && (
            <motion.div
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-red-600 text-sm">{errors.general}</p>
            </motion.div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOtpChange}
                className={`w-full px-4 py-3 text-center text-2xl font-mono border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.otp ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="000000"
                maxLength={6}
                autoComplete="off"
              />
              {errors.otp && (
                <motion.p 
                  className="mt-1 text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.otp}
                </motion.p>
              )}
            </div>

            {/* Verify Button */}
            <motion.button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </motion.button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOtp}
              disabled={isResending || countdown > 0}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {isResending ? (
                'Sending...'
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                'Resend Code'
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> The verification code will expire in 10 minutes. 
              Check your spam folder if you don't see the email.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default EmailVerification
