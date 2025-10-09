import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail,
  Calendar,
  Search,
  Loader,
  AlertCircle,
  CheckCircle,
  Building2,
  Navigation,
  Filter,
  ChevronRight,
  X,
  FlaskConical,
  Package,
  ArrowLeft
} from 'lucide-react'
import Swal from 'sweetalert2'
import api from '../services/api'

const { labAPI, testAPI, packageAPI, bookingAPI } = api

const BookTests = () => {
  // Location and labs state
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState('')
  const [labs, setLabs] = useState([])
  const [nearbyLabs, setNearbyLabs] = useState([])
  const [allLabs, setAllLabs] = useState([])
  
  // Selection states
  const [selectedLab, setSelectedLab] = useState(null)
  const [selectedTests, setSelectedTests] = useState([])
  const [selectedPackages, setSelectedPackages] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [notes, setNotes] = useState('')
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAllLabs, setShowAllLabs] = useState(false)
  const [bookingStep, setBookingStep] = useState(1) // 1: Lab Selection, 2: Test Selection, 3: Schedule, 4: Payment, 5: Confirm
  
  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  useEffect(() => {
    getCurrentLocation()
    fetchLabs()
  }, [])

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ latitude, longitude })
        setLocationError('')
        setLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setLocationError('Unable to get your location. Please enable location access.')
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000
      }
    )
  }

  // Fetch all labs
  const fetchLabs = async () => {
    try {
      setLoading(true)
      const response = await labAPI.getLabs()
      const allLabsData = response.data || []
      
      // Debug: Log the labs data structure
      console.log('Fetched labs data:', allLabsData)
      if (allLabsData.length > 0) {
        console.log('First lab structure:', allLabsData[0])
        console.log('First lab availableTests:', allLabsData[0].availableTests)
        console.log('First lab availablePackages:', allLabsData[0].availablePackages)
      }
      
      setAllLabs(allLabsData)
      
      // Calculate distances and sort by proximity if location is available
      if (userLocation) {
        const labsWithDistance = allLabsData.map(lab => ({
          ...lab,
          distance: calculateDistance(userLocation, lab)
        }))
        const sortedLabs = labsWithDistance.sort((a, b) => a.distance - b.distance)
        setLabs(sortedLabs)
        setNearbyLabs(sortedLabs.slice(0, 5)) // Show top 5 nearby labs
      } else {
        setLabs(allLabsData)
        setNearbyLabs(allLabsData.slice(0, 5))
      }
    } catch (err) {
      setError('Failed to fetch labs')
      console.error('Error fetching labs:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch tests and packages for selected lab
  const fetchLabDetails = async (lab) => {
    try {
      setLoading(true)
      
      // Debug: Log the lab data structure
      console.log('Selected lab data:', lab)
      console.log('Available tests:', lab.availableTests)
      console.log('Available packages:', lab.availablePackages)
      
      // The lab data already contains populated test and package objects
      // We just need to extract them properly
      let availableTests = []
      let availablePackages = []
      
      // Handle availableTests - could be populated objects or just IDs
      if (lab.availableTests && lab.availableTests.length > 0) {
        availableTests = lab.availableTests.map(test => {
          // If test is already a populated object, use it directly
          if (typeof test === 'object' && test._id) {
            return test
          }
          // If test is just an ID, we'd need to fetch the full test data
          // But since the backend should populate it, this shouldn't happen
          return test
        }).filter(test => test && typeof test === 'object')
      }
      
      // Handle availablePackages - could be populated objects or just IDs
      if (lab.availablePackages && lab.availablePackages.length > 0) {
        availablePackages = lab.availablePackages.map(packageItem => {
          // If package is already a populated object, use it directly
          if (typeof packageItem === 'object' && packageItem._id) {
            return packageItem
          }
          // If package is just an ID, we'd need to fetch the full package data
          // But since the backend should populate it, this shouldn't happen
          return packageItem
        }).filter(packageItem => packageItem && typeof packageItem === 'object')
      }
      
      // Debug: Log processed data
      console.log('Processed available tests:', availableTests)
      console.log('Processed available packages:', availablePackages)
      
      // Update the selected lab with detailed test and package information
      const updatedLab = {
        ...lab,
        availableTestsDetails: availableTests,
        availablePackagesDetails: availablePackages
      }
      
      console.log('Updated lab with details:', updatedLab)
      setSelectedLab(updatedLab)
    } catch (err) {
      setError('Failed to fetch lab details')
      console.error('Error fetching lab details:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (userLoc, lab) => {
    if (!userLoc || !lab.address) return Infinity
    
    try {
      // Parse lab address if it's a string
      let labAddress = lab.address
      if (typeof lab.address === 'string') {
        labAddress = JSON.parse(lab.address)
      }
      
      // For demo purposes, we'll use a simple distance calculation
      // In a real app, you'd use the lab's actual coordinates
      const R = 6371 // Earth's radius in km
      const dLat = (0 - userLoc.latitude) * Math.PI / 180
      const dLon = (0 - userLoc.longitude) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(userLoc.latitude * Math.PI / 180) * Math.cos(0 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c
      
      return Math.round(distance * 10) / 10 // Round to 1 decimal place
    } catch (error) {
      return Infinity
    }
  }

  // Handle lab selection
  const handleLabSelection = async (lab) => {
    setSelectedTests([])
    setSelectedPackages([])
    setBookingStep(2)
    await fetchLabDetails(lab)
  }

  // Toggle test selection
  const toggleTestSelection = (testId) => {
    setSelectedTests(prev => 
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    )
  }

  // Toggle package selection
  const togglePackageSelection = (packageId) => {
    setSelectedPackages(prev => 
      prev.includes(packageId)
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    )
  }

  // Handle booking submission
  const handleBooking = async () => {
    if (!selectedLab || (!selectedTests.length && !selectedPackages.length)) {
      Swal.fire({
        icon: 'warning',
        title: 'Selection Required',
        text: 'Please select at least one test or package',
        confirmButtonColor: '#2563eb'
      })
      return
    }

    if (!selectedDate || !selectedTime) {
      Swal.fire({
        icon: 'warning',
        title: 'Schedule Required',
        text: 'Please select date and time for your appointment',
        confirmButtonColor: '#2563eb'
      })
      return
    }

    if (!paymentMethod) {
      Swal.fire({
        icon: 'warning',
        title: 'Payment Method Required',
        text: 'Please select a payment method',
        confirmButtonColor: '#2563eb'
      })
      return
    }

    try {
      setLoading(true)
      
      // Prepare test and package data for API
      const selectedTestsData = selectedLab.availableTestsDetails
        ?.filter(test => selectedTests.includes(test._id))
        .map(test => ({
          testId: test._id,
          testName: test.name,
          price: test.price
        })) || []

      const selectedPackagesData = selectedLab.availablePackagesDetails
        ?.filter(packageItem => selectedPackages.includes(packageItem._id))
        .map(packageItem => ({
          packageId: packageItem._id,
          packageName: packageItem.name,
          price: packageItem.price
        })) || []
      
      // Create booking data
      const bookingData = {
        labId: selectedLab._id,
        selectedTests: selectedTestsData,
        selectedPackages: selectedPackagesData,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        paymentMethod,
        notes: notes.trim(),
        userLocation: userLocation
      }

      // Create booking
      const response = await bookingAPI.createBooking(bookingData)
      
      if (paymentMethod === 'pay_now') {
        // Handle Razorpay payment
        await handleRazorpayPayment(response.data)
      } else {
        // Pay later - booking confirmed
      await Swal.fire({
        icon: 'success',
        title: 'Booking Confirmed!',
          text: `Your appointment at ${selectedLab.name} has been scheduled for ${selectedDate} at ${selectedTime}. Payment due at the lab.`,
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'OK'
      })

      // Reset form
        resetBookingForm()
      }
      
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: err.message || 'Failed to create booking',
        confirmButtonColor: '#dc2626'
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle Razorpay payment
  const handleRazorpayPayment = async (booking) => {
    try {
      // Load Razorpay script dynamically
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        const options = {
          key: 'rzp_test_YOUR_RAZORPAY_KEY', // Replace with your Razorpay key
          amount: booking.totalAmount * 100, // Amount in paise
          currency: 'INR',
          name: 'LabMate360',
          description: `Booking for ${selectedLab.name}`,
          order_id: booking.razorpayOrderId || null, // You'll need to create an order first
          handler: async function (response) {
            try {
              // Process payment
              await bookingAPI.processPayment(booking._id, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })

              await Swal.fire({
                icon: 'success',
                title: 'Payment Successful!',
                text: `Your appointment at ${selectedLab.name} has been confirmed for ${selectedDate} at ${selectedTime}`,
                confirmButtonColor: '#2563eb',
                confirmButtonText: 'OK'
              })
              
              resetBookingForm()
            } catch (err) {
              Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: err.message || 'Payment processing failed',
                confirmButtonColor: '#dc2626'
              })
            }
          },
          prefill: {
            name: 'User Name', // You can get this from user profile
            email: 'user@example.com', // You can get this from user profile
            contact: '9999999999' // You can get this from user profile
          },
          theme: {
            color: '#2563eb'
          }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      }
      document.body.appendChild(script)
    } catch (err) {
      console.error('Razorpay error:', err)
      throw err
    }
  }

  // Reset booking form
  const resetBookingForm = () => {
    setSelectedLab(null)
    setSelectedTests([])
    setSelectedPackages([])
    setSelectedDate('')
    setSelectedTime('')
    setPaymentMethod('')
    setNotes('')
    setBookingStep(1)
  }

  // Filter labs based on search term
  const filteredLabs = (showAllLabs ? labs : nearbyLabs).filter(lab => {
    const searchLower = searchTerm.toLowerCase()
    const name = lab.name.toLowerCase()
    const address = typeof lab.address === 'string' 
      ? lab.address.toLowerCase()
      : `${lab.address.street || ''} ${lab.address.city || ''}`.toLowerCase()
    
    return name.includes(searchLower) || address.includes(searchLower)
  })

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Render lab card
  const renderLabCard = (lab) => {
    const address = typeof lab.address === 'string' 
      ? (() => {
          try {
            const addr = JSON.parse(lab.address)
            return `${addr.street}, ${addr.city}, ${addr.state} - ${addr.zipCode}`
          } catch (e) {
            return lab.address
          }
        })()
      : `${lab.address.street}, ${lab.address.city}, ${lab.address.state} - ${lab.address.zipCode}`

    const contact = typeof lab.contact === 'string'
      ? (() => {
          try {
            const contactData = JSON.parse(lab.contact)
            return { phone: contactData.phone, email: contactData.email }
          } catch (e) {
            return { phone: lab.contact, email: '' }
          }
        })()
      : { phone: lab.contact.phone, email: lab.contact.email }

    const operatingHours = typeof lab.operatingHours === 'string'
      ? (() => {
          try {
            const hours = JSON.parse(lab.operatingHours)
            return `${hours.monday?.open || '09:00'} - ${hours.monday?.close || '18:00'}`
          } catch (e) {
            return lab.operatingHours
          }
        })()
      : `${lab.operatingHours.monday?.open || '09:00'} - ${lab.operatingHours.monday?.close || '18:00'}`

    return (
      <div key={lab._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{lab.name}</h3>
              {lab.distance && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Navigation className="h-4 w-4 mr-1" />
                  {lab.distance} km away
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => handleLabSelection(lab)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Select Lab
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{address}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            <span>{contact.phone}</span>
          </div>
          {contact.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              <span>{contact.email}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{operatingHours}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tests: {lab.availableTests?.length || 0}</span>
            <span className="text-gray-500">Packages: {lab.availablePackages?.length || 0}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Laboratory Tests</h1>
        <p className="text-gray-600">Find nearby labs and schedule your tests</p>
        
        {/* Step Indicator */}
        <div className="mt-6">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center space-x-2 ${bookingStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                bookingStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Select Lab</span>
            </div>
            
            <div className={`w-8 h-0.5 ${bookingStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center space-x-2 ${bookingStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                bookingStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Select Tests</span>
            </div>
            
            <div className={`w-8 h-0.5 ${bookingStep >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center space-x-2 ${bookingStep >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                bookingStep >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Schedule</span>
            </div>
            
            <div className={`w-8 h-0.5 ${bookingStep >= 4 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center space-x-2 ${bookingStep >= 4 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                bookingStep >= 4 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                4
          </div>
              <span className="text-sm font-medium">Payment</span>
            </div>
            
            <div className={`w-8 h-0.5 ${bookingStep >= 5 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center space-x-2 ${bookingStep >= 5 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                bookingStep >= 5 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                5
              </div>
              <span className="text-sm font-medium">Confirm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Status */}
      {locationError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {locationError}
          <button
            onClick={getCurrentLocation}
            className="ml-auto text-yellow-800 hover:text-yellow-900 underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Step 1: Lab Selection */}
      {bookingStep === 1 && (
        <div>
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search labs by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                />
              </div>
              <button
                onClick={() => setShowAllLabs(!showAllLabs)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showAllLabs ? 'Show Nearby' : 'Show All Labs'}
              </button>
            </div>
          </div>

          {/* Labs Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {showAllLabs ? 'All Available Labs' : 'Labs Near You'}
              </h2>
              {userLocation && !showAllLabs && (
                <span className="text-sm text-gray-500">
                  Showing top {nearbyLabs.length} closest labs
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin mr-3" />
                Loading labs...
              </div>
            ) : filteredLabs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No labs found matching your search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLabs.map(renderLabCard)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Test Selection */}
      {bookingStep === 2 && selectedLab && (
        <div>
          {/* Selected Lab Info */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-900">{selectedLab.name}</h3>
                <p className="text-primary-700">
                  {typeof selectedLab.address === 'string' 
                    ? (() => {
                        try {
                          const addr = JSON.parse(selectedLab.address)
                          return `${addr.street}, ${addr.city}`
                        } catch (e) {
                          return selectedLab.address
                        }
                      })()
                    : `${selectedLab.address.street}, ${selectedLab.address.city}`
                  }
                </p>
              </div>
              <button
                onClick={() => {
                  setBookingStep(1)
                  setSelectedLab(null)
                }}
                className="text-primary-600 hover:text-primary-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && !selectedLab.availableTestsDetails && (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin mr-3" />
              Loading lab details...
            </div>
          )}

          {/* Available Tests */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FlaskConical className="h-5 w-5 mr-2 text-primary-600" />
              Available Tests
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin mr-2" />
                Loading tests...
              </div>
            ) : selectedLab.availableTestsDetails?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedLab.availableTestsDetails.map((test) => (
                  <div key={test._id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTests.includes(test._id)}
                        onChange={() => toggleTestSelection(test._id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{test.name}</div>
                        <div className="text-sm text-gray-500">₹{test.price} • {test.category}</div>
                        {test.description && (
                          <div className="text-xs text-gray-400 mt-1">{test.description}</div>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No tests available at this lab</p>
              </div>
            )}
          </div>

          {/* Available Packages */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-primary-600" />
              Available Packages
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin mr-2" />
                Loading packages...
              </div>
            ) : selectedLab.availablePackagesDetails?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedLab.availablePackagesDetails.map((packageItem) => (
                  <div key={packageItem._id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPackages.includes(packageItem._id)}
                        onChange={() => togglePackageSelection(packageItem._id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{packageItem.name}</div>
                        <div className="text-sm text-gray-500">
                          ₹{packageItem.price} • {packageItem.selectedTests?.length || 0} tests included
                        </div>
                        {packageItem.description && (
                          <div className="text-xs text-gray-400 mt-1">{packageItem.description}</div>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No packages available at this lab</p>
              </div>
            )}
          </div>

          {/* Continue Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setBookingStep(3)}
              disabled={!selectedTests.length && !selectedPackages.length}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Continue to Schedule
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Schedule Appointment */}
      {bookingStep === 3 && selectedLab && (
        <div>
          {/* Selected Lab Info */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-900">{selectedLab.name}</h3>
                <p className="text-primary-700">
                  {typeof selectedLab.address === 'string' 
                    ? (() => {
                        try {
                          const addr = JSON.parse(selectedLab.address)
                          return `${addr.street}, ${addr.city}`
                        } catch (e) {
                          return selectedLab.address
                        }
                      })()
                    : `${selectedLab.address.street}, ${selectedLab.address.city}`
                  }
                </p>
              </div>
              <button
                onClick={() => {
                  setBookingStep(2)
                }}
                className="text-primary-600 hover:text-primary-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
            
            <div className="space-y-4">
              {selectedTests.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900">Selected Tests ({selectedTests.length})</h4>
                  <div className="mt-2 space-y-1">
                    {selectedLab.availableTestsDetails
                      ?.filter(test => selectedTests.includes(test._id))
                      .map(test => (
                        <div key={test._id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{test.name}</span>
                          <span className="text-gray-900">₹{test.price}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              
              {selectedPackages.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900">Selected Packages ({selectedPackages.length})</h4>
                  <div className="mt-2 space-y-1">
                    {selectedLab.availablePackagesDetails
                      ?.filter(packageItem => selectedPackages.includes(packageItem._id))
                      .map(packageItem => (
                        <div key={packageItem._id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{packageItem.name}</span>
                          <span className="text-gray-900">₹{packageItem.price}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Total Calculation */}
              {(selectedTests.length > 0 || selectedPackages.length > 0) && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-primary-600">
                      ₹{
                        (selectedLab.availableTestsDetails
                          ?.filter(test => selectedTests.includes(test._id))
                          .reduce((sum, test) => sum + test.price, 0) || 0) +
                        (selectedLab.availablePackagesDetails
                          ?.filter(packageItem => selectedPackages.includes(packageItem._id))
                          .reduce((sum, packageItem) => sum + packageItem.price, 0) || 0)
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Appointment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Choose time slot</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setBookingStep(4)}
              disabled={!selectedDate || !selectedTime}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Continue to Payment
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Payment Method Selection */}
      {bookingStep === 4 && selectedLab && (
        <div>
          {/* Selected Lab Info */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-900">{selectedLab.name}</h3>
                <p className="text-primary-700">
                  {typeof selectedLab.address === 'string' 
                    ? (() => {
                        try {
                          const addr = JSON.parse(selectedLab.address)
                          return `${addr.street}, ${addr.city}`
                        } catch (e) {
                          return selectedLab.address
                        }
                      })()
                    : `${selectedLab.address.street}, ${selectedLab.address.city}`
                  }
                </p>
              </div>
              <button
                onClick={() => {
                  setBookingStep(3)
                }}
                className="text-primary-600 hover:text-primary-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Date</div>
                  <div className="font-medium">{formatDate(selectedDate)}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Time</div>
                  <div className="font-medium">{selectedTime}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
            
            <div className="space-y-4">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="pay_now"
                  checked={paymentMethod === 'pay_now'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Pay Now</div>
                  <div className="text-sm text-gray-500">Pay securely online with Razorpay</div>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="pay_later"
                  checked={paymentMethod === 'pay_later'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Pay at Lab</div>
                  <div className="text-sm text-gray-500">Pay when you visit the lab</div>
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes (Optional)</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any special instructions or notes for the lab..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Continue Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setBookingStep(5)}
              disabled={!paymentMethod}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Continue to Confirm
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Booking Confirmation */}
      {bookingStep === 5 && selectedLab && (
        <div>
          {/* Booking Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Selected Lab</h4>
                <p className="text-gray-600">{selectedLab.name}</p>
              </div>
              
              {selectedTests.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900">Selected Tests ({selectedTests.length})</h4>
                  <div className="mt-2 space-y-1">
                    {selectedLab.availableTestsDetails
                      ?.filter(test => selectedTests.includes(test._id))
                      .map(test => (
                        <div key={test._id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{test.name}</span>
                          <span className="text-gray-900">₹{test.price}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              
              {selectedPackages.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900">Selected Packages ({selectedPackages.length})</h4>
                  <div className="mt-2 space-y-1">
                    {selectedLab.availablePackagesDetails
                      ?.filter(packageItem => selectedPackages.includes(packageItem._id))
                      .map(packageItem => (
                        <div key={packageItem._id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{packageItem.name}</span>
                          <span className="text-gray-900">₹{packageItem.price}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Total Calculation */}
              {(selectedTests.length > 0 || selectedPackages.length > 0) && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-primary-600">
                      ₹{
                        (selectedLab.availableTestsDetails
                          ?.filter(test => selectedTests.includes(test._id))
                          .reduce((sum, test) => sum + test.price, 0) || 0) +
                        (selectedLab.availablePackagesDetails
                          ?.filter(packageItem => selectedPackages.includes(packageItem._id))
                          .reduce((sum, packageItem) => sum + packageItem.price, 0) || 0)
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Appointment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Choose time slot</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Booking Actions */}
          <div className="flex justify-between">
            <button
              onClick={() => setBookingStep(4)}
              className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payment
            </button>
            
            <button
              onClick={handleBooking}
              disabled={loading || !selectedDate || !selectedTime}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookTests
