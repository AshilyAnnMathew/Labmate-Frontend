import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Beaker, Eye, EyeOff, ArrowLeft, User, Mail, Lock, Phone } from 'lucide-react'
import { authAPI, setAuthToken, googleAuthAPI, checkEmailExists } from '../services/api'

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailChecked, setEmailChecked] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Check for Google OAuth error in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get('error');
    if (error) {
      setErrors({ general: decodeURIComponent(error) });
    }
  }, [location.search]);

  // Debounced email checking
  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email && formData.email.includes('@')) {
        setIsCheckingEmail(true);
        try {
          const exists = await checkEmailExists(formData.email);
          setEmailChecked(true);
          if (exists) {
            setErrors(prev => ({
              ...prev,
              email: 'This email is already registered. Please use a different email or try logging in.'
            }));
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.email;
              return newErrors;
            });
          }
        } catch (error) {
          console.error('Error checking email:', error);
        } finally {
          setIsCheckingEmail(false);
        }
      } else {
        setEmailChecked(false);
      }
    };

    const timeoutId = setTimeout(checkEmail, 500); // Debounce for 500ms
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const handleGoogleSignup = () => {
    try {
      googleAuthAPI.initiateGoogleAuth();
    } catch (error) {
      console.error('Google OAuth error:', error);
      setErrors({ general: 'Failed to initiate Google authentication' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Real-time validation for each field
    validateField(name, value)
  }

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors }
    
    switch (fieldName) {
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = 'First name is required'
        } else if (value.trim().length < 2) {
          newErrors.firstName = 'First name must be at least 2 characters'
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          newErrors.firstName = 'First name can only contain letters and spaces'
        } else {
          delete newErrors.firstName
        }
        break
        
      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = 'Last name is required'
        } else if (value.trim().length < 2) {
          newErrors.lastName = 'Last name must be at least 2 characters'
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          newErrors.lastName = 'Last name can only contain letters and spaces'
        } else {
          delete newErrors.lastName
        }
        break
        
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address'
        } else {
          // Email will be checked for existence in useEffect
          delete newErrors.email
        }
        break
        
      case 'phone':
        if (!value.trim()) {
          newErrors.phone = 'Phone number is required'
        } else if (!/^[\+]?[0-9][\d]{7,15}$/.test(value.replace(/\s/g, ''))) {
          newErrors.phone = 'Please enter a valid phone number (7-15 digits)'
        } else {
          delete newErrors.phone
        }
        break
        
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required'
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters'
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        } else {
          delete newErrors.password
        }
        // Also validate confirm password if it exists
        if (formData.confirmPassword) {
          validateField('confirmPassword', formData.confirmPassword)
        }
        break
        
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password'
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match'
        } else {
          delete newErrors.confirmPassword
        }
        break
        
      default:
        break
    }
    
    setErrors(newErrors)
  }

  const validateForm = () => {
    // Validate all fields
    validateField('firstName', formData.firstName)
    validateField('lastName', formData.lastName)
    validateField('email', formData.email)
    validateField('phone', formData.phone)
    validateField('password', formData.password)
    validateField('confirmPassword', formData.confirmPassword)
    
    // Check if email has been checked and doesn't exist
    if (!emailChecked || isCheckingEmail) {
      setErrors(prev => ({
        ...prev,
        email: 'Please wait while we verify your email...'
      }))
      return false
    }
    
    // Check if there are any errors
    const hasErrors = Object.keys(errors).length > 0
    return !hasErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      // Call backend API to register user
      const response = await authAPI.register(formData)
      
      // Store token in localStorage
      setAuthToken(response.data.token)
      
      // Show success message
      console.log('Registration successful:', response.message)
      
      // Store email for verification
      localStorage.setItem('pendingEmail', formData.email)
      
      // Redirect to email verification
      navigate('/verify-email', { state: { email: formData.email } })
      
    } catch (error) {
      console.error('Registration error:', error)
      
      // Set error message
      setErrors({ 
        general: error.message || 'Registration failed. Please try again.' 
      })
      
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Sign Up Card */}
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
            <h2 className="text-3xl font-bold text-gray-900">Create Patient Account</h2>
            <p className="text-gray-600 mt-2">Join LabMate360 as a patient</p>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <motion.div
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-red-600 text-sm">{errors.general}</p>
            </motion.div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.firstName 
                      ? 'border-red-500 bg-red-50' 
                      : formData.firstName && !errors.firstName
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="First name"
                />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.firstName && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.firstName}
                  </motion.p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.lastName 
                      ? 'border-red-500 bg-red-50' 
                      : formData.lastName && !errors.lastName
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.lastName}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-10 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.email 
                      ? 'border-red-500 bg-red-50' 
                      : emailChecked && formData.email && !errors.email
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  errors.email ? 'text-red-400' : emailChecked && formData.email && !errors.email ? 'text-green-400' : 'text-gray-400'
                }`} />
                {isCheckingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  </div>
                )}
                {emailChecked && formData.email && !errors.email && !isCheckingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.email && (
                <motion.p 
                  className="mt-1 text-sm text-red-600 flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.email}
                </motion.p>
              )}
              {emailChecked && formData.email && !errors.email && (
                <motion.p 
                  className="mt-1 text-sm text-green-600 flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Email is available
                </motion.p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.phone 
                      ? 'border-red-500 bg-red-50' 
                      : formData.phone && !errors.phone
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.phone && (
                <motion.p 
                  className="mt-1 text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.phone}
                </motion.p>
              )}
            </div>


            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-10 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.password 
                      ? 'border-red-500 bg-red-50' 
                      : formData.password && !errors.password
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  errors.password ? 'text-red-400' : formData.password && !errors.password ? 'text-green-400' : 'text-gray-400'
                }`} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`h-1 w-1/4 rounded-full ${
                      formData.password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <div className={`h-1 w-1/4 rounded-full ${
                      /[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <div className={`h-1 w-1/4 rounded-full ${
                      /[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <div className={`h-1 w-1/4 rounded-full ${
                      /\d/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Password strength: {
                      formData.password.length >= 6 && /[a-z]/.test(formData.password) && 
                      /[A-Z]/.test(formData.password) && /\d/.test(formData.password) 
                        ? 'Strong' 
                        : formData.password.length >= 6 
                        ? 'Medium' 
                        : 'Weak'
                    }
                  </div>
                </div>
              )}
              
              {errors.password && (
                <motion.p 
                  className="mt-1 text-sm text-red-600 flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-10 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.confirmPassword 
                      ? 'border-red-500 bg-red-50' 
                      : formData.confirmPassword && !errors.confirmPassword
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  errors.confirmPassword ? 'text-red-400' : formData.confirmPassword && !errors.confirmPassword ? 'text-green-400' : 'text-gray-400'
                }`} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p 
                  className="mt-1 text-sm text-red-600 flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.confirmPassword}
                </motion.p>
              )}
              {formData.confirmPassword && !errors.confirmPassword && (
                <motion.p 
                  className="mt-1 text-sm text-green-600 flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Passwords match
                </motion.p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Sign Up Button */}
            <motion.button
              type="submit"
              disabled={isLoading || isCheckingEmail || Object.keys(errors).length > 0 || !emailChecked}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!isLoading && !isCheckingEmail && Object.keys(errors).length === 0 && emailChecked ? { scale: 1.02 } : {}}
              whileTap={!isLoading && !isCheckingEmail && Object.keys(errors).length === 0 && emailChecked ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : isCheckingEmail ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying Email...
                </div>
              ) : Object.keys(errors).length > 0 ? (
                'Please fix errors above'
              ) : !emailChecked ? (
                'Please verify your email'
              ) : (
                'Create Patient Account'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Google Signup Button */}
          <motion.button
            type="button"
            onClick={handleGoogleSignup}
            className="mt-6 w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have a patient account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SignUp
